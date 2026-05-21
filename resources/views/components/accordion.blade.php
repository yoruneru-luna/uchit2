@props([
    'title' => 'Дополнительно',
    'open' => false,
    'id' => null,
    'shadow' => true,
])

@php
    $accordionId = $id ?? 'accordion-' . uniqid();
    $panelId = $accordionId . '-panel';
@endphp

<div {{ $attributes->class(['accordion', $shadow ? 'shadow' : '' ]) }} data-accordion>
    <button class="accordion__toggle button" type="button" data-accordion-toggle
        aria-expanded="{{ $open ? 'true' : 'false' }}" aria-controls="{{ $panelId }}">
        <span class="accordion__title">
            {{ $title }}
        </span>

        <x-icon id="chevron" size="xs" class="accordion__icon" />
    </button>

    <div class="accordion__panel" id="{{ $panelId }}" data-accordion-panel
        aria-hidden="{{ $open ? 'false' : 'true' }}">
        <div class="accordion__inner">
            {{ $slot }}
        </div>
    </div>
</div>
