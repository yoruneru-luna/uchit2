<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('study_sets', 'fsrs_enabled')) {
            Schema::table('study_sets', function (Blueprint $table) {
                $table->boolean('fsrs_enabled')
                    ->default(true)
                    ->after('visibility');
            });
        }

        if (! Schema::hasColumn('study_sets', 'fsrs_goal')) {
            Schema::table('study_sets', function (Blueprint $table) {
                $table->decimal('fsrs_goal', 3, 2)
                    ->default(0.90)
                    ->after('fsrs_enabled');
            });
        }
    }

    public function down(): void
    {
        foreach (
            [
                'fsrs_goal',
                'fsrs_enabled',
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
