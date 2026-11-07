<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a separate status for the final DENR approval.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('package_bookings', 'denr_status')) {
            Schema::table('package_bookings', function (Blueprint $table) {
                $table->string('denr_status')
                    ->nullable()
                    ->after('status')
                    ->index();
            });
        }
    }

    /**
     * Remove the DENR approval status if rolled back.
     */
    public function down(): void
    {
        if (Schema::hasColumn('package_bookings', 'denr_status')) {
            Schema::table('package_bookings', function (Blueprint $table) {
                $table->dropIndex(['denr_status']);
                $table->dropColumn('denr_status');
            });
        }
    }
};
