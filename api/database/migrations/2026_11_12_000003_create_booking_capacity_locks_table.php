<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_capacity_locks', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
            $table->timestamps();
        });

        DB::table('booking_capacity_locks')->insert([
            'id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_capacity_locks');
    }
};
