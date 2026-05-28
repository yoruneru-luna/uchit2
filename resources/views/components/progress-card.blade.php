@props([
    'progress' => [
        'fading' => 0,
        'learned' => 0,
        'process' => 0,
        'new' => 0,
    ],
])

@php
    $fading = $progress['fading'] ?? 0;
    $learned = $progress['learned'] ?? 0;
    $process = $progress['process'] ?? 0;
    $new = $progress['new'] ?? 0;
@endphp

<section {{ $attributes->merge(['class' => 'progress-card shadow']) }}>
    <h2 class="progress-card__title heading heading--4">
        Прогресс
    </h2>

    <div class="progress-card__bar" data-progress-bar>
        <span class="progress-card__segment progress-card__segment--fading" style="width: {{ $fading }}%;">
            <span
                class="progress-card__legend-item progress-card__legend-item--fading progress-card__legend-item--left progress-card__legend-item--top">
                {{ $fading }}% забыто
            </span>
        </span>

        <span class="progress-card__segment progress-card__segment--learned" style="width: {{ $learned }}%;">
            <span class="progress-card__legend-item progress-card__legend-item--learned">
                {{ $learned }}% выучено
            </span>
        </span>

        <span class="progress-card__segment progress-card__segment--process" style="width: {{ $process }}%;">
            <span
                class="progress-card__legend-item progress-card__legend-item--process progress-card__legend-item--top">
                {{ $process }}% в процессе
            </span>
        </span>

        <span class="progress-card__segment progress-card__segment--new" style="width: {{ $new }}%;">
            <span class="progress-card__legend-item progress-card__legend-item--new progress-card__legend-item--right">
                {{ $new }}% новые
            </span>
        </span>
    </div>
</section>
