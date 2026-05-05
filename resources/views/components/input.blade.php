@props([
    'type' => 'text',
    'name',
    'value' => null,
    'placeholder' => null,
    'status' => null, // null | error | success
    'message' => null,
    'clearable' => true,
    'shandow' => false,
])

@php
    $classes = collect(['input', $status ? "is-{$status}" : null])
        ->filter()
        ->implode(' ');
@endphp

<div class="{{ $classes }}">
    <div class="input__field">
        <input
            {{ $attributes->class(['input__control', 'shandow' => $shandow])->merge([
                'type' => $type,
                'name' => $name,
                'value' => old($name, $value),
                'placeholder' => $placeholder,
            ]) }}
            @if ($status === 'error') aria-invalid="true" @endif>

        @if ($clearable)
            <x-button class="input__clear" icon-only size="sm" icon-size="xxs" tone="muted " icon="close"></x-button>
        @endif

        @if ($status === 'success')
            <span class="input__status" aria-hidden="true">
                <x-icon id="check" size="xs" />
            </span>
        @endif
    </div>

    @if ($message)
        <p class="input__message">
            {{ $message }}
        </p>
    @endif
</div>
