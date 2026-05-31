<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('study_sets', 'fsrs_paused_at')) {
            Schema::table('study_sets', function (Blueprint $table) {
                $table->timestamp('fsrs_paused_at')
                    ->nullable()
                    ->after('fsrs_goal');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('study_sets', 'fsrs_paused_at')) {
            Schema::table('study_sets', function (Blueprint $table) {
                $table->dropColumn('fsrs_paused_at');
            });
        }
    }
};
