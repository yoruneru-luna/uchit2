import {
    getCsrfToken,
    escapeHtml,
    debounce,
} from '../shared/helpers';

import {
    renderButtonInner,
} from '../shared/render';

const updateSuggestionsScrollFade = (row) => {
    const tabs = row.querySelector('.card-form__suggestions-tabs');

    if (!tabs) return;

    const scrollLeft = Math.round(tabs.scrollLeft);
    const maxScrollLeft = Math.round(tabs.scrollWidth - tabs.clientWidth);

    const hasScroll = maxScrollLeft > 1;
    const hasScrollLeft = hasScroll && scrollLeft > 1;
    const hasScrollRight = hasScroll && scrollLeft < maxScrollLeft - 1;

    row.classList.toggle('has-scroll-left', hasScrollLeft);
    row.classList.toggle('has-scroll-right', hasScrollRight);
};

const updateSuggestionsListFade = (panel) => {
    const list = panel.querySelector('.card-form__suggestions-list');

    if (!list) return;

    const scrollTop = Math.round(list.scrollTop);
    const maxScrollTop = Math.round(list.scrollHeight - list.clientHeight);

    const hasScroll = maxScrollTop > 1;
    const hasScrollTop = hasScroll && scrollTop > 1;
    const hasScrollBottom = hasScroll && scrollTop < maxScrollTop - 1;

    panel.classList.toggle('has-scroll-top', hasScrollTop);
    panel.classList.toggle('has-scroll-bottom', hasScrollBottom);
};

const updateAllSuggestionsListFades = (root) => {
    root.querySelectorAll('[data-suggestions-panel]').forEach((panel) => {
        requestAnimationFrame(() => {
            updateSuggestionsListFade(panel);
        });
    });
};

export const initCardSuggestions = () => {
    document.querySelectorAll('[data-card-suggestions]').forEach((root) => {
        const row = root.querySelector('[data-suggestions-tabs-row]');
        const tabsScroller = root.querySelector('.card-form__suggestions-tabs');
        const tabs = [...root.querySelectorAll('[data-suggestions-tab]')];
        const panels = [...root.querySelectorAll('[data-suggestions-panel]')];

        if (!row || !tabsScroller || !tabs.length || !panels.length) {
            return;
        }

        panels.forEach((panel) => {
            const list = panel.querySelector('.card-form__suggestions-list');

            if (!list) return;

            list.addEventListener('scroll', () => {
                updateSuggestionsListFade(panel);
            });
        });

        const setActiveTab = (tabName) => {
            const activeTab = tabs.find((tab) => {
                return tab.dataset.suggestionsTab === tabName;
            });

            if (!activeTab) return;

            tabs.forEach((tab) => {
                const isActive = tab === activeTab;

                tab.classList.toggle('is-active', isActive);
                tab.setAttribute('aria-selected', String(isActive));
            });

            panels.forEach((panel) => {
                const isActive = panel.dataset.suggestionsPanel === tabName;

                panel.classList.toggle('is-active', isActive);
                panel.hidden = !isActive;
            });

            const activePanel = panels.find((panel) => {
                return panel.dataset.suggestionsPanel === tabName;
            });

            if (activePanel) {
                requestAnimationFrame(() => {
                    updateSuggestionsListFade(activePanel);
                });
            }

            activeTab.scrollIntoView({
                behavior: 'smooth',
                inline: 'nearest',
                block: 'nearest',
            });
        };

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                setActiveTab(tab.dataset.suggestionsTab);

                window.setTimeout(() => {
                    updateSuggestionsScrollFade(row);
                }, 250);
            });
        });

        tabsScroller.addEventListener('scroll', () => {
            updateSuggestionsScrollFade(row);
        });

        root.addEventListener('change', (event) => {
            const input = event.target.closest('.card-form__suggestion-input');

            if (!input) return;

            const group = input.closest(
                '.card-form__suggestions-list, .card-form__suggestions-chips'
            );

            if (!group) return;

            group
                .querySelectorAll('.card-form__suggestion, .card-form__suggestion-chip')
                .forEach((item) => {
                    item.classList.remove('is-selected');
                });

            const currentItem = input.closest(
                '.card-form__suggestion, .card-form__suggestion-chip'
            );

            currentItem?.classList.add('is-selected');
        });

        root
            .querySelectorAll('.card-form__suggestion-input:checked')
            .forEach((input) => {
                const currentItem = input.closest(
                    '.card-form__suggestion, .card-form__suggestion-chip'
                );

                currentItem?.classList.add('is-selected');
            });

        updateSuggestionsScrollFade(row);
        updateAllSuggestionsListFades(root);

        window.addEventListener('resize', () => {
            updateSuggestionsScrollFade(row);
            updateAllSuggestionsListFades(root);
        });
    });
};

const getCardSuggestionsPayload = (form) => {
    return {
        front: form.querySelector('[name="front"]')?.value.trim() || '',
        back: form.querySelector('[name="back"]')?.value.trim() || '',
        language: form.dataset.language || 'en',
    };
};

const renderSuggestionRadio = ({ name, value, checked = false }) => {
    return `
        <input
            class="card-form__suggestion-input"
            type="radio"
            name="${escapeHtml(name)}"
            value="${escapeHtml(value)}"
            ${checked ? 'checked' : ''}
        >
        <span class="radio-view card-form__suggestion-radio"></span>
    `;
};

const getUkPronunciationSuggestion = (suggestions = []) => {
    return suggestions.find((item) => {
        const accent = String(
            item.accent ||
            item.region ||
            item.locale ||
            item.variant ||
            item.label ||
            ''
        ).toLowerCase();

        return (
            accent === 'uk' ||
            accent === 'gb' ||
            accent === 'en-gb' ||
            accent === 'british' ||
            accent.includes('uk') ||
            accent.includes('gb') ||
            accent.includes('british') ||
            accent.includes('брит')
        );
    });
};

const renderCardSuggestions = (form, suggestions) => {
    const definitionsList = form.querySelector('[data-suggestions-list="definitions"]');
    const termsList = form.querySelector('[data-suggestions-list="terms"]');
    const pronunciationList = form.querySelector('[data-suggestions-list="pronunciation"]');
    const examplesList = form.querySelector('[data-suggestions-list="examples"]');
    const hintsList = form.querySelector('[data-suggestions-list="hints"]');
    const markersList = form.querySelector('[data-suggestions-list="markers"]');

    if (definitionsList) {
        definitionsList.innerHTML = (suggestions.definitions || []).map((item) => `
            <label
                class="card-form__suggestion card-form__suggestion--definition"
                data-fill-card-field="back"
                data-fill-value="${escapeHtml(item.text)}"
            >
                ${renderSuggestionRadio({
            name: 'definition_suggestion',
            value: item.id,
        })}

                <span class="card-form__suggestion-content">
                    <span class="card-form__suggestion-text text text--small">
                        ${escapeHtml(item.text)}
                    </span>

                    <span class="card-form__suggestion-source text text--small">
                        Источник: ${escapeHtml(item.source || 'AI')}
                    </span>
                </span>
            </label>
        `).join('');
    }

    if (termsList) {
        termsList.innerHTML = (suggestions.terms || []).map((item) => `
            <label
                class="card-form__suggestion card-form__suggestion--media"
                data-fill-card-field="front"
                data-fill-value="${escapeHtml(item.text)}"
                data-suggestion-kind="term"
                data-suggestion-image-url="${escapeHtml(item.image_url || '')}"
            >
                ${renderSuggestionRadio({
            name: 'term_suggestion',
            value: item.id,
        })}

                <span class="card-form__suggestion-content">
                    <span class="card-form__suggestion-text text text--small">
                        ${escapeHtml(item.text)}
                    </span>
                </span>

                <button
                    class="card-form__suggestion-action button button--muted button--sm button--radius-circle button--icon"
                    type="button"
                    aria-label="Обновить картинку"
                    data-regenerate-suggestion-image
                    data-term="${escapeHtml(item.text)}"
                >
                    ${renderButtonInner({
            icon: 'rotate',
            iconSize: 'xs',
        })}
                </button>

                <span class="card-form__suggestion-image" data-suggestion-image>
                    ${item.image_url
                ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.text)}">`
                : '<span class="card-form__suggestion-image-empty"></span>'
            }
                </span>
            </label>
        `).join('');
    }

    if (pronunciationList) {
        const ukPronunciation = getUkPronunciationSuggestion(
            suggestions.pronunciation || []
        );

        pronunciationList.innerHTML = ukPronunciation
            ? `
                <label
                    class="card-form__suggestion card-form__suggestion--pronunciation"
                    data-fill-card-field="transcription"
                    data-fill-value="${escapeHtml(ukPronunciation.transcription || '')}"
                >
                    ${renderSuggestionRadio({
                name: 'pronunciation_suggestion',
                value:
                    ukPronunciation.value ||
                    ukPronunciation.id ||
                    ukPronunciation.transcription ||
                    'uk',
            })}

                    <span class="card-form__suggestion-accent text text--small">
                        UK

                        <button
                            class="card-form__suggestion-sound button button--muted button--sm button--radius-circle button--icon"
                            type="button"
                            aria-label="Прослушать британское произношение"
                            data-play-pronunciation
                            data-audio-url="${escapeHtml(ukPronunciation.audio_url || '')}"
                        >
                            ${renderButtonInner({
                icon: 'volume',
                iconSize: 'xs',
            })}
                        </button>
                    </span>

                    <span class="card-form__suggestion-transcription text text--small">
                        ${escapeHtml(ukPronunciation.transcription || '')}
                    </span>
                </label>
            `
            : `
                <p class="card-form__suggestions-empty text text--small">
                    Британское произношение не найдено.
                </p>
            `;
    }

    if (hintsList) {
        hintsList.innerHTML = (suggestions.hints || []).map((item) => `
            <label
                class="card-form__suggestion card-form__suggestion--simple"
                data-fill-card-field="hint"
                data-fill-value="${escapeHtml(item.text)}"
            >
                ${renderSuggestionRadio({
            name: 'hint_suggestion',
            value: item.id,
        })}

                <span class="card-form__suggestion-text text text--small">
                    ${escapeHtml(item.text)}
                </span>
            </label>
        `).join('');
    }

    if (examplesList) {
        examplesList.innerHTML = (suggestions.examples || []).map((item) => `
            <label
                class="card-form__suggestion card-form__suggestion--simple"
                data-fill-card-field="example"
                data-fill-value="${escapeHtml(item.text)}"
            >
                ${renderSuggestionRadio({
            name: 'example_suggestion',
            value: item.id,
        })}

                <span class="card-form__suggestion-text text text--small">
                    ${escapeHtml(item.text)}
                </span>
            </label>
        `).join('');
    }

    if (markersList) {
        markersList.innerHTML = (suggestions.markers || []).map((item) => `
            <label
                class="card-form__suggestion-chip"
                data-fill-card-field="marker"
                data-fill-value="${escapeHtml(item.text)}"
            >
                ${renderSuggestionRadio({
            name: 'marker_suggestion',
            value: item.id,
        })}

                <span>${escapeHtml(item.text)}</span>
            </label>
        `).join('');
    }
};

const loadCardSuggestions = async (form) => {
    const url = form.dataset.cardSuggestionsUrl;
    const wrap = form.querySelector('[data-card-suggestions-wrap]');
    const status = form.querySelector('[data-card-suggestions-status]');

    const updateCurrentSuggestionsFade = () => {
        const row = form.querySelector('[data-suggestions-tabs-row]');

        if (!row) return;

        requestAnimationFrame(() => {
            updateSuggestionsScrollFade(row);
        });
    };

    if (!url || !wrap) return;

    const isLanguageSet = form.dataset.language === 'en';

    if (!isLanguageSet) {
        wrap.hidden = true;
        return;
    }

    const payload = getCardSuggestionsPayload(form);
    const query = payload.front || payload.back;

    if (query.length < 2) {
        wrap.hidden = true;
        return;
    }

    wrap.hidden = false;
    updateCurrentSuggestionsFade();

    if (status) {
        status.textContent = 'Подбираем варианты...';
    }

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
    });

    if (!response.ok) {
        if (status) {
            status.textContent = 'Не удалось загрузить варианты';
        }

        return;
    }

    const data = await response.json();

    if (!data.available || !data.suggestions) {
        wrap.hidden = true;
        return;
    }

    renderCardSuggestions(form, data.suggestions);
    updateCurrentSuggestionsFade();

    const suggestionsRoot = form.querySelector('[data-card-suggestions]');

    if (suggestionsRoot) {
        updateAllSuggestionsListFades(suggestionsRoot);
    }

    if (status) {
        status.textContent = 'Доступны варианты заполнения';
    }
};

export const debouncedCardSuggestions = debounce((form) => {
    loadCardSuggestions(form).catch((error) => {
        console.error(error);
    });
}, 500);

const applyExternalCardImage = (form, imageUrl) => {
    if (!imageUrl) return;

    const selectedImageInput = form.querySelector('[data-selected-image-url]');
    const removeImageInput = form.querySelector('[data-remove-image]');
    const fileInput = form.querySelector('[data-card-image-input]');
    const upload = form.querySelector('[data-card-image-upload], .card-form__image-upload');
    const preview = form.querySelector('[data-card-image-preview]');
    const previewImg = form.querySelector('[data-card-image-preview-img]');

    if (selectedImageInput) {
        selectedImageInput.value = imageUrl;
    }

    if (removeImageInput) {
        removeImageInput.value = '0';
    }

    if (fileInput) {
        fileInput.value = '';
    }

    if (previewImg) {
        previewImg.src = imageUrl;
    }

    if (preview) {
        preview.hidden = false;
    }

    if (upload) {
        upload.hidden = true;
    }
};

export const initCardSuggestionFill = () => {
    document.addEventListener('change', (event) => {
        const input = event.target.closest('.card-form__suggestion-input');

        if (!input) return;

        const suggestion = input.closest('[data-fill-card-field]');

        if (!suggestion) return;

        const form = input.closest('[data-card-form]');
        const fieldName = suggestion.dataset.fillCardField;
        const value = suggestion.dataset.fillValue || '';
        const suggestionKind = suggestion.dataset.suggestionKind || '';

        const field = form?.querySelector(`[name="${fieldName}"]`);

        if (!form || !field) return;

        const oldValue = field.value.trim();
        const newValue = value.trim();

        if (oldValue !== newValue) {
            field.value = value;

            if (suggestionKind !== 'term') {
                field.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        if (suggestionKind === 'term') {
            const imageUrl = suggestion.dataset.suggestionImageUrl || '';

            if (imageUrl) {
                applyExternalCardImage(form, imageUrl);
            }
        }
    });
};

export const initSuggestionImageRegeneration = () => {
    document.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-regenerate-suggestion-image]');

        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        const form = button.closest('[data-card-form]');
        const url = form?.dataset.cardSuggestionImageUrl;
        const term = button.dataset.term || '';

        if (!url || !term) {
            window.showToast?.({
                type: 'error',
                title: 'Не удалось подобрать картинку',
                message: 'Не найден адрес запроса или термин.',
            });

            return;
        }

        const suggestion = button.closest('.card-form__suggestion');
        let imageWrap = suggestion?.querySelector('[data-suggestion-image]');

        if (!imageWrap && suggestion) {
            imageWrap = document.createElement('span');
            imageWrap.className = 'card-form__suggestion-image';
            imageWrap.dataset.suggestionImage = 'true';
            suggestion.append(imageWrap);
        }

        button.classList.add('is-loading');
        button.disabled = true;

        try {
            const formData = new FormData();

            formData.set('term', term);

            const response = await fetch(url, {
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
                    title: 'Не удалось подобрать картинку',
                    message: data.message || 'Попробуйте ещё раз.',
                });

                return;
            }

            if (suggestion) {
                suggestion.dataset.suggestionImageUrl = data.image_url || '';
            }

            if (imageWrap) {
                imageWrap.innerHTML = data.image_url
                    ? `
            <img
                src="${escapeHtml(data.image_url)}"
                alt="${escapeHtml(term)}"
            >
        `
                    : '';
            }

            if (data.image_url) {
                const radio = suggestion?.querySelector('.card-form__suggestion-input');

                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', {
                        bubbles: true,
                    }));
                } else {
                    applyExternalCardImage(form, data.image_url);
                }
            }
        } catch (error) {
            console.error(error);

            window.showToast?.({
                type: 'error',
                title: 'Не удалось подобрать картинку',
                message: 'Проверьте подключение и попробуйте ещё раз.',
            });
        } finally {
            button.classList.remove('is-loading');
            button.disabled = false;
        }
    });
};

let currentPronunciationAudio = null;

export const initPronunciationAudio = () => {
    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-play-pronunciation]');

        if (!button) return;

        event.preventDefault();

        const audioUrl = button.dataset.audioUrl;

        if (!audioUrl) {
            window.showToast?.({
                type: 'error',
                title: 'Аудио недоступно',
                message: 'Для этого варианта нет записи произношения.',
            });

            return;
        }

        if (currentPronunciationAudio) {
            currentPronunciationAudio.pause();
            currentPronunciationAudio = null;
        }

        currentPronunciationAudio = new Audio(audioUrl);

        currentPronunciationAudio.play().catch(() => {
            window.showToast?.({
                type: 'error',
                title: 'Не удалось воспроизвести',
                message: 'Браузер заблокировал или не загрузил аудио.',
            });
        });
    });
};
