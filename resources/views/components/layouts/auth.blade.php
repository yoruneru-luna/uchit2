@props([
    'header' => 'app',
    'title' => 'Учить',
])

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $title }}</title>
    @vite(['resources/scss/main.scss'])
</head>

<body>
    <x-svg-sprite />

    <div class="wrapper">

        <x-header :variant="$header" />

        <main class="auth-page">

            <section class="auth-page__hero">
                <div class="auth-page__hero-inner">
                    <x-logo as="div" scale="2" />

                    <div class="auth-page__hero-content">
                        <h2 class="auth-page__title heading heading--1">
                            Учись быстрее <br>
                            с умными карточками
                        </h2>

                        <p class="auth-page__subtitle subtitle subtitle--1">
                            Запоминай легко, возвращайся к сложному <br>
                            и достигай своих целей
                        </p>

                    </div>

                    <img class="auth-page__illustration-1" src="{{ asset('images/spark.svg') }}" alt=""
                        role="presentation" aria-hidden="true">
                    <div class="auth-page__illustration-2">
                        <img src="{{ asset('images/auth-decor.svg') }}" alt="" role="presentation"
                            aria-hidden="true">
                    </div>
                </div>
            </section>

            <div class="auth-page__right">

                {{ $slot }}

                <form class="form auth-page__form" action="#" method="POST">
                    @csrf

                    <x-form-header title="Вход"
                        subtitle="Аккаунт будет создан автоматически при первой авторизации"></x-form-header>

                    <x-button icon="yandex" icon-size="lg" variant="secondary" radius="12" size="lg"
                        type="button" class="form__button" shandow=true>
                        Войти с Яндекс
                    </x-button>

                    <div class="auth-page__divider">
                        <span>или</span>
                    </div>

                    <x-input status="success" placeholder="Введите эл. почту" name="email" shandow=true />

                    <p class="auth-page__agreement">
                        Нажимая «Продолжить» Вы принимаете положения, которые содержат
                        <a href="#">Условия предоставления услуг</a>
                        и
                        <a href="#">Политику конфиденциальности Учить</a>
                    </p>

                    <x-button class="form__button" variant="primary" radius="12" size="lg"
                        type="submit" shandow=true>
                        Продолжить
                    </x-button>

                    <x-button as="a" href="/" class="form__button" tone="ghost" radius="12"
                        size="lg">
                        Назад
                    </x-button>

                </form>
            </div>

        </main>

    </div>

</body>

</html>
