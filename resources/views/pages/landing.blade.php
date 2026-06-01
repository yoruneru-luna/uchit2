<x-layouts.app title="УЧИТЬ - веб-приложение" pageType="landing" mainClass="landing">

    <div class="_container landing__block" data-landing data-landing-step="hero">
        <div class="landing__content">
            <x-logo scale="2" variant="dark" class="landing__logo"></x-logo>

            <div class="landing__eyebrow">
                <span class="landing__eyebrow-dot"></span>
                <span>Эффективно</span>
            </div>

            <h1 class="landing__title heading heading--1">
                Учись быстрее с алгоритмом FSRS
            </h1>

            <p class="subtitle subtitle--1">
                Повторяйте не наугад, а в момент, когда это действительно нужно:
                <br>
                FSRS помогает закрепить важную
                информацию и сохранить её в памяти надолго.
            </p>

            <div class="landing__buttons">
                <x-button as="a" href="{{ route('welcome') }}" variant="primary" radius="12" size="lg"
                    shadow>
                    Начать бесплатно
                </x-button>

                <x-button as="a" href="#how-it-works" radius="12" size="lg">
                    Как работает
                </x-button>
            </div>

            {{-- <ul class="landing__features" aria-label="Преимущества">
                <li class="landing__feature">
                    <span class="landing__feature-icon">✓</span>
                    Умные интервалы
                </li>

                <li class="landing__feature">
                    <span class="landing__feature-icon">✓</span>
                    3 режима обучения
                </li>

                <li class="landing__feature">
                    <span class="landing__feature-icon">✓</span>
                    Прогресс по наборам
                </li>
            </ul> --}}
        </div>

        <div class="landing__visual" data-landing-visual>
            <div class="landing__orbit landing__orbit--inner" aria-hidden="true"></div>
            <div class="landing__orbit landing__orbit--outer" aria-hidden="true"></div>

            <div class="landing__callout landing__callout--fsrs">
                <span class="landing__callout-title">FSRS</span>
                <span class="landing__callout-text">подбирает эффективный момент повторения</span>
            </div>

            <div class="landing__callout landing__callout--progress">
                <span class="landing__callout-title">68%</span>
                <span class="landing__callout-text">закреплено</span>
            </div>

            <div class="landing__callout landing__callout--grade">
                <span class="landing__callout-title">Оценка</span>
                <span class="landing__callout-text">влияет на следующий интервал</span>
            </div>

            <article class="landing-phone shadow" data-story-phone="hero">
                <div class="landing-phone__top">
                    <span class="landing-phone__time">9:41</span>

                    <div class="landing-phone__status" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <div class="landing-phone__screen">
                    <div class="landing-repeat-card shadow" data-landing-highlight="fsrs">
                        <div class="landing-repeat-card__header">
                            <x-icon id="bell-ring" size="xl"
                                class="landing-repeat-card__icon landing-repeat-card__icon--ringing" />

                            <div class="landing-repeat-card__content">
                                <h2 class="landing-repeat-card__title">
                                    Пора повторять!
                                </h2>

                                <p class="landing-repeat-card__subtitle">
                                    6 карточек ждут
                                </p>
                            </div>
                        </div>

                        <x-button class="landing-repeat-card__button" as="button" type="button" variant="primary"
                            radius="12" size="sm" icon-after="arrow" icon-size="sm">
                            Повторить
                        </x-button>
                    </div>

                    <div class="landing-study-card" data-landing-highlight="card">
                        <div class="landing-study-card__head">
                            <span>Английский</span>
                            <span class="landing-study-card__mode">Базовый режим</span>
                        </div>

                        <div class="landing-study-card__body">
                            <strong>Epiphany</strong>
                            <span>[ˌserənˈdɪpɪti]</span>
                            <p>Озарение</p>
                        </div>

                        <div class="landing-study-card__next">
                            <span>Следующее повторение</span>
                            <strong>через 3 дня</strong>
                        </div>
                    </div>

                    <div class="landing-rating" data-landing-highlight="rating">
                        <span class="landing-rating__title">
                            Насколько легко вспомнилось?
                        </span>

                        <div class="landing-rating__grid">
                            <span class="landing-rating__item landing-rating__item--again">Забыл</span>
                            <span class="landing-rating__item landing-rating__item--hard">Сложно</span>
                            <span class="landing-rating__item landing-rating__item--good">Нормально</span>
                            <span class="landing-rating__item landing-rating__item--easy">Легко</span>
                        </div>
                    </div>

                    <div class="landing-progress-card shadow" data-landing-highlight="progress">
                        <h2 class="landing-progress-card__title">
                            Прогресс
                        </h2>

                        <div class="landing-progress-card__bar">
                            <span class="landing-progress-card__segment landing-progress-card__segment--fading"
                                style="width: 2%;">
                                <span
                                    class="landing-progress-card__legend landing-progress-card__legend--fading landing-progress-card__legend--left">
                                    2% забывается
                                </span>
                            </span>

                            <span class="landing-progress-card__segment landing-progress-card__segment--learned"
                                style="width: 68%;">
                                <span
                                    class="landing-progress-card__legend landing-progress-card__legend--learned landing-progress-card__legend--top">
                                    68% закреплено
                                </span>
                            </span>

                            <span class="landing-progress-card__segment landing-progress-card__segment--process"
                                style="width: 19%;">
                                <span class="landing-progress-card__legend landing-progress-card__legend--process">
                                    19% в процессе
                                </span>
                            </span>

                            <span class="landing-progress-card__segment landing-progress-card__segment--new"
                                style="width: 11%;">
                                <span
                                    class="landing-progress-card__legend landing-progress-card__legend--new landing-progress-card__legend--right landing-progress-card__legend--top">
                                    11% новые
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    </div>

    <div class="_container landing__block landing__block--fsrs" id="how-it-works" data-landing-step="fsrs">
        <div class="landing__content landing__content--fsrs">
            <div class="landing__eyebrow">
                <span class="landing__eyebrow-dot"></span>
                <span>Как работает</span>
            </div>

            <h2 class="landing__title heading heading--2">
                {{-- FSRS — Free Spaced Repetition Scheduler --}}
                FSRS помогает закреплять знания в долговременной памяти
            </h2>

            <p class="landing__text">
                <span>
                    Без алгоритма пользователь должен вручную помнить, когда вернуться
                    к материалу
                </span>
                <span>
                    Это быстро превращается в хаос: карточки забываются, повторения пропускаются, знания не
                    закрепляются надолго
                </span>
            </p>

            <div class="landing-fsrs-note shadow">
                FSRS оценивает, как быстро снижается вероятность вспомнить карточку, и назначает повторение на
                подходящий момент. Благодаря этому информация закрепляется эффективнее, без лишней зубрёжки и
                перегрузки.
            </div>
        </div>

        <div class="landing__visual landing__visual--fsrs">
            <article class="landing-phone shadow" data-story-phone="fsrs">
                <div class="landing-phone__top">
                    <span>9:41</span>

                    <div class="landing-phone__status" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <div class="landing-phone__screen landing-phone__screen--fsrs">
                    <div class="landing-phone-flow">
                        <article class="landing-phone-flow__card landing-phone-flow__card--goal shadow">
                            <span class="landing-phone-flow__step">
                                01
                            </span>

                            <div class="landing-phone-flow__head">
                                Выберите цель
                            </div>

                            <p class="landing-phone-flow__text">
                                чем строже цель, тем чаще карточки будут попадать на повторение.
                            </p>
                        </article>

                        <article class="landing-phone-flow__card landing-phone-flow__card--rate shadow">
                            <span class="landing-phone-flow__step">
                                02
                            </span>

                            <div class="landing-phone-flow__head">
                                Повторите карточку
                            </div>

                            <p class="landing-phone-flow__text">
                                оцените как легко её вспомнили
                            </p>
                        </article>

                        <article class="landing-phone-flow__card landing-phone-flow__card--calc shadow">
                            <span class="landing-phone-flow__step">
                                03
                            </span>

                            <div class="landing-phone-flow__head">
                                FSRS рассчитывает
                            </div>

                            <p class="landing-phone-flow__text">
                                когда карточку нужно
                                повторить снова,
                            </p>
                        </article>

                        <article class="landing-phone-flow__card landing-phone-flow__card--result shadow">
                            <span class="landing-phone-flow__step">
                                04
                            </span>

                            <div class="landing-phone-flow__head">
                                Карточка переходит
                            </div>

                            <p class="landing-phone-flow__text">
                                в долговременную память
                            </p>
                        </article>

                        <article class="landing-phone-flow__card landing-phone-flow__card--result shadow">
                            <p>
                                Теперь вы её <br> не забудите!
                            </p>

                            <p style="font-size: 48px">
                                🎉
                            </p>
                        </article>
                    </div>
                </div>
            </article>
        </div>
    </div>

    <div class="_container landing__block landing__block--features" id="features" data-landing-step="features">
        <div class="landing__head landing__head--features">
            <div class="landing__eyebrow">
                <span class="landing__eyebrow-dot"></span>
                <span>Возможности</span>
            </div>

            <h2 class="landing__subtitle heading heading--2">
                Создание карточек, подсказки и обучение — в одном живом интерфейсе
            </h2>

            <p class="landing__text landing__text--center subtitle subtitle--1">
                Приложение помогает не только учить по FSRS, но и быстрее создавать карточки,
                подбирать определения, изображения и выбирать удобный режим обучения.
            </p>
        </div>

        <div class="landing-features-showcase">
            <div class="landing-features-showcase__glow landing-features-showcase__glow--1"></div>
            <div class="landing-features-showcase__glow landing-features-showcase__glow--2"></div>
            <div class="landing-features-showcase__glow landing-features-showcase__glow--3"></div>

            <div class="landing-features-showcase__ring landing-features-showcase__ring--1">
                <span class="landing-features-showcase__orbit-ball landing-features-showcase__orbit-ball--1"></span>
            </div>

            <div class="landing-features-showcase__ring landing-features-showcase__ring--2">
                <span class="landing-features-showcase__orbit-ball landing-features-showcase__orbit-ball--2"></span>
            </div>

            <div class="landing-features-showcase__ring landing-features-showcase__ring--3">
                <span class="landing-features-showcase__orbit-ball landing-features-showcase__orbit-ball--3"></span>
            </div>

            <span class="landing-features-showcase__spark landing-features-showcase__spark--1"></span>
            <span class="landing-features-showcase__spark landing-features-showcase__spark--2"></span>
            <span class="landing-features-showcase__spark landing-features-showcase__spark--3"></span>

            <span class="landing-features-showcase__dot landing-features-showcase__dot--1"></span>
            <span class="landing-features-showcase__dot landing-features-showcase__dot--2"></span>
            <span class="landing-features-showcase__dot landing-features-showcase__dot--3"></span>

            <div class="landing-features-showcase__layer landing-features-showcase__layer--1">
                <article class="landing-feature-pill shadow">
                    <span class="landing-feature-pill__badge">AI</span>

                    <div class="landing-feature-pill__content">
                        <strong>Умные подсказки</strong>
                        <p>Определения, примеры и варианты заполнения появляются быстрее</p>
                    </div>
                </article>
            </div>

            <div class="landing-features-showcase__layer landing-features-showcase__layer--2">
                <article class="landing-feature-pill shadow">
                    <span class="landing-feature-pill__badge">IMG</span>

                    <div class="landing-feature-pill__content">
                        <strong>Картинки</strong>
                        <p>Визуальные ассоциации помогают запоминать материал легче</p>
                    </div>
                </article>
            </div>

            <div class="landing-features-showcase__layer landing-features-showcase__layer--3">
                <article class="landing-feature-pill shadow">
                    <span class="landing-feature-pill__badge">UK</span>

                    <div class="landing-feature-pill__content">
                        <strong>Транскрипция</strong>
                        <p>Произношение и дополнительные языковые подсказки в одном месте</p>
                    </div>
                </article>
            </div>

            <div class="landing-features-showcase__layer landing-features-showcase__layer--4">
                <article class="landing-feature-pill shadow">
                    <span class="landing-feature-pill__badge">3</span>

                    <div class="landing-feature-pill__content">
                        <strong>Режимы обучения</strong>
                        <p>Базовый, письменный и аудио-режим для разных сценариев</p>
                    </div>
                </article>
            </div>

            <div class="landing-features-showcase__layer landing-features-showcase__layer--5">
                <article class="landing-feature-pill shadow">
                    <span class="landing-feature-pill__badge">FSRS</span>

                    <div class="landing-feature-pill__content">
                        <strong>Персонализация</strong>
                        <p>Можно выбрать цель закрепления и частоту повторений</p>
                    </div>
                </article>
            </div>

            <div class="landing-features-showcase__phone">
                <div class="landing-phone-float">
                    <article class="landing-phone landing-phone--tilted shadow" data-story-phone="features">
                        <div class="landing-phone__top">
                            <span>9:41</span>

                            <div class="landing-phone__status" aria-hidden="true">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>

                        <div class="landing-card-builder">
                            <div class="landing-card-builder__topbar">
                                <button class="landing-card-builder__close" type="button" aria-label="Закрыть">
                                    ×
                                </button>

                                <div class="landing-card-builder__meta">
                                    Шаг 2 из 5
                                </div>
                            </div>

                            <div class="landing-card-builder__header">
                                <h3 class="landing-card-builder__title">
                                    Добавление карточки
                                </h3>

                                <p class="landing-card-builder__subtitle">
                                    Подсказки помогают быстрее заполнить карточку
                                </p>
                            </div>

                            <div class="landing-card-builder__group">
                                <label class="landing-card-builder__label">
                                    Сторона 1 *
                                </label>

                                <div class="landing-card-builder__field landing-card-builder__field--lg">
                                    <span class="landing-card-builder__value">Star</span>
                                </div>
                            </div>

                            <div class="landing-card-builder__hint">
                                <span class="landing-card-builder__hint-icon">✓</span>
                                <span>Доступны варианты заполнения</span>
                            </div>

                            <div class="landing-card-builder__tabs">
                                <button class="landing-card-builder__tab is-active" type="button">
                                    Определения
                                </button>
                                <button class="landing-card-builder__tab" type="button">
                                    Изображения
                                </button>
                                <div class="">
                                    ›
                                </div>
                            </div>

                            <div class="landing-card-builder__panel">
                                <article class="landing-card-builder__suggestion is-selected">
                                    <span class="landing-card-builder__radio"></span>

                                    <div class="landing-card-builder__suggestion-body">
                                        <p class="landing-card-builder__suggestion-text">
                                            Any small luminous dot appearing in the cloudless portion of the night sky.
                                        </p>

                                        <span class="landing-card-builder__source">
                                            Источник: Free Dictionary API
                                        </span>
                                    </div>
                                </article>

                                <article class="landing-card-builder__suggestion">
                                    <span class="landing-card-builder__radio"></span>

                                    <div class="landing-card-builder__suggestion-body">
                                        <p class="landing-card-builder__suggestion-text">
                                            A luminous celestial body made up of plasma and visible in the sky.
                                        </p>

                                        <span class="landing-card-builder__source">
                                            Общее значение
                                        </span>
                                    </div>
                                </article>
                            </div>

                            <div class="landing-card-builder__group">
                                <label class="landing-card-builder__label">
                                    Сторона 2 *
                                </label>

                                <div
                                    class="landing-card-builder__field landing-card-builder__field--md landing-card-builder__field--placeholder">
                                    <span class="landing-card-builder__placeholder">
                                        Введите ответ или определение
                                    </span>
                                </div>
                            </div>

                            <div class="landing-card-builder__footer">
                                <x-button class="landing-card-builder__button" as="button" type="button"
                                    variant="primary" radius="12" size="lg" shadow>
                                    Сохранить
                                </x-button>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    </div>

    <div class="_container landing__block landing__block--final" id="pricing">
        <div class="landing-final">
            <span class="landing-final__spark landing-final__spark--1"></span>
            <span class="landing-final__spark landing-final__spark--2"></span>
            <span class="landing-final__spark landing-final__spark--3"></span>

            <span class="landing-final__dot landing-final__dot--1"></span>
            <span class="landing-final__dot landing-final__dot--2"></span>

            <div class="landing-final__orbit landing-final__orbit--1">
                <span class="landing-final__orbit-ball landing-final__orbit-ball--1"></span>
            </div>

            <div class="landing-final__orbit landing-final__orbit--2">
                <span class="landing-final__orbit-ball landing-final__orbit-ball--2"></span>
            </div>

            <div class="landing-final__head">
                <div class="landing__eyebrow">
                    <span class="landing__eyebrow-dot"></span>
                    <span>Старт</span>
                </div>

                <h2 class="landing__subtitle heading heading--2">
                    Создайте первый набор и позвольте системе планировать повторения
                </h2>

                <p class="landing__text landing__text--center subtitle subtitle--1">
                    Добавьте карточки, включите FSRS и повторяйте материал тогда, когда это действительно нужно.
                    Начать можно бесплатно, а PRO откроет больше режимов и возможностей.
                </p>
            </div>

            <div class="landing-pricing">
                <article class="landing-plan-card landing-plan-card--free shadow">
                    <div class="landing-plan-card__top">
                        <span class="landing-plan-card__badge">
                            FREE
                        </span>

                        <div class="landing-plan-card__price">
                            <strong>0 ₽</strong>
                            <span>для старта</span>
                        </div>
                    </div>

                    <div class="landing-plan-card__content">
                        <h3 class="landing-plan-card__title">
                            Попробовать приложение
                        </h3>

                        <p class="landing-plan-card__text">
                            Подходит, чтобы создать первые наборы, проверить FSRS и начать повторять карточки.
                        </p>
                    </div>

                    <ul class="landing-plan-card__list">
                        <li>
                            <span>✓</span>
                            до 3 категорий
                        </li>

                        <li>
                            <span>✓</span>
                            до 5 наборов
                        </li>

                        <li>
                            <span>✓</span>
                            до 50 карточек
                        </li>

                        <li>
                            <span>✓</span>
                            базовый режим обучения
                        </li>
                    </ul>

                    <x-button class="landing-plan-card__button" as="a" href="{{ route('register') }}"
                        variant="primary" radius="12" size="lg" shadow>
                        Начать бесплатно
                    </x-button>
                </article>

                <article class="landing-plan-card landing-plan-card--pro shadow">
                    <div class="landing-plan-card__glow" aria-hidden="true"></div>

                    <div class="landing-plan-card__top">
                        <span class="landing-plan-card__badge landing-plan-card__badge--pro">
                            PRO
                        </span>

                        <div class="landing-plan-card__price">
                            <strong>299 ₽</strong>
                            <span>в месяц</span>
                        </div>
                    </div>

                    <div class="landing-plan-card__content">
                        <h3 class="landing-plan-card__title">
                            Учить без ограничений
                        </h3>

                        <p class="landing-plan-card__text">
                            Для активного обучения, больших наборов, разных режимов и визуальных ассоциаций.
                        </p>
                    </div>

                    <ul class="landing-plan-card__list">
                        <li>
                            <span>✓</span>
                            без лимитов на наборы и карточки
                        </li>

                        <li>
                            <span>✓</span>
                            базовый, письменный и аудио-режим
                        </li>

                        <li>
                            <span>✓</span>
                            генерация изображений
                        </li>

                        <li>
                            <span>✓</span>
                            больше возможностей для запоминания
                        </li>
                    </ul>

                    <x-button class="landing-plan-card__button" as="a" href="{{ route('register') }}"
                        variant="primary" radius="12" size="lg" shadow>
                        Попробовать PRO
                    </x-button>
                </article>
            </div>

            <p class="landing-final__note">
                Первый набор можно создать за пару минут — дальше система сама подскажет, когда пора повторять.
            </p>
        </div>
    </div>

</x-layouts.app>
