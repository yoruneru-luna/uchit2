<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function request()
    {
        $email = session('auth_email');

        if (! $email) {
            return redirect()->route('welcome');
        }

        return view('pages.auth.forgot-password', [
            'email' => $email,
        ]);
    }

    public function email(Request $request)
    {
        $email = session('auth_email');

        if (! $email) {
            return redirect()->route('welcome');
        }

        $status = Password::sendResetLink([
            'email' => $email,
        ]);

        return $status === Password::RESET_LINK_SENT
            ? back()->with('status', 'Ссылка для восстановления отправлена')
            : back()->withErrors([
                'reset' => 'Не удалось отправить ссылку восстановления',
            ]);
    }

    public function reset(string $token)
    {
        return view('pages.auth.reset-password', [
            'token' => $token,
            'email' => request('email'),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('welcome')->with('status', 'Пароль успешно изменён')
            : back()->withInput()->withErrors([
                'email' => 'Не удалось изменить пароль',
            ]);
    }
}
