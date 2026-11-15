<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /** Public feed: only published announcements and schedules whose publish time has arrived. */
    public function index(): JsonResponse
    {
        $announcements = Announcement::query()
            ->where(function ($query) {
                $query->where(function ($published) {
                    $published->where('status', 'PUBLISHED')
                        ->where(function ($publishTime) {
                            $publishTime->whereNull('publish_at')
                                ->orWhere('publish_at', '<=', now('Asia/Manila'));
                        });
                })->orWhere(function ($scheduled) {
                        $scheduled->where('status', 'SCHEDULED')
                            ->whereNotNull('publish_at')
                            ->where('publish_at', '<=', now('Asia/Manila'));
                    });
            })
            ->orderByDesc('publish_at')
            ->orderByDesc('created_at')
            ->get(['id', 'title', 'content', 'status', 'publish_at', 'created_at']);

        return response()->json(['announcements' => $announcements]);
    }

    /** Admin-only listing, including drafts and future scheduled announcements. */
    public function adminIndex(): JsonResponse
    {
        return response()->json([
            'announcements' => Announcement::query()
                ->with(['creator:id,first_name,last_name', 'updater:id,first_name,last_name'])
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request, ActivityLogger $logger): JsonResponse
    {
        $validated = $this->validateAnnouncement($request);
        $announcement = Announcement::create([
            ...$this->normalizedData($validated),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        $logger->log(
            $request->user(),
            'CREATE_ANNOUNCEMENT',
            'ANNOUNCEMENT',
            "Created announcement '{$announcement->title}' ({$announcement->status}).",
            $request
        );

        return response()->json([
            'message' => 'Announcement saved successfully.',
            'announcement' => $announcement->fresh(),
        ], 201);
    }

    public function update(Request $request, Announcement $announcement, ActivityLogger $logger): JsonResponse
    {
        $validated = $this->validateAnnouncement($request);
        $announcement->update([
            ...$this->normalizedData($validated),
            'updated_by' => $request->user()->id,
        ]);

        $logger->log(
            $request->user(),
            'UPDATE_ANNOUNCEMENT',
            'ANNOUNCEMENT',
            "Updated announcement '{$announcement->title}' ({$announcement->status}).",
            $request
        );

        return response()->json([
            'message' => 'Announcement updated successfully.',
            'announcement' => $announcement->fresh(),
        ]);
    }

    public function destroy(Request $request, Announcement $announcement, ActivityLogger $logger): JsonResponse
    {
        $title = $announcement->title;
        $announcement->delete();

        $logger->log(
            $request->user(),
            'DELETE_ANNOUNCEMENT',
            'ANNOUNCEMENT',
            "Deleted announcement '{$title}'.",
            $request
        );

        return response()->json(['message' => 'Announcement deleted successfully.']);
    }

    private function validateAnnouncement(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:20000'],
            'status' => ['required', 'string', 'in:DRAFT,PUBLISHED,SCHEDULED'],
            'publish_at' => ['nullable', 'date'],
        ]);
    }

    private function normalizedData(array $validated): array
    {
        $status = $validated['status'];
        $publishAt = $validated['publish_at'] ?? null;

        if ($status === 'SCHEDULED') {
            validator(
                ['publish_at' => $publishAt],
                ['publish_at' => ['required', 'date', 'after:now']]
            )->validate();
        } elseif ($status === 'PUBLISHED') {
            $publishAt = now('Asia/Manila');
        } else {
            $publishAt = null;
        }

        return [
            'title' => trim($validated['title']),
            'content' => trim($validated['content']),
            'status' => $status,
            'publish_at' => $publishAt,
        ];
    }
}
