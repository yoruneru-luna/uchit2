<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('study_sets', function (Blueprint $table) {
            if (! Schema::hasColumn('study_sets', 'source_set_id')) {
                $table->foreignId('source_set_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('study_sets')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('study_sets', 'source_version')) {
                $table->unsignedInteger('source_version')
                    ->nullable()
                    ->after('source_set_id');
            }

            if (! Schema::hasColumn('study_sets', 'public_version')) {
                $table->unsignedInteger('public_version')
                    ->default(1)
                    ->after('visibility');
            }

            if (! Schema::hasColumn('study_sets', 'public_updated_at')) {
                $table->timestamp('public_updated_at')
                    ->nullable()
                    ->after('public_version');
            }
        });
    }

    public function down(): void
    {
        Schema::table('study_sets', function (Blueprint $table) {
            if (Schema::hasColumn('study_sets', 'source_set_id')) {
                $table->dropConstrainedForeignId('source_set_id');
            }

            if (Schema::hasColumn('study_sets', 'source_version')) {
                $table->dropColumn('source_version');
            }

            if (Schema::hasColumn('study_sets', 'public_version')) {
                $table->dropColumn('public_version');
            }

            if (Schema::hasColumn('study_sets', 'public_updated_at')) {
                $table->dropColumn('public_updated_at');
            }
        });
    }
};
