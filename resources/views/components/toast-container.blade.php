<div class="toast-container" data-toast-container aria-live="polite" aria-atomic="false">
    @if (session('success'))
        <div class="toast toast--success" data-toast>
            <div class="toast__icon">
                <x-icon id="check" size="xs" />
            </div>

            <div class="toast__content">
                <p class="toast__title">Готово</p>
                <p class="toast__text">{{ session('success') }}</p>
            </div>

            <button class="toast__close" type="button" aria-label="Закрыть уведомление" data-toast-close>
                <x-icon id="close" size="xxs" />
            </button>
        </div>
    @endif

    @if (session('error'))
        <div class="toast toast--error" data-toast>
            <div class="toast__icon">
                <x-icon id="close" size="xs" />
            </div>

            <div class="toast__content">
                <p class="toast__title">Ошибка</p>
                <p class="toast__text">{{ session('error') }}</p>
            </div>

            <button class="toast__close" type="button" aria-label="Закрыть уведомление" data-toast-close>
                <x-icon id="close" size="xxs" />
            </button>
        </div>
    @endif
</div>
