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

export const renderMiniLearningProgress = (progress = {}) => {
    const total = Number(progress.total || 0);

    const learnedPercent = Math.min(
        100,
        Math.max(0, Number(progress.learned_percent || 0))
    );

    const fadingPercent = Math.min(
        100,
        Math.max(0, Number(progress.fading_percent || progress.fading || 0))
    );

    if (total <= 0) {
        return `
            <div class="card__stats card__stats--learning is-empty">
                <div class="card__line">
                    <span
                        class="card__line-segment card__line-segment--learned"
                        style="width: 0%;"
                    ></span>
                </div>

                <div class="card__percent">
                    <span class="card__percent-value">0%</span>
                </div>
            </div>
        `;
    }

    return `
        <div
            class="card__stats card__stats--learning"
            aria-label="Закреплено ${learnedPercent}%"
        >
            <div class="card__line">
                <span
                    class="card__line-segment card__line-segment--learned"
                    style="width: ${learnedPercent}%;"
                ></span>

                ${fadingPercent > 0
            ? `
                            <span
                                class="card__line-segment card__line-segment--fading"
                                style="width: ${fadingPercent}%;"
                            ></span>
                        `
            : ''
        }
            </div>

            <div class="card__percent">
                <span class="card__percent-value">
                    ${learnedPercent}%
                </span>

                ${fadingPercent > 0
            ? `
                            <span class="card__delta">
                                (-${fadingPercent}%)
                            </span>
                        `
            : ''
        }
            </div>
        </div>
    `;
};
