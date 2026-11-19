<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('recipient_id')->nullable()->after('user_id')
                ->constrained('users')->nullOnDelete();
            $table->index(['recipient_id', 'last_message_at']);
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['recipient_id', 'last_message_at']);
            $table->dropConstrainedForeignId('recipient_id');
        });
    }
};
