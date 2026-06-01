<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Ошибка 404</title>
    @vite(['resources/scss/main.scss', 'resources/js/app.js'])
    <link rel="shortcut icon" href="{{ asset('logo/logo-icon.png') }}" type="image/x-icon">
</head>

<body>
    <div class="wrapper">

        <main class="error-page">
            <section class="_container error-page__container">
                <div class="error-page__content shadow">
                    <div class="error-page__code">
                        404
                    </div>

                    <div class="error-page__main">
                        <div class="error-page__eyebrow">
                            <span class="error-page__eyebrow-dot"></span>
                            <span>Страница не найдена</span>
                        </div>

                        <h1 class="error-page__title heading heading--2">
                            Такой страницы нет
                        </h1>

                        <p class="error-page__text subtitle subtitle--1">
                            Возможно, ссылка устарела, страница была удалена или адрес введён с ошибкой.
                        </p>

                        <div class="error-page__actions">
                            <x-button as="a" href="{{ url('/') }}" variant="primary" radius="12"
                                size="lg" shadow>
                                На главную
                            </x-button>

                            <x-button as="button" type="button" radius="12" size="lg"
                                onclick="window.history.length > 1 ? window.history.back() : window.location.href='{{ url('/') }}'">
                                Назад
                            </x-button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
        
    </div>
</body>

</html>
