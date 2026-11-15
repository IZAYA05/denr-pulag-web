<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('created_reservation_id')->nullable()
                ->constrained('reservations')->nullOnDelete();
            $table->timestamp('reservation_created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['created_reservation_id']);
            $table->dropColumn(['created_reservation_id', 'reservation_created_at']);
        });
    }
};
