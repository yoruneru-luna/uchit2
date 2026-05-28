export const isValidEmail = (value) => {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
};

export const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
};

export const debounce = (callback, delay = 300) => {
    let timer = null;

    return (...args) => {
        window.clearTimeout(timer);

        timer = window.setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

export const escapeHtml = (value = '') => {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
};

export const setFormLoading = (form, isLoading) => {
    const submitButton = form.querySelector('[type="submit"]');

    if (!submitButton) return;

    submitButton.disabled = isLoading;
    submitButton.classList.toggle('is-disabled', isLoading);
};
