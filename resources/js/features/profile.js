import {
    getCsrfToken,
    escapeHtml,
} from '../shared/helpers';

const renderProfileAvatar = (wrap, avatarUrl) => {
    if (!wrap) return;

    if (avatarUrl) {
        wrap.innerHTML = `
            <img class="profile-form__avatar-img" src="${escapeHtml(avatarUrl)}" alt="Аватар профиля">
        `;

        return;
    }

    wrap.innerHTML = `
        <svg class="icon icon--md profile-form__avatar-icon">
            <use href="#icon-profile"></use>
        </svg>
    `;
};

const getAvatarUrlWithVersion = (avatarUrl) => {
    if (!avatarUrl) return '';

    const separator = avatarUrl.includes('?') ? '&' : '?';

    return `${avatarUrl}${separator}v=${Date.now()}`;
};

const renderProfileCardAvatar = (wrap, avatarUrl) => {
    if (!wrap) return;

    if (avatarUrl) {
        wrap.innerHTML = `
            <img
                class="profile-card__avatar-img"
                src="${escapeHtml(getAvatarUrlWithVersion(avatarUrl))}"
                alt="Аватар профиля"
            >
        `;

        return;
    }

    wrap.innerHTML = `
        <svg class="icon icon--md profile-card__avatar-icon">
            <use href="#icon-profile"></use>
        </svg>
    `;
};

const updateProfileView = (profile) => {
    document.querySelectorAll('[data-profile-name]').forEach((item) => {
        item.textContent = profile.name || 'Без имени';
    });

    document.querySelectorAll('[data-profile-nickname]').forEach((item) => {
        item.textContent = `@${profile.nickname || 'user'}`;
    });

    document.querySelectorAll('[data-profile-email]').forEach((item) => {
        item.textContent = profile.email || '';
    });

    document.querySelectorAll('[data-profile-avatar]').forEach((avatar) => {
        renderProfileCardAvatar(avatar, profile.avatar_url);
    });
};

const fillProfileForm = async (form) => {
    const url = form.dataset.profileUrl;

    if (!url) return;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        window.showToast?.({
            type: 'error',
            title: 'Не удалось загрузить профиль',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return;
    }

    const nameInput = form.querySelector('[name="name"]');
    const nicknameInput = form.querySelector('[name="nickname"]');

    if (nameInput) {
        nameInput.value = data.profile.name || '';
    }

    if (nicknameInput) {
        nicknameInput.value = data.profile.nickname || '';
    }

    renderProfileAvatar(
        form.querySelector('[data-profile-avatar-preview]'),
        data.profile.avatar_url
    );

    clearProfileFormErrors(form);
    markProfileInitialFieldsSuccess(form);
};

const getProfileFieldWrapper = (field) => {
    return field.closest('.input, .textarea-field');
};

const setProfileFieldState = (field, state, text = '') => {
    const wrapper = getProfileFieldWrapper(field);

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

const clearProfileFormErrors = (form) => {
    form.querySelectorAll('.input, .textarea-field').forEach((wrapper) => {
        wrapper.classList.remove('is-error', 'is-success');

        const message = wrapper.querySelector('.input__message');

        if (message) {
            message.textContent = '';
            message.hidden = true;
        }
    });

    form.querySelectorAll('[data-js-field-error]').forEach((error) => {
        error.remove();
    });
};

const getProfileClientFieldError = (field) => {
    const name = field.name;
    const value = field.value.trim();

    if (!value) {
        if (name === 'name') return 'Введите имя.';
        if (name === 'nickname') return 'Введите никнейм.';

        return '';
    }

    if (name === 'name') {
        if (value.length > 120) {
            return 'Имя не должно быть длиннее 120 символов.';
        }
    }

    if (name === 'nickname') {
        if (value.length > 60) {
            return 'Никнейм не должен быть длиннее 60 символов.';
        }

        if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
            return 'Никнейм может содержать только латиницу, цифры, точку, дефис и подчёркивание.';
        }
    }

    return '';
};

const validateProfileField = (field) => {
    if (!field?.name) return true;

    if (field.name === 'nickname') {
        field.value = field.value.toLowerCase();
    }

    const error = getProfileClientFieldError(field);

    if (error) {
        setProfileFieldState(field, 'error', error);
        return false;
    }

    setProfileFieldState(field, 'success');
    return true;
};

const validateProfileForm = (form) => {
    const fields = [
        ...form.querySelectorAll('input[name="name"], input[name="nickname"]'),
    ];

    let isValid = true;

    fields.forEach((field) => {
        const isFieldValid = validateProfileField(field);

        if (!isFieldValid) {
            isValid = false;
        }
    });

    return isValid;
};

const markProfileInitialFieldsSuccess = (form) => {
    form
        .querySelectorAll('input[name="name"], input[name="nickname"]')
        .forEach((field) => {
            validateProfileField(field);
        });
};

export const initProfileEvents = () => {
    document.querySelectorAll('[data-profile-form]').forEach((form) => {
        form
            .querySelectorAll('input[name="name"], input[name="nickname"]')
            .forEach((field) => {
                let timer = null;

                field.addEventListener('input', () => {
                    clearTimeout(timer);

                    timer = window.setTimeout(() => {
                        validateProfileField(field);
                    }, 300);
                });

                field.addEventListener('blur', () => {
                    clearTimeout(timer);
                    validateProfileField(field);
                });
            });
    });

    document.addEventListener('click', async (event) => {
        const editButton = event.target.closest('[data-profile-edit-open]');

        if (editButton) {
            event.preventDefault();

            const sheet = document.querySelector(
                '[data-sidebar-sheet-id="edit-profile-sheet"]'
            );

            const form = sheet?.querySelector('[data-profile-form]');

            if (!sheet || !form) return;

            await fillProfileForm(form);

            window.openSidebarSheet?.(sheet);

            return;
        }

        const removeAvatarButton = event.target.closest(
            '[data-profile-avatar-remove]'
        );

        if (removeAvatarButton) {
            event.preventDefault();

            const form = removeAvatarButton.closest('[data-profile-form]');
            const fileInput = form?.querySelector('[data-profile-avatar-input]');
            const removeInput = form?.querySelector('[data-profile-remove-avatar]');

            if (fileInput) {
                fileInput.value = '';
            }

            if (removeInput) {
                removeInput.value = '1';
            }

            renderProfileAvatar(
                form?.querySelector('[data-profile-avatar-preview]'),
                null
            );
        }

        const deleteProfileButton = event.target.closest('[data-profile-delete]');

        if (deleteProfileButton) {
            event.preventDefault();

            const confirmed = await window.openConfirmDialog?.({
                title: 'Удалить аккаунт?',
                text: 'Аккаунт, наборы, карточки и данные обучения будут удалены. Действие нельзя отменить.',
                cancelText: 'Отмена',
                submitText: 'Удалить аккаунт',
                submitTone: 'danger',
            });

            if (!confirmed) return;

            const url = deleteProfileButton.dataset.profileDeleteUrl || '/profile';

            deleteProfileButton.disabled = true;

            try {
                const response = await fetch(url, {
                    method: 'DELETE',
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
                    };

                if (!response.ok) {
                    window.showToast?.({
                        type: 'error',
                        title: 'Не удалось удалить аккаунт',
                        message: data.message || 'Попробуйте ещё раз.',
                    });

                    return;
                }

                window.showToast?.({
                    type: 'success',
                    title: 'Аккаунт удалён',
                    message: 'Данные аккаунта удалены.',
                });

                window.location.href = data.redirect || '/';
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось удалить аккаунт',
                    message: 'Проверьте подключение и попробуйте ещё раз.',
                });
            } finally {
                deleteProfileButton.disabled = false;
            }

            return;
        }
    });

    document.addEventListener('change', (event) => {
        const input = event.target.closest('[data-profile-avatar-input]');

        if (!input) return;

        const form = input.closest('[data-profile-form]');
        const file = input.files?.[0];

        if (!file || !form) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            window.showToast?.({
                type: 'error',
                title: 'Неверный формат',
                message: 'Можно загрузить JPG, PNG или WEBP.',
            });

            input.value = '';
            return;
        }

        if (file.size > maxSize) {
            window.showToast?.({
                type: 'error',
                title: 'Файл слишком большой',
                message: 'Размер изображения не должен превышать 5 МБ.',
            });

            input.value = '';
            return;
        }

        const removeInput = form.querySelector('[data-profile-remove-avatar]');

        if (removeInput) {
            removeInput.value = '0';
        }

        renderProfileAvatar(
            form.querySelector('[data-profile-avatar-preview]'),
            URL.createObjectURL(file)
        );
    });

    document.addEventListener('submit', async (event) => {
        const form = event.target.closest('[data-profile-form]');

        if (!form) return;

        event.preventDefault();

        clearProfileFormErrors(form);

        if (!validateProfileForm(form)) {
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

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    Object.entries(data.errors).forEach(([name, messages]) => {
                        const field = form.querySelector(`[name="${name}"]`);

                        if (field) {
                            setProfileFieldState(field, 'error', messages[0]);
                        }
                    });

                    window.showToast?.({
                        type: 'error',
                        title: 'Не удалось сохранить профиль',
                        message: 'Проверьте поля и попробуйте ещё раз.',
                    });

                    return;
                }

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось сохранить профиль',
                    message: data.message || 'Проверьте поля и попробуйте ещё раз.',
                });

                return;
            }

            updateProfileView(data.profile);

            window.showToast?.({
                type: 'success',
                title: 'Профиль обновлён',
                message: 'Изменения сохранены.',
            });

            clearProfileFormErrors(form);

            window.closeSidebarSheet?.(form.closest('[data-sidebar-sheet]'));
        } catch (error) {
            console.error(error);

            window.showToast?.({
                type: 'error',
                title: 'Не удалось сохранить профиль',
                message: 'Проверьте подключение и попробуйте ещё раз.',
            });
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
};
