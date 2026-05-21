<x-layouts.app header="app" mainClass="home-page">
    <div class="home-page__container _container">

        <x-repeat-card class="home-page__repeat-card" state="due" :repeat-count="12" repeat-href="#" />

        <x-progress-card class="home-page__progress-card" />

        <section class="home-page__sets base-section shadow">

            <x-section-header class="home-page__sets-header" title="Наборы" button-text="Добавить набор"
                button-sidebar-open="create-set-sheet" />

            <section class="base-section__controls">
                <x-search-input class="home-page__search-field" placeholder="Найти набор" />

                <x-sort-menu class="home-page__sort-box" id="home-sort-menu" sort-by="created_at" order="asc" />
            </section>

            <section class="base-section__sets home-page__sets-list shadow-safe">
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
                <x-entity-card variant="set" title="Fruits"
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit." :progress="40"
                    :fading="10" date="22 мар" :cards-count="12" accent-class="card__accent--blue"
                    badge-tone="primary" />
            </section>

        </section>

        <x-categories-section class="home-page__categories shadow" sort-id="categories-sort-desktop" />

        <x-settings-section class="home-page__settings shadow" />

        <x-profile-section class="home-page__profile shadow" />

    </div>

    <x-sidebar-sheet id="categories-sheet">
        <x-categories-section sort-id="categories-sort-sidebar" sidebar />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="create-category-sheet">
        <x-category-form mode="create" action="{{ route('categories.store') }}" method="POST" :form-attributes="[
            'data-category-form' => true,
            'data-category-title-check-url' => route('categories.check-title'),
        ]" />
    </x-sidebar-sheet>

    {{-- <x-category-form mode="edit" action="{{ route('categories.update', $category) }}" method="PUT"
        :category="$category" :form-attributes="[
            'data-category-form' => true,
            'data-category-title-check-url' => route('categories.check-title'),
            'data-category-id' => $category->id,
        ]" /> --}}

    {{-- <x-sidebar-sheet id="settings-sheet">
        <x-settings-section sidebar />
    </x-sidebar-sheet> --}}

    {{-- <x-sidebar-sheet id="profile-sheet">
        <x-profile-section sidebar />
    </x-sidebar-sheet> --}}

    <x-sidebar-sheet id="create-set-sheet">
        <x-create-set-flow />
    </x-sidebar-sheet>

</x-layouts.app>
