<x-layouts.app header="app" mainClass="home-page">
    <div class="home-page__container _container">

        <x-repeat-card class="home-page__repeat-card" state="due" :repeat-count="12" repeat-href="#" />

        <x-progress-card class="home-page__progress-card" />

        <section class="home-page__sets base-section shadow" data-sets-section data-sets-url="{{ route('sets.index') }}"
            data-set-delete-url-template="{{ route('sets.destroy', ['set' => '__ID__']) }}">

            <x-section-header class="home-page__sets-header" title="Наборы" button-text="Добавить набор"
                button-sidebar-open="create-set-sheet" />

            <div class="sets-category-view" data-sets-category-view hidden></div>

            <section class="base-section__controls">
                <x-search-input class="home-page__search-field" placeholder="Найти набор" data-sets-search />

                <x-sort-menu class="home-page__sort-box" id="home-sort-menu" sort-by="created_at" order="asc"
                    data-sets-sort :options="[
                        'created_at' => 'По дате',
                        'title' => 'По названию',
                        'cards_count' => 'По количеству карточек',
                        'progress' => 'По прогрессу',
                    ]" />
            </section>

            <section class="base-section__sets home-page__sets-list shadow-safe" data-sets-list>
            </section>

        </section>

        <x-categories-section class="home-page__categories shadow" sort-id="categories-sort-desktop" />

        <x-settings-section class="home-page__settings shadow" />

        <x-profile-section class="home-page__profile shadow" />

    </div>

    <x-sidebar-sheet id="edit-set-sheet">
        <x-set-form mode="edit" action="#" method="PUT" :set="null" :form-attributes="[
            'data-set-form' => true,
            'data-set-edit-form' => true,
            'data-set-title-check-url' => route('sets.check-title'),
            'data-set-update-url-template' => route('sets.update', ['set' => '__ID__']),
            'data-set-create-data-url' => route('sets.create-data'),
        ]" />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="set-details-sheet" class="sidebar-sheet--set-details">
        <div class="set-details" data-set-details></div>
    </x-sidebar-sheet>

    <x-sidebar-sheet id="categories-sheet">
        <x-categories-section sort-id="categories-sort-sidebar" sidebar />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="create-category-sheet">
        <x-category-form mode="create" action="{{ route('categories.store') }}" method="POST" :form-attributes="[
            'data-category-form' => true,
            'data-category-title-check-url' => route('categories.check-title'),
        ]" />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="edit-category-sheet">
        <x-category-form mode="edit" action="#" method="PUT" :category="null" :form-attributes="[
            'data-category-form' => true,
            'data-category-edit-form' => true,
            'data-category-title-check-url' => route('categories.check-title'),
            'data-category-update-url-template' => route('categories.update', ['category' => '__ID__']),
        ]" />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="settings-sheet">
        <x-settings-section sidebar />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="profile-sheet">
        <x-profile-section sidebar />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="create-set-sheet">
        <x-create-set-flow />
    </x-sidebar-sheet>

    <x-sidebar-sheet id="create-card-sheet">
        <x-card-form mode="default" action="{{ route('cards.store') }}" method="POST" :form-attributes="[
            'data-card-form' => true,
            'data-card-duplicates-url' => route('cards.check-duplicates'),
            'data-card-suggestions-url' => route('cards.suggestions'),
            'data-card-suggestion-image-url' => route('cards.suggestion-image'),
        ]" />

    </x-sidebar-sheet>

    <x-sidebar-sheet id="edit-profile-sheet">
        <x-profile-form></x-profile-form>
    </x-sidebar-sheet>

</x-layouts.app>
