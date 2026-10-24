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
        Schema::create('package_bookings', function (Blueprint $table) {
            $table->id();

            $table->string('booking_number')->unique();

            $table->foreignId('package_id')
                ->constrained('organizer_packages')
                ->cascadeOnDelete();

            $table->foreignId('customer_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('trail_id')
                ->constrained('trails')
                ->restrictOnDelete();

            $table->date('hiking_date');

            $table->unsignedTinyInteger('tourist_count');

            $table->string('status')
                ->default('PENDING');

            $table->string('coordination_status')
                ->default('NOT_COORDINATED');

            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_bookings');
    }
};