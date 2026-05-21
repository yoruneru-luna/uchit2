<?php

namespace App\Http\Controllers;

use App\Models\StudySet;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SetController extends Controller
{
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
            'accent' => ['nullable', 'required_if:language,en', 'string', 'in:uk,us'],
            'visibility' => ['required', 'string', 'in:private,public'],
        ]);

        if (($validated['language'] ?? null) !== 'en') {
            $validated['accent'] = null;
        }

        $set = StudySet::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Набор создан',
            'set' => [
                'id' => $set->id,
                'title' => $set->title,
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
            'accent' => ['nullable', 'required_if:language,en', 'string', 'in:uk,us'],
            'visibility' => ['required', 'string', 'in:private,public'],
        ]);

        if (($validated['language'] ?? null) !== 'en') {
            $validated['accent'] = null;
        }

        $set->update($validated);

        return response()->json([
            'message' => 'Набор обновлён',
            'set' => [
                'id' => $set->id,
                'title' => $set->title,
            ],
        ]);
    }
}
