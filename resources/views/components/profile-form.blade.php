<section class="profile-form base-section">
    <h2 class="profile-form__title heading heading--3">
        Редактирование профиля
    </h2>

    <form class="profile-form__form base-section" action="{{ route('profile.update') }}" method="POST"
        enctype="multipart/form-data" data-profile-form data-profile-url="{{ route('profile.show') }}">
        @csrf
        @method('PATCH')

        <div class="profile-form__avatar-field">
            <div class="profile-form__avatar-preview" data-profile-avatar-preview>
                <x-icon id="profile" size="md" class="profile-form__avatar-icon" />
            </div>

            <label
                class="profile-form__avatar-upload button button--image button--sm button--radius-12 text text--small">
                <input class="profile-form__avatar-input" type="file" name="avatar"
                    accept="image/jpeg,image/png,image/webp" data-profile-avatar-input>

                <span class="button__inner shadow">
                    <x-icon id="image" size="sm" class="button__icon" />

                    <span class="button__text">
                        Загрузить фото
                    </span>

                    <span class="button__description">
                        JPG, PNG или WEBP до 5 МБ
                    </span>
                </span>
            </label>

            <input type="hidden" name="remove_avatar" value="0" data-profile-remove-avatar>

            <x-button class="profile-form__avatar-remove" tone="danger-ghost" radius="12" size="sm"
                type="button" icon="trash" icon-size="sm" data-profile-avatar-remove shadow>
                Удалить фото
            </x-button>
        </div>

        <x-form-field label="Имя" for="profile-name" required>
            <x-input id="profile-name" name="name" placeholder="Введите имя" shadow />
        </x-form-field>

        <x-form-field label="Nickname" for="profile-nickname" required>
            <x-input id="profile-nickname" name="nickname" placeholder="user" shadow />
        </x-form-field>

        <x-button class="profile-form__submit" variant="primary" radius="12" size="lg" type="submit">
            Сохранить изменения
        </x-button>
    </form>
</section>
