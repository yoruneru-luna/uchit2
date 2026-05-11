<x-layouts.auth>
    <form class="form auth-page__form _container" action="{{ route('password.update') }}" method="POST">
        @csrf

        <input type="hidden" name="token" value="{{ $token }}">
        <input type="hidden" name="email" value="{{ $email }}">

        <x-form-header title="Новый пароль" subtitle="Придумайте новый пароль для аккаунта — {{ $email }}" />

        <x-input type="password" placeholder="Введите новый пароль" name="password" shadow :status="$errors->has('password') ? 'error' : null"
            :message="$errors->first('password')" />

        <x-input type="password" placeholder="Повторите пароль" name="password_confirmation" shadow :status="$errors->has('password_confirmation') ? 'error' : null"
            :message="$errors->first('password_confirmation')" />

        <div class="auth-page__buttons">
            <x-button class="form__button" variant="primary" radius="12" size="lg" type="submit" shadow>
                Сохранить пароль
            </x-button>

            <x-button as="a" href="{{ route('welcome') }}" class="form__button" variant="secondary"
                radius="12" size="lg" shadow>
                Назад
            </x-button>
        </div>
    </form>
</x-layouts.auth>
