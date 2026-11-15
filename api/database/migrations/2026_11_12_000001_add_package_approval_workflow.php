<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizer_packages', function (Blueprint $table) {
            $table->string('approval_status')->default('PENDING')->after('status');
            $table->foreignId('reviewed_by')->nullable()->after('approval_status')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            $table->text('approval_notes')->nullable()->after('reviewed_at');
        });

        // Existing packages were already publicly available before this workflow.
        // Preserve that availability while requiring approval for newly submitted packages.
        DB::table('organizer_packages')->update([
            'approval_status' => 'APPROVED',
        ]);
    }

    public function down(): void
    {
        Schema::table('organizer_packages', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn([
                'approval_status',
                'reviewed_by',
                'reviewed_at',
                'approval_notes',
            ]);
        });
    }
};
