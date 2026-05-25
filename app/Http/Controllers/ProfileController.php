<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
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
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
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
            'email' => trim($validated['email']),
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
}
