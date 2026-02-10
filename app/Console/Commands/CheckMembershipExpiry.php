<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckMembershipExpiry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'memberships:check-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for memberships expiring in 3 days and notify users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Check for expiry within the next 3 days (tomorrow, day after, 3 days from now)
        $startDate = now()->addDay()->format('Y-m-d');
        $endDate = now()->addDays(3)->format('Y-m-d');

        $subscriptions = \App\Models\MemberSubscription::whereBetween('end_date', [$startDate, $endDate])
            ->with('user')
            ->get();

        $count = 0;

        foreach ($subscriptions as $subscription) {
            $notificationDate = $subscription->end_date->format('M d, Y');

            // Check if we already notified this user about this specific expiration date
            // This prevents spamming the user daily with the same "Expiring on Feb 11" message
            $alreadyNotified = $subscription->user->notifications()
                ->where('type', 'App\Notifications\MembershipExpiryNotification')
                ->where('data->message', 'like', "%{$notificationDate}%")
                ->exists();

            if ($subscription->user && !$alreadyNotified) {
                $subscription->user->notify(new \App\Notifications\MembershipExpiryNotification($subscription));
                $count++;
            }
        }

        $this->info("Sent {$count} membership expiry notifications for {$startDate} to {$endDate}.");
    }
}
