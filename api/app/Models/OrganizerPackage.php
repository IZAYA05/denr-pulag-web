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
        'is_walk_in',
        'name',
        'description',
        'price',
        'max_tourists',
        'status',
        'approval_status',
        'reviewed_by',
        'reviewed_at',
        'approval_notes',
    ];

    protected function casts(): array
    {
        return [
            'is_walk_in' => 'boolean',
            'price' => 'decimal:2',
            'max_tourists' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(PackageService::class, 'package_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(PackageBooking::class, 'package_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}