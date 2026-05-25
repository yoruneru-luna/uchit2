<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\StudySet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class CardController extends Controller
{
    public function checkDuplicates(Request $request)
    {
        $validated = $request->validate([
            'front' => ['required', 'string', 'max:500'],
            'back' => ['required', 'string', 'max:500'],
            'marker' => ['nullable', 'string', 'max:120'],
            'ignore_id' => ['nullable', 'integer'],
        ]);

        $front = trim($validated['front']);
        $back = trim($validated['back']);
        $marker = isset($validated['marker']) ? trim((string) $validated['marker']) : null;
        $ignoreId = $validated['ignore_id'] ?? null;

        $duplicates = Card::query()
            ->where('user_id', $request->user()->id)
            ->when($ignoreId, function ($query) use ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            })
            ->where(function ($query) use ($front, $back, $marker) {
                $query
                    ->where('front', $front)
                    ->orWhere('back', $back);

                if ($marker) {
                    $query->orWhere(function ($query) use ($front, $back, $marker) {
                        $query
                            ->where('front', $front)
                            ->where('back', $back)
                            ->where('marker', $marker);
                    });
                }
            })
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'has_duplicates' => $duplicates->isNotEmpty(),
            'duplicates' => $duplicates->map(fn(Card $card) => [
                'id' => $card->id,
                'front' => $card->front,
                'back' => $card->back,
                'marker' => $card->marker,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'study_set_id' => [
                'required',
                'integer',
                Rule::exists('study_sets', 'id')
                    ->where('user_id', $request->user()->id),
            ],
            'front' => ['required', 'string', 'max:500'],
            'back' => ['required', 'string', 'max:500'],
            'transcription' => ['nullable', 'string', 'max:120'],
            'marker' => ['nullable', 'string', 'max:120'],
            'hint' => ['nullable', 'string', 'max:180'],
            'example' => ['nullable', 'string', 'max:1000'],
            'selected_image_url' => ['nullable', 'url', 'max:1000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $studySet = StudySet::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($validated['study_set_id']);

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('cards', 'public');
        } elseif (! empty($validated['selected_image_url'])) {
            $imageResponse = Http::timeout(10)
                ->get($validated['selected_image_url']);

            if ($imageResponse->ok()) {
                $extension = pathinfo(
                    parse_url($validated['selected_image_url'], PHP_URL_PATH),
                    PATHINFO_EXTENSION
                );

                $extension = in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)
                    ? $extension
                    : 'jpg';

                $imagePath = 'cards/' . Str::uuid() . '.' . $extension;

                Storage::disk('public')->put($imagePath, $imageResponse->body());
            }
        }

        $card = Card::create([
            'study_set_id' => $studySet->id,
            'user_id' => $request->user()->id,
            'front' => trim($validated['front']),
            'back' => trim($validated['back']),
            'transcription' => isset($validated['transcription']) ? trim((string) $validated['transcription']) : null,
            'marker' => isset($validated['marker']) ? trim((string) $validated['marker']) : null,
            'hint' => isset($validated['hint']) ? trim((string) $validated['hint']) : null,
            'example' => isset($validated['example']) ? trim((string) $validated['example']) : null,
            'image_path' => $imagePath,
        ]);

        $studySet->loadCount('cards');

        return response()->json([
            'message' => 'Карточка создана',
            'card' => [
                'id' => $card->id,
                'study_set_id' => $card->study_set_id,
                'front' => $card->front,
                'back' => $card->back,
                'transcription' => $card->transcription,
                'marker' => $card->marker,
                'hint' => $card->hint,
                'example' => $card->example,
                'image_url' => $card->image_path ? Storage::url($card->image_path) : null,
            ],
            'set' => [
                'id' => $studySet->id,
                'cards_count' => $studySet->cards_count,
            ],
        ]);
    }

    public function suggestions(Request $request)
    {
        $validated = $request->validate([
            'front' => ['nullable', 'string', 'max:500'],
            'back' => ['nullable', 'string', 'max:500'],
            'language' => ['nullable', 'string', 'in:en'],
        ]);

        if (($validated['language'] ?? null) !== 'en') {
            return response()->json([
                'available' => false,
                'suggestions' => null,
            ]);
        }

        $query = trim(($validated['front'] ?? '') ?: ($validated['back'] ?? ''));

        if (mb_strlen($query) < 2) {
            return response()->json([
                'available' => false,
                'suggestions' => null,
            ]);
        }

        $dictionaryWord = Str::of($query)
            ->lower()
            ->trim()
            ->replaceMatches('/[^\pL\s-]/u', '')
            ->toString();

        $dictionaryResponse = Http::timeout(8)
            ->acceptJson()
            ->get("https://api.dictionaryapi.dev/api/v2/entries/en/" . urlencode($dictionaryWord));

        $definitions = [];
        $examples = [];
        $markers = [];
        $pronunciation = [];

        if ($dictionaryResponse->ok()) {
            $entries = $dictionaryResponse->json();

            foreach ($entries as $entryIndex => $entry) {
                foreach (($entry['phonetics'] ?? []) as $phoneticIndex => $phonetic) {
                    $text = $phonetic['text'] ?? null;
                    $audio = $phonetic['audio'] ?? null;

                    if (! $text && ! $audio) {
                        continue;
                    }

                    $audioUrl = $audio
                        ? (Str::startsWith($audio, '//') ? 'https:' . $audio : $audio)
                        : null;

                    $pronunciation[] = [
                        'id' => 'pronunciation_' . $entryIndex . '_' . $phoneticIndex,
                        'accent' => 'UK',
                        'value' => 'uk',
                        'transcription' => $text,
                        'audio_url' => $audioUrl,
                    ];
                }

                foreach (($entry['meanings'] ?? []) as $meaningIndex => $meaning) {
                    $partOfSpeech = $meaning['partOfSpeech'] ?? null;

                    if ($partOfSpeech) {
                        $markers[] = [
                            'id' => 'marker_' . $meaningIndex,
                            'text' => $partOfSpeech,
                        ];
                    }

                    foreach (($meaning['definitions'] ?? []) as $definitionIndex => $definition) {
                        if (! empty($definition['definition'])) {
                            $definitions[] = [
                                'id' => 'definition_' . $meaningIndex . '_' . $definitionIndex,
                                'text' => $definition['definition'],
                                'source' => 'Free Dictionary API',
                            ];
                        }

                        if (! empty($definition['example'])) {
                            $examples[] = [
                                'id' => 'example_' . $meaningIndex . '_' . $definitionIndex,
                                'text' => $definition['example'],
                            ];
                        }
                    }
                }
            }
        }

        $definitions = collect($definitions)->unique('text')->take(3)->values();
        $markers = collect($markers)->unique('text')->take(4)->values();
        $pronunciation = collect($pronunciation)->unique('transcription')->take(2)->values();

        $examples = collect($examples)
            ->unique('text')
            ->take(3)
            ->values();

        if ($examples->isEmpty()) {
            $examples = collect($this->generateSimpleExamples($query, $markers->pluck('text')->first()))
                ->take(3)
                ->values();
        }

        $terms = collect([
            [
                'id' => 'term_1',
                'text' => $query,
                'image_url' => null,
            ],
        ]);

        if (str_contains($query, ' ') === false) {
            $terms->push([
                'id' => 'term_2',
                'text' => $query . ' phrase',
                'image_url' => null,
            ]);
        }

        $hints = collect([
            [
                'id' => 'hint_1',
                'text' => 'Начинается на «' . mb_strtoupper(mb_substr($query, 0, 1)) . '»',
            ],
        ]);

        if ($markers->isNotEmpty()) {
            $hints->push([
                'id' => 'hint_2',
                'text' => 'Часть речи: ' . $markers->first()['text'],
            ]);
        }

        return response()->json([
            'available' => $definitions->isNotEmpty()
                || $pronunciation->isNotEmpty()
                || $terms->isNotEmpty(),
            'suggestions' => [
                'definitions' => $definitions,
                'terms' => $terms->values(),
                'pronunciation' => $pronunciation,
                'hints' => $hints->take(3)->values(),
                'markers' => $markers,
                'examples' => $examples,
            ],
        ]);
    }

    private function generateSimpleExamples(string $query, ?string $partOfSpeech = null): array
    {
        $word = trim($query);

        if ($word === '') {
            return [];
        }

        $partOfSpeech = mb_strtolower((string) $partOfSpeech);

        if ($partOfSpeech === 'verb') {
            return [
                [
                    'id' => 'example_generated_1',
                    'text' => "I {$word} every day.",
                ],
                [
                    'id' => 'example_generated_2',
                    'text' => "They often {$word} after school.",
                ],
                [
                    'id' => 'example_generated_3',
                    'text' => "Can you {$word} with me?",
                ],
            ];
        }

        if ($partOfSpeech === 'adjective') {
            return [
                [
                    'id' => 'example_generated_1',
                    'text' => "This is a {$word} idea.",
                ],
                [
                    'id' => 'example_generated_2',
                    'text' => "The room looks {$word}.",
                ],
                [
                    'id' => 'example_generated_3',
                    'text' => "It feels very {$word} today.",
                ],
            ];
        }

        if ($partOfSpeech === 'adverb') {
            return [
                [
                    'id' => 'example_generated_1',
                    'text' => "She spoke {$word}.",
                ],
                [
                    'id' => 'example_generated_2',
                    'text' => "He answered {$word}.",
                ],
                [
                    'id' => 'example_generated_3',
                    'text' => "They moved {$word} through the room.",
                ],
            ];
        }

        return [
            [
                'id' => 'example_generated_1',
                'text' => "I saw a {$word} today.",
            ],
            [
                'id' => 'example_generated_2',
                'text' => "This {$word} is important.",
            ],
            [
                'id' => 'example_generated_3',
                'text' => "Can you explain this {$word}?",
            ],
        ];
    }

    public function suggestionImage(Request $request)
    {
        $validated = $request->validate([
            'term' => ['required', 'string', 'max:120'],
        ]);

        $apiKey = config('services.pexels.api_key');

        if (! $apiKey) {
            return response()->json([
                'message' => 'Pexels API key is not configured.',
            ], 422);
        }

        $response = Http::timeout(8)
            ->withHeaders([
                'Authorization' => $apiKey,
            ])
            ->get('https://api.pexels.com/v1/search', [
                'query' => $validated['term'],
                'per_page' => 6,
                'orientation' => 'square',
            ]);

        if (! $response->ok()) {
            return response()->json([
                'message' => 'Не удалось получить изображение.',
            ], 422);
        }

        $photos = collect($response->json('photos') ?? []);

        if ($photos->isEmpty()) {
            return response()->json([
                'message' => 'Изображения не найдены.',
            ], 404);
        }

        $photo = $photos->random();

        return response()->json([
            'image_url' => data_get($photo, 'src.medium'),
            'photographer' => data_get($photo, 'photographer'),
            'source_url' => data_get($photo, 'url'),
        ]);
    }

    public function index(Request $request, StudySet $set)
    {
        abort_unless($set->user_id === $request->user()->id, 403);

        $cards = Card::query()
            ->where('study_set_id', $set->id)
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'cards' => $cards->map(fn(Card $card) => [
                'id' => $card->id,
                'front' => $card->front,
                'back' => $card->back,
                'transcription' => $card->transcription,
                'marker' => $card->marker,
                'hint' => $card->hint,
                'example' => $card->example,
                'image_url' => $card->image_path ? Storage::url($card->image_path) : null,
                'date' => $card->created_at?->translatedFormat('d M'),
            ]),
        ]);
    }

    public function show(Request $request, Card $card)
    {
        abort_unless($card->user_id === $request->user()->id, 403);

        return response()->json([
            'card' => [
                'id' => $card->id,
                'study_set_id' => $card->study_set_id,
                'front' => $card->front,
                'back' => $card->back,
                'transcription' => $card->transcription,
                'marker' => $card->marker,
                'hint' => $card->hint,
                'example' => $card->example,
                'image_url' => $card->image_path ? Storage::url($card->image_path) : null,
            ],
        ]);
    }

    public function update(Request $request, Card $card)
    {
        abort_unless($card->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'front' => ['required', 'string', 'max:500'],
            'back' => ['required', 'string', 'max:500'],
            'transcription' => ['nullable', 'string', 'max:120'],
            'marker' => ['nullable', 'string', 'max:120'],
            'hint' => ['nullable', 'string', 'max:180'],
            'example' => ['nullable', 'string', 'max:1000'],
            'selected_image_url' => ['nullable', 'url', 'max:1000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_image' => ['nullable', 'boolean'],
        ]);

        $imagePath = $card->image_path;

        if ($request->boolean('remove_image')) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }

            $imagePath = null;
        }

        if ($request->hasFile('image')) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }

            $imagePath = $request->file('image')->store('cards', 'public');
        } elseif (! empty($validated['selected_image_url'])) {
            $imageResponse = Http::timeout(10)
                ->get($validated['selected_image_url']);

            if ($imageResponse->ok()) {
                if ($imagePath) {
                    Storage::disk('public')->delete($imagePath);
                }

                $extension = pathinfo(
                    parse_url($validated['selected_image_url'], PHP_URL_PATH),
                    PATHINFO_EXTENSION
                );

                $extension = in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)
                    ? $extension
                    : 'jpg';

                $imagePath = 'cards/' . Str::uuid() . '.' . $extension;

                Storage::disk('public')->put($imagePath, $imageResponse->body());
            }
        }

        $card->update([
            'front' => trim($validated['front']),
            'back' => trim($validated['back']),
            'transcription' => ! empty($validated['transcription'])
                ? trim((string) $validated['transcription'])
                : null,
            'marker' => ! empty($validated['marker'])
                ? trim((string) $validated['marker'])
                : null,
            'hint' => ! empty($validated['hint'])
                ? trim((string) $validated['hint'])
                : null,
            'example' => ! empty($validated['example'])
                ? trim((string) $validated['example'])
                : null,
            'image_path' => $imagePath,
        ]);

        $studySet = StudySet::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($card->study_set_id);

        $studySet->loadCount('cards');

        return response()->json([
            'message' => 'Карточка обновлена',
            'card' => [
                'id' => $card->id,
                'study_set_id' => $card->study_set_id,
                'front' => $card->front,
                'back' => $card->back,
                'transcription' => $card->transcription,
                'marker' => $card->marker,
                'hint' => $card->hint,
                'example' => $card->example,
                'image_url' => $card->image_path ? Storage::url($card->image_path) : null,
            ],
            'set' => [
                'id' => $studySet->id,
                'cards_count' => $studySet->cards_count,
            ],
        ]);
    }

    public function destroy(Request $request, Card $card)
    {
        abort_unless($card->user_id === $request->user()->id, 403);

        $studySet = StudySet::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($card->study_set_id);

        if ($card->image_path) {
            Storage::disk('public')->delete($card->image_path);
        }

        $card->delete();

        $studySet->loadCount('cards');

        return response()->json([
            'message' => 'Карточка удалена',
            'card' => [
                'id' => $card->id,
            ],
            'set' => [
                'id' => $studySet->id,
                'cards_count' => $studySet->cards_count,
            ],
        ]);
    }
}
