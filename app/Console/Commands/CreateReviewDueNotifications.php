<?php

namespace App\Console\Commands;

use App\Models\CardReviewProgress;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Console\Command;

class CreateReviewDueNotifications extends Command
{
    protected $signature = 'notifications:create-review-due';

    protected $description = 'Create notifications for users with cards due for review';

    public function handle(): int
    {
        $now = now();

        User::query()
            ->select('id')
            ->chunkById(100, function ($users) use ($now) {
                foreach ($users as $user) {
                    $dueCount = CardReviewProgress::query()
                        ->where('user_id', $user->id)
                        ->whereNotNull('due_at')
                        ->where('due_at', '<=', $now)
                        ->count();

                    if ($dueCount <= 0) {
                        continue;
                    }

                    $this->createDueNotification($user->id, $dueCount, $now);
                    $this->createOverdueNotification($user->id, $now);
                }
            });

        return self::SUCCESS;
    }

    private function createDueNotification(int $userId, int $dueCount, $now): void
    {
        $alreadyExists = Notification::query()
            ->where('user_id', $userId)
            ->where('type', 'review_due')
            ->whereDate('created_for_date', $now->toDateString())
            ->exists();

        if ($alreadyExists) {
            return;
        }

        Notification::create([
            'user_id' => $userId,
            'type' => 'review_due',
            'title' => 'Пора повторять!',
            'message' => $this->message($dueCount),
            'action_text' => 'Повторить',
            'action_url' => '/home',
            'created_for_date' => $now,
            'data' => [
                'repeat_count' => $dueCount,
            ],
        ]);
    }

    private function createOverdueNotification(int $userId, $now): void
    {
        $overdueCount = CardReviewProgress::query()
            ->where('user_id', $userId)
            ->whereNotNull('due_at')
            ->where('due_at', '<=', $now->copy()->subDay())
            ->count();

        if ($overdueCount <= 0) {
            return;
        }

        $oldestDueAt = CardReviewProgress::query()
            ->where('user_id', $userId)
            ->whereNotNull('due_at')
            ->where('due_at', '<=', $now->copy()->subDay())
            ->min('due_at');

        $daysOverdue = $oldestDueAt
            ? max(1, $now->diffInDays($oldestDueAt))
            : 1;

        $level = match (true) {
            $daysOverdue >= 7 => 'week',
            $daysOverdue >= 3 => 'three_days',
            default => 'day',
        };

        $alreadyExists = Notification::query()
            ->where('user_id', $userId)
            ->where('type', 'review_overdue')
            ->whereDate('created_for_date', $now->toDateString())
            ->exists();

        if ($alreadyExists) {
            return;
        }

        Notification::create([
            'user_id' => $userId,
            'type' => 'review_overdue',
            'title' => $this->overdueTitle($level),
            'message' => $this->overdueMessage($overdueCount, $daysOverdue),
            'action_text' => 'Повторить',
            'action_url' => '/home',
            'created_for_date' => $now,
            'data' => [
                'repeat_count' => $overdueCount,
                'days_overdue' => $daysOverdue,
                'level' => $level,
            ],
        ]);
    }

    private function message(int $count): string
    {
        return "{$count} карточек на грани забывания";
    }

    private function overdueTitle(string $level): string
    {
        return match ($level) {
            'week' => 'Знания могут забыться',
            'three_days' => 'Повторение просрочено',
            default => 'Карточки ждут повторения',
        };
    }

    private function overdueMessage(int $count, int $days): string
    {
        if ($days >= 7) {
            return "{$count} карточек ждут повторения больше недели. Быстрое повторение поможет вернуть их в график.";
        }

        if ($days >= 3) {
            return "{$count} карточек ждут уже {$days} дня. Лучше повторить сейчас, пока знания не начали сильно забываться.";
        }

        return "{$count} карточек нужно было повторить ещё вчера.";
    }
}
