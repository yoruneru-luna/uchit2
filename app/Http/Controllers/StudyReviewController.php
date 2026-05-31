<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\CardReviewLog;
use App\Models\CardReviewProgress;
use App\Models\StudySet;
use App\Services\FsrsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StudyReviewController extends Controller
{
    public function store(Request $request, FsrsService $fsrs)
    {
        $validated = $request->validate([
            'card_id' => ['required', 'integer', 'exists:cards,id'],
            'study_set_id' => ['required', 'integer', 'exists:study_sets,id'],
            'mode' => ['required', 'string', Rule::in(['basic', 'write', 'audio', 'match'])],
            'rating' => ['required', 'string', Rule::in(['again', 'hard', 'good', 'easy'])],
            'use_fsrs' => ['nullable', 'boolean'],
        ]);

        if ($request->has('use_fsrs') && ! $request->boolean('use_fsrs')) {
            return response()->json([
                'message' => 'Результат не учтён в повторениях.',
                'skipped' => true,
            ]);
        }

        $set = StudySet::query()
            ->where('id', $validated['study_set_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (! $set->fsrs_enabled) {
            return response()->json([
                'message' => 'Для этого набора расписание повторений выключено.',
                'code' => 'fsrs_disabled',
            ], 422);
        }

        $card = Card::query()
            ->where('id', $validated['card_id'])
            ->where('study_set_id', $set->id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $now = Carbon::now();

        $progress = CardReviewProgress::query()->firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'card_id' => $card->id,
            ],
            [
                'study_set_id' => $card->study_set_id,
                'state' => 'new',
                'due_at' => $now,
            ]
        );

        $result = $fsrs->review(
            $progress,
            $validated['rating'],
            $now,
            (float) ($set->fsrs_goal ?? 0.90)
        );

        CardReviewLog::create([
            'user_id' => $request->user()->id,
            'study_set_id' => $card->study_set_id,
            'card_id' => $card->id,
            'mode' => $validated['mode'],
            'rating' => $validated['rating'],
            'stability_before' => $result['before']['stability'],
            'difficulty_before' => $result['before']['difficulty'],
            'stability_after' => $result['after']['stability'],
            'difficulty_after' => $result['after']['difficulty'],
            'reviewed_at' => $now,
            'next_due_at' => $progress->due_at,
        ]);

        return response()->json([
            'message' => 'Ответ сохранён.',
            'progress' => [
                'card_id' => $progress->card_id,
                'state' => $progress->state,
                'due_at' => $progress->due_at?->toISOString(),
                'stability' => $progress->stability,
                'difficulty' => $progress->difficulty,
                'reps' => $progress->reps,
                'lapses' => $progress->lapses,
                'scheduled_days' => $progress->scheduled_days,
            ],
        ]);
    }
}
