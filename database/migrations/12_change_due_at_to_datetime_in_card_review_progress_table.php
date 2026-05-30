<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE card_review_progress
            MODIFY due_at DATETIME NULL
        ");

        DB::statement("
            ALTER TABLE card_review_progress
            MODIFY last_reviewed_at DATETIME NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE card_review_progress
            MODIFY due_at TIMESTAMP NULL
        ");

        DB::statement("
            ALTER TABLE card_review_progress
            MODIFY last_reviewed_at TIMESTAMP NULL
        ");
    }
};
