<?php

namespace App\Http\Controllers;

use App\Models\StudySet;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Category;
use App\Models\Card;
use App\Models\CardReviewProgress;
use App\Services\SubscriptionAccessService;

class SetController extends Controller
{
    private function learningProgressForSet(int $setId, int $userId): array
    {
        $total = Card::query()
            ->where('user_id', $userId)
            ->where('study_set_id', $setId)
            ->count();

        if ($total <= 0) {
            return [
                'total' => 0,
                'learned' => 0,
                'remaining' => 0,
                'learned_percent' => 0,
                'remaining_percent' => 0,
            ];
        }

        $learned = CardReviewProgress::query()
            ->where('user_id', $userId)
            ->where('study_set_id', $setId)
            ->where('state', 'review')
            ->where('scheduled_days', '>=', 365)
            ->where(function ($query) {
                $query
                    ->whereNull('due_at')
                    ->orWhere('due_at', '>', now());
            })
            ->count();

        $learnedPercent = (int) round(($learned / $total) * 100);
        $remainingPercent = max(0, 100 - $learnedPercent);

        return [
            'total' => $total,
            'learned' => $learned,
            'remaining' => max(0, $total - $learned),
            'learned_percent' => $learnedPercent,
            'remaining_percent' => $remainingPercent,
        ];
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'sort_by' => ['nullable', 'string', Rule::in([
                'created_at',
                'title',
                'cards_count',
                'progress',
            ])],
            'order' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'category_id' => ['nullable', 'integer'],
        ]);

        $search = $validated['search'] ?? '';
        $sortBy = $validated['sort_by'] ?? 'created_at';
        $order = $validated['order'] ?? 'desc';
        $categoryId = $validated['category_id'] ?? null;

        $sets = StudySet::query()
            ->where('user_id', $request->user()->id)
            ->with('category:id,title,color')
            ->with('sourceSet:id,public_version,public_updated_at')
            ->withCount('cards')
            ->when($categoryId, function ($query) use ($categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($sortBy === 'title', function ($query) use ($order) {
                $query->orderBy('title', $order);
            })
            ->when($sortBy === 'created_at', function ($query) use ($order) {
                $query->orderBy('created_at', $order);
            })
            ->when(in_array($sortBy, ['cards_count', 'progress']), function ($query) use ($order) {
                $query->orderBy('created_at', $order);
            })
            ->get();

        return response()->json([
            'sets' => $sets->map(fn(StudySet $set) => [
                'id' => $set->id,
                'title' => $set->title,
                'description' => $set->description,
                'category_id' => $set->category_id,
                'category' => $set->category ? [
                    'id' => $set->category->id,
                    'title' => $set->category->title,
                    'color' => $set->category->color,
                ] : null,
                'language' => $set->language,
                'visibility' => $set->visibility,

                'public_blocked' => (bool) $set->public_blocked,
                'public_block_reason' => $set->public_block_reason,

                'source' => $set->sourceSet ? [
                    'id' => $set->sourceSet->id,
                    'public_version' => $set->sourceSet->public_version,
                    'public_updated_at' => $set->sourceSet->public_updated_at?->translatedFormat('d M'),
                ] : null,

                'has_source_updates' => $set->sourceSet
                    ? $set->source_version < $set->sourceSet->public_version
                    : false,

                'cards_count' => $set->cards_count,
                'progress' => 0,
                'fading' => 0,
                'date' => $set->created_at?->translatedFormat('d M'),

                'learning_progress' => $this->learningProgressForSet(
                    $set->id,
                    $request->user()->id
                ),
            ]),
        ]);
    }

    public function createData(Request $request)
    {
        $categories = Category::query()
            ->where('user_id', $request->user()->id)
            ->orderBy('title')
            ->get(['id', 'title', 'color']);

        return response()->json([
            'categories' => $categories->map(fn(Category $category) => [
                'id' => $category->id,
                'title' => $category->title,
                'color' => $category->color,
            ]),
        ]);
    }

    public function checkTitle(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'ignore_id' => ['nullable', 'integer'],
        ]);

        $query = StudySet::query()
            ->where('user_id', $request->user()->id)
            ->where('title', $validated['title']);

        if (! empty($validated['ignore_id'])) {
            $query->where('id', '!=', $validated['ignore_id']);
        }

        return response()->json([
            'available' => ! $query->exists(),
        ]);
    }

    public function store(Request $request, SubscriptionAccessService $subscription)
    {
        if (! $subscription->canCreateSet($request->user())) {
            return response()->json([
                'message' => 'На бесплатном тарифе можно создать до '
                    . $subscription->limit('sets')
                    . ' наборов. Подключите PRO, чтобы убрать ограничение.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:120',
                Rule::unique('study_sets', 'title')
                    ->where('user_id', $request->user()->id),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')
                    ->where('user_id', $request->user()->id),
            ],
            'language' => ['nullable', 'string', 'in:en'],
            'visibility' => ['required', 'string', 'in:private,public'],
        ]);

        $set = StudySet::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Набор создан',
            'set' => [
                'id' => $set->id,
                'title' => $set->title,
                'description' => $set->description,
                'category_id' => $set->category_id,
                'category' => $set->category ? [
                    'id' => $set->category->id,
                    'title' => $set->category->title,
                    'color' => $set->category->color,
                ] : null,
                'language' => $set->language,
                'visibility' => $set->visibility,
                'cards_count' => 0,
                'progress' => 0,
                'fading' => 0,
                'date' => $set->created_at?->translatedFormat('d M'),
                'source' => null,
                'has_source_updates' => false,
            ],
        ]);
    }

    public function update(Request $request, StudySet $set)
    {
        abort_unless($set->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:120',
                Rule::unique('study_sets', 'title')
                    ->where('user_id', $request->user()->id)
                    ->ignore($set->id),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')
                    ->where('user_id', $request->user()->id),
            ],
            'language' => ['nullable', 'string', 'in:en'],
            'visibility' => ['required', 'string', 'in:private,public'],
        ]);

        $wasPublicBlocked = (bool) $set->public_blocked;
        $requestedVisibility = $validated['visibility'];

        if ($wasPublicBlocked) {
            $validated['visibility'] = 'private';

            unset($validated['public_version']);
            unset($validated['public_updated_at']);
        } elseif ($requestedVisibility === 'public') {
            $validated['public_version'] = ((int) $set->public_version) + 1;
            $validated['public_updated_at'] = now();
        }

        $set->update($validated);

        if ($wasPublicBlocked && $set->visibility !== 'private') {
            $set->forceFill([
                'visibility' => 'private',
            ])->save();
        }

        $set->load('category:id,title,color');

        return response()->json([
            'message' => $wasPublicBlocked
                ? 'Набор обновлён. Публикация заблокирована администратором, поэтому набор остался личным.'
                : 'Набор обновлён',

            'code' => $wasPublicBlocked ? 'public_blocked' : null,

            'set' => [
                'id' => $set->id,
                'title' => $set->title,
                'description' => $set->description,
                'category_id' => $set->category_id,
                'category' => $set->category ? [
                    'id' => $set->category->id,
                    'title' => $set->category->title,
                    'color' => $set->category->color,
                ] : null,
                'language' => $set->language,
                'visibility' => $set->visibility,

                'public_blocked' => (bool) $set->public_blocked,
                'public_block_reason' => $set->public_block_reason,

                'cards_count' => 0,
                'progress' => 0,
                'fading' => 0,
                'date' => $set->created_at?->translatedFormat('d M'),
            ],
        ]);
    }

    public function destroy(Request $request, StudySet $set)
    {
        abort_unless($set->user_id === $request->user()->id, 403);

        $setTitle = $set->title;

        $set->delete();

        return response()->json([
            'message' => 'Набор удалён',
            'set' => [
                'id' => $set->id,
                'title' => $setTitle,
            ],
        ]);
    }
}
