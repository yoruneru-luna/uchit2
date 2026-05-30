@props([
    'state' => null, // null | free | active | expiring | expired
    'expanded' => false,
])

@php
    $user = auth()->user();

    $endsAt = $user?->subscription_ends_at;
    $hasPro = $user?->isPro() ?? false;

    $daysLeft = $endsAt
        ? now()
            ->startOfDay()
            ->diffInDays($endsAt->copy()->startOfDay(), false)
        : null;

    $isExpired = $endsAt && $endsAt->isPast();

    $computedState = $state;

    if (!$computedState) {
        if ($hasPro && $daysLeft !== null && $daysLeft <= 3) {
            $computedState = 'expiring';
        } elseif ($hasPro) {
            $computedState = 'active';
        } elseif ($user?->subscription_status === 'expired' || $isExpired) {
            $computedState = 'expired';
        } else {
            $computedState = 'free';
        }
    }

    $dateText = $endsAt ? $endsAt->format('d.m.Y') : null;

    $config = match ($computedState) {
        'active' => [
            'toneClass' => 'subscription-card--active',
            'iconTone' => 'purple',
            'title' => 'Подписка PRO',
            'subtitle1' => "Активна до {$dateText}",
            'subtitle2' => 'Пользуйтесь всеми возможностями.',
            'features' => [
                ['text' => 'Неограниченные наборы', 'available' => true],
                ['text' => 'Все режимы повторения', 'available' => true],
                ['text' => 'Расширенная статистика', 'available' => true],
            ],
            'priceLabel' => '',
            'priceValue' => '',
            'buttonText' => '',
            'buttonVariant' => 'primary',
            'note1' => 'Продление станет доступно ближе к окончанию подписки.',
            'note2' => '',
            'showCta' => false,
        ],

        'expiring' => [
            'toneClass' => 'subscription-card--expiring',
            'iconTone' => 'orange',
            'title' => 'Подписка PRO',
            'subtitle1' => "Истекает через {$daysLeft} дн. · {$dateText}",
            'subtitle2' => 'Продлите подписку, чтобы сохранить доступ.',
            'features' => [
                ['text' => 'Неограниченные наборы', 'available' => true],
                ['text' => 'Все режимы повторения', 'available' => true],
                ['text' => 'Генерация картинок', 'available' => true],
            ],
            'priceLabel' => 'Стоимость продления:',
            'priceValue' => '299 ₽ / месяц',
            'buttonText' => 'Продлить за 299 ₽',
            'buttonVariant' => 'warning',
            'note1' => 'Безопасная оплата через ЮKassa',
            'note2' => 'После оплаты подписка продлевается на 30 дней.',
            'showCta' => true,
        ],

        'expired' => [
            'toneClass' => 'subscription-card--paused',
            'iconTone' => 'danger',
            'title' => 'Подписка PRO',
            'subtitle1' => 'Подписка закончилась',
            'subtitle2' => 'Часть возможностей снова ограничена.',
            'features' => [
                ['text' => 'Неограниченные наборы', 'available' => false],
                ['text' => 'Все режимы повторения', 'available' => false],
                ['text' => 'Генерация картинок', 'available' => true],
            ],
            'priceLabel' => 'Стоимость подключения:',
            'priceValue' => '299 ₽ / месяц',
            'buttonText' => 'Возобновить за 299 ₽',
            'buttonVariant' => 'danger',
            'note1' => 'Безопасная оплата через ЮKassa',
            'note2' => 'После оплаты подписка активируется на 30 дней.',
            'showCta' => true,
        ],

        default => [
            'toneClass' => 'subscription-card--free',
            'iconTone' => 'purple',
            'title' => 'Подписка PRO',
            'subtitle1' => 'Откройте расширенные возможности веб-приложения',
            'subtitle2' => 'Первый тестовый платёж проходит через ЮKassa.',
            'features' => [
                ['text' => 'Неограниченные наборы', 'available' => true],
                ['text' => 'Все режимы повторения', 'available' => true],
                ['text' => 'Генерация картинок', 'available' => true],
            ],
            'priceLabel' => 'Стоимость:',
            'priceValue' => '299 ₽ / месяц',
            'buttonText' => 'Подключить за 299 ₽',
            'buttonVariant' => 'primary',
            'note1' => 'Безопасная оплата через ЮKassa',
            'note2' => 'После оплаты подписка активируется на 30 дней.',
            'showCta' => true,
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

            @if ($config['subtitle2'])
                <p class="subscription-card__text">{{ $config['subtitle2'] }}</p>
            @endif
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

                @if ($config['showCta'])
                    <form method="POST" action="{{ route('subscription.checkout') }}">
                        @csrf

                        <x-button class="subscription-card__cta" :variant="$config['buttonVariant']" radius="circle" size="lg"
                            type="submit">
                            {{ $config['buttonText'] }}
                        </x-button>
                    </form>
                @endif

                @if ($config['note1'])
                    <p class="subscription-card__item subscription-card__item-note">
                        {{ $config['note1'] }}
                    </p>
                @endif

                @if ($config['note2'])
                    <p class="subscription-card__item subscription-card__item-note">
                        {{ $config['note2'] }}
                    </p>
                @endif
            </div>
        </div>
    </div>
</div>
