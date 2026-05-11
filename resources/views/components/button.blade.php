@props([
    'as' => 'button', // button | a
    'type' => 'button',

    'href' => null,
    'disabled' => false,

    'variant' => null,
    'tone' => null,

    'size' => null,
    'radius' => null,

    'align' => null,

    'icon' => null,
    'iconAfter' => null,
    'iconSize' => 'xs',

    'iconOnly' => false,
    'mobileIconOnly' => false,

    'description' => null,

    'class' => '',

    'shadow' => false,
])

@php
    $classes = collect([
        'button',

        $variant ? "button--{$variant}" : null,
        $tone ? "button--{$tone}" : null,

        $size ? "button--{$size}" : null,
        $radius ? "button--radius-{$radius}" : null,

        $align ? "button--align-{$align}" : null,

        $iconOnly ? 'button--icon' : null,
        $mobileIconOnly ? 'button--mobile-icon-only' : null,
        $description ? 'button--image' : null,

        $disabled ? 'is-disabled' : null,

        $class,
    ])
        ->filter()
        ->implode(' ');
@endphp

@if ($as === 'a')
    <a href="{{ $disabled ? '#' : $href }}" {{ $attributes->merge(['class' => $classes]) }}>
    @else
        <button type="{{ $type }}" @if ($disabled) disabled @endif
            {{ $attributes->merge(['class' => $classes]) }}>
@endif

<div class="button__inner {{ $shadow ? 'shadow' : '' }}">
    @if ($icon)
        <x-icon :id="$icon" :size="$iconSize" class="button__icon" />
    @endif

    @if (trim($slot) !== '')
        <span class="button__text">
            {{ $slot }}
        </span>
    @endif

    @if ($description)
        <span class="button__description">
            {{ $description }}
        </span>
    @endif

    @if ($iconAfter)
        <x-icon :id="$iconAfter" :size="$iconSize" class="button__icon" />
    @endif
</div>

@if ($as === 'a')
    </a>
@else
    </button>
@endif
