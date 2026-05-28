<?php

namespace App\Services;

use App\Models\CardReviewProgress;
use Carbon\Carbon;

class FsrsService
{
    private const AGAIN = 'again';
    private const HARD = 'hard';
    private const GOOD = 'good';
    private const EASY = 'easy';

    public function review(CardReviewProgress $progress, string $rating, Carbon $now): array
    {
        $stabilityBefore = $progress->stability;
        $difficultyBefore = $progress->difficulty;

        $elapsedDays = $this->elapsedDays($progress, $now);

        if ($progress->reps === 0 || ! $progress->stability || ! $progress->difficulty) {
            $result = $this->firstReview($rating, $now);
        } else {
            $result = $this->nextReview($progress, $rating, $elapsedDays, $now);
        }

        $progress->fill([
            'state' => $result['state'],
            'due_at' => $result['due_at'],
            'last_reviewed_at' => $now,
            'stability' => $result['stability'],
            'difficulty' => $result['difficulty'],
            'elapsed_days' => $elapsedDays,
            'scheduled_days' => $result['scheduled_days'],
            'reps' => $progress->reps + 1,
            'lapses' => $progress->lapses + ($rating === self::AGAIN ? 1 : 0),
        ]);

        $progress->save();

        return [
            'progress' => $progress,
            'before' => [
                'stability' => $stabilityBefore,
                'difficulty' => $difficultyBefore,
            ],
            'after' => [
                'stability' => $progress->stability,
                'difficulty' => $progress->difficulty,
            ],
        ];
    }

    private function firstReview(string $rating, Carbon $now): array
    {
        return match ($rating) {
            self::AGAIN => [
                'state' => 'learning',
                'stability' => 0.4,
                'difficulty' => 8.5,
                'scheduled_days' => 0,
                'due_at' => $now->copy()->addMinutes(10),
            ],

            self::HARD => [
                'state' => 'learning',
                'stability' => 1.0,
                'difficulty' => 7.0,
                'scheduled_days' => 1,
                'due_at' => $now->copy()->addDay(),
            ],

            self::GOOD => [
                'state' => 'review',
                'stability' => 3.0,
                'difficulty' => 5.0,
                'scheduled_days' => 3,
                'due_at' => $now->copy()->addDays(3),
            ],

            self::EASY => [
                'state' => 'review',
                'stability' => 5.0,
                'difficulty' => 3.5,
                'scheduled_days' => 5,
                'due_at' => $now->copy()->addDays(5),
            ],

            default => [
                'state' => 'learning',
                'stability' => 1.0,
                'difficulty' => 5.0,
                'scheduled_days' => 1,
                'due_at' => $now->copy()->addDay(),
            ],
        };
    }

    private function nextReview(CardReviewProgress $progress, string $rating, int $elapsedDays, Carbon $now): array
    {
        $stability = max(0.1, (float) $progress->stability);
        $difficulty = min(10, max(1, (float) $progress->difficulty));

        $retrievability = $this->retrievability($elapsedDays, $stability);

        [$newStability, $newDifficulty] = match ($rating) {
            self::AGAIN => [
                max(0.3, $stability * 0.45),
                min(10, $difficulty + 1.2),
            ],

            self::HARD => [
                max(1.0, $stability * (1.05 + (1 - $retrievability) * 0.35)),
                min(10, $difficulty + 0.4),
            ],

            self::GOOD => [
                $stability * (1.45 + (1 - $difficulty / 10) * 0.65 + (1 - $retrievability) * 0.4),
                max(1, $difficulty - 0.15),
            ],

            self::EASY => [
                $stability * (2.1 + (1 - $difficulty / 10) * 1.0),
                max(1, $difficulty - 0.6),
            ],

            default => [
                $stability,
                $difficulty,
            ],
        };

        $scheduledDays = $this->scheduledDays($rating, $newStability);

        return [
            'state' => $rating === self::AGAIN ? 'relearning' : 'review',
            'stability' => round($newStability, 4),
            'difficulty' => round($newDifficulty, 4),
            'scheduled_days' => $scheduledDays,
            'due_at' => $scheduledDays === 0
                ? $now->copy()->addMinutes(10)
                : $now->copy()->addDays($scheduledDays),
        ];
    }

    private function retrievability(int $elapsedDays, float $stability): float
    {
        if ($elapsedDays <= 0) {
            return 1.0;
        }

        return pow(1 + $elapsedDays / (9 * $stability), -1);
    }

    private function scheduledDays(string $rating, float $stability): int
    {
        if ($rating === self::AGAIN) {
            return 0;
        }

        $days = match ($rating) {
            self::HARD => $stability * 0.8,
            self::GOOD => $stability,
            self::EASY => $stability * 1.35,
            default => $stability,
        };

        return max(1, (int) round($days));
    }

    private function elapsedDays(CardReviewProgress $progress, Carbon $now): int
    {
        if (! $progress->last_reviewed_at) {
            return 0;
        }

        return max(0, $progress->last_reviewed_at->diffInDays($now));
    }
}
