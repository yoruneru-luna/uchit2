<x-layouts.auth title="Авторизация">
    <form class="form auth-page__form _container" action="{{ route('login.store') }}" method="POST">
        @csrf

        <x-form-header title="Вход" subtitle="Вы входите в аккаунт c эл. почтой — {{ $email }}"></x-form-header>

        <div class="auth-page__field-header">
            <x-button as="a" href="{{ route('password.request') }}" tone="dark">Забыли пароль?</x-button>

            <x-input type="password" placeholder="Введите пароль" name="password" :status="$errors->has('password') ? 'error' : null" :message="$errors->first('password')"
                shadow />
        </div>

        <div class="auth-page__buttons">

            <x-button class="form__button" variant="primary" radius="12" size="lg" type="submit" shadow=true>
                Продолжить
            </x-button>

            <x-button as="a" href="{{ route('welcome') }}" class="form__button" variant="secondary"
                radius="12" size="lg" shadow>
                Назад
            </x-button>

        </div>

    </form>
</x-layouts.auth>
