@props(['title', 'subtitle' => null])

<div class="form__header form-header">
    <h1 class="form__heading form-header__heading heading heading--2">
        {{ $title }}
    </h1>

    <p class="form__subtitle form-header__subtitle subtitle subtitle--2">
        {{ $subtitle }}
    </p>
</div>
