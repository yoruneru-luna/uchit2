export const CARD_REQUIRED_COUNT = 5;

export const categoriesState = {
    items: [],
    search: '',
    sortBy: 'created_at',
    order: 'asc',
    isLoading: false,
};

export const setsState = {
    items: [],
    search: '',
    sortBy: 'created_at',
    order: 'desc',
    selectedCategory: null,
    isLoading: false,
};

export const globalSearchState = {
    query: '',
    abortController: null,
    debounceTimer: null,
};

export const studyModeState = {
    setId: null,
    mode: null,
    source: 'set',
};

export const studySessionState = {
    setId: null,
    mode: null,
    settings: {},
    cards: [],
    index: 0,
    isFlipped: false,
    wasFlippedOnce: false,
    isLanguageSet: false,
    isHintVisible: false,

    writtenAnswer: '',
    isChecked: false,
    isCorrect: false,
};

export const notificationsState = {
    items: [],
    unreadCount: 0,
};
