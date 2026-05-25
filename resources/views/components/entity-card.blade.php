@props([
    'variant' => 'set', // set | category | search

    'title' => 'Fruits',
    'description' => null,
    'category' => null,

    'progress' => 0,
    'fading' => 0,

    'date' => null,
    'cardsCount' => 0,
    'setsCount' => 0,
    'author' => null,

    'accentClass' => null,
    'badgeTone' => 'primary',

    'isSelected' => false,
    'isAdded' => false,
])

@php
    $isToggled = $isSelected || $isAdded;

    $topAction = match ($variant) {
        'set' => [
            'icon' => 'expand',
            'tone' => $badgeTone,
            'iconSize' => 'md',
        ],

        'category' => [
            'icon' => $isSelected ? 'check' : 'plus',
            'tone' => $isSelected ? 'primary' : 'primary-soft',
            'iconSize' => 'sm',
        ],

        'search' => [
            'icon' => $isAdded ? 'check' : 'plus',
            'tone' => $isAdded ? 'primary' : 'primary-soft',
            'iconSize' => 'sm',
        ],

        default => [
            'icon' => 'expand',
            'tone' => $badgeTone,
            'iconSize' => 'md',
        ],
    };

    $secondaryAction = match ($variant) {
        'search' => [
            'icon' => 'expand',
            'tone' => 'icon-muted',
            'menu' => false,
        ],
        default => [
            'icon' => 'more',
            'tone' => 'icon-muted',
            'menu' => true,
        ],
    };
@endphp

<article {{ $attributes->class(['card', 'shadow']) }}>
    <div class="card__accent {{ $accentClass }}"></div>

    <div class="card__main">
        <div class="card__text">
            <div class="card__heading">
                <h3 class="card__title heading heading--4">
                    {{ $title }} <span class="card__category"> {{ $category ?? '' }} </span>
                </h3>
            </div>

            @if ($description)
                <p class="card__description">
                    {{ $description }}
                </p>
            @endif
        </div>

        <div class="card__actions">
            <x-button class="card__more" iconOnly radius="12" size="lg" :tone="$topAction['tone']" :icon="$topAction['icon']"
                :icon-size="$topAction['iconSize']" type="button" :aria-pressed="$variant !== 'set' ? ($isToggled ? 'true' : 'false') : null" />

            @if ($secondaryAction['menu'])
                <div class="card__menu" data-card-menu>
                    <x-button class="card__more" iconOnly radius="12" size="lg" :tone="$secondaryAction['tone']"
                        :icon="$secondaryAction['icon']" icon-size="sm" type="button" data-card-menu-toggle aria-expanded="false"
                        aria-haspopup="true" />

                    <div class="card-menu shadow--1" data-card-menu-dropdown hidden>
                        <x-button class="card__btn" align="left" radius="12" size="lg" tone="ghost"
                            icon="edit" icon-size="sm" type="button" data-card-menu-edit>
                            Редактировать
                        </x-button>

                        <x-button class="card__btn" align="left" radius="12" size="lg" tone="danger-ghost"
                            icon="trash" icon-size="sm" type="button" data-card-menu-delete>
                            Удалить
                        </x-button>
                    </div>
                </div>
            @else
                <x-button class="card__more" iconOnly radius="12" size="lg" :tone="$secondaryAction['tone']" :icon="$secondaryAction['icon']"
                    icon-size="sm" type="button" />
            @endif
        </div>

        @if ($variant === 'set')
            <div class="card__stats">
                <div class="card__line">
                    <span class="card__line-segment card__line-segment--learned"
                        style="width: {{ $progress }}%;"></span>

                    @if ($fading > 0)
                        <span class="card__line-segment card__line-segment--fading"
                            style="width: {{ $fading }}%;"></span>
                    @endif
                </div>

                <div class="card__percent">
                    {{ $progress }}%

                    @if ($fading > 0)
                        <span class="card__delta">(-{{ $fading }}%)</span>
                    @endif
                </div>
            </div>

            <div class="card__meta">
                @if ($date)
                    <span>{{ $date }}</span>
                @endif

                @if ($date && $cardsCount)
                    <span>•</span>
                @endif

                @if ($cardsCount)
                    <span>{{ $cardsCount }} карточек</span>
                @endif
            </div>
        @endif

        @if ($variant === 'category')
            <div class="card__stats">
                <div class="card__line">
                    <span class="card__line-segment card__line-segment--learned"
                        style="width: {{ $progress }}%;"></span>

                    @if ($fading > 0)
                        <span class="card__line-segment card__line-segment--fading"
                            style="width: {{ $fading }}%;"></span>
                    @endif
                </div>

                <div class="card__percent">
                    {{ $progress }}%

                    @if ($fading > 0)
                        <span class="card__delta">(-{{ $fading }}%)</span>
                    @endif
                </div>
            </div>

            <div class="card__meta card__meta--stack">
                @if ($date)
                    <span>{{ $date }}</span>
                @endif

                @if ($date && $setsCount)
                    <span>•</span>
                @endif

                @if ($setsCount)
                    <span>{{ $setsCount }} наборов</span>
                @endif
            </div>
        @endif

        @if ($variant === 'search')
            <div class="card__meta card__meta--search">

                @if ($cardsCount)
                    <span>{{ $cardsCount }} карточек</span>
                @endif

                @if ($setsCount)
                    <span>{{ $setsCount }} наборов</span>
                @endif
            </div>

            @if ($author)
                <div class="card__meta card__meta--search">
                    <span>Автор: {{ $author }}</span>
                </div>
            @endif
        @endif
    </div>
</article>


{{-- <x-entity-card variant="category" title="First"
    description="Description of First’s set this an example of more big des..." date="22 мар" :sets-count="6"
    accent-class="card__accent--pink" :is-selected="false" />
<x-entity-card variant="category" title="First"
    description="Description of First’s set this an example of more big des..." date="22 мар" :sets-count="6"
    accent-class="card__accent--pink" :is-selected="true" />
<x-entity-card variant="search" title="Verbs"
    description="Description of Fruits’ set this an example of more big des..." :sets-count="12" author="@youruneru"
    accent-class="card__accent--blue" :is-added="false" />
<x-entity-card variant="search" title="Irregular 1" category="Verbs"
    description="Description of Irregular’ set this an example of more big..." :cards-count="15" author="@youruneru"
    accent-class="card__accent--blue" :is-added="true" /> --}}
