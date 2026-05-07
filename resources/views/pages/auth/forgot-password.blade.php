<x-layouts.auth header="auth">
    <form class="form auth-page__form _container" action="{{ route('password.email') }}" method="POST">
        @csrf

        <x-form-header title="Восстановление пароля"
            subtitle="Мы отправим ссылку для восстановления на {{ $email }}" />

        @if ($errors->has('reset'))
            <p class="auth-page__error">
                {{ $errors->first('reset') }}
            </p>
        @endif
        <input type="hidden" name="email" value="{{ $email }}">

        <div class="auth-page__buttons">
            <x-button class="form__button" variant="primary" radius="12" size="lg" type="submit" shadow>
                Отправить ссылку
            </x-button>

            <x-button as="a" href="{{ route('login') }}" class="form__button" variant="secondary" radius="12"
                size="lg" shadow>
                Назад
            </x-button>
        </div>
    </form>
</x-layouts.auth>
