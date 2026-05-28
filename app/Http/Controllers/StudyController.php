<?php

namespace App\Http\Controllers;

use App\Models\CardReviewProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudyController extends Controller
{
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
}
