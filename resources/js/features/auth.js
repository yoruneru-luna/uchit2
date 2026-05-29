import {
    getCsrfToken,
    isValidEmail,
} from '../shared/helpers';

const getAuthFieldWrapper = (field) => {
    return field.closest('.input, .textarea-field');
};

const setAuthFieldState = (field, state, text = '') => {
    const wrapper = getAuthFieldWrapper(field);

    if (!wrapper) return;

    wrapper.classList.remove('is-error', 'is-success');

    if (state) {
        wrapper.classList.add(`is-${state}`);
    }

    const message = wrapper.querySelector('.input__message');

    if (message) {
        message.textContent = text;
        message.hidden = !text;
    }
};

export const initEmailValidation = () => {
    document.querySelectorAll('[data-validate-email-url]').forEach((validateRoot) => {
        const emailInput = validateRoot.matches('input, textarea, select')
            ? validateRoot
            : validateRoot.querySelector('input[name="email"]');

        if (!emailInput) return;

        // На форме регистрации email проверяет initRegisterValidation,
        // иначе одно поле будет обрабатываться двумя валидаторами.
        if (emailInput.closest('[data-register-validate-url]')) return;

        const url =
            validateRoot.dataset.validateEmailUrl ||
            emailInput.dataset.validateEmailUrl;

        if (!url) return;

        let timer = null;

        emailInput.addEventListener('input', () => {
            clearTimeout(timer);

            const email = emailInput.value.trim();

            if (!email) {
                setAuthFieldState(emailInput, null);
                return;
            }

            timer = window.setTimeout(async () => {
                if (!isValidEmail(email)) {
                    setAuthFieldState(
                        emailInput,
                        'error',
                        'Введите корректную эл. почту.'
                    );

                    return;
                }

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken(),
                        },
                        body: JSON.stringify({ email }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        setAuthFieldState(
                            emailInput,
                            'error',
                            data.errors?.email?.[0] ||
                            data.message ||
                            'Ошибка проверки'
                        );

                        return;
                    }

                    setAuthFieldState(emailInput, 'success');
                } catch {
                    setAuthFieldState(
                        emailInput,
                        'error',
                        'Не удалось проверить почту'
                    );
                }
            }, 400);
        });
    });
};

export const initRegisterValidation = () => {
    const registerForm = document.querySelector('[data-register-validate-url]');

    if (!registerForm) return;

    const url = registerForm.dataset.registerValidateUrl;

    if (!url) return;

    const getValues = () => {
        const data = new FormData(registerForm);

        return {
            name: data.get('name') || '',
            nickname: data.get('nickname') || '',
            email: data.get('email') || '',
            password: data.get('password') || '',
            password_confirmation: data.get('password_confirmation') || '',
        };
    };

    const getClientFieldError = (input, values) => {
        const field = input.name;
        const value = input.value.trim();

        if (!value) {
            return '';
        }

        if (field === 'name') {
            if (value.length > 120) {
                return 'Имя не должно быть длиннее 120 символов.';
            }
        }

        if (field === 'nickname') {
            if (value.length > 60) {
                return 'Никнейм не должен быть длиннее 60 символов.';
            }

            if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
                return 'Никнейм может содержать только латиницу, цифры, точку, дефис и подчёркивание.';
            }
        }

        if (field === 'email') {
            if (!isValidEmail(value)) {
                return 'Введите корректную эл. почту.';
            }
        }

        if (field === 'password') {
            if (value.length < 8) {
                return 'Пароль должен содержать не менее 8 символов.';
            }
        }

        if (field === 'password_confirmation') {
            if (values.password && value !== values.password) {
                return 'Пароли не совпадают.';
            }
        }

        return '';
    };

    const validateField = async (input) => {
        const field = input.name;

        if (!field) return;

        if (field === 'nickname') {
            input.value = input.value.trim().toLowerCase();
        }

        const values = getValues();
        const value = input.value.trim();

        if (!value) {
            if (field === 'nickname') {
                setAuthFieldState(input, null);
                return;
            }

            setAuthFieldState(input, null);
            return;
        }

        const clientError = getClientFieldError(input, values);

        if (clientError) {
            setAuthFieldState(input, 'error', clientError);
            return;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    field,
                    ...values,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setAuthFieldState(
                    input,
                    'error',
                    data.errors?.[field]?.[0] ||
                    data.message ||
                    'Ошибка проверки'
                );

                return;
            }

            setAuthFieldState(input, 'success');
        } catch {
            setAuthFieldState(input, 'error', 'Не удалось проверить поле');
        }
    };

    registerForm.querySelectorAll('input[name]').forEach((input) => {
        let timer = null;

        const validateWithDelay = () => {
            clearTimeout(timer);

            timer = window.setTimeout(() => {
                validateField(input);

                if (input.name === 'password') {
                    const confirmationInput = registerForm.querySelector(
                        'input[name="password_confirmation"]'
                    );

                    if (confirmationInput?.value.trim()) {
                        validateField(confirmationInput);
                    }
                }
            }, 400);
        };

        const validateImmediately = () => {
            clearTimeout(timer);

            validateField(input);

            if (input.name === 'password') {
                const confirmationInput = registerForm.querySelector(
                    'input[name="password_confirmation"]'
                );

                if (confirmationInput?.value.trim()) {
                    validateField(confirmationInput);
                }
            }
        };

        input.addEventListener('input', validateWithDelay);
        input.addEventListener('change', validateImmediately);
        input.addEventListener('blur', validateImmediately);

        if (input.name === 'birthday') {
            const connectBirthdayAltInput = () => {
                const altInput = input._flatpickr?.altInput;

                if (!altInput || altInput.dataset.authValidationBound === 'true') {
                    return;
                }

                altInput.dataset.authValidationBound = 'true';

                altInput.addEventListener('input', validateWithDelay);
                altInput.addEventListener('change', validateImmediately);
                altInput.addEventListener('blur', validateImmediately);
            };

            connectBirthdayAltInput();

            window.setTimeout(connectBirthdayAltInput, 0);
        }
    });
};

export const initLoginPasswordState = () => {
    const loginPasswordInput = document.querySelector(
        '.auth-page input[name="password"]'
    );

    if (!loginPasswordInput) return;

    loginPasswordInput.addEventListener('input', () => {
        const hasValue = loginPasswordInput.value.trim().length > 0;

        setAuthFieldState(loginPasswordInput, hasValue ? 'success' : null);
    });
};
