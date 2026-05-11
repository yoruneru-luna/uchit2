@props([
    'icon',
    'tone' => null, // purple | blue | pink | teal | orange | green
    'size' => 'md', // sm | md
    'iconSize' => 'sm',
])

@php
    $classes = collect(['icon-box', "icon-box--{$size}", $tone ? "icon-box--{$tone}" : null])
        ->filter()
        ->implode(' ');
@endphp

<div {{ $attributes->class([$classes]) }}>
    <x-icon :id="$icon" :size="$iconSize" class="icon-box__icon" />
</div>
