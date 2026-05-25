<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\StudySet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class GlobalSearchController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
        ]);

        $query = trim($validated['q'] ?? '');
        $authorQuery = ltrim($query, '@');

        $sets = StudySet::query()
            ->where('visibility', 'public')
            ->where('user_id', '!=', $request->user()->id)
            ->with([
                'user:id,name,nickname,avatar',
            ])
            ->withCount('cards')
            ->having('cards_count', '>=', 5)
            ->when($query !== '', function ($builder) use ($query, $authorQuery) {
                $builder->where(function ($builder) use ($query, $authorQuery) {
                    $builder
                        ->where('title', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%")
                        ->orWhereHas('user', function ($userQuery) use ($query, $authorQuery) {
                            $userQuery
                                ->where('name', 'like', "%{$query}%")
                                ->orWhere('nickname', 'like', "%{$authorQuery}%");
                        });
                });
            })
            ->latest('public_updated_at')
            ->limit(20)
            ->get();

        $savedSourceIds = StudySet::query()
            ->where('user_id', $request->user()->id)
            ->whereNotNull('source_set_id')
            ->pluck('source_set_id')
            ->map(fn($id) => (int) $id)
            ->all();

        return response()->json([
            'sets' => $sets->map(fn(StudySet $set) => [
                'id' => $set->id,
                'title' => $set->title,
                'description' => $set->description,
                'language' => $set->language,
                'visibility' => $set->visibility,
                'cards_count' => $set->cards_count,
                'author' => [
                    'id' => $set->user->id,
                    'name' => $set->user->name,
                    'nickname' => $set->user->nickname,
                    'avatar_url' => $this->avatarUrl($set->user),
                ],
                'is_saved' => in_array((int) $set->id, $savedSourceIds, true),
                'date' => $set->public_updated_at?->translatedFormat('d M')
                    ?? $set->updated_at?->translatedFormat('d M'),
            ]),
        ]);
    }

    public function show(Request $request, StudySet $set)
    {
        $cardsCount = $set->cards()->count();

        abort_unless($set->visibility === 'public' && $cardsCount >= 5, 403);

        $set->load([
            'user:id,name,nickname,avatar',
            'cards' => fn($query) => $query->latest(),
        ]);

        return response()->json([
            'set' => [
                'id' => $set->id,
                'title' => $set->title,
                'description' => $set->description,
                'language' => $set->language,
                'cards_count' => $cardsCount,
                'author' => [
                    'id' => $set->user->id,
                    'name' => $set->user->name,
                    'nickname' => $set->user->nickname,
                    'avatar_url' => $this->avatarUrl($set->user),
                ],
                'cards' => $set->cards->map(fn(Card $card) => [
                    'id' => $card->id,
                    'front' => $card->front,
                    'back' => $card->back,
                    'transcription' => $card->transcription,
                    'marker' => $card->marker,
                    'hint' => $card->hint,
                    'example' => $card->example,
                    'image_url' => $card->image_path
                        ? Storage::url($card->image_path)
                        : null,
                ]),
            ],
        ]);
    }

    public function save(Request $request, StudySet $set)
    {
        abort_if($set->cards()->count() < 5, 422, 'Набор пока нельзя сохранить: в нём меньше 5 карточек.');
        abort_unless($set->visibility === 'public', 403);
        abort_if($set->user_id === $request->user()->id, 422, 'Нельзя сохранить собственный набор.');

        $alreadySaved = StudySet::query()
            ->where('user_id', $request->user()->id)
            ->where('source_set_id', $set->id)
            ->exists();

        if ($alreadySaved) {
            return response()->json([
                'message' => 'Набор уже сохранён.',
            ], 422);
        }

        $set->load('cards');

        $copy = DB::transaction(function () use ($request, $set) {
            $copy = StudySet::create([
                'user_id' => $request->user()->id,
                'source_set_id' => $set->id,
                'source_version' => $set->public_version,
                'title' => $set->title,
                'description' => $set->description,
                'category_id' => null,
                'language' => $set->language,
                'visibility' => 'private',
                'public_version' => 1,
                'public_updated_at' => null,
            ]);

            foreach ($set->cards as $card) {
                Card::create([
                    'study_set_id' => $copy->id,
                    'user_id' => $request->user()->id,
                    'front' => $card->front,
                    'back' => $card->back,
                    'transcription' => $card->transcription,
                    'marker' => $card->marker,
                    'hint' => $card->hint,
                    'example' => $card->example,
                    'image_path' => $card->image_path,
                ]);
            }

            return $copy;
        });

        $copy->loadCount('cards');

        return response()->json([
            'message' => 'Набор сохранён',
            'set' => [
                'id' => $copy->id,
                'title' => $copy->title,
                'description' => $copy->description,
                'language' => $copy->language,
                'visibility' => $copy->visibility,
                'cards_count' => $copy->cards_count,
            ],
        ]);
    }

    private function avatarUrl($user): ?string
    {
        if (! $user->avatar) {
            return null;
        }

        if (str_starts_with($user->avatar, 'http://') || str_starts_with($user->avatar, 'https://')) {
            return $user->avatar;
        }

        return Storage::url($user->avatar);
    }
}
