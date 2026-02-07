<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('court_bookings', function (Blueprint $table) {
            $table->json('picker_selection')->nullable()->after('with_trainer'); // Stores which games have pickers (array of booleans)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('court_bookings', function (Blueprint $table) {
            $table->dropColumn('picker_selection');
        });
    }
};
