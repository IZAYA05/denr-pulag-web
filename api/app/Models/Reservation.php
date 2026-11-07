<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_number',
        'group_leader_name',
        'group_leader_phone',
        'booking_date',
        'hiking_date',
        'total_participants',
        'status',
        'remarks',
        'user_id',
        'trail_id',
        'terms_version',
        'terms_accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'datetime',
            'hiking_date' => 'date',
            'total_participants' => 'integer',
            'terms_accepted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trail(): BelongsTo
    {
        return $this->belongsTo(Trail::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ReservationParticipant::class);
    }
}