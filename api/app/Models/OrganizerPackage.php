<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizerPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'organizer_id',
        'name',
        'description',
        'price',
        'max_tourists',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'max_tourists' => 'integer',
        ];
    }

    /**
     * Get the organizer who owns the package.
     */
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    /**
     * Get the services included in the package.
     */
    public function services(): HasMany
    {
        return $this->hasMany(PackageService::class, 'package_id');
    }

    /**
     * Get the bookings made for this package.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(PackageBooking::class, 'package_id');
    }
}