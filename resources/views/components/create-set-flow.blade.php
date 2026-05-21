<div class="create-set-flow" data-create-set-flow>
    <div class="create-set-flow__screen is-active" data-create-set-screen="create-set">
        <x-set-form mode="create" action="{{ route('sets.store') }}" method="POST" :form-attributes="[
            'data-create-set-form' => true,
        ]" />
    </div>

    <div class="create-set-flow__screen" data-create-set-screen="set-created">
        <x-set-created-success />
    </div>

    <div class="create-set-flow__screen" data-create-set-screen="create-card">
        <x-card-form mode="after-set" :current="1" :required="5" />
    </div>
</div>
