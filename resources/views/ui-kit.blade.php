<x-layouts.app>

    <style>
        .block {
            display: flex;
            gap: 1em;
            flex-wrap: wrap;
            padding: 1em;
        }
    </style>

    <div class="block">

        <x-button icon-only radius="circle" size="sm" tone="subtle" icon="search" />

        <x-button icon-only radius="circle" size="sm" tone="danger-muted" icon="trash" />

        <x-button tone="dark" icon="chevron" icon-size="xxs" />

        <x-button icon-only radius="circle" size="sm" tone="subtle" icon="bell" />

        <x-button radius="12" size="lg" variant="primary" icon-after="arrow" icon-size="md">
            Повторить
        </x-button>

        <x-button radius="12" size="lg" tone="danger-soft" icon-after="trash">
            Удалить все
        </x-button>

        <x-button radius="12" size="lg" tone="danger-ghost" icon-after="trash">
            Удалить аккаунт
        </x-button>

        <x-button icon-only radius="12" size="lg" variant="primary" icon="graduation-cap" icon-size="lg" />

        <x-button icon-only radius="circle" size="lg" variant="primary" icon="plus" />

        <x-button radius="circle" size="lg" variant="primary" icon-after="plus">
            Создать набор
        </x-button>

        <x-button radius="circle" size="lg" variant="primary">
            Попробовать бесплатно
        </x-button>

        <x-button radius="circle" size="lg" variant="danger">
            Возобновить
        </x-button>

        <x-button radius="circle" size="lg" variant="danger" icon="trash">
            Удалить аккаунт
        </x-button>

        <x-button radius="circle" size="lg" variant="warning">
            Продлить за 299 ₽
        </x-button>

        <x-button icon-only radius="circle" size="xs" tone="danger-subtle" icon="close" icon-size="xxs" />

        <x-button radius="12" size="lg" variant="secondary" icon="edit" icon-after="chevron"
            icon-after-size="xxs">
            Редактировать профиль
        </x-button>

        <x-button icon-only radius="12" size="lg" tone="icon-muted" icon="more" icon-size="sm" />

        <x-button icon-only radius="12" size="lg" tone="icon-control" icon="sort" icon-size="sm" />

        <x-button radius="12" size="sm" icon="image" icon-size="sm"
            description="JPG, PNG, WEBP не более 5 МБ">
            Добавить изображение
        </x-button>

        <x-button as="a" href="/sets" radius="circle" size="lg" tone="ghost">
            Найти набор
        </x-button>

        <x-button tone="light">
            Отмена
        </x-button>

    </div>

</x-layouts.app>
