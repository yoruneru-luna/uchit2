const createIconFallback = (type) => {
    if (type === 'success') return '✓';
    if (type === 'error') return '×';
    if (type === 'warning') return '!';
    return 'i';
};

const removeToast = (toast) => {
    if (!toast || toast.classList.contains('is-hiding')) return;

    toast.classList.remove('is-visible');
    toast.classList.add('is-hiding');

    toast.addEventListener(
        'transitionend',
        () => {
            toast.remove();
        },
        { once: true }
    );
};

export const showToast = ({
    type = 'success',
    title = 'Готово',
    message = '',
    duration = 4000,
} = {}) => {
    const container = document.querySelector('[data-toast-container]');

    if (!container) return;

    const toast = document.createElement('div');

    toast.className = `toast toast--${type}`;
    toast.dataset.toast = '';

    toast.innerHTML = `
        <div class="toast__icon" aria-hidden="true">
            <span>${createIconFallback(type)}</span>
        </div>

        <div class="toast__content">
            <p class="toast__title">${title}</p>
            <p class="toast__text">${message}</p>
        </div>

        <button class="toast__close" type="button" aria-label="Закрыть уведомление" data-toast-close>
            ×
        </button>
    `;

    container.append(toast);

    requestAnimationFrame(() => {
        toast.classList.add('is-visible');
    });

    const closeButton = toast.querySelector('[data-toast-close]');

    closeButton?.addEventListener('click', () => {
        removeToast(toast);
    });

    if (duration > 0) {
        window.setTimeout(() => {
            removeToast(toast);
        }, duration);
    }
};

export const initToasts = () => {
    document.addEventListener('click', (event) => {
        const closeButton = event.target.closest('[data-toast-close]');

        if (!closeButton) return;

        const toast = closeButton.closest('[data-toast]');

        removeToast(toast);
    });

    document.querySelectorAll('[data-toast]').forEach((toast) => {
        requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });

        window.setTimeout(() => {
            removeToast(toast);
        }, 4000);
    });

    window.showToast = showToast;
};
