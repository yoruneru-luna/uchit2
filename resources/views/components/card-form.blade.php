@props([
    'mode' => 'default', // default | after-set
    'current' => 1,
    'required' => 5,

    'action' => '#',
    'method' => 'POST',

    'formAttributes' => [],

    'idPrefix' => 'card',
])

@php
    $progress = $required > 0 ? min(100, ($current / $required) * 100) : 0;

    $formAttributeBag = new \Illuminate\View\ComponentAttributeBag($formAttributes);
@endphp

<section class="card-form base-section">
    <h2 class="card-form__title heading heading--3">
        Добавление карточки
    </h2>

    <p class="card-form__set-title text text--small" data-card-form-set-title hidden></p>

    <form
        {{ $formAttributeBag->class(['card-form__form', 'base-section', 'shadow-safe'])->merge([
            'action' => $action,
            'method' => 'POST',
            'enctype' => 'multipart/form-data',
        ]) }}>
        @csrf

        @if (strtoupper($method) !== 'POST')
            @method($method)
        @endif


    <div class="card-form__progress shadow" data-card-progress hidden>
        <div class="card-form__progress-header">
            <span class="card-form__progress-title text text--small">
                Минимум для начала повторения
            </span>

            <span class="card-form__progress-count text text--small" data-card-progress-count>
                0 из 5
            </span>
        </div>

        <span class="card-form__progress-line">
            <span class="card-form__progress-fill" data-card-progress-fill style="width: 0%;"></span>
        </span>

        <p class="card-form__progress-text text text--small" data-card-progress-text>
            Добавьте ещё 5 карточек, чтобы набор был готов к повторению.
        </p>
    </div>

        <input type="hidden" name="study_set_id" data-card-set-id>
        <input type="hidden" name="selected_image_url" data-selected-image-url>
        <input type="hidden" name="remove_image" value="0" data-remove-image>

        <x-form-field label="Сторона 1" for="card-front" required>
            <x-textarea-field id="card-front" name="front" maxlength="500" placeholder="Введите вопрос или термин"
                shadow />

            <div class="card-form__suggestions" data-card-suggestions-wrap hidden>
                <div class="card-form__suggestions-status">
                    <x-icon id="check" size="xs" class="card-form__suggestions-status-icon" />

                    <span class="card-form__suggestions-status-text text text--small" data-card-suggestions-status>
                        Доступны варианты заполнения
                    </span>
                </div>

                <div class="card-form__suggestions-card shadow" data-card-suggestions>
                    <div class="card-form__suggestions-tabs-row" data-suggestions-tabs-row>

                        <div class="card-form__suggestions-tabs" role="tablist" aria-label="Варианты заполнения">
                            <button class="card-form__suggestions-tab button" type="button" role="tab"
                                aria-selected="false" data-suggestions-tab="terms">
                                <x-icon id="term" size="xs" class="card-form__suggestions-tab-icon" />

                                <span class="card-form__suggestions-tab-text subtitle subtitle--2">
                                    Термины
                                </span>
                            </button>

                            <button class="card-form__suggestions-tab is-active button" type="button" role="tab"
                                aria-selected="true" data-suggestions-tab="definitions">
                                <x-icon id="book" size="xs" class="card-form__suggestions-tab-icon" />

                                <span class="card-form__suggestions-tab-text subtitle subtitle--2">
                                    Определения
                                </span>
                            </button>

                            <button class="card-form__suggestions-tab button" type="button" role="tab"
                                aria-selected="false" data-suggestions-tab="pronunciation">
                                <x-icon id="sound" size="xs" class="card-form__suggestions-tab-icon" />

                                <span class="card-form__suggestions-tab-text subtitle subtitle--2">
                                    Транскрипция
                                </span>
                            </button>

                            <button class="card-form__suggestions-tab button" type="button" role="tab"
                                aria-selected="false" data-suggestions-tab="examples">
                                <x-icon id="example" size="xs" class="card-form__suggestions-tab-icon" />

                                <span class="card-form__suggestions-tab-text subtitle subtitle--2">
                                    Примеры
                                </span>
                            </button>

                            <button class="card-form__suggestions-tab button" type="button" role="tab"
                                aria-selected="false" data-suggestions-tab="hints">
                                <x-icon id="simple" size="xs" class="card-form__suggestions-tab-icon" />

                                <span class="card-form__suggestions-tab-text subtitle subtitle--2">
                                    Подсказка
                                </span>
                            </button>

                            <button class="card-form__suggestions-tab button" type="button" role="tab"
                                aria-selected="false" data-suggestions-tab="markers">
                                <x-icon id="example" size="xs" class="card-form__suggestions-tab-icon" />

                                <span class="card-form__suggestions-tab-text subtitle subtitle--2">
                                    Маркеры
                                </span>
                            </button>
                        </div>

                    </div>

                    <div class="card-form__suggestions-panel is-active" data-suggestions-panel="definitions">
                        <div class="card-form__suggestions-list card-form__suggestions-list--definitions"
                            data-suggestions-list="definitions"></div>
                    </div>

                    <div class="card-form__suggestions-panel" data-suggestions-panel="terms" hidden>
                        <div class="card-form__suggestions-list card-form__suggestions-list--media"
                            data-suggestions-list="terms"></div>
                    </div>

                    <div class="card-form__suggestions-panel" data-suggestions-panel="pronunciation" hidden>
                        <div class="card-form__suggestions-list card-form__suggestions-list--pronunciation"
                            data-suggestions-list="pronunciation"></div>
                    </div>

                    <div class="card-form__suggestions-panel" data-suggestions-panel="examples" hidden>
                        <div class="card-form__suggestions-list card-form__suggestions-list--simple"
                            data-suggestions-list="examples"></div>
                    </div>

                    <div class="card-form__suggestions-panel" data-suggestions-panel="hints" hidden>
                        <div class="card-form__suggestions-list card-form__suggestions-list--simple"
                            data-suggestions-list="hints"></div>
                    </div>

                    <div class="card-form__suggestions-panel" data-suggestions-panel="markers" hidden>
                        <div class="card-form__suggestions-chips" data-suggestions-list="markers"></div>
                    </div>
                </div>
            </div>

        </x-form-field>

        <x-form-field label="Сторона 2" for="card-back" required>
            <x-textarea-field id="card-back" name="back" maxlength="500"
                placeholder="Введите ответ или определение" shadow />
        </x-form-field>

        <x-accordion title="Дополнительно">
            <div data-card-language-only hidden>
                <x-form-field label="Транскрипция" for="{{ $idPrefix }}-transcription">
                    <x-input id="{{ $idPrefix }}-transcription" name="transcription"
                        placeholder="Введите транскрипцию" shadow />
                </x-form-field>
            </div>

            <x-form-field label="Пример" for="card-example">
                <x-textarea-field id="card-example" name="example" maxlength="200"
                    placeholder="Введите пример применения" shadow />
            </x-form-field>

            <x-form-field label="Подсказка" for="card-hint"
                hint="Подсказка поможет вспомнить ответ, но не заменяет его.">
                <x-input id="card-hint" name="hint" placeholder="Введите подсказку" shadow />
            </x-form-field>

            <x-form-field label="Маркер" for="card-marker" hint="Используется, если у слова несколько значений.">
                <x-input id="card-marker" name="marker" placeholder="Лук, как еда или оружие" shadow />
            </x-form-field>

            <x-form-field label="Изображение" for="{{ $idPrefix }}-image">
                <div class="card-form__image-field" data-card-image-field>
                    <label
                        class="card-form__image-upload button button--image button--sm button--radius-12 text text--small"
                        data-card-image-upload>
                        <input class="card-form__image-input" id="{{ $idPrefix }}-image" name="image"
                            type="file" accept="image/jpeg,image/png,image/webp" data-card-image-input>

                        <span class="button__inner">
                            <x-icon id="image" size="sm" class="button__icon" />

                            <span class="button__text">
                                Добавить изображение
                            </span>

                            <span class="button__description">
                                JPG, PNG или WEBP до 5 МБ
                            </span>
                        </span>
                    </label>

                    <div class="card-form__image-preview shadow" data-card-image-preview hidden>
                        <img class="card-form__image-preview-img" src="" alt="Выбранное изображение"
                            data-card-image-preview-img>

                        <div class="card-form__image-actions">
                            <x-button class="card-form__image-action text text--small" tone="ghost" radius="12"
                                size="sm" type="button" icon="image" icon-size="sm" data-card-image-change>
                                Заменить
                            </x-button>

                            <x-button class="card-form__image-action text text--small" tone="danger-ghost"
                                radius="12" size="sm" type="button" icon="trash" icon-size="sm"
                                data-card-image-remove>
                                Удалить
                            </x-button>
                        </div>
                    </div>
                </div>
            </x-form-field>
        </x-accordion>

        <x-button class="card-form__submit" variant="primary" radius="12" size="lg" type="submit">
            Добавить карточку
        </x-button>
    </form>
</section>
