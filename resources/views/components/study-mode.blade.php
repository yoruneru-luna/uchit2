<section class="study-mode" data-study-mode-root>
    <div class="study-mode__screen base-section is-active" data-study-mode-screen="list">
        <x-section-header class="sidebar__header" title="Выберите режим повторения" />

        <p class="study-mode__subtitle text text--small">
            Выберите подходящий способ тренировки карточек.
        </p>

        <div class="study-mode__list">
            <button class="study-mode-card shadow" type="button" data-study-mode-select="basic">
                <x-icon-box icon="eye" tone="purple" size="md" icon-size="sm" />

                <span class="study-mode-card__content">
                    <span class="study-mode-card__title">Базовый просмотр</span>
                    <span class="study-mode-card__text">
                        Смотрите карточки и оценивайте ответ.
                    </span>
                </span>

                <x-icon id="chevron" size="xs" class="study-mode-card__arrow" />
            </button>

            <button class="study-mode-card shadow" type="button" data-study-mode-select="write">
                <x-icon-box icon="edit" tone="orange" size="md" icon-size="sm" />

                <span class="study-mode-card__content">
                    <span class="study-mode-card__title">Письменный ответ</span>
                    <span class="study-mode-card__text">
                        Введите ответ по памяти.
                    </span>
                </span>

                <x-icon id="chevron" size="xs" class="study-mode-card__arrow" />
            </button>

            <button class="study-mode-card shadow" type="button" data-study-mode-select="audio">
                <x-icon-box icon="volume" tone="blue" size="md" icon-size="sm" />

                <span class="study-mode-card__content">
                    <span class="study-mode-card__title">Аудио режим</span>
                    <span class="study-mode-card__text">
                        Прослушайте и введите ответ.
                    </span>
                </span>

                <x-icon id="chevron" size="xs" class="study-mode-card__arrow" />
            </button>
        </div>
    </div>

    <div class="study-mode__screen base-section" data-study-mode-screen="basic" hidden>
        <x-button class="study-mode__back text text--small" tone="muted" size="noneSize" type="button" icon="arrow"
            icon-size="xs" data-study-mode-back>
            Назад
        </x-button>

        <div class="study-mode__header">
            <x-icon-box icon="eye" tone="purple" size="md" icon-size="sm" class="study-mode__header-icon" />

            <h4 class="heading heading--4">Базовый просмотр</h4>

            <p class="study-mode__subtitle text text--small">
                Карточка будет показываться с выбранной стороны.
            </p>
        </div>

        <div class="study-mode__settings">
            <div class="study-mode__group">
                <h4 class="study-mode__group-title">
                    Что показывать сначала?
                </h4>

                <label class="study-mode-option">
                    <input type="radio" name="basic_first_side" value="front" checked>
                    <span>Вопрос / термин</span>
                </label>

                <label class="study-mode-option">
                    <input type="radio" name="basic_first_side" value="back">
                    <span>Ответ / определение</span>
                </label>

                <label class="study-mode-option">
                    <input type="radio" name="basic_first_side" value="example">
                    <span>Пример</span>
                </label>

                <label class="study-mode-option">
                    <input type="radio" name="basic_first_side" value="image">
                    <span>Изображение</span>
                </label>
            </div>
        </div>

        <x-button class="study-mode__start" variant="primary" radius="12" size="lg" type="button"
            data-study-start="basic">
            Начать
        </x-button>
    </div>

    <div class="study-mode__screen base-section" data-study-mode-screen="write" hidden>
        <x-button class="study-mode__back text text--small" tone="muted" size="noneSize" type="button" icon="arrow"
            icon-size="xs" data-study-mode-back>
            Назад
        </x-button>

        <div class="study-mode__header">
            <x-icon-box icon="edit" tone="orange" size="md" icon-size="sm" class="study-mode__header-icon" />

            <h4 class="heading heading--4">Письменный ответ</h4>

            <p class="study-mode__subtitle text text--small">
                Введите ответ по выбранной стороне карточки.
            </p>
        </div>

        <div class="study-mode__settings">
            <div class="study-mode__group">
                <h4 class="study-mode__group-title">
                    Что нужно написать?
                </h4>

                <label class="study-mode-option">
                    <input type="radio" name="write_answer_side" value="back" checked>
                    <span>Ответ / определение</span>
                </label>

                <label class="study-mode-option">
                    <input type="radio" name="write_answer_side" value="front">
                    <span>Вопрос / термин</span>
                </label>
            </div>
        </div>

        <x-button class="study-mode__start" variant="primary" radius="12" size="lg" type="button"
            data-study-start="write">
            Начать
        </x-button>
    </div>

    <div class="study-mode__screen base-section" data-study-mode-screen="audio" hidden>
        <x-button class="study-mode__back text text--small" tone="muted" size="noneSize" type="button"
            icon="arrow" icon-size="xs" data-study-mode-back>
            Назад
        </x-button>

        <div class="study-mode__header">
            <x-icon-box icon="volume" tone="blue" size="md" icon-size="sm"
                class="study-mode__header-icon" />

            <h4 class="heading heading--4">Аудио режим</h4>

            <p class="study-mode__subtitle text text--small">
                Прослушайте сторону карточки и введите ответ.
            </p>
        </div>

        <div class="study-mode__settings">
            <div class="study-mode__group">
                <h4 class="study-mode__group-title">
                    Что озвучивать?
                </h4>

                <label class="study-mode-option">
                    <input type="radio" name="audio_speak_side" value="front" checked>
                    <span>Вопрос / термин</span>
                </label>

                <label class="study-mode-option">
                    <input type="radio" name="audio_speak_side" value="back">
                    <span>Ответ / определение</span>
                </label>
            </div>

            <div class="study-mode__group">
                <h4 class="study-mode__group-title">
                    Что нужно написать после прослушивания?
                </h4>

                <label class="study-mode-option">
                    <input type="radio" name="audio_answer_side" value="back" checked>
                    <span>Ответ / определение</span>
                </label>

                <label class="study-mode-option">
                    <input type="radio" name="audio_answer_side" value="front">
                    <span>Вопрос / термин</span>
                </label>
            </div>

            <div class="study-mode__group" data-audio-fsrs-option hidden>
                <h4 class="study-mode__group-title">
                    Учитывать результат?
                </h4>

                <p class="study-mode__group-text text text--small">
                    Включите, если хотите, чтобы результат диктанта влиял на дату следующего повторения карточки.
                </p>

                <label class="study-mode-option">
                    <input type="checkbox" name="audio_use_fsrs" value="1" checked>
                    <span>Учитывать в повторениях</span>
                </label>
            </div>
        </div>

        <x-button class="study-mode__start" variant="primary" radius="12" size="lg" type="button"
            data-study-start="audio">
            Начать
        </x-button>
    </div>
</section>
