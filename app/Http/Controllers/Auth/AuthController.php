<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    private function makeUniqueNickname(?string $base, ?string $email = null): string
    {
        $source = trim((string) $base);

        if ($source === '' && $email) {
            $source = strstr($email, '@', true) ?: '';
        }

        $source = Str::lower($source);

        $source = preg_replace('/[^a-z0-9_.-]/', '', $source);
        $source = trim($source, '._-');

        if ($source === '') {
            $source = 'user';
        }

        $nickname = $source;
        $counter = 1;

        while (User::where('nickname', $nickname)->exists()) {
            $nickname = $source . $counter;
            $counter++;
        }

        return $nickname;
    }

    private function isExternalAvatar(?string $avatar): bool
    {
        if (! $avatar) {
            return false;
        }

        return str_starts_with($avatar, 'http://') ||
            str_starts_with($avatar, 'https://');
    }

    public function welcome()
    {
        return view('pages.auth.welcome');
    }

    public function validateEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user && $user->yandex_id && ! $user->password) {
            return response()->json([
                'status' => 'error',
                'message' => 'Этот аккаунт создан через Яндекс. Войдите через кнопку «Войти с Яндекс».',
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => null,
        ]);
    }

    public function checkEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = $validated['email'];

        session(['auth_email' => $email]);

        $user = User::where('email', $email)->first();

        if (! $user) {
            return redirect()->route('register');
        }

        if ($user->password) {
            return redirect()->route('login');
        }

        if ($user->yandex_id) {
            return back()->withErrors([
                'email' => 'Этот аккаунт создан через Яндекс. Войдите через кнопку «Войти с Яндекс».',
            ])->withInput();
        }

        return back()->withErrors([
            'email' => 'Не удалось определить способ входа.',
        ]);
    }

    public function loginForm()
    {
        if (! session()->has('auth_email')) {
            return redirect()->route('welcome');
        }

        return view('pages.auth.login', [
            'email' => session('auth_email'),
        ]);
    }

    public function login(Request $request)
    {
        $email = session('auth_email');

        if (! $email) {
            return redirect()->route('welcome');
        }

        $validated = $request->validate([
            'password' => ['required'],
        ]);

        if (! Auth::attempt([
            'email' => $email,
            'password' => $validated['password'],
        ], true)) {

            return back()
                ->withInput()
                ->withErrors([
                    'password' => 'Неверный пароль',
                ]);
        }

        $request->session()->regenerate();

        session()->forget('auth_email');

        return redirect()->route('home');
    }

    public function registerForm()
    {
        if (! session()->has('auth_email')) {
            return redirect()->route('welcome');
        }

        return view('pages.auth.register', [
            'email' => session('auth_email'),
        ]);
    }

    public function validateRegister(Request $request)
    {
        $field = $request->input('field');

        $rules = [
            'name' => ['required', 'string', 'min:2', 'max:255'],

            'nickname' => [
                'nullable',
                'string',
                'max:60',
                'regex:/^[a-zA-Z0-9_.-]+$/',
                Rule::unique('users', 'nickname'),
            ],

            'password' => ['required', 'string', 'min:8'],

            'password_confirmation' => ['required', 'same:password'],
        ];

        if (! array_key_exists($field, $rules)) {
            return response()->json([
                'message' => 'Неизвестное поле',
            ], 422);
        }

        $request->validate(
            [
                $field => $rules[$field],
            ],
            [
                'nickname.regex' => 'Только латинские буквы, цифры, точки и _',
                'nickname.unique' => 'Этот никнейм уже занят',
            ]
        );

        return response()->json([
            'status' => 'success',
        ]);
    }

    public function register(Request $request)
    {
        $email = session('auth_email');

        if (! $email) {
            return redirect()->route('welcome');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],

            'nickname' => [
                'nullable',
                'string',
                'max:60',
                'regex:/^[a-zA-Z0-9_.-]+$/',
                Rule::unique('users', 'nickname'),
            ],

            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $nickname = $this->makeUniqueNickname(
            $validated['nickname'] ?? null,
            $email
        );

        $user = User::create([
            'name' => $validated['name'],
            'nickname' => $nickname,
            'email' => $email,
            'password' => Hash::make($validated['password']),
        ]);

        Auth::login($user, true);

        session()->forget('auth_email');

        return redirect()->route('home');
    }

    public function redirectToYandex()
    {
        return Socialite::driver('yandex')->stateless()->with([
            'force_confirm' => 'true',
        ])->redirect();
    }

    public function handleYandexCallback()
    {
        $yandexUser = Socialite::driver('yandex')
            ->stateless()
            ->user();

        $email = $yandexUser->getEmail();

        if (! $email) {
            return redirect()
                ->route('welcome')
                ->withErrors([
                    'email' => 'Не удалось получить email от Яндекса',
                ]);
        }

        $name = $yandexUser->getName()
            ?? $yandexUser->getNickname()
            ?? 'Пользователь';

        $user = User::where('email', $email)->first();

        $avatar = $yandexUser->user['default_avatar_id'] ?? null;

        $avatarUrl = $avatar
            ? "https://avatars.yandex.net/get-yapic/{$avatar}/islands-200"
            : null;

        if (! $user) {
            $user = User::create([
                'email' => $email,
                'avatar' => $avatarUrl,
                'yandex_id' => $yandexUser->getId(),
                'name' => $name,
                'nickname' => $this->makeUniqueNickname(
                    $yandexUser->getNickname() ?? $name,
                    $email
                ),
                'password' => null,
            ]);
        } else {
            $updateData = [
                'yandex_id' => $yandexUser->getId(),
            ];

            if (! $user->name) {
                $updateData['name'] = $name;
            }

            if ($avatarUrl && (! $user->avatar || $this->isExternalAvatar($user->avatar))) {
                $updateData['avatar'] = $avatarUrl;
            }

            $user->update($updateData);
        }

        Auth::login($user, true);

        return redirect()->route('home');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('welcome');
    }
}
