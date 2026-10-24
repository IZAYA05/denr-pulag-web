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
        Schema::create('organizer_packages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organizer_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('name');

            $table->text('description');

            $table->decimal('price', 10, 2);

            $table->unsignedTinyInteger('max_tourists')
                ->default(12);

            $table->string('status')
                ->default('ACTIVE');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizer_packages');
    }
};