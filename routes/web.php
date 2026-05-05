<?php

use Illuminate\Support\Facades\Route;

Route::get('/ui-kit', function () {
    return view('ui-kit');
})->name('ui-kit');

Route::view('/', 'pages.landing')->name('landing');

Route::middleware('auth')->group(function () {
    Route::view('/home', 'pages.home')->name('home');
});

Route::middleware('guest')->group(function () {
    Route::view('/welcome', 'pages.auth.welcome')->name('welcome');
    Route::view('/login', 'pages.auth.login')->name('login');
    Route::view('/register', 'pages.auth.register')->name('register');
});
