<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SystemNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $title,
        public string $message,
        public string $type = 'general',
        public ?string $url = null,
        public array $data = [],
    ) {
    }

    /**
     * Store notifications in the database.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Notification data saved in the notifications table.
     */
    public function toDatabase(object $notifiable): array
    {
        return array_merge([
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'url' => $this->url,
        ], $this->data);
    }

    /**
     * Return the notification data representation.
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
