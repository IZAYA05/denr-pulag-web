<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('terms_version')->nullable();
            $table->timestampTz('terms_accepted_at')->nullable();
        });

        Schema::table('package_bookings', function (Blueprint $table) {
            $table->string('terms_version')->nullable();
            $table->timestampTz('terms_accepted_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('package_bookings', function (Blueprint $table) {
            $table->dropColumn([
                'terms_version',
                'terms_accepted_at',
            ]);
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'terms_version',
                'terms_accepted_at',
            ]);
        });
    }
};