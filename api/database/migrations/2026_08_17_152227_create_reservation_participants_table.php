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
        Schema::create('reservation_participants', function (Blueprint $table) {
            $table->id();

            $table->string('full_name');
            $table->unsignedInteger('age');
            $table->string('gender');
            $table->string('nationality');

            $table->string('contact_number')->nullable();
            $table->text('address')->nullable();

            $table->string('emergency_contact');
            $table->string('emergency_number');

            $table->foreignId('reservation_id')
                ->constrained('reservations')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservation_participants');
    }
};