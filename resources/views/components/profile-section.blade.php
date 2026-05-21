@props([
    'sidebar' => false,
])

<section {{ $attributes->class(['base-section', 'profile-card']) }}>
    <x-section-header class="{{ $sidebar ? 'sidebar__header' : '' }}" title="Профиль" />

    <div class="profile-card__user">
        <div class="profile-card__avatar">
            <x-icon id="profile" size="md" class="profile-card__avatar-icon" />
        </div>

        <div class="profile-card__user-text">
            <h4 class="profile-card__name">Иван Иванов</h4>
            <p class="profile-card__nickname">@ivanivanov</p>
            <p class="profile-card__email">ivan.ivanov@gmail.com</p>
        </div>
    </div>

    <x-button class="profile-card__edit" tone="icon-control" size="lg" radius="12" icon="edit" icon-size="sm"
        icon-after="chevron" align="left" type="button" shadow>
        Редактировать профиль
    </x-button>

    <x-subscription-card state="active" data-sync-subscription="profile.subscription" />

    <div class="profile-card__stats">
        <div class="profile-card__stats-header">
            <h4 class="profile-card__stats-title heading heading--5">
                Моя статистика
            </h4>

            <p class="profile-card__stats-subtitle subtitle subtitle--3">
                За все время использования
            </p>
        </div>

        <article class="profile-stat-card profile-stat-card--purple shadow">
            <div class="profile-stat-card__accent"></div>

            <x-icon-box icon="book" tone="purple" size="md" icon-size="md" />

            <div class="profile-stat-card__content">
                <div class="profile-stat-card__value">124</div>
                <div class="profile-stat-card__label">Карточки освоено</div>
                <div class="profile-stat-card__note">В долговременной памяти</div>
            </div>
        </article>

        <article class="profile-stat-card profile-stat-card--teal shadow">
            <div class="profile-stat-card__accent"></div>

            <x-icon-box icon="goal" tone="teal" size="md" icon-size="md" />

            <div class="profile-stat-card__content">
                <div class="profile-stat-card__value">86</div>
                <div class="profile-stat-card__label">Повторений вовремя</div>
                <div class="profile-stat-card__note">Избежали забывания</div>
            </div>
        </article>

        <article class="profile-stat-card profile-stat-card--orange shadow">
            <div class="profile-stat-card__accent"></div>

            <x-icon-box icon="protection" tone="orange" size="md" icon-size="md" />

            <div class="profile-stat-card__content">
                <div class="profile-stat-card__value">81%</div>
                <div class="profile-stat-card__label">Удержание знаний</div>
                <div class="profile-stat-card__note">Средний показатель</div>
            </div>
        </article>

        <article class="profile-stat-card profile-stat-card--blue shadow">
            <div class="profile-stat-card__accent"></div>

            <x-icon-box icon="stack" tone="blue" size="md" icon-size="md" />

            <div class="profile-stat-card__content">
                <div class="profile-stat-card__value">6</div>
                <div class="profile-stat-card__label">Карточек в процессе</div>
                <div class="profile-stat-card__note">Активно изучаете</div>
            </div>
        </article>

        <article class="profile-card__result profile-result shadow">
            <div class="profile-result__header">
                <x-icon-box icon="trophy" tone="purple" size="md" icon-size="md" />

                <div class="profile-result__content">
                    <h4 class="profile-result__title">
                        Отличная работа!
                    </h4>

                    <p class="profile-result__text">
                        Вы сохраняете знания и становитесь <br>
                        лучше каждый день.
                    </p>
                </div>
            </div>

            <div class="profile-result__decor">
                <img src="{{ asset('images/mountains.svg') }}" alt="" aria-hidden="true">
            </div>
        </article>
    </div>

    <x-button class="profile-card__logout" tone="danger-ghost" size="lg" radius="12" icon="logout"
        icon-size="sm" type="button" align="left" shadow>
        Выйти из аккаунта
    </x-button>
</section>
