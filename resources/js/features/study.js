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

const loadDueStudyCards = async () => {
    const response = await fetch('/study/due-cards', {
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
            title: 'Не удалось загрузить повторения',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return [];
    }

    return data.cards || [];
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



const renderStudySession = () => {
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
        content.innerHTML = `
            <div class="study-card__empty">
                <h3 class="heading heading--3">Повторение завершено</h3>
                <p class="text text--small">Все карточки из набора пройдены.</p>
            </div>
        `;

        if (rating) rating.hidden = true;
        if (hint) hint.hidden = true;
        if (hintButton) hintButton.hidden = true;
        if (soundButton) soundButton.hidden = true;
        if (counter) counter.textContent = `${studySessionState.cards.length} / ${studySessionState.cards.length}`;
        if (progress) progress.style.width = '100%';
        if (actionButton) {
            actionButton.hidden = true;
        }

        return;
    }

    if (actionButton) {
        actionButton.hidden = studySessionState.isChecked;
        actionButton.classList.add('is-check-action');
        actionButton.setAttribute('aria-label', 'Проверить ответ');
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
        rating.hidden = !studySessionState.isChecked;
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
        content.innerHTML = `
            <div class="study-card__empty">
                <h3 class="heading heading--3">Повторение завершено</h3>
                <p class="text text--small">Все карточки из набора просмотрены.</p>
            </div>
        `;

        if (rating) rating.hidden = true;
        if (hint) hint.hidden = true;
        if (hintButton) hintButton.hidden = true;
        if (soundButton) soundButton.hidden = true;
        if (counter) counter.textContent = `${studySessionState.cards.length} / ${studySessionState.cards.length}`;
        if (progress) progress.style.width = '100%';
        if (actionButton) {
            actionButton.hidden = true;
        }

        return;
    }

    if (actionButton) {
        actionButton.hidden = false;
        actionButton.classList.remove('is-check-action');
        actionButton.setAttribute('aria-label', 'Показать ответ');
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
        rating.hidden = !studySessionState.wasFlippedOnce;
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
        content.innerHTML = `
            <div class="study-card__empty">
                <h3 class="heading heading--3">Повторение завершено</h3>
                <p class="text text--small">Все карточки из набора пройдены.</p>
            </div>
        `;

        if (rating) rating.hidden = true;
        if (hint) hint.hidden = true;
        if (hintButton) hintButton.hidden = true;
        if (soundButton) soundButton.hidden = true;
        if (actionButton) actionButton.hidden = true;
        if (counter) counter.textContent = `${studySessionState.cards.length} / ${studySessionState.cards.length}`;
        if (progress) progress.style.width = '100%';

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
        actionButton.hidden = studySessionState.isChecked;
        actionButton.classList.add('is-check-action');
        actionButton.setAttribute('aria-label', 'Проверить ответ');
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
        rating.hidden = !studySessionState.isChecked;
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
                const cards = studyModeState.source === 'due'
                    ? await loadDueStudyCards()
                    : await loadStudyCards(setId);

                if (!cards.length) {
                    window.showToast?.({
                        type: 'error',
                        title: 'Нет карточек',
                        message: 'Добавьте карточки в набор перед повторением.',
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
                studySessionState.isFlipped = false;
                studySessionState.wasFlippedOnce = false;
                studySessionState.isLanguageSet = set?.language === 'en';
                studySessionState.isHintVisible = false;
                studySessionState.writtenAnswer = '';
                studySessionState.isChecked = false;
                studySessionState.isCorrect = false;

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

            const rating = ratingButton.dataset.studyRatingValue;

            ratingButton.disabled = true;

            try {
                const data = await saveStudyReview(rating);

                if (!data) return;

                studySessionState.index += 1;
                studySessionState.isFlipped = false;
                studySessionState.wasFlippedOnce = false;
                studySessionState.isHintVisible = false;
                studySessionState.writtenAnswer = '';
                studySessionState.isChecked = false;
                studySessionState.isCorrect = false;

                renderStudySession();

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
            studySessionState.isFlipped = !studySessionState.isFlipped;
            studySessionState.wasFlippedOnce = true;

            renderStudySession();

            return;
        }

        if (studySessionState.mode === 'write' || studySessionState.mode === 'audio') {
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
