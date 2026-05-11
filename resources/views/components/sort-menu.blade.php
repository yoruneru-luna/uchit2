@props([
    'id' => 'sort-menu',
    'sortBy' => 'created_at',
    'order' => 'desc',
    'options' => [
        'created_at' => 'По дате',
        'progress' => 'По прогрессу',
        'title' => 'По названию',
        'cards_count' => 'По карточкам',
    ],
])

@php
    $orderLabels = [
        'desc' => '⇂',
        'asc' => '↾',
    ];

    $currentSortLabel = $options[$sortBy] ?? 'Сортировка';
    $currentOrderLabel = $orderLabels[$order] ?? '⇂';
@endphp

<div {{ $attributes->class(['sort-dropdown']) }} data-sort data-sort-by="{{ $sortBy }}"
    data-sort-order="{{ $order }}">
    <x-button class="sort-dropdown__toggle" tone="icon-control" size="lg" icon="sort" icon-size="sm" mobile-icon-only
        radius="12" shadow type="button" data-sort-toggle aria-expanded="false" aria-controls="{{ $id }}"
        aria-haspopup="true" aria-label="Открыть сортировку">
        <span class="sort-dropdown__button-text">
            <span class="sort-dropdown__caption">Сортировка</span>

            <span class="sort-dropdown__value">
                <span data-sort-current-by>{{ $currentSortLabel }}</span>
                <span class="sort-dropdown__order" data-sort-current-order>
                    {{ $currentOrderLabel }}
                </span>
            </span>
        </span>
    </x-button>

    <div class="sort-menu shadow--1" id="{{ $id }}" data-sort-menu hidden>
        <p class="sort-menu__title">Сортировка</p>

        <div class="sort-menu__group">
            @foreach ($options as $value => $label)
                <button class="sort-menu__option {{ $sortBy === $value ? 'is-active' : '' }}" type="button"
                    data-sort-option data-sort-group="by" data-value="{{ $value }}"
                    data-label="{{ $label }}">
                    <span class="sort-menu__label">{{ $label }}</span>
                    <x-icon id="check" size="xxs" class="sort-menu__check" />
                </button>
            @endforeach
        </div>

        <div class="sort-menu__divider"></div>

        <div class="sort-menu__group">
            <button class="sort-menu__option {{ $order === 'desc' ? 'is-active' : '' }}" type="button"
                data-sort-option data-sort-group="order" data-value="desc" data-label="⇂">
                <span class="sort-menu__label">По убыванию</span>
                <x-icon id="check" size="xxs" class="sort-menu__check" />
            </button>

            <button class="sort-menu__option {{ $order === 'asc' ? 'is-active' : '' }}" type="button" data-sort-option
                data-sort-group="order" data-value="asc" data-label="↾">
                <span class="sort-menu__label">По возрастанию</span>
                <x-icon id="check" size="xxs" class="sort-menu__check" />
            </button>
        </div>
    </div>
</div>
