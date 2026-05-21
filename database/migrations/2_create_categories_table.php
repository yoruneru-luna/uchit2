<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title', 80);
            $table->text('description')->nullable();

            $table->string('color', 7)->nullable();

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->unique(['user_id', 'title']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
