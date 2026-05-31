<?php

namespace App\Services;

use App\Models\Card;
use App\Models\CardReviewProgress;
use App\Models\User;

class StudyQueueService
{
    public function introduceNewCardsForToday(User $user): void
    {
        $dailyLimit = (int) ($user->daily_new_cards_limit ?? 10);

        if ($dailyLimit <= 0) {
            return;
        }

        $introducedToday = CardReviewProgress::query()
            ->where('user_id', $user->id)
            ->where('state', 'new')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $remainingLimit = max(0, $dailyLimit - $introducedToday);

        if ($remainingLimit <= 0) {
            return;
        }

        $existingProgressCardIds = CardReviewProgress::query()
            ->select('card_id')
            ->where('user_id', $user->id);

        $cards = Card::query()
            ->select('cards.*')
            ->join('study_sets', 'study_sets.id', '=', 'cards.study_set_id')
            ->where('cards.user_id', $user->id)
            ->where('study_sets.user_id', $user->id)
            ->where('study_sets.fsrs_enabled', true)
            ->whereNotIn('cards.id', $existingProgressCardIds)
            ->orderBy('study_sets.created_at')
            ->orderBy('cards.created_at')
            ->limit($remainingLimit)
            ->get();

        foreach ($cards as $card) {
            CardReviewProgress::query()->firstOrCreate(
                [
                    'user_id' => $user->id,
                    'card_id' => $card->id,
                ],
                [
                    'study_set_id' => $card->study_set_id,
                    'state' => 'new',
                    'due_at' => now(),
                    'scheduled_days' => 0,
                    'elapsed_days' => 0,
                    'reps' => 0,
                    'lapses' => 0,
                ]
            );
        }
    }
}
