@props([
    'mode' => 'default', // default | after-set
    'current' => 1,
    'required' => 5,
])

@php
    $progress = $required > 0 ? min(100, ($current / $required) * 100) : 0;
@endphp

<section class="card-form base-section">
    <h2 class="card-form__title heading heading--3">
        Добавление карточки
    </h2>

    @if ($mode === 'after-set')
        <div class="card-form__progress">
            <span class="card-form__progress-count text text--small">
                {{ $current }} из {{ $required }}
            </span>

            <span class="card-form__progress-line">
                <span class="card-form__progress-fill" style="width: {{ $progress }}%;"></span>
            </span>
        </div>
    @endif

    <form class="card-form__form base-section" action="#" method="POST">
        @csrf

        <x-form-field label="Сторона 1" for="card-front" required>
            <x-textarea-field id="card-front" name="front" maxlength="200" placeholder="Введите вопрос или термин"
                shadow />

            <div class="card-form__suggestions">
                <div class="card-form__suggestions-status">
                    <x-icon id="check" size="xs" class="card-form__suggestions-status-icon" />

                    <span class="card-form__suggestions-status-text text text--small">
                        Доступны варианты заполнения
                    </span>
                </div>

                <div class="card-form__suggestions-card shadow" data-card-suggestions>
                    <div class="card-form__suggestions-tabs-row" data-suggestions-tabs-row>
                        <div class="card-form__suggestions-tabs" role="tablist" aria-label="Варианты заполнения">
                            <button class="card-form__suggestions-tab is-active button" type="button" role="tab"
                                aria-selected="true" data-suggestions-tab="definitions">
                                <x-icon id="book" size="xs" class="card-form__suggestions-tab-icon" />

                                <span class="card-form__suggestions-tab-text subtitle subtitle--2">
                                    Определения
                                </span>
                            </button>

                            <button class="card-form__suggestions-tab button" type="button" role="tab"
                                aria-selected="false" data-suggestions-tab="terms">
                                <x-icon id="term" size="xs" class="card-form__suggestions-tab-icon" />

                                <span class="card-form__suggestions-tab-text subtitle subtitle--2">
                                    Термины
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

                        <x-button class="card-form__suggestions-nav card-form__suggestions-nav--next" iconOnly
                            icon="chevron" icon-size="xxs" tone="muted" size="sm" type="button"
                            data-suggestions-nav aria-label="Показать следующие вкладки" />
                    </div>

                    <div class="card-form__suggestions-panel is-active" data-suggestions-panel="definitions">
                        <div class="card-form__suggestions-list card-form__suggestions-list--definitions">
                            <label class="card-form__suggestion card-form__suggestion--definition">
                                <input class="card-form__suggestion-input" type="radio" name="definition_suggestion"
                                    value="definition_1" checked>

                                <span class="radio-view card-form__suggestion-radio"></span>

                                <span class="card-form__suggestion-content">
                                    <span class="card-form__suggestion-text text text--small">
                                        a round fruit red or green skin
                                    </span>

                                    <span class="card-form__suggestion-source text text--small">
                                        Источник: Oxford Dictionary
                                    </span>
                                </span>
                            </label>

                            <label class="card-form__suggestion card-form__suggestion--definition">
                                <input class="card-form__suggestion-input" type="radio" name="definition_suggestion"
                                    value="definition_2">

                                <span class="radio-view card-form__suggestion-radio"></span>

                                <span class="card-form__suggestion-content">
                                    <span class="card-form__suggestion-text text text--small">
                                        the round fruit of a tree of the rose family, which typically has thin green or
                                        red skin and crisp flesh
                                    </span>

                                    <span class="card-form__suggestion-source text text--small">
                                        Источник: Cambridge Dictionary
                                    </span>
                                </span>
                            </label>

                            <label class="card-form__suggestion card-form__suggestion--definition">
                                <input class="card-form__suggestion-input" type="radio"
                                    name="definition_suggestion" value="definition_3">

                                <span class="radio-view card-form__suggestion-radio"></span>

                                <span class="card-form__suggestion-content">
                                    <span class="card-form__suggestion-text text text--small">
                                        a common, round fruit produced by the tree Malus domestica, cultivated in
                                        temperate climates
                                    </span>

                                    <span class="card-form__suggestion-source text text--small">
                                        Источник: Merriam-Webster
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div class="card-form__suggestions-panel" data-suggestions-panel="terms" hidden>
                        <div class="card-form__suggestions-list card-form__suggestions-list--media">
                            <label class="card-form__suggestion card-form__suggestion--media">
                                <input class="card-form__suggestion-input" type="radio" name="term_suggestion"
                                    value="apple" checked>

                                <span class="radio-view card-form__suggestion-radio"></span>

                                <span class="card-form__suggestion-content">
                                    <span class="card-form__suggestion-text text text--small">
                                        apple
                                    </span>
                                </span>

                                <x-button class="card-form__suggestion-action" iconOnly icon="rotate" icon-size="xs"
                                    tone="muted" size="sm" type="button" aria-label="Обновить вариант" />

                                <span class="card-form__suggestion-image">
                                    <img src="{{ asset('images/apple-example.png') }}" alt="apple">
                                </span>
                            </label>

                            <label class="card-form__suggestion card-form__suggestion--media">
                                <input class="card-form__suggestion-input" type="radio" name="term_suggestion"
                                    value="apple_tree">

                                <span class="radio-view card-form__suggestion-radio"></span>

                                <span class="card-form__suggestion-content">
                                    <span class="card-form__suggestion-text text text--small">
                                        apple tree
                                    </span>
                                </span>

                                <x-button class="card-form__suggestion-action" iconOnly icon="rotate" icon-size="xs"
                                    tone="muted" size="sm" type="button" aria-label="Обновить вариант" />

                                <span class="card-form__suggestion-image">
                                    <img src="{{ asset('images/apple-example.png') }}" alt="apple tree">
                                </span>
                            </label>
                        </div>
                    </div>

                    <div class="card-form__suggestions-panel" data-suggestions-panel="pronunciation" hidden>
                        <div class="card-form__suggestions-list card-form__suggestions-list--pronunciation">
                            <label class="card-form__suggestion card-form__suggestion--pronunciation">
                                <input class="card-form__suggestion-input" type="radio"
                                    name="pronunciation_suggestion" value="uk" checked>

                                <span class="radio-view card-form__suggestion-radio"></span>

                                <span class="card-form__suggestion-accent text text--small">
                                    UK

                                    <x-button class="card-form__suggestion-sound" iconOnly icon="volume"
                                        icon-size="xs" tone="muted" size="sm" type="button"
                                        aria-label="Прослушать UK произношение" />
                                </span>

                                <span class="card-form__suggestion-transcription text text--small">
                                    /ˈæp.əl/
                                </span>
                            </label>

                            <label class="card-form__suggestion card-form__suggestion--pronunciation">
                                <input class="card-form__suggestion-input" type="radio"
                                    name="pronunciation_suggestion" value="us">

                                <span class="radio-view card-form__suggestion-radio"></span>

                                <span class="card-form__suggestion-accent text text--small">
                                    US

                                    <x-button class="card-form__suggestion-sound" iconOnly icon="volume"
                                        icon-size="xs" tone="muted" size="sm" type="button"
                                        aria-label="Прослушать US произношение" />
                                </span>

                                <span class="card-form__suggestion-transcription text text--small">
                                    /ˈæp.əl/
                                </span>
                            </label>
                        </div>
                    </div>

                    <div class="card-form__suggestions-panel" data-suggestions-panel="hints" hidden>
                        <div class="card-form__suggestions-list card-form__suggestions-list--simple">
                            <label class="card-form__suggestion card-form__suggestion--simple">
                                <input class="card-form__suggestion-input" type="radio" name="hint_suggestion"
                                    value="fruit" checked>

                                <span class="radio-view card-form__suggestion-radio"></span>

                                <span class="card-form__suggestion-text text text--small">
                                    Фрукт
                                </span>
                            </label>

                            <label class="card-form__suggestion card-form__suggestion--simple">
                                <input class="card-form__suggestion-input" type="radio" name="hint_suggestion"
                                    value="starts_with_a">

                                <span class="radio-view card-form__suggestion-radio"></span>

                                <span class="card-form__suggestion-text text text--small">
                                    Начинается на букву A
                                </span>
                            </label>
                        </div>
                    </div>

                    <div class="card-form__suggestions-panel" data-suggestions-panel="markers" hidden>
                        <div class="card-form__suggestions-chips">
                            <label class="card-form__suggestion-chip">
                                <input class="card-form__suggestion-input" type="radio" name="marker_suggestion"
                                    value="noun" checked>

                                <span class="radio-view card-form__suggestion-radio"></span>
                                <span>noun</span>
                            </label>

                            <label class="card-form__suggestion-chip">
                                <input class="card-form__suggestion-input" type="radio" name="marker_suggestion"
                                    value="A1">

                                <span class="radio-view card-form__suggestion-radio"></span>
                                <span>A1</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

        </x-form-field>

        <x-form-field label="Сторона 2" for="card-back" required>
            <x-textarea-field id="card-back" name="back" maxlength="200"
                placeholder="Введите ответ или определение" shadow />
        </x-form-field>

        <x-accordion title="Дополнительно">
            <x-form-field label="Подсказка" for="card-hint"
                hint="Подсказка поможет вспомнить ответ, но не заменяет его.">
                <x-input id="card-hint" name="hint" placeholder="Введите подсказку" shadow />
            </x-form-field>

            <x-form-field label="Пример" for="card-back">
                <x-textarea-field id="card-back" name="example" maxlength="200"
                    placeholder="Введите пример применения" shadow />
            </x-form-field>

            <x-form-field label="Транскрипция" for="card-transcripion">
                <x-input id="card-transcripion" name="transcripion" placeholder="Введите транскипцию" shadow />
            </x-form-field>

            <x-form-field label="Маркер" for="card-marker" hint="Используется, если у слова несколько значений.">
                <x-input id="card-marker" name="marker" placeholder="Лук, как еда или оружие" shadow />
            </x-form-field>

            <x-button radius="12" size="sm" icon="image" icon-size="sm"
                description="JPG, PNG, WEBP не более 5 МБ" class="text text--small">
                Добавить изображение
            </x-button>
        </x-accordion>

        <x-button class="card-form__submit" variant="primary" radius="12" size="lg" type="submit">
            Добавить карточку
        </x-button>
    </form>
</section>
