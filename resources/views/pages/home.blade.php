<x-layouts.app header="app" mainClass="home-page">
    <div class="home-page__container _container">

        <x-repeat-card class="home-page__repeat-card" state="due" :repeat-count="12" repeat-href="#" />

        <x-progress-card class="home-page__progress-card" />

        <section class="home-page__sets base-section shadow">

            <x-section-header class="home-page__sets-header" title="Наборы" button-text="Добавить набор" />

            <section class="home-page__controls">
                <x-search-input class="home-page__search-field" placeholder="Найти набор" />

                <x-sort-menu class="home-page__sort-box" id="home-sort-menu" sort-by="created_at" order="asc" />

                <x-tabs class="home-page__tabs" active="all" />
            </section>

            <section class="base-section__sets home-page__sets-list">
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

        <section class="home-page__categories base-section shadow">

            <x-section-header class="home-page__sets-header" title="Категории"
                buttonClass="home-page__categories-btn" button-text="Добавить категорию" />

            <section class="base-section__controls">
                <x-search-input class="home-page__search-field" placeholder="Найти категорию" />

                <x-sort-menu id="categories-sort-menu" sort-by="created_at" order="asc" :options="[
                    'created_at' => 'По дате',
                    'title' => 'По названию',
                    'sets_count' => 'По количеству наборов',
                ]" />
            </section>

            <section class="base-section__categories home-page__categories-list">
                <x-entity-card variant="category" title="First"
                    description="Description of First’s set this an example of more big des..." date="22 мар"
                    :sets-count="6" accent-class="card__accent--pink" :is-selected="false" />
                <x-entity-card variant="category" title="First"
                    description="Description of First’s set this an example of more big des..." date="22 мар"
                    :sets-count="6" accent-class="card__accent--pink" :is-selected="false" />
                <x-entity-card variant="category" title="First"
                    description="Description of First’s set this an example of more big des..." date="22 мар"
                    :sets-count="6" accent-class="card__accent--pink" :is-selected="false" />
                <x-entity-card variant="category" title="First"
                    description="Description of First’s set this an example of more big des..." date="22 мар"
                    :sets-count="6" accent-class="card__accent--pink" :is-selected="false" />
                <x-entity-card variant="category" title="First"
                    description="Description of First’s set this an example of more big des..." date="22 мар"
                    :sets-count="6" accent-class="card__accent--pink" :is-selected="false" />
            </section>

        </section>

        <section class="base-section home-page__settings settings-card shadow">
            <x-section-header title="Настройки" />

            <div class="settings-card__group shadow">
                <h5 class="heading heading--5">
                    Уведомления
                </h5>
                <div class="settings-card__list">
                    <div class="settings-card__item">
                        <div class="settings-card__item-main">
                            <x-icon-box icon="rotate" tone="purple" size="sm" icon-size="xs" />

                            <span class="settings-card__label">Повторения</span>
                        </div>

                        <x-switch name="notifications_reviews" :checked="true" />
                    </div>

                    <div class="settings-card__item">
                        <div class="settings-card__item-main">
                            <x-icon-box icon="spark" tone="blue" size="sm" icon-size="xs" />

                            <span class="settings-card__label">Новые функции</span>
                        </div>

                        <x-switch name="notifications_features" :checked="true" />
                    </div>

                    <div class="settings-card__item">
                        <div class="settings-card__item-main">
                            <x-icon-box icon="sale" tone="pink" size="sm" icon-size="xs" />

                            <span class="settings-card__label">Скидки и акции</span>
                        </div>

                        <x-switch name="notifications_sales" :checked="true" />
                    </div>
                </div>
            </div>

            <x-button class="settings-card__delete" align="left" tone="danger-ghost" size="lg"
                radius="12" icon="trash" icon-size="sm" type="button" shadow>
                Удалить аккаунт
            </x-button>
        </section>

        <section class="base-section home-page__profile profile-card shadow">
            <x-section-header title="Профиль" />

            <div class="profile-card__user">
                <div class="profile-card__avatar">
                    <x-icon id="profile" size="md" class="profile-card__avatar-icon" />
                </div>

                <div class="profile-card__user-text">
                    <h4 class="profile-card__name">Иван Иванов</h4>
                    <p class="profile-card__nickname">@ivanivanov</p>
                    <p class="profile-card__email">ivan.ivanov@gmail.com</p>
                </div>
            </div>

            <x-button class="profile-card__edit" tone="icon-control" size="lg" radius="12" icon="edit"
                icon-size="sm" icon-after="chevron" align="left" type="button" shadow>
                Редактировать профиль
            </x-button>

            <x-subscription-card state="deafult"></x-subscription-card>

            <div class="profile-card__stats">
                <div class="profile-card__stats-header">
                    <h4 class="profile-card__stats-title heading heading--5">Моя статистика</h4>
                    <p class="profile-card__stats-subtitle subtitle subtitle--3">За все время использования</p>
                </div>

                <article class="profile-stat-card profile-stat-card--purple shadow">
                    <div class="profile-stat-card__accent"></div>

                    <x-icon-box icon="book" tone="purple" size="md" icon-size="md" />

                    <div class="profile-stat-card__content">
                        <div class="profile-stat-card__value">124</div>
                        <div class="profile-stat-card__label">Карточки освоено</div>
                        <div class="profile-stat-card__note">В долговременной памяти</div>
                    </div>
                </article>

                <article class="profile-stat-card profile-stat-card--teal shadow">
                    <div class="profile-stat-card__accent"></div>

                    <x-icon-box icon="goal" tone="teal" size="md" icon-size="md" />

                    <div class="profile-stat-card__content">
                        <div class="profile-stat-card__value">86</div>
                        <div class="profile-stat-card__label">Повторений вовремя</div>
                        <div class="profile-stat-card__note">Избежали забывания</div>
                    </div>
                </article>

                <article class="profile-stat-card profile-stat-card--orange shadow">
                    <div class="profile-stat-card__accent"></div>

                    <x-icon-box icon="protection" tone="orange" size="md" icon-size="md" />

                    <div class="profile-stat-card__content">
                        <div class="profile-stat-card__value">81%</div>
                        <div class="profile-stat-card__label">Удержание знаний</div>
                        <div class="profile-stat-card__note">Средний показатель</div>
                    </div>
                </article>

                <article class="profile-stat-card profile-stat-card--blue shadow">
                    <div class="profile-stat-card__accent"></div>

                    <x-icon-box icon="stack" tone="blue" size="md" icon-size="md" />

                    <div class="profile-stat-card__content">
                        <div class="profile-stat-card__value">6</div>
                        <div class="profile-stat-card__label">Карточек в процессе</div>
                        <div class="profile-stat-card__note">Активно изучаете</div>
                    </div>
                </article>

                <article class="profile-card__result profile-result shadow">
                    <div class="profile-result__header">
                        <x-icon-box icon="trophy" tone="purple" size="md" icon-size="md" />

                        <div class="profile-result__content">
                            <h4 class="profile-result__title">Отличная работа!</h4>
                            <p class="profile-result__text">
                                Вы сохраняете знания и становитесь <br>
                                лучше каждый день.
                            </p>
                        </div>
                    </div>

                    <div class="profile-result__decor">
                        <img src="{{ asset('images/mountains.svg') }}" alt="" aria-hidden="true">
                    </div>
                </article>
            </div>

            <x-button class="profile-card__logout" tone="danger-ghost" size="lg" radius="12" icon="logout"
                icon-size="sm" type="button" align="left" shadow>
                Выйти из аккаунта
            </x-button>
        </section>

    </div>

    <x-sidebar-sheet id="categories-sheet" title="Категории">
        <p>Контент категорий</p>
    </x-sidebar-sheet>

    <x-button type="button" data-sidebar-sheet-open="categories-sheet">
        Открыть категории
    </x-button>

</x-layouts.app>
