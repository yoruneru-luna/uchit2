<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_sets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('category_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete();

            $table->string('title', 120);

            $table->text('description')
                ->nullable();

            $table->enum('language', ['en'])
                ->nullable();

            $table->enum('accent', ['uk', 'us'])
                ->nullable();

            $table->enum('visibility', ['private', 'public'])
                ->default('private');

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['category_id']);
            $table->index(['visibility']);

            $table->unique(['user_id', 'title']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_sets');
    }
};
