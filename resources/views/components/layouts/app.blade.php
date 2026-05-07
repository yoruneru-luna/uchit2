@props([
    'header' => 'app',
    'title' => 'Учить',
])

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $title }}</title>
    @vite(['resources/scss/main.scss', 'resources/js/app.js'])
    <link rel="shortcut icon" href="{{ asset('logo/logo-icon.png') }}" type="image/x-icon">
</head>

<body>
    <x-svg-sprite />

    <div class="wrapper">

        <x-header :variant="$header" />

        {{ $slot }}

    </div>

</body>

</html>
