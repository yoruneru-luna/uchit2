@props([
    'mode' => 'create', // create | edit
    'action' => '#',
    'method' => 'POST',

    'set' => null,

    'formAttributes' => [],

    'categories' => [
        ['value' => '', 'label' => 'Без категории', 'tone' => 'default'],
        ['value' => '1', 'label' => 'Еда и напитки', 'tone' => 'pink'],
        ['value' => '2', 'label' => 'Путешествия', 'tone' => 'blue'],
        ['value' => '3', 'label' => 'Грамматика', 'tone' => 'green'],
    ],

    'languages' => [['value' => '', 'label' => 'Без выбора'], ['value' => 'en', 'label' => 'Английский']],

    'accents' => [['value' => 'uk', 'label' => 'UK (Британский)'], ['value' => 'us', 'label' => 'US (Американский)']],

    'visibilityOptions' => [
        ['value' => 'private', 'label' => 'Личный (только для вас)'],
        ['value' => 'public', 'label' => 'Публичный'],
    ],

    'idPrefix' => null,
])

@php
    $isEdit = $mode === 'edit';

    $idPrefix = $idPrefix ?? ($isEdit ? 'edit-set' : 'create-set');

    $title = $isEdit ? 'Редактирование набора' : 'Создание набора';

    $subtitle = $isEdit ? 'Измените данные набора' : 'Создайте набор карточек, чтобы начать обучение';

    $submitText = $isEdit ? 'Сохранить изменения' : 'Создать набор';

    $fieldStatus = $isEdit ? 'success' : null;

    $titleValue = data_get($set, 'title');
    $descriptionValue = data_get($set, 'description');
    $categoryValue = data_get($set, 'category_id', '');
    $languageValue = data_get($set, 'language', '');
    $accentValue = data_get($set, 'accent', 'uk');
    $visibilityValue = data_get($set, 'visibility', 'private');

    $isEdit = $mode === 'edit';

    $formAttributeBag = new \Illuminate\View\ComponentAttributeBag($formAttributes);

    $title = $isEdit ? 'Редактирование набора' : 'Создание набора';
    $subtitle = $isEdit ? 'Измените данные набора' : 'Создайте набор карточек, чтобы начать обучение';
    $submitText = $isEdit ? 'Сохранить изменения' : 'Создать набор';

    $fieldStatus = $isEdit ? 'success' : null;
@endphp

<section class="base-section set-form">
    <div class="set-form__header">
        <h2 class="set-form__title heading heading--2">
            {{ $title }}
        </h2>

        <p class="set-form__subtitle subtitle subtitle--2">
            {{ $subtitle }}
        </p>
    </div>

    <form
        {{ $formAttributeBag->class(['set-form__form', 'base-section'])->merge([
            'action' => $action,
            'method' => 'POST',
        ]) }}>
        @csrf

        @if (strtoupper($method) !== 'POST')
            @method($method)
        @endif

        <x-form-field label="Название набора" for="{{ $idPrefix }}-title" required
            hint="Название должно отражать тему и содержание набора">
            <x-input id="{{ $idPrefix }}-title" name="title" :value="$titleValue" placeholder="Введите название набора"
                shadow :status="$errors->has('title') ? 'error' : $fieldStatus" :message="$errors->first('title')" />
        </x-form-field>

        <x-form-field label="Описание" for="{{ $idPrefix }}-description">
            <x-textarea-field id="{{ $idPrefix }}-description" name="description" :value="$descriptionValue" maxlength="200"
                placeholder="Кратко опишите, чему посвящен этот набор" shadow :status="$errors->has('description') ? 'error' : $fieldStatus" :message="$errors->first('description')" />
        </x-form-field>

        <x-form-field label="Категория" for="{{ $idPrefix }}-category">
            <x-category-select id="{{ $idPrefix }}-category" name="category_id" :selected="old('category_id', $categoryValue)"
                dropdown-mode="flow" shadow :status="$errors->has('category_id') ? 'error' : $fieldStatus" :message="$errors->first('category_id')" :options="$categories" />
        </x-form-field>

        <x-accordion title="Дополнительно" :open="$isEdit">
            <x-form-field label="Язык карточек (необязательно)" for="{{ $idPrefix }}-language"
                hint="Выберите язык, если нужен перевод, озвучка, транскрипция">
                <x-custom-select id="{{ $idPrefix }}-language" name="language" placeholder="Без выбора"
                    :selected="old('language', $languageValue)" dropdown-mode="flow" shadow :status="$errors->has('language') ? 'error' : $fieldStatus" :message="$errors->first('language')"
                    :options="[['value' => '', 'label' => 'Без выбора'], ['value' => 'en', 'label' => 'Английский']]" data-language-select />
            </x-form-field>

            <div class="set-form__language-dependent" data-language-dependent="en" hidden>
                <x-form-field label="Акцент" for="{{ $idPrefix }}-accent" required>
                    <x-custom-select id="{{ $idPrefix }}-accent" name="accent" :selected="old('accent', $accentValue)"
                        dropdown-mode="flow" shadow :status="$errors->has('accent') ? 'error' : $fieldStatus" :message="$errors->first('accent')" :options="[
                            ['value' => 'uk', 'label' => 'UK (Британский)'],
                            ['value' => 'us', 'label' => 'US (Американский)'],
                        ]" />
                </x-form-field>
            </div>

            <x-form-field label="Видимость набора" for="{{ $idPrefix }}-visibility"
                hint="Публичный набор увидят другие пользователи.">
                <x-custom-select id="{{ $idPrefix }}-visibility" name="visibility" :selected="old('visibility', $visibilityValue)"
                    dropdown-mode="flow" shadow :status="$errors->has('visibility') ? 'error' : $fieldStatus" :message="$errors->first('visibility')" :options="$visibilityOptions" />
            </x-form-field>
        </x-accordion>

        <x-button class="set-form__submit" variant="primary" radius="12" size="lg" type="submit">
            {{ $submitText }}
        </x-button>
    </form>
</section>
