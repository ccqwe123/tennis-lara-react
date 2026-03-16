<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('incomes', function (Blueprint $table) {
            $table->date('date')->nullable()->after('id');
            $table->string('source_type')->nullable()->after('date'); // court_booking, tournament_registration, tournament_court_booking, membership
            $table->unsignedBigInteger('source_id')->nullable()->after('source_type');
            $table->string('item')->nullable()->after('source_id');
            $table->string('receipt_no')->nullable()->after('item');
            $table->text('notes')->nullable()->after('receipt_no');
            $table->decimal('amount', 10, 2)->default(0)->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('incomes', function (Blueprint $table) {
            $table->dropColumn(['date', 'source_type', 'source_id', 'item', 'receipt_no', 'notes', 'amount']);
        });
    }
};
