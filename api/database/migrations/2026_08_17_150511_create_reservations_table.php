<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();

            $table->string('reservation_number')->unique();

            $table->string('group_leader_name');
            $table->string('group_leader_phone');

            $table->timestamp('booking_date')->useCurrent();
            $table->date('hiking_date');

            $table->unsignedInteger('total_participants');

            $table->string('status')->default('PENDING');

            $table->text('remarks')->nullable();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('trail_id')
                ->constrained('trails')
                ->restrictOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};