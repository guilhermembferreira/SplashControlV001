<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('athletes', function (Blueprint $table) {
            $table->string('club')->nullable()->after('gender');
            $table->unsignedSmallInteger('started_year')->nullable()->after('club');
            $table->unsignedSmallInteger('height_cm')->nullable()->after('started_year');
            $table->decimal('weight_kg', 4, 1)->nullable()->after('height_cm');
        });
    }

    public function down(): void
    {
        Schema::table('athletes', function (Blueprint $table) {
            $table->dropColumn(['club', 'started_year', 'height_cm', 'weight_kg']);
        });
    }
};
