let confirmDialog = null;
let confirmResolve = null;

const closeConfirmDialog = (result = false) => {
    if (!confirmDialog) return;

    confirmDialog.classList.remove('is-visible');

    window.setTimeout(() => {
        confirmDialog.hidden = true;

        if (confirmResolve) {
            confirmResolve(result);
            confirmResolve = null;
        }
    }, 200);
};

const setConfirmSubmitTone = (button, tone) => {
    if (!button) return;

    button.classList.remove(
        'button--primary',
        'button--danger',
        'button--ghost',
        'button--danger-ghost'
    );

    button.classList.add(`button--${tone}`);
};

export const openConfirmDialog = ({
    title = 'Подтвердите действие',
    text = 'Действие нельзя будет отменить.',
    cancelText = 'Отмена',
    submitText = 'Подтвердить',
    submitTone = 'primary',
} = {}) => {
    if (!confirmDialog) {
        console.warn('Confirm dialog component not found: [data-confirm-dialog]');
        return Promise.resolve(false);
    }

    const titleElement = confirmDialog.querySelector('[data-confirm-title]');
    const textElement = confirmDialog.querySelector('[data-confirm-text]');
    const cancelButton = confirmDialog.querySelector('[data-confirm-cancel].button');
    const submitButton = confirmDialog.querySelector('[data-confirm-submit]');

    const cancelTextElement = cancelButton?.querySelector('.button__text');
    const submitTextElement = submitButton?.querySelector('.button__text');

    if (titleElement) {
        titleElement.textContent = title;
    }

    if (textElement) {
        textElement.textContent = text;
    }

    if (cancelTextElement) {
        cancelTextElement.textContent = cancelText;
    }

    if (submitTextElement) {
        submitTextElement.textContent = submitText;
    }

    setConfirmSubmitTone(submitButton, submitTone);

    confirmDialog.hidden = false;

    requestAnimationFrame(() => {
        confirmDialog.classList.add('is-visible');
    });

    return new Promise((resolve) => {
        confirmResolve = resolve;
    });
};

export const initConfirmDialog = () => {
    confirmDialog = document.querySelector('[data-confirm-dialog]');

    window.openConfirmDialog = openConfirmDialog;

    document.addEventListener('click', (event) => {
        if (event.target.closest('[data-confirm-submit]')) {
            closeConfirmDialog(true);
            return;
        }

        if (event.target.closest('[data-confirm-cancel]')) {
            closeConfirmDialog(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && confirmDialog && !confirmDialog.hidden) {
            closeConfirmDialog(false);
        }
    });
};
