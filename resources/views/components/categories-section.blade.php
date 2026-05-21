@props([
    'sortId' => 'categories-sort-menu',
    'sidebar' => false,
])

<section
    {{ $attributes->class(['base-section', 'categories-section']) }}
    data-categories-section
    data-categories-url="{{ route('categories.index') }}"
>
    <x-section-header
        class="{{ $sidebar ? 'sidebar__header' : 'home-page__sets-header' }}"
        title="Категории"
        button-class="{{ $sidebar ? '' : 'home-page__categories-btn' }}"
        button-text="{{ $sidebar ? null : 'Добавить категорию' }}"
        :button-icon-only="$sidebar"
        button-sidebar-open="create-category-sheet"
    />

    <section class="base-section__controls categories-section__controls">
        <x-search-input
            class="categories-section__search"
            placeholder="Найти категорию"
            data-categories-search
            data-sync-input="categories.search"
        />

        <x-sort-menu
            id="{{ $sortId }}"
            sort-by="created_at"
            order="asc"
            data-categories-sort
            data-sync-sort="categories.sort"
            :options="[
                'created_at' => 'По дате',
                'title' => 'По названию',
                'sets_count' => 'По количеству наборов',
            ]"
        />
    </section>

    <section
        @class([
            'base-section__categories',
            'categories-section__list',
            'home-page__categories-list' => ! $sidebar,
            'shadow-safe',
        ])
        data-categories-list
    ></section>
</section>
