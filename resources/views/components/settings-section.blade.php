@props([
    'sidebar' => false,
])

<section {{ $attributes->class(['base-section', 'settings-card']) }}>
    <x-section-header class="{{ $sidebar ? 'sidebar__header' : '' }}" title="Настройки" />

    <div class="settings-card__group shadow">
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
    </div>

    <x-button class="settings-card__delete" align="left" tone="danger-ghost" size="lg" radius="12"
        icon="trash" icon-size="sm" type="button" shadow>
        Удалить аккаунт
    </x-button>
</section>
