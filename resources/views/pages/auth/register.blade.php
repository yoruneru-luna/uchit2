<x-layouts.auth title="Регистрация">
    <form class="form auth-page__form _container" action="{{ route('register.store') }}" method="POST"
        data-register-validate-url="{{ route('register.validate') }}">
        @csrf

        <x-form-header title="Регистрация"
            subtitle="Вы регистрируйтесь с эл. почтой — {{ $email }}"></x-form-header>


        <x-input placeholder="Введите имя*" name="name" shadow=true :status="$errors->has('name') ? 'error' : (old('name') ? 'success' : null)" :message="$errors->first('name')" />
        <x-input placeholder="Введите никнейм" name="nickname" shadow=true :status="$errors->has('nickname') ? 'error' : (old('nickname') ? 'success' : null)" :message="$errors->first('nickname')" />
        <x-input type="password" placeholder="Введите пароль*" name="password" shadow=true :status="$errors->has('password') ? 'error' : null"
            :message="$errors->first('password')" />
        <x-input type="password" placeholder="Повторите пароль" name="password_confirmation" shadow=true
            :status="$errors->has('password_confirmation') ? 'error' : null" :message="$errors->first('password_confirmation')" />

        <div class="auth-page__buttons">

            <x-button class="form__button" variant="primary" radius="12" size="lg" type="submit" shadow=true>
                Продолжить
            </x-button>

            <x-button as="a" href="{{ route('welcome') }}" class="form__button" variant="secondary" radius="12"
                size="lg" shadow=true>
                Назад
            </x-button>

        </div>

    </form>
</x-layouts.auth>
