@props([
    'sidebar' => false,
    'user' => auth()->user(),
    'stats' => [],
    'class' => '',
])

@php
    $avatar = $user?->avatar;

    $avatarUrl = $avatar
        ? (\Illuminate\Support\Str::startsWith($avatar, ['http://', 'https://'])
            ? $avatar
            : \Illuminate\Support\Facades\Storage::url($avatar))
        : null;

    $displayName = $user?->name ?: 'Без имени';
    $nickname = $user?->nickname ?: 'user';
    $email = $user?->email ?: '';

    $learnedCardsCount = $stats['learned_cards_count'] ?? 0;
    $onTimeReviewsCount = $stats['on_time_reviews_count'] ?? 0;
    $retentionPercent = $stats['retention_percent'] ?? 0;
    $inProgressCardsCount = $stats['in_progress_cards_count'] ?? 0;
    $setsCount = $stats['sets_count'] ?? 0;
    $cardsCount = $stats['cards_count'] ?? 0;
    $repeatCount = $stats['repeat_count'] ?? 0;
    $totalReviewsCount = $stats['total_reviews_count'] ?? 0;

    $result = match (true) {
        $cardsCount === 0 => [
            'icon' => 'flag',
            'tone' => 'orange',
            'title' => 'Остался последний шаг',
            'text' => 'Создайте первый набор, добавьте карточки и начните повторять!',
            'modifier' => 'orange',
            'image' => 'mountains-orange',
        ],
        $repeatCount > 0 => [
            'icon' => 'book',
            'tone' => 'orange',
            'title' => 'Память просит внимания',
            'text' => 'Сейчас хороший момент для повторения карточек.',
            'modifier' => 'orange',
            'image' => 'mountains-orange',
        ],
        $retentionPercent >= 80 && $totalReviewsCount > 0 => [
            'icon' => 'trophy',
            'tone' => 'purple',
            'title' => 'Отличная работа!',
            'text' => 'Знания сохраняются, а прогресс растёт каждый день.',
            'modifier' => 'purple',
            'image' => 'mountains',
        ],
        $learnedCardsCount >= 10 => [
            'icon' => 'goal',
            'tone' => 'teal',
            'title' => 'Отличный темп!',
            'text' => 'Новые знания закрепляются быстрее, а прогресс становится заметнее.',
            'modifier' => 'teal',
            'image' => 'mountains-teal',
        ],
        default => [
            'icon' => 'trophy',
            'tone' => 'purple',
            'title' => 'С возвращением!',
            'text' => 'Продолжим с того места, где остановились.',
            'modifier' => 'purple',
            'image' => 'mountains',
        ],
    };
@endphp

<section {{ $attributes->class(['base-section', 'profile-card']) }}>

    <x-section-header class="{{ $sidebar ? 'sidebar__header' : '' }}" title="Профиль" />

    <div class="profile-card__user">
        <div class="profile-card__avatar" data-profile-avatar>
            @if ($avatarUrl)
                <img class="profile-card__avatar-img" src="{{ $avatarUrl }}" alt="Аватар профиля">
            @else
                <x-icon id="profile" size="md" class="profile-card__avatar-icon" />
            @endif
        </div>

        <div class="profile-card__user-text">
            <h4 class="profile-card__name" data-profile-name>
                {{ $displayName }}
            </h4>

            <p class="profile-card__nickname" data-profile-nickname>
                &#64;{{ $nickname }}
            </p>

            <p class="profile-card__email" data-profile-email>
                {{ $email }}
            </p>
        </div>
    </div>

    <x-button class="profile-card__edit" tone="icon-control" size="lg" radius="12" icon="edit" icon-size="sm"
        icon-after="chevron" align="left" type="button" shadow data-profile-edit-open>
        Редактировать профиль
    </x-button>

    <div class="profile-card__stats">
        <div class="profile-card__stats-header">
            <h4 class="profile-card__stats-title heading heading--5">
                Моя статистика
            </h4>

            <p class="profile-card__stats-subtitle subtitle subtitle--3">
                За все время использования
            </p>
        </div>

        <article class="profile-stat-card profile-stat-card--purple shadow">
            <div class="profile-stat-card__accent"></div>

            <x-icon-box icon="book" tone="purple" size="md" icon-size="md" />

            <div class="profile-stat-card__content">
                <div class="profile-stat-card__value">{{ $learnedCardsCount }}</div>
                <div class="profile-stat-card__label">Карточки освоено</div>
                <div class="profile-stat-card__note">В долговременной памяти</div>
            </div>
        </article>

        <article class="profile-stat-card profile-stat-card--teal shadow">
            <div class="profile-stat-card__accent"></div>

            <x-icon-box icon="goal" tone="teal" size="md" icon-size="md" />

            <div class="profile-stat-card__content">
                <div class="profile-stat-card__value">{{ $onTimeReviewsCount }}</div>
                <div class="profile-stat-card__label">Повторений успешно</div>
                <div class="profile-stat-card__note">Без провала памяти</div>
            </div>
        </article>

        <article class="profile-stat-card profile-stat-card--orange shadow">
            <div class="profile-stat-card__accent"></div>

            <x-icon-box icon="protection" tone="orange" size="md" icon-size="md" />

            <div class="profile-stat-card__content">
                <div class="profile-stat-card__value">{{ $retentionPercent }}%</div>
                <div class="profile-stat-card__label">Удержание знаний</div>
                <div class="profile-stat-card__note">По результатам ответов</div>
            </div>
        </article>

        <article class="profile-stat-card profile-stat-card--blue shadow">
            <div class="profile-stat-card__accent"></div>

            <x-icon-box icon="stack" tone="blue" size="md" icon-size="md" />

            <div class="profile-stat-card__content">
                <div class="profile-stat-card__value">{{ $inProgressCardsCount }}</div>
                <div class="profile-stat-card__label">Карточек в процессе</div>
                <div class="profile-stat-card__note">Активно изучаются</div>
            </div>
        </article>

        <article class="profile-card__result profile-result profile-result--{{ $result['modifier'] }} shadow">
            <div class="profile-result__header">
                <x-icon-box :icon="$result['icon']" :tone="$result['tone']" size="md" icon-size="md" />

                <div class="profile-result__content">
                    <h4 class="profile-result__title">
                        {{ $result['title'] }}
                    </h4>

                    <p class="profile-result__text">
                        {{ $result['text'] }}
                    </p>
                </div>
            </div>

            <div class="profile-result__decor">
                <img src="{{ asset("images/{$result['image']}.svg") }}" alt="" aria-hidden="true">
            </div>
        </article>
    </div>

    <form class="profile-card__logout-form" action="{{ route('logout') }}" method="POST">
        @csrf

        <x-button class="profile-card__logout" tone="danger-ghost" size="lg" radius="12" icon="logout"
            icon-size="sm" type="submit" align="left" shadow>
            Выйти из аккаунта
        </x-button>
    </form>
</section>
