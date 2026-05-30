import {
    initToasts,
} from './shared/toast';

import {
    initConfirmDialog,
} from './shared/confirm-dialog';

import {
    initCustomSelects,
    initSidebarSheets,
    initAccordions,
} from './shared/ui';

import {
    initSortMenus,
    initCardMenus,
} from './shared/menus';

import {
    initDatePickers,
    initInputClearButtons,
    initTextareaClearButtons,
    initColorFields,
    initProgressLegends,
    initSubscriptionPanels,
} from './shared/form-ui';

import {
    initEmailValidation,
    initRegisterValidation,
    initLoginPasswordState,
} from './features/auth';

import {
    initProfileEvents,
} from './features/profile';

import {
    initContactEvents,
} from './features/contact';

import {
    initNotifications,
    initNotificationEvents,
    loadNotifications,
} from './features/notifications';

import {
    initCategoryForms,
    initCategoryEvents,
    initCategories,
    reloadCategories,
    renderCategories,
} from './features/categories';

import {
    configureSetFormDeps,
    initSetForms,
    initCreateSetFlowEvents,
    initSetFormsCreateData,
    refreshSetCategorySelects,
} from './features/set-forms';

import {
    configureSetsDeps,
    initSets,
    initSetEvents,
    reloadSets,
    renderSets,
    syncSetControls,
    renderSetDetails,
    loadSetCards,
} from './features/sets';

import {
    configureCardDeps,
    renderSetCards,
    openCardFormForSet,
    initCardForms,
    initCardEvents,
} from './features/cards';

import {
    initCardSuggestions,
    initCardSuggestionFill,
    initSuggestionImageRegeneration,
    initPronunciationAudio,
} from './features/card-suggestions';

import {
    configureGlobalSearchDeps,
    initGlobalSearchEvents,
} from './features/global-search';

import {
    configureStudyDeps,
    initStudyModeEvents,
    initStudySessionEvents,
    initDueReviewEvents,
} from './features/study';

import {
    initAdminPanel,
} from './features/admin';

let isAppInitialized = false;
let homePollingId = null;

const syncHomeAfterStudyReview = async () => {
    await Promise.allSettled([
        reloadSets(),
        reloadCategories(),
        loadNotifications(),
    ]);
};

const initHomePolling = () => {
    const hasHomeData =
        document.querySelector('[data-sets-section]') ||
        document.querySelector('[data-categories-section]') ||
        document.querySelector('[data-notifications-badge]');

    if (!hasHomeData) return;

    if (homePollingId) {
        window.clearInterval(homePollingId);
    }

    homePollingId = window.setInterval(() => {
        reloadSets();
        reloadCategories();
        loadNotifications();
    }, 30 * 1000);
};

const initApp = () => {
    if (isAppInitialized) return;

    isAppInitialized = true;

    initDatePickers();

    initInputClearButtons();
    initTextareaClearButtons();
    initEmailValidation();
    initRegisterValidation();
    initLoginPasswordState();

    initToasts();
    initConfirmDialog();

    initSubscriptionPanels();
    initProgressLegends();
    initColorFields();

    initCardSuggestions();
    initCardSuggestionFill();
    initSuggestionImageRegeneration();

    initCustomSelects();
    initSidebarSheets();
    initAccordions();
    initSortMenus();
    initCardMenus();

    configureGlobalSearchDeps({
        reloadSets,
    });

    initGlobalSearchEvents();
    initContactEvents();

    initCategoryForms();

    initCategoryEvents({
        syncSetControls,
        renderSets,
        reloadSets,
        refreshSetCategorySelects,
    });

    configureSetsDeps({
        reloadCategories,
        renderCategories,
        renderSetCards,
    });

    configureCardDeps({
        reloadSets,
        reloadCategories,
        renderSets,
        renderSetDetails,
        loadSetCards,
    });

    configureSetFormDeps({
        reloadSets,
        openCardFormForSet,
        renderSetDetails,
        loadSetCards,
    });

    configureStudyDeps({
        syncHomeAfterStudyReview,
    });

    initSetForms();
    initCreateSetFlowEvents();
    initSetEvents();

    initCardForms();
    initCardEvents();
    initPronunciationAudio();

    initProfileEvents();

    initStudyModeEvents();
    initStudySessionEvents();
    initDueReviewEvents();

    initNotificationEvents();

    initCategories();
    initSets();
    initSetFormsCreateData();
    initNotifications();
    initAdminPanel();

    initHomePolling();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
