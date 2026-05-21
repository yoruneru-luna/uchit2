@props([
    'id',
    'name',
    'options' => [],
    'selected' => '',
    'placeholder' => 'Без выбора',
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
            'icon' => null,
        ];
    }

    $classes = collect(['custom-select', "custom-select--{$dropdownMode}", $status ? "is-{$status}" : null])
        ->filter()
        ->implode(' ');
@endphp

<div {{ $attributes->class([$classes]) }} data-custom-select>
    <input type="hidden" name="{{ $name }}" value="{{ $selectedOption['value'] }}" data-custom-select-input>

    <button class="custom-select__button {{ $shadow ? 'shadow' : '' }}" id="{{ $selectId }}" type="button"
        aria-haspopup="listbox" aria-expanded="false" aria-controls="{{ $listId }}" data-custom-select-toggle
        @if ($status === 'error') aria-invalid="true" @endif>
        <span class="custom-select__current">
            @if (!empty($selectedOption['icon']))
                <x-icon :id="$selectedOption['icon']" size="xs" class="custom-select__current-icon"
                    data-custom-select-current-icon />
            @endif

            <span class="custom-select__current-label" data-custom-select-current-label>
                {{ $selectedOption['label'] }}
            </span>
        </span>

        <x-icon id="chevron" size="xs" class="custom-select__chevron" />
    </button>

    <div class="custom-select__dropdown shadow" id="{{ $listId }}" role="listbox"
        aria-labelledby="{{ $selectId }}" data-custom-select-dropdown hidden>
        @foreach ($options as $option)
            @php
                $isSelected = (string) $option['value'] === (string) $selectedOption['value'];
            @endphp

            <button class="custom-select__option {{ $isSelected ? 'is-selected' : '' }}" type="button" role="option"
                aria-selected="{{ $isSelected ? 'true' : 'false' }}" data-custom-select-option
                data-value="{{ $option['value'] }}" data-label="{{ $option['label'] }}"
                data-icon="{{ $option['icon'] ?? '' }}">
                <span class="custom-select__option-main">
                    @if (!empty($option['icon']))
                        <x-icon :id="$option['icon']" size="xs" class="custom-select__option-icon" />
                    @endif

                    <span class="custom-select__option-label">
                        {{ $option['label'] }}
                    </span>
                </span>

                <x-icon id="check" size="xxs" class="custom-select__check" />
            </button>
        @endforeach
    </div>

    @if ($message)
        <p class="custom-select__message">
            {{ $message }}
        </p>
    @endif
</div>
