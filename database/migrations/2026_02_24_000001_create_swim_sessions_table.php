<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('swim_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('group_name', 80);
            $table->date('session_date');
            $table->bigInteger('elapsed_ms');
            $table->unsignedSmallInteger('distance_m')->nullable();
            $table->unsignedTinyInteger('swimmer_count')->default(1);
            $table->json('splits')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'session_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('swim_sessions');
    }
};
