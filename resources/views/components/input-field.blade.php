@props([
    'type' => 'text',
    'name' => null,
    'value' => null,
    'placeholder' => null,
    'clearable' => true,
    'shadow' => false,
    'icon' => null,
    'iconPosition' => 'right', // left | right
    'picker' => null,
    'variant' => 'default', // default | search
])

@php
    $classes = collect(['input-field', "input-field--{$variant}", $picker ? "input-field--{$picker}" : null])
        ->filter()
        ->implode(' ');
@endphp

<div {{ $attributes->class([$classes]) }}>
    <div class="input-field__inner">
        <input
            {{ $attributes->except('class')->class([
                    'input-field__control',
                    'shadow' => $shadow,
                    $icon ? "input-field__control--icon-{$iconPosition}" : null,
                    $clearable ? 'input-field__control--clearable' : null,
                ])->merge([
                    'type' => $type,
                    'name' => $name,
                    'value' => $type !== 'password' ? old($name, $value) : null,
                    'placeholder' => $placeholder,
                    'data-picker' => $picker,
                ]) }}>

        @if ($icon)
            <x-icon :id="$icon" size="xs" class="input-field__icon input-field__icon--{{ $iconPosition }}" />
        @endif

        @if ($clearable)
            <x-button class="input-field__clear" icon-only size="sm" icon-size="xxs" tone="muted" icon="close"
                type="button" />
        @endif
    </div>
</div>
