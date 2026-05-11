@props(['id', 'title' => null])

<div {{ $attributes->class(['sidebar-sheet']) }} data-sidebar-sheet data-sidebar-sheet-id="{{ $id }}" hidden>
    <button class="sidebar-sheet__backdrop" type="button" aria-label="Закрыть панель" data-sidebar-sheet-close></button>

    <aside class="sidebar-sheet__panel" role="dialog" aria-modal="true"
        @if ($title) aria-labelledby="{{ $id }}-title" @endif>
        <div class="sidebar-sheet__mobile-handle-wrap">
            <button class="sidebar-sheet__mobile-handle" type="button" aria-label="Закрыть панель"
                data-sidebar-sheet-close>
                <span class="sidebar-sheet__mobile-handle-line"></span>
            </button>
        </div>

        @if ($title)
            <div class="sidebar-sheet__header">
                <h2 class="sidebar-sheet__title" id="{{ $id }}-title">
                    {{ $title }}
                </h2>

                <x-button class="sidebar-sheet__close" iconOnly radius="circle" size="sm" tone="icon-muted"
                    icon="close" icon-size="xs" type="button" data-sidebar-sheet-close />
            </div>
        @endif

        <div class="sidebar-sheet__body">
            {{ $slot }}
        </div>
    </aside>
</div>
