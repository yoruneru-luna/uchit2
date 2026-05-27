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


// обновление градиентов у табов

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

    window.addEventListener('resize', () => {
        updateSuggestionsScrollFade(row);
    });
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

            const isEdit = form.hasAttribute('data-category-edit-form');

            showToast({
                type: 'success',
                title: isEdit ? 'Категория обновлена' : 'Категория создана',
                message: isEdit
                    ? `Категория «${data.category.title}» обновлена.`
                    : `Категория «${data.category.title}» добавлена.`,
            });

            form.dispatchEvent(
                new CustomEvent(isEdit ? 'category:updated' : 'category:saved', {
                    bubbles: true,
                    detail: data.category,
                })
            );

            if (!isEdit) {
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
            }

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
    return '<div class="card__accent"></div>';
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

    const isSelectedCategory = Number(setsState.selectedCategory?.id) === id;
    const color = category.color || '';

    const accentStyle = color
        ? `style="--card-accent: ${escapeHtml(color)};"`
        : '';

    const accentClass = color ? 'has-accent' : '';

    return `
    <article
        class="card card--category ${accentClass} shadow"
        data-entity-id="category-${id}"
        data-category-id="${id}"
        ${accentStyle}
    >
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
    class="card__more card__open-category button button--category-accent button--lg button--radius-12 button--icon ${isSelectedCategory ? 'is-selected' : ''}"
    type="button"
    aria-pressed="${isSelectedCategory ? 'true' : 'false'}"
    data-category-select="${id}"
>
    ${renderButtonInner({
            icon: isSelectedCategory ? 'check' : 'expand',
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
                <div class="card__meta-line">
  ${date ? `<span>${date}</span>` : ''}
  ${date && (setsCount || setsCount === 0) ? '<span>•</span>' : ''}
  <span>${pluralizeSets(setsCount || 0)}</span>
</div>
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
            const hasSearch = Boolean(categoriesState.search?.trim());

            list.innerHTML = renderEmptyState({
                type: 'categories',
                title: hasSearch ? 'Ничего не найдено' : 'У Вас пока нет категорий',
                text: hasSearch
                    ? 'Попробуйте изменить запрос или создайте новую категорию'
                    : 'Создайте первую категорию, чтобы легче находить нужное',
                primaryText: 'Создать категорию',
                secondaryText: 'Найти другое',
                primaryAction: 'data-sidebar-sheet-open="create-category-sheet"',
                secondaryAction: 'data-global-search-open="data-global-search-open"',
                image: '/images/categories-empty.svg',
            })

            return;
        }

        list.innerHTML = categoriesState.items.map(renderCategoryCard).join('');
    });
};


const syncCategorySortMenus = () => {
    document.querySelectorAll('[data-categories-sort]').forEach((sortRoot) => {
        sortRoot.dataset.sortBy = categoriesState.sortBy;
        sortRoot.dataset.sortOrder = categoriesState.order;

        sortRoot
            .querySelectorAll('[data-sort-group="by"]')
            .forEach((option) => {
                option.classList.toggle(
                    'is-active',
                    option.dataset.value === categoriesState.sortBy
                );
            });

        sortRoot
            .querySelectorAll('[data-sort-group="order"]')
            .forEach((option) => {
                option.classList.toggle(
                    'is-active',
                    option.dataset.value === categoriesState.order
                );
            });
    });
};

const syncCategoryControls = () => {
    document.querySelectorAll('[data-categories-search]').forEach((input) => {
        if (input.value !== categoriesState.search) {
            input.value = categoriesState.search;
        }
    });

    syncCategorySortMenus();
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

const fillEditCategoryForm = (category) => {
    const form = document.querySelector('[data-category-edit-form]');

    if (!form || !category) return;

    const updateUrlTemplate = form.dataset.categoryUpdateUrlTemplate;

    form.action = updateUrlTemplate.replace('__ID__', category.id);
    form.dataset.categoryId = category.id;

    const titleInput = form.querySelector('[name="title"]');
    const descriptionInput = form.querySelector('[name="description"]');
    const hasColorInput = form.querySelector('[name="has_color"]');
    const colorInput = form.querySelector('[name="color"]');
    const colorValue = form.querySelector('[data-color-value]');

    if (titleInput) {
        titleInput.value = category.title || '';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (descriptionInput) {
        descriptionInput.value = category.description || '';
        descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (hasColorInput && colorInput && colorValue) {
        const hasColor = Boolean(category.color);

        hasColorInput.checked = hasColor;
        colorInput.disabled = !hasColor;
        colorInput.value = category.color || '#f3cedd';
        colorValue.textContent = hasColor ? colorInput.value : 'Без цвета';
    }

    form.querySelectorAll('.is-error').forEach((item) => {
        item.classList.remove('is-error');
    });

    form.querySelectorAll('[data-js-field-error]').forEach((item) => {
        item.remove();
    });
};

const getCategoryDeleteUrl = (categoryId) => {
    const section = document.querySelector('[data-categories-section]');
    const template = section?.dataset.categoryDeleteUrlTemplate;

    if (!template) {
        return `/categories/${categoryId}`;
    }

    return template.replace('__ID__', categoryId);
};

const deleteCategory = async (category) => {
    if (!category) return;

    const confirmed = await window.openConfirmDialog({
        title: 'Удалить категорию?',
        text: `Категория «${category.title}» будет удалена. Наборы останутся без категории.`,
        cancelText: 'Отмена',
        submitText: 'Удалить',
        submitTone: 'danger',
    });

    if (!confirmed) return;

    const response = await fetch(getCategoryDeleteUrl(category.id), {
        method: 'DELETE',
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
            title: 'Не удалось удалить',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return;
    }

    categoriesState.items = categoriesState.items.filter((item) => {
        return Number(item.id) !== Number(category.id);
    });

    const isDeletedCategorySelected =
        Number(setsState.selectedCategory?.id) === Number(category.id);

    if (isDeletedCategorySelected) {
        setsState.selectedCategory = null;
        setsState.search = '';
    }

    syncSetControls();
    renderCategories();
    reloadSets();

    window.showToast?.({
        type: 'success',
        title: 'Категория удалена',
        message: `Категория «${category.title}» удалена.`,
    });

    document.dispatchEvent(
        new CustomEvent('category:deleted', {
            bubbles: true,
            detail: {
                id: category.id,
            },
        })
    );
};

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

document.addEventListener('home:sort-change', (event) => {
    const sortRoot = event.target.closest('[data-categories-sort]');

    if (!sortRoot) return;

    categoriesState.sortBy = event.detail.sortBy;
    categoriesState.order = event.detail.order;

    syncCategorySortMenus();

    reloadCategories();
});

document.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-category]');

    if (editButton) {
        const categoryId = Number(editButton.dataset.editCategory);

        const category = categoriesState.items.find((item) => {
            return Number(item.id) === categoryId;
        });

        fillEditCategoryForm(category);

        const sheet = document.querySelector('[data-sidebar-sheet-id="edit-category-sheet"]');

        window.openSidebarSheet?.(sheet);

        return;
    }

    const deleteButton = event.target.closest('[data-delete-category]');

    if (deleteButton) {
        const categoryId = Number(deleteButton.dataset.deleteCategory);

        const category = categoriesState.items.find((item) => {
            return Number(item.id) === categoryId;
        });

        deleteCategory(category);

        return;
    }
});

document.addEventListener('category:saved', () => {
    reloadCategories();
});

document.addEventListener('category:updated', (event) => {
    const updatedCategory = event.detail;

    if (!updatedCategory) return;

    if (
        setsState.selectedCategory &&
        Number(setsState.selectedCategory.id) === Number(updatedCategory.id)
    ) {
        setsState.selectedCategory = {
            ...setsState.selectedCategory,
            ...updatedCategory,
        };
    }

    setsState.items = setsState.items.map((set) => {
        if (Number(set.category_id) !== Number(updatedCategory.id)) {
            return set;
        }

        return {
            ...set,
            category: {
                ...(set.category || {}),
                id: updatedCategory.id,
                title: updatedCategory.title,
                color: updatedCategory.color,
            },
        };
    });

    renderSets();
    reloadCategories();
});

// document.addEventListener('category:deleted', () => {
//     reloadCategories();
// });

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

// вывод категорий в форме набора

const renderSetCategoryOption = (category) => {
    const color = category.color || '';

    return `
        <button
            class="category-select__option"
            type="button"
            role="option"
            aria-selected="false"
            data-custom-select-option
            data-value="${category.id}"
            data-label="${escapeHtml(category.title)}"
            data-tone="custom"
            data-color="${escapeHtml(color)}"
        >
            <span class="category-select__option-main">
                <span
                    class="category-select__marker category-select__marker--custom"
                    ${color ? `style="background: ${escapeHtml(color)}"` : ''}
                ></span>

                <span class="category-select__option-label">
                    ${escapeHtml(category.title)}
                </span>
            </span>

            ${renderIcon('check', 'xxs', 'category-select__check')}
        </button>
    `;
};

const fillSetCategorySelect = (form, categories) => {
    const input = form.querySelector('[name="category_id"]');
    const select = input?.closest('[data-custom-select]');
    const dropdown = select?.querySelector('[data-custom-select-dropdown]');

    if (!input || !select || !dropdown) return;

    const selectedValue = input.value || '';

    dropdown.innerHTML = `
        <button
            class="category-select__option ${selectedValue === '' ? 'is-selected' : ''}"
            type="button"
            role="option"
            aria-selected="${selectedValue === '' ? 'true' : 'false'}"
            data-custom-select-option
            data-value=""
            data-label="Без категории"
            data-tone="default"
            data-color=""
        >
            <span class="category-select__option-main">
                <span class="category-select__marker category-select__marker--default"></span>

                <span class="category-select__option-label">
                    Без категории
                </span>
            </span>

            ${renderIcon('check', 'xxs', 'category-select__check')}
        </button>

        ${categories.map(renderSetCategoryOption).join('')}
    `;

    dropdown.querySelectorAll('[data-custom-select-option]').forEach((option) => {
        const isSelected = String(option.dataset.value) === String(selectedValue);

        option.classList.toggle('is-selected', isSelected);
        option.setAttribute('aria-selected', String(isSelected));
    });
};

const loadSetCreateData = async (form) => {
    const url = form.dataset.setCreateDataUrl;

    if (!url) return;

    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) return;

    const data = await response.json();

    fillSetCategorySelect(form, data.categories || []);
};

document.querySelectorAll('[data-set-form]').forEach((form) => {
    loadSetCreateData(form);
});


// создание набора

const resetCreateSetFlow = (flow) => {
    if (!flow) return;

    delete flow.dataset.createdSetId;

    const form = flow.querySelector('[data-set-form]');

    if (form) {
        form.reset();
        clearSetFormErrors?.(form);
        setFormLoading?.(form, false);
    }

    setActiveCreateSetScreen(flow, 'create-set');
};

const clearSetFormErrors = (form) => {
    form.querySelectorAll('.is-error').forEach((element) => {
        element.classList.remove('is-error');
    });

    form.querySelectorAll('[data-js-field-error]').forEach((element) => {
        element.remove();
    });
};

const getSetFieldWrapper = (field) => {
    return field.closest('.input, .textarea-field, .custom-select, .category-select');
};

const showSetFieldError = (field, message) => {
    const wrapper = getSetFieldWrapper(field);

    if (!wrapper) return;

    wrapper.classList.add('is-error');

    const error = document.createElement('p');

    error.className = 'set-form__message';
    error.dataset.jsFieldError = 'true';
    error.textContent = message;

    wrapper.insertAdjacentElement('afterend', error);
};

const setActiveCreateSetScreen = (flow, screenName) => {
    if (!flow) return;

    flow.querySelectorAll('[data-create-set-screen]').forEach((screen) => {
        screen.classList.toggle(
            'is-active',
            screen.dataset.createSetScreen === screenName
        );
    });
};

const sendSetForm = async (form) => {
    const formData = new FormData(form);
    const isEdit = form.hasAttribute('data-set-edit-form');

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
                    showSetFieldError(field, messages[0]);
                }
            });

            window.showToast?.({
                type: 'error',
                title: isEdit ? 'Не удалось обновить набор' : 'Не удалось создать набор',
                message: 'Проверьте поля и попробуйте ещё раз.',
            });
        } else {
            window.showToast?.({
                type: 'error',
                title: isEdit ? 'Не удалось обновить набор' : 'Не удалось создать набор',
                message: data.message || 'Попробуйте ещё раз.',
            });
        }

        return null;
    }

    return data;
};

const checkSetTitle = async (form, title) => {
    const checkUrl = form.dataset.setTitleCheckUrl;

    if (!checkUrl) return true;

    const url = new URL(checkUrl, window.location.origin);

    url.searchParams.set('title', title);

    if (form.dataset.setId) {
        url.searchParams.set('ignore_id', form.dataset.setId);
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

document.querySelectorAll('[data-set-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        clearSetFormErrors(form);

        const titleField = form.querySelector('[name="title"]');
        const title = titleField?.value.trim() || '';

        if (!titleField) return;

        if (!title) {
            showSetFieldError(titleField, 'Введите название набора.');
            return;
        }

        if (title.length > 120) {
            showSetFieldError(titleField, 'Название набора не должно быть длиннее 120 символов.');
            return;
        }

        setFormLoading(form, true);

        try {
            const isTitleAvailable = await checkSetTitle(form, title);

            if (!isTitleAvailable) {
                showSetFieldError(titleField, 'Набор с таким названием уже существует.');
                return;
            }

            const data = await sendSetForm(form);

            if (!data) return;

            const isEdit = form.hasAttribute('data-set-edit-form');

            window.showToast?.({
                type: 'success',
                title: isEdit ? 'Набор обновлён' : 'Набор создан',
                message: isEdit
                    ? `Набор «${data.set.title}» обновлён.`
                    : `Набор «${data.set.title}» создан.`,
            });

            form.dispatchEvent(
                new CustomEvent(isEdit ? 'set:updated' : 'set:saved', {
                    bubbles: true,
                    detail: data.set,
                })
            );

            if (isEdit) {
                const sheet = form.closest('[data-sidebar-sheet]');

                window.closeSidebarSheet?.(sheet);

                return;
            }

            const createdSet = data.set;

            await reloadSets?.();

            const freshSet = setsState.items.find((item) => {
                return Number(item.id) === Number(createdSet.id);
            }) || createdSet;

            const flow = form.closest('[data-create-set-flow]');

            if (flow) {
                flow.dataset.createdSetId = freshSet.id;
                setActiveCreateSetScreen(flow, 'set-created');
            }

            // const sheet = form.closest('[data-sidebar-sheet]');

            // window.closeSidebarSheet?.(sheet);

            form.reset();

            // openCardFormForSet(freshSet);
        } catch (error) {
            console.error(error);

            window.showToast?.({
                type: 'error',
                title: 'Не удалось сохранить набор',
                message: 'Проверьте подключение и попробуйте ещё раз.',
            });
        } finally {
            setFormLoading(form, false);
        }
    });
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-created-set-add-cards]');

    if (!button) return;

    event.preventDefault();

    const flow = button.closest('[data-create-set-flow]');
    const setId = Number(flow?.dataset.createdSetId);

    if (!setId) return;

    const set = setsState.items.find((item) => {
        return Number(item.id) === setId;
    });

    if (!set) return;

    const sheet = button.closest('[data-sidebar-sheet]');

    window.closeSidebarSheet?.(sheet);
    resetCreateSetFlow(flow);

    openCardFormForSet(set, {
        afterSet: true,
    });
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-created-set-open]');

    if (!button) return;

    event.preventDefault();

    const flow = button.closest('[data-create-set-flow]');
    const setId = Number(flow?.dataset.createdSetId);

    if (!setId) return;

    const set = setsState.items.find((item) => {
        return Number(item.id) === setId;
    });

    if (!set) return;

    const createSetSheet = button.closest('[data-sidebar-sheet]');
    const setDetailsSheet = document.querySelector('[data-sidebar-sheet-id="set-details-sheet"]');

    if (!setDetailsSheet) return;

    window.closeSidebarSheet?.(createSetSheet);

    renderSetDetails(set);
    loadSetCards(set.id);

    window.openSidebarSheet?.(setDetailsSheet);
});

const CARD_REQUIRED_COUNT = 5;

const getCardProgressText = (count, required = CARD_REQUIRED_COUNT) => {
    const left = Math.max(0, required - count);

    if (left === 0) {
        return 'Минимум выполнен. Можно продолжить добавлять карточки или перейти к повторению позже.';
    }

    if (left === 1) {
        return 'Добавьте ещё 1 карточку, чтобы набор был готов к повторению.';
    }

    return `Добавьте ещё ${left} карточки, чтобы набор был готов к повторению.`;
};

const updateCardCreationProgress = (form, cardsCount = 0) => {
    const progress = form.querySelector('[data-card-progress]');
    const countElement = form.querySelector('[data-card-progress-count]');
    const fill = form.querySelector('[data-card-progress-fill]');
    const text = form.querySelector('[data-card-progress-text]');

    if (!progress) return;

    const count = Math.max(0, Number(cardsCount || 0));
    const safeCount = Math.min(count, CARD_REQUIRED_COUNT);
    const percent = Math.min(100, (count / CARD_REQUIRED_COUNT) * 100);

    progress.hidden = false;

    if (countElement) {
        countElement.textContent = `${safeCount} из ${CARD_REQUIRED_COUNT}`;
    }

    if (fill) {
        fill.style.width = `${percent}%`;
    }

    if (text) {
        text.textContent = getCardProgressText(count);
    }

    progress.classList.toggle('is-complete', count >= CARD_REQUIRED_COUNT);
};

const hideCardCreationProgress = (form) => {
    const progress = form.querySelector('[data-card-progress]');

    if (progress) {
        progress.hidden = true;
    }
};

// экран усспеха после создания набора

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-create-set-next]');

    if (!button) return;

    const flow = button.closest('[data-create-set-flow]');
    const screenName = button.dataset.createSetNext;

    setActiveCreateSetScreen(flow, screenName);
});


const loadSetCards = async (setId) => {
    const root = document.querySelector('[data-set-details]');
    const list = root?.querySelector('[data-set-cards-list]');

    if (!root || !list || !setId) return;

    const url = root.dataset.cardsUrl || `/sets/${setId}/cards`;

    list.innerHTML = `
        <p class="set-details__empty">
            Загружаем карточки...
        </p>
    `;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            list.innerHTML = `
                <p class="set-details__empty">
                    Не удалось загрузить карточки.
                </p>
            `;

            return;
        }

        renderSetCards(list, data.cards || []);
    } catch (error) {
        console.error(error);

        list.innerHTML = `
            <p class="set-details__empty">
                Проверьте подключение и попробуйте ещё раз.
            </p>
        `;
    }
};

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-create-set-open]');

    if (!button) return;

    const sheet = document.querySelector('[data-sidebar-sheet-id="create-set-sheet"]');
    const flow = sheet?.querySelector('[data-create-set-flow]');

    resetCreateSetFlow(flow);
});

// вывод наборов

const setsState = {
    items: [],
    search: '',
    sortBy: 'created_at',
    order: 'desc',
    selectedCategory: null,
    isLoading: false,
};

const getSetsUrl = () => {
    const section = document.querySelector('[data-sets-section]');

    return section?.dataset.setsUrl || '/api/sets';
};

const pluralizeCards = (count) => {
    const number = Math.abs(Number(count));

    if (number % 10 === 1 && number % 100 !== 11) {
        return `${number} карточка`;
    }

    if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
        return `${number} карточки`;
    }

    return `${number} карточек`;
};

const getSetAccent = () => {
    return '<div class="card__accent"></div>';
};

const renderSetCard = (set) => {
    const id = Number(set.id);
    const title = escapeHtml(set.title);
    const description = escapeHtml(set.description || '');
    const visibilityLabel = set.visibility === 'public' ? 'Публичный' : 'Личный';
    const languageLabel = set.language === 'en' ? 'EN' : '';
    const categoryTitle = escapeHtml(set.category?.title || '');
    const date = escapeHtml(set.date || '');
    const cardsCount = Number(set.cards_count || 0);
    const progress = Number(set.progress || 0);
    const fading = Number(set.fading || 0);

    const color = set.category?.color || '';

    const accentStyle = color
        ? `style="--card-accent: ${escapeHtml(color)};"`
        : '';

    const accentClass = color ? 'has-accent' : '';

    return `
    <article
        class="card card--set ${accentClass} shadow"
        data-entity-id="set-${id}"
        data-set-id="${id}"
        ${accentStyle}
    >
        ${getSetAccent(set)}

            <div class="card__main">
                <div class="card__text">
                    <div class="card__heading">
                        <h3 class="card__title heading heading--4">
                            ${title}
                            ${categoryTitle ? `<span class="card__category">${categoryTitle}</span>` : ''}
                        </h3>
                    </div>

                    ${description
            ? `<p class="card__description">${description}</p>`
            : ''
        }
                </div>

                <div class="card__actions">
                    <button
                    class="card__more button ${color ? 'button--category-accent' : 'button--primary-soft'} button--lg button--radius-12 button--icon"
                    type="button"
                        data-open-set="${id}"
                        aria-label="Открыть набор"
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
                                data-edit-set="${id}"
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
                                data-delete-set="${id}"
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

                <div class="card__meta">
    <div class="card__badges">
    ${set.has_source_updates
            ? `<span class="card__badge card__badge--warning">Автор внёс изменения</span>`
            : ''
        }

        <span class="card__badge">
            ${visibilityLabel}
        </span>

        ${languageLabel
            ? `<span class="card__badge card__badge--language">${languageLabel}</span>`
            : ''
        }
    </div>

    <div class="card__meta-line">
        ${date ? `<span>${date}</span>` : ''}
        ${date ? '<span>•</span>' : ''}
        <span>${pluralizeCards(cardsCount || 0)}</span>
    </div>
</div>
        </article>
    `;
};

const renderSetsCategoryView = () => {
    const views = document.querySelectorAll('[data-sets-category-view]');

    views.forEach((view) => {
        const category = setsState.selectedCategory;

        if (!category) {
            view.hidden = true;
            view.innerHTML = '';
            return;
        }

        const setsCount = Number(category.sets_count || 0);

        view.hidden = false;
        view.innerHTML = `
            <button
    class="sets-category-view__back button button--muted button--noneSize button--radius-12 button--align-left text text--small"
    type="button"
    data-sets-category-back
>
    ${renderButtonInner({
            icon: 'chevron',
            iconSize: 'xs',
            text: 'Назад',
        })}
</button>

            <div class="sets-category-view__content">
                <h3 class="sets-category-view__title heading heading--3">
                    ${escapeHtml(category.title)}
                </h3>

                ${category.description
                ? `<p class="sets-category-view__description">${escapeHtml(category.description)}</p>`
                : ''
            }

                <p class="sets-category-view__meta text text--small">
                    ${pluralizeSets(setsCount)}
                </p>
            </div>
        `;
    });
};

const renderSets = () => {
    renderSetsCategoryView();

    const lists = document.querySelectorAll('[data-sets-list]');

    lists.forEach((list) => {
        if (setsState.isLoading) {
            list.innerHTML = `
                <p class="sets-section__empty">
                    Загрузка наборов...
                </p>
            `;
            return;
        }

        if (!setsState.items.length) {
            const hasSearch = Boolean(setsState.search?.trim());

            list.innerHTML = renderEmptyState({
                type: 'sets',
                title: hasSearch ? 'Ничего не найдено' : 'У Вас пока нет наборов',
                text: hasSearch
                    ? 'Попробуйте изменить запрос или создайте новый набор'
                    : 'Создайте первый набор, чтобы начать учить карточки',
                primaryText: 'Создать набор',
                secondaryText: 'Найти набор',
                primaryAction: 'data-sidebar-sheet-open="create-set-sheet"',
                secondaryAction: 'data-global-search-open="data-global-search-open"',
                image: '/images/sets-empty.svg',
            });

            return;
        }

        list.innerHTML = setsState.items.map(renderSetCard).join('');
    });
};

const syncSetSortMenus = () => {
    document.querySelectorAll('[data-sets-sort]').forEach((sortRoot) => {
        sortRoot.dataset.sortBy = setsState.sortBy;
        sortRoot.dataset.sortOrder = setsState.order;

        sortRoot
            .querySelectorAll('[data-sort-group="by"]')
            .forEach((option) => {
                option.classList.toggle(
                    'is-active',
                    option.dataset.value === setsState.sortBy
                );
            });

        sortRoot
            .querySelectorAll('[data-sort-group="order"]')
            .forEach((option) => {
                option.classList.toggle(
                    'is-active',
                    option.dataset.value === setsState.order
                );
            });
    });
};

const syncSetControls = () => {
    document.querySelectorAll('[data-sets-search]').forEach((input) => {
        if (input.value !== setsState.search) {
            input.value = setsState.search;
        }
    });

    syncSetSortMenus();
};

const loadSets = async () => {
    setsState.isLoading = true;
    renderSets();

    const url = new URL(getSetsUrl(), window.location.origin);

    url.searchParams.set('search', setsState.search);
    url.searchParams.set('sort_by', setsState.sortBy);
    url.searchParams.set('order', setsState.order);

    if (setsState.selectedCategory?.id) {
        url.searchParams.set('category_id', setsState.selectedCategory.id);
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Sets loading failed');
    }

    const data = await response.json();

    setsState.items = data.sets || [];
    setsState.isLoading = false;

    syncSetControls();
    renderSets();
};

const reloadSets = () => {
    loadSets().catch((error) => {
        console.error(error);

        setsState.isLoading = false;
        renderSets();

        window.showToast?.({
            type: 'error',
            title: 'Не удалось загрузить наборы',
            message: 'Попробуйте обновить страницу.',
        });
    });
};

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category-select]');

    if (!button) return;

    event.preventDefault();

    const categoryId = Number(button.dataset.categorySelect);

    const isSameCategory =
        Number(setsState.selectedCategory?.id) === categoryId;

    if (isSameCategory) {
        setsState.selectedCategory = null;
        setsState.search = '';

        syncSetControls();
        renderCategories();
        reloadSets();

        const sheet =
            button.closest('[data-sidebar-sheet]') ||
            document.querySelector('[data-sidebar-sheet-id="categories-sheet"]');

        if (sheet) {
            window.closeSidebarSheet?.(sheet);
        }

        return;
    }

    const category = categoriesState.items.find((item) => {
        return Number(item.id) === categoryId;
    });

    if (!category) return;

    setsState.selectedCategory = category;
    setsState.search = '';

    syncSetControls();
    renderCategories();
    reloadSets();

    const sheet =
        button.closest('[data-sidebar-sheet]') ||
        document.querySelector('[data-sidebar-sheet-id="categories-sheet"]');

    if (sheet) {
        window.closeSidebarSheet?.(sheet);
    }
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-sets-category-back]');

    if (!button) return;

    event.preventDefault();

    setsState.selectedCategory = null;
    setsState.search = '';

    syncSetControls();
    renderCategories();
    reloadSets();
});

const getSetDeleteUrl = (setId) => {
    const section = document.querySelector('[data-sets-section]');
    const template = section?.dataset.setDeleteUrlTemplate;

    if (!template) {
        return `/sets/${setId}`;
    }

    return template.replace('__ID__', setId);
};

const fillEditSetForm = async (set) => {
    const form = document.querySelector('[data-set-edit-form]');

    if (!form || !set) return;

    if (form.dataset.setCreateDataUrl) {
        await loadSetCreateData(form);
    }

    const updateUrlTemplate = form.dataset.setUpdateUrlTemplate;

    form.action = updateUrlTemplate.replace('__ID__', set.id);
    form.dataset.setId = set.id;

    const titleInput = form.querySelector('[name="title"]');
    const descriptionInput = form.querySelector('[name="description"]');
    const categoryInput = form.querySelector('[name="category_id"]');
    const languageInput = form.querySelector('[name="language"]');
    const visibilityInput = form.querySelector('[name="visibility"]');

    if (titleInput) {
        titleInput.value = set.title || '';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (descriptionInput) {
        descriptionInput.value = set.description || '';
        descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (categoryInput) {
        const categorySelect = categoryInput.closest('[data-custom-select]');
        const value = set.category_id ? String(set.category_id) : '';

        if (categorySelect) {
            const option = categorySelect.querySelector(
                `[data-custom-select-option][data-value="${value}"]`
            );

            if (option) {
                selectCustomOption(categorySelect, option);
            }
        } else {
            categoryInput.value = value;
        }
    }

    if (languageInput) {
        const languageSelect = languageInput.closest('[data-custom-select]');
        const value = set.language || '';

        if (languageSelect) {
            const option = languageSelect.querySelector(
                `[data-custom-select-option][data-value="${value}"]`
            );

            if (option) {
                selectCustomOption(languageSelect, option);
            }
        } else {
            languageInput.value = value;
        }
    }

    if (visibilityInput) {
        const visibilitySelect = visibilityInput.closest('[data-custom-select]');
        const value = set.visibility || 'private';

        if (visibilitySelect) {
            const option = visibilitySelect.querySelector(
                `[data-custom-select-option][data-value="${value}"]`
            );

            if (option) {
                selectCustomOption(visibilitySelect, option);
            }
        } else {
            visibilityInput.value = value;
        }
    }

    form.querySelectorAll('.is-error').forEach((item) => {
        item.classList.remove('is-error');
    });

    form.querySelectorAll('[data-js-field-error]').forEach((item) => {
        item.remove();
    });
};

const deleteSet = async (set) => {
    if (!set) return;

    const confirmed = await window.openConfirmDialog({
        title: 'Удалить набор?',
        text: `Набор «${set.title}» будет удалён вместе с карточками.`,
        cancelText: 'Отмена',
        submitText: 'Удалить',
        submitTone: 'danger',
    });

    if (!confirmed) return;

    try {
        const response = await fetch(getSetDeleteUrl(set.id), {
            method: 'DELETE',
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
                title: 'Не удалось удалить',
                message: data.message || 'Попробуйте ещё раз.',
            });

            return;
        }

        setsState.items = setsState.items.filter((item) => {
            return Number(item.id) !== Number(set.id);
        });

        renderSets();

        window.showToast?.({
            type: 'success',
            title: 'Набор удалён',
            message: `Набор «${set.title}» удалён.`,
        });
    } catch (error) {
        console.error(error);

        window.showToast?.({
            type: 'error',
            title: 'Не удалось удалить',
            message: 'Проверьте подключение и попробуйте ещё раз.',
        });
    }
};

// поиск наборов

const debouncedSetsSearch = debounce((value) => {
    setsState.search = value;
    reloadSets();
}, 300);

document.addEventListener('input', (event) => {
    const input = event.target.closest('[data-sets-search]');

    if (!input) return;

    const value = input.value;

    setsState.search = value;

    document.querySelectorAll('[data-sets-search]').forEach((otherInput) => {
        if (otherInput !== input) {
            otherInput.value = value;
        }
    });

    debouncedSetsSearch(value);
});

// сортировка наборов

document.addEventListener('home:sort-change', (event) => {
    const sortRoot = event.target.closest('[data-sets-sort]');

    if (!sortRoot) return;

    setsState.sortBy = event.detail.sortBy;
    setsState.order = event.detail.order;

    syncSetSortMenus();
    reloadSets();
});

const renderSetCards = (list, cards) => {
    const root = document.querySelector('[data-set-details]');
    const isLanguageSet = root?.dataset.language === 'en';

    if (!cards.length) {
        list.innerHTML = `
            <p class="set-details__empty">
                В наборе пока нет карточек.
            </p>
        `;

        return;
    }

    list.innerHTML = cards.map((card, index) => {
        const number = index + 1;

        const image = card.image_url
            ? `
                <span class="set-card__image">
                    <img src="${escapeHtml(card.image_url)}" alt="">
                </span>
            `
            : `
                <span class="set-card__image set-card__image--empty" aria-hidden="true">
                    <svg class="icon icon--sm set-card__image-icon">
                        <use href="#icon-image"></use>
                    </svg>
                </span>
            `;

        const transcription = isLanguageSet && card.transcription
            ? `<span class="set-card__transcription">${escapeHtml(card.transcription)}</span>`
            : '';

        const marker = card.marker
            ? `<span class="set-card__marker">${escapeHtml(card.marker)}</span>`
            : '';

        const soundButton = isLanguageSet
            ? `
        <button
            class="set-card__action set-card__sound button button--muted button--sm button--radius-circle button--icon"
            type="button"
            aria-label="Прослушать карточку"
            data-speak-card="${escapeHtml(card.front)}"
        >
            ${renderButtonInner({
                icon: 'volume',
                iconSize: 'xs',
            })}
        </button>
    `
            : '';

        const hint = card.hint
            ? `
                <div class="set-card__extra">
                    <span class="set-card__extra-label">Подсказка:</span>
                    <span class="set-card__extra-text">${escapeHtml(card.hint)}</span>
                </div>
            `
            : '';

        const example = card.example
            ? `
                <div class="set-card__extra">
                    <span class="set-card__extra-label">Пример:</span>
                    <span class="set-card__extra-text">${escapeHtml(card.example)}</span>
                </div>
            `
            : '';

        return `
    <article class="set-card shadow" data-card-id="${card.id}">
        <span class="set-card__number">${number}</span>

        ${image}

        <div class="set-card__content">
            <div class="set-card__term-row">
                <div class="set-card__term-main">
                    <div class="set-card__term-line">
                        <h6 class="set-card__front heading heading--6">
                            ${escapeHtml(card.front)}
                        </h6>
                         ${soundButton}
                    </div>

                    ${transcription}
                </div>
            </div>

            <p class="set-card__back text text--small">
                ${escapeHtml(card.back)}
            </p>

            ${hint}
            ${example}
        </div>

        <div class="set-card__actions">
                ${marker}

            <button
                class="set-card__action set-card__edit button button--muted button--sm button--radius-circle button--icon"
                type="button"
                aria-label="Редактировать карточку"
                data-edit-card="${card.id}"
            >
                ${renderButtonInner({
            icon: 'edit',
            iconSize: 'xs',
        })}
            </button>

            <button
                class="set-card__action set-card__delete button button--danger-ghost button--sm button--radius-circle button--icon"
                type="button"
                aria-label="Удалить карточку"
                data-delete-card="${card.id}"
            >
                ${renderButtonInner({
            icon: 'trash',
            iconSize: 'xs',
        })}
            </button>
        </div>
    </article>
`;
    }).join('');
};

// редактирование и удаление наборов

document.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-set]');

    if (editButton) {
        const setId = Number(editButton.dataset.editSet);

        const set = setsState.items.find((item) => {
            return Number(item.id) === setId;
        });

        await fillEditSetForm(set);

        const sheet = document.querySelector('[data-sidebar-sheet-id="edit-set-sheet"]');

        window.openSidebarSheet?.(sheet);

        return;
    }

    const deleteButton = event.target.closest('[data-delete-set]');

    if (deleteButton) {
        const setId = Number(deleteButton.dataset.deleteSet);

        const set = setsState.items.find((item) => {
            return Number(item.id) === setId;
        });

        deleteSet(set);

        return;
    }
});

// обновление после изменений наборов

document.addEventListener('set:saved', () => {
    reloadSets();
});

document.addEventListener('set:updated', () => {
    reloadSets();
});

document.addEventListener('set:deleted', () => {
    reloadSets();
});

// обработка озвучки

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-speak-card]');

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const text = button.dataset.speakCard || '';

    if (!text) return;

    if (!('speechSynthesis' in window)) {
        window.showToast?.({
            type: 'error',
            title: 'Озвучка недоступна',
            message: 'Браузер не поддерживает синтез речи.',
        });

        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = 'en-GB';
    utterance.rate = 0.9;

    window.speechSynthesis.speak(utterance);
});

// удаление карточки

const deleteCard = async (cardId) => {
    const response = await fetch(`/cards/${cardId}`, {
        method: 'DELETE',
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
            title: 'Не удалось удалить карточку',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return null;
    }

    return data;
};

document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-card]');

    if (!button) return;

    event.preventDefault();

    const cardId = Number(button.dataset.deleteCard);

    if (!cardId) return;

    const confirmed = await window.openConfirmDialog?.({
        title: 'Удалить карточку?',
        text: 'Карточка будет удалена из набора. Это действие нельзя отменить.',
        cancelText: 'Отмена',
        submitText: 'Удалить',
        submitTone: 'danger',
    });

    if (!confirmed) return;

    button.disabled = true;

    try {
        const data = await deleteCard(cardId);

        if (!data) return;

        window.showToast?.({
            type: 'success',
            title: 'Карточка удалена',
            message: 'Список карточек обновлён.',
        });

        const setId = Number(data.set?.id);
        const cardsCount = Number(data.set?.cards_count || 0);

        setsState.items = setsState.items.map((set) => {
            if (Number(set.id) !== setId) return set;

            return {
                ...set,
                cards_count: cardsCount,
            };
        });

        const openedSetDetails = document.querySelector('[data-set-details]');
        const openedSetId = Number(openedSetDetails?.dataset.currentSetId);

        if (openedSetId === setId) {
            const set = setsState.items.find((item) => Number(item.id) === setId);

            if (set) {
                renderSetDetails(set);
            }

            loadSetCards(setId);
        }

        renderSets();
    } catch (error) {
        console.error(error);

        window.showToast?.({
            type: 'error',
            title: 'Не удалось удалить карточку',
            message: 'Проверьте подключение и попробуйте ещё раз.',
        });
    } finally {
        button.disabled = false;
    }
});

// открытие набора

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-set]');

    if (!button) return;

    event.preventDefault();

    const setId = Number(button.dataset.openSet);

    const set = setsState.items.find((item) => {
        return Number(item.id) === setId;
    });

    if (!set) return;

    const setDetailsSheet = document.querySelector('[data-sidebar-sheet-id="set-details-sheet"]');

    renderSetDetails(set);
    loadSetCards(set.id);
    window.openSidebarSheet?.(setDetailsSheet);

    const sheet = document.querySelector('[data-sidebar-sheet-id="set-details-sheet"]');

    window.openSidebarSheet?.(sheet);
});

const renderSetDetails = (set) => {
    const root = document.querySelector('[data-set-details]');

    if (!root || !set) return;

    const id = Number(set.id);

    root.dataset.currentSetId = id;
    root.dataset.cardsUrl = `/sets/${id}/cards`;
    root.dataset.language = set.language || '';

    const sheet = root.closest('[data-sidebar-sheet]');

    const categoryTitle = set.category?.title || 'Без категории';
    const cardsCount = Number(set.cards_count || 0);
    const progress = Number(set.progress || 0);
    const fading = Number(set.fading || 0);
    const color = set.category?.color || '';

    if (sheet) {
        if (color) {
            sheet.style.setProperty('--set-accent', color);
        } else {
            sheet.style.removeProperty('--set-accent');
        }
    }

    if (color) {
        root.style.setProperty('--set-accent', color);
    } else {
        root.style.removeProperty('--set-accent');
    }

    root.innerHTML = `
        <section class="set-details__header">
            <div class="set-details__content">
                <h2 class="set-details__title heading heading--2">
                    ${escapeHtml(set.title)}
                </h2>

                ${set.description
            ? `<p class="set-details__description">${escapeHtml(set.description)}</p>`
            : ''
        }

                <div class="set-details__meta">
                    <span>${escapeHtml(categoryTitle)}</span>
                    <span>•</span>
                    <span>${pluralizeCards(cardsCount)}</span>
                </div>
            </div>
        </section>

        <section class="set-details__progress shadow">
            <div class="set-details__progress-header">
                <span class="set-details__progress-title heading heading--6">Прогресс набора</span>
                <span class="set-details__progress-value text text--small">${progress}% освоено</span>
            </div>

            <div class="set-details__line">
                <span
                    class="set-details__line-segment set-details__line-segment--learned"
                    style="width: ${progress}%;"
                ></span>

                ${fading > 0
            ? `<span class="set-details__line-segment set-details__line-segment--fading" style="width: ${fading}%;"></span>`
            : ''
        }
            </div>

            <p class="set-details__progress-text text text--small">
                Выучено ${progress}% из ${cardsCount} карточек
            </p>
        </section>

        <section class="set-details__actions">
            <button
                class="set-details__repeat button button--set-accent button--lg button--radius-12"
                type="button"
                data-start-review="${set.id}"
                data-open-study-modes="${id}"
            >
                ${renderButtonInner({
            icon: 'graduation-cap',
            iconSize: 'sm',
            text: 'Начать повторение',
            shadow: true,
        })}
            </button>

            <button
    class="set-details__add-card button button--set-accent-soft button--lg button--radius-12"
    type="button"
    data-create-card-for-set="${set.id}"
>
    ${renderButtonInner({
            icon: 'plus',
            iconSize: 'sm',
            text: 'Добавить карточку',
            shadow: true,
        })}
</button>
        </section>

        <section class="set-details__cards">
            <div class="set-details__cards-header">
                <h5 class="set-details__cards-title heading heading--5">
                    Карточки (${cardsCount})
                </h5>
            </div>

            <div class="set-details__cards-list" data-set-cards-list>
                <p class="set-details__empty">
                    Карточки набора пока не загружены.
                </p>
            </div>
        </section>
    `;
};

// инициализация

const initSets = () => {
    if (document.querySelector('[data-sets-section]')) {
        reloadSets();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSets);
} else {
    initSets();
}

// открытие сайдбара для создания карточки

// document.addEventListener('click', (event) => {
//     const button = event.target.closest('[data-create-card-for-set]');

//     if (!button) return;

//     event.preventDefault();

//     const setId = Number(button.dataset.createCardForSet);

//     const set = setsState.items.find((item) => {
//         return Number(item.id) === setId;
//     });

//     if (!set) return;

//     const currentSheet = button.closest('[data-sidebar-sheet]');
//     const cardSheet = document.querySelector('[data-sidebar-sheet-id="create-card-sheet"]');
//     const cardForm = cardSheet?.querySelector('[data-card-form]');
//     const setIdInput = cardForm?.querySelector('[data-card-set-id]');
//     const setTitleElement = cardForm?.querySelector('[data-card-form-set-title]');

//     if (setIdInput) {
//         setIdInput.value = set.id;
//     }

//     if (cardForm) {
//         cardForm.dataset.setId = set.id;
//         cardForm.dataset.setTitle = set.title;
//         cardForm.dataset.language = set.language || '';
//     }

//     if (cardForm) {
//         updateCardLanguageFields(cardForm);
//     }

//     const suggestionsWrap = cardForm?.querySelector('[data-card-suggestions-wrap]');

//     if (suggestionsWrap) {
//         suggestionsWrap.hidden = true;
//     }

//     if (setTitleElement) {
//         setTitleElement.hidden = false;
//         setTitleElement.textContent = `Набор: ${set.title}`;
//     }

//     window.openSidebarSheet?.(cardSheet);
// });

// упрощенный

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-create-card-for-set]');

    if (!button) return;

    event.preventDefault();

    const setId = Number(button.dataset.createCardForSet);

    const set = setsState.items.find((item) => {
        return Number(item.id) === setId;
    });

    if (!set) return;

    openCardFormForSet(set);
});

// создание карточек

const updateCardLanguageFields = (form) => {
    const isLanguageSet = form.dataset.language === 'en';

    form.querySelectorAll('[data-card-language-only]').forEach((field) => {
        field.hidden = !isLanguageSet;

        field.querySelectorAll('input, textarea, select').forEach((input) => {
            input.disabled = !isLanguageSet;

            if (!isLanguageSet) {
                input.value = '';
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    });
};

const clearCardFormErrors = (form) => {
    form.querySelectorAll('.is-error').forEach((element) => {
        element.classList.remove('is-error');
    });

    form.querySelectorAll('[data-js-field-error]').forEach((element) => {
        element.remove();
    });
};

const getCardFieldWrapper = (field) => {
    return field?.closest('.input, .textarea-field, .custom-select, .card-form__image-field');
};

const showCardFieldError = (field, message) => {
    const wrapper = getCardFieldWrapper(field);

    if (!wrapper) return;

    wrapper.classList.add('is-error');

    const error = document.createElement('p');

    error.className = 'card-form__message';
    error.dataset.jsFieldError = 'true';
    error.textContent = message;

    wrapper.insertAdjacentElement('afterend', error);
};

const resetCardImagePreview = (form) => {
    const input = form.querySelector('[data-card-image-input]');
    const upload = form.querySelector('[data-card-image-upload]');
    const preview = form.querySelector('[data-card-image-preview]');
    const previewImg = form.querySelector('[data-card-image-preview-img]');
    const selectedImageInput = form.querySelector('[data-selected-image-url]');

    if (selectedImageInput) {
        selectedImageInput.value = '';
    }

    if (input) {
        input.value = '';
    }

    if (previewImg) {
        previewImg.src = '';
    }

    if (preview) {
        preview.hidden = true;
    }

    if (upload) {
        upload.hidden = false;
    }
};

const initCardImageField = (form) => {
    const input = form.querySelector('[data-card-image-input]');
    const upload = form.querySelector('[data-card-image-upload]');
    const preview = form.querySelector('[data-card-image-preview]');
    const previewImg = form.querySelector('[data-card-image-preview-img]');
    const changeButton = form.querySelector('[data-card-image-change]');
    const removeButton = form.querySelector('[data-card-image-remove]');

    if (!input || !upload || !preview || !previewImg) return;

    const showPreview = (file) => {
        const url = URL.createObjectURL(file);

        previewImg.src = url;
        preview.hidden = false;
        upload.hidden = true;

        previewImg.onload = () => {
            URL.revokeObjectURL(url);
        };
    };

    input.addEventListener('change', () => {
        const file = input.files?.[0];

        if (!file) {
            resetCardImagePreview(form);
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            resetCardImagePreview(form);

            window.showToast?.({
                type: 'error',
                title: 'Неверный формат',
                message: 'Можно загрузить JPG, PNG или WEBP.',
            });

            return;
        }

        if (file.size > maxSize) {
            resetCardImagePreview(form);

            window.showToast?.({
                type: 'error',
                title: 'Файл слишком большой',
                message: 'Размер изображения не должен превышать 5 МБ.',
            });

            return;
        }

        const selectedImageInput = form.querySelector('[data-selected-image-url]');

        if (selectedImageInput) {
            selectedImageInput.value = '';
        }

        showPreview(file);
    });

    changeButton?.addEventListener('click', () => {
        input.click();
    });

    removeButton?.addEventListener('click', () => {
        resetCardImagePreview(form);
    });
};

const checkCardDuplicates = async (form) => {
    const url = form.dataset.cardDuplicatesUrl;

    if (!url) {
        return {
            hasDuplicates: false,
            duplicates: [],
        };
    }

    const formData = new FormData();

    formData.set('front', form.querySelector('[name="front"]')?.value.trim() || '');
    formData.set('back', form.querySelector('[name="back"]')?.value.trim() || '');
    formData.set('marker', form.querySelector('[name="marker"]')?.value.trim() || '');

    if (form.dataset.mode === 'edit' && form.dataset.cardId) {
        formData.set('ignore_id', form.dataset.cardId);
    }

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
    });

    if (!response.ok) {
        return {
            hasDuplicates: false,
            duplicates: [],
        };
    }

    const data = await response.json();

    return {
        hasDuplicates: Boolean(data.has_duplicates),
        duplicates: data.duplicates || [],
    };
};

const sendCardForm = async (form) => {
    const formData = new FormData(form);
    const isEdit = form.dataset.mode === 'edit';

    if (isEdit) {
        formData.set('_method', 'PATCH');
    }

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
                    showCardFieldError(field, messages[0]);
                }
            });
        }

        window.showToast?.({
            type: 'error',
            title: 'Не удалось создать карточку',
            message: data.message || 'Проверьте поля и попробуйте ещё раз.',
        });

        return null;
    }

    return data;
};

const validateCardForm = (form) => {
    const setInput = form.querySelector('[name="study_set_id"]');
    const frontInput = form.querySelector('[name="front"]');
    const backInput = form.querySelector('[name="back"]');
    const transcriptionInput = form.querySelector('[name="transcription"]');
    const markerInput = form.querySelector('[name="marker"]');
    const hintInput = form.querySelector('[name="hint"]');
    const exampleInput = form.querySelector('[name="example"]');

    const front = frontInput?.value.trim() || '';
    const back = backInput?.value.trim() || '';
    const transcription = transcriptionInput?.value.trim() || '';
    const marker = markerInput?.value.trim() || '';
    const hint = hintInput?.value.trim() || '';
    const example = exampleInput?.value.trim() || '';

    let hasError = false;

    if (!setInput?.value) {
        window.showToast?.({
            type: 'error',
            title: 'Набор не выбран',
            message: 'Откройте набор и попробуйте добавить карточку ещё раз.',
        });

        return false;
    }

    if (!front) {
        showCardFieldError(frontInput, 'Введите первую сторону карточки.');
        hasError = true;
    }

    if (!back) {
        showCardFieldError(backInput, 'Введите вторую сторону карточки.');
        hasError = true;
    }

    if (front.length > 500) {
        showCardFieldError(frontInput, 'Первая сторона не должна быть длиннее 500 символов.');
        hasError = true;
    }

    if (back.length > 500) {
        showCardFieldError(backInput, 'Вторая сторона не должна быть длиннее 500 символов.');
        hasError = true;
    }

    if (!transcriptionInput?.disabled && transcription.length > 120) {
        showCardFieldError(transcriptionInput, 'Транскрипция не должна быть длиннее 120 символов.');
        hasError = true;
    }

    if (marker.length > 120) {
        showCardFieldError(markerInput, 'Маркер не должен быть длиннее 120 символов.');
        hasError = true;
    }

    if (hint.length > 180) {
        showCardFieldError(hintInput, 'Подсказка не должна быть длиннее 180 символов.');
        hasError = true;
    }

    if (example.length > 1000) {
        showCardFieldError(exampleInput, 'Пример не должен быть длиннее 1000 символов.');
        hasError = true;
    }

    return !hasError;
};

const updateSetAfterCardSaved = (data) => {
    const updatedSet = data?.set;

    if (!updatedSet) return;

    setsState.items = setsState.items.map((set) => {
        if (Number(set.id) !== Number(updatedSet.id)) {
            return set;
        }

        return {
            ...set,
            cards_count: updatedSet.cards_count,
        };
    });

    renderSets();

    const openedSetDetails = document.querySelector('[data-set-details]');
    const openedSetId = Number(openedSetDetails?.dataset.currentSetId);

    if (openedSetId === Number(updatedSet.id)) {
        const set = setsState.items.find((item) => Number(item.id) === Number(updatedSet.id));

        if (set) {
            renderSetDetails(set);
        }

        loadSetCards(set.id);
    }
};

const debouncedCardSuggestions = debounce((form) => {
    loadCardSuggestions(form).catch((error) => {
        console.error(error);
    });
}, 500);

document.querySelectorAll('[data-card-form]').forEach((form) => {
    form.dataset.storeAction = form.action;

    initCardImageField(form);
    updateCardLanguageFields(form);

    form.querySelectorAll('[name="front"], [name="back"]').forEach((field) => {
        field.addEventListener('input', () => {
            debouncedCardSuggestions(form);
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        clearCardFormErrors(form);

        if (!validateCardForm(form)) {
            return;
        }

        setFormLoading(form, true);

        try {
            const duplicateResult = await checkCardDuplicates(form);

            if (duplicateResult.hasDuplicates) {
                const confirmed = await window.openConfirmDialog({
                    title: 'Похожая карточка уже есть',
                    text: 'Уже есть карточка с такой же стороной, определением или таким же сочетанием сторон и маркера. Чтобы не запутаться позже, можно добавить уточняющий маркер.',
                    cancelText: 'Изменить',
                    submitText: 'Сохранить всё равно',
                    submitTone: 'primary',
                });

                if (!confirmed) {
                    return;
                }
            }

            const isEdit = form.dataset.mode === 'edit';

            const setIdInput = form.querySelector('[data-card-set-id]');
            const currentSetId = setIdInput?.value || form.dataset.setId || '';
            const currentSetTitle = form.dataset.setTitle || '';
            const currentLanguage = form.dataset.language || '';

            const data = await sendCardForm(form);

            if (!data) return;

            window.showToast?.({
                type: 'success',
                title: isEdit ? 'Карточка обновлена' : 'Карточка создана',
                message: isEdit ? 'Изменения сохранены.' : 'Можно добавить следующую карточку.',
            });

            form.dispatchEvent(
                new CustomEvent('card:saved', {
                    bubbles: true,
                    detail: data,
                })
            );

            updateSetAfterCardSaved(data);

            const nextSetId = data.card?.study_set_id || data.set?.id || currentSetId;
            const nextCardsCount = Number(data.set?.cards_count || form.dataset.cardsCount || 0);

            form.reset();

            setCardFormMode(form, 'create');
            resetCardImagePreview(form);

            form.dataset.setId = nextSetId;
            form.dataset.setTitle = currentSetTitle;
            form.dataset.language = currentLanguage;
            form.dataset.cardsCount = nextCardsCount;

            if (setIdInput) {
                setIdInput.value = nextSetId;
            }


            if (form.dataset.afterSet === 'true') {
                updateCardCreationProgress(form, nextCardsCount);
            } else {
                hideCardCreationProgress(form);
            }

            const selectedImageInput = form.querySelector('[data-selected-image-url]');

            if (selectedImageInput) {
                selectedImageInput.value = '';
            }

            const removeImageInput = form.querySelector('[data-remove-image]');

            if (removeImageInput) {
                removeImageInput.value = '0';
            }

            const suggestionsWrap = form.querySelector('[data-card-suggestions-wrap]');

            if (suggestionsWrap) {
                suggestionsWrap.hidden = true;
            }

            const setTitleElement = form.querySelector('[data-card-form-set-title]');

            if (setTitleElement) {
                if (currentSetTitle) {
                    setTitleElement.hidden = false;
                    setTitleElement.textContent = `Набор: ${currentSetTitle}`;
                } else {
                    setTitleElement.hidden = true;
                    setTitleElement.textContent = '';
                }
            }

            updateCardLanguageFields(form);
        } catch (error) {
            console.error(error);

            window.showToast?.({
                type: 'error',
                title: form.dataset.mode === 'edit' ? 'Не удалось обновить карточку' : 'Не удалось создать карточку',
                message: 'Проверьте подключение и попробуйте ещё раз.',
            });
        } finally {
            setFormLoading(form, false);
        }
    });
});

// загрузка предложений при вводе front/back

const getCardSuggestionsPayload = (form) => {
    return {
        front: form.querySelector('[name="front"]')?.value.trim() || '',
        back: form.querySelector('[name="back"]')?.value.trim() || '',
        language: form.dataset.language || 'en',
    };
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

// рендер предложений

const renderSuggestionRadio = ({ name, value, checked = false }) => {
    return `
        <input
            class="card-form__suggestion-input"
            type="radio"
            name="${name}"
            value="${escapeHtml(value)}"
            ${checked ? 'checked' : ''}
        >
        <span class="radio-view card-form__suggestion-radio"></span>
    `;
};

const renderCardSuggestions = (form, suggestions) => {
    const definitionsList = form.querySelector('[data-suggestions-list="definitions"]');
    const termsList = form.querySelector('[data-suggestions-list="terms"]');
    const pronunciationList = form.querySelector('[data-suggestions-list="pronunciation"]');
    const examplesList = form.querySelector('[data-suggestions-list="examples"]');
    const hintsList = form.querySelector('[data-suggestions-list="hints"]');
    const markersList = form.querySelector('[data-suggestions-list="markers"]');

    if (definitionsList) {
        definitionsList.innerHTML = (suggestions.definitions || []).map((item, index) => `
            <label class="card-form__suggestion card-form__suggestion--definition" data-fill-card-field="back" data-fill-value="${escapeHtml(item.text)}">
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
        termsList.innerHTML = (suggestions.terms || []).map((item, index) => `
            <label class="card-form__suggestion card-form__suggestion--media" data-fill-card-field="front" data-fill-value="${escapeHtml(item.text)}" data-suggestion-kind="term" data-suggestion-image-url="${escapeHtml(item.image_url || '')}">
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
                : `<span class="card-form__suggestion-image-empty"></span>`
            }
</span>
            </label>
        `).join('');
    }

    if (pronunciationList) {
        pronunciationList.innerHTML = (suggestions.pronunciation || []).map((item, index) => `
            <label class="card-form__suggestion card-form__suggestion--pronunciation" data-fill-card-field="transcription" data-fill-value="${escapeHtml(item.transcription)}">
                ${renderSuggestionRadio({
            name: 'pronunciation_suggestion',
            value: item.value,
        })}

                <span class="card-form__suggestion-accent text text--small">
                    ${escapeHtml(item.accent)}

                    <button
                        class="card-form__suggestion-sound button button--muted button--sm button--radius-circle button--icon"
                        type="button"
                        aria-label="Прослушать произношение"
                        data-play-pronunciation
                        data-audio-url="${escapeHtml(item.audio_url || '')}"
                    >
                        ${renderButtonInner({
            icon: 'volume',
            iconSize: 'xs',
        })}
                    </button>
                </span>

                <span class="card-form__suggestion-transcription text text--small">
                    ${escapeHtml(item.transcription)}
                </span>
            </label>
        `).join('');
    }

    if (hintsList) {
        hintsList.innerHTML = (suggestions.hints || []).map((item, index) => `
            <label class="card-form__suggestion card-form__suggestion--simple" data-fill-card-field="hint" data-fill-value="${escapeHtml(item.text)}">
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
        <label class="card-form__suggestion card-form__suggestion--simple"
            data-fill-card-field="example"
            data-fill-value="${escapeHtml(item.text)}">
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
        markersList.innerHTML = (suggestions.markers || []).map((item, index) => `
            <label class="card-form__suggestion-chip" data-fill-card-field="marker" data-fill-value="${escapeHtml(item.text)}">
                ${renderSuggestionRadio({
            name: 'marker_suggestion',
            value: item.id,
        })}

                <span>${escapeHtml(item.text)}</span>
            </label>
        `).join('');
    }
};

// применение выбранного предложения в поле формы

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

// продолжаем первый путь создания набора

const openCardFormForSet = (set, options = {}) => {
    if (!set) return;

    const {
        afterSet = false,
    } = options;

    const cardSheet = document.querySelector('[data-sidebar-sheet-id="create-card-sheet"]');
    const cardForm = cardSheet?.querySelector('[data-card-form]');

    if (!cardSheet || !cardForm) return;

    const setIdInput = cardForm.querySelector('[data-card-set-id]');
    const setTitleElement = cardForm.querySelector('[data-card-form-set-title]');
    const suggestionsWrap = cardForm.querySelector('[data-card-suggestions-wrap]');
    const selectedImageInput = cardForm.querySelector('[data-selected-image-url]');

    setCardFormMode(cardForm, 'create');

    cardForm.reset();
    resetCardImagePreview(cardForm);

    if (selectedImageInput) {
        selectedImageInput.value = '';
    }

    if (setIdInput) {
        setIdInput.value = set.id;
    }

    cardForm.dataset.setId = set.id;
    cardForm.dataset.setTitle = set.title || '';
    cardForm.dataset.language = set.language || '';
    cardForm.dataset.afterSet = afterSet ? 'true' : 'false';
    cardForm.dataset.cardsCount = Number(set.cards_count || 0);

    updateCardLanguageFields(cardForm);

    if (afterSet) {
        updateCardCreationProgress(cardForm, set.cards_count || 0);
    } else {
        hideCardCreationProgress(cardForm);
    }

    if (setTitleElement) {
        setTitleElement.hidden = false;
        setTitleElement.textContent = `Набор: ${set.title}`;
    }

    if (suggestionsWrap) {
        suggestionsWrap.hidden = true;
    }

    window.openSidebarSheet?.(cardSheet);
};

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-create-card-for-set]');

    if (!button) return;

    event.preventDefault();

    const setId = Number(button.dataset.createCardForSet);

    const set = setsState.items.find((item) => {
        return Number(item.id) === setId;
    });

    if (!set) return;

    openCardFormForSet(set, {
        afterSet: false,
    });
});

// редактирование карточки

const setCardFormMode = (form, mode, card = null) => {
    form.dataset.mode = mode;

    const submitText = form.querySelector('.card-form__submit .button__text');
    const title = form.closest('.card-form')?.querySelector('.card-form__title');

    if (mode === 'edit' && card) {
        form.dataset.cardId = card.id;
        form.action = `/cards/${card.id}`;

        if (title) {
            title.textContent = 'Редактирование карточки';
        }

        if (submitText) {
            submitText.textContent = 'Сохранить изменения';
        }

        return;
    }

    delete form.dataset.cardId;
    form.action = form.dataset.storeAction || form.action;

    if (title) {
        title.textContent = 'Добавление карточки';
    }

    if (submitText) {
        submitText.textContent = 'Добавить карточку';
    }
};

const fillCardForm = (form, card) => {
    const fields = {
        front: card.front || '',
        back: card.back || '',
        transcription: card.transcription || '',
        marker: card.marker || '',
        hint: card.hint || '',
        example: card.example || '',
    };

    Object.entries(fields).forEach(([name, value]) => {
        const field = form.querySelector(`[name="${name}"]`);

        if (field) {
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    const setIdInput = form.querySelector('[data-card-set-id]');

    if (setIdInput) {
        setIdInput.value = card.study_set_id;
    }

    const selectedImageInput = form.querySelector('[data-selected-image-url]');

    if (selectedImageInput) {
        selectedImageInput.value = '';
    }

    const removeImageInput = form.querySelector('[data-remove-image]');

    if (removeImageInput) {
        removeImageInput.value = '0';
    }

    if (card.image_url) {
        applyExternalCardImage(form, card.image_url);

        if (selectedImageInput) {
            selectedImageInput.value = '';
        }
    } else {
        resetCardImagePreview(form);
    }
};

const fetchCard = async (cardId) => {
    const response = await fetch(`/cards/${cardId}`, {
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
            title: 'Не удалось загрузить карточку',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return null;
    }

    return data.card;
};

document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-edit-card]');

    if (!button) return;

    event.preventDefault();

    const cardId = Number(button.dataset.editCard);

    if (!cardId) return;

    const cardSheet = document.querySelector('[data-sidebar-sheet-id="create-card-sheet"]');
    const cardForm = cardSheet?.querySelector('[data-card-form]');

    if (!cardSheet || !cardForm) return;

    button.disabled = true;

    try {
        const card = await fetchCard(cardId);

        if (!card) return;

        const set = setsState.items.find((item) => {
            return Number(item.id) === Number(card.study_set_id);
        });

        cardForm.dataset.language = set?.language || '';
        updateCardLanguageFields(cardForm);

        setCardFormMode(cardForm, 'edit', card);
        fillCardForm(cardForm, card);

        const suggestionsWrap = cardForm.querySelector('[data-card-suggestions-wrap]');

        if (suggestionsWrap) {
            suggestionsWrap.hidden = true;
        }

        window.openSidebarSheet?.(cardSheet);
    } catch (error) {
        console.error(error);

        window.showToast?.({
            type: 'error',
            title: 'Не удалось открыть редактирование',
            message: 'Проверьте подключение и попробуйте ещё раз.',
        });
    } finally {
        button.disabled = false;
    }
});

// confirm-dialog

const confirmDialog = document.querySelector('[data-confirm-dialog]');

let confirmResolve = null;

const closeConfirmDialog = (result = false) => {
    if (!confirmDialog) return;

    confirmDialog.classList.remove('is-visible');

    window.setTimeout(() => {
        confirmDialog.hidden = true;

        if (confirmResolve) {
            confirmResolve(result);
            confirmResolve = null;
        }
    }, 200);
};

const setConfirmSubmitTone = (button, tone) => {
    if (!button) return;

    button.classList.remove(
        'button--primary',
        'button--danger',
        'button--ghost',
        'button--danger-ghost'
    );

    button.classList.add(`button--${tone}`);
};

const openConfirmDialog = ({
    title = 'Подтвердите действие',
    text = 'Действие нельзя будет отменить.',
    cancelText = 'Отмена',
    submitText = 'Подтвердить',
    submitTone = 'primary', // primary | danger | ghost | danger-ghost
} = {}) => {
    if (!confirmDialog) {
        console.warn('Confirm dialog component not found: [data-confirm-dialog]');
        return Promise.resolve(false);
    }

    const titleElement = confirmDialog.querySelector('[data-confirm-title]');
    const textElement = confirmDialog.querySelector('[data-confirm-text]');
    const cancelButton = confirmDialog.querySelector('[data-confirm-cancel].button');
    const submitButton = confirmDialog.querySelector('[data-confirm-submit]');

    const cancelTextElement = cancelButton?.querySelector('.button__text');
    const submitTextElement = submitButton?.querySelector('.button__text');

    if (titleElement) {
        titleElement.textContent = title;
    }

    if (textElement) {
        textElement.textContent = text;
    }

    if (cancelTextElement) {
        cancelTextElement.textContent = cancelText;
    }

    if (submitTextElement) {
        submitTextElement.textContent = submitText;
    }

    setConfirmSubmitTone(submitButton, submitTone);

    confirmDialog.hidden = false;

    requestAnimationFrame(() => {
        confirmDialog.classList.add('is-visible');
    });

    return new Promise((resolve) => {
        confirmResolve = resolve;
    });
};

document.addEventListener('click', (event) => {
    if (event.target.closest('[data-confirm-submit]')) {
        closeConfirmDialog(true);
        return;
    }

    if (event.target.closest('[data-confirm-cancel]')) {
        closeConfirmDialog(false);
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && confirmDialog && !confirmDialog.hidden) {
        closeConfirmDialog(false);
    }
});

window.openConfirmDialog = openConfirmDialog;

// перегенерация картинки

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
            suggestion.dataset.suggestionImageUrl = data.image_url;
        }

        if (imageWrap) {
            imageWrap.innerHTML = `
        <img src="${escapeHtml(data.image_url)}" alt="${escapeHtml(term)}">
    `;
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
    }
});

// применение внешней картинки в обычный preview

const applyExternalCardImage = (form, imageUrl) => {
    if (!imageUrl) return;

    const selectedImageInput = form.querySelector('[data-selected-image-url]');
    const fileInput = form.querySelector('[data-card-image-input]');
    const upload = form.querySelector('[data-card-image-upload], .card-form__image-upload');
    const preview = form.querySelector('[data-card-image-preview]');
    const previewImg = form.querySelector('[data-card-image-preview-img]');

    if (selectedImageInput) {
        selectedImageInput.value = imageUrl;
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

// аудио?

let currentPronunciationAudio = null;

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

// редактировать профиль

const renderProfileAvatar = (wrap, avatarUrl) => {
    if (!wrap) return;

    if (avatarUrl) {
        wrap.innerHTML = `
            <img class="profile-form__avatar-img" src="${escapeHtml(avatarUrl)}" alt="Аватар профиля">
        `;

        return;
    }

    wrap.innerHTML = `
        <svg class="icon icon--md profile-form__avatar-icon">
            <use href="#icon-profile"></use>
        </svg>
    `;
};

const fillProfileForm = async (form) => {
    const url = form.dataset.profileUrl;

    if (!url) return;

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
            title: 'Не удалось загрузить профиль',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return;
    }

    form.querySelector('[name="name"]').value = data.profile.name || '';
    form.querySelector('[name="nickname"]').value = data.profile.nickname || '';
    form.querySelector('[name="email"]').value = data.profile.email || '';

    const removeInput = form.querySelector('[data-profile-remove-avatar]');
    const fileInput = form.querySelector('[data-profile-avatar-input]');

    if (removeInput) {
        removeInput.value = '0';
    }

    if (fileInput) {
        fileInput.value = '';
    }

    renderProfileAvatar(
        form.querySelector('[data-profile-avatar-preview]'),
        data.profile.avatar_url
    );
};

document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-profile-edit-open]');

    if (!button) return;

    event.preventDefault();

    const sheet = document.querySelector('[data-sidebar-sheet-id="edit-profile-sheet"]');
    const form = sheet?.querySelector('[data-profile-form]');

    if (!sheet || !form) return;

    await fillProfileForm(form);

    window.openSidebarSheet?.(sheet);
});

document.addEventListener('change', (event) => {
    const input = event.target.closest('[data-profile-avatar-input]');

    if (!input) return;

    const form = input.closest('[data-profile-form]');
    const file = input.files?.[0];

    if (!file || !form) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        window.showToast?.({
            type: 'error',
            title: 'Неверный формат',
            message: 'Можно загрузить JPG, PNG или WEBP.',
        });

        input.value = '';
        return;
    }

    if (file.size > maxSize) {
        window.showToast?.({
            type: 'error',
            title: 'Файл слишком большой',
            message: 'Размер изображения не должен превышать 5 МБ.',
        });

        input.value = '';
        return;
    }

    const removeInput = form.querySelector('[data-profile-remove-avatar]');

    if (removeInput) {
        removeInput.value = '0';
    }

    renderProfileAvatar(
        form.querySelector('[data-profile-avatar-preview]'),
        URL.createObjectURL(file)
    );
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-profile-avatar-remove]');

    if (!button) return;

    event.preventDefault();

    const form = button.closest('[data-profile-form]');
    const fileInput = form?.querySelector('[data-profile-avatar-input]');
    const removeInput = form?.querySelector('[data-profile-remove-avatar]');

    if (fileInput) {
        fileInput.value = '';
    }

    if (removeInput) {
        removeInput.value = '1';
    }

    renderProfileAvatar(form?.querySelector('[data-profile-avatar-preview]'), null);
});

document.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-profile-form]');

    if (!form) return;

    event.preventDefault();

    const submitButton = form.querySelector('[type="submit"]');
    const formData = new FormData(form);

    submitButton.disabled = true;

    try {
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
            window.showToast?.({
                type: 'error',
                title: 'Не удалось сохранить профиль',
                message: data.message || 'Проверьте поля и попробуйте ещё раз.',
            });

            return;
        }

        document.querySelectorAll('[data-profile-name]').forEach((item) => {
            item.textContent = data.profile.name || 'Без имени';
        });

        document.querySelectorAll('[data-profile-nickname]').forEach((item) => {
            item.textContent = `@${data.profile.nickname || 'user'}`;
        });

        document.querySelectorAll('[data-profile-email]').forEach((item) => {
            item.textContent = data.profile.email || '';
        });

        document.querySelectorAll('[data-profile-avatar]').forEach((avatar) => {
            if (data.profile.avatar_url) {
                avatar.innerHTML = `
                    <img class="profile-card__avatar-img" src="${escapeHtml(data.profile.avatar_url)}" alt="Аватар профиля">
                `;
            } else {
                avatar.innerHTML = `
                    <svg class="icon icon--md profile-card__avatar-icon">
                        <use href="#icon-profile"></use>
                    </svg>
                `;
            }
        });

        window.showToast?.({
            type: 'success',
            title: 'Профиль обновлён',
            message: 'Изменения сохранены.',
        });

        window.closeSidebarSheet?.(form.closest('[data-sidebar-sheet]'));
    } catch (error) {
        console.error(error);

        window.showToast?.({
            type: 'error',
            title: 'Не удалось сохранить профиль',
            message: 'Проверьте подключение и попробуйте ещё раз.',
        });
    } finally {
        submitButton.disabled = false;
    }
});

// глобальный поиск

const globalSearchState = {
    query: '',
    abortController: null,
    debounceTimer: null,
};

const getGlobalSearchElements = () => {
    const root = document.querySelector('[data-global-search]');

    return {
        root,
        form: root?.querySelector('[data-global-search-form]'),
        input: root?.querySelector('[data-global-search-input]'),
        start: root?.querySelector('[data-global-search-start]'),
        results: root?.querySelector('[data-global-search-results]'),
        details: root?.querySelector('[data-global-search-details]'),
    };
};

const openGlobalSearch = () => {
    const { root, input } = getGlobalSearchElements();

    if (!root) return;

    root.hidden = false;

    requestAnimationFrame(() => {
        root.classList.add('is-open');
        input?.focus();
    });
};

const closeGlobalSearch = () => {
    const { root } = getGlobalSearchElements();

    if (!root) return;

    root.classList.remove('is-open');

    window.setTimeout(() => {
        root.hidden = true;
    }, 200);
};

const escapeSearchText = (value) => {
    return escapeHtml(value || '');
};

const renderGlobalSearchState = (message) => {
    const { start, results, details } = getGlobalSearchElements();

    if (start) {
        start.hidden = true;
    }

    if (details) {
        details.hidden = true;
    }

    if (results) {
        results.hidden = false;
        results.innerHTML = `
            <p class="global-search__state">
                ${escapeHtml(message)}
            </p>
        `;
    }
};

const renderGlobalSearchResults = (sets) => {
    const { start, results, details } = getGlobalSearchElements();

    if (start) {
        start.hidden = true;
    }

    if (details) {
        details.hidden = true;
    }

    if (!results) return;

    results.hidden = false;

    if (!sets.length) {
        results.innerHTML = `
            <p class="global-search__state">
                Ничего не найдено.
            </p>
        `;

        return;
    }

    results.innerHTML = sets.map((set) => {
        const id = Number(set.id);
        const title = escapeHtml(set.title || '');
        const description = escapeHtml(set.description || '');
        const cardsCount = Number(set.cards_count || 0);

        const authorNickname = set.author?.nickname
            ? `@${escapeHtml(set.author.nickname)}`
            : '';

        const authorName = set.author?.name
            ? escapeHtml(set.author.name)
            : '';

        const languageBadge = set.language === 'en'
            ? `<span class="card__badge card__badge--language">EN</span>`
            : '';

        const saveButton = set.is_saved
            ? `
                <button
                    class="card__more button button--primary button--lg button--radius-12 button--icon"
                    type="button"
                    aria-label="Набор уже сохранён"
                    aria-pressed="true"
                    disabled
                >
                    ${renderButtonInner({
                icon: 'check',
                iconSize: 'sm',
            })}
                </button>
            `
            : `
                <button
                    class="card__more button button--primary-soft button--lg button--radius-12 button--icon"
                    type="button"
                    aria-label="Сохранить набор"
                    aria-pressed="false"
                    data-global-search-save="${id}"
                >
                    ${renderButtonInner({
                icon: 'plus',
                iconSize: 'sm',
            })}
                </button>
            `;

        return `
            <article class="card card--search shadow" data-public-set-id="${id}">
                <div class="card__accent"></div>

                <div class="card__main">
                    <div class="card__text">
                        <div class="card__heading">
                            <h3 class="card__title heading heading--4">
                                ${title}
                            </h3>
                        </div>

                        ${description
                ? `
                                <p class="card__description">
                                    ${description}
                                </p>
                            `
                : ''
            }
                    </div>

                    <div class="card__actions">
                        ${saveButton}

                        <button
                            class="card__more button button--icon-muted button--lg button--radius-12 button--icon"
                            type="button"
                            aria-label="Посмотреть набор"
                            data-global-search-show="${id}"
                        >
                            ${renderButtonInner({
                icon: 'expand',
                iconSize: 'sm',
            })}
                        </button>
                    </div>

                    <div class="card__meta">
                        <div class="card__badges">
                            <span class="card__badge">
                                Публичный
                            </span>

                            ${languageBadge}
                        </div>

                        <div class="card__meta-line">
                            <span>${cardsCount} карточек</span>

                            ${authorNickname || authorName
                ? `
                                    <span>•</span>
                                    <span>
                                        Автор: ${authorNickname || authorName}
                                    </span>
                                `
                : ''
            }
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join('');
};

const loadGlobalSearchResults = async (query) => {
    const { form } = getGlobalSearchElements();

    if (!form) return;

    const safeQuery = query.trim();

    if (safeQuery.length < 2) {
        const { start, results, details } = getGlobalSearchElements();

        if (start) {
            start.hidden = false;
        }

        if (results) {
            results.hidden = true;
            results.innerHTML = '';
        }

        if (details) {
            details.hidden = true;
            details.innerHTML = '';
        }

        return;
    }

    if (globalSearchState.abortController) {
        globalSearchState.abortController.abort();
    }

    globalSearchState.abortController = new AbortController();

    renderGlobalSearchState('Ищем наборы...');

    const url = new URL(form.action, window.location.origin);

    url.searchParams.set('q', safeQuery);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            signal: globalSearchState.abortController.signal,
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            renderGlobalSearchState(data.message || 'Не удалось выполнить поиск.');
            return;
        }

        renderGlobalSearchResults(data.sets || []);
    } catch (error) {
        if (error.name === 'AbortError') return;

        console.error(error);
        renderGlobalSearchState('Проверьте подключение и попробуйте ещё раз.');
    }
};

const debounceGlobalSearch = (query) => {
    window.clearTimeout(globalSearchState.debounceTimer);

    globalSearchState.debounceTimer = window.setTimeout(() => {
        loadGlobalSearchResults(query);
    }, 300);
};

const renderPublicSearchCard = (card, index, isLanguageSet) => {
    const number = index + 1;

    const image = card.image_url
        ? `
            <span class="global-public-card__image">
                <img src="${escapeHtml(card.image_url)}" alt="">
            </span>
        `
        : `
            <span class="global-public-card__image global-public-card__image--empty" aria-hidden="true">
                <svg class="icon icon--sm global-public-card__image-icon">
                    <use href="#icon-image"></use>
                </svg>
            </span>
        `;

    const transcription = isLanguageSet && card.transcription
        ? `<span class="global-public-card__transcription">${escapeHtml(card.transcription)}</span>`
        : '';

    const marker = card.marker
        ? `<span class="global-public-card__marker">${escapeHtml(card.marker)}</span>`
        : '';

    const soundButton = isLanguageSet
        ? `
            <button
                class="global-public-card__sound button button--ghost button--sm button--radius-circle button--icon"
                type="button"
                aria-label="Прослушать карточку"
                data-speak-card="${escapeHtml(card.front)}"
            >
                ${renderButtonInner({
            icon: 'sound',
            iconSize: 'xs',
        })}
            </button>
        `
        : '';

    const hint = card.hint
        ? `
            <div class="global-public-card__extra">
                <span class="global-public-card__extra-label">Подсказка:</span>
                <span class="global-public-card__extra-text">${escapeHtml(card.hint)}</span>
            </div>
        `
        : '';

    const example = card.example
        ? `
            <div class="global-public-card__extra">
                <span class="global-public-card__extra-label">Пример:</span>
                <span class="global-public-card__extra-text">${escapeHtml(card.example)}</span>
            </div>
        `
        : '';

    return `
        <article class="global-public-card shadow">
            <span class="global-public-card__number">${number}</span>

            ${image}

            <div class="global-public-card__content">
                <div class="global-public-card__term-line">
                    <h4 class="global-public-card__front heading heading--6">
                        ${escapeHtml(card.front)}
                    </h4>

                    ${soundButton}
                </div>

                ${transcription}

                <p class="global-public-card__back text text--small">
                    ${escapeHtml(card.back)}
                </p>

                ${hint}
                ${example}
            </div>

            <div class="global-public-card__meta">
                ${marker}
            </div>
        </article>
    `;
};

const renderPublicSetDetails = (set) => {
    const { start, results, details } = getGlobalSearchElements();

    if (start) {
        start.hidden = true;
    }

    if (results) {
        results.hidden = true;
    }

    if (!details) return;

    const title = escapeHtml(set.title || '');
    const description = escapeHtml(set.description || '');
    const cardsCount = Number(set.cards_count || 0);
    const isLanguageSet = set.language === 'en';

    const authorNickname = set.author?.nickname
        ? `@${escapeHtml(set.author.nickname)}`
        : '';

    const authorName = set.author?.name
        ? escapeHtml(set.author.name)
        : '';

    const author = authorNickname || authorName;

    details.hidden = false;

    details.innerHTML = `
        <button class="global-search__details-back" type="button" data-global-search-back>
            ← Назад
        </button>

        <div class="global-search__details-header">
            <h3 class="global-search__details-title heading heading--3">
                ${title}
            </h3>

            ${description
            ? `
                    <p class="global-search__details-description">
                        ${description}
                    </p>
                `
            : ''
        }

            <div class="global-search__details-meta">
                ${author ? `<span>${author}</span>` : ''}
                ${author ? '<span>•</span>' : ''}
                <span>${cardsCount} карточек</span>
                ${isLanguageSet ? '<span>•</span><span>EN</span>' : ''}
            </div>
        </div>

        <div class="global-search__public-cards">
            ${(set.cards || []).map((card, index) => renderPublicSearchCard(card, index, isLanguageSet)).join('')}
        </div>
    `;
};

const loadPublicSetDetails = async (setId) => {
    const { start, results, details } = getGlobalSearchElements();

    if (start) {
        start.hidden = true;
    }

    if (results) {
        results.hidden = true;
    }

    if (details) {
        details.hidden = false;
        details.innerHTML = `
            <p class="global-search__state">
                Загружаем набор...
            </p>
        `;
    }

    try {
        const response = await fetch(`/global-search/sets/${setId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (details) {
                details.innerHTML = `
                    <button class="global-search__details-back" type="button" data-global-search-back>
                        ← Назад
                    </button>

                    <p class="global-search__state">
                        ${escapeHtml(data.message || 'Не удалось загрузить набор.')}
                    </p>
                `;
            }

            return;
        }

        renderPublicSetDetails(data.set);
    } catch (error) {
        console.error(error);

        if (details) {
            details.innerHTML = `
                <button class="global-search__details-back" type="button" data-global-search-back>
                    ← Назад
                </button>

                <p class="global-search__state">
                    Проверьте подключение и попробуйте ещё раз.
                </p>
            `;
        }
    }
};

const savePublicSet = async (setId, button) => {
    button.disabled = true;

    try {
        const response = await fetch(`/global-search/sets/${setId}/save`, {
            method: 'POST',
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
                title: 'Не удалось сохранить набор',
                message: data.message || 'Попробуйте ещё раз.',
            });

            button.disabled = false;
            return;
        }

        window.showToast?.({
            type: 'success',
            title: 'Набор сохранён',
            message: 'Копия появилась в личных наборах.',
        });

        await reloadSets?.();

        const { input } = getGlobalSearchElements();

        await loadGlobalSearchResults(input?.value || '');
    } catch (error) {
        console.error(error);

        window.showToast?.({
            type: 'error',
            title: 'Не удалось сохранить набор',
            message: 'Проверьте подключение и попробуйте ещё раз.',
        });

        button.disabled = false;
    }
};

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-global-search-open]');

    if (!button) return;

    event.preventDefault();

    openGlobalSearch();
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-global-search-close]');

    if (!button) return;

    event.preventDefault();

    closeGlobalSearch();
});

document.addEventListener('input', (event) => {
    const input = event.target.closest('[data-global-search-input]');

    if (!input) return;

    globalSearchState.query = input.value;

    debounceGlobalSearch(input.value);
});

document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-global-search-form]');

    if (!form) return;

    event.preventDefault();

    const input = form.querySelector('[data-global-search-input]');

    loadGlobalSearchResults(input?.value || '');
});

document.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-global-search-query]');

    if (!chip) return;

    const { input } = getGlobalSearchElements();
    const query = chip.dataset.globalSearchQuery || '';

    if (input) {
        input.value = query;
        input.focus();
    }

    loadGlobalSearchResults(query);
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-global-search-show]');

    if (!button) return;

    event.preventDefault();

    loadPublicSetDetails(button.dataset.globalSearchShow);
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-global-search-save]');

    if (!button) return;

    event.preventDefault();

    savePublicSet(button.dataset.globalSearchSave, button);
});

document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-global-search-back]');

    if (!button) return;

    event.preventDefault();

    const { input, results, details, start } = getGlobalSearchElements();

    if (details) {
        details.hidden = true;
        details.innerHTML = '';
    }

    if (start) {
        start.hidden = true;
    }

    if (results && results.innerHTML.trim()) {
        results.hidden = false;
        return;
    }

    const query = input?.value?.trim() || '';

    if (query.length >= 2) {
        await loadGlobalSearchResults(query);
        return;
    }

    if (start) {
        start.hidden = false;
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    const { root } = getGlobalSearchElements();

    if (!root || root.hidden) return;

    closeGlobalSearch();
});

// обратная связь

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-contact-open]');

    if (!button) return;

    event.preventDefault();

    const sheet = document.querySelector('[data-sidebar-sheet-id="contact-sheet"]');

    if (!sheet) return;

    window.openSidebarSheet?.(sheet);
});

document.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-contact-form]');

    if (!form) return;

    event.preventDefault();

    const submitButton = form.querySelector('[type="submit"]');
    const formData = new FormData(form);

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
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
            window.showToast?.({
                type: 'error',
                title: 'Не удалось отправить обращение',
                message: data.message || 'Проверьте поля и попробуйте ещё раз.',
            });

            return;
        }

        window.showToast?.({
            type: 'success',
            title: 'Обращение отправлено',
            message: 'Спасибо! Сообщение отправлено на почту поддержки.',
        });

        form.reset();

        window.closeSidebarSheet?.(form.closest('[data-sidebar-sheet]'));
    } catch (error) {
        console.error(error);

        window.showToast?.({
            type: 'error',
            title: 'Не удалось отправить обращение',
            message: 'Проверьте подключение и попробуйте ещё раз.',
        });
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
});

// блок пустоты

const renderEmptyState = ({
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
        <article class="empty-state shadow" data-empty-state="${type}">
            <div class="empty-state__illustration">
                <img src="${escapeHtml(image)}" alt="" aria-hidden="true">
            </div>

            <div class="empty-state__content">
                <h3 class="empty-state__title heading heading--4">
                    ${escapeHtml(title)}
                </h3>

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

// режимы

const updateAudioFsrsOption = (root) => {
    const speakSide = root.querySelector('[name="audio_speak_side"]:checked')?.value || 'front';
    const answerSide = root.querySelector('[name="audio_answer_side"]:checked')?.value || 'back';
    const fsrsOption = root.querySelector('[data-audio-fsrs-option]');

    if (!fsrsOption) return;

    fsrsOption.hidden = speakSide !== answerSide;
};

document.addEventListener('change', (event) => {
    const input = event.target.closest('[name="audio_speak_side"], [name="audio_answer_side"]');

    if (!input) return;

    const root = input.closest('[data-study-mode-root]');

    updateAudioFsrsOption(root);
});

const studyModeState = {
    setId: null,
    mode: null,
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

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-study-modes]');

    if (!button) return;

    event.preventDefault();

    const setId = Number(button.dataset.openStudyModes);

    if (!setId) return;

    const sheet = document.querySelector('[data-sidebar-sheet-id="study-mode-sheet"]');
    const root = sheet?.querySelector('[data-study-mode-root]');

    if (!sheet || !root) return;

    studyModeState.setId = setId;
    studyModeState.mode = null;

    setActiveStudyModeScreen(root, 'list');

    window.openSidebarSheet?.(sheet);
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-study-mode-select]');

    if (!button) return;

    event.preventDefault();

    const sheet = button.closest('[data-sidebar-sheet]');
    const root = sheet?.querySelector('[data-study-mode-root]');
    const mode = button.dataset.studyModeSelect;

    if (!root || !mode) return;

    studyModeState.mode = mode;

    setActiveStudyModeScreen(root, mode);

    if (mode === 'audio') {
        updateAudioFsrsOption(root);
    }
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-study-mode-back]');

    if (!button) return;

    event.preventDefault();

    const sheet = button.closest('[data-sidebar-sheet]');
    const root = sheet?.querySelector('[data-study-mode-root]');

    if (!root) return;

    studyModeState.mode = null;

    setActiveStudyModeScreen(root, 'list');
});

// само обучение

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

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-study-card-hint]');

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const card = studySessionState.cards[studySessionState.index];

    if (!card?.hint) return;

    studySessionState.isHintVisible = !studySessionState.isHintVisible;

    renderStudySession();
});

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

const studySessionState = {
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

const renderStudyTranscription = (card) => {
    if (!studySessionState.isLanguageSet || !card.transcription) return '';

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
        soundButton.hidden = !studySessionState.isLanguageSet;
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
        soundButton.hidden = !studySessionState.isLanguageSet;
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

const loadStudyCards = async (setId) => {
    const response = await fetch(`/sets/${setId}/cards`, {
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
            title: 'Не удалось загрузить карточки',
            message: data.message || 'Попробуйте ещё раз.',
        });

        return [];
    }

    return data.cards || [];
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

document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-study-start]');

    if (!button) return;

    event.preventDefault();

    const sheet = button.closest('[data-sidebar-sheet]');
    const root = sheet?.querySelector('[data-study-mode-root]');
    const mode = button.dataset.studyStart;
    const setId = studyModeState.setId;

    if (!root || !mode || !setId) return;

    const settings = getStudyModeSettings(root, mode);

    if (!['basic', 'write', 'audio'].includes(mode)) {
        window.showToast?.({
            type: 'info',
            title: 'Режим скоро будет доступен',
            message: 'Сейчас подключаем аудио режим.',
        });

        return;
    }

    button.disabled = true;

    try {
        const cards = await loadStudyCards(setId);

        if (!cards.length) {
            window.showToast?.({
                type: 'error',
                title: 'Нет карточек',
                message: 'Добавьте карточки в набор перед повторением.',
            });

            return;
        }

        const set = setsState.items.find((item) => {
            return Number(item.id) === Number(setId);
        });

        studySessionState.setId = setId;
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
        button.disabled = false;
    }
});

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

    if (studySessionState.isChecked) return;

    const card = studySessionState.cards[studySessionState.index];

    if (!card) return;

    const answerSide = studySessionState.settings.answerSide || 'back';
    const correctAnswer = getStudySideValue(card, answerSide);

    studySessionState.isChecked = true;
    studySessionState.isCorrect = checkWrittenAnswer(studySessionState.writtenAnswer, correctAnswer);
    studySessionState.wasFlippedOnce = true;

    renderStudySession();
});

document.addEventListener('click', (event) => {
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
        if (studySessionState.isChecked) return;

        const answerSide = studySessionState.settings.answerSide || 'back';
        const correctAnswer = getStudySideValue(card, answerSide);

        studySessionState.isChecked = true;
        studySessionState.isCorrect = checkWrittenAnswer(
            studySessionState.writtenAnswer,
            correctAnswer
        );
        studySessionState.wasFlippedOnce = true;

        renderStudySession();
    }
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-study-rating-value]');

    if (!button) return;

    event.preventDefault();

    studySessionState.index += 1;
    studySessionState.isFlipped = false;
    studySessionState.wasFlippedOnce = false;
    studySessionState.isHintVisible = false;

    studySessionState.writtenAnswer = '';
    studySessionState.isChecked = false;
    studySessionState.isCorrect = false;

    renderStudySession();
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-study-session-close]');

    if (!button) return;

    event.preventDefault();

    closeStudySession();
});

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-study-card-sound]');

    if (!button) return;

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
});

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
