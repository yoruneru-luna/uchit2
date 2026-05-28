import { escapeHtml } from './helpers';

export const renderIcon = (id, size = 'sm', className = '') => {
    return `
        <svg class="icon icon--${escapeHtml(size)} ${escapeHtml(className)}">
            <use href="#icon-${escapeHtml(id)}"></use>
        </svg>
    `;
};

export const renderButtonInner = ({
    icon = null,
    iconSize = 'xs',
    text = '',
    description = '',
    shadow = false,
} = {}) => {
    return `
        <div class="button__inner ${shadow ? 'shadow' : ''}">
            ${icon ? renderIcon(icon, iconSize, 'button__icon') : ''}

            ${text
            ? `<span class="button__text">${escapeHtml(text)}</span>`
            : ''
        }

            ${description
            ? `<span class="button__description">${escapeHtml(description)}</span>`
            : ''
        }
        </div>
    `;
};

export const renderEmptyState = ({
    type = 'sets',
    title = 'Ничего не найдено',
    text = 'Попробуйте изменить запрос',
    primaryText = 'Создать набор',
    secondaryText = 'Найти набор',
    primaryAction = '',
    secondaryAction = '',
    image = '/images/empty-sets.svg',
}) => {
    return `
        <article class="empty-state shadow" data-empty-state="${escapeHtml(type)}">
            <div class="empty-state__illustration">
                <img src="${escapeHtml(image)}" alt="" aria-hidden="true">
            </div>

            <div class="empty-state__content">
                <h4 class="empty-state__title heading heading--4-2">
                    ${escapeHtml(title)}
                </h4>

                <p class="empty-state__text text text--small">
                    ${escapeHtml(text)}
                </p>
            </div>

            <div class="empty-state__actions">
                <button
                    class="empty-state__primary button button--primary button--lg button--radius-circle"
                    type="button"
                    ${primaryAction}
                >
                    ${renderButtonInner({
        text: primaryText,
        icon: 'plus',
        iconSize: 'sm',
    })}
                </button>

                <button
                    class="empty-state__secondary button button--ghost button--sm button--radius-circle"
                    type="button"
                    ${secondaryAction}
                >
                    ${renderButtonInner({
        text: secondaryText,
    })}
                </button>
            </div>
        </article>
    `;
};
