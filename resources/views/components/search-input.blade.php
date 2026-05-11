@props([
    'name' => 'search',
    'value' => null,
    'placeholder' => 'Найти',
    'shadow' => true,
])

<x-input-field :name="$name" :value="$value" :placeholder="$placeholder" icon="search" icon-position="left" variant="search"
    :shadow="$shadow" {{ $attributes }} />
