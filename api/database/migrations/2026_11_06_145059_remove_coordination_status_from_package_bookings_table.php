<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remove the obsolete DENR coordination status.
     */
    public function up(): void
    {
        if (Schema::hasColumn('package_bookings', 'coordination_status')) {
            Schema::table('package_bookings', function (Blueprint $table) {
                $table->dropColumn('coordination_status');
            });
        }
    }

    /**
     * Restore the coordination status if rolled back.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('package_bookings', 'coordination_status')) {
            Schema::table('package_bookings', function (Blueprint $table) {
                $table->string('coordination_status')
                    ->default('NOT_COORDINATED');
            });
        }
    }
};