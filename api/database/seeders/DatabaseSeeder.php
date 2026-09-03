<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'test@example.com',
            ],
            [
                'first_name' => 'Test',
                'last_name' => 'User',
                'phone' => '09123456789',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'role' => 'USER',
            ]
        );

        User::updateOrCreate(
            [
                'email' => 'employee@example.com',
            ],
            [
                'first_name' => 'Test',
                'last_name' => 'Employee',
                'phone' => '09999999999',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'role' => 'EMPLOYEE',
            ]
        );
    }
}