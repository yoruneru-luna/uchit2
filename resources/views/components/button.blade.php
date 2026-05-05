@props([
    'as' => 'button', // button | a
    'type' => 'button',

    'href' => null,
    'disabled' => false,

    'variant' => null,
    'tone' => null,

    'size' => null,
    'radius' => null,

    'icon' => null,
    'iconAfter' => null,
    'iconSize' => 'xs',

    'iconOnly' => false,

    'description' => null,

    'class' => '',

    'shandow' => false,
])

@php
    $classes = collect([
        'button',

        $variant ? "button--{$variant}" : null,
        $tone ? "button--{$tone}" : null,

        $size ? "button--{$size}" : null,
        $radius ? "button--radius-{$radius}" : null,

        $iconOnly ? 'button--icon' : null,
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

<div class="button__inner {{ $shandow ? 'shandow' : '' }}">

    @if ($icon)
        <x-icon :id="$icon" :size="$iconSize" class="button__icon" />
    @endif

    @if (trim($slot) !== '')
        <span class="button__text">
            {{ $slot }}
        </span>
    @endif

    @if ($description)
        <spaan class="button__text">
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
