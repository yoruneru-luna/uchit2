@props([
    'active' => 'all', // all | sets | categories | authors
    'showAuthors' => false,
])

<div {{ $attributes->class(['tabs']) }}>
    <button class="tabs__item {{ $active === 'all' ? 'tabs__item--active shadow' : '' }}" type="button" data-tab="all">
        Все
    </button>

    <span>
        |
    </span>

    <button class="tabs__item {{ $active === 'sets' ? 'tabs__item--active shadow' : '' }}" type="button" data-tab="sets">
        Наборы
    </button>

    <span>
        |
    </span>

    <button class="tabs__item {{ $active === 'categories' ? 'tabs__item--active shadow' : '' }}" type="button"
        data-tab="categories">
        Категории
    </button>

    @if ($showAuthors)
        <span>
            |
        </span>

        <button class="tabs__item {{ $active === 'authors' ? 'tabs__item--active shadow' : '' }}" type="button"
            data-tab="authors">
            Авторы
        </button>
    @endif
</div>
