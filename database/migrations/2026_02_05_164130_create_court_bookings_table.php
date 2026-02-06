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
        Schema::create('court_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('staff_id')->nullable()->constrained('users')->onDelete('set null'); // Who processed it
            $table->string('schedule_type'); // day, night
            $table->date('booking_date');
            $table->integer('games_count')->default(1);
            $table->boolean('with_trainer')->default(false);
            $table->string('payment_method'); // cash, gcash
            $table->string('payment_reference')->nullable();
            $table->string('payment_status')->default('pending'); // pending, paid, cancelled
            $table->decimal('total_amount', 10, 2);
            $table->decimal('discount_applied', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('court_bookings');
    }
};
