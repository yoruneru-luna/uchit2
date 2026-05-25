<div class="confirm-dialog" data-confirm-dialog hidden>
    <div class="confirm-dialog__overlay" data-confirm-cancel></div>

    <section class="confirm-dialog__panel shadow" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-text">
        <div class="confirm-dialog__content">
            <h2 class="confirm-dialog__title heading heading--3" id="confirm-dialog-title" data-confirm-title>
                Подтвердите действие
            </h2>

            <p class="confirm-dialog__text text text--small" id="confirm-dialog-text" data-confirm-text>
                Действие нельзя будет отменить.
            </p>
        </div>

        <div class="confirm-dialog__actions">
            <x-button class="confirm-dialog__button" tone="ghost" radius="12" size="sm" type="button"
                data-confirm-cancel>
                Отмена
            </x-button>

            <x-button class="confirm-dialog__button" tone="danger" radius="12" size="sm" type="button"
                data-confirm-submit>
                Удалить
            </x-button>
        </div>
    </section>
</div>
