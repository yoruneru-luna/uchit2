<x-layouts.app pageType="landing" mainClass="landing">

    <div class="_container landing__block" data-landing>
        <div class="landing__content">
            <x-logo scale="2" variant="dark" class="landing__logo"></x-logo>

            <div class="landing__eyebrow">
                <span class="landing__eyebrow-dot"></span>
                <span>Эффективно</span>
            </div>

            <h1 class="landing__title heading heading--1">
                Учись быстрее с алгоритмом FSRS
            </h1>

            <p class="landing__text subtitle subtitle--1">
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

                <x-button href="#how-it-works" tone="ghost" radius="12" size="lg">
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

            <article class="landing-phone shadow" data-landing-phone>
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

    <div class="_container landing__block" id="how-it-works">
        {{-- следующий блок --}}
    </div>

</x-layouts.app>
