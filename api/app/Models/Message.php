<?php

namespace App\Models;

use App\Services\ConversationActivityLogger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
    ];

    protected static function booted(): void
    {
        static::created(function (Message $message) {
            $conversation = Conversation::query()
                ->find($message->conversation_id);

            if ($conversation) {
                app(ConversationActivityLogger::class)->sync($conversation);
            }
        });
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MessageAttachment::class);
    }
}
