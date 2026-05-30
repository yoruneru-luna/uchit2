import {
    getCsrfToken,
    escapeHtml,
} from '../shared/helpers';

import {
    renderButtonInner,
} from '../shared/render';

const adminState = {
    panels: [],
    activeTab: 'users',
    search: '',
    users: [],
    publicSets: [],
    selectedSet: null,
    debounceId: null,
};

const replaceUrlId = (template, id) => {
    return String(template || '').replace('__ID__', id);
};

const getPanelUrls = (panel) => {
    return {
        users: panel.dataset.adminUsersUrl,
        publicSets: panel.dataset.adminPublicSetsUrl,
        publicSet: panel.dataset.adminPublicSetUrlTemplate,
        userBlock: panel.dataset.adminUserBlockUrlTemplate,
        userUnblock: panel.dataset.adminUserUnblockUrlTemplate,
        publicSetBlock: panel.dataset.adminPublicSetBlockUrlTemplate,
        publicSetUnblock: panel.dataset.adminPublicSetUnblockUrlTemplate,
    };
};

const getActivePanel = (target) => {
    return target.closest('[data-admin-panel]');
};

const setAdminLoading = (panel, isLoading) => {
    panel.classList.toggle('is-loading', isLoading);
};

const renderAdminStatus = (isBlocked, blockedText = 'Заблокирован') => {
    return isBlocked
        ? `<span class="admin-card__status admin-card__status--blocked">${blockedText}</span>`
        : `<span class="admin-card__status admin-card__status--active">Активен</span>`;
};

const renderAdminUsers = (panel) => {
    const list = panel.querySelector('[data-admin-users-list]');
    const empty = panel.querySelector('[data-admin-users-empty]');

    if (!list || !empty) return;

    if (!adminState.users.length) {
        list.innerHTML = '';
        empty.hidden = false;
        return;
    }

    empty.hidden = true;

    list.innerHTML = adminState.users.map((user) => {
        const isBlocked = Boolean(user.is_blocked);
        const isAdmin = Boolean(user.is_admin);

        return `
            <article class="admin-card shadow" data-admin-user-id="${user.id}">
                <div class="admin-card__main">
                    <div class="admin-card__head">
                        <h4 class="admin-card__title heading heading--4">
                            ${escapeHtml(user.name || 'Без имени')}
                        </h4>

                        ${renderAdminStatus(isBlocked)}
                    </div>

                    <p class="admin-card__meta text text--small">
                        @${escapeHtml(user.nickname || 'user')} · ${escapeHtml(user.email || '')}
                    </p>

                    <p class="admin-card__meta text text--small">
                        Роль: ${isAdmin ? 'администратор' : 'пользователь'}
                    </p>

                    <div class="admin-card__activity">
                        <span>${Number(user.activity?.sets_count || 0)} наборов</span>
                        <span>${Number(user.activity?.cards_count || 0)} карточек</span>
                        <span>${Number(user.activity?.reviews_count || 0)} повторений</span>
                    </div>

                    ${user.last_login_at
                ? `<p class="admin-card__note text text--small">Последний вход: ${escapeHtml(user.last_login_at)}</p>`
                : ''
            }

                    ${isBlocked && user.blocked_reason
                ? `<p class="admin-card__reason text text--small">Причина: ${escapeHtml(user.blocked_reason)}</p>`
                : ''
            }
                </div>

                <div class="admin-card__actions">
                    ${isBlocked
                ? `
                                <button
                                    class="button button--primary-soft button--sm button--radius-12"
                                    type="button"
                                    data-admin-user-unblock="${user.id}"
                                    ${isAdmin ? 'disabled' : ''}
                                >
                                    ${renderButtonInner({
                    icon: 'check',
                    iconSize: 'xs',
                    text: 'Разблокировать',
                })}
                                </button>
                            `
                : `
                                <button
                                    class="button button--danger-ghost button--sm button--radius-12"
                                    type="button"
                                    data-admin-user-block="${user.id}"
                                    ${isAdmin ? 'disabled' : ''}
                                >
                                    ${renderButtonInner({
                    icon: 'ban',
                    iconSize: 'xs',
                    text: 'Заблокировать',
                })}
                                </button>
                            `
            }
                </div>
            </article>
        `;
    }).join('');
};

const renderAdminPublicSets = (panel) => {
    const list = panel.querySelector('[data-admin-public-sets-list]');
    const empty = panel.querySelector('[data-admin-public-sets-empty]');

    if (!list || !empty) return;

    if (!adminState.publicSets.length) {
        list.innerHTML = '';
        empty.hidden = false;
        return;
    }

    empty.hidden = true;

    list.innerHTML = adminState.publicSets.map((set) => {
        const isBlocked = Boolean(set.public_blocked);

        return `
            <article class="admin-card shadow" data-admin-public-set-id="${set.id}">
                <div class="admin-card__main">
                    <div class="admin-card__head">
                        <h4 class="admin-card__title heading heading--4">
                            ${escapeHtml(set.title || 'Без названия')}
                        </h4>

                        ${isBlocked
                ? renderAdminStatus(true, 'Публикация заблокирована')
                : `<span class="admin-card__status admin-card__status--public">Публичный</span>`
            }
                    </div>

                    ${set.description
                ? `<p class="admin-card__description text text--small">${escapeHtml(set.description)}</p>`
                : ''
            }

                    <p class="admin-card__meta text text--small">
                        Автор: ${escapeHtml(set.author?.name || 'Без имени')}
                        ${set.author?.nickname ? `@${escapeHtml(set.author.nickname)}` : ''}
                    </p>

                    <p class="admin-card__meta text text--small">
                        ${Number(set.cards_count || 0)} карточек · обновлён ${escapeHtml(set.updated_at || '')}
                    </p>

                    ${isBlocked && set.public_block_reason
                ? `<p class="admin-card__reason text text--small">Причина: ${escapeHtml(set.public_block_reason)}</p>`
                : ''
            }
                </div>

                <div class="admin-card__actions">
                    <button
                        class="button button--ghost button--sm button--radius-12"
                        type="button"
                        data-admin-public-set-open="${set.id}"
                    >
                        ${renderButtonInner({
                icon: 'expand',
                iconSize: 'xs',
                text: 'Просмотреть',
            })}
                    </button>

                    ${isBlocked
                ? `
                                <button
                                    class="button button--primary-soft button--sm button--radius-12"
                                    type="button"
                                    data-admin-public-set-unblock="${set.id}"
                                >
                                    ${renderButtonInner({
                    icon: 'check',
                    iconSize: 'xs',
                    text: 'Разблокировать',
                })}
                                </button>
                            `
                : `
                                <button
                                    class="button button--danger-ghost button--sm button--radius-12"
                                    type="button"
                                    data-admin-public-set-block="${set.id}"
                                >
                                    ${renderButtonInner({
                    icon: 'ban',
                    iconSize: 'xs',
                    text: 'Заблокировать',
                })}
                                </button>
                            `
            }
                </div>
            </article>
        `;
    }).join('');
};

const renderAdminPublicSetPreview = (panel) => {
    const preview = panel.querySelector('[data-admin-public-set-preview]');
    const set = adminState.selectedSet;

    if (!preview) return;

    panel.querySelectorAll('[data-admin-public-set-id]').forEach((card) => {
        card.classList.remove('is-preview-open');
    });

    if (!set) {
        preview.hidden = true;
        preview.innerHTML = '';
        return;
    }

    const selectedCard = panel.querySelector(
        `[data-admin-public-set-id="${set.id}"]`
    );

    if (!selectedCard) {
        preview.hidden = true;
        preview.innerHTML = '';
        return;
    }

    selectedCard.classList.add('is-preview-open');

    if (!selectedCard.contains(preview)) {
        selectedCard.append(preview);
    }

    preview.hidden = false;

    preview.innerHTML = `
        <div class="admin-preview">
            <div class="admin-preview__header">
                <h4 class="admin-preview__title heading heading--4">
                    Карточки набора
                </h4>

                <button
                    class="button button--icon-muted button--sm button--radius-circle button--icon"
                    type="button"
                    aria-label="Закрыть просмотр"
                    data-admin-public-set-preview-close
                >
                    ${renderButtonInner({
        icon: 'close',
        iconSize: 'xs',
    })}
                </button>
            </div>

            <div class="admin-preview__cards">
                ${set.cards?.length
            ? set.cards.map((card, index) => {
                return `
                                <article class="admin-preview-card">
                                    <div class="admin-preview-card__number">
                                        ${index + 1}
                                    </div>

                                    <div class="admin-preview-card__content">
                                        <div class="admin-preview-card__row">
                                            <span class="admin-preview-card__label">Сторона 1</span>
                                            <p>${escapeHtml(card.front || '')}</p>
                                        </div>

                                        <div class="admin-preview-card__row">
                                            <span class="admin-preview-card__label">Сторона 2</span>
                                            <p>${escapeHtml(card.back || '')}</p>
                                        </div>

                                        ${card.marker
                        ? `
                                                    <div class="admin-preview-card__row">
                                                        <span class="admin-preview-card__label">Маркер</span>
                                                        <p>${escapeHtml(card.marker)}</p>
                                                    </div>
                                                `
                        : ''
                    }

                                        ${card.transcription
                        ? `
                                                    <div class="admin-preview-card__row">
                                                        <span class="admin-preview-card__label">Транскрипция</span>
                                                        <p>${escapeHtml(card.transcription)}</p>
                                                    </div>
                                                `
                        : ''
                    }

                                        ${card.example
                        ? `
                                                    <div class="admin-preview-card__row">
                                                        <span class="admin-preview-card__label">Пример</span>
                                                        <p>${escapeHtml(card.example)}</p>
                                                    </div>
                                                `
                        : ''
                    }

                                        ${card.hint
                        ? `
                                                    <div class="admin-preview-card__row">
                                                        <span class="admin-preview-card__label">Подсказка</span>
                                                        <p>${escapeHtml(card.hint)}</p>
                                                    </div>
                                                `
                        : ''
                    }

                                        ${card.image_url
                        ? `
                                                    <div class="admin-preview-card__image">
                                                        <img src="${escapeHtml(card.image_url)}" alt="">
                                                    </div>
                                                `
                        : ''
                    }
                                    </div>
                                </article>
                            `;
            }).join('')
            : '<p class="text text--small">В наборе нет карточек.</p>'
        }
            </div>
        </div>
    `;
};

const setAdminTab = (panel, tab) => {
    adminState.activeTab = tab;
    adminState.selectedSet = null;

    panel.querySelectorAll('[data-admin-tab]').forEach((button) => {
        const isActive = button.dataset.adminTab === tab;

        button.classList.toggle('is-active', isActive);
    });

    panel.querySelectorAll('[data-admin-screen]').forEach((screen) => {
        screen.hidden = screen.dataset.adminScreen !== tab;
    });

    const search = panel.querySelector('[data-admin-search]');

    if (search) {
        search.value = '';
    }

    adminState.search = '';

    renderAdminPublicSetPreview(panel);

    if (tab === 'users') {
        loadAdminUsers(panel);
        return;
    }

    loadAdminPublicSets(panel);
};

const requestJson = async (url, options = {}) => {
    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Не удалось выполнить действие.');
    }

    return data;
};

const loadAdminUsers = async (panel) => {
    const urls = getPanelUrls(panel);
    const query = adminState.search ? `?q=${encodeURIComponent(adminState.search)}` : '';

    setAdminLoading(panel, true);

    try {
        const data = await requestJson(`${urls.users}${query}`);

        adminState.users = data.users || [];
        renderAdminUsers(panel);
    } catch (error) {
        console.error(error);

        window.showToast?.({
            type: 'error',
            title: 'Не удалось загрузить пользователей',
            message: error.message || 'Попробуйте ещё раз.',
        });
    } finally {
        setAdminLoading(panel, false);
    }
};

const loadAdminPublicSets = async (panel) => {
    const urls = getPanelUrls(panel);
    const query = adminState.search ? `?q=${encodeURIComponent(adminState.search)}` : '';

    setAdminLoading(panel, true);

    try {
        const data = await requestJson(`${urls.publicSets}${query}`);

        adminState.publicSets = data.sets || [];
        renderAdminPublicSets(panel);
    } catch (error) {
        console.error(error);

        window.showToast?.({
            type: 'error',
            title: 'Не удалось загрузить публичные наборы',
            message: error.message || 'Попробуйте ещё раз.',
        });
    } finally {
        setAdminLoading(panel, false);
    }
};

const loadAdminPublicSet = async (panel, setId) => {
    const urls = getPanelUrls(panel);

    setAdminLoading(panel, true);

    try {
        const data = await requestJson(replaceUrlId(urls.publicSet, setId));

        adminState.selectedSet = data.set || null;
        renderAdminPublicSetPreview(panel);
    } catch (error) {
        console.error(error);

        window.showToast?.({
            type: 'error',
            title: 'Не удалось открыть набор',
            message: error.message || 'Попробуйте ещё раз.',
        });
    } finally {
        setAdminLoading(panel, false);
    }
};

const sendAdminAction = async (url, reason = null) => {
    const formData = new FormData();

    if (reason !== null) {
        formData.set('reason', reason);
    }

    return requestJson(url, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
        },
    });
};

const askReason = (message) => {
    const reason = window.prompt(message || 'Укажите причину блокировки');

    if (reason === null) {
        return null;
    }

    return reason.trim();
};

export const initAdminPanel = () => {
    adminState.panels = [...document.querySelectorAll('[data-admin-panel]')];

    if (!adminState.panels.length) return;

    adminState.panels.forEach((panel) => {
        loadAdminUsers(panel);
    });

    document.addEventListener('click', async (event) => {
        const tabButton = event.target.closest('[data-admin-tab]');

        if (tabButton) {
            event.preventDefault();

            const panel = getActivePanel(tabButton);

            if (!panel) return;

            setAdminTab(panel, tabButton.dataset.adminTab);

            return;
        }

        const previewClose = event.target.closest('[data-admin-public-set-preview-close]');

        if (previewClose) {
            event.preventDefault();

            const panel = getActivePanel(previewClose);

            if (!panel) return;

            adminState.selectedSet = null;
            renderAdminPublicSetPreview(panel);

            return;
        }

        const openSetButton = event.target.closest('[data-admin-public-set-open]');

        if (openSetButton) {
            event.preventDefault();

            const panel = getActivePanel(openSetButton);

            if (!panel) return;

            const setId = Number(openSetButton.dataset.adminPublicSetOpen);

            if (!setId) return;

            if (Number(adminState.selectedSet?.id) === setId) {
                adminState.selectedSet = null;
                renderAdminPublicSetPreview(panel);

                return;
            }

            await loadAdminPublicSet(panel, setId);

            return;
        }

        const blockUserButton = event.target.closest('[data-admin-user-block]');

        if (blockUserButton) {
            event.preventDefault();

            const panel = getActivePanel(blockUserButton);

            if (!panel) return;

            const reason = askReason('Причина блокировки пользователя');

            if (reason === null) return;

            const urls = getPanelUrls(panel);
            const url = replaceUrlId(urls.userBlock, blockUserButton.dataset.adminUserBlock);

            blockUserButton.disabled = true;

            try {
                await sendAdminAction(url, reason);
                await loadAdminUsers(panel);

                window.showToast?.({
                    type: 'success',
                    title: 'Пользователь заблокирован',
                    message: 'Ограничение применено.',
                });
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось заблокировать',
                    message: error.message || 'Попробуйте ещё раз.',
                });
            } finally {
                blockUserButton.disabled = false;
            }

            return;
        }

        const unblockUserButton = event.target.closest('[data-admin-user-unblock]');

        if (unblockUserButton) {
            event.preventDefault();

            const panel = getActivePanel(unblockUserButton);

            if (!panel) return;

            const confirmed = window.confirm('Разблокировать пользователя?');

            if (!confirmed) return;

            const urls = getPanelUrls(panel);
            const url = replaceUrlId(urls.userUnblock, unblockUserButton.dataset.adminUserUnblock);

            unblockUserButton.disabled = true;

            try {
                await sendAdminAction(url);
                await loadAdminUsers(panel);

                window.showToast?.({
                    type: 'success',
                    title: 'Пользователь разблокирован',
                    message: 'Ограничение снято.',
                });
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось разблокировать',
                    message: error.message || 'Попробуйте ещё раз.',
                });
            } finally {
                unblockUserButton.disabled = false;
            }

            return;
        }

        const blockSetButton = event.target.closest('[data-admin-public-set-block]');

        if (blockSetButton) {
            event.preventDefault();

            const panel = getActivePanel(blockSetButton);

            if (!panel) return;

            const reason = askReason('Причина блокировки публикации набора');

            if (reason === null) return;

            const urls = getPanelUrls(panel);
            const url = replaceUrlId(urls.publicSetBlock, blockSetButton.dataset.adminPublicSetBlock);

            blockSetButton.disabled = true;

            try {
                await sendAdminAction(url, reason);
                await loadAdminPublicSets(panel);

                if (adminState.selectedSet?.id === Number(blockSetButton.dataset.adminPublicSetBlock)) {
                    await loadAdminPublicSet(panel, blockSetButton.dataset.adminPublicSetBlock);
                }

                window.showToast?.({
                    type: 'success',
                    title: 'Публикация заблокирована',
                    message: 'Набор скрыт из публичного поиска.',
                });
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось заблокировать',
                    message: error.message || 'Попробуйте ещё раз.',
                });
            } finally {
                blockSetButton.disabled = false;
            }

            return;
        }

        const unblockSetButton = event.target.closest('[data-admin-public-set-unblock]');

        if (unblockSetButton) {
            event.preventDefault();

            const panel = getActivePanel(unblockSetButton);

            if (!panel) return;

            const confirmed = window.confirm('Разблокировать публикацию набора?');

            if (!confirmed) return;

            const urls = getPanelUrls(panel);
            const url = replaceUrlId(urls.publicSetUnblock, unblockSetButton.dataset.adminPublicSetUnblock);

            unblockSetButton.disabled = true;

            try {
                await sendAdminAction(url);
                await loadAdminPublicSets(panel);

                if (adminState.selectedSet?.id === Number(unblockSetButton.dataset.adminPublicSetUnblock)) {
                    await loadAdminPublicSet(panel, unblockSetButton.dataset.adminPublicSetUnblock);
                }

                window.showToast?.({
                    type: 'success',
                    title: 'Публикация разблокирована',
                    message: 'Пользователь снова сможет сделать набор публичным.',
                });
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось разблокировать',
                    message: error.message || 'Попробуйте ещё раз.',
                });
            } finally {
                unblockSetButton.disabled = false;
            }

            return;
        }
    });

    document.addEventListener('input', (event) => {
        const input = event.target.closest('[data-admin-search]');

        if (!input) return;

        const panel = getActivePanel(input);

        if (!panel) return;

        window.clearTimeout(adminState.debounceId);

        adminState.debounceId = window.setTimeout(() => {
            adminState.search = input.value.trim();
            adminState.selectedSet = null;

            renderAdminPublicSetPreview(panel);

            if (adminState.activeTab === 'users') {
                loadAdminUsers(panel);
                return;
            }

            loadAdminPublicSets(panel);
        }, 300);
    });
};
