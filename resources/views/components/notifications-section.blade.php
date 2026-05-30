<section class="notifications base-section" data-notifications>
    <x-section-header class="sidebar__header" title="Уведомления" />

    <div class="notifications__content base-section" data-notifications-content>
        <div class="notifications__actions" data-notifications-actions>
            <x-button class="notifications__clear" tone="danger-soft" radius="12" size="lg" type="button"
                icon="trash" icon-size="sm" data-notifications-clear>
                Удалить все
            </x-button>
        </div>

        <div class="notifications__list" data-notifications-list hidden>
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
