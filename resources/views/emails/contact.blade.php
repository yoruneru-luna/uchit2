<h2>Новое обращение с сайта</h2>

<p><strong>Имя:</strong> {{ $name }}</p>
<p><strong>Email:</strong> {{ $email }}</p>
<p><strong>Тема:</strong> {{ $subjectText }}</p>

<hr>

<p>{!! nl2br(e($messageText)) !!}</p>
