<?php

namespace App\Http\Middleware;

use App\Models\MemberSubscription;
use App\Models\User;
use App\Notifications\AdminMembershipExpiryNotification;
use App\Notifications\MembershipExpiryNotification;
use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CheckMembershipExpiry
{
    public function handle(Request $request, Closure $next): Response
    {
        // Only run once per hour per process using cache to avoid hammering DB on every request
        if (!Cache::has('membership_expiry_checked')) {
            Cache::put('membership_expiry_checked', true, now()->addHour());
            $this->checkExpiry();
        }

        return $next($request);
    }

    public function checkExpiry(): void
    {
        $admins = User::where('type', UserType::ADMIN)->get();

        $now = now();
        $warningDate = $now->copy()->addDays(7);

        // Expiring within 7 days — not yet notified
        $expiring = MemberSubscription::with('user')
            ->where('payment_status', 'paid')
            ->whereNotNull('end_date')
            ->whereBetween('end_date', [$now->toDateString(), $warningDate->toDateString()])
            ->whereNull('notified_expiring_at')
            ->get();

        foreach ($expiring as $subscription) {
            $subscription->user->notify(new MembershipExpiryNotification($subscription, 'expiring'));
            foreach ($admins as $admin) {
                $admin->notify(new AdminMembershipExpiryNotification($subscription, 'expiring'));
            }
            $subscription->update(['notified_expiring_at' => $now]);
        }

        // Already expired — not yet notified
        $expired = MemberSubscription::with('user')
            ->where('payment_status', 'paid')
            ->whereNotNull('end_date')
            ->where('end_date', '<', $now->toDateString())
            ->whereNull('notified_expired_at')
            ->get();

        foreach ($expired as $subscription) {
            $subscription->user->notify(new MembershipExpiryNotification($subscription, 'expired'));
            foreach ($admins as $admin) {
                $admin->notify(new AdminMembershipExpiryNotification($subscription, 'expired'));
            }
            $subscription->user->update([
                'type' => UserType::NON_MEMBER,
                'membership_status' => 'non-member',
            ]);
            $subscription->update(['notified_expired_at' => $now]);
        }
    }
}
