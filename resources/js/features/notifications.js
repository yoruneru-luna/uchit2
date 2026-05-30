import {
    notificationsState,
} from '../shared/state';

import {
    getCsrfToken,
    escapeHtml,
} from '../shared/helpers';

import {
    renderButtonInner,
} from '../shared/render';

const NOTIFICATIONS_POLL_INTERVAL = 30 * 1000;

let notificationsPollingId = null;

const getNotificationIcon = (type) => {
    if (type === 'review_due') return 'bell-ring';
    if (type === 'achievement') return 'trophy';
    if (type === 'system') return 'setting';
    if (type === 'review_overdue') return 'bell-ring';
    if (type === 'set_saved') return 'book';

    return 'bell';
};

const getNotificationTone = (type) => {
    if (type === 'review_due') return 'purple';
    if (type === 'set_saved') return 'purple';
    if (type === 'sets_milestone') return 'orange';
    if (type === 'cards_milestone') return 'teal';
    if (type === 'achievement') return 'orange';
    if (type === 'review_overdue') return 'orange';
    if (type === 'system') return 'blue';

    return 'purple';
};

const renderNotificationIconBox = (icon, tone = 'purple') => {
    return `
        <span class="icon-box icon-box--md icon-box--${escapeHtml(tone)} notification-card__icon-box">
            <svg class="icon icon--sm icon-box__icon">
                <use href="#icon-${escapeHtml(icon)}"></use>
            </svg>
        </span>
    `;
};

const updateNotificationsBadge = () => {
    const badge = document.querySelector('[data-notifications-badge]');

    if (!badge) return;

    const count = Number(notificationsState.unreadCount || 0);

    badge.hidden = count <= 0;

    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : String(count);
    }
};

const renderNotifications = () => {
    const content = document.querySelector('[data-notifications-content]');
    const list = document.querySelector('[data-notifications-list]');
    const empty = document.querySelector('[data-notifications-empty]');
    const actions = document.querySelector('[data-notifications-actions]');

    if (!list || !empty || !actions) {
        updateNotificationsBadge();
        return;
    }

    const notifications = Array.isArray(notificationsState.items)
        ? notificationsState.items
        : [];

    content?.classList.toggle('has-notifications', notifications.length > 0);

    if (actions) {
        actions.hidden = notifications.length === 0;
    }

    if (!list || !empty) {
        updateNotificationsBadge();
        return;
    }

    if (!notifications.length) {
        list.hidden = true;
        list.innerHTML = '';

        actions.hidden = true;
        empty.hidden = false;

        updateNotificationsBadge();

        return;
    }

    empty.hidden = true;
    actions.hidden = false;
    list.hidden = false;

    list.innerHTML = notifications.map((notification) => {
        const icon = getNotificationIcon(notification.type);
        const tone = getNotificationTone(notification.type);
        const isReviewDue = ['review_due', 'review_overdue'].includes(notification.type);

        return `
            <article
                class="notification-card shadow ${notification.is_read ? '' : 'is-unread'}"
                data-notification-id="${notification.id}"
            >
                ${renderNotificationIconBox(icon, tone)}

                <button
                    class="notification-card__content text text--small"
                    type="button"
                    ${isReviewDue ? 'data-notification-start-due' : ''}
                >
                    <h4 class="notification-card__title">
                        ${escapeHtml(notification.title || '')}
                    </h4>

                    ${notification.message
                ? `
                                <p class="notification-card__message">
                                    ${escapeHtml(notification.message)}
                                </p>
                            `
                : ''
            }

                    <p class="notification-card__time">
                        ${escapeHtml(notification.date || '')}
                    </p>
                </button>

                <button
                    class="notification-card__delete button button--danger-ghost button--sm button--radius-circle button--icon"
                    type="button"
                    aria-label="Удалить уведомление"
                    data-notification-delete="${notification.id}"
                >
                    ${renderButtonInner({
                icon: 'trash',
                iconSize: 'xs',
            })}
                </button>
            </article>
        `;
    }).join('');

    updateNotificationsBadge();
};

export const loadNotifications = async () => {
    try {
        const response = await fetch('/notifications', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Notifications loading failed');
        }

        notificationsState.items = data.notifications || [];
        notificationsState.unreadCount = Number(data.unread_count || 0);

        renderNotifications();
        updateNotificationsBadge();
    } catch (error) {
        console.error(error);
    }
};

const markAllNotificationsRead = async () => {
    try {
        const response = await fetch('/notifications/read-all', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
        });

        if (!response.ok) return;

        notificationsState.unreadCount = 0;

        notificationsState.items = notificationsState.items.map((item) => {
            return {
                ...item,
                is_read: true,
            };
        });

        renderNotifications();
        updateNotificationsBadge();
    } catch (error) {
        console.error(error);
    }
};

const deleteNotification = async (id) => {
    const response = await fetch(`/notifications/${id}`, {
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
        throw new Error(data.message || 'Не удалось удалить уведомление');
    }

    return data;
};

const clearNotifications = async () => {
    const response = await fetch('/notifications', {
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
        throw new Error(data.message || 'Не удалось удалить уведомления');
    }

    return data;
};

const startNotificationsPolling = () => {
    if (notificationsPollingId) {
        window.clearInterval(notificationsPollingId);
    }

    notificationsPollingId = window.setInterval(() => {
        if (document.hidden) return;

        loadNotifications();
    }, NOTIFICATIONS_POLL_INTERVAL);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            loadNotifications();
        }
    });
};

export const initNotificationEvents = () => {
    document.addEventListener('click', async (event) => {
        const deleteButton = event.target.closest('[data-notification-delete]');

        if (deleteButton) {
            event.preventDefault();
            event.stopPropagation();

            const id = Number(deleteButton.dataset.notificationDelete);

            if (!id) return;

            deleteButton.disabled = true;

            try {
                await deleteNotification(id);

                notificationsState.items = notificationsState.items.filter((item) => {
                    return Number(item.id) !== id;
                });

                notificationsState.unreadCount = notificationsState.items.filter((item) => {
                    return !item.is_read;
                }).length;

                renderNotifications();
                updateNotificationsBadge();

                window.showToast?.({
                    type: 'success',
                    title: 'Уведомление удалено',
                    message: 'Уведомление удалено из списка.',
                });
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось удалить',
                    message: error.message || 'Проверьте подключение и попробуйте ещё раз.',
                });
            } finally {
                deleteButton.disabled = false;
            }

            return;
        }

        const clearButton = event.target.closest('[data-notifications-clear]');

        if (clearButton) {
            event.preventDefault();

            const confirmed = await window.openConfirmDialog?.({
                title: 'Удалить все уведомления?',
                text: 'Список уведомлений будет очищен. Это действие нельзя отменить.',
                cancelText: 'Отмена',
                submitText: 'Удалить все',
                submitTone: 'danger',
            });

            if (!confirmed) return;

            clearButton.disabled = true;

            try {
                await clearNotifications();

                notificationsState.items = [];
                notificationsState.unreadCount = 0;

                renderNotifications();
                updateNotificationsBadge();

                window.showToast?.({
                    type: 'success',
                    title: 'Уведомления удалены',
                    message: 'Список уведомлений очищен.',
                });
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось удалить',
                    message: error.message || 'Проверьте подключение и попробуйте ещё раз.',
                });
            } finally {
                clearButton.disabled = false;
            }

            return;
        }

        const openButton = event.target.closest('[data-notifications-open]');

        if (openButton) {
            event.preventDefault();

            const sheet = document.querySelector(
                '[data-sidebar-sheet-id="notifications-sheet"]'
            );

            await loadNotifications();

            window.openSidebarSheet?.(sheet);

            if (notificationsState.unreadCount > 0) {
                await markAllNotificationsRead();
            }

            return;
        }
    });
};

export const initNotifications = () => {
    const hasNotificationsUi =
        document.querySelector('[data-notifications-badge]') ||
        document.querySelector('[data-notifications-list]');

    if (!hasNotificationsUi) return;

    loadNotifications();
    startNotificationsPolling();
};
