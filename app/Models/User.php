<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'nickname', 'email', 'avatar', 'password', 'birthday', 'yandex_id', 'role', 'blocked_at', 'blocked_by', 'blocked_reason', 'last_login_at', 'subscription_plan', 'subscription_status', 'subscription_ends_at', 'daily_new_cards_limit'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'blocked_at' => 'datetime',
            'last_login_at' => 'datetime',
            'subscription_ends_at' => 'datetime',
            'daily_new_cards_limit' => 'integer',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isBlocked(): bool
    {
        return $this->blocked_at !== null;
    }
    public function hasActiveSubscription(): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        return $this->subscription_plan === 'pro'
            && $this->subscription_status === 'active'
            && $this->subscription_ends_at
            && $this->subscription_ends_at->isFuture();
    }

    public function isPro(): bool
    {
        return $this->hasActiveSubscription();
    }

    public function activateProSubscription(int $days = 30): void
    {
        $startDate = $this->subscription_ends_at && $this->subscription_ends_at->isFuture()
            ? $this->subscription_ends_at->copy()
            : now();

        $this->update([
            'subscription_plan' => 'pro',
            'subscription_status' => 'active',
            'subscription_ends_at' => $startDate->addDays($days),
        ]);
    }

    public function expireSubscriptionIfNeeded(): void
    {
        if (
            $this->subscription_status === 'active'
            && $this->subscription_ends_at
            && $this->subscription_ends_at->isPast()
        ) {
            $this->update([
                'subscription_plan' => 'free',
                'subscription_status' => 'expired',
            ]);
        }
    }
}
