<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Условия пользования</title>
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
                            Условия пользования
                        </h1>

                        <p class="legal-page__subtitle">
                            Документ описывает основные правила использования веб-приложения «Учить».
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>1. Назначение приложения</h2>

                        <p>
                            Веб-приложение «Учить» предназначено для создания учебных карточек,
                            повторения материала и отслеживания прогресса запоминания.
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>2. Аккаунт пользователя</h2>

                        <p>
                            Для использования основных функций требуется регистрация. Пользователь отвечает за
                            сохранность
                            данных
                            для входа и корректность информации, указанной в профиле.
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>3. Учебные материалы</h2>

                        <p>
                            Пользователь самостоятельно создаёт наборы и карточки. Запрещается размещать материалы,
                            нарушающие права третьих лиц или правила использования сервиса.
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>4. Публичные наборы</h2>

                        <p>
                            При публикации набора другие пользователи могут находить и сохранять его.
                            Администратор может ограничить доступ к публичному набору при нарушении правил.
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>5. Подписка</h2>

                        <p>
                            В приложении могут быть доступны бесплатные и платные возможности.
                            Условия подписки отображаются перед её оформлением.
                        </p>
                    </div>

                    <div class="legal-page__section">
                        <h2>6. Ограничение ответственности</h2>

                        <p>
                            Приложение помогает организовать повторение материала, но результат обучения зависит от
                            регулярности
                            занятий, качества карточек и индивидуальных особенностей запоминания.
                        </p>
                    </div>
                </div>
            </section>
        </main>

    </div>

</body>

</html>
