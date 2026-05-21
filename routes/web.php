<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SetController;
use App\Http\Controllers\CardController;
use Illuminate\Support\Facades\Password;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

Route::get('/ui-kit', function () {
    return view('ui-kit');
})->name('ui-kit');

Route::middleware('guest')->group(function () {
    Route::get('/welcome', [AuthController::class, 'welcome'])->name('welcome');
    Route::post('/welcome/validate-email', [AuthController::class, 'validateEmail'])
        ->name('welcome.validate-email');
    Route::post('/welcome', [AuthController::class, 'checkEmail'])->name('welcome.check');

    Route::get('/login', [AuthController::class, 'loginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');

    Route::get('/register', [AuthController::class, 'registerForm'])->name('register');
    Route::post('/register/validate', [AuthController::class, 'validateRegister'])
        ->name('register.validate');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');

    Route::get('/auth/yandex/redirect', [AuthController::class, 'redirectToYandex'])->name('auth.yandex.redirect');
    Route::get('/auth/yandex/callback', [AuthController::class, 'handleYandexCallback'])->name('auth.yandex.callback');

    Route::get('/forgot-password', [PasswordResetController::class, 'request'])
        ->name('password.request');

    Route::post('/forgot-password', [PasswordResetController::class, 'email'])
        ->name('password.email');

    Route::get('/reset-password/{token}', [PasswordResetController::class, 'reset'])
        ->name('password.reset');

    Route::post('/reset-password', [PasswordResetController::class, 'update'])
        ->name('password.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/home', fn() => view('pages.home'))->name('home');

    Route::get('/categories', [CategoryController::class, 'index'])
        ->name('categories.index');
    Route::get('/categories/check-title', [CategoryController::class, 'checkTitle'])
        ->name('categories.check-title');
    Route::post('/categories', [CategoryController::class, 'store'])
        ->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])
        ->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
        ->name('categories.destroy');

    Route::post('/sets', [SetController::class, 'store'])->name('sets.store');
    // Route::post('/sets/{set}/cards', [CardController::class, 'store'])->name('sets.cards.store');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

Route::redirect('/', '/welcome');
