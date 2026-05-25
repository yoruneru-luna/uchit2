<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cards', function (Blueprint $table) {
            $table->id();

            $table->foreignId('study_set_id')
                ->constrained('study_sets')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->text('front');
            $table->text('back');

            $table->string('hint', 180)->nullable();
            $table->text('example')->nullable();
            $table->string('transcription', 120)->nullable();
            $table->string('marker', 120)->nullable();

            $table->string('image_path')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['study_set_id', 'created_at']);
            $table->index(['user_id', 'marker']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};
