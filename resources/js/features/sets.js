import {
    setsState,
    categoriesState,
} from '../shared/state';

import {
    getCsrfToken,
    escapeHtml,
    debounce,
} from '../shared/helpers';

import {
    renderButtonInner,
    renderEmptyState,
    renderMiniLearningProgress,
} from '../shared/render';

import {
    pluralizeSets,
    pluralizeCards,
} from '../shared/pluralize';

import {
    closeAllCardMenus,
} from '../shared/menus';

import {
    selectCustomOption,
} from '../shared/ui';

import {
    clearSetFormErrors,
    loadSetCreateData,
} from './set-forms';

let setsDeps = {
    reloadCategories: () => { },
    renderCategories: () => { },
    renderSetCards: () => { },
};

export const configureSetsDeps = (deps = {}) => {
    setsDeps = {
        ...setsDeps,
        ...deps,
    };
};


const getSetsUrl = () => {
    const section = document.querySelector('[data-sets-section]');

    return section?.dataset.setsUrl || '/api/sets';
};

const getSetAccent = () => {
    return '<div class="card__accent"></div>';
};

const renderSetCard = (set) => {
    const id = Number(set.id);
    const title = escapeHtml(set.title);
    const description = escapeHtml(set.description || '');

    const isPublicBlocked = Boolean(set.public_blocked);
    const publicBlockReason = escapeHtml(set.public_block_reason || '');

    const visibilityLabel = isPublicBlocked
        ? 'Публикация заблокирована'
        : (set.visibility === 'public' ? 'Публичный' : 'Личный');

    const languageLabel = set.language === 'en' ? 'EN' : '';
    const categoryTitle = escapeHtml(set.category?.title || '');
    const date = escapeHtml(set.date || '');
    const cardsCount = Number(set.cards_count || 0);

    const color = set.category?.color || '';

    const learningProgress = {
        total: Number(set.learning_progress?.total ?? cardsCount),
        learned: Number(set.learning_progress?.learned ?? 0),
        remaining: Number(set.learning_progress?.remaining ?? cardsCount),
        learned_percent: Number(set.learning_progress?.learned_percent ?? 0),
        remaining_percent: Number(set.learning_progress?.remaining_percent ?? 100),
        fading_percent: Number(set.learning_progress?.fading_percent ?? set.fading ?? 0),
    };

    const accentStyle = color
        ? `style="--card-accent: ${escapeHtml(color)};"`
        : '';

    const accentClass = color ? 'has-accent' : '';

    return `
        <article
            class="card card--set ${accentClass} shadow"
            data-entity-id="set-${id}"
            data-set-id="${id}"
            ${accentStyle}
        >
            ${getSetAccent(set)}

            <div class="card__main">
                <div class="card__text">
                    <div class="card__heading">
                        <h3 class="card__title heading heading--4">
                            ${title}
                            ${categoryTitle ? `<span class="card__category">${categoryTitle}</span>` : ''}
                        </h3>
                    </div>

                    ${description
            ? `<p class="card__description">${description}</p>`
            : ''
        }
        ${isPublicBlocked
            ? `
        <div class="card__notice card__notice--danger">
            <span>Публикация заблокирована администратором</span>

            ${publicBlockReason
                ? `<small>${publicBlockReason}</small>`
                : ''
            }
        </div>
    `
            : ''
        }
                </div>

                <div class="card__actions">
                    <button
                        class="card__more button ${color ? 'button--category-accent' : 'button--primary-soft'} button--lg button--radius-12 button--icon"
                        type="button"
                        data-open-set="${id}"
                        aria-label="Открыть набор"
                    >
                        ${renderButtonInner({
            icon: 'expand',
            iconSize: 'sm',
        })}
                    </button>

                    <div class="card__menu" data-card-menu>
                        <button
                            class="card__more button button--icon-muted button--lg button--radius-12 button--icon"
                            type="button"
                            data-card-menu-toggle
                            aria-expanded="false"
                            aria-haspopup="true"
                        >
                            ${renderButtonInner({
            icon: 'more',
            iconSize: 'sm',
        })}
                        </button>

                        <div class="card-menu shadow--1" data-card-menu-dropdown hidden>
                            <button
                                class="card__btn button button--ghost button--lg button--radius-12 button--align-left"
                                type="button"
                                data-edit-set="${id}"
                            >
                                ${renderButtonInner({
            icon: 'edit',
            iconSize: 'sm',
            text: 'Редактировать',
        })}
                            </button>

                            <button
                                class="card__btn button button--danger-ghost button--lg button--radius-12 button--align-left"
                                type="button"
                                data-delete-set="${id}"
                            >
                                ${renderButtonInner({
            icon: 'trash',
            iconSize: 'sm',
            text: 'Удалить',
        })}
                            </button>
                        </div>
                    </div>
                </div>

                ${renderMiniLearningProgress(learningProgress)}

                <div class="card__meta">
                    <div class="card__badges">
                        ${set.has_source_updates
            ? `<span class="card__badge card__badge--warning">Автор внёс изменения</span>`
            : ''
        }

                        <span class="card__badge ${isPublicBlocked ? 'card__badge--danger' : ''}">
                            ${visibilityLabel}
                        </span>

                        ${languageLabel
            ? `<span class="card__badge card__badge--language">${languageLabel}</span>`
            : ''
        }
                    </div>

                    <div class="card__meta-line">
                        ${date ? `<span>${date}</span>` : ''}
                        ${date ? '<span>•</span>' : ''}
                        <span>${pluralizeCards(cardsCount || 0)}</span>
                    </div>
                </div>
            </div>
        </article>
    `;
};

export const renderSets = () => {
    renderSetsCategoryView();

    const lists = document.querySelectorAll('[data-sets-list]');

    lists.forEach((list) => {
        if (setsState.isLoading) {
            list.innerHTML = `
                <p class="sets-section__empty">
                    Загрузка наборов...
                </p>
            `;
            return;
        }

        if (!setsState.items.length) {
            const hasSearch = Boolean(setsState.search?.trim());

            list.innerHTML = renderEmptyState({
                type: 'sets',
                title: hasSearch ? 'Ничего не найдено' : 'У Вас пока нет наборов',
                text: hasSearch
                    ? 'Попробуйте изменить запрос или создайте новый набор'
                    : 'Создайте первый набор, чтобы начать учить карточки',
                primaryText: 'Создать набор',
                secondaryText: 'Найти набор',
                primaryAction: 'data-sidebar-sheet-open="create-set-sheet"',
                secondaryAction: 'data-global-search-open="data-global-search-open"',
                image: '/images/sets-empty.svg',
            });

            return;
        }

        list.innerHTML = setsState.items.map(renderSetCard).join('');
    });
};

const syncSetSortMenus = () => {
    document.querySelectorAll('[data-sets-sort]').forEach((sortRoot) => {
        sortRoot.dataset.sortBy = setsState.sortBy;
        sortRoot.dataset.sortOrder = setsState.order;

        sortRoot
            .querySelectorAll('[data-sort-group="by"]')
            .forEach((option) => {
                option.classList.toggle(
                    'is-active',
                    option.dataset.value === setsState.sortBy
                );
            });

        sortRoot
            .querySelectorAll('[data-sort-group="order"]')
            .forEach((option) => {
                option.classList.toggle(
                    'is-active',
                    option.dataset.value === setsState.order
                );
            });
    });
};

export const syncSetControls = () => {
    document.querySelectorAll('[data-sets-search]').forEach((input) => {
        if (input.value !== setsState.search) {
            input.value = setsState.search;
        }
    });

    syncSetSortMenus();
};

const loadSets = async () => {
    setsState.isLoading = true;
    renderSets();

    const url = new URL(getSetsUrl(), window.location.origin);

    url.searchParams.set('search', setsState.search);
    url.searchParams.set('sort_by', setsState.sortBy);
    url.searchParams.set('order', setsState.order);

    if (setsState.selectedCategory?.id) {
        url.searchParams.set('category_id', setsState.selectedCategory.id);
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Sets loading failed');
    }

    const data = await response.json();

    setsState.items = data.sets || [];
    setsState.isLoading = false;

    syncSetControls();
    renderSets();
};

export const reloadSets = () => {
    loadSets().catch((error) => {
        console.error(error);

        setsState.isLoading = false;
        renderSets();

        window.showToast?.({
            type: 'error',
            title: 'Не удалось загрузить наборы',
            message: 'Попробуйте обновить страницу.',
        });
    });
};


const getSetDeleteUrl = (setId) => {
    const section = document.querySelector('[data-sets-section]');
    const template = section?.dataset.setDeleteUrlTemplate;

    if (!template) {
        return `/sets/${setId}`;
    }

    return template.replace('__ID__', setId);
};

const fillEditSetForm = async (set) => {
    const form = document.querySelector('[data-set-edit-form]');

    if (!form || !set) return;

    await loadSetCreateData(form);

    const updateUrlTemplate = form.dataset.setUpdateUrlTemplate;

    form.action = updateUrlTemplate.replace('__ID__', set.id);
    form.dataset.setId = set.id;

    const titleInput = form.querySelector('[name="title"]');
    const descriptionInput = form.querySelector('[name="description"]');
    const categoryInput = form.querySelector('[name="category_id"]');
    const languageInput = form.querySelector('[name="language"]');
    const visibilityInput = form.querySelector('[name="visibility"]');

    if (titleInput) {
        titleInput.value = set.title || '';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (descriptionInput) {
        descriptionInput.value = set.description || '';
        descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (categoryInput) {
        const categorySelect = categoryInput.closest('[data-custom-select]');
        const value = set.category_id ? String(set.category_id) : '';

        if (categorySelect) {
            const option = categorySelect.querySelector(
                `[data-custom-select-option][data-value="${value}"]`
            );

            if (option) {
                selectCustomOption(categorySelect, option);
            }
        } else {
            categoryInput.value = value;
        }
    }

    if (languageInput) {
        const languageSelect = languageInput.closest('[data-custom-select]');
        const value = set.language || '';

        if (languageSelect) {
            const option = languageSelect.querySelector(
                `[data-custom-select-option][data-value="${value}"]`
            );

            if (option) {
                selectCustomOption(languageSelect, option);
            }
        } else {
            languageInput.value = value;
        }
    }

    if (visibilityInput) {
        const visibilitySelect = visibilityInput.closest('[data-custom-select]');
        const value = set.visibility || 'private';

        if (visibilitySelect) {
            const option = visibilitySelect.querySelector(
                `[data-custom-select-option][data-value="${value}"]`
            );

            if (option) {
                selectCustomOption(visibilitySelect, option);
            }
        } else {
            visibilityInput.value = value;
        }
    }

    clearSetFormErrors(form);
};

const deleteSet = async (set) => {
    if (!set) return;

    const confirmed = await window.openConfirmDialog({
        title: 'Удалить набор?',
        text: `Набор «${set.title}» будет удалён вместе с карточками.`,
        cancelText: 'Отмена',
        submitText: 'Удалить',
        submitTone: 'danger',
    });

    if (!confirmed) return;

    try {
        const response = await fetch(getSetDeleteUrl(set.id), {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
        });

        const data = await response.json();

        if (!response.ok) {
            window.showToast?.({
                type: 'error',
                title: 'Не удалось удалить',
                message: data.message || 'Попробуйте ещё раз.',
            });

            return;
        }

        setsState.items = setsState.items.filter((item) => {
            return Number(item.id) !== Number(set.id);
        });

        renderSets();
        setsDeps.reloadCategories();

        window.showToast?.({
            type: 'success',
            title: 'Набор удалён',
            message: `Набор «${set.title}» удалён.`,
        });
    } catch (error) {
        console.error(error);

        window.showToast?.({
            type: 'error',
            title: 'Не удалось удалить',
            message: 'Проверьте подключение и попробуйте ещё раз.',
        });
    }
};

const debouncedSetsSearch = debounce((value) => {
    setsState.search = value;
    reloadSets();
}, 300);

export const renderSetDetails = (set) => {
    const root = document.querySelector('[data-set-details]');

    if (!root || !set) return;

    const id = Number(set.id);

    root.dataset.currentSetId = id;
    root.dataset.cardsUrl = `/sets/${id}/cards`;
    root.dataset.language = set.language || '';

    const sheet = root.closest('[data-sidebar-sheet]');

    const categoryTitle = set.category?.title || 'Без категории';
    const cardsCount = Number(set.cards_count || 0);
    const progress = Number(set.progress || 0);
    const fading = Number(set.fading || 0);
    const color = set.category?.color || '';
    const canStartStudy = cardsCount >= 5;

    const repeatButton = canStartStudy
        ? `
            <button
                class="set-details__repeat button button--set-accent button--lg button--radius-12"
                type="button"
                data-start-review="${id}"
                data-open-study-modes="${id}"
            >
                ${renderButtonInner({
            icon: 'graduation-cap',
            iconSize: 'sm',
            text: 'Начать повторение',
            shadow: true,
        })}
            </button>
        `
        : `
            <button
                class="set-details__repeat button button--set-accent button--lg button--radius-12"
                type="button"
                disabled
                aria-disabled="true"
            >
                ${renderButtonInner({
            icon: 'graduation-cap',
            iconSize: 'sm',
            text: 'Начать повторение',
            shadow: true,
        })}
            </button>

            <p class="set-details__study-note text text--small">
                Для начала обучения добавьте минимум 5 карточек.
            </p>
        `;

    if (sheet) {
        if (color) {
            sheet.style.setProperty('--set-accent', color);
        } else {
            sheet.style.removeProperty('--set-accent');
        }
    }

    if (color) {
        root.style.setProperty('--set-accent', color);
    } else {
        root.style.removeProperty('--set-accent');
    }

    root.innerHTML = `
        <section class="set-details__header">
            <div class="set-details__content">
                <h2 class="set-details__title heading heading--2">
                    ${escapeHtml(set.title)}
                </h2>

                ${set.description
            ? `<p class="set-details__description">${escapeHtml(set.description)}</p>`
            : ''
        }

                <div class="set-details__meta">
                    <span>${escapeHtml(categoryTitle)}</span>
                    <span>•</span>
                    <span>${pluralizeCards(cardsCount)}</span>
                </div>
            </div>
        </section>

        <section class="set-details__progress shadow">
            <div class="set-details__progress-header">
                <span class="set-details__progress-title heading heading--6">Прогресс набора</span>
                <span class="set-details__progress-value text text--small">${progress}% освоено</span>
            </div>

            <div class="set-details__line">
                <span
                    class="set-details__line-segment set-details__line-segment--learned"
                    style="width: ${progress}%;"
                ></span>

                ${fading > 0
            ? `<span class="set-details__line-segment set-details__line-segment--fading" style="width: ${fading}%;"></span>`
            : ''
        }
            </div>

            <p class="set-details__progress-text text text--small">
                Выучено ${progress}% из ${cardsCount} карточек
            </p>
        </section>

        <section class="set-details__actions">
            <div class="set-details__repeat-wrap">
                ${repeatButton}
            </div>

            <button
                class="set-details__add-card button button--set-accent-soft button--lg button--radius-12"
                type="button"
                data-create-card-for-set="${id}"
            >
                ${renderButtonInner({
            icon: 'plus',
            iconSize: 'sm',
            text: 'Добавить карточку',
            shadow: true,
        })}
            </button>
        </section>

        <section class="set-details__cards">
            <div class="set-details__cards-header">
                <h5 class="set-details__cards-title heading heading--5">
                    Карточки (${cardsCount})
                </h5>
            </div>

            <div class="set-details__cards-list" data-set-cards-list>
                <p class="set-details__empty">
                    Карточки набора пока не загружены.
                </p>
            </div>
        </section>
    `;
};

export const loadSetCards = async (setId) => {
    const root = document.querySelector('[data-set-details]');
    const list = root?.querySelector('[data-set-cards-list]');

    if (!root || !list || !setId) return;

    const url = root.dataset.cardsUrl || `/sets/${setId}/cards`;

    list.innerHTML = `
        <p class="set-details__empty">
            Загружаем карточки...
        </p>
    `;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            list.innerHTML = `
                <p class="set-details__empty">
                    Не удалось загрузить карточки.
                </p>
            `;

            return;
        }

        setsDeps.renderSetCards(list, data.cards || []);
    } catch (error) {
        console.error(error);

        list.innerHTML = `
            <p class="set-details__empty">
                Проверьте подключение и попробуйте ещё раз.
            </p>
        `;
    }
};


export const initSets = () => {
    if (document.querySelector('[data-sets-section]')) {
        reloadSets();
    }
};

export const initSetEvents = () => {
    document.addEventListener('input', (event) => {
        const input = event.target.closest('[data-sets-search]');

        if (!input) return;

        const value = input.value;

        setsState.search = value;

        document.querySelectorAll('[data-sets-search]').forEach((otherInput) => {
            if (otherInput !== input) {
                otherInput.value = value;
            }
        });

        debouncedSetsSearch(value);
    });

    document.addEventListener('home:sort-change', (event) => {
        const sortRoot = event.target.closest('[data-sets-sort]');

        if (!sortRoot) return;

        setsState.sortBy = event.detail.sortBy;
        setsState.order = event.detail.order;

        syncSetSortMenus();
        reloadSets();
    });

    document.addEventListener('click', async (event) => {
        const categoryButton = event.target.closest('[data-category-select]');

        if (categoryButton) {
            event.preventDefault();

            const categoryId = Number(categoryButton.dataset.categorySelect);

            const isSameCategory =
                Number(setsState.selectedCategory?.id) === categoryId;

            if (isSameCategory) {
                setsState.selectedCategory = null;
                setsState.search = '';

                syncSetControls();
                setsDeps.renderCategories();
                reloadSets();

                const sheet =
                    categoryButton.closest('[data-sidebar-sheet]') ||
                    document.querySelector('[data-sidebar-sheet-id="categories-sheet"]');

                if (sheet) {
                    window.closeSidebarSheet?.(sheet);
                }

                return;
            }

            const category = categoriesState.items.find((item) => {
                return Number(item.id) === categoryId;
            });

            if (!category) return;

            setsState.selectedCategory = category;
            setsState.search = '';

            syncSetControls();
            setsDeps.renderCategories();
            reloadSets();

            const sheet =
                categoryButton.closest('[data-sidebar-sheet]') ||
                document.querySelector('[data-sidebar-sheet-id="categories-sheet"]');

            if (sheet) {
                window.closeSidebarSheet?.(sheet);
            }

            return;
        }

        const categoryBackButton = event.target.closest('[data-sets-category-back]');

        if (categoryBackButton) {
            event.preventDefault();

            setsState.selectedCategory = null;
            setsState.search = '';

            syncSetControls();
            setsDeps.renderCategories();
            reloadSets();

            return;
        }

        const openSetButton = event.target.closest('[data-open-set]');

        if (openSetButton) {
            event.preventDefault();

            const setId = Number(openSetButton.dataset.openSet);

            const set = setsState.items.find((item) => {
                return Number(item.id) === setId;
            });

            if (!set) return;

            const setDetailsSheet = document.querySelector(
                '[data-sidebar-sheet-id="set-details-sheet"]'
            );

            renderSetDetails(set);
            loadSetCards(set.id);
            window.openSidebarSheet?.(setDetailsSheet);

            return;
        }

        const editButton = event.target.closest('[data-edit-set]');

        if (editButton) {
            event.preventDefault();

            const setId = Number(editButton.dataset.editSet);

            const set = setsState.items.find((item) => {
                return Number(item.id) === setId;
            });

            if (!set) return;

            await fillEditSetForm(set);

            const sheet = document.querySelector(
                '[data-sidebar-sheet-id="edit-set-sheet"]'
            );

            closeAllCardMenus?.();
            window.openSidebarSheet?.(sheet);

            return;
        }

        const deleteButton = event.target.closest('[data-delete-set]');

        if (deleteButton) {
            event.preventDefault();

            const setId = Number(deleteButton.dataset.deleteSet);

            const set = setsState.items.find((item) => {
                return Number(item.id) === setId;
            });

            closeAllCardMenus?.();
            deleteSet(set);
        }
    });

    document.addEventListener('set:saved', () => {
        reloadSets();
    });

    document.addEventListener('set:updated', () => {
        reloadSets();
    });

    document.addEventListener('set:deleted', () => {
        reloadSets();
    });
};

const renderSetsCategoryView = () => {
    const views = document.querySelectorAll('[data-sets-category-view]');

    views.forEach((view) => {
        const category = setsState.selectedCategory;

        if (!category) {
            view.hidden = true;
            view.innerHTML = '';
            return;
        }

        const setsCount = Number(category.sets_count || 0);

        view.hidden = false;
        view.innerHTML = `
            <button
                class="sets-category-view__back button button--muted button--noneSize button--radius-12 button--align-left text text--small"
                type="button"
                data-sets-category-back
            >
                ${renderButtonInner({
            icon: 'chevron',
            iconSize: 'xs',
            text: 'Назад',
        })}
            </button>

            <div class="sets-category-view__content">
                <h3 class="sets-category-view__title heading heading--3">
                    ${escapeHtml(category.title)}
                </h3>

                ${category.description
                ? `<p class="sets-category-view__description">${escapeHtml(category.description)}</p>`
                : ''
            }

                <p class="sets-category-view__meta text text--small">
                    ${pluralizeSets(setsCount)}
                </p>
            </div>
        `;
    });
};
