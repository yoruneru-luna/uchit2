<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Category;
use App\Models\StudySet;
use App\Models\User;

class SubscriptionAccessService
{
    public function isPro(User $user): bool
    {
        return $user->isAdmin() || $user->isPro();
    }

    public function limit(string $key): int
    {
        return (int) config("subscription.free_limits.{$key}", 0);
    }

    public function categoriesCount(User $user): int
    {
        return Category::query()
            ->where('user_id', $user->id)
            ->count();
    }

    public function setsCount(User $user): int
    {
        return StudySet::query()
            ->where('user_id', $user->id)
            ->count();
    }

    public function cardsCount(User $user): int
    {
        return Card::query()
            ->where('user_id', $user->id)
            ->count();
    }

    public function canCreateCategory(User $user): bool
    {
        if ($this->isPro($user)) {
            return true;
        }

        return $this->categoriesCount($user) < $this->limit('categories');
    }

    public function canCreateSet(User $user): bool
    {
        if ($this->isPro($user)) {
            return true;
        }

        return $this->setsCount($user) < $this->limit('sets');
    }

    public function canCreateCard(User $user): bool
    {
        if ($this->isPro($user)) {
            return true;
        }

        return $this->cardsCount($user) < $this->limit('cards');
    }

    public function canAddCards(User $user, int $cardsToAdd): bool
    {
        if ($this->isPro($user)) {
            return true;
        }

        return ($this->cardsCount($user) + $cardsToAdd) <= $this->limit('cards');
    }

    public function remainingSets(User $user): int
    {
        if ($this->isPro($user)) {
            return PHP_INT_MAX;
        }

        return max(0, $this->limit('sets') - $this->setsCount($user));
    }

    public function remainingCards(User $user): int
    {
        if ($this->isPro($user)) {
            return PHP_INT_MAX;
        }

        return max(0, $this->limit('cards') - $this->cardsCount($user));
    }

    public function canUseStudyMode(User $user, string $mode): bool
    {
        if ($this->isPro($user)) {
            return true;
        }

        return $mode === 'basic';
    }

    public function canGenerateImages(User $user): bool
    {
        return $this->isPro($user);
    }

    public function payload(User $user): array
    {
        $isPro = $this->isPro($user);

        return [
            'is_pro' => $isPro,

            'limits' => [
                'categories' => $this->limit('categories'),
                'sets' => $this->limit('sets'),
                'cards' => $this->limit('cards'),
            ],

            'usage' => [
                'categories' => $this->categoriesCount($user),
                'sets' => $this->setsCount($user),
                'cards' => $this->cardsCount($user),
            ],

            'remaining' => [
                'categories' => $isPro
                    ? PHP_INT_MAX
                    : max(0, $this->limit('categories') - $this->categoriesCount($user)),

                'sets' => $this->remainingSets($user),
                'cards' => $this->remainingCards($user),
            ],

            'features' => [
                'study_basic' => true,
                'study_write' => $isPro,
                'study_audio' => $isPro,
                'image_generation' => $isPro,
            ],
        ];
    }
}
