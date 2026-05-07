@props([
    'type' => 'text',
    'name',
    'value' => null,
    'placeholder' => null,
    'status' => null, // null | error | success
    'message' => null,
    'clearable' => true,
    'shadow' => false,
    'icon' => null,
    'picker' => null, // null | dateА
])

@php
    $classes = collect(['input', $status ? "is-{$status}" : null, $picker ? "input--{$picker}" : null])
        ->filter()
        ->implode(' ');
@endphp

<div class="{{ $classes }}">
    <div class="input__field">
        <input
            {{ $attributes->class(['input__control', 'shadow' => $shadow])->merge([
                'type' => $type,
                'name' => $name,
                'value' => $type !== 'password' ? old($name, $value) : null,
                'placeholder' => $placeholder,
                'data-picker' => $picker,
            ]) }}
            @if ($status === 'error') aria-invalid="true" @endif>

        @if ($clearable)
            <x-button class="input__clear" icon-only size="sm" icon-size="xxs" tone="muted" icon="close"
                type="button" />
        @endif

        @if ($icon && $status !== 'success')
            <x-icon :id="$icon" size="xs" class="input__icon" />
        @endif

        <span class="input__status" aria-hidden="true">
            <x-icon id="check" size="xs" />
        </span>
    </div>

    <p class="input__message">
        {{ $message }}
    </p>
</div>
