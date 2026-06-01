<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('card_review_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('study_set_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('card_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('mode');
            $table->string('rating');

            $table->float('stability_before')->nullable();
            $table->float('difficulty_before')->nullable();
            $table->float('stability_after')->nullable();
            $table->float('difficulty_after')->nullable();

            $table->timestamp('reviewed_at');
            $table->timestamp('next_due_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'study_set_id', 'reviewed_at']);
            $table->index(['user_id', 'card_id', 'reviewed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_review_logs');
    }
};
