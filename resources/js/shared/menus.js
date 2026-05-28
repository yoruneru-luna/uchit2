// ==============================
// Sort menus
// ==============================

export const initSortMenus = () => {
    document.querySelectorAll('[data-sort]').forEach((sortRoot) => {
        const toggle = sortRoot.querySelector('[data-sort-toggle]');
        const menu = sortRoot.querySelector('[data-sort-menu]');

        if (!toggle || !menu) return;

        const GAP = 12;

        const getState = () => {
            const activeSort = sortRoot.querySelector('[data-sort-group="by"].is-active');
            const activeOrder = sortRoot.querySelector('[data-sort-group="order"].is-active');

            return {
                sortBy: activeSort?.dataset.value ?? 'review_due',
                order: activeOrder?.dataset.value ?? 'desc',
            };
        };

        const updateMenuPosition = () => {
            menu.classList.remove('sort-menu--top');

            menu.hidden = false;

            const menuHeight = menu.offsetHeight;
            const toggleRect = toggle.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - toggleRect.bottom;
            const spaceAbove = toggleRect.top;

            menu.hidden = true;

            const shouldOpenTop =
                spaceBelow < menuHeight + GAP && spaceAbove > spaceBelow;

            menu.classList.toggle('sort-menu--top', shouldOpenTop);
        };

        const openMenu = () => {
            updateMenuPosition();
            menu.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
        };

        const closeMenu = () => {
            menu.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        };

        const toggleMenu = () => {
            if (menu.hidden) {
                openMenu();
            } else {
                closeMenu();
            }
        };

        toggle.addEventListener('click', () => {
            toggleMenu();
        });

        menu.addEventListener('click', (event) => {
            const option = event.target.closest('[data-sort-option]');

            if (!option) return;

            const group = option.dataset.sortGroup;

            menu
                .querySelectorAll(`[data-sort-group="${group}"]`)
                .forEach((item) => item.classList.remove('is-active'));

            option.classList.add('is-active');

            const state = getState();

            sortRoot.dataset.sortBy = state.sortBy;
            sortRoot.dataset.sortOrder = state.order;

            sortRoot.dispatchEvent(
                new CustomEvent('home:sort-change', {
                    bubbles: true,
                    detail: state,
                })
            );

            closeMenu();
        });

        document.addEventListener('click', (event) => {
            if (!sortRoot.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (!menu.hidden) {
                updateMenuPosition();
            }
        });

        window.addEventListener(
            'scroll',
            () => {
                if (!menu.hidden) {
                    updateMenuPosition();
                }
            },
            true
        );

        const initialState = getState();

        sortRoot.dataset.sortBy = initialState.sortBy;
        sortRoot.dataset.sortOrder = initialState.order;
    });
};

// ==============================
// Card menus
// ==============================

export const closeAllCardMenus = () => {
    document.querySelectorAll('[data-card-menu]').forEach((menuRoot) => {
        const toggle = menuRoot.querySelector('[data-card-menu-toggle]');
        const dropdown = menuRoot.querySelector('[data-card-menu-dropdown]');

        if (!toggle || !dropdown) return;

        dropdown.hidden = true;
        dropdown.classList.remove('card-menu--top');
        toggle.setAttribute('aria-expanded', 'false');
    });
};

const updateCardMenuPosition = (menuRoot) => {
    const toggle = menuRoot.querySelector('[data-card-menu-toggle]');
    const dropdown = menuRoot.querySelector('[data-card-menu-dropdown]');

    if (!toggle || !dropdown) return;

    const GAP = 8;

    dropdown.classList.remove('card-menu--top');
    dropdown.hidden = false;

    const dropdownHeight = dropdown.offsetHeight;
    const toggleRect = toggle.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - toggleRect.bottom;
    const spaceAbove = toggleRect.top;

    const shouldOpenTop =
        spaceBelow < dropdownHeight + GAP && spaceAbove > spaceBelow;

    dropdown.classList.toggle('card-menu--top', shouldOpenTop);
};

export const initCardMenus = () => {
    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-card-menu-toggle]');
        const insideMenu = event.target.closest('[data-card-menu]');

        if (toggle) {
            event.preventDefault();
            event.stopPropagation();

            const menuRoot = toggle.closest('[data-card-menu]');
            const dropdown = menuRoot?.querySelector('[data-card-menu-dropdown]');

            if (!menuRoot || !dropdown) return;

            const isOpen = !dropdown.hidden;

            closeAllCardMenus();

            if (!isOpen) {
                updateCardMenuPosition(menuRoot);
                toggle.setAttribute('aria-expanded', 'true');
            }

            return;
        }

        if (!insideMenu) {
            closeAllCardMenus();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllCardMenus();
        }
    });

    window.addEventListener('resize', () => {
        document.querySelectorAll('[data-card-menu]').forEach((menuRoot) => {
            const dropdown = menuRoot.querySelector('[data-card-menu-dropdown]');

            if (dropdown && !dropdown.hidden) {
                updateCardMenuPosition(menuRoot);
            }
        });
    });

    window.addEventListener(
        'scroll',
        () => {
            document.querySelectorAll('[data-card-menu]').forEach((menuRoot) => {
                const dropdown = menuRoot.querySelector('[data-card-menu-dropdown]');

                if (dropdown && !dropdown.hidden) {
                    updateCardMenuPosition(menuRoot);
                }
            });
        },
        true
    );
};
