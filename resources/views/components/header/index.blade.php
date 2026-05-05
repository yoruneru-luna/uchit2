@props([
    'variant' => 'auth', // landing | auth | app
])

<x-dynamic-component :component="'header.' . $variant" />
