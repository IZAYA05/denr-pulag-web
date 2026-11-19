<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Carbon;

class ConversationActivityLogger
{
    public function sync(Conversation $conversation): ActivityLog
    {
        $firstMessage = Message::query()
            ->with('sender:id,role')
            ->where('conversation_id', $conversation->id)
            ->orderBy('created_at')
            ->orderBy('id')
            ->first();

        $latestMessage = Message::query()
            ->where('conversation_id', $conversation->id)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->first();

        $initiator = $firstMessage?->sender;

        if (!$initiator) {
            $initiator = User::query()->find($conversation->user_id);
        }

        $messageCount = Message::query()
            ->where('conversation_id', $conversation->id)
            ->count();

        $firstActivityAt = $firstMessage?->created_at
            ?? $conversation->created_at;

        $lastActivityAt = $conversation->updated_at;

        if ($latestMessage?->created_at) {
            $messageTime = Carbon::parse($latestMessage->created_at);

            if (
                !$lastActivityAt
                || $messageTime->greaterThan(Carbon::parse($lastActivityAt))
            ) {
                $lastActivityAt = $messageTime;
            }
        }

        $type = strtoupper((string) $conversation->type);
        $status = strtoupper((string) $conversation->status);

        return ActivityLog::updateOrCreate(
            ['conversation_id' => $conversation->id],
            [
                'user_id' => $initiator?->id,
                'initiated_by_user_id' => $initiator?->id,
                'role' => $initiator?->role,
                'action' => 'CONVERSATION_SUMMARY',
                'module' => 'MESSAGING',
                'description' => sprintf(
                    'Conversation #%d | %s | Status: %s | Messages: %d',
                    $conversation->id,
                    $type,
                    $status,
                    $messageCount
                ),
                'message_count' => $messageCount,
                'first_activity_at' => $firstActivityAt,
                'last_activity_at' => $lastActivityAt,
                'conversation_status' => $status,
                'conversation_type' => $type,
            ]
        );
    }
}
