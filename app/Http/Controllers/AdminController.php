<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\CardReviewProgress;
use App\Models\StudySet;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function publicSet(Request $request, StudySet $set)
    {
        abort_unless(
            $set->visibility === 'public' || $set->public_blocked,
            404
        );

        $set->load([
            'user:id,name,nickname,email',
        ]);

        $cards = Card::query()
            ->where('study_set_id', $set->id)
            ->where('user_id', $set->user_id)
            ->latest()
            ->get();

        return response()->json([
            'set' => [
                'id' => $set->id,
                'title' => $set->title,
                'description' => $set->description,
                'visibility' => $set->visibility,
                'public_blocked' => (bool) $set->public_blocked,
                'public_blocked_at' => $set->public_blocked_at?->translatedFormat('d M Y H:i'),
                'public_block_reason' => $set->public_block_reason,
                'cards_count' => $cards->count(),
                'created_at' => $set->created_at?->translatedFormat('d M Y'),
                'updated_at' => $set->updated_at?->translatedFormat('d M Y H:i'),

                'author' => [
                    'id' => $set->user?->id,
                    'name' => $set->user?->name,
                    'nickname' => $set->user?->nickname,
                    'email' => $set->user?->email,
                ],

                'cards' => $cards->map(fn(Card $card) => [
                    'id' => $card->id,
                    'front' => $card->front,
                    'back' => $card->back,
                    'transcription' => $card->transcription,
                    'marker' => $card->marker,
                    'hint' => $card->hint,
                    'example' => $card->example,
                    'image_url' => $this->cardImageUrl($card),
                    'created_at' => $card->created_at?->translatedFormat('d M Y'),
                ]),
            ],
        ]);
    }

    public function users(Request $request)
    {
        $query = trim((string) $request->input('q', ''));

        $users = User::query()
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($builder) use ($query) {
                    $builder
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('nickname', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%");
                });
            })
            ->latest()
            ->limit(50)
            ->get();

        return response()->json([
            'users' => $users->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'nickname' => $user->nickname,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_admin' => $user->isAdmin(),
                    'is_blocked' => $user->isBlocked(),
                    'blocked_at' => $user->blocked_at?->translatedFormat('d M Y H:i'),
                    'blocked_reason' => $user->blocked_reason,
                    'created_at' => $user->created_at?->translatedFormat('d M Y'),
                    'last_login_at' => $user->last_login_at?->translatedFormat('d M Y H:i'),

                    'activity' => [
                        'sets_count' => StudySet::query()
                            ->where('user_id', $user->id)
                            ->count(),

                        'public_sets_count' => StudySet::query()
                            ->where('user_id', $user->id)
                            ->where('visibility', 'public')
                            ->count(),

                        'cards_count' => Card::query()
                            ->where('user_id', $user->id)
                            ->count(),

                        'reviews_count' => CardReviewProgress::query()
                            ->where('user_id', $user->id)
                            ->sum('reps'),
                    ],
                ];
            }),
        ]);
    }

    public function blockUser(Request $request, User $user)
    {
        abort_if(
            $user->id === $request->user()->id,
            422,
            'Нельзя заблокировать собственный аккаунт.'
        );

        abort_if(
            $user->isAdmin(),
            422,
            'Нельзя заблокировать администратора.'
        );

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update([
            'blocked_at' => now(),
            'blocked_by' => $request->user()->id,
            'blocked_reason' => $validated['reason'] ?? null,
        ]);

        StudySet::query()
            ->where('user_id', $user->id)
            ->where('visibility', 'public')
            ->update([
                'visibility' => 'private',
            ]);

        return response()->json([
            'message' => 'Пользователь заблокирован.',
        ]);
    }

    public function unblockUser(Request $request, User $user)
    {
        abort_if(
            $user->id === $request->user()->id,
            422,
            'Нельзя изменить блокировку собственного аккаунта.'
        );

        $user->update([
            'blocked_at' => null,
            'blocked_by' => null,
            'blocked_reason' => null,
        ]);

        return response()->json([
            'message' => 'Пользователь разблокирован.',
        ]);
    }

    public function publicSets(Request $request)
    {
        $query = trim((string) $request->input('q', ''));

        $sets = StudySet::query()
            ->with([
                'user:id,name,nickname,email',
            ])
            ->withCount('cards')
            ->where(function ($builder) {
                $builder
                    ->where('visibility', 'public')
                    ->orWhere('public_blocked', true);
            })
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($builder) use ($query) {
                    $builder
                        ->where('title', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%")
                        ->orWhereHas('user', function ($userQuery) use ($query) {
                            $userQuery
                                ->where('name', 'like', "%{$query}%")
                                ->orWhere('nickname', 'like', "%{$query}%")
                                ->orWhere('email', 'like', "%{$query}%");
                        });
                });
            })
            ->latest('updated_at')
            ->limit(50)
            ->get();

        return response()->json([
            'sets' => $sets->map(function (StudySet $set) {
                return [
                    'id' => $set->id,
                    'title' => $set->title,
                    'description' => $set->description,
                    'visibility' => $set->visibility,
                    'cards_count' => $set->cards_count,
                    'is_public' => $set->visibility === 'public',
                    'public_blocked' => (bool) $set->public_blocked,
                    'public_blocked_at' => $set->public_blocked_at?->translatedFormat('d M Y H:i'),
                    'public_block_reason' => $set->public_block_reason,
                    'created_at' => $set->created_at?->translatedFormat('d M Y'),
                    'updated_at' => $set->updated_at?->translatedFormat('d M Y H:i'),

                    'author' => [
                        'id' => $set->user?->id,
                        'name' => $set->user?->name,
                        'nickname' => $set->user?->nickname,
                        'email' => $set->user?->email,
                    ],
                ];
            }),
        ]);
    }

    public function blockPublicSet(Request $request, StudySet $set)
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $set->update([
            'visibility' => 'private',
            'public_blocked' => true,
            'public_blocked_at' => now(),
            'public_blocked_by' => $request->user()->id,
            'public_block_reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'message' => 'Публикация набора заблокирована.',
        ]);
    }

    public function unblockPublicSet(Request $request, StudySet $set)
    {
        $set->update([
            'public_blocked' => false,
            'public_blocked_at' => null,
            'public_blocked_by' => null,
            'public_block_reason' => null,
        ]);

        return response()->json([
            'message' => 'Публикация набора разблокирована.',
        ]);
    }

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
}
