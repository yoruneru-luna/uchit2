import flatpickr from 'flatpickr';
import IMask from 'imask';

import 'flatpickr/dist/flatpickr.min.css';

export const initDatePickers = () => {
    document.querySelectorAll('[data-picker="date"]').forEach((input) => {
        const picker = flatpickr(input, {
            dateFormat: 'Y-m-d',
            altInput: true,
            altFormat: 'd.m.Y',
            allowInput: true,
            disableMobile: true,
            position: 'auto right',
        });

        if (!picker.altInput) return;

        let mask = null;

        picker.altInput.addEventListener('focus', () => {
            if (mask) return;

            mask = IMask(picker.altInput, {
                mask: Date,
                pattern: 'd.`m.`Y',
                lazy: false,
                autofix: true,
                blocks: {
                    d: {
                        mask: IMask.MaskedRange,
                        from: 1,
                        to: 31,
                        maxLength: 2,
                    },
                    m: {
                        mask: IMask.MaskedRange,
                        from: 1,
                        to: 12,
                        maxLength: 2,
                    },
                    Y: {
                        mask: IMask.MaskedRange,
                        from: 1900,
                        to: new Date().getFullYear(),
                    },
                },
            });
        });

        picker.altInput.addEventListener('blur', () => {
            if (!mask) return;

            if (!picker.altInput.value) {
                mask.destroy();
                mask = null;
            }
        });
    });
};

export const initInputClearButtons = () => {
    document.addEventListener('mousedown', (event) => {
        const clearButton = event.target.closest('.input-field__clear');

        if (!clearButton) return;

        event.preventDefault();

        const wrapper = clearButton.closest('.input, .input-field');
        const input = wrapper?.querySelector('.input-field__control');
        const message = wrapper?.querySelector('.input__message');

        if (!wrapper || !input) return;

        input.value = '';

        wrapper.classList.remove('is-error', 'is-success');

        if (message) {
            message.textContent = '';
        }

        input.focus();
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
};

export const initTextareaClearButtons = () => {
    document.querySelectorAll('.textarea-field').forEach((textareaWrapper) => {
        const textarea = textareaWrapper.querySelector('.textarea-field__control');
        const clearButton = textareaWrapper.querySelector('.textarea-field__clear');

        if (!textarea || !clearButton) return;

        clearButton.addEventListener('mousedown', (event) => {
            event.preventDefault();

            textarea.value = '';

            textareaWrapper.classList.remove('is-error', 'is-success');

            const message = textareaWrapper.querySelector('.textarea-field__message');

            if (message) {
                message.textContent = '';
            }

            textarea.focus();

            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        });
    });
};

export const initColorFields = () => {
    document.querySelectorAll('[data-color-field]').forEach((field) => {
        const toggle = field.querySelector('[data-color-toggle]');
        const input = field.querySelector('[data-color-input]');
        const value = field.querySelector('[data-color-value]');

        if (!toggle || !input || !value) return;

        const updateColorState = () => {
            input.disabled = !toggle.checked;

            value.textContent = toggle.checked
                ? input.value
                : 'Без цвета';
        };

        toggle.addEventListener('change', updateColorState);

        input.addEventListener('input', () => {
            value.textContent = input.value;
        });

        updateColorState();
    });
};

const updateProgressLegends = () => {
    document.querySelectorAll('[data-progress-bar]').forEach((bar) => {
        const legends = [...bar.querySelectorAll('.progress-card__legend-item')];
        const barRect = bar.getBoundingClientRect();

        legends.forEach((legend) => {
            legend.classList.remove(
                'progress-card__legend-item--top',
                'progress-card__legend-item--left',
                'progress-card__legend-item--right'
            );
        });

        legends.forEach((legend) => {
            const rect = legend.getBoundingClientRect();

            if (rect.left < barRect.left) {
                legend.classList.add('progress-card__legend-item--left');
            } else if (rect.right > barRect.right) {
                legend.classList.add('progress-card__legend-item--right');
            }
        });

        for (let i = 0; i < legends.length; i++) {
            const current = legends[i];

            for (let j = 0; j < i; j++) {
                const previous = legends[j];

                const currentRect = current.getBoundingClientRect();
                const previousRect = previous.getBoundingClientRect();

                const overlaps =
                    currentRect.left < previousRect.right &&
                    currentRect.right > previousRect.left &&
                    currentRect.top < previousRect.bottom &&
                    currentRect.bottom > previousRect.top;

                if (overlaps) {
                    current.classList.add('progress-card__legend-item--top');
                    break;
                }
            }
        }
    });
};

export const initProgressLegends = () => {
    updateProgressLegends();

    window.addEventListener('load', updateProgressLegends);
    window.addEventListener('resize', updateProgressLegends);
};

export const initSubscriptionPanels = () => {
    document.querySelectorAll('[data-subscription]').forEach((root) => {
        const toggle = root.querySelector('[data-subscription-toggle]');
        const panel = root.querySelector('[data-subscription-panel]');

        if (!toggle || !panel) return;

        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

            toggle.setAttribute('aria-expanded', String(!isExpanded));
            panel.setAttribute('aria-hidden', String(isExpanded));
        });
    });
};

export const refreshColorFields = (root = document) => {
    root.querySelectorAll('[data-color-field]').forEach((field) => {
        const toggle = field.querySelector('[data-color-toggle]');
        const input = field.querySelector('[data-color-input]');
        const value = field.querySelector('[data-color-value]');

        if (!toggle || !input || !value) return;

        input.disabled = !toggle.checked;
        value.textContent = toggle.checked ? input.value : 'Без цвета';
    });
};
