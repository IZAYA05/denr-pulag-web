<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageService extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_id',
        'service',
    ];

    /**
     * Get the package this service belongs to.
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(
            OrganizerPackage::class,
            'package_id'
        );
    }
}