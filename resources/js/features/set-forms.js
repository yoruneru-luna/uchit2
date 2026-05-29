import {
    CARD_REQUIRED_COUNT,
    setsState,
} from '../shared/state';

import {
    getCsrfToken,
    escapeHtml,
    setFormLoading,
} from '../shared/helpers';

import {
    renderIcon,
} from '../shared/render';

let setFormDeps = {
    reloadSets: async () => { },
    openCardFormForSet: () => { },
    renderSetDetails: () => { },
    loadSetCards: () => { },
};

export const configureSetFormDeps = (deps = {}) => {
    setFormDeps = {
        ...setFormDeps,
        ...deps,
    };
};

const renderSetCategoryOption = (category) => {
    const color = category.color || '';

    return `
        <button
            class="category-select__option"
            type="button"
            role="option"
            aria-selected="false"
            data-custom-select-option
            data-value="${category.id}"
            data-label="${escapeHtml(category.title)}"
            data-tone="custom"
            data-color="${escapeHtml(color)}"
        >
            <span class="category-select__option-main">
                <span
                    class="category-select__marker category-select__marker--custom"
                    ${color ? `style="background: ${escapeHtml(color)}"` : ''}
                ></span>

                <span class="category-select__option-label">
                    ${escapeHtml(category.title)}
                </span>
            </span>

            ${renderIcon('check', 'xxs', 'category-select__check')}
        </button>
    `;
};

const fillSetCategorySelect = (form, categories) => {
    const input = form.querySelector('[name="category_id"]');
    const select = input?.closest('[data-custom-select]');
    const dropdown = select?.querySelector('[data-custom-select-dropdown]');

    if (!input || !select || !dropdown) return;

    const selectedValue = input.value || '';

    dropdown.innerHTML = `
        <button
            class="category-select__option ${selectedValue === '' ? 'is-selected' : ''}"
            type="button"
            role="option"
            aria-selected="${selectedValue === '' ? 'true' : 'false'}"
            data-custom-select-option
            data-value=""
            data-label="Без категории"
            data-tone="default"
            data-color=""
        >
            <span class="category-select__option-main">
                <span class="category-select__marker category-select__marker--default"></span>

                <span class="category-select__option-label">
                    Без категории
                </span>
            </span>

            ${renderIcon('check', 'xxs', 'category-select__check')}
        </button>

        ${categories.map(renderSetCategoryOption).join('')}
    `;

    dropdown.querySelectorAll('[data-custom-select-option]').forEach((option) => {
        const isSelected = String(option.dataset.value) === String(selectedValue);

        option.classList.toggle('is-selected', isSelected);
        option.setAttribute('aria-selected', String(isSelected));
    });
};

export const loadSetCreateData = async (form) => {
    const url = form.dataset.setCreateDataUrl;

    if (!url) return;

    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) return;

    const data = await response.json();

    fillSetCategorySelect(form, data.categories || []);
};

export const refreshSetCategorySelects = () => {
    document.querySelectorAll('[data-set-form]').forEach((form) => {
        loadSetCreateData(form);
    });
};

export const initSetFormsCreateData = () => {
    document.querySelectorAll('[data-set-form]').forEach((form) => {
        loadSetCreateData(form);
    });
};

const saveCreatedSetToFlow = (flow, set) => {
    if (!flow || !set) return;

    flow.dataset.createdSetId = set.id;
    flow.dataset.createdSet = JSON.stringify(set);
};

const getCreatedSetFromFlow = (flow) => {
    if (!flow) return null;

    const setId = Number(flow.dataset.createdSetId);

    const setFromState = setsState.items.find((item) => {
        return Number(item.id) === setId;
    });

    if (setFromState) {
        return setFromState;
    }

    try {
        return flow.dataset.createdSet
            ? JSON.parse(flow.dataset.createdSet)
            : null;
    } catch {
        return null;
    }
};

const resetCreateSetFlow = (flow) => {
    if (!flow) return;

    delete flow.dataset.createdSetId;
    delete flow.dataset.createdSet;

    const form = flow.querySelector('[data-set-form]');

    if (form) {
        form.reset();
        clearSetFormErrors(form);
        setFormLoading(form, false);
    }

    setActiveCreateSetScreen(flow, 'create-set');
};

export const clearSetFormErrors = (form) => {
    form.querySelectorAll('.is-error').forEach((element) => {
        element.classList.remove('is-error');
    });

    form.querySelectorAll('[data-js-field-error]').forEach((element) => {
        element.remove();
    });
};

const getSetFieldWrapper = (field) => {
    return field.closest('.input, .textarea-field, .custom-select, .category-select');
};

const showSetFieldError = (field, message) => {
    const wrapper = getSetFieldWrapper(field);

    if (!wrapper) return;

    wrapper.classList.add('is-error');

    const error = document.createElement('p');

    error.className = 'set-form__message';
    error.dataset.jsFieldError = 'true';
    error.textContent = message;

    wrapper.insertAdjacentElement('afterend', error);
};

const setActiveCreateSetScreen = (flow, screenName) => {
    if (!flow) return;

    flow.querySelectorAll('[data-create-set-screen]').forEach((screen) => {
        screen.classList.toggle(
            'is-active',
            screen.dataset.createSetScreen === screenName
        );
    });
};

const sendSetForm = async (form) => {
    const formData = new FormData(form);
    const isEdit = form.hasAttribute('data-set-edit-form');

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
                    showSetFieldError(field, messages[0]);
                }
            });

            window.showToast?.({
                type: 'error',
                title: isEdit ? 'Не удалось обновить набор' : 'Не удалось создать набор',
                message: 'Проверьте поля и попробуйте ещё раз.',
            });
        } else {
            window.showToast?.({
                type: 'error',
                title: isEdit ? 'Не удалось обновить набор' : 'Не удалось создать набор',
                message: data.message || 'Попробуйте ещё раз.',
            });
        }

        return null;
    }

    return data;
};

const checkSetTitle = async (form, title) => {
    const checkUrl = form.dataset.setTitleCheckUrl;

    if (!checkUrl) return true;

    const url = new URL(checkUrl, window.location.origin);

    url.searchParams.set('title', title);

    if (form.dataset.setId) {
        url.searchParams.set('ignore_id', form.dataset.setId);
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        return true;
    }

    const data = await response.json();

    return Boolean(data.available);
};

export const initSetForms = () => {
    document.querySelectorAll('[data-set-form]').forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            clearSetFormErrors(form);

            const titleField = form.querySelector('[name="title"]');
            const title = titleField?.value.trim() || '';

            if (!titleField) return;

            if (!title) {
                showSetFieldError(titleField, 'Введите название набора.');
                return;
            }

            if (title.length > 120) {
                showSetFieldError(
                    titleField,
                    'Название набора не должно быть длиннее 120 символов.'
                );
                return;
            }

            setFormLoading(form, true);

            try {
                const isTitleAvailable = await checkSetTitle(form, title);

                if (!isTitleAvailable) {
                    showSetFieldError(
                        titleField,
                        'Набор с таким названием уже существует.'
                    );
                    return;
                }

                const data = await sendSetForm(form);

                if (!data) return;

                const isEdit = form.hasAttribute('data-set-edit-form');

                window.showToast?.({
                    type: 'success',
                    title: isEdit ? 'Набор обновлён' : 'Набор создан',
                    message: isEdit
                        ? `Набор «${data.set.title}» обновлён.`
                        : `Набор «${data.set.title}» создан.`,
                });

                form.dispatchEvent(
                    new CustomEvent(isEdit ? 'set:updated' : 'set:saved', {
                        bubbles: true,
                        detail: data.set,
                    })
                );

                if (isEdit) {
                    const sheet = form.closest('[data-sidebar-sheet]');

                    window.closeSidebarSheet?.(sheet);

                    return;
                }

                const createdSet = data.set;

                await setFormDeps.reloadSets();

                const freshSet =
                    setsState.items.find((item) => {
                        return Number(item.id) === Number(createdSet.id);
                    }) || createdSet;

                const flow = form.closest('[data-create-set-flow]');

                if (flow) {
                    saveCreatedSetToFlow(flow, freshSet);
                    setActiveCreateSetScreen(flow, 'set-created');
                }

                form.reset();
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось сохранить набор',
                    message: 'Проверьте подключение и попробуйте ещё раз.',
                });
            } finally {
                setFormLoading(form, false);
            }
        });
    });
};

const getCardProgressText = (count, required = CARD_REQUIRED_COUNT) => {
    const left = Math.max(0, required - count);

    if (left === 0) {
        return 'Минимум выполнен. Можно продолжить добавлять карточки или перейти к повторению позже.';
    }

    if (left === 1) {
        return 'Добавьте ещё 1 карточку, чтобы набор был готов к повторению.';
    }

    return `Добавьте ещё ${left} карточки, чтобы набор был готов к повторению.`;
};

export const updateCardCreationProgress = (form, cardsCount = 0) => {
    const progress = form.querySelector('[data-card-progress]');
    const countElement = form.querySelector('[data-card-progress-count]');
    const fill = form.querySelector('[data-card-progress-fill]');
    const text = form.querySelector('[data-card-progress-text]');

    if (!progress) return;

    const count = Math.max(0, Number(cardsCount || 0));
    const safeCount = Math.min(count, CARD_REQUIRED_COUNT);
    const percent = Math.min(100, (count / CARD_REQUIRED_COUNT) * 100);

    progress.hidden = false;

    if (countElement) {
        countElement.textContent = `${safeCount} из ${CARD_REQUIRED_COUNT}`;
    }

    if (fill) {
        fill.style.width = `${percent}%`;
    }

    if (text) {
        text.textContent = getCardProgressText(count);
    }

    progress.classList.toggle('is-complete', count >= CARD_REQUIRED_COUNT);
};

export const hideCardCreationProgress = (form) => {
    const progress = form.querySelector('[data-card-progress]');

    if (progress) {
        progress.hidden = true;
    }
};

export const initCreateSetFlowEvents = () => {
    document.addEventListener('click', (event) => {
        const addCardsButton = event.target.closest('[data-created-set-add-cards]');

        if (addCardsButton) {
            event.preventDefault();

            const flow = addCardsButton.closest('[data-create-set-flow]');
            const set = getCreatedSetFromFlow(flow);

            if (!set) return;

            const sheet = addCardsButton.closest('[data-sidebar-sheet]');

            window.closeSidebarSheet?.(sheet);
            resetCreateSetFlow(flow);

            setFormDeps.openCardFormForSet(set, {
                afterSet: true,
            });

            return;
        }

        const openCreatedSetButton = event.target.closest('[data-created-set-open]');

        if (openCreatedSetButton) {
            event.preventDefault();

            const flow = openCreatedSetButton.closest('[data-create-set-flow]');
            const set = getCreatedSetFromFlow(flow);

            if (!set) return;

            const createSetSheet = openCreatedSetButton.closest('[data-sidebar-sheet]');
            const setDetailsSheet = document.querySelector(
                '[data-sidebar-sheet-id="set-details-sheet"]'
            );

            if (!setDetailsSheet) return;

            window.closeSidebarSheet?.(createSetSheet);

            setFormDeps.renderSetDetails(set);
            setFormDeps.loadSetCards(set.id);

            window.openSidebarSheet?.(setDetailsSheet);

            return;
        }

        const nextButton = event.target.closest('[data-create-set-next]');

        if (nextButton) {
            event.preventDefault();

            const flow = nextButton.closest('[data-create-set-flow]');
            const screenName = nextButton.dataset.createSetNext;

            setActiveCreateSetScreen(flow, screenName);

            return;
        }

        const openCreateSetButton = event.target.closest(
            '[data-create-set-open], [data-sidebar-sheet-open="create-set-sheet"]'
        );

        if (openCreateSetButton) {
            const sheet = document.querySelector(
                '[data-sidebar-sheet-id="create-set-sheet"]'
            );

            const flow = sheet?.querySelector('[data-create-set-flow]');

            resetCreateSetFlow(flow);
        }

        const closeCreateSetButton = event.target.closest('[data-sidebar-sheet-close]');

        if (closeCreateSetButton) {
            const sheet = closeCreateSetButton.closest(
                '[data-sidebar-sheet-id="create-set-sheet"]'
            );

            const flow = sheet?.querySelector('[data-create-set-flow]');

            if (flow) {
                resetCreateSetFlow(flow);
            }
        }
    });
};
