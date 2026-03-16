<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('member_subscriptions', function (Blueprint $table) {
            $table->timestamp('notified_expiring_at')->nullable()->after('payment_status');
            $table->timestamp('notified_expired_at')->nullable()->after('notified_expiring_at');
        });
    }

    public function down(): void
    {
        Schema::table('member_subscriptions', function (Blueprint $table) {
            $table->dropColumn(['notified_expiring_at', 'notified_expired_at']);
        });
    }
};
