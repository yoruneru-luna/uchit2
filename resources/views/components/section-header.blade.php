@props([
    'title',
    'buttonText' => null,
    'buttonClass' => null,
    'buttonHref' => null,
    'buttonType' => 'button',
    'buttonVariant' => 'primary',
    'buttonRadius' => 'circle',
    'buttonSize' => 'md',
    'buttonIconAfter' => 'plus',
    'buttonIconSize' => 'lg',
    'buttonMobileIconOnly' => true,
    'buttonShadow' => true,
])

<section {{ $attributes->class(['section-header']) }}>
    <h3 class="heading heading--3">
        {{ $title }}
    </h3>

    @if ($buttonText)
        <x-button
            :class="$buttonClass"
            :as="$buttonHref ? 'a' : 'button'"
            :href="$buttonHref"
            :type="$buttonHref ? null : $buttonType"
            :shadow="$buttonShadow"
            :mobile-icon-only="$buttonMobileIconOnly"
            :variant="$buttonVariant"
            :radius="$buttonRadius"
            :size="$buttonSize"
            :icon-after="$buttonIconAfter"
            :icon-size="$buttonIconSize"
        >
            {{ $buttonText }}
        </x-button>
    @endif
</section>
