import flatpickr from 'flatpickr';
import IMask from 'imask';

import 'flatpickr/dist/flatpickr.min.css';

document.querySelectorAll('[data-picker="date"]').forEach((input) => {
    const picker = flatpickr(input, {
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd.m.Y',
        allowInput: true,
        disableMobile: true,
        position: 'auto right',
    });

    if (!picker.altInput) return;

    let mask = null;

    picker.altInput.addEventListener('focus', () => {
        if (mask) return;

        mask = IMask(picker.altInput, {
            mask: Date,
            pattern: 'd.`m.`Y',
            lazy: false,
            autofix: true,
            blocks: {
                d: {
                    mask: IMask.MaskedRange,
                    from: 1,
                    to: 31,
                    maxLength: 2,
                },
                m: {
                    mask: IMask.MaskedRange,
                    from: 1,
                    to: 12,
                    maxLength: 2,
                },
                Y: {
                    mask: IMask.MaskedRange,
                    from: 1900,
                    to: new Date().getFullYear(),
                },
            },
        });
    });

    picker.altInput.addEventListener('blur', () => {
        if (!mask) return;

        if (!picker.altInput.value) {
            mask.destroy();
            mask = null;
        }
    });
});

document.addEventListener('mousedown', (event) => {
    const clearButton = event.target.closest('.input-field__clear');

    if (!clearButton) return;

    event.preventDefault();

    const wrapper = clearButton.closest('.input, .input-field');
    const input = wrapper?.querySelector('.input-field__control');
    const message = wrapper?.querySelector('.input__message');

    if (!wrapper || !input) return;

    input.value = '';

    wrapper.classList.remove('is-error', 'is-success');

    if (message) {
        message.textContent = '';
    }

    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
});

document.querySelectorAll('.textarea-field').forEach((textareaWrapper) => {
    const textarea = textareaWrapper.querySelector('.textarea-field__control');
    const clearButton = textareaWrapper.querySelector('.textarea-field__clear');

    if (!textarea || !clearButton) return;

    clearButton.addEventListener('mousedown', (event) => {
        event.preventDefault();

        textarea.value = '';

        textareaWrapper.classList.remove('is-error', 'is-success');

        const message = textareaWrapper.querySelector('.textarea-field__message');

        if (message) {
            message.textContent = '';
        }

        textarea.focus();

        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
});

const closeCustomSelect = (select) => {
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

const selectCustomOption = (select, option) => {
    const input = select.querySelector('[data-custom-select-input]');
    const currentLabel = select.querySelector('[data-custom-select-current-label]');
    const currentMarker = select.querySelector('[data-custom-select-current-marker]');
    const options = select.querySelectorAll('[data-custom-select-option]');

    if (!input || !currentLabel) return;

    input.value = option.dataset.value;
    currentLabel.textContent = option.dataset.label;

    // Только для category-select, где есть цветной маркер
    if (currentMarker) {
        currentMarker.className = `category-select__marker category-select__marker--${option.dataset.tone || 'default'}`;
    }

    options.forEach((item) => {
        const isSelected = item === option;

        item.classList.toggle('is-selected', isSelected);
        item.setAttribute('aria-selected', String(isSelected));
    });

    input.dispatchEvent(new Event('change', { bubbles: true }));

    closeCustomSelect(select);
};

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

const emailInput = document.querySelector('[data-validate-email-url]');

if (emailInput) {
    const inputWrapper = emailInput.closest('.input');
    const message = inputWrapper.querySelector('.input__message');
    const url = emailInput.dataset.validateEmailUrl;

    let timer = null;

    const setState = (state, text = '') => {
        inputWrapper.classList.remove('is-error', 'is-success');

        if (state) {
            inputWrapper.classList.add(`is-${state}`);
        }

        message.textContent = text;
    };

    const isValidEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    emailInput.addEventListener('input', () => {
        clearTimeout(timer);

        const email = emailInput.value.trim();

        if (!email) {
            setState(null);
            return;
        }

        timer = setTimeout(async () => {
            if (!isValidEmail(email)) {
                setState('error', 'Введите корректную эл. почту');
                return;
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute('content'),
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setState('error', data.message || 'Ошибка проверки');
                    return;
                }

                setState('success');
            } catch {
                setState('error', 'Не удалось проверить почту');
            }
        }, 500);
    });
}

const registerForm = document.querySelector('[data-register-validate-url]');

if (registerForm) {
    const url = registerForm.dataset.registerValidateUrl;

    const setState = (input, state, text = '') => {
        const wrapper = input.closest('.input');
        const message = wrapper?.querySelector('.input__message');

        if (!wrapper) return;

        wrapper.classList.remove('is-error', 'is-success');

        if (state) {
            wrapper.classList.add(`is-${state}`);
        }

        if (message) {
            message.textContent = text;
        }
    };

    const getValues = () => {
        const data = new FormData(registerForm);

        return {
            name: data.get('name') || '',
            nickname: data.get('nickname') || '',
            birthday: data.get('birthday') || '',
            password: data.get('password') || '',
            password_confirmation: data.get('password_confirmation') || '',
        };
    };

    const validateField = async (input) => {
        const field = input.name;

        if (!field) return;

        if (!input.value.trim()) {
            setState(input, null);
            return;
        }

        if (field === 'nickname') {
            input.value = input.value.toLowerCase();
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute('content'),
                },
                body: JSON.stringify({
                    field,
                    ...getValues(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setState(
                    input,
                    'error',
                    data.errors?.[field]?.[0] || data.message || 'Ошибка проверки'
                );

                return;
            }

            setState(input, 'success');
        } catch {
            setState(input, 'error', 'Не удалось проверить поле');
        }
    };

    registerForm
        .querySelectorAll('input[name]')
        .forEach((input) => {
            let timer = null;

            input.addEventListener('input', () => {
                clearTimeout(timer);

                timer = setTimeout(() => {
                    validateField(input);
                }, 400);
            });

            input.addEventListener('blur', () => {
                clearTimeout(timer);
                validateField(input);
            });
        });
}

const loginPasswordInput = document.querySelector(
    '.auth-page input[name="password"]'
);

if (loginPasswordInput) {
    const wrapper = loginPasswordInput.closest('.input');
    const message = wrapper?.querySelector('.input__message');

    loginPasswordInput.addEventListener('input', () => {
        wrapper.classList.remove('is-error', 'is-success');

        if (message) {
            message.textContent = '';
        }

        if (loginPasswordInput.value.trim().length > 0) {
            wrapper.classList.add('is-success');
        }
    });
}

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

const updateProgressLegends = () => {
    document.querySelectorAll('[data-progress-bar]').forEach((bar) => {
        const legends = [...bar.querySelectorAll('.progress-card__legend-item')];
        const barRect = bar.getBoundingClientRect();

        legends.forEach((legend) => {
            legend.classList.remove(
                'progress-card__legend-item--top',
                'progress-card__legend-item--left',
                'progress-card__legend-item--right'
            );
        });

        legends.forEach((legend) => {
            const rect = legend.getBoundingClientRect();

            if (rect.left < barRect.left) {
                legend.classList.add('progress-card__legend-item--left');
            } else if (rect.right > barRect.right) {
                legend.classList.add('progress-card__legend-item--right');
            }
        });

        for (let i = 0; i < legends.length; i++) {
            const current = legends[i];

            for (let j = 0; j < i; j++) {
                const previous = legends[j];

                const currentRect = current.getBoundingClientRect();
                const previousRect = previous.getBoundingClientRect();

                const overlaps =
                    currentRect.left < previousRect.right &&
                    currentRect.right > previousRect.left &&
                    currentRect.top < previousRect.bottom &&
                    currentRect.bottom > previousRect.top;

                if (overlaps) {
                    current.classList.add('progress-card__legend-item--top');
                    break;
                }
            }
        }
    });
};

window.addEventListener('load', updateProgressLegends);
window.addEventListener('resize', updateProgressLegends);

// выпадашки редактировать удалить

const closeAllCardMenus = () => {
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

// const closeAllCardMenus = () => {
//     document.querySelectorAll('[data-card-menu]').forEach((menuRoot) => {
//         const toggle = menuRoot.querySelector('[data-card-menu-toggle]');
//         const dropdown = menuRoot.querySelector('[data-card-menu-dropdown]');

//         if (!toggle || !dropdown) return;

//         dropdown.hidden = true;
//         dropdown.classList.remove('card-menu--top');
//         toggle.setAttribute('aria-expanded', 'false');
//     });
// };

// const updateCardMenuPosition = (menuRoot) => {
//     const toggle = menuRoot.querySelector('[data-card-menu-toggle]');
//     const dropdown = menuRoot.querySelector('[data-card-menu-dropdown]');

//     if (!toggle || !dropdown) return;

//     const GAP = 8;

//     dropdown.classList.remove('card-menu--top');
//     dropdown.hidden = false;

//     const dropdownHeight = dropdown.offsetHeight;
//     const toggleRect = toggle.getBoundingClientRect();
//     const viewportHeight = window.innerHeight;
//     const spaceBelow = viewportHeight - toggleRect.bottom;
//     const spaceAbove = toggleRect.top;

//     const shouldOpenTop =
//         spaceBelow < dropdownHeight + GAP && spaceAbove > spaceBelow;

//     dropdown.classList.toggle('card-menu--top', shouldOpenTop);
// };

// document.addEventListener('click', (event) => {
//     const toggle = event.target.closest('[data-card-menu-toggle]');
//     const edit = event.target.closest('[data-card-menu-edit]');
//     const del = event.target.closest('[data-card-menu-delete]');
//     const insideMenu = event.target.closest('[data-card-menu]');

//     if (toggle) {
//         const menuRoot = toggle.closest('[data-card-menu]');
//         const dropdown = menuRoot?.querySelector('[data-card-menu-dropdown]');

//         if (!menuRoot || !dropdown) return;

//         const isOpen = !dropdown.hidden;

//         closeAllCardMenus();

//         if (!isOpen) {
//             updateCardMenuPosition(menuRoot);
//             toggle.setAttribute('aria-expanded', 'true');
//         }

//         return;
//     }

//     if (edit) {
//         const menuRoot = edit.closest('[data-card-menu]');
//         closeAllCardMenus();

//         console.log('Редактировать');
//         return;
//     }

//     if (del) {
//         const menuRoot = del.closest('[data-card-menu]');
//         closeAllCardMenus();

//         console.log('Удалить');
//         return;
//     }

//     if (!insideMenu) {
//         closeAllCardMenus();
//     }
// });

// document.addEventListener('keydown', (event) => {
//     if (event.key === 'Escape') {
//         closeAllCardMenus();
//     }
// });

// window.addEventListener('resize', () => {
//     document.querySelectorAll('[data-card-menu]').forEach((menuRoot) => {
//         const dropdown = menuRoot.querySelector('[data-card-menu-dropdown]');
//         if (dropdown && !dropdown.hidden) {
//             updateCardMenuPosition(menuRoot);
//         }
//     });
// });

// window.addEventListener(
//     'scroll',
//     () => {
//         document.querySelectorAll('[data-card-menu]').forEach((menuRoot) => {
//             const dropdown = menuRoot.querySelector('[data-card-menu-dropdown]');
//             if (dropdown && !dropdown.hidden) {
//                 updateCardMenuPosition(menuRoot);
//             }
//         });
//     },
//     true
// );

document.querySelectorAll('[data-subscription]').forEach((root) => {
    const toggle = root.querySelector('[data-subscription-toggle]');
    const panel = root.querySelector('[data-subscription-panel]');

    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        toggle.setAttribute('aria-expanded', String(!isExpanded));
        panel.setAttribute('aria-hidden', String(isExpanded));
    });
});

const closeSidebarSheet = (sheet) => {
    if (!sheet) return;

    sheet.hidden = true;
    document.body.classList.remove('is-sidebar-sheet-open');
};

const openSidebarSheet = (sheet) => {
    if (!sheet) return;

    sheet.hidden = false;
    document.body.classList.add('is-sidebar-sheet-open');
};

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

document.querySelectorAll('[data-card-suggestions]').forEach((root) => {
    const row = root.querySelector('[data-suggestions-tabs-row]');
    const tabsScroller = root.querySelector('.card-form__suggestions-tabs');
    const tabs = [...root.querySelectorAll('[data-suggestions-tab]')];
    const panels = [...root.querySelectorAll('[data-suggestions-panel]')];
    const navButton = root.querySelector('[data-suggestions-nav]');

    if (!row || !tabsScroller || !tabs.length || !panels.length || !navButton) {
        return;
    }

    let direction = 'next';

    const getTabWidth = () => {
        return tabs[0]?.getBoundingClientRect().width || 120;
    };

    const getVisibleTabsCount = () => {
        const tabWidth = getTabWidth();
        const visibleCount = Math.floor(tabsScroller.clientWidth / tabWidth);

        return Math.max(1, visibleCount);
    };

    const getMaxStartIndex = () => {
        return Math.max(0, tabs.length - getVisibleTabsCount());
    };

    const getActiveIndex = () => {
        const activeIndex = tabs.findIndex((tab) => tab.classList.contains('is-active'));

        return activeIndex === -1 ? 0 : activeIndex;
    };

    const scrollToIndex = (index, behavior = 'smooth') => {
        const tabWidth = getTabWidth();
        const safeIndex = Math.max(0, Math.min(index, getMaxStartIndex()));

        tabsScroller.scrollTo({
            left: safeIndex * tabWidth,
            behavior,
        });
    };

    const updateNavDirection = () => {
        const activeIndex = getActiveIndex();
        const lastIndex = tabs.length - 1;

        if (activeIndex >= lastIndex) {
            direction = 'prev';

            row.classList.add('is-reverse');

            navButton.classList.remove('card-form__suggestions-nav--next');
            navButton.classList.add('card-form__suggestions-nav--prev');
            navButton.setAttribute('aria-label', 'Вернуться к первым вкладкам');

            return;
        }

        direction = 'next';

        row.classList.remove('is-reverse');

        navButton.classList.remove('card-form__suggestions-nav--prev');
        navButton.classList.add('card-form__suggestions-nav--next');
        navButton.setAttribute('aria-label', 'Показать следующие вкладки');
    };

    const setActiveTab = (tabName, shouldScroll = true) => {
        const activeTab = tabs.find((tab) => tab.dataset.suggestionsTab === tabName);

        if (!activeTab) return;

        const activeIndex = tabs.indexOf(activeTab);

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

        if (shouldScroll) {
            scrollToIndex(activeIndex);
        }

        updateNavDirection();
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            setActiveTab(tab.dataset.suggestionsTab);
        });
    });

    navButton.addEventListener('click', () => {
        if (direction === 'next') {
            const activeIndex = getActiveIndex();
            const nextIndex = Math.min(activeIndex + 1, tabs.length - 1);
            const nextTab = tabs[nextIndex];

            setActiveTab(nextTab.dataset.suggestionsTab);

            return;
        }

        const firstTab = tabs[0];

        setActiveTab(firstTab.dataset.suggestionsTab);
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

    window.addEventListener('resize', () => {
        scrollToIndex(getActiveIndex(), 'auto');
        updateNavDirection();
    });

    updateNavDirection();
});

document.querySelectorAll('[data-color-field]').forEach((field) => {
    const toggle = field.querySelector('[data-color-toggle]');
    const input = field.querySelector('[data-color-input]');
    const value = field.querySelector('[data-color-value]');

    if (!toggle || !input || !value) return;

    const updateColorState = () => {
        input.disabled = !toggle.checked;

        value.textContent = toggle.checked
            ? input.value
            : 'Без цвета';
    };

    toggle.addEventListener('change', updateColorState);

    input.addEventListener('input', () => {
        value.textContent = input.value;
    });

    updateColorState();
});

const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
};

const getFieldWrapper = (field) => {
    return field.closest('.input, .textarea-field, .category-form__color-field');
};

const clearFieldError = (field) => {
    const wrapper = getFieldWrapper(field);

    if (!wrapper) return;

    wrapper.classList.remove('is-error');

    const oldMessage = wrapper.parentElement?.querySelector('[data-js-field-error]');

    oldMessage?.remove();
};

const showFieldError = (field, message) => {
    const wrapper = getFieldWrapper(field);

    if (!wrapper) return;

    clearFieldError(field);

    wrapper.classList.add('is-error');

    const error = document.createElement('p');

    error.className = 'category-form__message';
    error.dataset.jsFieldError = 'true';
    error.textContent = message;

    wrapper.insertAdjacentElement('afterend', error);
};

const clearCategoryFormErrors = (form) => {
    form.querySelectorAll('.is-error').forEach((element) => {
        element.classList.remove('is-error');
    });

    form.querySelectorAll('[data-js-field-error]').forEach((element) => {
        element.remove();
    });
};

const setFormLoading = (form, isLoading) => {
    const submitButton = form.querySelector('[type="submit"]');

    if (!submitButton) return;

    submitButton.disabled = isLoading;
    submitButton.classList.toggle('is-disabled', isLoading);
};

const checkCategoryTitle = async (form, title) => {
    const checkUrl = form.dataset.categoryTitleCheckUrl;

    if (!checkUrl) return true;

    const url = new URL(checkUrl, window.location.origin);

    url.searchParams.set('title', title);

    if (form.dataset.categoryId) {
        url.searchParams.set('ignore_id', form.dataset.categoryId);
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        return true;
    }

    const data = await response.json();

    return Boolean(data.available);
};

const sendCategoryForm = async (form) => {
    const formData = new FormData(form);

    const response = await fetch(form.action, {
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
        if (data.errors) {
            Object.entries(data.errors).forEach(([name, messages]) => {
                const field = form.querySelector(`[name="${name}"]`);

                if (field) {
                    showFieldError(field, messages[0]);
                }
            });

            showToast({
                type: 'error',
                title: 'Не удалось сохранить',
                message: 'Проверьте поля и попробуйте ещё раз.',
            });
        } else {
            showToast({
                type: 'error',
                title: 'Не удалось сохранить',
                message: data.message || 'Попробуйте ещё раз.',
            });
        }

        return null;
    }

    return data;
};

document.querySelectorAll('[data-category-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        clearCategoryFormErrors(form);

        const titleField = form.querySelector('[name="title"]');
        const title = titleField?.value.trim() || '';

        if (!titleField) return;

        if (!title) {
            showFieldError(titleField, 'Введите название категории.');
            return;
        }

        if (title.length > 80) {
            showFieldError(titleField, 'Название категории не должно быть длиннее 80 символов.');
            return;
        }

        setFormLoading(form, true);

        try {
            const isTitleAvailable = await checkCategoryTitle(form, title);

            if (!isTitleAvailable) {
                showFieldError(titleField, 'Категория с таким названием уже существует.');
                return;
            }

            const data = await sendCategoryForm(form);

            if (!data) return;

            showToast({
                type: 'success',
                title: 'Категория создана',
                message: `Категория «${data.category.title}» добавлена.`,
            });

            form.dispatchEvent(
                new CustomEvent('category:saved', {
                    bubbles: true,
                    detail: data.category,
                })
            );

            form.reset();

            const colorFields = form.querySelectorAll('[data-color-field]');

            colorFields.forEach((field) => {
                const toggle = field.querySelector('[data-color-toggle]');
                const input = field.querySelector('[data-color-input]');
                const value = field.querySelector('[data-color-value]');

                if (!toggle || !input || !value) return;

                input.disabled = !toggle.checked;
                value.textContent = toggle.checked ? input.value : 'Без цвета';
            });
        } catch (error) {
            console.error(error);

            showToast({
                type: 'error',
                title: 'Не удалось сохранить',
                message: 'Проверьте подключение и попробуйте ещё раз.',
            });

            showFieldError(titleField, 'Не удалось сохранить категорию. Попробуйте ещё раз.');
        } finally {
            setFormLoading(form, false);
        }
    });
});

const createIconFallback = (type) => {
    if (type === 'success') return '✓';
    if (type === 'error') return '×';
    if (type === 'warning') return '!';
    return 'i';
};

const removeToast = (toast) => {
    if (!toast || toast.classList.contains('is-hiding')) return;

    toast.classList.remove('is-visible');
    toast.classList.add('is-hiding');

    toast.addEventListener(
        'transitionend',
        () => {
            toast.remove();
        },
        { once: true }
    );
};

export const showToast = ({
    type = 'success',
    title = 'Готово',
    message = '',
    duration = 4000,
} = {}) => {
    const container = document.querySelector('[data-toast-container]');

    if (!container) return;

    const toast = document.createElement('div');

    toast.className = `toast toast--${type}`;
    toast.dataset.toast = '';

    toast.innerHTML = `
        <div class="toast__icon" aria-hidden="true">
            <span>${createIconFallback(type)}</span>
        </div>

        <div class="toast__content">
            <p class="toast__title">${title}</p>
            <p class="toast__text">${message}</p>
        </div>

        <button class="toast__close" type="button" aria-label="Закрыть уведомление" data-toast-close>
            ×
        </button>
    `;

    container.append(toast);

    requestAnimationFrame(() => {
        toast.classList.add('is-visible');
    });

    const closeButton = toast.querySelector('[data-toast-close]');

    closeButton?.addEventListener('click', () => {
        removeToast(toast);
    });

    if (duration > 0) {
        window.setTimeout(() => {
            removeToast(toast);
        }, duration);
    }
};

document.addEventListener('click', (event) => {
    const closeButton = event.target.closest('[data-toast-close]');

    if (!closeButton) return;

    const toast = closeButton.closest('[data-toast]');

    removeToast(toast);
});

document.querySelectorAll('[data-toast]').forEach((toast) => {
    requestAnimationFrame(() => {
        toast.classList.add('is-visible');
    });

    window.setTimeout(() => {
        removeToast(toast);
    }, 4000);
});

window.showToast = showToast;

const categoriesState = {
    items: [],
    search: '',
    sortBy: 'created_at',
    order: 'asc',
    isLoading: false,
};

const debounce = (callback, delay = 300) => {
    let timer = null;

    return (...args) => {
        window.clearTimeout(timer);

        timer = window.setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

const escapeHtml = (value = '') => {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
};

const renderIcon = (id, size = 'sm', className = '') => {
    return `
        <svg class="icon icon--${escapeHtml(size)} ${escapeHtml(className)}">
            <use href="#icon-${escapeHtml(id)}"></use>
        </svg>
    `;
};

const renderButtonInner = ({
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

const getCategoriesUrl = () => {
    const section = document.querySelector('[data-categories-section]');

    return section?.dataset.categoriesUrl || '/api/categories';
};

const getCategoryAccent = (category) => {
    if (!category.color) {
        return '<div class="card__accent"></div>';
    }

    return `<div class="card__accent" style="background: ${escapeHtml(category.color)}"></div>`;
};

const pluralizeSets = (count) => {
    const number = Math.abs(Number(count));

    if (number % 10 === 1 && number % 100 !== 11) {
        return `${number} набор`;
    }

    if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
        return `${number} набора`;
    }

    return `${number} наборов`;
};

const renderCategoryCard = (category) => {
    const id = Number(category.id);
    const title = escapeHtml(category.title);
    const description = escapeHtml(category.description || '');
    const date = escapeHtml(category.date || '');
    const setsCount = Number(category.sets_count || 0);
    const progress = Number(category.progress || 0);
    const fading = Number(category.fading || 0);

    return `
        <article class="card shadow" data-entity-id="category-${id}" data-category-id="${id}">
            ${getCategoryAccent(category)}

            <div class="card__main">
                <div class="card__text">
                    <div class="card__heading">
                        <h3 class="card__title heading heading--4">
                            ${title} <span class="card__category"></span>
                        </h3>
                    </div>

                    ${description
            ? `<p class="card__description">${description}</p>`
            : ''
        }
                </div>

                <div class="card__actions">
                    <button
                        class="card__more button button--primary-soft button--lg button--radius-12 button--icon"
                        type="button"
                        aria-pressed="false"
                        data-category-select="${id}"
                    >
                        ${renderButtonInner({
            icon: 'expand',
            iconSize: 'sm',
        })}
                    </button>

                    <div class="card__menu" data-card-menu>
                        <button
                            class="card__more button button--icon-muted button--lg button--radius-12 button--icon"
                            type="button"
                            data-card-menu-toggle
                            aria-expanded="false"
                            aria-haspopup="true"
                        >
                            ${renderButtonInner({
            icon: 'more',
            iconSize: 'sm',
        })}
                        </button>

                        <div class="card-menu shadow--1" data-card-menu-dropdown hidden>
                            <button
                                class="card__btn button button--ghost button--lg button--radius-12 button--align-left"
                                type="button"
                                data-edit-category="${id}"
                            >
                                ${renderButtonInner({
            icon: 'edit',
            iconSize: 'sm',
            text: 'Редактировать',
        })}
                            </button>

                            <button
                                class="card__btn button button--danger-ghost button--lg button--radius-12 button--align-left"
                                type="button"
                                data-delete-category="${id}"
                            >
                                ${renderButtonInner({
            icon: 'trash',
            iconSize: 'sm',
            text: 'Удалить',
        })}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card__stats">
                    <div class="card__line">
                        <span
                            class="card__line-segment card__line-segment--learned"
                            style="width: ${progress}%;"
                        ></span>

                        ${fading > 0
            ? `<span class="card__line-segment card__line-segment--fading" style="width: ${fading}%;"></span>`
            : ''
        }
                    </div>

                    <div class="card__percent">
                        ${progress}%

                        ${fading > 0
            ? `<span class="card__delta">(-${fading}%)</span>`
            : ''
        }
                    </div>
                </div>

                <div class="card__meta card__meta--stack">
                    ${date ? `<span>${date}</span>` : ''}

                    ${date && setsCount ? '<span>•</span>' : ''}

                    ${setsCount ? `<span>${pluralizeSets(setsCount)}</span>` : ''}
                </div>
            </div>
        </article>
    `;
};

const renderCategories = () => {
    const lists = document.querySelectorAll('[data-categories-list]');

    lists.forEach((list) => {
        if (categoriesState.isLoading) {
            list.innerHTML = `
                <p class="categories-section__empty">
                    Загрузка категорий...
                </p>
            `;
            return;
        }

        if (!categoriesState.items.length) {
            list.innerHTML = `
                <p class="categories-section__empty">
                    Категории не найдены
                </p>
            `;
            return;
        }

        list.innerHTML = categoriesState.items.map(renderCategoryCard).join('');
    });
};

const syncCategoryControls = () => {
    document.querySelectorAll('[data-categories-search]').forEach((input) => {
        if (input.value !== categoriesState.search) {
            input.value = categoriesState.search;
        }
    });

    document.querySelectorAll('[data-categories-sort]').forEach((sort) => {
        sort.dataset.sortBy = categoriesState.sortBy;
        sort.dataset.order = categoriesState.order;
    });
};

const loadCategories = async () => {
    categoriesState.isLoading = true;
    renderCategories();

    const url = new URL(getCategoriesUrl(), window.location.origin);

    url.searchParams.set('search', categoriesState.search);
    url.searchParams.set('sort_by', categoriesState.sortBy);
    url.searchParams.set('order', categoriesState.order);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Categories loading failed');
    }

    const data = await response.json();

    categoriesState.items = data.categories || [];
    categoriesState.isLoading = false;

    syncCategoryControls();
    renderCategories();
};

const reloadCategories = () => {
    loadCategories().catch((error) => {
        console.error(error);

        categoriesState.isLoading = false;
        renderCategories();

        window.showToast?.({
            type: 'error',
            title: 'Не удалось загрузить категории',
            message: 'Попробуйте обновить страницу.',
        });
    });
};

const debouncedSearch = debounce((value) => {
    categoriesState.search = value;
    reloadCategories();
}, 300);

document.addEventListener('input', (event) => {
    const input = event.target.closest('[data-categories-search]');

    if (!input) return;

    const value = input.value;

    categoriesState.search = value;

    document.querySelectorAll('[data-categories-search]').forEach((otherInput) => {
        if (otherInput !== input) {
            otherInput.value = value;
        }
    });

    debouncedSearch(value);
});

document.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-category]');

    if (editButton) {
        const categoryId = editButton.dataset.editCategory;

        // потом тут открыть сайдбар редактирования категории
        console.log('Редактировать категорию', categoryId);

        return;
    }

    const deleteButton = event.target.closest('[data-delete-category]');

    if (deleteButton) {
        const categoryId = deleteButton.dataset.deleteCategory;

        // потом тут открыть подтверждение удаления категории
        console.log('Удалить категорию', categoryId);
    }
});

document.addEventListener('category:saved', () => {
    reloadCategories();
});

document.addEventListener('category:updated', () => {
    reloadCategories();
});

document.addEventListener('category:deleted', () => {
    reloadCategories();
});

const initCategories = () => {
    if (document.querySelector('[data-categories-section]')) {
        reloadCategories();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCategories);
} else {
    initCategories();
}
