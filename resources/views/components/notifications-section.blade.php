<section class="notifications base-section" data-notifications>
    <x-section-header class="sidebar__header" title="Уведомления" />

    <div class="notifications__content base-section" data-notifications-content>
        <div class="notifications__actions" data-notifications-actions hidden>
            <x-button class="notifications__clear" tone="danger-soft" radius="12" size="lg" type="button"
                icon="trash" icon-size="sm" data-notifications-clear>
                Удалить все
            </x-button>
        </div>

        <div class="notifications__list" data-notifications-list hidden>
            {{-- <article class="notification-card shadow"> <x-icon-box icon="profile" tone="purple" size="md"
                    icon-size="sm" />
                <div class="notification-card__content">
                    <h4 class="notification-card__title"> Ваш набор добавили 3 пользователя </h4>
                    <p class="notification-card__time"> 1 час назад </p>
                </div> <x-button class="notification-card__delete" iconOnly tone="danger-ghost" radius="circle"
                    size="sm" icon="trash" icon-size="xs" type="button" aria-label="Удалить уведомление" />
            </article> --}}
        </div>

        <div class="notifications__empty shadow" data-notifications-empty>
            <div class="notifications__empty-illustration">
                <img src="{{ asset('images/notifications-empty.svg') }}" alt="" aria-hidden="true">
            </div>

            <h5 class="notifications__empty-title heading heading--5">
                Пока уведомлений нет
            </h5>

            <p class="notifications__empty-text text text--small">
                Здесь будут напоминания о повторениях и ваши достижения
            </p>
        </div>
    </div>
</section>
