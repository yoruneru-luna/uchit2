@props([
    'state' => 'active', // active | paused | expiring
    'expanded' => false,
])

@php
    $config = match ($state) {
        'active' => [
            'toneClass' => 'subscription-card--active',
            'iconTone' => 'purple',
            'title' => 'Подписка PRO',
            'subtitle1' => 'Активна до 24 мая 2026',
            'subtitle2' => 'Пользуйтесь всеми возможностями.',
            'features' => [
                ['text' => 'Неограниченные наборы', 'available' => true],
                ['text' => 'Без рекламы', 'available' => true],
            ],
            'priceLabel' => 'Следующее списание:',
            'priceValue' => '24 мая 2026 · 299 ₽',
            'buttonText' => 'Продлить за 299 ₽',
            'buttonVariant' => 'primary',
            'note1' => 'Безопасная оплата через ЮKassa',
            'note2' => 'Нажимая “Продлить”, вы переходите на сайт ЮKassa для безопасной оплаты.',
        ],

        'paused' => [
            'toneClass' => 'subscription-card--paused',
            'iconTone' => 'danger',
            'title' => 'Подписка PRO',
            'subtitle1' => 'Подписка истекает 24 мая 2026',
            'subtitle2' => 'Часть возможностей недоступна.',
            'features' => [
                ['text' => 'Неограниченные наборы', 'available' => false],
                ['text' => 'Без рекламы', 'available' => false],
            ],
            'priceLabel' => '',
            'priceValue' => '',
            'buttonText' => 'Возобновить за 299 ₽',
            'buttonVariant' => 'danger',
            'note1' => 'Безопасная оплата через ЮKassa',
            'note2' => 'Нажимая “Продлить”, вы переходите на сайт ЮKassa для безопасной оплаты.',
        ],

        'expiring' => [
            'toneClass' => 'subscription-card--expiring',
            'iconTone' => 'orange',
            'title' => 'Подписка PRO',
            'subtitle1' => 'Истекает через 3 дня · 24 мая 2026',
            'subtitle2' => 'Пользуйтесь всеми возможностями.',
            'features' => [
                ['text' => 'Неограниченные наборы', 'available' => true],
                ['text' => 'Без рекламы', 'available' => true],
            ],
            'priceLabel' => 'Следующее списание:',
            'priceValue' => '24 мая 2026 · 299 ₽',
            'buttonText' => 'Продлить за 299 ₽',
            'buttonVariant' => 'warning',
            'note1' => 'Безопасная оплата через ЮKassa',
            'note2' => 'Нажимая “Продлить”, вы переходите на сайт ЮKassa для безопасной оплаты.',
        ],

        default => [
            'toneClass' => 'subscription-card--active',
            'iconTone' => 'purple',
            'title' => 'Подписка PRO',
            'subtitle1' => 'Откройте все возможности веб-приложения',
            'subtitle2' => '',
            'features' => [
                ['text' => 'Неограниченные наборы', 'available' => true],
                ['text' => 'Без рекламы', 'available' => true],
            ],
            'priceLabel' => '1 месяц за 0 ₽, затем 299 ₽/мес',
            'priceValue' => '',
            'buttonText' => 'Попробовать бесплатно',
            'buttonVariant' => 'primary',
            'note1' => 'Безопасная оплата через ЮKassa',
            'note2' => 'Нажимая “Продлить”, вы переходите на сайт ЮKassa для безопасной оплаты.',
        ],
    };

    $panelId = 'subscription-panel-' . uniqid();
@endphp

<div {{ $attributes->class(['subscription-card', $config['toneClass'], 'shadow']) }} data-subscription>
    <button class="subscription-card__toggle button" type="button" data-subscription-toggle
        aria-expanded="{{ $expanded ? 'true' : 'false' }}" aria-controls="{{ $panelId }}">
        <x-icon-box icon="crown" :tone="$config['iconTone']" size="md" icon-size="sm" />

        <div class="subscription-card__content">
            <h4 class="subscription-card__title heading heading--5">
                {{ $config['title'] }}
            </h4>

            <p class="subscription-card__text">{{ $config['subtitle1'] }}</p>
            <p class="subscription-card__text">{{ $config['subtitle2'] }}</p>
        </div>

        <x-icon id="chevron" size="xs" class="subscription-card__chevron" />
    </button>

    <div class="subscription-card__panel" id="{{ $panelId }}" data-subscription-panel
        aria-hidden="{{ $expanded ? 'false' : 'true' }}">
        <div class="subscription-card__panel-inner">
            <ul class="subscription-card__list">
                @foreach ($config['features'] as $feature)
                    <li class="subscription-card__item">
                        <x-icon :id="$feature['available'] ? 'check' : 'close'" size="xxs"
                            class="subscription-card__feature-icon {{ $feature['available'] ? 'is-available' : 'is-unavailable' }}" />
                        <span>{{ $feature['text'] }}</span>
                    </li>
                @endforeach
            </ul>

            <div class="subscription-card__divider"></div>

            <div class="subscription-card__list">
                @if ($config['priceLabel'])
                    <p class="subscription-card__item subscription-card__item--split">
                        <span>{{ $config['priceLabel'] }}</span>
                        <span>{{ $config['priceValue'] }}</span>
                    </p>
                @endif

                {{-- @if ($state === 'active')
                    <p class="subscription-card__item">
                        1 месяц за 0 ₽, затем 299 ₽/мес
                    </p>

                    <p class="subscription-card__item">
                        Отмена в любой момент
                    </p>
                @endif --}}

                <x-button class="subscription-card__cta" :variant="$config['buttonVariant']" radius="circle" size="lg"
                    type="button">
                    {{ $config['buttonText'] }}
                </x-button>

                <p class="subscription-card__item subscription-card__item-note">
                    {{ $config['note1'] }}
                </p>

                <p class="subscription-card__item subscription-card__item-note">
                    {{ $config['note2'] }}
                </p>
            </div>
        </div>
    </div>
</div>
