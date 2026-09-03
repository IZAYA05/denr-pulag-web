<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trail extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'difficulty',
        'image',
        'max_capacity',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'max_capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the reservations for the trail.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
}