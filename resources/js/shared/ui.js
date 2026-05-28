// ==============================
// Custom select
// ==============================

const closeCustomSelect = (select) => {
    if (!select) return;

    const toggle = select.querySelector('[data-custom-select-toggle]');
    const dropdown = select.querySelector('[data-custom-select-dropdown]');

    if (!toggle || !dropdown) return;

    toggle.setAttribute('aria-expanded', 'false');
    dropdown.hidden = true;

    dropdown
        .querySelectorAll('[data-custom-select-option]')
        .forEach((option) => {
            option.classList.remove('is-focused');
        });
};

const openCustomSelect = (select) => {
    if (!select) return;

    const toggle = select.querySelector('[data-custom-select-toggle]');
    const dropdown = select.querySelector('[data-custom-select-dropdown]');

    if (!toggle || !dropdown) return;

    toggle.setAttribute('aria-expanded', 'true');
    dropdown.hidden = false;

    const selectedOption =
        dropdown.querySelector('[data-custom-select-option].is-selected') ||
        dropdown.querySelector('[data-custom-select-option]');

    selectedOption?.classList.add('is-focused');
    selectedOption?.scrollIntoView({ block: 'nearest' });
};

export const selectCustomOption = (select, option) => {
    if (!select || !option) return;
    
    const input = select.querySelector('[data-custom-select-input]');
    const currentLabel = select.querySelector('[data-custom-select-current-label]');
    const currentMarker = select.querySelector('[data-custom-select-current-marker]');
    const options = select.querySelectorAll('[data-custom-select-option]');

    if (!input || !currentLabel) return;

    input.value = option.dataset.value;
    currentLabel.textContent = option.dataset.label;

    if (currentMarker) {
        currentMarker.className = `category-select__marker category-select__marker--${option.dataset.tone || 'default'}`;

        if (option.dataset.color) {
            currentMarker.style.background = option.dataset.color;
        } else {
            currentMarker.style.background = '';
        }
    }

    options.forEach((item) => {
        const isSelected = item === option;

        item.classList.toggle('is-selected', isSelected);
        item.setAttribute('aria-selected', String(isSelected));
    });

    input.dispatchEvent(new Event('change', { bubbles: true }));

    closeCustomSelect(select);
};

export const initCustomSelects = () => {
    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-custom-select-toggle]');
        const option = event.target.closest('[data-custom-select-option]');
        const currentSelect = event.target.closest('[data-custom-select]');

        document.querySelectorAll('[data-custom-select]').forEach((select) => {
            if (select !== currentSelect) {
                closeCustomSelect(select);
            }
        });

        if (toggle) {
            const select = toggle.closest('[data-custom-select]');
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';

            if (isOpen) {
                closeCustomSelect(select);
            } else {
                openCustomSelect(select);
            }

            return;
        }

        if (option) {
            const select = option.closest('[data-custom-select]');

            if (!select) return;

            selectCustomOption(select, option);
        }
    });

    document.addEventListener('keydown', (event) => {
        const select = event.target.closest('[data-custom-select]');

        if (!select) return;

        const toggle = select.querySelector('[data-custom-select-toggle]');
        const dropdown = select.querySelector('[data-custom-select-dropdown]');
        const options = [...select.querySelectorAll('[data-custom-select-option]')];

        if (!toggle || !dropdown || !options.length) return;

        const isOpen = toggle.getAttribute('aria-expanded') === 'true';

        if (event.key === 'Escape') {
            closeCustomSelect(select);
            toggle.focus();
            return;
        }

        if ((event.key === 'Enter' || event.key === ' ') && event.target === toggle) {
            event.preventDefault();

            if (isOpen) {
                closeCustomSelect(select);
            } else {
                openCustomSelect(select);
            }

            return;
        }

        if (!isOpen) return;

        const currentIndex = options.findIndex((option) =>
            option.classList.contains('is-focused')
        );

        if (event.key === 'ArrowDown') {
            event.preventDefault();

            const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;

            options.forEach((option) => option.classList.remove('is-focused'));
            options[nextIndex].classList.add('is-focused');
            options[nextIndex].scrollIntoView({ block: 'nearest' });
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();

            const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;

            options.forEach((option) => option.classList.remove('is-focused'));
            options[prevIndex].classList.add('is-focused');
            options[prevIndex].scrollIntoView({ block: 'nearest' });
        }

        if (event.key === 'Enter') {
            event.preventDefault();

            const focusedOption =
                options.find((option) => option.classList.contains('is-focused')) ||
                options[0];

            selectCustomOption(select, focusedOption);
            toggle.focus();
        }
    });
};

// ==============================
// Sidebar sheets
// ==============================

export const closeSidebarSheet = (sheet) => {
    if (!sheet) return;

    sheet.hidden = true;
    document.body.classList.remove('is-sidebar-sheet-open');
};

export const openSidebarSheet = (sheet) => {
    if (!sheet) return;

    sheet.hidden = false;
    document.body.classList.add('is-sidebar-sheet-open');
};

export const initSidebarSheets = () => {
    window.openSidebarSheet = openSidebarSheet;
    window.closeSidebarSheet = closeSidebarSheet;

    document.addEventListener('click', (event) => {
        const openButton = event.target.closest('[data-sidebar-sheet-open]');
        const closeButton = event.target.closest('[data-sidebar-sheet-close]');

        if (openButton) {
            const id = openButton.dataset.sidebarSheetOpen;
            const sheet = document.querySelector(
                `[data-sidebar-sheet-id="${id}"]`
            );

            openSidebarSheet(sheet);
            return;
        }

        if (closeButton) {
            const sheet = closeButton.closest('[data-sidebar-sheet]');
            closeSidebarSheet(sheet);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        const openedSheets = [
            ...document.querySelectorAll('[data-sidebar-sheet]:not([hidden])'),
        ];

        const lastOpenedSheet = openedSheets.at(-1);

        if (lastOpenedSheet) {
            closeSidebarSheet(lastOpenedSheet);
        }
    });
};

// ==============================
// Accordions
// ==============================

export const initAccordions = () => {
    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-accordion-toggle]');

        if (!toggle) return;

        const root = toggle.closest('[data-accordion]');
        const panel = root?.querySelector('[data-accordion-panel]');

        if (!root || !panel) return;

        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        toggle.setAttribute('aria-expanded', String(!isExpanded));
        panel.setAttribute('aria-hidden', String(isExpanded));
    });
};
