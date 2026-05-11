<section {{ $attributes->merge(['class' => 'progress-card shadow']) }}>
    <h2 class="progress-card__title heading heading--4">
        Прогресс
    </h2>

    <div class="progress-card__bar" data-progress-bar>
        <span class="progress-card__segment progress-card__segment--fading">
            <span class="progress-card__legend-item progress-card__legend-item--fading">
                10% забыто
            </span>
        </span>

        <span class="progress-card__segment progress-card__segment--learned">
            <span class="progress-card__legend-item progress-card__legend-item--learned">
                30% выучено
            </span>
        </span>

        <span class="progress-card__segment progress-card__segment--process">
            <span class="progress-card__legend-item progress-card__legend-item--process">
                40% в процессе
            </span>
        </span>

        <span class="progress-card__segment progress-card__segment--new">
            <span class="progress-card__legend-item progress-card__legend-item--new">
                20% новые
            </span>
        </span>
    </div>
</section>
