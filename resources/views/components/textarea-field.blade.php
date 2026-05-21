@props([
    'name',
    'id' => null,
    'value' => null,
    'placeholder' => null,
    'maxlength' => 200,
    'status' => null, // null | error | success
    'message' => null,
    'clearable' => true,
    'shadow' => false,
])

@php
    $textareaId = $id ?? $name;
    $counterId = $textareaId . '-counter';

    $currentValue = old($name, $value ?? '');

    $classes = collect(['textarea-field', $status ? "is-{$status}" : null])
        ->filter()
        ->implode(' ');
@endphp

<div {{ $attributes->class([$classes]) }}>
    <div class="textarea-field__box {{ $shadow ? 'shadow' : '' }}">
        <textarea class="textarea-field__control" id="{{ $textareaId }}" name="{{ $name }}"
            maxlength="{{ $maxlength }}" placeholder="{{ $placeholder }}" data-counter-input
            data-counter-target="{{ $counterId }}">{{ $currentValue }}</textarea>

        @if ($clearable)
            <x-button class="textarea-field__clear" icon-only size="sm" icon-size="xxs" tone="muted" icon="close"
                type="button" />
        @endif

        <span class="textarea-field__status" aria-hidden="true">
            <x-icon id="check" size="xs" />
        </span>

        <div class="textarea-field__footer">
            <span class="textarea-field__counter subtitle subtitle--3" id="{{ $counterId }}">
                {{ mb_strlen($currentValue) }}/{{ $maxlength }}
            </span>
        </div>
    </div>

    @if ($message)
        <p class="input__message">
            {{ $message }}
        </p>
    @endif
</div>
