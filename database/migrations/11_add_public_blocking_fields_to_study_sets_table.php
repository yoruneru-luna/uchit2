<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('study_sets', 'public_blocked')) {
            Schema::table('study_sets', function (Blueprint $table) {
                $table->boolean('public_blocked')->default(false)->after('visibility');
            });
        }

        if (! Schema::hasColumn('study_sets', 'public_blocked_at')) {
            Schema::table('study_sets', function (Blueprint $table) {
                $table->timestamp('public_blocked_at')->nullable()->after('public_blocked');
            });
        }

        if (! Schema::hasColumn('study_sets', 'public_blocked_by')) {
            Schema::table('study_sets', function (Blueprint $table) {
                $table->foreignId('public_blocked_by')
                    ->nullable()
                    ->after('public_blocked_at')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }

        if (! Schema::hasColumn('study_sets', 'public_block_reason')) {
            Schema::table('study_sets', function (Blueprint $table) {
                $table->string('public_block_reason')->nullable()->after('public_blocked_by');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('study_sets', 'public_blocked_by')) {
            Schema::table('study_sets', function (Blueprint $table) {
                $table->dropForeign(['public_blocked_by']);
            });
        }

        foreach (
            [
                'public_block_reason',
                'public_blocked_by',
                'public_blocked_at',
                'public_blocked',
            ] as $column
        ) {
            if (Schema::hasColumn('study_sets', $column)) {
                Schema::table('study_sets', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }
};
