<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();

            // Keep the log even if the associated user is deleted.
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Snapshot of the user's role when the action occurred.
            $table->string('role', 30)->nullable();

            $table->string('action', 50);
            $table->string('module', 50);
            $table->text('description');

            $table->string('ip_address', 45)->nullable();

            $table->timestamps();

            // Optimizes filtering by role, module, and date.
            $table->index(['role', 'created_at']);
            $table->index(['module', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
