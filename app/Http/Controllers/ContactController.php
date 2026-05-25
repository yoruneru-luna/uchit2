<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['nullable', 'string', 'max:150'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        Mail::send('emails.contact', [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subjectText' => $validated['subject'] ?? 'Обращение с сайта',
            'messageText' => $validated['message'],
        ], function ($message) use ($validated) {
            $message
                ->to(config('mail.support_address', config('mail.from.address')))
                ->replyTo($validated['email'], $validated['name'])
                ->subject($validated['subject'] ?? 'Обращение с сайта');
        });

        return response()->json([
            'message' => 'Обращение отправлено',
        ]);
    }
}
