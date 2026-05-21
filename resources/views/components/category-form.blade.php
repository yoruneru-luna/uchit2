@props([
    'mode' => 'create', // create | edit
    'action' => '#',
    'method' => 'POST',

    'category' => null,

    'formAttributes' => [],

    'idPrefix' => null,
])

@php
    $isEdit = $mode === 'edit';

    $idPrefix = $idPrefix ?? ($isEdit ? 'edit-category' : 'create-category');

    $title = $isEdit ? 'Редактирование категории' : 'Создание категории';

    $subtitle = $isEdit ? 'Измените данные категории' : 'Создайте категорию для группировки наборов';

    $submitText = $isEdit ? 'Сохранить изменения' : 'Создать категорию';

    $fieldStatus = $isEdit ? 'success' : null;

    $titleValue = data_get($category, 'title');
    $descriptionValue = data_get($category, 'description');
    $colorValue = old('color', data_get($category, 'color'));
    $hasColor = old('has_color', $colorValue ? '1' : null);

    $formAttributeBag = new \Illuminate\View\ComponentAttributeBag($formAttributes);
@endphp

<section class="base-section category-form">
    <div class="category-form__header">
        <h2 class="category-form__title heading heading--2">
            {{ $title }}
        </h2>

        <p class="category-form__subtitle subtitle subtitle--2">
            {{ $subtitle }}
        </p>
    </div>

    <form
        {{ $formAttributeBag->class(['category-form__form', 'base-section'])->merge([
            'action' => $action,
            'method' => 'POST',
        ]) }}>
        @csrf

        @if (strtoupper($method) !== 'POST')
            @method($method)
        @endif

        <x-form-field label="Название категории" for="{{ $idPrefix }}-title" required>
            <x-input id="{{ $idPrefix }}-title" name="title" :value="$titleValue"
                placeholder="Введите название категории" shadow :status="$errors->has('title') ? 'error' : $fieldStatus" :message="$errors->first('title')" />
        </x-form-field>

        <x-form-field label="Описание" for="{{ $idPrefix }}-description">
            <x-textarea-field id="{{ $idPrefix }}-description" name="description" :value="$descriptionValue" maxlength="200"
                placeholder="Кратко опишите, какие наборы будут в категории" shadow :status="$errors->has('description') ? 'error' : $fieldStatus"
                :message="$errors->first('description')" />
        </x-form-field>

        <x-form-field label="Цвет категории" for="{{ $idPrefix }}-color"
            hint="Цвет поможет быстрее отличать категории в списке. Можно оставить без цвета.">
            <div class="category-form__color-field shadow" data-color-field>
                <label class="category-form__color-check">
                    <input class="category-form__color-checkbox" type="checkbox" name="has_color" value="1"
                        data-color-toggle @checked($hasColor)>

                    <span class="radio-view radio-view--lg category-form__color-checkbox-view"></span>

                    <span class="category-form__color-check-text">
                        Использовать цвет
                    </span>
                </label>

                <div class="category-form__color-control">
                    <input class="category-form__color-input" id="{{ $idPrefix }}-color" name="color"
                        type="color" value="{{ $colorValue ?: '#f3cedd' }}" data-color-input
                        @disabled(!$hasColor)>

                    <span class="category-form__color-value" data-color-value>
                        {{ $hasColor ? ($colorValue ?: '#f3cedd') : 'Без цвета' }}
                    </span>
                </div>
            </div>

            @if ($errors->has('color'))
                <p class="category-form__message">
                    {{ $errors->first('color') }}
                </p>
            @endif
        </x-form-field>

        <x-button class="category-form__submit" variant="primary" radius="12" size="lg" type="submit">
            {{ $submitText }}
        </x-button>
    </form>
</section>
