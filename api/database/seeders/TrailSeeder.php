<?php

namespace Database\Seeders;

use App\Models\Trail;
use Illuminate\Database\Seeder;

class TrailSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Trail::create([
            'name' => 'Placeholder Trail 1',
            'description' => 'Temporary trail data for E-PULAG development and testing.',
            'difficulty' => 'EASY',
            'image' => null,
            'max_capacity' => 500,
            'is_active' => true,
        ]);

        Trail::create([
            'name' => 'Placeholder Trail 2',
            'description' => 'Temporary trail data for E-PULAG development and testing.',
            'difficulty' => 'MODERATE',
            'image' => null,
            'max_capacity' => 500,
            'is_active' => true,
        ]);

        Trail::create([
            'name' => 'Placeholder Trail 3',
            'description' => 'Temporary trail data for E-PULAG development and testing.',
            'difficulty' => 'DIFFICULT',
            'image' => null,
            'max_capacity' => 500,
            'is_active' => true,
        ]);
    }
}