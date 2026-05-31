<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'daily_new_cards_limit')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedInteger('daily_new_cards_limit')
                    ->default(10)
                    ->after('subscription_ends_at');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'daily_new_cards_limit')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('daily_new_cards_limit');
            });
        }
    }
};
