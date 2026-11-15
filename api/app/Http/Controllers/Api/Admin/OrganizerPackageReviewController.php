<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrganizerPackage;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrganizerPackageReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OrganizerPackage::with([
            'organizer:id,first_name,last_name,email,role,status',
            'services',
            'reviewer:id,first_name,last_name',
        ])->where('is_walk_in', false);

        $approvalStatus = strtoupper((string) $request->query('approval_status', 'PENDING'));
        if (in_array($approvalStatus, ['PENDING', 'APPROVED', 'REJECTED', 'ALL'], true)) {
            if ($approvalStatus !== 'ALL') {
                $query->where('approval_status', $approvalStatus);
            }
        }

        return response()->json([
            'packages' => $query->latest()->get(),
        ]);
    }

    public function review(Request $request, OrganizerPackage $package): JsonResponse
    {
        $validated = $request->validate([
            'decision' => ['required', 'string', 'in:APPROVED,REJECTED'],
            'approval_notes' => ['nullable', 'string', 'max:2000', 'required_if:decision,REJECTED'],
        ]);

        if ($package->is_walk_in) {
            return response()->json([
                'message' => 'Walk-in packages do not require organizer package approval.',
            ], 422);
        }

        if ($package->approval_status !== 'PENDING') {
            return response()->json([
                'message' => 'Only packages awaiting review can be processed.',
            ], 422);
        }

        $reviewer = $request->user();
        $decision = $validated['decision'];

        DB::transaction(function () use ($package, $reviewer, $decision, $validated) {
            $lockedPackage = OrganizerPackage::query()
                ->whereKey($package->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedPackage->approval_status !== 'PENDING') {
                abort(409, 'This package has already been reviewed. Refresh the page.');
            }

            $lockedPackage->update([
                'approval_status' => $decision,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now('Asia/Manila'),
                'approval_notes' => $validated['approval_notes'] ?? null,
                'status' => $decision === 'REJECTED' ? 'INACTIVE' : $lockedPackage->status,
            ]);
        });

        $package->loadMissing('organizer');
        $organizer = $package->organizer;

        if ($organizer) {
            $organizer->notify(new SystemNotification(
                $decision === 'APPROVED' ? 'Package Approved' : 'Package Rejected',
                $decision === 'APPROVED'
                    ? "Your package '{$package->name}' has been approved and can now appear in the public catalog."
                    : "Your package '{$package->name}' was not approved. Review the DENR feedback and update your submission.",
                'organizer_package',
                null,
                [
                    'package_id' => $package->id,
                    'package_name' => $package->name,
                    'approval_status' => $decision,
                    'approval_notes' => $validated['approval_notes'] ?? null,
                ]
            ));
        }

        return response()->json([
            'message' => $decision === 'APPROVED'
                ? 'Package approved successfully.'
                : 'Package rejected successfully.',
            'package' => $package->fresh([
                'organizer:id,first_name,last_name,email',
                'services',
                'reviewer:id,first_name,last_name',
            ]),
        ]);
    }
}
