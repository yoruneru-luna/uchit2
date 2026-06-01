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
    const GAP = 8;
    const BASE_Y = 18;
    const ROW_HEIGHT = 18;

    document.querySelectorAll('[data-progress-bar]').forEach((bar) => {
        const allLegends = [...bar.querySelectorAll('.progress-card__legend-item')];

        allLegends.forEach((legend) => {
            const text = legend.textContent.trim();
            const isZero = text.startsWith('0%');

            legend.hidden = isZero;

            legend.classList.remove(
                'progress-card__legend-item--left',
                'progress-card__legend-item--right',
                'progress-card__legend-item--top'
            );

            legend.style.setProperty('--progress-legend-x', '-50%');
            legend.style.setProperty('--progress-legend-y', `${BASE_Y}px`);
        });

        const legends = allLegends.filter((legend) => {
            return !legend.hidden && legend.offsetParent !== null;
        });

        if (!legends.length) {
            bar.style.setProperty('--progress-bar-top-space', '0px');
            bar.style.setProperty('--progress-bar-bottom-space', '24px');
            return;
        }

        void bar.offsetWidth;

        const barRect = bar.getBoundingClientRect();

        legends.forEach((legend) => {
            const rect = legend.getBoundingClientRect();

            if (rect.left < barRect.left) {
                legend.classList.add('progress-card__legend-item--left');
                legend.style.setProperty('--progress-legend-x', '0%');
            }

            if (rect.right > barRect.right) {
                legend.classList.add('progress-card__legend-item--right');
                legend.style.setProperty('--progress-legend-x', '0%');
            }
        });

        void bar.offsetWidth;

        const items = legends
            .map((legend) => {
                const rect = legend.getBoundingClientRect();

                return {
                    legend,
                    left: rect.left,
                    right: rect.right,
                };
            })
            .sort((a, b) => a.left - b.left);

        const rows = {
            0: null,
        };

        items.forEach((item) => {
            let row = 0;

            if (rows[0] !== null && item.left < rows[0] + GAP) {
                row = -1;

                while (
                    rows[row] !== undefined &&
                    rows[row] !== null &&
                    item.left < rows[row] + GAP
                ) {
                    row--;
                }
            }

            rows[row] = item.right;

            if (row < 0) {
                item.legend.classList.add('progress-card__legend-item--top');
            }

            const y = row === 0
                ? BASE_Y
                : row * ROW_HEIGHT;

            item.legend.style.setProperty('--progress-legend-y', `${y}px`);
        });

        const topRowsCount = Object.keys(rows)
            .map(Number)
            .filter((row) => row < 0)
            .length;

        bar.style.setProperty(
            '--progress-bar-top-space',
            topRowsCount > 0 ? `${topRowsCount * ROW_HEIGHT + 6}px` : '0px'
        );

        bar.style.setProperty('--progress-bar-bottom-space', '34px');
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
