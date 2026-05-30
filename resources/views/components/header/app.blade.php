<header class="header header--app">
    <div class="_container">
        <div class="header__inner">
            <x-logo class="header__logo" />

            <div class="header__actions">
                <x-button icon-only radius="circle" size="sm" tone="subtle" icon="profile" icon-size="md"
                    class="header__btn--desktop" sidebar-open="profile-sheet" />
                <x-button icon-only radius="circle" size="sm" tone="subtle" icon="setting" icon-size="md"
                    class="header__btn--no-mobile" sidebar-open="settings-sheet" />
                <x-button icon-only radius="circle" size="sm" tone="subtle" icon="search" icon-size="md"
                    data-global-search-open />
                <div class="header__notification-wrap">
                    <x-button icon-only radius="circle" size="sm" tone="subtle" icon="bell" icon-size="md"
                        sidebar-open="notifications-sheet" data-notifications-open />

                    <span class="header__notification-badge" data-notifications-badge hidden></span>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="global-search" data-global-search hidden>
    <div class="global-search__backdrop" data-global-search-close></div>

    <section class="global-search__panel shadow" data-global-search-panel>
        <form class="global-search__form" action="{{ route('global-search.index') }}" method="GET"
            data-global-search-form>
            <div class="global-search__field">
                <x-icon id="search" size="xs" class="global-search__field-icon" />

                <input class="global-search__input" type="search" name="q" placeholder="Поиск наборов..."
                    autocomplete="off" data-global-search-input>
            </div>

            <button class="global-search__cancel" type="button" data-global-search-close>
                Отмена
            </button>
        </form>

        <div class="global-search__body">
            <div class="global-search__popular" data-global-search-start>
                <h4 class="global-search__section-title">Популярные запросы</h4>

                <div class="global-search__chips">
                    <button class="global-search__chip" type="button" data-global-search-query="Английский">
                        Английский
                    </button>

                    <button class="global-search__chip" type="button" data-global-search-query="Математика">
                        Математика
                    </button>

                    <button class="global-search__chip" type="button" data-global-search-query="Химия">
                        Химия
                    </button>

                    <button class="global-search__chip" type="button" data-global-search-query="Физика">
                        Физика
                    </button>

                    <button class="global-search__chip" type="button" data-global-search-query="Биология">
                        Биология
                    </button>
                </div>

                <div class="global-search__tip">
                    <x-icon id="search" size="xs" class="global-search__tip-icon" />

                    <div>
                        <h5 class="global-search__tip-title">Совет</h5>
                        <p class="global-search__tip-text">
                            Ищите по названию, описанию или автору. Например: “Past Simple” или “@username”.
                        </p>
                    </div>
                </div>
            </div>

            <div class="global-search__results" data-global-search-results hidden></div>

            <div class="global-search__details" data-global-search-details hidden></div>
        </div>
    </section>
</div>
