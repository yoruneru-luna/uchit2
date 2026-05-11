@props(['name', 'checked' => false, 'disabled' => false, 'label' => null, 'value' => 1])

<label {{ $attributes->class(['switch']) }}>
    <input class="switch__input" type="checkbox" name="{{ $name }}" value="{{ $value }}"
        @checked($checked) @disabled($disabled)>

    <span class="switch__control" aria-hidden="true"></span>

    @if ($label)
        <span class="switch__label">{{ $label }}</span>
    @endif
</label>
