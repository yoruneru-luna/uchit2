<section class="set-created">
    <div class="set-created__hero">
        <div class="set-created__icon">
            <x-icon id="check" size="xl" />
            <img src="{{ asset('images/confetti.svg') }}" alt="">
        </div>

        <h2 class="set-created__title heading heading--4">
            Набор создан!
        </h2>

        <p class="set-created__subtitle subtitle subtitle--2">
            Добавьте карточки, чтобы начать обучение
        </p>
    </div>

    <article class="set-created__minimum minimum-card shadow gradient--1">
        <x-icon-box icon="book" tone="purple" size="md" icon-size="md" />

        <div class="minimum-card__content">
            <h4 class="minimum-card__title heading heading--6">
                Минимум 5 карточек
            </h4>

            <p class="minimum-card__text text text--small">
                Добавьте как минимум 5 карточек, чтобы начать обучение
            </p>
        </div>

        <div class="minimum-card__progress">
            <span class="minimum-card__line">
                <span class="minimum-card__line-fill" style="width: 0%;"></span>
            </span>

            <span class="minimum-card__count text text--small">
                0 / 5
            </span>
        </div>
    </article>

    <div class="set-created__actions">
        <x-button class="set-created__button" variant="primary" radius="12" size="lg" icon="plus"
            icon-size="sm" type="button" data-create-set-next="create-card">
            Добавить первую карточку
        </x-button>

        <x-button tone="ghost" size="md" type="button">
            Перейти к набору
        </x-button>
    </div>
</section>
