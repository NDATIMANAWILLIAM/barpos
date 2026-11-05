<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StationReady extends Notification
{
    use Queueable;

    public function __construct(private Order $order, private string $station) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    private function stationLabel(): string
    {
        return $this->station === 'bar' ? 'Drinks' : 'Food';
    }

    private function destination(): string
    {
        return $this->order->table ? "Table {$this->order->table->label}" : "Order #{$this->order->order_number}";
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("{$this->stationLabel()} ready — {$this->destination()}")
            ->line("{$this->stationLabel()} for {$this->destination()} (Order #{$this->order->order_number}) are ready to pick up.")
            ->action('Open POS', url('/pos'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'station_ready',
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'station'      => $this->station,
            'table_label'  => $this->order->table?->label,
            'text'         => "{$this->stationLabel()} ready — {$this->destination()}",
            'url'          => '/pos',
        ];
    }
}
