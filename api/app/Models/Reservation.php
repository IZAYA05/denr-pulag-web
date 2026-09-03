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
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'datetime',
            'hiking_date' => 'date',
            'total_participants' => 'integer',
        ];
    }

    /**
     * Get the user who made the reservation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the trail associated with the reservation.
     */
    public function trail(): BelongsTo
    {
        return $this->belongsTo(Trail::class);
    }

    /**
     * Get the participants for the reservation.
     */
    public function participants(): HasMany
    {
        return $this->hasMany(ReservationParticipant::class);
    }
}