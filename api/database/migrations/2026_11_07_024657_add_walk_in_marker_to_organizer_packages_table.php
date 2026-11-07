<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizer_packages', function (Blueprint $table) {
            $table->foreignId('organizer_id')
                ->nullable()
                ->change();

            $table->boolean('is_walk_in')
                ->default(false);
        });

        // PostgreSQL: allow only one row marked as the Walk-in Package.
        DB::statement("
            CREATE UNIQUE INDEX organizer_packages_one_walk_in_package
            ON organizer_packages (is_walk_in)
            WHERE is_walk_in = TRUE
        ");
    }

    public function down(): void
    {
        // Do not make organizer_id required while a system-owned
        // Walk-in Package still has no organizer.
        $hasSystemOwnedWalkIn = DB::table('organizer_packages')
            ->where('is_walk_in', true)
            ->whereNull('organizer_id')
            ->exists();

        if ($hasSystemOwnedWalkIn) {
            throw new RuntimeException(
                'Cannot roll back while a system-owned Walk-in Package exists. Remove or reassign it first.'
            );
        }

        DB::statement(
            'DROP INDEX IF EXISTS organizer_packages_one_walk_in_package'
        );

        Schema::table('organizer_packages', function (Blueprint $table) {
            $table->dropColumn('is_walk_in');

            $table->foreignId('organizer_id')
                ->nullable(false)
                ->change();
        });
    }
};