@props(['label', 'for' => null, 'hint' => null, 'required' => false])

<div {{ $attributes->class(['form-field']) }}>
    <label class="form-field__label subtitle subtitle--2" @if ($for) for="{{ $for }}" @endif>
        {{ $label }}

        @if ($required)
            <span class="form-field__required" aria-hidden="true">*</span>
        @endif
    </label>

    {{ $slot }}

    @if ($hint)
        <p class="form-field__hint subtitle subtitle--2">
            {{ $hint }}
        </p>
    @endif
</div>
