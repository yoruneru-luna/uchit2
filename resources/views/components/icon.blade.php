@props(['id', 'size' => 'sm', 'class' => ''])

<svg {{ $attributes->class(['icon', 'icon--' . $size, $class]) }}>
    <use href="#icon-{{ $id }}"></use>
</svg>
