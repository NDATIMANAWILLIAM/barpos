<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class MakeAdmin extends Command
{
    protected $signature   = 'barpos:make-admin';
    protected $description = 'Create or reset the Super Manager (owner) account';

    public function handle(): int
    {
        $this->info('');
        $this->line('  <fg=yellow>Isaro Rubengera — Super Manager Setup</>');
        $this->line('  ──────────────────────────────');
        $this->info('');

        $name = $this->ask('Full name', 'Admin');

        $email = $this->ask('Email address', 'admin@barpos.rw');
        $validator = Validator::make(['email' => $email], ['email' => 'required|email']);
        if ($validator->fails()) {
            $this->error('Invalid email address.');
            return self::FAILURE;
        }

        $phone = $this->ask('Phone number (optional)', null);

        $password = $this->secret('Password (min 8 characters)');
        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');
            return self::FAILURE;
        }

        $confirm = $this->secret('Confirm password');
        if ($password !== $confirm) {
            $this->error('Passwords do not match.');
            return self::FAILURE;
        }

        $existing = User::where('email', $email)->first();

        if ($existing) {
            if (! $this->confirm("Account {$email} already exists. Update it to Super Manager?")) {
                $this->line('Cancelled.');
                return self::SUCCESS;
            }
            $existing->update([
                'name'      => $name,
                'password'  => Hash::make($password),
                'role'      => 'owner',
                'phone'     => $phone,
                'is_active' => true,
            ]);
            $this->info("✓ Account updated: {$email} is now Super Manager.");
        } else {
            User::create([
                'name'      => $name,
                'email'     => $email,
                'password'  => Hash::make($password),
                'role'      => 'owner',
                'phone'     => $phone,
                'is_active' => true,
            ]);
            $this->info("✓ Super Manager account created: {$email}");
        }

        $this->info('');
        $this->line("  Login at: <fg=cyan>http://127.0.0.1:8000/login</>");
        $this->line("  Email:    <fg=cyan>{$email}</>");
        $this->info('');

        return self::SUCCESS;
    }
}
