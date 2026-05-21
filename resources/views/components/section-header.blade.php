@props([
    'title',

    'buttonText' => null,
    'buttonClass' => null,
    'buttonHref' => null,
    'buttonType' => 'button',

    'buttonVariant' => 'primary',
    'buttonTone' => null,

    'buttonSize' => 'md',
    'buttonRadius' => 'circle',
    'buttonAlign' => null,

    'buttonIcon' => null,
    'buttonIconAfter' => 'plus',
    'buttonIconSize' => 'lg',

    'buttonIconOnly' => false,

    'buttonMobileIconOnly' => true,

    'buttonShadow' => true,
    'buttonDisabled' => false,

    'buttonSidebarOpen' => null,
])

@php
    $shouldShowButton = $buttonText || $buttonIconOnly;

    $resolvedIcon = $buttonIconOnly ? $buttonIcon ?? $buttonIconAfter : $buttonIcon;

    $resolvedIconAfter = $buttonIconOnly ? null : $buttonIconAfter;

    $resolvedMobileIconOnly = $buttonIconOnly ? false : $buttonMobileIconOnly;
@endphp

<section {{ $attributes->class(['section-header']) }}>
    <h3 class="heading heading--3">
        {{ $title }}
    </h3>

    @if ($shouldShowButton)
        <x-button :class="$buttonClass" :as="$buttonHref ? 'a' : 'button'" :href="$buttonHref" :type="$buttonHref ? null : $buttonType" :disabled="$buttonDisabled"
            :variant="$buttonVariant" :tone="$buttonTone" :size="$buttonSize" :radius="$buttonRadius" :align="$buttonAlign" :icon="$resolvedIcon"
            :icon-after="$resolvedIconAfter" :icon-size="$buttonIconSize" :icon-only="$buttonIconOnly" :mobile-icon-only="$resolvedMobileIconOnly" :shadow="$buttonShadow"
            :data-sidebar-sheet-open="$buttonSidebarOpen">
            @unless ($buttonIconOnly)
                {{ $buttonText }}
            @endunless
        </x-button>
    @endif
</section>
