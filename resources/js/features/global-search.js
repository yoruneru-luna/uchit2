import {
    globalSearchState,
} from '../shared/state';

import {
    getCsrfToken,
    escapeHtml,
} from '../shared/helpers';

import {
    renderButtonInner,
} from '../shared/render';

let globalSearchDeps = {
    reloadSets: async () => { },
};

export const configureGlobalSearchDeps = (deps = {}) => {
    globalSearchDeps = {
        ...globalSearchDeps,
        ...deps,
    };
};

const getGlobalSearchElements = () => {
    const root = document.querySelector('[data-global-search]');

    return {
        root,
        form: root?.querySelector('[data-global-search-form]'),
        input: root?.querySelector('[data-global-search-input]'),
        start: root?.querySelector('[data-global-search-start]'),
        results: root?.querySelector('[data-global-search-results]'),
        details: root?.querySelector('[data-global-search-details]'),
    };
};

const openGlobalSearch = () => {
    const { root, input } = getGlobalSearchElements();

    if (!root) return;

    root.hidden = false;

    requestAnimationFrame(() => {
        root.classList.add('is-open');
        input?.focus();
    });
};

const closeGlobalSearch = () => {
    const { root } = getGlobalSearchElements();

    if (!root) return;

    root.classList.remove('is-open');

    window.setTimeout(() => {
        root.hidden = true;
    }, 200);
};

const renderGlobalSearchState = (message) => {
    const { start, results, details } = getGlobalSearchElements();

    if (start) {
        start.hidden = true;
    }

    if (details) {
        details.hidden = true;
    }

    if (results) {
        results.hidden = false;
        results.innerHTML = `
            <p class="global-search__state">
                ${escapeHtml(message)}
            </p>
        `;
    }
};

const renderGlobalSearchResults = (sets) => {
    const { start, results, details } = getGlobalSearchElements();

    if (start) {
        start.hidden = true;
    }

    if (details) {
        details.hidden = true;
    }

    if (!results) return;

    results.hidden = false;

    if (!sets.length) {
        results.innerHTML = `
            <p class="global-search__state">
                Ничего не найдено.
            </p>
        `;

        return;
    }

    results.innerHTML = sets.map((set) => {
        const id = Number(set.id);
        const title = escapeHtml(set.title || '');
        const description = escapeHtml(set.description || '');
        const cardsCount = Number(set.cards_count || 0);

        const authorNickname = set.author?.nickname
            ? `@${escapeHtml(set.author.nickname)}`
            : '';

        const authorName = set.author?.name
            ? escapeHtml(set.author.name)
            : '';

        const languageBadge = set.language === 'en'
            ? `<span class="card__badge card__badge--language">EN</span>`
            : '';

        const saveButton = set.is_saved
            ? `
                <button
                    class="card__more button button--primary button--lg button--radius-12 button--icon"
                    type="button"
                    aria-label="Набор уже сохранён"
                    aria-pressed="true"
                    disabled
                >
                    ${renderButtonInner({
                icon: 'check',
                iconSize: 'sm',
            })}
                </button>
            `
            : `
                <button
                    class="card__more button button--primary-soft button--lg button--radius-12 button--icon"
                    type="button"
                    aria-label="Сохранить набор"
                    aria-pressed="false"
                    data-global-search-save="${id}"
                >
                    ${renderButtonInner({
                icon: 'plus',
                iconSize: 'sm',
            })}
                </button>
            `;

        return `
            <article class="card card--search shadow" data-public-set-id="${id}">
                <div class="card__accent"></div>

                <div class="card__main">
                    <div class="card__text">
                        <div class="card__heading">
                            <h3 class="card__title heading heading--4">
                                ${title}
                            </h3>
                        </div>

                        ${description
                ? `
                                    <p class="card__description">
                                        ${description}
                                    </p>
                                `
                : ''
            }
                    </div>

                    <div class="card__actions">
                        ${saveButton}

                        <button
                            class="card__more button button--icon-muted button--lg button--radius-12 button--icon"
                            type="button"
                            aria-label="Посмотреть набор"
                            data-global-search-show="${id}"
                        >
                            ${renderButtonInner({
                icon: 'expand',
                iconSize: 'sm',
            })}
                        </button>
                    </div>

                    <div class="card__meta">
                        <div class="card__badges">
                            <span class="card__badge">
                                Публичный
                            </span>

                            ${languageBadge}
                        </div>

                        <div class="card__meta-line">
                            <span>${cardsCount} карточек</span>

                            ${authorNickname || authorName
                ? `
                                        <span>•</span>
                                        <span>
                                            Автор: ${authorNickname || authorName}
                                        </span>
                                    `
                : ''
            }
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join('');
};

const loadGlobalSearchResults = async (query) => {
    const { form } = getGlobalSearchElements();

    if (!form) return;

    const safeQuery = query.trim();

    if (safeQuery.length < 2) {
        const { start, results, details } = getGlobalSearchElements();

        if (start) {
            start.hidden = false;
        }

        if (results) {
            results.hidden = true;
            results.innerHTML = '';
        }

        if (details) {
            details.hidden = true;
            details.innerHTML = '';
        }

        return;
    }

    if (globalSearchState.abortController) {
        globalSearchState.abortController.abort();
    }

    globalSearchState.abortController = new AbortController();

    renderGlobalSearchState('Ищем наборы...');

    const url = new URL(form.action, window.location.origin);

    url.searchParams.set('q', safeQuery);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            signal: globalSearchState.abortController.signal,
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            renderGlobalSearchState(data.message || 'Не удалось выполнить поиск.');
            return;
        }

        renderGlobalSearchResults(data.sets || []);
    } catch (error) {
        if (error.name === 'AbortError') return;

        console.error(error);
        renderGlobalSearchState('Проверьте подключение и попробуйте ещё раз.');
    }
};

const debounceGlobalSearch = (query) => {
    window.clearTimeout(globalSearchState.debounceTimer);

    globalSearchState.debounceTimer = window.setTimeout(() => {
        loadGlobalSearchResults(query);
    }, 300);
};

const renderPublicSearchCard = (card, index, isLanguageSet) => {
    const number = index + 1;

    const image = card.image_url
        ? `
            <span class="global-public-card__image">
                <img src="${escapeHtml(card.image_url)}" alt="">
            </span>
        `
        : `
            <span class="global-public-card__image global-public-card__image--empty" aria-hidden="true">
                <svg class="icon icon--sm global-public-card__image-icon">
                    <use href="#icon-image"></use>
                </svg>
            </span>
        `;

    const transcription = isLanguageSet && card.transcription
        ? `<span class="global-public-card__transcription">${escapeHtml(card.transcription)}</span>`
        : '';

    const marker = card.marker
        ? `<span class="global-public-card__marker">${escapeHtml(card.marker)}</span>`
        : '';

    const soundButton = isLanguageSet
        ? `
            <button
                class="global-public-card__sound button button--ghost button--sm button--radius-circle button--icon"
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
            <div class="global-public-card__extra">
                <span class="global-public-card__extra-label">Подсказка:</span>
                <span class="global-public-card__extra-text">${escapeHtml(card.hint)}</span>
            </div>
        `
        : '';

    const example = card.example
        ? `
            <div class="global-public-card__extra">
                <span class="global-public-card__extra-label">Пример:</span>
                <span class="global-public-card__extra-text">${escapeHtml(card.example)}</span>
            </div>
        `
        : '';

    return `
        <article class="global-public-card shadow">
            <span class="global-public-card__number">${number}</span>

            ${image}

            <div class="global-public-card__content">
                <div class="global-public-card__term-line">
                    <h4 class="global-public-card__front heading heading--6">
                        ${escapeHtml(card.front)}
                    </h4>

                    ${soundButton}
                </div>

                ${transcription}

                <p class="global-public-card__back text text--small">
                    ${escapeHtml(card.back)}
                </p>

                ${hint}
                ${example}
            </div>

            <div class="global-public-card__meta">
                ${marker}
            </div>
        </article>
    `;
};

const renderPublicSetDetails = (set) => {
    const { start, results, details } = getGlobalSearchElements();

    if (start) {
        start.hidden = true;
    }

    if (results) {
        results.hidden = true;
    }

    if (!details) return;

    const title = escapeHtml(set.title || '');
    const description = escapeHtml(set.description || '');
    const cardsCount = Number(set.cards_count || 0);
    const isLanguageSet = set.language === 'en';

    const authorNickname = set.author?.nickname
        ? `@${escapeHtml(set.author.nickname)}`
        : '';

    const authorName = set.author?.name
        ? escapeHtml(set.author.name)
        : '';

    const author = authorNickname || authorName;

    details.hidden = false;

    details.innerHTML = `
        <button class="global-search__details-back" type="button" data-global-search-back>
            ← Назад
        </button>

        <div class="global-search__details-header">
            <h3 class="global-search__details-title heading heading--3">
                ${title}
            </h3>

            ${description
            ? `
                        <p class="global-search__details-description">
                            ${description}
                        </p>
                    `
            : ''
        }

            <div class="global-search__details-meta">
                ${author ? `<span>${author}</span>` : ''}
                ${author ? '<span>•</span>' : ''}
                <span>${cardsCount} карточек</span>
                ${isLanguageSet ? '<span>•</span><span>EN</span>' : ''}
            </div>
        </div>

        <div class="global-search__public-cards">
            ${(set.cards || []).map((card, index) => {
            return renderPublicSearchCard(card, index, isLanguageSet);
        }).join('')}
        </div>
    `;
};

const loadPublicSetDetails = async (setId) => {
    const { start, results, details } = getGlobalSearchElements();

    if (start) {
        start.hidden = true;
    }

    if (results) {
        results.hidden = true;
    }

    if (details) {
        details.hidden = false;
        details.innerHTML = `
            <p class="global-search__state">
                Загружаем набор...
            </p>
        `;
    }

    try {
        const response = await fetch(`/global-search/sets/${setId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (details) {
                details.innerHTML = `
                    <button class="global-search__details-back" type="button" data-global-search-back>
                        ← Назад
                    </button>

                    <p class="global-search__state">
                        ${escapeHtml(data.message || 'Не удалось загрузить набор.')}
                    </p>
                `;
            }

            return;
        }

        renderPublicSetDetails(data.set);
    } catch (error) {
        console.error(error);

        if (details) {
            details.innerHTML = `
                <button class="global-search__details-back" type="button" data-global-search-back>
                    ← Назад
                </button>

                <p class="global-search__state">
                    Проверьте подключение и попробуйте ещё раз.
                </p>
            `;
        }
    }
};

const savePublicSet = async (setId, button) => {
    button.disabled = true;

    try {
        const response = await fetch(`/global-search/sets/${setId}/save`, {
            method: 'POST',
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
                title: 'Не удалось сохранить набор',
                message: data.message || 'Попробуйте ещё раз.',
            });

            button.disabled = false;
            return;
        }

        window.showToast?.({
            type: 'success',
            title: 'Набор сохранён',
            message: 'Копия появилась в личных наборах.',
        });

        await globalSearchDeps.reloadSets();

        const { input } = getGlobalSearchElements();

        await loadGlobalSearchResults(input?.value || '');
    } catch (error) {
        console.error(error);

        window.showToast?.({
            type: 'error',
            title: 'Не удалось сохранить набор',
            message: 'Проверьте подключение и попробуйте ещё раз.',
        });

        button.disabled = false;
    }
};

export const initGlobalSearchEvents = () => {
    document.addEventListener('click', async (event) => {
        const openButton = event.target.closest('[data-global-search-open]');

        if (openButton) {
            event.preventDefault();

            openGlobalSearch();

            return;
        }

        const closeButton = event.target.closest('[data-global-search-close]');

        if (closeButton) {
            event.preventDefault();

            closeGlobalSearch();

            return;
        }

        const queryChip = event.target.closest('[data-global-search-query]');

        if (queryChip) {
            event.preventDefault();

            const { input } = getGlobalSearchElements();
            const query = queryChip.dataset.globalSearchQuery || '';

            if (input) {
                input.value = query;
                input.focus();
            }

            globalSearchState.query = query;
            await loadGlobalSearchResults(query);

            return;
        }

        const showButton = event.target.closest('[data-global-search-show]');

        if (showButton) {
            event.preventDefault();

            await loadPublicSetDetails(showButton.dataset.globalSearchShow);

            return;
        }

        const saveButton = event.target.closest('[data-global-search-save]');

        if (saveButton) {
            event.preventDefault();

            await savePublicSet(saveButton.dataset.globalSearchSave, saveButton);

            return;
        }

        const backButton = event.target.closest('[data-global-search-back]');

        if (backButton) {
            event.preventDefault();

            const { input, results, details, start } = getGlobalSearchElements();

            if (details) {
                details.hidden = true;
                details.innerHTML = '';
            }

            if (start) {
                start.hidden = true;
            }

            if (results && results.innerHTML.trim()) {
                results.hidden = false;
                return;
            }

            const query = input?.value?.trim() || '';

            if (query.length >= 2) {
                await loadGlobalSearchResults(query);
                return;
            }

            if (start) {
                start.hidden = false;
            }
        }
    });

    document.addEventListener('input', (event) => {
        const input = event.target.closest('[data-global-search-input]');

        if (!input) return;

        globalSearchState.query = input.value;

        debounceGlobalSearch(input.value);
    });

    document.addEventListener('submit', (event) => {
        const form = event.target.closest('[data-global-search-form]');

        if (!form) return;

        event.preventDefault();

        const input = form.querySelector('[data-global-search-input]');

        loadGlobalSearchResults(input?.value || '');
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        const { root } = getGlobalSearchElements();

        if (!root || root.hidden) return;

        closeGlobalSearch();
    });
};
