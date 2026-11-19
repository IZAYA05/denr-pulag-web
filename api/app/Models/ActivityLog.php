<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'role',
        'action',
        'module',
        'description',
        'ip_address',
        'conversation_id',
        'initiated_by_user_id',
        'message_count',
        'first_activity_at',
        'last_activity_at',
        'conversation_status',
        'conversation_type',
    ];

    protected function casts(): array
    {
        return [
            'message_count' => 'integer',
            'first_activity_at' => 'datetime',
            'last_activity_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function initiatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by_user_id');
    }
}
