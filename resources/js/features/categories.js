import {
    categoriesState,
    setsState,
} from '../shared/state';

import {
    getCsrfToken,
    escapeHtml,
    debounce,
    setFormLoading,
} from '../shared/helpers';

import {
    renderButtonInner,
    renderEmptyState,
} from '../shared/render';

import {
    pluralizeSets,
} from '../shared/pluralize';

import {
    closeAllCardMenus,
} from '../shared/menus';

import {
    refreshColorFields,
} from '../shared/form-ui';

let categoryDeps = {
    syncSetControls: () => { },
    renderSets: () => { },
    reloadSets: () => { },
    refreshSetCategorySelects: () => { },
};

const applyCategoryToSetsState = (category) => {
    if (!category?.id) return;

    setsState.items = setsState.items.map((set) => {
        const setCategoryId = Number(set.category?.id || set.category_id);

        if (setCategoryId !== Number(category.id)) {
            return set;
        }

        return {
            ...set,
            category_id: category.id,
            category: {
                ...(set.category || {}),
                id: category.id,
                title: category.title,
                description: category.description || '',
                color: category.color || '',
                sets_count: category.sets_count ?? set.category?.sets_count,
                progress: category.progress ?? set.category?.progress,
                fading: category.fading ?? set.category?.fading,
                date: category.date ?? set.category?.date,
            },
        };
    });

    if (Number(setsState.selectedCategory?.id) === Number(category.id)) {
        setsState.selectedCategory = {
            ...setsState.selectedCategory,
            ...category,
        };
    }
};

const getFieldWrapper = (field) => {
    return field.closest('.input, .textarea-field, .category-form__color-field');
};

const clearFieldError = (field) => {
    const wrapper = getFieldWrapper(field);

    if (!wrapper) return;

    wrapper.classList.remove('is-error');

    const oldMessage = wrapper.parentElement?.querySelector('[data-js-field-error]');

    oldMessage?.remove();
};

const showFieldError = (field, message) => {
    const wrapper = getFieldWrapper(field);

    if (!wrapper) return;

    clearFieldError(field);

    wrapper.classList.add('is-error');

    const error = document.createElement('p');

    error.className = 'category-form__message';
    error.dataset.jsFieldError = 'true';
    error.textContent = message;

    wrapper.insertAdjacentElement('afterend', error);
};

const clearCategoryFormErrors = (form) => {
    form.querySelectorAll('.is-error').forEach((element) => {
        element.classList.remove('is-error');
    });

    form.querySelectorAll('[data-js-field-error]').forEach((element) => {
        element.remove();
    });
};

const checkCategoryTitle = async (form, title) => {
    const checkUrl = form.dataset.categoryTitleCheckUrl;

    if (!checkUrl) return true;

    const url = new URL(checkUrl, window.location.origin);

    url.searchParams.set('title', title);

    if (form.dataset.categoryId) {
        url.searchParams.set('ignore_id', form.dataset.categoryId);
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

const sendCategoryForm = async (form) => {
    const formData = new FormData(form);

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
                    showFieldError(field, messages[0]);
                }
            });

            window.showToast?.({
                type: 'error',
                title: 'Не удалось сохранить',
                message: 'Проверьте поля и попробуйте ещё раз.',
            });
        } else {
            window.showToast?.({
                type: 'error',
                title: 'Не удалось сохранить',
                message: data.message || 'Попробуйте ещё раз.',
            });
        }

        return null;
    }

    return data;
};

export const initCategoryForms = () => {
    document.querySelectorAll('[data-category-form]').forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            clearCategoryFormErrors(form);

            const titleField = form.querySelector('[name="title"]');
            const title = titleField?.value.trim() || '';

            if (!titleField) return;

            if (!title) {
                showFieldError(titleField, 'Введите название категории.');
                return;
            }

            if (title.length > 80) {
                showFieldError(
                    titleField,
                    'Название категории не должно быть длиннее 80 символов.'
                );
                return;
            }

            setFormLoading(form, true);

            try {
                const isTitleAvailable = await checkCategoryTitle(form, title);

                if (!isTitleAvailable) {
                    showFieldError(
                        titleField,
                        'Категория с таким названием уже существует.'
                    );
                    return;
                }

                const data = await sendCategoryForm(form);

                if (!data) return;

                const isEdit = form.hasAttribute('data-category-edit-form');

                window.showToast?.({
                    type: 'success',
                    title: isEdit ? 'Категория обновлена' : 'Категория создана',
                    message: isEdit
                        ? `Категория «${data.category.title}» обновлена.`
                        : `Категория «${data.category.title}» добавлена.`,
                });

                form.dispatchEvent(
                    new CustomEvent(isEdit ? 'category:updated' : 'category:saved', {
                        bubbles: true,
                        detail: data.category,
                    })
                );

                if (isEdit) {
                    const sheet = form.closest('[data-sidebar-sheet]');

                    window.closeSidebarSheet?.(sheet);

                    return;
                }

                form.reset();
                refreshColorFields(form);
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось сохранить',
                    message: 'Проверьте подключение и попробуйте ещё раз.',
                });

                showFieldError(
                    titleField,
                    'Не удалось сохранить категорию. Попробуйте ещё раз.'
                );
            } finally {
                setFormLoading(form, false);
            }
        });
    });
};


const getCategoriesUrl = () => {
    const section = document.querySelector('[data-categories-section]');

    return section?.dataset.categoriesUrl || '/api/categories';
};

const getCategoryAccent = (category) => {
    return '<div class="card__accent"></div>';
};

const renderCategoryCard = (category) => {
    const id = Number(category.id);
    const title = escapeHtml(category.title);
    const description = escapeHtml(category.description || '');
    const date = escapeHtml(category.date || '');
    const setsCount = Number(category.sets_count || 0);
    const progress = Number(category.progress || 0);
    const fading = Number(category.fading || 0);

    const isSelectedCategory = Number(setsState.selectedCategory?.id) === id;
    const color = category.color || '';

    const accentStyle = color
        ? `style="--card-accent: ${escapeHtml(color)};"`
        : '';

    const accentClass = color ? 'has-accent' : '';

    return `
    <article
        class="card card--category ${accentClass} shadow"
        data-entity-id="category-${id}"
        data-category-id="${id}"
        ${accentStyle}
    >
        ${getCategoryAccent(category)}

            <div class="card__main">
                <div class="card__text">
                    <div class="card__heading">
                        <h3 class="card__title heading heading--4">
                            ${title} <span class="card__category"></span>
                        </h3>
                    </div>

                    ${description
            ? `<p class="card__description">${description}</p>`
            : ''
        }
                </div>

                <div class="card__actions">
                    <button
    class="card__more card__open-category button button--category-accent button--lg button--radius-12 button--icon ${isSelectedCategory ? 'is-selected' : ''}"
    type="button"
    aria-pressed="${isSelectedCategory ? 'true' : 'false'}"
    data-category-select="${id}"
>
    ${renderButtonInner({
            icon: isSelectedCategory ? 'check' : 'expand',
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
                                data-edit-category="${id}"
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
                                data-delete-category="${id}"
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

                <div class="card__stats">
                    <div class="card__line">
                        <span
                            class="card__line-segment card__line-segment--learned"
                            style="width: ${progress}%;"
                        ></span>

                        ${fading > 0
            ? `<span class="card__line-segment card__line-segment--fading" style="width: ${fading}%;"></span>`
            : ''
        }
                    </div>

                    <div class="card__percent">
                        ${progress}%

                        ${fading > 0
            ? `<span class="card__delta">(-${fading}%)</span>`
            : ''
        }
                    </div>
                </div>

                <div class="card__meta card__meta--stack">
                <div class="card__meta-line">
  ${date ? `<span>${date}</span>` : ''}
  ${date && (setsCount || setsCount === 0) ? '<span>•</span>' : ''}
  <span>${pluralizeSets(setsCount || 0)}</span>
</div>
            </div>
            </div>
        </article>
    `;
};

export const renderCategories = () => {
    const lists = document.querySelectorAll('[data-categories-list]');

    lists.forEach((list) => {
        if (categoriesState.isLoading) {
            list.innerHTML = `
                <p class="categories-section__empty">
                    Загрузка категорий...
                </p>
            `;
            return;
        }

        if (!categoriesState.items.length) {
            const hasSearch = Boolean(categoriesState.search?.trim());

            list.innerHTML = renderEmptyState({
                type: 'categories',
                title: hasSearch ? 'Ничего не найдено' : 'У Вас пока нет категорий',
                text: hasSearch
                    ? 'Попробуйте изменить запрос или создайте новую категорию'
                    : 'Создайте первую категорию, чтобы легче находить нужное',
                primaryText: 'Создать категорию',
                secondaryText: 'Найти другое',
                primaryAction: 'data-sidebar-sheet-open="create-category-sheet"',
                secondaryAction: 'data-global-search-open="data-global-search-open"',
                image: '/images/categories-empty.svg',
            })

            return;
        }

        list.innerHTML = categoriesState.items.map(renderCategoryCard).join('');
    });
};

const syncCategorySortMenus = () => {
    document.querySelectorAll('[data-categories-sort]').forEach((sortRoot) => {
        sortRoot.dataset.sortBy = categoriesState.sortBy;
        sortRoot.dataset.sortOrder = categoriesState.order;

        sortRoot
            .querySelectorAll('[data-sort-group="by"]')
            .forEach((option) => {
                option.classList.toggle(
                    'is-active',
                    option.dataset.value === categoriesState.sortBy
                );
            });

        sortRoot
            .querySelectorAll('[data-sort-group="order"]')
            .forEach((option) => {
                option.classList.toggle(
                    'is-active',
                    option.dataset.value === categoriesState.order
                );
            });
    });
};

const syncCategoryControls = () => {
    document.querySelectorAll('[data-categories-search]').forEach((input) => {
        if (input.value !== categoriesState.search) {
            input.value = categoriesState.search;
        }
    });

    syncCategorySortMenus();
};

const loadCategories = async () => {
    categoriesState.isLoading = true;
    renderCategories();

    const url = new URL(getCategoriesUrl(), window.location.origin);

    url.searchParams.set('search', categoriesState.search);
    url.searchParams.set('sort_by', categoriesState.sortBy);
    url.searchParams.set('order', categoriesState.order);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Categories loading failed');
    }

    const data = await response.json();

    categoriesState.items = data.categories || [];
    categoriesState.isLoading = false;

    syncCategoryControls();
    renderCategories();
};

export const reloadCategories = () => {
    loadCategories().catch((error) => {
        console.error(error);

        categoriesState.isLoading = false;
        renderCategories();

        window.showToast?.({
            type: 'error',
            title: 'Не удалось загрузить категории',
            message: 'Попробуйте обновить страницу.',
        });
    });
};

const debouncedSearch = debounce((value) => {
    categoriesState.search = value;
    reloadCategories();
}, 300);

const fillEditCategoryForm = (category) => {
    const form = document.querySelector('[data-category-edit-form]');

    if (!form || !category) return;

    const updateUrlTemplate = form.dataset.categoryUpdateUrlTemplate;

    form.action = updateUrlTemplate.replace('__ID__', category.id);
    form.dataset.categoryId = category.id;

    const titleInput = form.querySelector('[name="title"]');
    const descriptionInput = form.querySelector('[name="description"]');
    const hasColorInput = form.querySelector('[name="has_color"]');
    const colorInput = form.querySelector('[name="color"]');
    const colorValue = form.querySelector('[data-color-value]');

    if (titleInput) {
        titleInput.value = category.title || '';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (descriptionInput) {
        descriptionInput.value = category.description || '';
        descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (hasColorInput && colorInput && colorValue) {
        const hasColor = Boolean(category.color);

        hasColorInput.checked = hasColor;
        colorInput.disabled = !hasColor;
        colorInput.value = category.color || '#f3cedd';
        colorValue.textContent = hasColor ? colorInput.value : 'Без цвета';
    }

    form.querySelectorAll('.is-error').forEach((item) => {
        item.classList.remove('is-error');
    });

    form.querySelectorAll('[data-js-field-error]').forEach((item) => {
        item.remove();
    });
};

const getCategoryDeleteUrl = (categoryId) => {
    const section = document.querySelector('[data-categories-section]');
    const template = section?.dataset.categoryDeleteUrlTemplate;

    if (!template) {
        return `/categories/${categoryId}`;
    }

    return template.replace('__ID__', categoryId);
};

const deleteCategory = async (category) => {
    if (!category) return;

    const confirmed = await window.openConfirmDialog({
        title: 'Удалить категорию?',
        text: `Категория «${category.title}» будет удалена. Наборы останутся без категории.`,
        cancelText: 'Отмена',
        submitText: 'Удалить',
        submitTone: 'danger',
    });

    if (!confirmed) return;

    const response = await fetch(getCategoryDeleteUrl(category.id), {
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

    categoriesState.items = categoriesState.items.filter((item) => {
        return Number(item.id) !== Number(category.id);
    });

    const isDeletedCategorySelected =
        Number(setsState.selectedCategory?.id) === Number(category.id);

    if (isDeletedCategorySelected) {
        setsState.selectedCategory = null;
        setsState.search = '';
    }

    categoryDeps.syncSetControls();
    renderCategories();
    categoryDeps.reloadSets();
    categoryDeps.refreshSetCategorySelects();

    window.showToast?.({
        type: 'success',
        title: 'Категория удалена',
        message: `Категория «${category.title}» удалена.`,
    });

    document.dispatchEvent(
        new CustomEvent('category:deleted', {
            bubbles: true,
            detail: {
                id: category.id,
            },
        })
    );
};

export const initCategoryEvents = (deps = {}) => {
    categoryDeps = {
        ...categoryDeps,
        ...deps,
    };

    document.addEventListener('input', (event) => {
        const input = event.target.closest('[data-categories-search]');

        if (!input) return;

        const value = input.value;

        categoriesState.search = value;

        document.querySelectorAll('[data-categories-search]').forEach((otherInput) => {
            if (otherInput !== input) {
                otherInput.value = value;
            }
        });

        debouncedSearch(value);
    });

    document.addEventListener('home:sort-change', (event) => {
        const sortRoot = event.target.closest('[data-categories-sort]');

        if (!sortRoot) return;

        categoriesState.sortBy = event.detail.sortBy;
        categoriesState.order = event.detail.order;

        syncCategorySortMenus();
        reloadCategories();
    });

    document.addEventListener('click', (event) => {
        const editButton = event.target.closest('[data-edit-category]');

        if (editButton) {
            event.preventDefault();

            const categoryId = Number(editButton.dataset.editCategory);

            const category = categoriesState.items.find((item) => {
                return Number(item.id) === categoryId;
            });

            if (!category) return;

            fillEditCategoryForm(category);

            const sheet = document.querySelector(
                '[data-sidebar-sheet-id="edit-category-sheet"]'
            );

            closeAllCardMenus?.();
            window.openSidebarSheet?.(sheet);

            return;
        }

        const deleteButton = event.target.closest('[data-delete-category]');

        if (deleteButton) {
            event.preventDefault();

            const categoryId = Number(deleteButton.dataset.deleteCategory);

            const category = categoriesState.items.find((item) => {
                return Number(item.id) === categoryId;
            });

            if (!category) return;

            closeAllCardMenus?.();
            deleteCategory(category);
        }
    });

    document.addEventListener('category:saved', () => {
        reloadCategories();
        categoryDeps.refreshSetCategorySelects();
    });

    document.addEventListener('category:updated', (event) => {
        const category = event.detail?.category || event.detail;

        if (category?.id) {
            categoriesState.items = categoriesState.items.map((item) => {
                return Number(item.id) === Number(category.id)
                    ? {
                        ...item,
                        ...category,
                    }
                    : item;
            });

            applyCategoryToSetsState(category);
        }

        renderCategories();
        categoryDeps.renderSets();
        categoryDeps.refreshSetCategorySelects();

        reloadCategories();
    });
};

export const initCategories = () => {
    if (document.querySelector('[data-categories-section]')) {
        reloadCategories();
    }
};
