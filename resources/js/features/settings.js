export const initLearningSettingsForm = () => {
    const form = document.querySelector('[data-learning-settings-form]');

    if (!form) return;

    form.addEventListener('submit', async (event) => {
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
                },
            });

            const data = await response.json();

            if (!response.ok) {
                window.showToast?.({
                    type: 'error',
                    title: 'Не удалось сохранить',
                    message: data.message || 'Проверьте данные и попробуйте ещё раз.',
                });

                return;
            }

            window.showToast?.({
                type: 'success',
                title: 'Настройки сохранены',
                message: data.message || 'Настройки обучения обновлены.',
            });
        } catch (error) {
            console.error(error);

            window.showToast?.({
                type: 'error',
                title: 'Не удалось сохранить',
                message: 'Проверьте подключение и попробуйте ещё раз.',
            });
        } finally {
            submitButton.disabled = false;
        }
    });
};
