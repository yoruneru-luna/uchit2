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

        // 1. Сначала центрируем и прижимаем к краям, если вылезает
        legends.forEach((legend) => {
            const rect = legend.getBoundingClientRect();

            if (rect.left < barRect.left) {
                legend.classList.add('progress-card__legend-item--left');
            } else if (rect.right > barRect.right) {
                legend.classList.add('progress-card__legend-item--right');
            }
        });

        // 2. Потом проверяем реальные пересечения
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
    const edit = event.target.closest('[data-card-menu-edit]');
    const del = event.target.closest('[data-card-menu-delete]');
    const insideMenu = event.target.closest('[data-card-menu]');

    if (toggle) {
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

    if (edit) {
        const menuRoot = edit.closest('[data-card-menu]');
        closeAllCardMenus();

        console.log('Редактировать');
        return;
    }

    if (del) {
        const menuRoot = del.closest('[data-card-menu]');
        closeAllCardMenus();

        console.log('Удалить');
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
