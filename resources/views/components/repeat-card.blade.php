@props([
    'state' => 'due', // due | empty | onboarding
    'repeatCount' => 0,
    'repeatHref' => '#',
    'createHref' => '#',
])

@php
    $config = match ($state) {
        'due' => [
            'icon' => 'bell-ring',
            'ringing' => true,
            'title' => 'Пора повторять!',
            'subtitle' => "{$repeatCount} карточек на грани забывания",
            'buttonText' => 'Повторить',
            'buttonHref' => $repeatHref,
            'buttonDisabled' => false,
        ],
        'empty' => [
            'icon' => 'bell-off',
            'ringing' => false,
            'title' => 'Пока повторять нечего',
            'subtitle' => 'Следующие повторения появятся позже',
            'buttonText' => 'Повторить',
            'buttonHref' => null,
            'buttonDisabled' => true,
        ],
        'onboarding' => [
            'icon' => 'bell-off',
            'ringing' => false,
            'title' => 'Пока повторять нечего',
            'subtitle' => 'Система автоматически планирует повторения для лучшего запоминания',
            'buttonText' => 'Создать первый набор',
            'buttonHref' => $createHref,
            'buttonDisabled' => false,
        ],
        default => [
            'icon' => 'bell-off',
            'ringing' => false,
            'title' => 'Пока повторять нечего',
            'subtitle' => 'Создайте первый набор, и мы распланируем повторения',
            'buttonText' => 'Создать набор',
            'buttonHref' => $createHref,
            'buttonDisabled' => false,
        ],
    };
@endphp

<section {{ $attributes->class(['repeat-card', 'shadow']) }}>
    <div class="repeat-card__header">
        <x-icon :id="$config['icon']" size="xl"
            class="repeat-card__icon {{ $config['ringing'] ? 'repeat-card__icon--ringing' : '' }}" />

        <div class="repeat-card__content">
            <h3 class="repeat-card__title">
                {{ $config['title'] }}
            </h3>

            <p class="repeat-card__subtitle subtitle subtitle--2">
                {{ $config['subtitle'] }}
            </p>
        </div>
    </div>

    @if ($state === 'due')
        <x-button class="repeat-card__button" as="button" type="button" variant="primary" radius="12" size="lg"
            icon-after="arrow" icon-size="md" data-start-due-review>
            {{ $config['buttonText'] }}
        </x-button>
    @elseif ($state === 'onboarding')
        <x-button class="repeat-card__button" as="button" type="button" variant="primary" radius="12"
            size="lg" icon-after="arrow" icon-size="md" data-create-set-open>
            {{ $config['buttonText'] }}
        </x-button>
    @else
        <x-button class="repeat-card__button" as="button" type="button" variant="primary" radius="12"
            size="lg" icon-size="md" disabled>
            {{ $config['buttonText'] }}
        </x-button>
    @endif
</section>
