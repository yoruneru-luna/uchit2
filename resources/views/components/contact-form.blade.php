<section class="contact-form base-section">
    <h2 class="contact-form__title heading heading--3">
        Связаться с нами
    </h2>

    <p class="contact-form__text text text--small">
        Напишите вопрос, предложение или проблему. Ответ придёт на указанную почту.
    </p>

    <form class="contact-form__form base-section" action="{{ route('contact.store') }}" method="POST" data-contact-form>
        @csrf

        <x-form-field label="Имя" for="contact-name" required>
            <x-input id="contact-name" name="name" placeholder="Введите имя" value="{{ auth()->user()?->name }}"
                shadow />
        </x-form-field>

        <x-form-field label="Email" for="contact-email" required>
            <x-input id="contact-email" type="email" name="email" placeholder="email@example.com"
                value="{{ auth()->user()?->email }}" shadow />
        </x-form-field>

        <x-form-field label="Тема" for="contact-subject">
            <x-input id="contact-subject" name="subject" placeholder="Например: проблема с карточками" shadow />
        </x-form-field>

        <x-form-field label="Сообщение" for="contact-message" required>
            <x-textarea-field id="contact-message" name="message" maxlength="2000" placeholder="Опишите обращение"
                shadow />
        </x-form-field>

        <x-button class="contact-form__submit" variant="primary" radius="12" size="lg" type="submit">
            Отправить
        </x-button>
    </form>
</section>
