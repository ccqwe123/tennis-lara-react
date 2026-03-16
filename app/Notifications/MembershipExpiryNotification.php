<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class MembershipExpiryNotification extends Notification
{
    public function __construct(public $subscription, public string $type = 'expiring') {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        if ($this->type === 'expired') {
            return [
                'title' => 'Membership Expired',
                'message' => 'Your ' . ucfirst($this->subscription->type) . ' membership has expired on ' . $this->subscription->end_date->format('M d, Y') . '. Please renew to continue enjoying benefits.',
                'action_url' => route('memberships.index'),
                'type' => 'membership_expired',
            ];
        }

        return [
            'title' => 'Membership Expiring Soon',
            'message' => 'Your ' . ucfirst($this->subscription->type) . ' membership will expire on ' . $this->subscription->end_date->format('M d, Y') . '. Please renew to continue enjoying benefits.',
            'action_url' => route('memberships.index'),
            'type' => 'membership_expiry',
        ];
    }
}
