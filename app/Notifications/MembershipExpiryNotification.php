<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipExpiryNotification extends Notification
{
    use Queueable;

    public $subscription;

    /**
     * Create a new notification instance.
     */
    public function __construct($subscription)
    {
        $this->subscription = $subscription;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Membership Expiring Soon',
            'message' => 'Your ' . ucfirst($this->subscription->type) . ' membership will expire on ' . $this->subscription->end_date->format('M d, Y') . '. Please renew to continue enjoying benefits.',
            'action_url' => route('memberships.index'),
            'type' => 'membership_expiry',
        ];
    }
}
