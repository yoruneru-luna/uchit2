<x-layouts.auth header="auth">
    <form class="form auth-page__form _container" action="{{ route('welcome.check') }}" method="POST">
        @csrf
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <x-form-header title="Вход"
            subtitle="Аккаунт будет создан автоматически при первой авторизации"></x-form-header>

        <x-button as="a" href="{{ route('auth.yandex.redirect') }}" icon="yandex" icon-size="lg"
            variant="secondary" radius="12" size="lg" type="button" class="form__button" shadow=true>
            Войти с Яндекс
        </x-button>

        <div class="auth-page__divider">
            <span>или</span>
        </div>

        <x-input name="email" type="email" placeholder="Введите эл. почту" :status="$errors->has('email') ? 'error' : null" :message="$errors->first('email')"
            shadow data-validate-email-url="{{ route('welcome.validate-email') }}" />

        <p class="auth-page__agreement">
            Нажимая «Продолжить» Вы принимаете положения, которые содержат
            <a href="#">Условия предоставления услуг</a>
            и
            <a href="#">Политику конфиденциальности Учить</a>
        </p>

        <div class="auth-page__buttons">

            <x-button class="form__button" variant="primary" radius="12" size="lg" type="submit" shadow=true>
                Продолжить
            </x-button>

            <x-button as="a" href="/" class="form__button" variant="secondary" radius="12"
                size="lg" shadow=true>
                Назад
            </x-button>

        </div>

    </form>
</x-layouts.auth>
