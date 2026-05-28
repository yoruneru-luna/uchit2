import {
    getCsrfToken,
    isValidEmail,
} from '../shared/helpers';

const getContactFieldWrapper = (field) => {
    return field.closest('.input, .textarea-field');
};

const getContactFieldMessage = (wrapper) => {
    return wrapper?.querySelector('.input__message');
};

const setContactFieldState = (field, state, text = '') => {
    const wrapper = getContactFieldWrapper(field);

    if (!wrapper) return;

    wrapper.classList.remove('is-error', 'is-success');

    if (state) {
        wrapper.classList.add(`is-${state}`);
    }

    const message = getContactFieldMessage(wrapper);

    if (message) {
        message.textContent = text;
        message.hidden = !text;
    }
};

const clearContactFormErrors = (form) => {
    form.querySelectorAll('.input, .textarea-field').forEach((wrapper) => {
        wrapper.classList.remove('is-error', 'is-success');

        const message = getContactFieldMessage(wrapper);

        if (message) {
            message.textContent = '';
            message.hidden = true;
        }
    });
};

const getContactClientFieldError = (field) => {
    const name = field.name;
    const value = field.value.trim();

    if (!value) {
        if (name === 'name') return 'Введите имя.';
        if (name === 'email') return 'Введите эл. почту.';
        if (name === 'subject') return 'Введите тему обращения.';
        if (name === 'message' || name === 'text') return 'Введите сообщение.';

        if (field.required) {
            return 'Заполните поле.';
        }

        return '';
    }

    if (name === 'name') {
        if (value.length > 120) {
            return 'Имя не должно быть длиннее 120 символов.';
        }
    }

    if (name === 'email') {
        if (!isValidEmail(value)) {
            return 'Введите корректную эл. почту.';
        }
    }

    if (name === 'subject') {
        if (value.length > 120) {
            return 'Тема не должна быть длиннее 120 символов.';
        }
    }

    if (name === 'message' || name === 'text') {
        if (value.length < 10) {
            return 'Сообщение должно содержать не менее 10 символов.';
        }

        if (value.length > 2000) {
            return 'Сообщение не должно быть длиннее 2000 символов.';
        }
    }

    return '';
};

const validateContactField = (field) => {
    if (!field?.name) return true;

    const error = getContactClientFieldError(field);

    if (error) {
        setContactFieldState(field, 'error', error);
        return false;
    }

    if (field.value.trim()) {
        setContactFieldState(field, 'success');
    } else {
        setContactFieldState(field, null);
    }

    return true;
};

const validateContactForm = (form) => {
    const fields = [
        ...form.querySelectorAll('input[name], textarea[name]'),
    ].filter((field) => {
        return field.type !== 'hidden';
    });

    let isValid = true;

    fields.forEach((field) => {
        const isFieldValid = validateContactField(field);

        if (!isFieldValid) {
            isValid = false;
        }
    });

    return isValid;
};

const initContactLiveValidation = () => {
    document.querySelectorAll('[data-contact-form]').forEach((form) => {
        form
            .querySelectorAll('input[name], textarea[name]')
            .forEach((field) => {
                if (field.type === 'hidden') return;

                let timer = null;

                field.addEventListener('input', () => {
                    clearTimeout(timer);

                    timer = window.setTimeout(() => {
                        validateContactField(field);
                    }, 300);
                });

                field.addEventListener('blur', () => {
                    clearTimeout(timer);
                    validateContactField(field);
                });
            });
    });
};

export const initContactEvents = () => {
    initContactLiveValidation();

    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-contact-open]');

        if (!button) return;

        event.preventDefault();

        const sheet = document.querySelector('[data-sidebar-sheet-id="contact-sheet"]');

        if (!sheet) return;

        window.openSidebarSheet?.(sheet);
    });

    document.addEventListener('submit', async (event) => {
        const form = event.target.closest('[data-contact-form]');

        if (!form) return;

        event.preventDefault();

        clearContactFormErrors(form);

        if (!validateContactForm(form)) {
            return;
        }

        const submitButton = form.querySelector('[type="submit"]');
        const formData = new FormData(form);

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            const contentType = response.headers.get('content-type') || '';

            const data = contentType.includes('application/json')
                ? await response.json()
                : {
                    message: 'На сервере произошла ошибка.',
                    errors: null,
                };

            if (!response.ok) {
                if (data.errors) {
                    Object.entries(data.errors).forEach(([name, messages]) => {
                        const field = form.querySelector(`[name="${name}"]`);

                        if (field) {
                            setContactFieldState(field, 'error', messages[0]);
                        }
                    });

                    window.showToast?.({
                        type: 'error',
                        title: 'Не удалось отправить обращение',
                        message: 'Проверьте поля и попробуйте ещё раз.',
                    });

                    return;
                }

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось отправить обращение',
                    message: data.message || 'Проверьте поля и попробуйте ещё раз.',
                });

                return;
            }

            window.showToast?.({
                type: 'success',
                title: 'Обращение отправлено',
                message: 'Спасибо! Сообщение отправлено на почту поддержки.',
            });

            form.reset();
            clearContactFormErrors(form);

            window.closeSidebarSheet?.(form.closest('[data-sidebar-sheet]'));
        } catch (error) {
            console.error(error);

            window.showToast?.({
                type: 'error',
                title: 'Не удалось отправить обращение',
                message: 'Проверьте подключение и попробуйте ещё раз.',
            });
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
};
