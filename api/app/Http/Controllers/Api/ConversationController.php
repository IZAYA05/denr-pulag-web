<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlockedDate;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\OrganizerApplication;
use App\Models\PackageBooking;
use App\Models\Reservation;
use App\Models\Trail;
use App\Models\User;
use App\Notifications\SystemNotification;
use App\Services\ActivityLogger;
use App\Services\BookingCapacityService;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConversationController extends Controller
{
    private const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Conversation::query()
            ->with([
                'user:id,first_name,last_name,email,phone,role',
                'organizer:id,first_name,last_name,email,role',
                'packageBooking',
                'recipient:id,first_name,last_name,email,role',
                'requestedTrail:id,name',
                'createdReservation:id,reservation_number,hiking_date,status',
                'organizerApplication:id,conversation_id,status,dot_accreditation_number,business_permit_number,review_notes',
                'latestMessage.sender:id,first_name,last_name,role',
                'latestMessage.attachments:id,message_id,document_type,original_name,mime_type,file_size',
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at');

        $role = strtoupper((string) $user->role);
        $isStaff = in_array($role, ['ADMIN', 'EMPLOYEE'], true);

        if ($isStaff) {
            // Private USER <-> ORGANIZER conversations are never visible in staff Chatbox.
            $query->whereRaw('UPPER(type) <> ?', ['DIRECT_MESSAGE']);
        } else {
            $query->where(function ($participantQuery) use ($user) {
                $participantQuery->where('user_id', $user->id)
                    ->orWhere('organizer_id', $user->id)
                    ->orWhere('recipient_id', $user->id);
            });
        }

        if ($request->filled('type')) {
            $query->where('type', strtoupper((string) $request->query('type')));
        }

        if ($request->filled('status')) {
            $query->where('status', strtoupper((string) $request->query('status')));
        }

        return response()->json([
            'conversations' => $query->limit(100)->get(),
        ]);
    }

    /** Return only opposite-role contacts for unrestricted USER <-> ORGANIZER messaging. */
    public function contacts(Request $request): JsonResponse
    {
        $role = strtoupper((string) $request->user()->role);

        if (!in_array($role, ['USER', 'ORGANIZER'], true)) {
            return response()->json(['contacts' => []]);
        }

        $targetRole = $role === 'USER' ? 'ORGANIZER' : 'USER';

        $contacts = User::query()
            ->where('role', $targetRole)
            ->where('status', 'ACTIVE')
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'email', 'role']);

        return response()->json(['contacts' => $contacts]);
    }

    /** Start a direct USER <-> ORGANIZER conversation. No booking is required. */
    public function startDirect(Request $request): JsonResponse
    {
        $sender = $request->user();
        $role = strtoupper((string) $sender->role);

        if (!in_array($role, ['USER', 'ORGANIZER'], true)) {
            return response()->json([
                'message' => 'Only Tourist and Organizer accounts can start direct chats.',
            ], 403);
        }

        $validated = $request->validate([
            'recipient_id' => ['required', 'integer', 'exists:users,id'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $targetRole = $role === 'USER' ? 'ORGANIZER' : 'USER';

        $recipient = User::query()
            ->whereKey($validated['recipient_id'])
            ->where('role', $targetRole)
            ->where('status', 'ACTIVE')
            ->first();

        if (!$recipient) {
            return response()->json([
                'message' => 'You can only message an active account of the opposite role.',
            ], 422);
        }

        $conversation = DB::transaction(function () use ($sender, $recipient, $validated) {
            $conversation = Conversation::query()
                ->where('type', 'DIRECT_MESSAGE')
                ->where(function ($q) use ($sender, $recipient) {
                    $q->where(function ($pair) use ($sender, $recipient) {
                        $pair->where('user_id', $sender->id)
                            ->where('recipient_id', $recipient->id);
                    })->orWhere(function ($pair) use ($sender, $recipient) {
                        $pair->where('user_id', $recipient->id)
                            ->where('recipient_id', $sender->id);
                    });
                })
                ->lockForUpdate()
                ->first();

            if (!$conversation) {
                $conversation = Conversation::create([
                    'user_id' => $sender->id,
                    'recipient_id' => $recipient->id,
                    'type' => 'DIRECT_MESSAGE',
                    'subject' => 'Direct message',
                    'status' => 'OPEN',
                    'last_message_at' => now('Asia/Manila'),
                ]);
            }

            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $sender->id,
                'body' => trim($validated['body']),
            ]);

            $conversation->update([
                'last_message_at' => now('Asia/Manila'),
                'status' => 'OPEN',
            ]);

            return $conversation;
        });

        $recipient->notify(new SystemNotification(
            'New Chatbox Message',
            "{$sender->first_name} {$sender->last_name} sent you a message.",
            'conversation',
            null,
            ['conversation_id' => $conversation->id]
        ));

        return response()->json([
            'message' => 'Conversation started.',
            'conversation' => $conversation->fresh([
                'user:id,first_name,last_name,email,role',
                'recipient:id,first_name,last_name,email,role',
            ]),
        ], 201);
    }

    /**
     * USER accounts can start reservation coordination or organizer applications.
     * ORGANIZER accounts can start package-booking conversations or DENR support.
     */
    public function store(Request $request): JsonResponse
    {
        $sender = $request->user();
        $role = strtoupper((string) $sender->role);
        $type = strtoupper((string) $request->input('type'));

        if ($type === 'PACKAGE_BOOKING') {
            if ($role !== 'ORGANIZER') {
                return response()->json([
                    'message' => 'Only organizer accounts can start package-booking conversations.',
                ], 403);
            }

            return $this->createPackageBookingConversation($request);
        }

        if ($type === 'ORGANIZER_SUPPORT') {
            if ($role !== 'ORGANIZER') {
                return response()->json([
                    'message' => 'Only organizer accounts can start DENR support conversations.',
                ], 403);
            }

            return $this->createOrganizerSupportConversation($request);
        }

        if ($role !== 'USER') {
            return response()->json([
                'message' => 'Only visitor accounts can start these requests.',
            ], 403);
        }

        if ($type === 'ORGANIZER_APPLICATION') {
            return $this->createOrganizerApplication($request);
        }

        if ($type === 'RESERVATION_REQUEST') {
            return $this->createReservationConversation($request);
        }

        throw ValidationException::withMessages([
            'type' => ['Select a valid request type.'],
        ]);
    }

    /**
     * Create or continue a conversation between the package organizer and customer.
     * An organizer may only access bookings belonging to their own package.
     */
    private function createPackageBookingConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_booking_id' => [
                'required',
                'integer',
                'exists:package_bookings,id',
            ],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $organizer = $request->user();

        $result = DB::transaction(function () use ($organizer, $validated) {
            $booking = PackageBooking::query()
                ->whereKey($validated['package_booking_id'])
                ->lockForUpdate()
                ->first();

            if (!$booking) {
                abort(404, 'Package booking not found.');
            }

            $booking->load(['package', 'customer']);

            $package = $booking->package;

            if (!$package || (int) $package->organizer_id !== (int) $organizer->id) {
                abort(404, 'Package booking not found.');
            }

            $customer = $booking->customer;

            if (!$customer) {
                abort(404, 'Package booking customer not found.');
            }

            $conversation = Conversation::query()
                ->where('package_booking_id', $booking->id)
                ->lockForUpdate()
                ->first();

            $created = false;

            if (!$conversation) {
                $bookingReference = $booking->booking_number
                    ? " {$booking->booking_number}"
                    : " #{$booking->id}";

                $conversation = Conversation::create([
                    'user_id' => $customer->id,
                    'organizer_id' => $organizer->id,
                    'package_booking_id' => $booking->id,
                    'type' => 'PACKAGE_BOOKING',
                    'subject' => 'Package Booking' . $bookingReference,
                    'status' => 'OPEN',
                    'last_message_at' => now('Asia/Manila'),
                ]);

                $created = true;
            } elseif (
                (int) $conversation->organizer_id !== (int) $organizer->id
                || (int) $conversation->user_id !== (int) $customer->id
            ) {
                abort(404, 'Package booking conversation not found.');
            }

            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $organizer->id,
                'body' => trim($validated['body']),
            ]);

            $conversation->update([
                'last_message_at' => now('Asia/Manila'),
                'status' => 'OPEN',
            ]);

            return [
                'conversation' => $conversation,
                'customer' => $customer,
                'created' => $created,
            ];
        });

        $conversation = $result['conversation'];
        $customer = $result['customer'];

        $customer->notify(new SystemNotification(
            'New Package Booking Message',
            "{$organizer->first_name} {$organizer->last_name} sent you a message about your package booking.",
            'conversation',
            null,
            ['conversation_id' => $conversation->id]
        ));

        return response()->json([
            'message' => $result['created']
                ? 'Package booking conversation started.'
                : 'Message sent successfully.',
            'conversation' => $conversation->fresh([
                'user:id,first_name,last_name,email,phone,role',
                'organizer:id,first_name,last_name,email,role',
                'packageBooking',
                'messages.sender:id,first_name,last_name,role',
            ]),
        ], $result['created'] ? 201 : 200);
    }

    /**
     * Create a separate support conversation between an organizer and DENR staff.
     */
    private function createOrganizerSupportConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $organizer = $request->user();

        $conversation = DB::transaction(function () use ($organizer, $validated) {
            $conversation = Conversation::create([
                'user_id' => $organizer->id,
                'type' => 'ORGANIZER_SUPPORT',
                'subject' => trim($validated['subject'] ?? '') ?: 'DENR Support',
                'status' => 'OPEN',
                'last_message_at' => now('Asia/Manila'),
            ]);

            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $organizer->id,
                'body' => trim($validated['body']),
            ]);

            return $conversation;
        });

        $this->notifyActiveStaff(
            'New Organizer Support Request',
            "{$organizer->first_name} {$organizer->last_name} sent a new DENR support message.",
            ['conversation_id' => $conversation->id]
        );

        return response()->json([
            'message' => 'DENR support conversation started.',
            'conversation' => $conversation->fresh([
                'user:id,first_name,last_name,email,role',
                'messages.sender:id,first_name,last_name,role',
            ]),
        ], 201);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        if (!$this->canAccess($request, $conversation)) {
            return response()->json([
                'message' => 'Conversation not found.',
            ], 404);
        }

        $conversation->load([
            'user:id,first_name,last_name,email,phone,role',
            'organizer:id,first_name,last_name,email,role',
            'packageBooking',
            'recipient:id,first_name,last_name,email,role',
            'requestedTrail:id,name',
            'createdReservation:id,reservation_number,hiking_date,status',
            'organizerApplication.reviewer:id,first_name,last_name',
            'messages.sender:id,first_name,last_name,role',
            'messages.attachments:id,message_id,document_type,original_name,mime_type,file_size',
        ]);

        return response()->json([
            'conversation' => $conversation,
        ]);
    }

    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        if (!$this->canAccess($request, $conversation)) {
            return response()->json([
                'message' => 'Conversation not found.',
            ], 404);
        }

        if ($conversation->status === 'CLOSED') {
            return response()->json([
                'message' => 'This conversation is closed and no longer accepts replies.',
            ], 422);
        }

        $validated = $request->validate([
            'body' => [
                'nullable',
                'string',
                'max:5000',
                'required_without_all:dot_certificate,business_permit',
            ],
            'dot_certificate' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:3072',
            ],
            'business_permit' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:3072',
            ],
        ]);

        if ($conversation->type !== 'ORGANIZER_APPLICATION' && (
            $request->hasFile('dot_certificate')
            || $request->hasFile('business_permit')
        )) {
            return response()->json([
                'message' => 'Document attachments are only accepted for organizer applications.',
            ], 422);
        }

        $message = DB::transaction(function () use ($request, $conversation, $validated) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $request->user()->id,
                'body' => isset($validated['body'])
                    ? trim($validated['body'])
                    : null,
            ]);

            $this->storeApplicationAttachments($message, $request);

            $conversation->update([
                'last_message_at' => now('Asia/Manila'),
                'status' => 'OPEN',
            ]);

            return $message;
        });

        $this->notifyConversationParticipants(
            $conversation->fresh(['user', 'organizer', 'recipient']),
            $request->user()
        );

        return response()->json([
            'message' => 'Message sent successfully.',
            'message_record' => $message->load([
                'sender:id,first_name,last_name,role',
                'attachments:id,message_id,document_type,original_name,mime_type,file_size',
            ]),
        ], 201);
    }

    public function resubmitOrganizerApplication(Request $request, Conversation $conversation): JsonResponse
    {
        if (
            !$this->canAccess($request, $conversation)
            || (int) $conversation->user_id !== (int) $request->user()->id
        ) {
            return response()->json([
                'message' => 'Conversation not found.',
            ], 404);
        }

        if ($conversation->type !== 'ORGANIZER_APPLICATION') {
            return response()->json([
                'message' => 'This is not an organizer application.',
            ], 422);
        }

        $application = $conversation->organizerApplication;

        if (!$application || $application->status !== 'NEEDS_REVISION') {
            return response()->json([
                'message' => 'This application is not awaiting revised documents.',
            ], 422);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'dot_accreditation_number' => ['required', 'string', 'max:120'],
            'business_permit_number' => ['required', 'string', 'max:120'],
            'dot_certificate' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'business_permit' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
        ]);

        DB::transaction(function () use ($request, $conversation, $application, $validated) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $request->user()->id,
                'body' => trim($validated['body']),
            ]);

            $this->storeApplicationAttachments($message, $request);

            $application->update([
                'dot_accreditation_number' => trim($validated['dot_accreditation_number']),
                'business_permit_number' => trim($validated['business_permit_number']),
                'status' => 'PENDING',
                'review_notes' => null,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ]);

            $conversation->update([
                'last_message_at' => now('Asia/Manila'),
                'status' => 'OPEN',
            ]);
        });

        $this->notifyActiveStaff(
            'Organizer Application Resubmitted',
            "{$request->user()->first_name} {$request->user()->last_name} submitted revised organizer documents.",
            [
                'conversation_id' => $conversation->id,
                'application_status' => 'PENDING',
            ]
        );

        return response()->json([
            'message' => 'Revised documents submitted successfully. Your application is pending DENR review.',
            'conversation' => $conversation->fresh(['organizerApplication']),
        ], 201);
    }

    /** Only ADMIN can grant the ORGANIZER role. */
    public function reviewOrganizerApplication(
        Request $request,
        Conversation $conversation,
        ActivityLogger $logger
    ): JsonResponse {
        if ($conversation->type !== 'ORGANIZER_APPLICATION') {
            return response()->json([
                'message' => 'This is not an organizer application.',
            ], 422);
        }

        $validated = $request->validate([
            'decision' => ['required', 'string', 'in:APPROVED,REJECTED,NEEDS_REVISION'],
            'review_notes' => [
                'nullable',
                'string',
                'max:2000',
                'required_if:decision,REJECTED,NEEDS_REVISION',
            ],
        ]);

        $application = $conversation->organizerApplication;

        if (!$application || $application->status !== 'PENDING') {
            return response()->json([
                'message' => 'Only pending organizer applications can be reviewed.',
            ], 422);
        }

        $decision = $validated['decision'];
        $admin = $request->user();

        DB::transaction(function () use ($application, $conversation, $decision, $validated, $admin) {
            $lockedApplication = OrganizerApplication::query()
                ->whereKey($application->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedApplication->status !== 'PENDING') {
                abort(409, 'This application has already been reviewed. Refresh the conversation.');
            }

            $lockedApplication->update([
                'status' => $decision,
                'review_notes' => $validated['review_notes'] ?? null,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now('Asia/Manila'),
            ]);

            if ($decision === 'APPROVED') {
                User::query()
                    ->whereKey($lockedApplication->user_id)
                    ->update([
                        'role' => 'ORGANIZER',
                    ]);

                $conversation->update(['status' => 'CLOSED']);
            } elseif ($decision === 'REJECTED') {
                // Rejected applicants remain USER accounts and may start a new application later.
                $conversation->update(['status' => 'CLOSED']);
            } else {
                $conversation->update(['status' => 'OPEN']);
            }
        });

        $application->loadMissing('user');
        $applicant = $application->user;

        $title = match ($decision) {
            'APPROVED' => 'Organizer Application Approved',
            'REJECTED' => 'Organizer Application Rejected',
            default => 'Organizer Application Needs Revision',
        };

        $messageText = match ($decision) {
            'APPROVED' => 'Your organizer application has been approved. Sign out and sign in again to access the Organizer Portal.',
            'REJECTED' => 'Your organizer application was not approved. You remain a USER account. Review the DENR feedback for details.',
            default => 'DENR needs revised information or clearer documents before your application can be processed.',
        };

        if ($applicant) {
            $applicant->notify(new SystemNotification(
                $title,
                $messageText,
                'organizer_application',
                null,
                [
                    'conversation_id' => $conversation->id,
                    'application_status' => $decision,
                    'review_notes' => $validated['review_notes'] ?? null,
                ]
            ));
        }

        $logger->log(
            $admin,
            'REVIEW_ORGANIZER_APPLICATION',
            'ORGANIZER_APPLICATION',
            "Organizer application #{$application->id} was marked {$decision}.",
            $request
        );

        return response()->json([
            'message' => $title . '.',
            'conversation' => $conversation->fresh([
                'user:id,first_name,last_name,email,phone,role',
                'organizerApplication.reviewer:id,first_name,last_name',
            ]),
        ]);
    }

    /**
     * Staff-only final step for reservation coordination.
     * The conversation itself never creates a reservation.
     */
    public function createOfficialReservation(
        Request $request,
        Conversation $conversation,
        BookingCapacityService $capacityService,
        ActivityLogger $logger
    ): JsonResponse {
        if ($conversation->type !== 'RESERVATION_REQUEST') {
            return response()->json([
                'message' => 'This conversation is not a reservation coordination request.',
            ], 422);
        }

        if ($conversation->created_reservation_id) {
            return response()->json([
                'message' => 'An official reservation has already been created for this conversation.',
                'reservation_id' => $conversation->created_reservation_id,
            ], 409);
        }

        if ($conversation->status === 'CLOSED') {
            return response()->json([
                'message' => 'This conversation is closed.',
            ], 422);
        }

        $validated = $request->validate([
            'group_leader_name' => ['required', 'string', 'max:255'],
            'group_leader_phone' => ['required', 'string', 'max:50'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'participants' => ['required', 'array', 'min:1', 'max:12'],
            'participants.*.full_name' => ['required', 'string', 'max:255'],
            'participants.*.age' => ['required', 'integer', 'min:1', 'max:120'],
            'participants.*.gender' => ['required', 'in:MALE,FEMALE'],
            'participants.*.nationality' => ['required', 'string', 'max:100'],
            'participants.*.contact_number' => ['nullable', 'string', 'max:50'],
            'participants.*.address' => ['nullable', 'string'],
            'participants.*.emergency_contact' => ['required', 'string', 'max:255'],
            'participants.*.emergency_number' => ['required', 'string', 'max:50'],
        ]);

        $customer = $conversation->user;

        if (!$customer || strtoupper((string) $customer->status) !== 'ACTIVE') {
            return response()->json([
                'message' => 'The visitor account is not active.',
            ], 422);
        }

        $trail = Trail::query()
            ->whereKey($conversation->requested_trail_id)
            ->where('is_active', true)
            ->first();

        if (!$trail) {
            return response()->json([
                'message' => 'The requested trail is no longer available.',
            ], 422);
        }

        $hikingDate = Carbon::parse(
            $conversation->requested_hiking_date,
            'Asia/Manila'
        )->startOfDay();

        $minimumDate = Carbon::today('Asia/Manila')->addDays(30);

        if ($hikingDate->lt($minimumDate)) {
            return response()->json([
                'message' => 'The requested hiking date must be at least 30 days from today.',
                'minimum_hiking_date' => $minimumDate->toDateString(),
            ], 422);
        }

        $blockedDate = BlockedDate::query()
            ->whereDate('date', $hikingDate->toDateString())
            ->first();

        if ($blockedDate) {
            return response()->json([
                'message' => 'The requested hiking date is unavailable.',
                'reason' => $blockedDate->reason,
            ], 422);
        }

        $participantCount = count($validated['participants']);

        if ($participantCount !== (int) $conversation->requested_visitors) {
            return response()->json([
                'message' => 'The participant list must match the group size recorded in the coordination request.',
                'requested_visitors' => (int) $conversation->requested_visitors,
                'submitted_participants' => $participantCount,
            ], 422);
        }

        $result = DB::transaction(function () use (
            $conversation,
            $validated,
            $participantCount,
            $trail,
            $customer,
            $hikingDate,
            $capacityService,
            $request
        ) {
            $lockedConversation = Conversation::query()
                ->whereKey($conversation->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedConversation->created_reservation_id) {
                return ['conflict' => true];
            }

            $capacityService->lockForCapacityCheck();
            $summary = $capacityService->getSummary($hikingDate->toDateString());

            if (
                $summary['is_blocked']
                || $summary['current_capacity'] + $participantCount > BookingCapacityService::MAXIMUM_CAPACITY
            ) {
                return [
                    'capacity_error' => true,
                    'summary' => $summary,
                ];
            }

            $reservationNumber = 'EP-' . strtoupper(Str::random(8));

            while (Reservation::query()->where('reservation_number', $reservationNumber)->exists()) {
                $reservationNumber = 'EP-' . strtoupper(Str::random(8));
            }

            $reservation = Reservation::create([
                'reservation_number' => $reservationNumber,
                'group_leader_name' => trim($validated['group_leader_name']),
                'group_leader_phone' => trim($validated['group_leader_phone']),
                'hiking_date' => $hikingDate->toDateString(),
                'total_participants' => $participantCount,
                // Staff explicitly creates this record after confirming the slot.
                'status' => 'APPROVED',
                'remarks' => $validated['remarks']
                    ?? 'Recorded by DENR staff after reservation coordination.',
                'user_id' => $customer->id,
                'trail_id' => $trail->id,
            ]);

            $reservation->participants()->createMany($validated['participants']);

            $lockedConversation->update([
                'created_reservation_id' => $reservation->id,
                'reservation_created_at' => now('Asia/Manila'),
                'status' => 'CLOSED',
                'last_message_at' => now('Asia/Manila'),
            ]);

            Message::create([
                'conversation_id' => $lockedConversation->id,
                'sender_id' => $request->user()->id,
                'body' => "DENR recorded and approved your reservation {$reservation->reservation_number} for {$hikingDate->toDateString()}. This is now part of the official booking records.",
            ]);

            return ['reservation' => $reservation];
        });

        if (!empty($result['conflict'])) {
            return response()->json([
                'message' => 'An official reservation has already been created for this conversation.',
            ], 409);
        }

        if (!empty($result['capacity_error'])) {
            $summary = $result['summary'];

            return response()->json([
                'message' => $summary['is_blocked']
                    ? 'The requested hiking date is unavailable.'
                    : 'There is not enough remaining visitor capacity for this group.',
                'date' => $summary['date'],
                'current_capacity' => $summary['current_capacity'],
                'maximum_capacity' => $summary['maximum_capacity'],
                'remaining_capacity' => $summary['remaining_capacity'],
                'requested_visitors' => $participantCount,
                'blocked_reason' => $summary['blocked_reason'],
            ], 422);
        }

        $reservation = $result['reservation']->load([
            'trail',
            'participants',
            'user',
        ]);

        $customer->notify(new SystemNotification(
            'Reservation Recorded by DENR',
            "Your reservation {$reservation->reservation_number} has been recorded and approved by DENR staff.",
            'reservation',
            null,
            [
                'reservation_id' => $reservation->id,
                'reservation_number' => $reservation->reservation_number,
                'hiking_date' => $reservation->hiking_date,
                'trail_name' => $trail->name,
                'status' => 'APPROVED',
            ]
        ));

        $logger->log(
            $request->user(),
            'CREATE_COORDINATED_RESERVATION',
            'RESERVATION',
            "Created approved reservation {$reservation->reservation_number} from conversation #{$conversation->id}.",
            $request
        );

        return response()->json([
            'message' => 'Official reservation created and approved successfully.',
            'reservation' => $reservation,
            'conversation' => $conversation->fresh(['createdReservation']),
        ], 201);
    }

    private function createOrganizerApplication(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dot_accreditation_number' => ['required', 'string', 'max:120'],
            'business_permit_number' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string', 'max:5000'],
            'dot_certificate' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'business_permit' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
        ]);

        $existing = OrganizerApplication::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('status', ['PENDING', 'NEEDS_REVISION'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You already have an organizer application awaiting review or revision.',
                'conversation_id' => $existing->conversation_id,
            ], 409);
        }

        $conversation = DB::transaction(function () use ($request, $validated) {
            $conversation = Conversation::create([
                'user_id' => $request->user()->id,
                'type' => 'ORGANIZER_APPLICATION',
                'subject' => 'Organizer Role Application',
                'status' => 'OPEN',
                'last_message_at' => now('Asia/Manila'),
            ]);

            OrganizerApplication::create([
                'conversation_id' => $conversation->id,
                'user_id' => $request->user()->id,
                'dot_accreditation_number' => trim($validated['dot_accreditation_number']),
                'business_permit_number' => trim($validated['business_permit_number']),
                'status' => 'PENDING',
            ]);

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $request->user()->id,
                'body' => trim($validated['body']),
            ]);

            $this->storeApplicationAttachments($message, $request);

            return $conversation;
        });

        $user = $request->user();

        $this->notifyActiveStaff(
            'New Organizer Application',
            "{$user->first_name} {$user->last_name} submitted DOT accreditation and business permit documents for organizer review.",
            [
                'conversation_id' => $conversation->id,
                'application_status' => 'PENDING',
            ]
        );

        return response()->json([
            'message' => 'Organizer application submitted. DENR staff will review the documents manually.',
            'conversation' => $conversation->fresh([
                'organizerApplication',
                'messages.sender:id,first_name,last_name,role',
                'messages.attachments:id,message_id,document_type,original_name,mime_type,file_size',
            ]),
        ], 201);
    }

    private function createReservationConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'requested_hiking_date' => [
                'required',
                'date',
                'after_or_equal:' . Carbon::today('Asia/Manila')->addDays(30)->toDateString(),
            ],
            'requested_trail_id' => ['required', 'integer', 'exists:trails,id'],
            'requested_visitors' => ['required', 'integer', 'min:1', 'max:12'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $trail = Trail::query()
            ->whereKey($validated['requested_trail_id'])
            ->where('is_active', true)
            ->first();

        if (!$trail) {
            return response()->json([
                'message' => 'Select an active trail.',
            ], 422);
        }

        $conversation = DB::transaction(function () use ($request, $validated) {
            $conversation = Conversation::create([
                'user_id' => $request->user()->id,
                'type' => 'RESERVATION_REQUEST',
                'subject' => 'Reservation Slot Coordination',
                'status' => 'OPEN',
                'requested_hiking_date' => $validated['requested_hiking_date'],
                'requested_trail_id' => $validated['requested_trail_id'],
                'requested_visitors' => $validated['requested_visitors'],
                'last_message_at' => now('Asia/Manila'),
            ]);

            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $request->user()->id,
                'body' => trim($validated['body']),
            ]);

            return $conversation;
        });

        $user = $request->user();

        $this->notifyActiveStaff(
            'New Reservation Coordination Request',
            "{$user->first_name} {$user->last_name} requested reservation-slot coordination for {$validated['requested_hiking_date']} on {$trail->name}.",
            [
                'conversation_id' => $conversation->id,
                'requested_hiking_date' => $validated['requested_hiking_date'],
                'requested_trail_id' => $trail->id,
                'requested_visitors' => $validated['requested_visitors'],
            ]
        );

        return response()->json([
            'message' => 'Reservation coordination request sent. This message does not confirm or create a reservation.',
            'conversation' => $conversation->fresh([
                'requestedTrail:id,name',
                'messages.sender:id,first_name,last_name,role',
            ]),
        ], 201);
    }

    private function storeApplicationAttachments(Message $message, Request $request): void
    {
        foreach ([
            'dot_certificate' => 'DOT_CERTIFICATE',
            'business_permit' => 'BUSINESS_PERMIT',
        ] as $field => $documentType) {
            if (!$request->hasFile($field)) {
                continue;
            }

            $file = $request->file($field);

            if (!$file || !$file->isValid()) {
                throw ValidationException::withMessages([
                    $field => ['The uploaded file could not be read. Please upload it again.'],
                ]);
            }

            if ($file->getSize() > self::MAX_ATTACHMENT_BYTES) {
                throw ValidationException::withMessages([
                    $field => ['Each document image must be 3 MB or smaller.'],
                ]);
            }

            MessageAttachment::create([
                'message_id' => $message->id,
                'document_type' => $documentType,
                'original_name' => substr($file->getClientOriginalName(), 0, 255),
                'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                'file_size' => (int) $file->getSize(),
                'file_content' => file_get_contents($file->getRealPath()),
            ]);
        }
    }

    private function canAccess(Request $request, Conversation $conversation): bool
    {
        $user = $request->user();
        $role = strtoupper((string) $user->role);
        $isStaff = in_array($role, ['ADMIN', 'EMPLOYEE'], true);

        // Direct messages are private to their USER and ORGANIZER participants.
        if (strtoupper((string) $conversation->type) === 'DIRECT_MESSAGE') {
            return !$isStaff
                && in_array($role, ['USER', 'ORGANIZER'], true)
                && (
                    (int) $conversation->user_id === (int) $user->id
                    || (int) $conversation->recipient_id === (int) $user->id
                );
        }

        // Staff retain access to the official DENR conversation workflows.
        return $isStaff
            || (int) $conversation->user_id === (int) $user->id
            || (int) $conversation->organizer_id === (int) $user->id
            || (int) $conversation->recipient_id === (int) $user->id;
    }

    private function notifyActiveStaff(string $title, string $message, array $data): void
    {
        User::query()
            ->whereIn('role', ['ADMIN', 'EMPLOYEE'])
            ->where('status', 'ACTIVE')
            ->get()
            ->each(function (User $staff) use ($title, $message, $data) {
                $staff->notify(new SystemNotification(
                    $title,
                    $message,
                    'conversation',
                    null,
                    $data
                ));
            });
    }

    private function notifyConversationParticipants(
        Conversation $conversation,
        User $sender
    ): void {
        if ($conversation->type === 'DIRECT_MESSAGE') {
            $recipientId = (int) $conversation->user_id === (int) $sender->id
                ? $conversation->recipient_id
                : $conversation->user_id;

            User::query()->find($recipientId)?->notify(new SystemNotification(
                'New Chatbox Message',
                "{$sender->first_name} {$sender->last_name} sent you a message.",
                'conversation',
                null,
                ['conversation_id' => $conversation->id]
            ));

            return;
        }

        if (in_array(strtoupper((string) $sender->role), ['ADMIN', 'EMPLOYEE'], true)) {
            $conversation->user?->notify(new SystemNotification(
                'New DENR Message',
                'DENR staff sent a new message in your E-PULAG conversation.',
                'conversation',
                null,
                ['conversation_id' => $conversation->id]
            ));

            return;
        }

        if ($conversation->type === 'PACKAGE_BOOKING') {
            if ((int) $sender->id === (int) $conversation->organizer_id) {
                $conversation->user?->notify(new SystemNotification(
                    'New Package Booking Message',
                    'The package organizer sent you a message about your booking.',
                    'conversation',
                    null,
                    ['conversation_id' => $conversation->id]
                ));

                return;
            }

            if ((int) $sender->id === (int) $conversation->user_id) {
                $conversation->organizer?->notify(new SystemNotification(
                    'New Package Booking Message',
                    'A customer replied to your package-booking conversation.',
                    'conversation',
                    null,
                    ['conversation_id' => $conversation->id]
                ));

                return;
            }
        }

        $this->notifyActiveStaff(
            'New Visitor Message',
            "{$sender->first_name} {$sender->last_name} sent a new message in an E-PULAG conversation.",
            ['conversation_id' => $conversation->id]
        );
    }
}
