@props([
    'type' => 'text',
    'name',
    'value' => null,
    'placeholder' => null,
    'status' => null, // null | error | success
    'message' => null,
    'clearable' => true,
    'shadow' => false,
    'icon' => null,
    'picker' => null,
])

@php
    $classes = collect(['input', $status ? "is-{$status}" : null, $picker ? "input--{$picker}" : null])
        ->filter()
        ->implode(' ');
@endphp

<div class="{{ $classes }}">
    <x-input-field :type="$type" :name="$name" :value="$value" :placeholder="$placeholder" :clearable="$clearable"
        :shadow="$shadow" :icon="$icon" :picker="$picker" icon-position="right" />

    <span class="input__status" aria-hidden="true">
        <x-icon id="check" size="xs" />
    </span>

    <p class="input__message">
        {{ $message }}
    </p>
</div>
