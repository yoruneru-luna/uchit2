<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:80'],
            'sort_by' => ['nullable', 'string', Rule::in(['created_at', 'title', 'sets_count'])],
            'order' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ]);

        $search = $validated['search'] ?? '';
        $sortBy = $validated['sort_by'] ?? 'created_at';
        $order = $validated['order'] ?? 'asc';

        $categories = Category::query()
            ->where('user_id', $request->user()->id)
            ->withCount('studySets')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($sortBy === 'sets_count', function ($query) use ($order) {
                $query->orderBy('study_sets_count', $order);
            })
            ->when($sortBy !== 'sets_count', function ($query) use ($sortBy, $order) {
                $query->orderBy($sortBy, $order);
            })
            ->get();

        return response()->json([
            'categories' => $categories->map(fn(Category $category) => [
                'id' => $category->id,
                'title' => $category->title,
                'description' => $category->description,
                'color' => $category->color,
                'sets_count' => $category->study_sets_count,
                'created_at' => $category->created_at?->format('d.m.Y'),
                'date' => $category->created_at?->translatedFormat('d M'),
            ]),
        ]);
    }

    public function checkTitle(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:80'],
            'ignore_id' => ['nullable', 'integer'],
        ]);

        $query = Category::query()
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
                'max:80',
                Rule::unique('categories', 'title')
                    ->where('user_id', $request->user()->id),
            ],
            'description' => ['nullable', 'string', 'max:300'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        if (! $request->boolean('has_color')) {
            $validated['color'] = null;
        }

        $category = Category::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Категория создана',
            'category' => [
                'id' => $category->id,
                'title' => $category->title,
                'description' => $category->description,
                'color' => $category->color,
                'sets_count' => 0,
                'date' => $category->created_at?->translatedFormat('d M'),
            ],
        ]);
    }

    public function update(Request $request, Category $category)
    {
        abort_unless($category->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:80',
                Rule::unique('categories', 'title')
                    ->where('user_id', $request->user()->id)
                    ->ignore($category->id),
            ],
            'description' => ['nullable', 'string', 'max:300'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        if (! $request->boolean('has_color')) {
            $validated['color'] = null;
        }

        $category->update($validated);
        $category->loadCount('studySets');

        return response()->json([
            'message' => 'Категория обновлена',
            'category' => [
                'id' => $category->id,
                'title' => $category->title,
                'description' => $category->description,
                'color' => $category->color,
                'sets_count' => $category->study_sets_count,
                'date' => $category->created_at?->translatedFormat('d M'),
            ],
        ]);
    }

    public function destroy(Request $request, Category $category)
    {
        abort_unless($category->user_id === $request->user()->id, 403);

        $category->delete();

        return response()->json([
            'message' => 'Категория удалена',
            'id' => $category->id,
        ]);
    }
}
