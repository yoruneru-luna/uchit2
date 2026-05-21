@props([
    'id',
    'name',
    'options' => [],
    'selected' => '',
    'placeholder' => 'Без категории',
    'status' => null, // null | error | success
    'message' => null,
    'shadow' => false,
    'dropdownMode' => 'overlay', // overlay | flow
])

@php
    $selectId = $id;
    $listId = $selectId . '-list';

    $selectedOption = collect($options)->firstWhere('value', $selected);

    if (!$selectedOption) {
        $selectedOption = [
            'value' => '',
            'label' => $placeholder,
            'tone' => 'default',
        ];
    }

    $classes = collect(['category-select', "category-select--{$dropdownMode}", $status ? "is-{$status}" : null])
        ->filter()
        ->implode(' ');
@endphp

<div {{ $attributes->class([$classes]) }} data-custom-select>
    <input type="hidden" name="{{ $name }}" value="{{ $selectedOption['value'] }}" data-custom-select-input>

    <button class="category-select__button {{ $shadow ? 'shadow' : '' }}" id="{{ $selectId }}" type="button"
        aria-haspopup="listbox" aria-expanded="false" aria-controls="{{ $listId }}" data-custom-select-toggle
        @if ($status === 'error') aria-invalid="true" @endif>
        <span class="category-select__current">
            <span class="category-select__marker category-select__marker--{{ $selectedOption['tone'] ?? 'default' }}"
                data-custom-select-current-marker></span>

            <span class="category-select__current-label" data-custom-select-current-label>
                {{ $selectedOption['label'] }}
            </span>
        </span>

        <x-icon id="chevron" size="xs" class="category-select__chevron" />
    </button>

    <div class="category-select__dropdown shadow" id="{{ $listId }}" role="listbox"
        aria-labelledby="{{ $selectId }}" data-custom-select-dropdown hidden>
        @foreach ($options as $option)
            @php
                $isSelected = (string) $option['value'] === (string) $selectedOption['value'];
                $tone = $option['tone'] ?? 'default';
            @endphp

            <button class="category-select__option {{ $isSelected ? 'is-selected' : '' }}" type="button"
                role="option" aria-selected="{{ $isSelected ? 'true' : 'false' }}" data-custom-select-option
                data-value="{{ $option['value'] }}" data-label="{{ $option['label'] }}"
                data-tone="{{ $tone }}">
                <span class="category-select__option-main">
                    <span class="category-select__marker category-select__marker--{{ $tone }}"></span>

                    <span class="category-select__option-label">
                        {{ $option['label'] }}
                    </span>
                </span>

                <x-icon id="check" size="xxs" class="category-select__check" />
            </button>
        @endforeach
    </div>

    @if ($message)
        <p class="category-select__message">
            {{ $message }}
        </p>
    @endif
</div>
