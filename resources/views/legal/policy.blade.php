<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Политика конфиденциальности</title>
    @vite(['resources/scss/main.scss', 'resources/js/app.js'])
    <link rel="shortcut icon" href="{{ asset('logo/logo-icon.png') }}" type="image/x-icon">
</head>

<body>
    <div class="wrapper">

        <main class="legal-page">
            <section class="_container legal-page__container">
                <div class="legal-page__content shadow">
                    <div class="legal-page__head">
                        <h1 class="legal-page__title heading heading--2">
                            Политика конфиденциальности
                        </h1>

                        <p class="legal-page__subtitle">
                            Документ описывает, какие данные обрабатываются в веб-приложении «УЧИТЬ» и для чего они
                            используются.
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>1. Общие положения</h2>

                        <p>
                            Настоящая политика определяет порядок обработки персональных данных пользователей
                            веб-приложения
                            «УЧИТЬ».
                            Использование приложения означает ознакомление с условиями обработки данных.
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>2. Какие данные могут обрабатываться</h2>

                        <p>
                            В приложении могут обрабатываться имя пользователя, адрес электронной почты, данные профиля,
                            сведения о созданных наборах, карточках, прогрессе обучения и настройках повторений.
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>3. Цели обработки данных</h2>

                        <p>
                            Данные используются для регистрации, входа в аккаунт, сохранения учебных материалов,
                            планирования повторений, отображения прогресса и работы основных функций приложения.
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>4. Хранение и защита данных</h2>

                        <p>
                            Данные хранятся в информационной системе приложения и используются только для обеспечения
                            работы
                            сервиса.
                            Для защиты данных применяются технические и организационные меры безопасности.
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>5. Права пользователя</h2>

                        <p>
                            Пользователь может изменить данные профиля, удалить созданные материалы или обратиться с
                            запросом
                            по вопросам обработки данных.
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>6. Контакты</h2>

                        <p>
                            По вопросам работы приложения и обработки данных можно обратиться через форму связи на
                            сайте.
                        </p>
                    </div>
                </div>
            </section>
        </main>

    </div>

</body>

</html>
