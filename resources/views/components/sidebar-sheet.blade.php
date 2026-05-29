@props(['id', 'title' => null])

<div {{ $attributes->class(['sidebar-sheet']) }} data-sidebar-sheet data-sidebar-sheet-id="{{ $id }}" hidden>
    {{-- <div {{ $attributes->class(['sidebar-sheet']) }} data-sidebar-sheet data-sidebar-sheet-id="{{ $id }}"> --}}
    <aside class="sidebar-sheet__panel _container" role="dialog" aria-modal="true" data-sidebar-sheet-panel>
        <x-button class="sidebar-sheet__close" iconOnly icon="close" icon-size="xs" size="lg" type="button"
            aria-label="Закрыть панель" data-sidebar-sheet-close />
        <div class="sidebar-sheet__mobile-handle-wrap">
            <x-button class="sidebar-sheet__mobile-handle" tone="muted" size="sm" radius="circle" type="button"
                aria-label="Закрыть панель" data-sidebar-sheet-close>
                <span class="sidebar-sheet__mobile-handle-line"></span>
            </x-button>
        </div>

        <div class="sidebar-sheet__body shadow-safe">
            {{ $slot }}
        </div>
    </aside>
</div>
