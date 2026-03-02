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
        Schema::table('swim_records', function (Blueprint $table) {
            $table->string('competition_name')->nullable()->after('date');
            $table->string('competition_location')->nullable()->after('competition_name');
            $table->text('notes')->nullable()->after('competition_location');
        });
    }

    public function down(): void
    {
        Schema::table('swim_records', function (Blueprint $table) {
            $table->dropColumn(['competition_name', 'competition_location', 'notes']);
        });
    }
};
