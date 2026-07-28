<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderReady extends Notification
{
    use Queueable;

    public function __construct(private Order $order) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Order #{$this->order->order_number} is ready")
            ->line("Order #{$this->order->order_number}" . ($this->order->table ? " for Table {$this->order->table->label}" : '') . ' is ready to be served.')
            ->action('Open POS', url('/pos'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'order_ready',
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'table_label'  => $this->order->table?->label,
            'text'         => "Order #{$this->order->order_number}" . ($this->order->table ? " (Table {$this->order->table->label})" : '') . ' is ready to serve',
            'url'          => '/pos',
        ];
    }
}
