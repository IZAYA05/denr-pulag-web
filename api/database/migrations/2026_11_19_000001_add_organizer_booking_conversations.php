<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('organizer_id')->nullable()
                ->after('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('package_booking_id')->nullable()
                ->after('organizer_id')
                ->constrained('package_bookings')
                ->cascadeOnDelete();

            $table->unique('package_booking_id', 'conversations_package_booking_unique');
            $table->index(['organizer_id', 'last_message_at'], 'conversations_organizer_last_message_index');
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropUnique('conversations_package_booking_unique');
            $table->dropIndex('conversations_organizer_last_message_index');
            $table->dropConstrainedForeignId('package_booking_id');
            $table->dropConstrainedForeignId('organizer_id');
        });
    }
};
