<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageBookingTourist extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'age',
        'gender',
        'nationality',
        'contact_number',
        'address',
        'emergency_contact',
        'emergency_number',
        'package_booking_id',
    ];

    protected function casts(): array
    {
        return [
            'age' => 'integer',
        ];
    }

    /**
     * Get the package booking this tourist belongs to.
     */
    public function packageBooking(): BelongsTo
    {
        return $this->belongsTo(
            PackageBooking::class,
            'package_booking_id'
        );
    }
}