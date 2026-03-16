<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class AdminMembershipExpiryNotification extends Notification
{
    public function __construct(public $subscription, public string $type = 'expiring') {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $userName = $this->subscription->user->name;
        $planType = ucfirst($this->subscription->type);
        $date = $this->subscription->end_date->format('M d, Y');

        if ($this->type === 'expired') {
            return [
                'title' => 'Member Subscription Expired',
                'message' => "{$userName}'s {$planType} membership expired on {$date}.",
                'action_url' => route('memberships.manage'),
                'type' => 'admin_membership_expired',
            ];
        }

        return [
            'title' => 'Member Subscription Expiring Soon',
            'message' => "{$userName}'s {$planType} membership will expire on {$date}.",
            'action_url' => route('memberships.manage'),
            'type' => 'admin_membership_expiry',
        ];
    }
}
