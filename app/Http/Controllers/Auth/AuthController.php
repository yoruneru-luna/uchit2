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
    private function makeUniqueNickname(?string $base): string
    {
        $base = Str::slug($base ?: 'user');

        if ($base === '') {
            $base = 'user';
        }

        $nickname = $base;
        $i = 1;

        while (User::where('nickname', $nickname)->exists()) {
            $nickname = $base . $i;
            $i++;
        }

        return $nickname;
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
                'required',
                'string',
                'min:3',
                'max:20',
                'unique:users,nickname',
                'regex:/^[a-zA-Z0-9._]+$/',
            ],

            'birthday' => ['nullable', 'date', 'before:today'],

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
                'required',
                'string',
                'min:3',
                'max:20',
                'unique:users,nickname',
                'regex:/^[a-zA-Z0-9._]+$/',
            ],

            'birthday' => ['nullable', 'date', 'before:today'],

            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'nickname' => mb_strtolower($validated['nickname']),
            'email' => $email,
            'birthday' => $validated['birthday'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        Auth::login($user, true);

        session()->forget('auth_email');

        return redirect()->route('home');
    }

    public function redirectToYandex()
    {
        return Socialite::driver('yandex')->stateless()->redirect();
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

        if (! $user) {

            $user = User::create([
                'email' => $email,

                'yandex_id' => $yandexUser->getId(),

                'name' => $name,

                'nickname' => $this->makeUniqueNickname(
                    $yandexUser->getNickname() ?? $name
                ),

                'password' => null,
            ]);
        } else {

            $user->update([
                'yandex_id' => $yandexUser->getId(),
            ]);
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
