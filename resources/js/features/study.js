import {
    setsState,
    studyModeState,
    studySessionState,
} from '../shared/state';

import {
    getCsrfToken,
    escapeHtml,
} from '../shared/helpers';

let studyDeps = {
    syncHomeAfterStudyReview: async () => { },
};

export const configureStudyDeps = (deps = {}) => {
    studyDeps = {
        ...studyDeps,
        ...deps,
    };
};

const updateAudioFsrsOption = (root) => {
    const speakSide = root.querySelector('[name="audio_speak_side"]:checked')?.value || 'front';
    const answerSide = root.querySelector('[name="audio_answer_side"]:checked')?.value || 'back';
    const fsrsOption = root.querySelector('[data-audio-fsrs-option]');

    if (!fsrsOption) return;

    fsrsOption.hidden = speakSide !== answerSide;
};

const loadDueStudyCards = async (mode = 'basic') => {
    const url = `/study/due-cards?mode=${encodeURIComponent(mode)}`;

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
            title: data.code === 'pro_required'
                ? 'Доступно в PRO'
                : 'Не удалось загрузить повторения',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return null;
    }

    return {
        cards: data.cards || [],
        set: data.set || null,
        fsrsEnabled: true,
        fsrsGoal: 0.90,
    };
};

const loadStudyCards = async (setId, mode = 'basic') => {
    if (!setId) {
        return {
            cards: [],
            set: null,
            fsrsEnabled: true,
            fsrsGoal: 0.90,
        };
    }

    const url = `/sets/${setId}/study-cards?mode=${encodeURIComponent(mode)}`;

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
            title: data.code === 'pro_required'
                ? 'Доступно в PRO'
                : 'Не удалось загрузить карточки',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return null;
    }

    const cards = data.cards || [];
    const set = data.set || null;

    return {
        cards,
        set,
        fsrsEnabled: set?.fsrs_enabled ?? cards[0]?.fsrs_enabled ?? true,
        fsrsGoal: set?.fsrs_goal ?? cards[0]?.fsrs_goal ?? 0.90,
    };
};

const openStudySession = () => {
    const root = document.querySelector('[data-study-session]');

    if (!root) return;

    root.hidden = false;

    requestAnimationFrame(() => {
        root.classList.add('is-open');
    });
};

const closeStudySession = () => {
    const root = document.querySelector('[data-study-session]');

    if (!root) return;

    root.classList.remove('is-open');

    window.setTimeout(() => {
        root.hidden = true;
    }, 200);
};

const openDueReviewModePicker = () => {
    const sheet = document.querySelector('[data-sidebar-sheet-id="study-mode-sheet"]');
    const root = sheet?.querySelector('[data-study-mode-root]');
    const notificationsSheet = document.querySelector('[data-sidebar-sheet-id="notifications-sheet"]');

    if (!sheet || !root) return;

    if (notificationsSheet) {
        window.closeSidebarSheet?.(notificationsSheet);
    }

    studyModeState.setId = null;
    studyModeState.mode = null;
    studyModeState.source = 'due';

    setActiveStudyModeScreen(root, 'list');

    window.openSidebarSheet?.(sheet);
};

export const initDueReviewEvents = () => {
    document.addEventListener('click', (event) => {
        const button = event.target.closest(
            '[data-start-due-review], [data-notification-start-due]'
        );

        if (!button) return;

        event.preventDefault();

        openDueReviewModePicker();
    });

    document.addEventListener('due-review:start', () => {
        openDueReviewModePicker();
    });
};

const setActiveStudyModeScreen = (root, screenName) => {
    if (!root) return;

    root.querySelectorAll('[data-study-mode-screen]').forEach((screen) => {
        const isActive = screen.dataset.studyModeScreen === screenName;

        screen.classList.toggle('is-active', isActive);
        screen.hidden = !isActive;
    });
};

const getStudyModeSettings = (root, mode) => {
    const getCheckedValue = (name) => {
        return root.querySelector(`[name="${name}"]:checked`)?.value || null;
    };

    if (mode === 'basic') {
        return {
            firstSide: getCheckedValue('basic_first_side') || 'front',
        };
    }

    if (mode === 'write') {
        const answerSide = getCheckedValue('write_answer_side') || 'back';

        return {
            answerSide,
            showSide: answerSide === 'back' ? 'front' : 'back',
        };
    }

    if (mode === 'audio') {
        const speakSide = getCheckedValue('audio_speak_side') || 'front';
        const answerSide = getCheckedValue('audio_answer_side') || 'back';
        const isDictation = speakSide === answerSide;
        const useFsrsInput = root.querySelector('[name="audio_use_fsrs"]');

        return {
            speakSide,
            answerSide,
            isDictation,
            useFsrs: !isDictation || Boolean(useFsrsInput?.checked),
        };
    }

    return {};
};

const getStudySessionModeMeta = (mode) => {
    const modes = {
        basic: {
            title: 'Базовый просмотр',
            icon: 'eye',
            className: 'study-session--mode-basic',
        },
        write: {
            title: 'Письменный режим',
            icon: 'edit',
            className: 'study-session--mode-write',
        },
        audio: {
            title: 'Аудио режим',
            icon: 'volume',
            className: 'study-session--mode-audio',
        },
    };

    return modes[mode] || modes.basic;
};

const syncStudySessionModeUi = (root) => {
    if (!root) return;

    const meta = getStudySessionModeMeta(studySessionState.mode);

    root.classList.remove(
        'study-session--mode-basic',
        'study-session--mode-write',
        'study-session--mode-audio'
    );

    root.classList.add(meta.className);

    const title = root.querySelector('[data-study-session-title]');
    const icon = root.querySelector('[data-study-session-mode-icon]');

    if (title) {
        title.textContent = meta.title;
    }

    if (icon) {
        icon.setAttribute('href', `#icon-${meta.icon}`);
    }
};

const resetStudySessionStats = () => {
    studySessionState.stats = {
        total: 0,
        remembered: 0,
        forgotten: 0,
        again: 0,
        hard: 0,
        good: 0,
        easy: 0,
    };
};

const isFsrsStudySession = () => {
    return studySessionState.fsrsEnabled !== false;
};

const resetCurrentStudyCardState = () => {
    studySessionState.isFlipped = false;
    studySessionState.wasFlippedOnce = false;
    studySessionState.isHintVisible = false;
    studySessionState.writtenAnswer = '';
    studySessionState.isChecked = false;
    studySessionState.isCorrect = false;
};

const goToNextStudyCard = () => {
    studySessionState.index += 1;

    resetCurrentStudyCardState();

    renderStudySession();
};

const addStudySessionResult = (rating) => {
    if (!studySessionState.stats) {
        resetStudySessionStats();
    }

    studySessionState.stats.total += 1;

    if (rating === 'again') {
        studySessionState.stats.again += 1;
        studySessionState.stats.forgotten += 1;
        return;
    }

    if (rating === 'hard') {
        studySessionState.stats.hard += 1;
        studySessionState.stats.remembered += 1;
        return;
    }

    if (rating === 'good') {
        studySessionState.stats.good += 1;
        studySessionState.stats.remembered += 1;
        return;
    }

    if (rating === 'easy') {
        studySessionState.stats.easy += 1;
        studySessionState.stats.remembered += 1;
    }
};

const renderStudyCompletion = () => {
    if (!isFsrsStudySession()) {
        return `
            <div class="study-session__completion shadow">
                <div class="study-session__completion-icon">
                    🎉
                </div>

                <h2 class="study-session__completion-title heading heading--2">
                    Набор пройден
                </h2>

                <p class="study-session__completion-text text">
                    Все карточки набора просмотрены.
                </p>

                <p class="study-session__completion-note text text--small">
                    Набор используется как свободная тренировка, поэтому расписание повторений не изменилось.
                </p>

                <button
                    class="study-session__finish button button--lg button--radius-12"
                    type="button"
                    data-study-session-close
                >
                    <span class="button__inner shadow">
                        <span class="button__text">Завершить</span>
                    </span>
                </button>
            </div>
        `;
    }

    const stats = studySessionState.stats || {
        total: studySessionState.cards.length,
        remembered: 0,
        forgotten: 0,
        again: 0,
        hard: 0,
        good: 0,
        easy: 0,
    };

    const total = Number(stats.total || 0);
    const remembered = Number(stats.remembered || 0);
    const forgotten = Number(stats.forgotten || 0);

    const rememberedPercent = total > 0
        ? Math.round((remembered / total) * 100)
        : 0;

    return `
        <div class="study-session__completion shadow">
            <div class="study-session__completion-icon">
                🎉
            </div>

            <h2 class="study-session__completion-title heading heading--2">
                Повторение завершено
            </h2>

            <p class="study-session__completion-text text">
                Пройдено ${total} карточек. Вспомнилось ${rememberedPercent}% материала.
            </p>

            <div class="study-session__summary">
                <div class="study-session__summary-item">
                    <span class="study-session__summary-value">${total}</span>
                    <span class="study-session__summary-label">Пройдено</span>
                </div>

                <div class="study-session__summary-item">
                    <span class="study-session__summary-value">${remembered}</span>
                    <span class="study-session__summary-label">Вспомнили</span>
                </div>

                <div class="study-session__summary-item">
                    <span class="study-session__summary-value">${forgotten}</span>
                    <span class="study-session__summary-label">Не вспомнили</span>
                </div>
            </div>

            <div class="study-session__rating-summary">
                <span>Забыл: ${stats.again || 0}</span>
                <span>Сложно: ${stats.hard || 0}</span>
                <span>Нормально: ${stats.good || 0}</span>
                <span>Легко: ${stats.easy || 0}</span>
            </div>

            <p class="study-session__completion-note text text--small">
                Карточки с низкой оценкой вернутся раньше, чтобы закрепить материал.
            </p>

            <button
                class="study-session__finish button button--lg button--radius-12"
                type="button"
                data-study-session-close
            >
                <span class="button__inner shadow">
                    <span class="button__text">Завершить</span>
                </span>
            </button>
        </div>
    `;
};

const getStudyCompletionElement = (root) => {
    let completion = root.querySelector('[data-study-session-completion]');

    if (completion) {
        return completion;
    }

    const body =
        root.querySelector('[data-study-session-body]') ||
        root.querySelector('.study-session__body') ||
        root.querySelector('.study-session__panel') ||
        root;

    const cardElement = root.querySelector('[data-study-card]');

    completion = document.createElement('div');
    completion.className = 'study-session__completion-wrap';
    completion.dataset.studySessionCompletion = 'true';
    completion.hidden = true;

    if (cardElement) {
        cardElement.insertAdjacentElement('afterend', completion);
    } else {
        body.append(completion);
    }

    return completion;
};

const renderStudySession = () => {
    const root = document.querySelector('[data-study-session]');
    const content = root?.querySelector('[data-study-card-content]');
    const cardElement = root?.querySelector('[data-study-card]');
    const counter = root?.querySelector('[data-study-session-counter]');
    const progress = root?.querySelector('[data-study-session-progress]');
    const rating = root?.querySelector('[data-study-rating]');
    const hint = root?.querySelector('[data-study-session-hint]');
    const hintButton = root?.querySelector('[data-study-card-hint]');
    const soundButton = root?.querySelector('[data-study-card-sound]');
    const actionButton = root?.querySelector('[data-study-card-action]');
    const hintBox = root?.querySelector('[data-study-card-hint-box]');

    if (!root || !content) return;

    syncStudySessionModeUi(root);

    const completion = getStudyCompletionElement(root);
    const card = studySessionState.cards[studySessionState.index];

    if (!card) {
        if (cardElement) {
            cardElement.hidden = true;
        }

        completion.hidden = false;
        completion.innerHTML = renderStudyCompletion();

        if (rating) rating.hidden = true;
        if (hint) hint.hidden = true;
        if (hintButton) hintButton.hidden = true;
        if (soundButton) soundButton.hidden = true;
        if (actionButton) actionButton.hidden = true;

        if (hintBox) {
            hintBox.hidden = true;
            hintBox.innerHTML = '';
        }

        if (counter) {
            counter.textContent = `${studySessionState.cards.length} / ${studySessionState.cards.length}`;
        }

        if (progress) {
            progress.style.width = '100%';
        }

        return;
    }

    completion.hidden = true;
    completion.innerHTML = '';

    if (cardElement) {
        cardElement.hidden = false;
    }

    if (studySessionState.mode === 'write') {
        renderWriteStudyCard();
        return;
    }

    if (studySessionState.mode === 'audio') {
        renderAudioStudyCard();
        return;
    }

    renderBasicStudyCard();
};

const renderWriteStudyCard = () => {
    const root = document.querySelector('[data-study-session]');
    const content = root?.querySelector('[data-study-card-content]');
    const cardElement = root?.querySelector('[data-study-card]');
    const counter = root?.querySelector('[data-study-session-counter]');
    const progress = root?.querySelector('[data-study-session-progress]');
    const rating = root?.querySelector('[data-study-rating]');
    const hint = root?.querySelector('[data-study-session-hint]');
    const hintButton = root?.querySelector('[data-study-card-hint]');
    const soundButton = root?.querySelector('[data-study-card-sound]');
    const actionButton = root?.querySelector('[data-study-card-action]');

    if (!root || !content) return;

    const card = studySessionState.cards[studySessionState.index];

    const oldMarker = cardElement?.querySelector('[data-study-card-marker]');

    if (oldMarker) {
        oldMarker.remove();
    }

    if (!card) {
        return;
    }

    if (actionButton) {
        actionButton.hidden = isFsrsStudySession()
            ? studySessionState.isChecked
            : false;

        actionButton.classList.add('is-check-action');

        actionButton.setAttribute(
            'aria-label',
            !isFsrsStudySession() && studySessionState.isChecked
                ? 'Следующая карточка'
                : 'Проверить ответ'
        );
    }

    if (card.marker && cardElement) {
        cardElement.insertAdjacentHTML('afterbegin', `
            <div class="study-card__top-meta" data-study-card-marker>
                ${renderStudyMarker(card)}
            </div>
        `);
    }

    const current = studySessionState.index + 1;
    const total = studySessionState.cards.length;
    const percent = total > 0 ? (current / total) * 100 : 0;

    if (counter) {
        counter.textContent = `${current} / ${total}`;
    }

    if (progress) {
        progress.style.width = `${percent}%`;
    }

    const showSide = studySessionState.settings.showSide || 'front';
    const answerSide = studySessionState.settings.answerSide || 'back';

    const shownValue = getStudySideValue(card, showSide);
    const correctValue = getStudySideValue(card, answerSide);

    if (hintButton) {
        hintButton.hidden = !card.hint;
    }

    if (soundButton) {
        soundButton.hidden = !isLanguageCard(card);
    }

    const resultClass = studySessionState.isChecked
        ? (studySessionState.isCorrect ? 'is-correct' : 'is-wrong')
        : '';

    const resultIcon = studySessionState.isChecked
        ? (studySessionState.isCorrect ? '✓' : '×')
        : '';

    content.innerHTML = `
        <div class="study-card__write">
            <div class="study-card__main-text">
                <h3 class="study-card__value heading heading--3">
                    ${escapeHtml(shownValue)}
                </h3>

                ${showSide === 'front' ? renderStudyTranscription(card) : ''}
            </div>

            <div class="study-card__write-field">
                <label class="study-card__write-label" for="study-written-answer">
                    Введите ${getStudySideLabel(answerSide).toLowerCase()}
                </label>

                <div class="study-card__write-control ${resultClass}">
                    <input
                        class="study-card__write-input"
                        id="study-written-answer"
                        type="text"
                        value="${escapeHtml(studySessionState.writtenAnswer)}"
                        placeholder="Ваш ответ"
                        autocomplete="off"
                        data-study-written-answer
                        ${studySessionState.isChecked ? 'readonly' : ''}
                    >

                    ${studySessionState.isChecked
            ? `<span class="study-card__write-result">${resultIcon}</span>`
            : ''
        }
                </div>
            </div>

            ${studySessionState.isChecked
            ? `
                    <div class="study-card__write-feedback ${studySessionState.isCorrect ? 'is-correct' : 'is-wrong'}">
                        ${studySessionState.isCorrect
                ? 'Правильно!'
                : `Правильно: ${escapeHtml(correctValue)}`
            }
                    </div>
                `
            : ''
        }
        </div>
    `;

    const hintBox = root?.querySelector('[data-study-card-hint-box]');

    if (hintBox) {
        if (card.hint && studySessionState.isHintVisible) {
            hintBox.hidden = false;
            hintBox.innerHTML = `
                <span class="study-card__hint-label">Подсказка</span>
                <span class="study-card__hint-text">${escapeHtml(card.hint)}</span>
            `;
        } else {
            hintBox.hidden = true;
            hintBox.innerHTML = '';
        }
    }

    if (rating) {
        rating.hidden = !isFsrsStudySession() || !studySessionState.isChecked;
    }

    if (hint) {
        hint.hidden = studySessionState.isChecked;
    }

    const input = content.querySelector('[data-study-written-answer]');

    if (input && !studySessionState.isChecked) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
};

const renderBasicStudyCard = () => {
    const root = document.querySelector('[data-study-session]');
    const content = root?.querySelector('[data-study-card-content]');
    const cardElement = root?.querySelector('[data-study-card]');
    const counter = root?.querySelector('[data-study-session-counter]');
    const progress = root?.querySelector('[data-study-session-progress]');
    const rating = root?.querySelector('[data-study-rating]');
    const hint = root?.querySelector('[data-study-session-hint]');
    const hintButton = root?.querySelector('[data-study-card-hint]');
    const soundButton = root?.querySelector('[data-study-card-sound]');
    const actionButton = root?.querySelector('[data-study-card-action]');

    if (!root || !content) return;

    const card = studySessionState.cards[studySessionState.index];

    const oldMarker = cardElement?.querySelector('[data-study-card-marker]');

    if (oldMarker) {
        oldMarker.remove();
    }

    if (!card) {
        return;
    }

    if (actionButton) {
        actionButton.hidden = false;
        actionButton.classList.remove('is-check-action');

        actionButton.setAttribute(
            'aria-label',
            !isFsrsStudySession() && studySessionState.wasFlippedOnce
                ? 'Следующая карточка'
                : 'Показать ответ'
        );
    }

    const hintBox = root?.querySelector('[data-study-card-hint-box]');

    if (hintBox) {
        if (card.hint && studySessionState.isHintVisible) {
            hintBox.hidden = false;
            hintBox.innerHTML = `
                <span class="study-card__hint-label">Подсказка</span>
                <span class="study-card__hint-text">${escapeHtml(card.hint)}</span>
            `;
        } else {
            hintBox.hidden = true;
            hintBox.innerHTML = '';
        }
    }

    if (hintButton) {
        hintButton.hidden = !card.hint;
    }

    if (soundButton) {
        soundButton.hidden = !isLanguageCard(card);
    }

    if (card.marker && cardElement) {
        cardElement.insertAdjacentHTML('afterbegin', `
            <div class="study-card__top-meta" data-study-card-marker>
                ${renderStudyMarker(card)}
            </div>
        `);
    }

    const current = studySessionState.index + 1;
    const total = studySessionState.cards.length;
    const percent = total > 0 ? (current / total) * 100 : 0;
    const firstSide = studySessionState.settings.firstSide || 'front';

    if (counter) {
        counter.textContent = `${current} / ${total}`;
    }

    if (progress) {
        progress.style.width = `${percent}%`;
    }

    content.innerHTML = studySessionState.isFlipped
        ? renderBasicBackSide(card, firstSide)
        : renderBasicFrontSide(card, firstSide);

    if (rating) {
        rating.hidden = !isFsrsStudySession() || !studySessionState.wasFlippedOnce;
    }

    if (hint) {
        hint.hidden = studySessionState.wasFlippedOnce;
    }
};

const renderAudioStudyCard = () => {
    const root = document.querySelector('[data-study-session]');
    const content = root?.querySelector('[data-study-card-content]');
    const cardElement = root?.querySelector('[data-study-card]');
    const counter = root?.querySelector('[data-study-session-counter]');
    const progress = root?.querySelector('[data-study-session-progress]');
    const rating = root?.querySelector('[data-study-rating]');
    const hint = root?.querySelector('[data-study-session-hint]');
    const hintButton = root?.querySelector('[data-study-card-hint]');
    const soundButton = root?.querySelector('[data-study-card-sound]');
    const actionButton = root?.querySelector('[data-study-card-action]');

    if (!root || !content) return;

    const card = studySessionState.cards[studySessionState.index];

    const oldMarker = cardElement?.querySelector('[data-study-card-marker]');

    if (oldMarker) {
        oldMarker.remove();
    }

    if (!card) {
        return;
    }

    if (card.marker && cardElement) {
        cardElement.insertAdjacentHTML('afterbegin', `
            <div class="study-card__top-meta" data-study-card-marker>
                ${renderStudyMarker(card)}
            </div>
        `);
    }

    const current = studySessionState.index + 1;
    const total = studySessionState.cards.length;
    const percent = total > 0 ? (current / total) * 100 : 0;

    if (counter) {
        counter.textContent = `${current} / ${total}`;
    }

    if (progress) {
        progress.style.width = `${percent}%`;
    }

    const speakSide = studySessionState.settings.speakSide || 'front';
    const answerSide = studySessionState.settings.answerSide || 'back';
    const speakText = getStudySideValue(card, speakSide);
    const correctAnswer = getStudySideValue(card, answerSide);

    if (hintButton) {
        hintButton.hidden = !card.hint;
    }

    if (soundButton) {
        soundButton.hidden = !speakText;
    }

    if (actionButton) {
        actionButton.hidden = isFsrsStudySession()
            ? studySessionState.isChecked
            : false;

        actionButton.classList.add('is-check-action');

        actionButton.setAttribute(
            'aria-label',
            !isFsrsStudySession() && studySessionState.isChecked
                ? 'Следующая карточка'
                : 'Проверить ответ'
        );
    }

    const resultClass = studySessionState.isChecked
        ? (studySessionState.isCorrect ? 'is-correct' : 'is-wrong')
        : '';

    const resultIcon = studySessionState.isChecked
        ? (studySessionState.isCorrect ? '✓' : '×')
        : '';

    const isDictation = studySessionState.settings.isDictation;

    content.innerHTML = `
        <div class="study-card__audio-head">
            <p class="study-card__audio-text text text--small">
                ${isDictation
            ? 'Нажмите на значок звука и запишите услышанное.'
            : 'Нажмите на значок звука и напишите ответ.'
        }
            </p>
        </div>

        <div class="study-card__write-field">
            <label class="study-card__write-label" for="study-audio-answer">
                Введите ${getStudySideLabel(answerSide).toLowerCase()}
            </label>

            <div class="study-card__write-control ${resultClass}">
                <input
                    class="study-card__write-input"
                    id="study-audio-answer"
                    type="text"
                    value="${escapeHtml(studySessionState.writtenAnswer)}"
                    placeholder="Ваш ответ"
                    autocomplete="off"
                    data-study-written-answer
                    ${studySessionState.isChecked ? 'readonly' : ''}
                >

                ${studySessionState.isChecked
            ? `<span class="study-card__write-result">${resultIcon}</span>`
            : ''
        }
            </div>
        </div>

        ${studySessionState.isChecked
            ? `
                <div class="study-card__write-feedback ${studySessionState.isCorrect ? 'is-correct' : 'is-wrong'}">
                    ${studySessionState.isCorrect
                ? 'Правильно!'
                : `Правильно: ${escapeHtml(correctAnswer)}`
            }
                </div>
            `
            : ''
        }
    `;

    const hintBox = root?.querySelector('[data-study-card-hint-box]');

    if (hintBox) {
        if (card.hint && studySessionState.isHintVisible) {
            hintBox.hidden = false;
            hintBox.innerHTML = `
                <span class="study-card__hint-label">Подсказка</span>
                <span class="study-card__hint-text">${escapeHtml(card.hint)}</span>
            `;
        } else {
            hintBox.hidden = true;
            hintBox.innerHTML = '';
        }
    }

    if (rating) {
        rating.hidden = !isFsrsStudySession() || !studySessionState.isChecked;
    }

    if (hint) {
        hint.hidden = studySessionState.isChecked;
    }

    const input = content.querySelector('[data-study-written-answer]');

    if (input && !studySessionState.isChecked) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
};

const saveStudyReview = async (rating) => {
    const card = studySessionState.cards[studySessionState.index];

    if (!card) return null;

    if (!isFsrsStudySession()) {
        return null;
    }

    const useFsrs = studySessionState.mode === 'audio'
        ? studySessionState.settings.useFsrs !== false
        : true;

    const formData = new FormData();

    formData.set('card_id', card.id);
    formData.set('study_set_id', card.study_set_id || studySessionState.setId);
    formData.set('mode', studySessionState.mode);
    formData.set('rating', rating);
    formData.set('use_fsrs', useFsrs ? '1' : '0');

    const response = await fetch('/study/review', {
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
        window.showToast?.({
            type: 'error',
            title: 'Не удалось сохранить повторение',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return null;
    }

    return data;
};

export const initStudyModeEvents = () => {
    document.addEventListener('click', async (event) => {
        const openButton = event.target.closest(
            '[data-open-study-modes], [data-study-mode-open]'
        );

        if (openButton) {
            event.preventDefault();

            const setId = Number(
                openButton.dataset.openStudyModes ||
                openButton.dataset.studyModeOpen
            );

            if (!setId) return;

            const sheet = document.querySelector(
                '[data-sidebar-sheet-id="study-mode-sheet"]'
            );

            const root = sheet?.querySelector('[data-study-mode-root]');

            if (!sheet || !root) return;

            studyModeState.setId = setId;
            studyModeState.mode = null;
            studyModeState.source = 'set';

            setActiveStudyModeScreen(root, 'list');

            window.openSidebarSheet?.(sheet);

            return;
        }

        const selectButton = event.target.closest('[data-study-mode-select]');

        if (selectButton) {
            event.preventDefault();

            const sheet = selectButton.closest('[data-sidebar-sheet]');
            const root = sheet?.querySelector('[data-study-mode-root]');
            const mode = selectButton.dataset.studyModeSelect;

            if (!root || !mode) return;

            studyModeState.mode = mode;

            setActiveStudyModeScreen(root, mode);

            if (mode === 'audio') {
                updateAudioFsrsOption(root);
            }

            return;
        }

        const backButton = event.target.closest('[data-study-mode-back]');

        if (backButton) {
            event.preventDefault();

            const sheet = backButton.closest('[data-sidebar-sheet]');
            const root = sheet?.querySelector('[data-study-mode-root]');

            if (!root) return;

            studyModeState.mode = null;

            setActiveStudyModeScreen(root, 'list');

            return;
        }

        const startButton = event.target.closest('[data-study-start]');

        if (startButton) {
            event.preventDefault();

            const sheet = startButton.closest('[data-sidebar-sheet]');
            const root = sheet?.querySelector('[data-study-mode-root]');
            const mode = startButton.dataset.studyStart;
            const setId = studyModeState.setId;

            if (!root || !mode) return;
            if (studyModeState.source === 'set' && !setId) return;

            const settings = getStudyModeSettings(root, mode);

            if (!['basic', 'write', 'audio'].includes(mode)) {
                window.showToast?.({
                    type: 'info',
                    title: 'Режим скоро будет доступен',
                    message: 'Сейчас подключаем аудио режим.',
                });

                return;
            }

            startButton.disabled = true;

            try {
                const sessionData = studyModeState.source === 'due'
                    ? await loadDueStudyCards(mode)
                    : await loadStudyCards(setId, mode);

                if (sessionData === null) {
                    return;
                }

                const cards = sessionData.cards || [];

                if (!cards.length) {
                    window.showToast?.({
                        type: 'error',
                        title: 'Нет карточек',
                        message: studyModeState.source === 'due'
                            ? 'Сейчас нет карточек для повторения.'
                            : 'Добавьте карточки в набор перед повторением.',
                    });

                    return;
                }

                const set = studyModeState.source === 'set'
                    ? setsState.items.find((item) => Number(item.id) === Number(setId))
                    : null;

                studySessionState.setId =
                    studyModeState.source === 'set' ? setId : null;

                studySessionState.mode = mode;
                studySessionState.settings = settings;
                studySessionState.cards = cards;
                studySessionState.index = 0;
                studySessionState.fsrsEnabled = sessionData.fsrsEnabled !== false;
                studySessionState.fsrsGoal = sessionData.fsrsGoal || 0.90;
                studySessionState.set = sessionData.set || set || null;
                studySessionState.isFlipped = false;
                studySessionState.wasFlippedOnce = false;
                studySessionState.isLanguageSet =
                    (sessionData.set?.language || set?.language) === 'en';
                studySessionState.isHintVisible = false;
                studySessionState.writtenAnswer = '';
                studySessionState.isChecked = false;
                studySessionState.isCorrect = false;

                resetStudySessionStats();

                window.closeSidebarSheet?.(sheet);

                openStudySession();
                renderStudySession();
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось начать повторение',
                    message: 'Проверьте подключение и попробуйте ещё раз.',
                });
            } finally {
                startButton.disabled = false;
            }
        }
    });

    document.addEventListener('change', (event) => {
        const input = event.target.closest(
            '[name="audio_speak_side"], [name="audio_answer_side"]'
        );

        if (!input) return;

        const root = input.closest('[data-study-mode-root]');

        updateAudioFsrsOption(root);
    });
};

export const initStudySessionEvents = () => {
    document.addEventListener('input', (event) => {
        const input = event.target.closest('[data-study-written-answer]');

        if (!input) return;

        studySessionState.writtenAnswer = input.value;
    });

    document.addEventListener('keydown', (event) => {
        const input = event.target.closest('[data-study-written-answer]');

        if (!input) return;
        if (event.key !== 'Enter') return;

        event.preventDefault();

        if (!isFsrsStudySession() && studySessionState.isChecked) {
            goToNextStudyCard();
            return;
        }

        checkCurrentStudyAnswer();
    });

    document.addEventListener('click', async (event) => {
        const closeButton = event.target.closest('[data-study-session-close]');

        if (closeButton) {
            event.preventDefault();

            closeStudySession();

            return;
        }

        const soundButton = event.target.closest('[data-study-card-sound]');

        if (soundButton) {
            event.preventDefault();
            event.stopPropagation();

            const card = studySessionState.cards[studySessionState.index];

            if (!card) return;

            let text = '';

            if (studySessionState.mode === 'audio') {
                const speakSide = studySessionState.settings.speakSide || 'front';

                text = getStudySideValue(card, speakSide);
            } else {
                const firstSide = studySessionState.settings.firstSide || 'front';

                text = getStudySideValue(card, firstSide) || card.front || '';
            }

            speakStudyText(text);

            return;
        }

        const hintButton = event.target.closest(
            '[data-study-session-hint], [data-study-card-hint]'
        );

        if (hintButton) {
            event.preventDefault();
            event.stopPropagation();

            const card = studySessionState.cards[studySessionState.index];

            if (!card?.hint) return;

            studySessionState.isHintVisible = !studySessionState.isHintVisible;

            renderStudySession();

            return;
        }

        const ratingButton = event.target.closest('[data-study-rating-value]');

        if (ratingButton) {
            event.preventDefault();

            if (!isFsrsStudySession()) {
                return;
            }

            const rating = ratingButton.dataset.studyRatingValue;

            ratingButton.disabled = true;

            try {
                const data = await saveStudyReview(rating);

                if (!data) return;

                addStudySessionResult(rating);

                goToNextStudyCard();

                studyDeps.syncHomeAfterStudyReview();
            } catch (error) {
                console.error(error);

                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось сохранить повторение',
                    message: 'Проверьте подключение и попробуйте ещё раз.',
                });
            } finally {
                ratingButton.disabled = false;
            }

            return;
        }

        const actionButton = event.target.closest('[data-study-card-action]');
        const cardElement = event.target.closest('[data-study-card]');

        if (!actionButton && !cardElement) return;

        if (event.target.closest('[data-study-rating-value]')) return;
        if (event.target.closest('[data-study-card-sound]')) return;
        if (event.target.closest('[data-study-card-hint]')) return;
        if (event.target.closest('[data-study-written-answer]')) return;

        event.preventDefault();

        const card = studySessionState.cards[studySessionState.index];

        if (!card) return;

        if (studySessionState.mode === 'basic') {
            if (!isFsrsStudySession() && studySessionState.wasFlippedOnce) {
                goToNextStudyCard();
                return;
            }

            studySessionState.isFlipped = !studySessionState.isFlipped;
            studySessionState.wasFlippedOnce = true;

            renderStudySession();

            return;
        }

        if (studySessionState.mode === 'write' || studySessionState.mode === 'audio') {
            if (!isFsrsStudySession() && studySessionState.isChecked) {
                goToNextStudyCard();
                return;
            }

            checkCurrentStudyAnswer();
        }
    });
};

const detectSpeechLang = (text) => {
    const value = String(text || '').trim();

    if (!value) {
        return 'ru-RU';
    }

    const cyrillicCount = (value.match(/[А-Яа-яЁё]/g) || []).length;
    const latinCount = (value.match(/[A-Za-z]/g) || []).length;

    if (latinCount > cyrillicCount) {
        return 'en-GB';
    }

    return 'ru-RU';
};

const speakStudyText = (text) => {
    const value = String(text || '').trim();

    if (!value || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(value);

    utterance.lang = detectSpeechLang(value);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
};

const normalizeStudyAnswer = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replaceAll('ё', 'е')
        .replace(/[.,!?;:()[\]{}"«»]/g, '')
        .replace(/\s+/g, ' ');
};

const checkWrittenAnswer = (userAnswer, correctAnswer) => {
    const normalizedUserAnswer = normalizeStudyAnswer(userAnswer);
    const normalizedCorrectAnswer = normalizeStudyAnswer(correctAnswer);

    return normalizedUserAnswer && normalizedUserAnswer === normalizedCorrectAnswer;
};

const getStudySideLabel = (side) => {
    const labels = {
        front: 'Вопрос / термин',
        back: 'Ответ / определение',
        example: 'Пример',
        image: 'Изображение',
    };

    return labels[side] || '';
};

const getStudySideValue = (card, side) => {
    if (side === 'front') return card.front || '';
    if (side === 'back') return card.back || '';
    if (side === 'example') return card.example || '';
    if (side === 'image') return card.image_url || '';

    return '';
};

const renderStudyMarker = (card) => {
    if (!card.marker) return '';

    return `
        <span class="study-card__marker">
            ${escapeHtml(card.marker)}
        </span>
    `;
};

const isLanguageCard = (card = null) => {
    if (!card) {
        return false;
    }

    return (
        studySessionState.isLanguageSet ||
        card.set_language === 'en' ||
        card.language === 'en' ||
        card.set?.language === 'en' ||
        card.study_set?.language === 'en'
    );
};

const renderStudyTranscription = (card) => {
    if (!isLanguageCard(card) || !card.transcription) return '';

    return `
        <span class="study-card__transcription">
            ${escapeHtml(card.transcription)}
        </span>
    `;
};

const renderStudyImage = (card) => {
    if (!card.image_url) return '';

    return `
        <div class="study-card__image">
            <img src="${escapeHtml(card.image_url)}" alt="">
        </div>
    `;
};

const renderBasicFrontSide = (card, firstSide) => {
    if (firstSide === 'image' && card.image_url) {
        return `
            <div class="study-card__first">
                ${renderStudyImage(card)}
            </div>
        `;
    }

    const value = getStudySideValue(card, firstSide) || card.front || '';

    return `
        <div class="study-card__first">
            <div class="study-card__main-text">
                <div class="study-card__term-line">
                    <h3 class="study-card__value heading heading--3">
                        ${escapeHtml(value)}
                    </h3>
                </div>

                ${firstSide === 'front' ? renderStudyTranscription(card) : ''}
            </div>
        </div>
    `;
};

const renderBasicBackSide = (card, firstSide) => {
    const parts = [];

    if (firstSide !== 'front' && card.front) {
        parts.push(`
            <div class="study-card__answer-block">
                <span class="study-card__answer-label">Вопрос / термин</span>
                <h3 class="study-card__value heading heading--3">
                    ${escapeHtml(card.front)}
                </h3>
                ${renderStudyTranscription(card)}
            </div>
        `);
    }

    if (firstSide !== 'back' && card.back) {
        parts.push(`
            <div class="study-card__answer-block">
                <span class="study-card__answer-label">Ответ / определение</span>
                <p class="study-card__answer-text">
                    ${escapeHtml(card.back)}
                </p>
            </div>
        `);
    }

    if (firstSide !== 'image' && card.image_url) {
        parts.push(renderStudyImage(card));
    }

    if (firstSide !== 'example' && card.example) {
        parts.push(`
            <div class="study-card__answer-block">
                <span class="study-card__answer-label">Пример</span>
                <p class="study-card__answer-text">
                    ${escapeHtml(card.example)}
                </p>
            </div>
        `);
    }

    return `
        <div class="study-card__back-side">
            ${parts.join('')}
        </div>
    `;
};

const checkCurrentStudyAnswer = () => {
    if (studySessionState.isChecked) return;

    const card = studySessionState.cards[studySessionState.index];

    if (!card) return;

    const answerSide = studySessionState.settings.answerSide || 'back';
    const correctAnswer = getStudySideValue(card, answerSide);

    studySessionState.isChecked = true;
    studySessionState.isCorrect = checkWrittenAnswer(
        studySessionState.writtenAnswer,
        correctAnswer
    );
    studySessionState.wasFlippedOnce = true;

    renderStudySession();
};
