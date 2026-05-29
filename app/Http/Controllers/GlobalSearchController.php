<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Notification;
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
        $userId = $request->user()->id;

        $savedCopies = StudySet::query()
            ->where('user_id', $userId)
            ->whereNotNull('source_set_id')
            ->get([
                'id',
                'source_set_id',
                'source_version',
            ])
            ->keyBy(function (StudySet $copy) {
                return (int) $copy->source_set_id;
            });

        $sets = StudySet::query()
            ->where('visibility', 'public')
            ->where('user_id', '!=', $userId)
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

        return response()->json([
            'sets' => $sets->map(function (StudySet $set) use ($savedCopies) {
                $savedCopy = $savedCopies->get((int) $set->id);

                $publicVersion = (int) ($set->public_version ?? 1);
                $savedVersion = (int) ($savedCopy?->source_version ?? 0);

                return [
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

                    'is_saved' => (bool) $savedCopy,

                    'has_source_updates' => $savedCopy
                        ? $publicVersion > $savedVersion
                        : false,

                    'date' => $set->public_updated_at?->translatedFormat('d M')
                        ?? $set->updated_at?->translatedFormat('d M'),
                ];
            }),
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

        $savedCopy = StudySet::query()
            ->where('user_id', $request->user()->id)
            ->where('source_set_id', $set->id)
            ->first([
                'id',
                'source_set_id',
                'source_version',
            ]);

        $publicVersion = (int) ($set->public_version ?? 1);
        $savedVersion = (int) ($savedCopy?->source_version ?? 0);

        return response()->json([
            'set' => [
                'id' => $set->id,
                'title' => $set->title,
                'description' => $set->description,
                'language' => $set->language,
                'cards_count' => $cardsCount,

                'is_saved' => (bool) $savedCopy,

                'has_source_updates' => $savedCopy
                    ? $publicVersion > $savedVersion
                    : false,

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
                    'image_url' => $this->cardImageUrl($card),
                ]),
            ],
        ]);
    }

    public function save(Request $request, StudySet $set)
    {
        abort_if(
            $set->cards()->count() < 5,
            422,
            'Набор пока нельзя сохранить: в нём меньше 5 карточек.'
        );

        abort_unless($set->visibility === 'public', 403);

        abort_if(
            $set->user_id === $request->user()->id,
            422,
            'Нельзя сохранить собственный набор.'
        );

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

        $sourceVersion = (int) ($set->public_version ?? 1);

        $copy = DB::transaction(function () use ($request, $set, $sourceVersion) {
            $copy = StudySet::create([
                'user_id' => $request->user()->id,
                'source_set_id' => $set->id,
                'source_version' => $sourceVersion,
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

        if ($set->user_id !== $request->user()->id) {
            $savedCount = StudySet::query()
                ->where('source_set_id', $set->id)
                ->count();

            $notification = Notification::query()
                ->where('user_id', $set->user_id)
                ->where('type', 'set_saved')
                ->whereNull('read_at')
                ->where('data->set_id', $set->id)
                ->first();

            $payload = [
                'title' => $savedCount > 1
                    ? 'Ваш набор сохраняют'
                    : 'Ваш набор сохранили',

                'message' => $savedCount > 1
                    ? "Набор «{$set->title}» уже сохранили {$savedCount} раз."
                    : "Набор «{$set->title}» сохранил другой пользователь.",

                'action_text' => 'Посмотреть',
                'action_url' => '/home',

                'data' => [
                    'set_id' => $set->id,
                    'set_title' => $set->title,
                    'saved_count' => $savedCount,
                ],
            ];

            if ($notification) {
                $notification->update($payload);
            } else {
                Notification::create([
                    'user_id' => $set->user_id,
                    'type' => 'set_saved',
                    ...$payload,
                ]);
            }
        }

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

        if ($this->isExternalUrl($user->avatar)) {
            return $user->avatar;
        }

        return Storage::url($user->avatar);
    }

    private function cardImageUrl(Card $card): ?string
    {
        if (! $card->image_path) {
            return null;
        }

        if ($this->isExternalUrl($card->image_path)) {
            return $card->image_path;
        }

        return Storage::url($card->image_path);
    }

    private function isExternalUrl(string $url): bool
    {
        return str_starts_with($url, 'http://') ||
            str_starts_with($url, 'https://');
    }
}
