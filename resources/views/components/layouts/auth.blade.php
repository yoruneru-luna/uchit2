@props([
    'title' => 'Учить',
])

<x-layouts.app title="{{ $title }}" pageType="auth" mainClass="auth-page">

    <section class="auth-page__hero">
        <div class="auth-page__hero-inner">
            <x-logo as="a" href="{{ route('landing') }}" scale="2" />

            <div class="auth-page__hero-content">
                <h1 class="auth-page__title heading heading--1">
                    Учись быстрее <br>
                    с умными карточками
                </h1>

                <p class="auth-page__subtitle subtitle subtitle--1">
                    Запоминай легко, возвращайся к сложному <br>
                    и достигай своих целей
                </p>

            </div>

            <img class="auth-page__illustration-1" src="{{ asset('images/spark.svg') }}" alt=""
                role="presentation" aria-hidden="true">
            <div class="auth-page__illustration-2">
                <img src="{{ asset('images/auth-decor.svg') }}" alt="" role="presentation" aria-hidden="true">
            </div>
        </div>
    </section>

    <div class="auth-page__right">

        {{ $slot }}

    </div>

</x-layouts.app>
