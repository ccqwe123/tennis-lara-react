<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipStatusNotification extends Notification
{
    use Queueable;

    public $subscription;
    public $status;

    /**
     * Create a new notification instance.
     */
    public function __construct($subscription, $status)
    {
        $this->subscription = $subscription;
        $this->status = $status;
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
            'title' => 'Membership Update',
            'message' => 'Your membership status has been updated to: ' . ucfirst($this->status),
            'action_url' => url('/memberships'),
            'type' => 'membership',
        ];
    }
}
