import flatpickr from 'flatpickr';
import IMask from 'imask';

import 'flatpickr/dist/flatpickr.min.css';

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

document.querySelectorAll('.input').forEach((inputWrapper) => {
    const input = inputWrapper.querySelector('.input__control');
    const clearButton = inputWrapper.querySelector('.input__clear');

    if (!input || !clearButton) return;

    clearButton.addEventListener('mousedown', () => {
        input.value = '';

        inputWrapper.classList.remove('is-error', 'is-success');

        const message = inputWrapper.querySelector('.input__message');

        if (message) {
            message.textContent = '';
        }

        input.focus();

        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
});

const emailInput = document.querySelector('[data-validate-email-url]');

if (emailInput) {
    const inputWrapper = emailInput.closest('.input');
    const message = inputWrapper.querySelector('.input__message');
    const url = emailInput.dataset.validateEmailUrl;

    let timer = null;

    const setState = (state, text = '') => {
        inputWrapper.classList.remove('is-error', 'is-success');

        if (state) {
            inputWrapper.classList.add(`is-${state}`);
        }

        message.textContent = text;
    };

    const isValidEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    emailInput.addEventListener('input', () => {
        clearTimeout(timer);

        const email = emailInput.value.trim();

        if (!email) {
            setState(null);
            return;
        }

        timer = setTimeout(async () => {
            if (!isValidEmail(email)) {
                setState('error', 'Введите корректную эл. почту');
                return;
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute('content'),
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setState('error', data.message || 'Ошибка проверки');
                    return;
                }

                setState('success');
            } catch {
                setState('error', 'Не удалось проверить почту');
            }
        }, 500);
    });
}

const registerForm = document.querySelector('[data-register-validate-url]');

if (registerForm) {
    const url = registerForm.dataset.registerValidateUrl;

    const setState = (input, state, text = '') => {
        const wrapper = input.closest('.input');
        const message = wrapper?.querySelector('.input__message');

        if (!wrapper) return;

        wrapper.classList.remove('is-error', 'is-success');

        if (state) {
            wrapper.classList.add(`is-${state}`);
        }

        if (message) {
            message.textContent = text;
        }
    };

    const getValues = () => {
        const data = new FormData(registerForm);

        return {
            name: data.get('name') || '',
            nickname: data.get('nickname') || '',
            birthday: data.get('birthday') || '',
            password: data.get('password') || '',
            password_confirmation: data.get('password_confirmation') || '',
        };
    };

    const validateField = async (input) => {
        const field = input.name;

        if (!field) return;

        if (!input.value.trim()) {
            setState(input, null);
            return;
        }

        if (field === 'nickname') {
            input.value = input.value.toLowerCase();
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute('content'),
                },
                body: JSON.stringify({
                    field,
                    ...getValues(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setState(
                    input,
                    'error',
                    data.errors?.[field]?.[0] || data.message || 'Ошибка проверки'
                );

                return;
            }

            setState(input, 'success');
        } catch {
            setState(input, 'error', 'Не удалось проверить поле');
        }
    };

    registerForm
        .querySelectorAll('input[name]')
        .forEach((input) => {
            let timer = null;

            input.addEventListener('input', () => {
                clearTimeout(timer);

                timer = setTimeout(() => {
                    validateField(input);
                }, 400);
            });

            input.addEventListener('blur', () => {
                clearTimeout(timer);
                validateField(input);
            });
        });
}

const loginPasswordInput = document.querySelector(
    '.auth-page input[name="password"]'
);

if (loginPasswordInput) {
    const wrapper = loginPasswordInput.closest('.input');
    const message = wrapper?.querySelector('.input__message');

    loginPasswordInput.addEventListener('input', () => {
        wrapper.classList.remove('is-error', 'is-success');

        if (message) {
            message.textContent = '';
        }

        if (loginPasswordInput.value.trim().length > 0) {
            wrapper.classList.add('is-success');
        }
    });
}
