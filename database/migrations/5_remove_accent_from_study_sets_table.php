<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('study_sets', function (Blueprint $table) {
            if (Schema::hasColumn('study_sets', 'accent')) {
                $table->dropColumn('accent');
            }
        });
    }

    public function down(): void
    {
        Schema::table('study_sets', function (Blueprint $table) {
            if (! Schema::hasColumn('study_sets', 'accent')) {
                $table->string('accent', 10)->nullable()->after('language');
            }
        });
    }
};
