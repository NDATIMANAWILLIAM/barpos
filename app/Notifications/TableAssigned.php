<?php

namespace App\Notifications;

use App\Models\DiningTable;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TableAssigned extends Notification
{
    use Queueable;

    public function __construct(
        private DiningTable $table,
        private ?User $assignedBy,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Database always works with zero setup. Mail only actually sends
        // once real SMTP credentials are configured — until then it's a
        // harmless no-op (logged, not delivered) rather than failing.
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("You've been assigned to Table {$this->table->label}")
            ->line("{$this->assignedBy?->name} assigned you to Table {$this->table->label}" . ($this->table->zone ? " ({$this->table->zone})" : '') . '.')
            ->action('Open Live Operations', url('/operations'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'          => 'table_assigned',
            'table_id'      => $this->table->id,
            'table_label'   => $this->table->label,
            'table_zone'    => $this->table->zone,
            'assigned_by'   => $this->assignedBy?->name,
            'text'          => "Assigned to Table {$this->table->label}" . ($this->assignedBy ? " by {$this->assignedBy->name}" : ''),
            'url'           => '/operations',
        ];
    }
}
