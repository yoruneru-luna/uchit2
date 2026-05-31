<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function updateLearningSettings(Request $request)
    {
        $validated = $request->validate([
            'daily_new_cards_limit' => ['required', 'integer', 'in:5,10,20,30'],
        ]);

        $request->user()->update([
            'daily_new_cards_limit' => $validated['daily_new_cards_limit'],
        ]);

        return response()->json([
            'message' => 'Настройки обучения сохранены.',
            'settings' => [
                'daily_new_cards_limit' => $request->user()->daily_new_cards_limit,
            ],
        ]);
    }

    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'nickname' => $user->nickname,
                'email' => $user->email,
                'avatar_url' => $this->avatarUrl($user),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'nickname' => [
                'required',
                'string',
                'max:60',
                'regex:/^[a-zA-Z0-9_.-]+$/',
                Rule::unique('users', 'nickname')->ignore($user->id),
            ],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_avatar' => ['nullable', 'boolean'],
        ]);

        $avatar = $user->avatar;

        if ($request->boolean('remove_avatar')) {
            if ($avatar && ! $this->isExternalAvatar($avatar)) {
                Storage::disk('public')->delete($avatar);
            }

            $avatar = null;
        }

        if ($request->hasFile('avatar')) {
            if ($avatar && ! $this->isExternalAvatar($avatar)) {
                Storage::disk('public')->delete($avatar);
            }

            $avatar = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update([
            'name' => trim($validated['name']),
            'nickname' => trim($validated['nickname']),
            'avatar' => $avatar,
        ]);

        return response()->json([
            'message' => 'Профиль обновлён',
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'nickname' => $user->nickname,
                'email' => $user->email,
                'avatar_url' => $this->avatarUrl($user),
            ],
        ]);
    }

    private function avatarUrl($user): ?string
    {
        if (! $user->avatar) {
            return null;
        }

        if ($this->isExternalAvatar($user->avatar)) {
            return $user->avatar;
        }

        return Storage::url($user->avatar);
    }

    private function isExternalAvatar(string $avatar): bool
    {
        return str_starts_with($avatar, 'http://') || str_starts_with($avatar, 'https://');
    }

    public function destroy(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Пользователь не найден.',
            ], 401);
        }

        $userId = $user->id;
        $avatar = $user->avatar;

        DB::transaction(function () use ($userId, $avatar) {
            if ($avatar && ! $this->isExternalAvatar($avatar)) {
                Storage::disk('public')->delete($avatar);
            }

            DB::table('users')
                ->where('id', $userId)
                ->delete();
        });

        $existsAfterDelete = DB::table('users')
            ->where('id', $userId)
            ->exists();

        if ($existsAfterDelete) {
            return response()->json([
                'message' => 'Аккаунт не удалился из базы данных.',
                'user_id' => $userId,
            ], 500);
        }

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Аккаунт удалён',
            'redirect' => route('welcome'),
        ]);
    }
}
