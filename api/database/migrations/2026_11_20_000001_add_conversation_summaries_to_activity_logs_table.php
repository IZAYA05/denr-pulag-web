<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->foreignId('conversation_id')
                ->nullable()
                ->unique()
                ->constrained('conversations')
                ->nullOnDelete();

            $table->foreignId('initiated_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->unsignedInteger('message_count')->default(0);
            $table->timestamp('first_activity_at')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->string('conversation_status', 30)->nullable();
            $table->string('conversation_type', 50)->nullable();
        });

        // Backfill one metadata-only summary for every existing conversation.
        DB::table('conversations')
            ->orderBy('id')
            ->chunkById(200, function ($conversations) {
                foreach ($conversations as $conversation) {
                    $messageStats = DB::table('messages')
                        ->where('conversation_id', $conversation->id)
                        ->selectRaw('COUNT(*) as message_count')
                        ->selectRaw('MIN(created_at) as first_message_at')
                        ->selectRaw('MAX(created_at) as last_message_at')
                        ->first();

                    $firstMessage = DB::table('messages')
                        ->where('conversation_id', $conversation->id)
                        ->orderBy('created_at')
                        ->orderBy('id')
                        ->first();

                    $initiatorId = $firstMessage?->sender_id
                        ?? $conversation->user_id;

                    $initiator = $initiatorId
                        ? DB::table('users')->where('id', $initiatorId)->first()
                        : null;

                    $count = (int) ($messageStats->message_count ?? 0);
                    $type = strtoupper((string) $conversation->type);
                    $status = strtoupper((string) $conversation->status);

                    $firstActivity = $messageStats->first_message_at
                        ?? $conversation->created_at;

                    $lastActivity = $messageStats->last_message_at
                        ?? $conversation->last_message_at
                        ?? $conversation->updated_at
                        ?? $conversation->created_at;

                    DB::table('activity_logs')->updateOrInsert(
                        ['conversation_id' => $conversation->id],
                        [
                            'user_id' => $initiatorId,
                            'initiated_by_user_id' => $initiatorId,
                            'role' => $initiator?->role,
                            'action' => 'CONVERSATION_SUMMARY',
                            'module' => 'MESSAGING',
                            'description' => "Conversation #{$conversation->id} | {$type} | Status: {$status} | Messages: {$count}",
                            'message_count' => $count,
                            'first_activity_at' => $firstActivity,
                            'last_activity_at' => $lastActivity,
                            'conversation_status' => $status,
                            'conversation_type' => $type,
                            'ip_address' => null,
                            'created_at' => $conversation->created_at,
                            'updated_at' => $conversation->updated_at,
                        ]
                    );
                }
            });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropUnique('activity_logs_conversation_id_unique');
            $table->dropConstrainedForeignId('conversation_id');
            $table->dropConstrainedForeignId('initiated_by_user_id');

            $table->dropColumn([
                'message_count',
                'first_activity_at',
                'last_activity_at',
                'conversation_status',
                'conversation_type',
            ]);
        });
    }
};
