<x-layouts.auth header="auth">
    <form class="form auth-page__form _container" action="{{ route('register.store') }}" method="POST"
        data-register-validate-url="{{ route('register.validate') }}">
        @csrf
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <x-form-header title="Регистрация"
            subtitle="Вы регистрируйтесь с эл. почтой —  {{ $email }}"></x-form-header>


        <x-input status="" placeholder="Введите имя" name="name" shadow=true :status="$errors->has('name') ? 'error' : null"
            :message="$errors->first('name')" />
        <x-input status="" placeholder="Введите никнейм" name="nickname" shadow=true :status="$errors->has('nickname') ? 'error' : null"
            :message="$errors->first('nickname')" />
        <x-input picker="date" icon="calendar" name="birthday" placeholder="Дата рождения" shadow=true
            :status="$errors->has('calendar') ? 'error' : null" :message="$errors->first('calendar')" />
        <x-input status="" type="password" placeholder="Введите пароль" name="password" shadow=true
            :status="$errors->has('password') ? 'error' : null" :message="$errors->first('password')" />
        <x-input status="" type="password" placeholder="Повторите пароль" name="password_confirmation" shadow=true
            :status="$errors->has('password_confirmation') ? 'error' : null" :message="$errors->first('password_confirmation')" />

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
