<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('card_review_progress', function (Blueprint $table) {
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

            $table->string('state')->default('new'); // new | learning | review | relearning
            $table->timestamp('due_at')->nullable();
            $table->timestamp('last_reviewed_at')->nullable();

            $table->float('stability')->nullable();
            $table->float('difficulty')->nullable();

            $table->unsignedInteger('elapsed_days')->default(0);
            $table->unsignedInteger('scheduled_days')->default(0);
            $table->unsignedInteger('reps')->default(0);
            $table->unsignedInteger('lapses')->default(0);

            $table->timestamps();

            $table->unique(['user_id', 'card_id']);
            $table->index(['user_id', 'study_set_id', 'due_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_review_progress');
    }
};
