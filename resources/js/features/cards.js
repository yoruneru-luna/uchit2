import {
    setsState,
} from '../shared/state';

import {
    getCsrfToken,
    escapeHtml,
    setFormLoading,
} from '../shared/helpers';

import {
    renderButtonInner,
} from '../shared/render';

import {
    closeAllCardMenus,
} from '../shared/menus';

import {
    updateCardCreationProgress,
    hideCardCreationProgress,
} from './set-forms';

import {
    debouncedCardSuggestions,
} from './card-suggestions';

let cardDeps = {
    reloadSets: async () => { },
    reloadCategories: async () => { },
    renderSets: () => { },
    renderSetDetails: () => { },
    loadSetCards: async () => { },
};

export const configureCardDeps = (deps = {}) => {
    cardDeps = {
        ...cardDeps,
        ...deps,
    };
};

export const renderSetCards = (list, cards) => {
    const root = document.querySelector('[data-set-details]');
    const isLanguageSet = root?.dataset.language === 'en';

    if (!list) return;

    if (!cards.length) {
        list.innerHTML = `
            <p class="set-details__empty">
                В наборе пока нет карточек.
            </p>
        `;

        return;
    }

    list.innerHTML = cards.map((card, index) => {
        const number = index + 1;

        const image = card.image_url
            ? `
                <span class="set-card__image">
                    <img src="${escapeHtml(card.image_url)}" alt="">
                </span>
            `
            : `
                <span class="set-card__image set-card__image--empty" aria-hidden="true">
                    <svg class="icon icon--sm set-card__image-icon">
                        <use href="#icon-image"></use>
                    </svg>
                </span>
            `;

        const transcription = isLanguageSet && card.transcription
            ? `<span class="set-card__transcription">${escapeHtml(card.transcription)}</span>`
            : '';

        const marker = card.marker
            ? `<span class="set-card__marker">${escapeHtml(card.marker)}</span>`
            : '';

        const soundButton = isLanguageSet
            ? `
                <button
                    class="set-card__action set-card__sound button button--muted button--sm button--radius-circle button--icon"
                    type="button"
                    aria-label="Прослушать карточку"
                    data-speak-card="${escapeHtml(card.front)}"
                >
                    ${renderButtonInner({
                icon: 'volume',
                iconSize: 'xs',
            })}
                </button>
            `
            : '';

        const hint = card.hint
            ? `
                <div class="set-card__extra">
                    <span class="set-card__extra-label">Подсказка:</span>
                    <span class="set-card__extra-text">${escapeHtml(card.hint)}</span>
                </div>
            `
            : '';

        const example = card.example
            ? `
                <div class="set-card__extra">
                    <span class="set-card__extra-label">Пример:</span>
                    <span class="set-card__extra-text">${escapeHtml(card.example)}</span>
                </div>
            `
            : '';

        return `
            <article class="set-card shadow" data-card-id="${card.id}">
                <span class="set-card__number">${number}</span>

                ${image}

                <div class="set-card__content">
                    <div class="set-card__term-row">
                        <div class="set-card__term-main">
                            <div class="set-card__term-line">
                                <h6 class="set-card__front heading heading--6">
                                    ${escapeHtml(card.front)}
                                </h6>

                                ${soundButton}
                            </div>

                            ${transcription}
                        </div>
                    </div>

                    <p class="set-card__back text text--small">
                        ${escapeHtml(card.back)}
                    </p>

                    ${hint}
                    ${example}
                </div>

                <div class="set-card__actions">
                    ${marker}

                    <button
                        class="set-card__action set-card__edit button button--muted button--sm button--radius-circle button--icon"
                        type="button"
                        aria-label="Редактировать карточку"
                        data-edit-card="${card.id}"
                    >
                        ${renderButtonInner({
            icon: 'edit',
            iconSize: 'xs',
        })}
                    </button>

                    <button
                        class="set-card__action set-card__delete button button--danger-ghost button--sm button--radius-circle button--icon"
                        type="button"
                        aria-label="Удалить карточку"
                        data-delete-card="${card.id}"
                    >
                        ${renderButtonInner({
            icon: 'trash',
            iconSize: 'xs',
        })}
                    </button>
                </div>
            </article>
        `;
    }).join('');
};

const clearCardFormErrors = (form) => {
    form.querySelectorAll('.is-error').forEach((element) => {
        element.classList.remove('is-error');
    });

    form.querySelectorAll('[data-js-field-error]').forEach((element) => {
        element.remove();
    });
};

const getCardFieldWrapper = (field) => {
    return field?.closest('.input, .textarea-field, .custom-select, .card-form__image-field');
};

const showCardFieldError = (field, message) => {
    const wrapper = getCardFieldWrapper(field);

    if (!wrapper) return;

    wrapper.classList.add('is-error');

    const error = document.createElement('p');

    error.className = 'card-form__message';
    error.dataset.jsFieldError = 'true';
    error.textContent = message;

    wrapper.insertAdjacentElement('afterend', error);
};

const updateCardLanguageFields = (form) => {
    const isLanguageSet = form.dataset.language === 'en';

    form.querySelectorAll('[data-card-language-only]').forEach((field) => {
        field.hidden = !isLanguageSet;

        field.querySelectorAll('input, textarea, select').forEach((input) => {
            input.disabled = !isLanguageSet;

            if (!isLanguageSet) {
                input.value = '';
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    });
};

const setCardFormMode = (form, mode, card = null) => {
    form.dataset.mode = mode;

    const submitText = form.querySelector('.card-form__submit .button__text');
    const title = form.closest('.card-form')?.querySelector('.card-form__title');

    if (mode === 'edit' && card) {
        form.dataset.cardId = card.id;
        form.action = `/cards/${card.id}`;

        if (title) {
            title.textContent = 'Редактирование карточки';
        }

        if (submitText) {
            submitText.textContent = 'Сохранить изменения';
        }

        return;
    }

    delete form.dataset.cardId;
    form.action = form.dataset.storeAction || form.action;

    if (title) {
        title.textContent = 'Добавление карточки';
    }

    if (submitText) {
        submitText.textContent = 'Добавить карточку';
    }
};

const resetCardImagePreview = (form, { removeImage = false } = {}) => {
    const input = form.querySelector('[data-card-image-input]');
    const upload = form.querySelector('[data-card-image-upload]');
    const preview = form.querySelector('[data-card-image-preview]');
    const previewImg = form.querySelector('[data-card-image-preview-img]');
    const selectedImageInput = form.querySelector('[data-selected-image-url]');
    const removeImageInput = form.querySelector('[data-remove-image]');

    if (selectedImageInput) {
        selectedImageInput.value = '';
    }

    if (removeImageInput) {
        removeImageInput.value = removeImage ? '1' : '0';
    }

    if (input) {
        input.value = '';
    }

    if (previewImg) {
        previewImg.src = '';
    }

    if (preview) {
        preview.hidden = true;
    }

    if (upload) {
        upload.hidden = false;
    }
};

const applyExternalCardImage = (form, imageUrl) => {
    if (!imageUrl) return;

    const selectedImageInput = form.querySelector('[data-selected-image-url]');
    const removeImageInput = form.querySelector('[data-remove-image]');
    const fileInput = form.querySelector('[data-card-image-input]');
    const upload = form.querySelector('[data-card-image-upload], .card-form__image-upload');
    const preview = form.querySelector('[data-card-image-preview]');
    const previewImg = form.querySelector('[data-card-image-preview-img]');

    if (selectedImageInput) {
        selectedImageInput.value = imageUrl;
    }

    if (removeImageInput) {
        removeImageInput.value = '0';
    }

    if (fileInput) {
        fileInput.value = '';
    }

    if (previewImg) {
        previewImg.src = imageUrl;
    }

    if (preview) {
        preview.hidden = false;
    }

    if (upload) {
        upload.hidden = true;
    }
};

const initCardImageField = (form) => {
    const input = form.querySelector('[data-card-image-input]');
    const upload = form.querySelector('[data-card-image-upload]');
    const preview = form.querySelector('[data-card-image-preview]');
    const previewImg = form.querySelector('[data-card-image-preview-img]');
    const changeButton = form.querySelector('[data-card-image-change]');
    const removeButton = form.querySelector('[data-card-image-remove]');

    if (!input || !upload || !preview || !previewImg) return;

    const showPreview = (file) => {
        const url = URL.createObjectURL(file);

        previewImg.src = url;
        preview.hidden = false;
        upload.hidden = true;

        previewImg.onload = () => {
            URL.revokeObjectURL(url);
        };
    };

    input.addEventListener('change', () => {
        const file = input.files?.[0];

        if (!file) {
            resetCardImagePreview(form);
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            resetCardImagePreview(form);

            window.showToast?.({
                type: 'error',
                title: 'Неверный формат',
                message: 'Можно загрузить JPG, PNG или WEBP.',
            });

            return;
        }

        if (file.size > maxSize) {
            resetCardImagePreview(form);

            window.showToast?.({
                type: 'error',
                title: 'Файл слишком большой',
                message: 'Размер изображения не должен превышать 5 МБ.',
            });

            return;
        }

        const selectedImageInput = form.querySelector('[data-selected-image-url]');
        const removeImageInput = form.querySelector('[data-remove-image]');

        if (selectedImageInput) {
            selectedImageInput.value = '';
        }

        if (removeImageInput) {
            removeImageInput.value = '0';
        }

        showPreview(file);
    });

    changeButton?.addEventListener('click', () => {
        input.click();
    });

    removeButton?.addEventListener('click', () => {
        resetCardImagePreview(form, {
            removeImage: true,
        });
    });
};

const validateCardForm = (form) => {
    const setInput = form.querySelector('[name="study_set_id"]');
    const frontInput = form.querySelector('[name="front"]');
    const backInput = form.querySelector('[name="back"]');
    const transcriptionInput = form.querySelector('[name="transcription"]');
    const markerInput = form.querySelector('[name="marker"]');
    const hintInput = form.querySelector('[name="hint"]');
    const exampleInput = form.querySelector('[name="example"]');

    const front = frontInput?.value.trim() || '';
    const back = backInput?.value.trim() || '';
    const transcription = transcriptionInput?.value.trim() || '';
    const marker = markerInput?.value.trim() || '';
    const hint = hintInput?.value.trim() || '';
    const example = exampleInput?.value.trim() || '';

    let hasError = false;

    if (!setInput?.value) {
        window.showToast?.({
            type: 'error',
            title: 'Набор не выбран',
            message: 'Откройте набор и попробуйте добавить карточку ещё раз.',
        });

        return false;
    }

    if (!front) {
        showCardFieldError(frontInput, 'Введите первую сторону карточки.');
        hasError = true;
    }

    if (!back) {
        showCardFieldError(backInput, 'Введите вторую сторону карточки.');
        hasError = true;
    }

    if (front.length > 500) {
        showCardFieldError(frontInput, 'Первая сторона не должна быть длиннее 500 символов.');
        hasError = true;
    }

    if (back.length > 500) {
        showCardFieldError(backInput, 'Вторая сторона не должна быть длиннее 500 символов.');
        hasError = true;
    }

    if (!transcriptionInput?.disabled && transcription.length > 120) {
        showCardFieldError(transcriptionInput, 'Транскрипция не должна быть длиннее 120 символов.');
        hasError = true;
    }

    if (marker.length > 120) {
        showCardFieldError(markerInput, 'Маркер не должен быть длиннее 120 символов.');
        hasError = true;
    }

    if (hint.length > 180) {
        showCardFieldError(hintInput, 'Подсказка не должна быть длиннее 180 символов.');
        hasError = true;
    }

    if (example.length > 1000) {
        showCardFieldError(exampleInput, 'Пример не должен быть длиннее 1000 символов.');
        hasError = true;
    }

    return !hasError;
};

const checkCardDuplicates = async (form) => {
    const url = form.dataset.cardDuplicatesUrl;

    if (!url) {
        return {
            hasDuplicates: false,
            duplicates: [],
        };
    }

    const formData = new FormData();

    formData.set('front', form.querySelector('[name="front"]')?.value.trim() || '');
    formData.set('back', form.querySelector('[name="back"]')?.value.trim() || '');
    formData.set('marker', form.querySelector('[name="marker"]')?.value.trim() || '');

    if (form.dataset.mode === 'edit' && form.dataset.cardId) {
        formData.set('ignore_id', form.dataset.cardId);
    }

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
    });

    if (!response.ok) {
        return {
            hasDuplicates: false,
            duplicates: [],
        };
    }

    const data = await response.json();

    return {
        hasDuplicates: Boolean(data.has_duplicates),
        duplicates: data.duplicates || [],
    };
};

const sendCardForm = async (form) => {
    const formData = new FormData(form);
    const isEdit = form.dataset.mode === 'edit';

    if (isEdit) {
        formData.set('_method', 'PATCH');
    }

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
        };

    if (!response.ok) {
        if (data.errors) {
            Object.entries(data.errors).forEach(([name, messages]) => {
                const field = form.querySelector(`[name="${name}"]`);

                if (field) {
                    showCardFieldError(field, messages[0]);
                }
            });
        }

        window.showToast?.({
            type: 'error',
            title: isEdit ? 'Не удалось обновить карточку' : 'Не удалось создать карточку',
            message: data.message || 'Проверьте поля и попробуйте ещё раз.',
        });

        return null;
    }

    return data;
};

const fetchCard = async (cardId) => {
    const response = await fetch(`/cards/${cardId}`, {
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
            title: 'Не удалось загрузить карточку',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return null;
    }

    return data.card;
};

const fillCardForm = (form, card) => {
    const fields = {
        front: card.front || '',
        back: card.back || '',
        transcription: card.transcription || '',
        marker: card.marker || '',
        hint: card.hint || '',
        example: card.example || '',
    };

    Object.entries(fields).forEach(([name, value]) => {
        const field = form.querySelector(`[name="${name}"]`);

        if (field) {
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    const setIdInput = form.querySelector('[data-card-set-id]');

    if (setIdInput) {
        setIdInput.value = card.study_set_id;
    }

    const selectedImageInput = form.querySelector('[data-selected-image-url]');

    if (selectedImageInput) {
        selectedImageInput.value = '';
    }

    const removeImageInput = form.querySelector('[data-remove-image]');

    if (removeImageInput) {
        removeImageInput.value = '0';
    }

    if (card.image_url) {
        applyExternalCardImage(form, card.image_url);

        if (selectedImageInput) {
            selectedImageInput.value = '';
        }
    } else {
        resetCardImagePreview(form);
    }
};

const deleteCard = async (cardId) => {
    const response = await fetch(`/cards/${cardId}`, {
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
            title: 'Не удалось удалить карточку',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return null;
    }

    return data;
};

const updateSetAfterCardSaved = (data) => {
    const updatedSet = data?.set;

    if (!updatedSet) return;

    setsState.items = setsState.items.map((set) => {
        if (Number(set.id) !== Number(updatedSet.id)) {
            return set;
        }

        return {
            ...set,
            ...updatedSet,
        };
    });

    cardDeps.renderSets();

    const openedSetDetails = document.querySelector('[data-set-details]');
    const openedSetId = Number(openedSetDetails?.dataset.currentSetId);

    if (openedSetId === Number(updatedSet.id)) {
        const set =
            setsState.items.find((item) => {
                return Number(item.id) === Number(updatedSet.id);
            }) || updatedSet;

        cardDeps.renderSetDetails(set);
        cardDeps.loadSetCards(updatedSet.id);
    }
};

export const openCardFormForSet = (set, options = {}) => {
    if (!set) return;

    const {
        afterSet = false,
    } = options;

    const cardSheet = document.querySelector('[data-sidebar-sheet-id="create-card-sheet"]');
    const cardForm = cardSheet?.querySelector('[data-card-form]');

    if (!cardSheet || !cardForm) return;

    const setIdInput = cardForm.querySelector('[data-card-set-id]');
    const setTitleElement = cardForm.querySelector('[data-card-form-set-title]');
    const suggestionsWrap = cardForm.querySelector('[data-card-suggestions-wrap]');
    const selectedImageInput = cardForm.querySelector('[data-selected-image-url]');
    const removeImageInput = cardForm.querySelector('[data-remove-image]');

    setCardFormMode(cardForm, 'create');

    cardForm.reset();
    clearCardFormErrors(cardForm);
    resetCardImagePreview(cardForm);

    if (selectedImageInput) {
        selectedImageInput.value = '';
    }

    if (removeImageInput) {
        removeImageInput.value = '0';
    }

    if (setIdInput) {
        setIdInput.value = set.id;
    }

    cardForm.dataset.setId = set.id;
    cardForm.dataset.setTitle = set.title || '';
    cardForm.dataset.language = set.language || '';
    cardForm.dataset.afterSet = afterSet ? 'true' : 'false';
    cardForm.dataset.cardsCount = Number(set.cards_count || 0);

    updateCardLanguageFields(cardForm);

    if (afterSet) {
        updateCardCreationProgress(cardForm, set.cards_count || 0);
    } else {
        hideCardCreationProgress(cardForm);
    }

    if (setTitleElement) {
        setTitleElement.hidden = false;
        setTitleElement.textContent = `Набор: ${set.title}`;
    }

    if (suggestionsWrap) {
        suggestionsWrap.hidden = true;
    }

    closeAllCardMenus();
    window.openSidebarSheet?.(cardSheet);
};

export const initCardForms = () => {
    document.querySelectorAll('[data-card-form]').forEach((form) => {
        form.dataset.storeAction = form.action;

        initCardImageField(form);
        updateCardLanguageFields(form);

        form.querySelectorAll('[name="front"], [name="back"]').forEach((field) => {
            field.addEventListener('input', () => {
                debouncedCardSuggestions(form);
            });
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            clearCardFormErrors(form);

            if (!validateCardForm(form)) {
                return;
            }

            setFormLoading(form, true);

            try {
                const duplicateResult = await checkCardDuplicates(form);

                if (duplicateResult.hasDuplicates) {
                    const confirmed = await window.openConfirmDialog?.({
                        title: 'Похожая карточка уже есть',
                        text: 'Уже есть карточка с такой же стороной, определением или таким же сочетанием сторон и маркера. Чтобы не запутаться позже, можно добавить уточняющий маркер.',
                        cancelText: 'Изменить',
                        submitText: 'Сохранить всё равно',
                        submitTone: 'primary',
                    });

                    if (!confirmed) {
                        return;
                    }
                }

                const isEdit = form.dataset.mode === 'edit';

                const setIdInput = form.querySelector('[data-card-set-id]');
                const currentSetId = setIdInput?.value || form.dataset.setId || '';
                const currentSetTitle = form.dataset.setTitle || '';
                const currentLanguage = form.dataset.language || '';
                const currentAfterSet = form.dataset.afterSet === 'true';

                const data = await sendCardForm(form);

                if (!data) return;

                window.showToast?.({
                    type: 'success',
                    title: isEdit ? 'Карточка обновлена' : 'Карточка создана',
                    message: isEdit
                        ? 'Изменения сохранены.'
                        : 'Можно добавить следующую карточку.',
                });

                form.dispatchEvent(
                    new CustomEvent('card:saved', {
                        bubbles: true,
                        detail: data,
                    })
                );

                updateSetAfterCardSaved(data);

                if (isEdit) {
                    await cardDeps.reloadSets();

                    const sheet = form.closest('[data-sidebar-sheet]');

                    window.closeSidebarSheet?.(sheet);

                    window.setTimeout(() => {
                        form.reset();
                        clearCardFormErrors(form);
                        resetCardImagePreview(form);
                        setCardFormMode(form, 'create');

                        const suggestionsWrap = form.querySelector('[data-card-suggestions-wrap]');

                        if (suggestionsWrap) {
                            suggestionsWrap.hidden = true;
                        }

                        hideCardCreationProgress(form);
                    }, 300);

                    return;
                }

                const nextSetId =
                    data.card?.study_set_id ||
                    data.set?.id ||
                    currentSetId;

                const nextCardsCount = Number(
                    data.set?.cards_count ||
                    form.dataset.cardsCount ||
                    0
                );

                form.reset();

                setCardFormMode(form, 'create');
                resetCardImagePreview(form);

                form.dataset.setId = nextSetId;
                form.dataset.setTitle = currentSetTitle;
                form.dataset.language = currentLanguage;
                form.dataset.afterSet = currentAfterSet ? 'true' : 'false';
                form.dataset.cardsCount = nextCardsCount;

                if (setIdInput) {
                    setIdInput.value = nextSetId;
                }

                if (currentAfterSet) {
                    updateCardCreationProgress(form, nextCardsCount);
                } else {
                    hideCardCreationProgress(form);
                }

                const selectedImageInput = form.querySelector(
                    '[data-selected-image-url]'
                );

                if (selectedImageInput) {
                    selectedImageInput.value = '';
                }

                const removeImageInput = form.querySelector('[data-remove-image]');

                if (removeImageInput) {
                    removeImageInput.value = '0';
                }

                const suggestionsWrap = form.querySelector(
                    '[data-card-suggestions-wrap]'
                );

                if (suggestionsWrap) {
                    suggestionsWrap.hidden = true;
                }

                const setTitleElement = form.querySelector(
                    '[data-card-form-set-title]'
                );

                if (setTitleElement) {
                    if (currentSetTitle) {
                        setTitleElement.hidden = false;
                        setTitleElement.textContent = `Набор: ${currentSetTitle}`;
                    } else {
                        setTitleElement.hidden = true;
                        setTitleElement.textContent = '';
                    }
                }

                updateCardLanguageFields(form);

                await cardDeps.reloadSets();
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title:
                        form.dataset.mode === 'edit'
                            ? 'Не удалось обновить карточку'
                            : 'Не удалось создать карточку',
                    message: 'Проверьте подключение и попробуйте ещё раз.',
                });
            } finally {
                setFormLoading(form, false);
            }
        });
    });
};

export const initCardEvents = () => {
    document.addEventListener('click', async (event) => {
        const createButton = event.target.closest('[data-create-card-for-set]');

        if (createButton) {
            event.preventDefault();

            const setId = Number(createButton.dataset.createCardForSet);

            const set = setsState.items.find((item) => {
                return Number(item.id) === setId;
            });

            if (!set) return;

            openCardFormForSet(set, {
                afterSet: false,
            });

            return;
        }

        const editButton = event.target.closest('[data-edit-card]');

        if (editButton) {
            event.preventDefault();

            const cardId = Number(editButton.dataset.editCard);

            if (!cardId) return;

            const cardSheet = document.querySelector(
                '[data-sidebar-sheet-id="create-card-sheet"]'
            );

            const cardForm = cardSheet?.querySelector('[data-card-form]');

            if (!cardSheet || !cardForm) return;

            editButton.disabled = true;

            try {
                const card = await fetchCard(cardId);

                if (!card) return;

                const set = setsState.items.find((item) => {
                    return Number(item.id) === Number(card.study_set_id);
                });

                cardForm.dataset.setId = card.study_set_id;
                cardForm.dataset.setTitle = set?.title || '';
                cardForm.dataset.language = set?.language || '';
                cardForm.dataset.afterSet = 'false';
                cardForm.dataset.cardsCount = Number(set?.cards_count || 0);

                updateCardLanguageFields(cardForm);
                setCardFormMode(cardForm, 'edit', card);
                fillCardForm(cardForm, card);
                hideCardCreationProgress(cardForm);

                const setTitleElement = cardForm.querySelector(
                    '[data-card-form-set-title]'
                );

                if (setTitleElement) {
                    if (set?.title) {
                        setTitleElement.hidden = false;
                        setTitleElement.textContent = `Набор: ${set.title}`;
                    } else {
                        setTitleElement.hidden = true;
                        setTitleElement.textContent = '';
                    }
                }

                const suggestionsWrap = cardForm.querySelector(
                    '[data-card-suggestions-wrap]'
                );

                if (suggestionsWrap) {
                    suggestionsWrap.hidden = true;
                }

                closeAllCardMenus();
                window.openSidebarSheet?.(cardSheet);
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось открыть редактирование',
                    message: 'Проверьте подключение и попробуйте ещё раз.',
                });
            } finally {
                editButton.disabled = false;
            }

            return;
        }

        const deleteButton = event.target.closest('[data-delete-card]');

        if (deleteButton) {
            event.preventDefault();

            const cardId = Number(deleteButton.dataset.deleteCard);

            if (!cardId) return;

            const confirmed = await window.openConfirmDialog?.({
                title: 'Удалить карточку?',
                text: 'Карточка будет удалена из набора. Это действие нельзя отменить.',
                cancelText: 'Отмена',
                submitText: 'Удалить',
                submitTone: 'danger',
            });

            if (!confirmed) return;

            deleteButton.disabled = true;

            try {
                const data = await deleteCard(cardId);

                if (!data) return;

                window.showToast?.({
                    type: 'success',
                    title: 'Карточка удалена',
                    message: 'Карточка удалена из набора.',
                });

                const cardElement = deleteButton.closest('[data-card-id]');

                cardElement?.remove();

                if (data.set) {
                    updateSetAfterCardSaved(data);
                }

                const detailsRoot = document.querySelector('[data-set-details]');
                const currentSetId = detailsRoot?.dataset.currentSetId;

                if (currentSetId) {
                    cardDeps.loadSetCards(currentSetId);
                }

                await cardDeps.reloadSets();
                await cardDeps.reloadCategories();

                closeAllCardMenus();
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось удалить карточку',
                    message: 'Проверьте подключение и попробуйте ещё раз.',
                });
            } finally {
                deleteButton.disabled = false;
            }

            return;
        }

        const speakButton = event.target.closest('[data-speak-card]');

        if (speakButton) {
            event.preventDefault();
            event.stopPropagation();

            const text = speakButton.dataset.speakCard || '';

            if (!text) return;

            if (!('speechSynthesis' in window)) {
                window.showToast?.({
                    type: 'error',
                    title: 'Озвучка недоступна',
                    message: 'Браузер не поддерживает синтез речи.',
                });

                return;
            }

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            utterance.lang = 'en-GB';
            utterance.rate = 0.9;

            window.speechSynthesis.speak(utterance);
        }
    });
};
