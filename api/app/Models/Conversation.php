<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    protected $fillable = [
        'user_id',
        'organizer_id',
        'package_booking_id',
        'recipient_id',
        'type',
        'subject',
        'status',
        'requested_hiking_date',
        'requested_trail_id',
        'requested_visitors',
        'last_message_at',
        'created_reservation_id',
        'reservation_created_at',
    ];

    protected function casts(): array
    {
        return [
            'requested_hiking_date' => 'date:Y-m-d',
            'requested_visitors' => 'integer',
            'last_message_at' => 'datetime',
            'reservation_created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function packageBooking(): BelongsTo
    {
        return $this->belongsTo(PackageBooking::class, 'package_booking_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function requestedTrail(): BelongsTo
    {
        return $this->belongsTo(Trail::class, 'requested_trail_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function organizerApplication(): HasOne
    {
        return $this->hasOne(OrganizerApplication::class);
    }

    public function createdReservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class, 'created_reservation_id');
    }
}