<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CancelBookingNotification extends Notification
{
    use Queueable;
    public $booking;
    public $message;
    public $url;
    public $type;
    public $title;
    /**
     * Create a new notification instance.
     */
    public function __construct($booking, $message, $url, $type, $title)
    {
        $this->booking = $booking;
        $this->message = $message;
        $this->url = $url;
        $this->type = $type;
        $this->title = $title;
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
     * Get the mail representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'amount' => $this->booking->total_amount,
            'action_url' => $this->url,
            'type' => $this->type,
        ];
    }
}
