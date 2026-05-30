<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'subscription_plan')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('subscription_plan')
                    ->default('free')
                    ->after('last_login_at');
            });
        }

        if (! Schema::hasColumn('users', 'subscription_status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('subscription_status')
                    ->default('inactive')
                    ->after('subscription_plan');
            });
        }

        if (! Schema::hasColumn('users', 'subscription_ends_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dateTime('subscription_ends_at')
                    ->nullable()
                    ->after('subscription_status');
            });
        }
    }

    public function down(): void
    {
        foreach (
            [
                'subscription_ends_at',
                'subscription_status',
                'subscription_plan',
            ] as $column
        ) {
            if (Schema::hasColumn('users', $column)) {
                Schema::table('users', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }
};
