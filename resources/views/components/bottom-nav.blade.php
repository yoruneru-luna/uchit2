@props([
    'active' => null, // categories | addSet | profile |settings
])

<nav class="bottom-bar shadow--1" role="toolbar" aria-label="Быстрые действия">
    <div class="_container">
        <div class="bottom-bar__inner">
            <x-button mobile-icon-only radius="circle" tone="drawer-toggle" icon="categories" size="md" iconSize="lg"
                sidebar-open="categories-sheet">
                Категории
            </x-button>
            <x-button mobile-icon-only radius="circle" tone="primary" icon="plus" size="md" iconSize="lg"
                shadow sidebar-open="create-set-sheet">
                Добавить набор
            </x-button>
            <x-button mobile-icon-only radius="circle" tone="drawer-toggle" icon="profile" size="md" iconSize="lg"
                sidebar-open="profile-sheet">
                Профиль
            </x-button>
            <x-button mobile-icon-only radius="circle" tone="drawer-toggle" icon="setting" size="md" iconSize="lg"
                sidebar-open="settings-sheet">
                Настройки
            </x-button>
        </div>
    </div>
</nav>
