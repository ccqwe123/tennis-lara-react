<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewTournamentRegistrationNotification extends Notification
{
    use Queueable;

    public $registration;

    /**
     * Create a new notification instance.
     */
    public function __construct($registration)
    {
        $this->registration = $registration;
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
            'title' => 'New Tournament Registration',
            'message' => 'A user has registered for a tournament.',
            'action_url' => url('/payments/verify?tab=tournaments&date=' . $this->registration->created_at->format('Y-m-d')),
            'type' => 'tournament',
        ];
    }
}
