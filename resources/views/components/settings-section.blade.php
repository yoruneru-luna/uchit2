@props([
    'sidebar' => false,
])

<section {{ $attributes->class(['base-section', 'settings-card']) }}>
    <x-section-header class="{{ $sidebar ? 'sidebar__header' : '' }}" title="Настройки" />

    @auth
        @unless (auth()->user()->isAdmin())
            <x-subscription-card data-sync-subscription="settings.subscription" />
        @endunless
    @endauth

    {{-- <div class="settings-card__group shadow">
        <h5 class="heading heading--5">
            Уведомления
        </h5>

        <div class="settings-card__list">
            <div class="settings-card__item">
                <div class="settings-card__item-main">
                    <x-icon-box icon="rotate" tone="purple" size="sm" icon-size="xs" />

                    <span class="settings-card__label">Повторения</span>
                </div>

                <x-switch name="notifications_reviews" :checked="true"
                    data-sync-switch="settings.notifications_reviews" />
            </div>

            <div class="settings-card__item">
                <div class="settings-card__item-main">
                    <x-icon-box icon="spark" tone="blue" size="sm" icon-size="xs" />

                    <span class="settings-card__label">Новые функции</span>
                </div>

                <x-switch name="notifications_features" :checked="true"
                    data-sync-switch="settings.notifications_features" />
            </div>

            <div class="settings-card__item">
                <div class="settings-card__item-main">
                    <x-icon-box icon="sale" tone="pink" size="sm" icon-size="xs" />

                    <span class="settings-card__label">Скидки и акции</span>
                </div>

                <x-switch name="notifications_sales" :checked="true"
                    data-sync-switch="settings.notifications_sales" />
            </div>
        </div>
    </div> --}}

    @auth
        @if (auth()->user()->isAdmin())
            <section class="settings-card__group settings-card--admin" data-admin-panel
                data-admin-users-url="{{ route('admin.users') }}"
                data-admin-public-sets-url="{{ route('admin.public-sets') }}"
                data-admin-public-set-url-template="{{ route('admin.public-sets.show', ['set' => '__ID__']) }}"
                data-admin-user-block-url-template="{{ route('admin.users.block', ['user' => '__ID__']) }}"
                data-admin-user-unblock-url-template="{{ route('admin.users.unblock', ['user' => '__ID__']) }}"
                data-admin-public-set-block-url-template="{{ route('admin.public-sets.block', ['set' => '__ID__']) }}"
                data-admin-public-set-unblock-url-template="{{ route('admin.public-sets.unblock', ['set' => '__ID__']) }}">
                <div class="settings-card__header">
                    <span class="icon-box icon-box--md icon-box--purple">
                        <svg class="icon icon--sm icon-box__icon">
                            <use href="#icon-setting"></use>
                        </svg>
                    </span>

                    <div class="settings-card__header-text">
                        <h3 class="settings-card__title heading heading--4">
                            Администрирование
                        </h3>

                        <p class="settings-card__text text text--small">
                            Управление пользователями и модерация публичных наборов.
                        </p>
                    </div>
                </div>

                <div class="settings-card__admin-tabs">
                    <x-button class="settings-card__admin-tab is-active" tone="primary-soft" size="sm" radius="12"
                        shadow type="button" data-admin-tab="users">
                        Пользователи
                    </x-button>

                    <x-button class="settings-card__admin-tab" tone="muted" size="sm" radius="12" shadow
                        type="button" data-admin-tab="public-sets">
                        Публичные наборы
                    </x-button>
                </div>

                <div class="settings-card__admin-search">
                    <x-search-input placeholder="Поиск" data-admin-search />
                </div>

                <div class="settings-card__admin-body">
                    <div data-admin-screen="users">
                        <div class="settings-card__admin-list" data-admin-users-list></div>

                        <p class="settings-card__admin-empty text text--small" data-admin-users-empty hidden>
                            Пользователи не найдены.
                        </p>
                    </div>

                    <div data-admin-screen="public-sets" hidden>
                        <div class="settings-card__admin-list" data-admin-public-sets-list></div>

                        <p class="settings-card__admin-empty text text--small" data-admin-public-sets-empty hidden>
                            Публичные наборы не найдены.
                        </p>

                        <div class="settings-card__admin-preview" data-admin-public-set-preview hidden></div>
                    </div>
                </div>
            </section>
        @endif
    @endauth

    <x-button class="settings-card__delete" align="left" tone="danger-ghost" size="lg" radius="12"
        icon="trash" icon-size="sm" type="button" shadow data-profile-delete
        data-profile-delete-url="{{ route('profile.destroy') }}">
        Удалить аккаунт
    </x-button>
</section>
