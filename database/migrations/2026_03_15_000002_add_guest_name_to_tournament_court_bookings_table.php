<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tournament_court_bookings', function (Blueprint $table) {
            $table->string('guest_name')->nullable()->after('staff_id');
            $table->foreignId('user_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('tournament_court_bookings', function (Blueprint $table) {
            $table->dropColumn('guest_name');
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
