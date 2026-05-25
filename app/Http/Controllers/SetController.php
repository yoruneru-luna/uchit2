<?php

namespace App\Http\Controllers;

use App\Models\StudySet;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Category;

class SetController extends Controller
{
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
                'cards_count' => 0,
                'progress' => 0,
                'fading' => 0,
                'date' => $set->created_at?->translatedFormat('d M'),
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

    public function store(Request $request)
    {
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
                'language' => $set->language,
                'visibility' => $set->visibility,
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

        $set->update($validated);
        $set->load('category:id,title,color');

        return response()->json([
            'message' => 'Набор обновлён',
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
