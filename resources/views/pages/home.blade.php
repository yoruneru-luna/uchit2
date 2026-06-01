@php
    $repeatButtonAttributes = [];

    if ($repeatState === 'due') {
        $repeatButtonAttributes = [
            'data-start-due-review' => true,
        ];
    }

    if ($repeatState === 'onboarding') {
        $repeatButtonAttributes = [
            'data-create-set-open' => true,
        ];
    }
@endphp

<x-layouts.app header="app" mainClass="home-page">
    <div class="home-page__container _container">

        <x-repeat-card class="home-page__repeat-card" :state="$repeatState" :repeat-count="$repeatCount" :repeat-href="null"
            create-href="#" />

        <x-progress-card class="home-page__progress-card" :progress="$progressSummary" />

        <section class="home-page__sets base-section shadow" data-sets-section data-sets-url="{{ route('sets.index') }}"
            data-set-delete-url-template="{{ route('sets.destroy', ['set' => '__ID__']) }}">

            <x-section-header class="home-page__sets-header" title="Наборы" button-text="Добавить набор"
                button-sidebar-open="create-set-sheet" data-create-set-open />

            <div class="sets-category-view" data-sets-category-view hidden></div>

            <section class="base-section__controls">
                <x-search-input class="home-page__search-field" placeholder="Найти набор" data-sets-search />

                <x-sort-menu class="home-page__sort-box" id="home-sort-menu" sort-by="created_at" order="asc"
                    data-sets-sort :options="[
                        'created_at' => 'По дате',
                        'title' => 'По названию',
                        'cards_count' => 'По количеству карточек',
                        'progress' => 'По прогрессу',
                    ]" />
            </section>

            <section class="base-section__sets home-page__sets-list shadow-safe" data-sets-list>
            </section>

        </section>

        <x-categories-section class="home-page__categories shadow" sort-id="categories-sort-desktop" />

        <x-profile-section class="home-page__profile shadow" :stats=$profileStats />

        {{-- <x-settings-section class="home-page__settings shadow" /> --}}

    </div>

    <x-sidebar-sheet id="edit-set-sheet">
        <x-set-form mode="edit" action="#" method="PUT" :set="null" :form-attributes="[
            'data-set-form' => true,
            'data-set-edit-form' => true,
            'data-set-title-check-url' => route('sets.check-title'),
            'data-set-update-url-template' => route('sets.update', ['set' => '__ID__']),
            'data-set-create-data-url' => route('sets.create-data'),
        ]" />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="set-details-sheet" class="sidebar-sheet--set-details">
        <div class="set-details" data-set-details></div>
    </x-sidebar-sheet>

    <x-sidebar-sheet id="categories-sheet">
        <x-categories-section sort-id="categories-sort-sidebar" sidebar />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="create-category-sheet">
        <x-category-form mode="create" action="{{ route('categories.store') }}" method="POST" :form-attributes="[
            'data-category-form' => true,
            'data-category-title-check-url' => route('categories.check-title'),
        ]" />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="edit-category-sheet">
        <x-category-form mode="edit" action="#" method="PUT" :category="null" :form-attributes="[
            'data-category-form' => true,
            'data-category-edit-form' => true,
            'data-category-title-check-url' => route('categories.check-title'),
            'data-category-update-url-template' => route('categories.update', ['category' => '__ID__']),
        ]" />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="settings-sheet">
        <x-settings-section sidebar />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="create-set-sheet">
        <x-create-set-flow />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="create-card-sheet">
        <x-card-form mode="default" action="{{ route('cards.store') }}" method="POST" :form-attributes="[
            'data-card-form' => true,
            'data-card-duplicates-url' => route('cards.check-duplicates'),
            'data-card-suggestions-url' => route('cards.suggestions'),
            'data-card-suggestion-image-url' => route('cards.suggestion-image'),
        ]" />

    </x-sidebar-sheet>

    <x-sidebar-sheet id="profile-sheet">`
        <x-profile-section :stats=$profileStats />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="edit-profile-sheet">
        <x-profile-form></x-profile-form>
    </x-sidebar-sheet>

    <x-sidebar-sheet id="notifications-sheet">
        <x-notifications-section></x-notifications-section>
    </x-sidebar-sheet>

    <x-sidebar-sheet id="study-mode-sheet">
        <x-study-mode></x-study-mode>
    </x-sidebar-sheet>

    <div class="study-session" data-study-session hidden>
        <section class="study-session__panel">
            <header class="study-session__header">
                <div class="study-session__title-row">
                    <span class="icon-box icon-box--md study-session__mode-icon" data-study-session-mode-icon-box
                        aria-hidden="true">
                        <svg class="icon icon--sm icon-box__icon">
                            <use href="#icon-eye" data-study-session-mode-icon></use>
                        </svg>
                    </span>

                    <h2 class="study-session__title heading heading--4" data-study-session-title>
                        Базовый просмотр
                    </h2>
                </div>

                <x-button class="study-session__close" iconOnly tone="ghost" radius="circle" size="sm"
                    icon="close" icon-size="sm" type="button" aria-label="Закрыть обучение"
                    data-study-session-close />
            </header>

            <div class="study-session__progress">
                <span class="study-session__counter" data-study-session-counter>
                    1 / 1
                </span>

                <span class="study-session__progress-line">
                    <span class="study-session__progress-fill" data-study-session-progress style="width: 0%;"></span>
                </span>
            </div>

            <div class="study-session__body" data-study-session-body>
                <article class="study-card shadow" data-study-card>
                    <div class="study-card__tools">
                        <x-button class="study-card__tool" iconOnly tone="ghost" radius="circle" size="sm"
                            icon="simple" icon-size="sm" type="button" aria-label="Показать подсказку"
                            data-study-card-hint />

                        <x-button class="study-card__tool" iconOnly tone="ghost" radius="circle" size="sm"
                            icon="sound" icon-size="sm" type="button" aria-label="Прослушать"
                            data-study-card-sound />
                    </div>

                    <div class="study-card__content" data-study-card-content></div>

                    <div class="study-card__hint-box" data-study-card-hint-box hidden></div>

                    <button
                        class="study-card__flip study-card__action button button--ghost button--sm button--radius-circle"
                        type="button" aria-label="Показать ответ" data-study-card-action>
                        <span class="button__inner">
                            <span class="button__text study-card__action-text" data-study-card-action-text>
                                Проверить
                            </span>

                            <svg class="icon icon--sm button__icon">
                                <use href="#icon-rotate"></use>
                            </svg>
                        </span>
                    </button>
                </article>

                <p class="study-session__hint text text--small" data-study-session-hint>
                    <x-icon id="tap" size="xs"></x-icon>
                    Нажмите на карточку, чтобы проверить
                </p>

                <div class="study-session__rating" data-study-rating hidden>
                    <p class="study-session__rating-title text text--small">
                        Насколько легко Вы это вспомнили?
                    </p>

                    <div class="study-session__rating-actions">
                        <x-button class="study-session__rating-btn study-session__rating-btn--again"
                            tone="rating-again" radius="12" size="sm" type="button"
                            data-study-rating-value="again">
                            Трудно
                        </x-button>

                        <x-button class="study-session__rating-btn study-session__rating-btn--hard" tone="rating-hard"
                            radius="12" size="sm" type="button" data-study-rating-value="hard">
                            Сложно
                        </x-button>

                        <x-button class="study-session__rating-btn study-session__rating-btn--good" tone="rating-good"
                            radius="12" size="sm" type="button" data-study-rating-value="good">
                            Хорошо
                        </x-button>

                        <x-button class="study-session__rating-btn study-session__rating-btn--easy" tone="rating-easy"
                            radius="12" size="sm" type="button" data-study-rating-value="easy">
                            Легко
                        </x-button>
                    </div>
                </div>
            </div>
        </section>
    </div>

</x-layouts.app>
