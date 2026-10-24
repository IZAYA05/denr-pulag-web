<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PackageBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_number',
        'package_id',
        'customer_id',
        'trail_id',
        'hiking_date',
        'tourist_count',
        'status',
        'coordination_status',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'hiking_date' => 'date',
            'tourist_count' => 'integer',
        ];
    }

    /**
     * Get the package being booked.
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(
            OrganizerPackage::class,
            'package_id'
        );
    }

    /**
     * Get the customer who made the booking.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'customer_id'
        );
    }

    /**
     * Get the trail for this booking.
     */
    public function trail(): BelongsTo
    {
        return $this->belongsTo(Trail::class);
    }

    /**
     * Get the tourists included in this booking.
     */
    public function tourists(): HasMany
    {
        return $this->hasMany(
            PackageBookingTourist::class,
            'package_booking_id'
        );
    }
}