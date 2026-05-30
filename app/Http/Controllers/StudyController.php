<?php

namespace App\Http\Controllers;

use App\Models\CardReviewProgress;
use App\Models\StudySet;
use App\Models\Card;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudyController extends Controller
{
    private function cardImageUrl(Card $card): ?string
    {
        if (! $card->image_path) {
            return null;
        }

        if (
            str_starts_with($card->image_path, 'http://') ||
            str_starts_with($card->image_path, 'https://')
        ) {
            return $card->image_path;
        }

        return Storage::url($card->image_path);
    }

    public function dueCards(Request $request)
    {
        $progressItems = CardReviewProgress::query()
            ->where('user_id', $request->user()->id)
            ->whereNotNull('due_at')
            ->where('due_at', '<=', now())
            ->with([
                'card:id,study_set_id,user_id,front,back,transcription,marker,hint,example,image_path',
                'studySet:id,title,language',
            ])
            ->orderBy('due_at')
            ->limit(50)
            ->get();

        return response()->json([
            'cards' => $progressItems
                ->filter(fn($progress) => $progress->card)
                ->map(function ($progress) {
                    $card = $progress->card;

                    return [
                        'id' => $card->id,
                        'study_set_id' => $card->study_set_id,
                        'set_title' => $progress->studySet?->title,
                        'set_language' => $progress->studySet?->language,

                        'front' => $card->front,
                        'back' => $card->back,
                        'transcription' => $card->transcription,
                        'marker' => $card->marker,
                        'hint' => $card->hint,
                        'example' => $card->example,
                        'image_url' => $card->image_path
                            ? Storage::url($card->image_path)
                            : null,

                        'due_at' => $progress->due_at?->toISOString(),
                    ];
                })
                ->values(),
        ]);
    }

    public function cards(Request $request, StudySet $set)
    {
        abort_unless($set->user_id === $request->user()->id, 403);

        $cards = Card::query()
            ->where('study_set_id', $set->id)
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        if ($cards->count() < 5) {
            return response()->json([
                'message' => 'Для начала обучения нужно минимум 5 карточек.',
                'cards' => [],
            ], 422);
        }

        return response()->json([
            'cards' => $cards->map(fn(Card $card) => [
                'id' => $card->id,
                'study_set_id' => $card->study_set_id,
                'front' => $card->front,
                'back' => $card->back,
                'transcription' => $card->transcription,
                'marker' => $card->marker,
                'hint' => $card->hint,
                'example' => $card->example,
                'image_url' => $this->cardImageUrl($card),
                'set_language' => $set->language,
            ]),
            'set' => [
                'id' => $set->id,
                'title' => $set->title,
                'language' => $set->language,
            ],
        ]);
    }
}
