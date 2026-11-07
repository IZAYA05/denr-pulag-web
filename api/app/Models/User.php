<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'role',
        'status',
        'image',
        'terms_version',
        'terms_accepted_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'terms_accepted_at' => 'datetime',
        ];
    }

    /**
     * Get the direct DENR reservations made by the user.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get the Organizer packages owned by the user.
     */
    public function organizerPackages(): HasMany
    {
        return $this->hasMany(
            OrganizerPackage::class,
            'organizer_id'
        );
    }

    /**
     * Get the package bookings made by the user.
     */
    public function packageBookings(): HasMany
    {
        return $this->hasMany(
            PackageBooking::class,
            'customer_id'
        );
    }
}