<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('user')->after('password');
            });
        }

        if (! Schema::hasColumn('users', 'blocked_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('blocked_at')->nullable()->after('role');
            });
        }

        if (! Schema::hasColumn('users', 'blocked_by')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('blocked_by')
                    ->nullable()
                    ->after('blocked_at')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }

        if (! Schema::hasColumn('users', 'blocked_reason')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('blocked_reason')->nullable()->after('blocked_by');
            });
        }

        if (! Schema::hasColumn('users', 'last_login_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('last_login_at')->nullable()->after('blocked_reason');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'blocked_by')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['blocked_by']);
            });
        }

        foreach (
            [
                'last_login_at',
                'blocked_reason',
                'blocked_by',
                'blocked_at',
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
