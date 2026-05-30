<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\User;

class SubscriptionController extends Controller
{
    private const SUBSCRIPTION_DAYS = 30;

    public function checkout(Request $request)
    {
        $user = $request->user();

        abort_if($user->isAdmin(), 403);

        $amount = (string) config('services.yookassa.subscription_price', '299.00');

        $localPayment = Payment::create([
            'user_id' => $user->id,
            'provider' => 'yookassa',
            'provider_payment_id' => null,
            'amount' => (int) round(((float) $amount) * 100),
            'currency' => 'RUB',
            'status' => 'pending',
            'metadata' => [
                'type' => 'subscription',
                'days' => self::SUBSCRIPTION_DAYS,
            ],
        ]);

        $paymentData = [
            'amount' => [
                'value' => number_format((float) $amount, 2, '.', ''),
                'currency' => 'RUB',
            ],
            'capture' => true,
            'confirmation' => [
                'type' => 'redirect',
                'return_url' => route('subscription.success'),
            ],
            'description' => 'Подписка PRO на 30 дней',
            'metadata' => [
                'local_payment_id' => $localPayment->id,
                'user_id' => $user->id,
                'type' => 'subscription',
            ],
        ];

        $response = Http::withBasicAuth(
            (string) config('services.yookassa.shop_id'),
            (string) config('services.yookassa.secret_key')
        )
            ->withHeaders([
                'Idempotence-Key' => Str::uuid()->toString(),
                'Content-Type' => 'application/json',
            ])
            ->post('https://api.yookassa.ru/v3/payments', $paymentData);

        if (! $response->successful()) {
            $localPayment->update([
                'status' => 'failed',
                'metadata' => [
                    ...($localPayment->metadata ?? []),
                    'error' => $response->json(),
                ],
            ]);

            return back()->withErrors([
                'subscription' => 'Не удалось создать платеж.',
            ]);
        }

        $data = $response->json();

        $localPayment->update([
            'provider_payment_id' => $data['id'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'metadata' => [
                ...($localPayment->metadata ?? []),
                'yookassa_payment_id' => $data['id'] ?? null,
            ],
        ]);

        $confirmationUrl = $data['confirmation']['confirmation_url'] ?? null;

        if (! $confirmationUrl) {
            return back()->withErrors([
                'subscription' => 'ЮKassa не вернула ссылку на оплату.',
            ]);
        }

        return redirect()->away($confirmationUrl);
    }

    public function success(Request $request)
    {
        $user = $request->user();

        abort_if($user->isAdmin(), 403);

        $payment = Payment::query()
            ->where('user_id', $user->id)
            ->where('provider', 'yookassa')
            ->whereNotNull('provider_payment_id')
            ->latest()
            ->first();

        if (! $payment) {
            return redirect()
                ->route('home')
                ->withErrors([
                    'subscription' => 'Платеж не найден.',
                ]);
        }

        $response = Http::withBasicAuth(
            (string) config('services.yookassa.shop_id'),
            (string) config('services.yookassa.secret_key')
        )
            ->get("https://api.yookassa.ru/v3/payments/{$payment->provider_payment_id}");

        if (! $response->successful()) {
            return redirect()
                ->route('home')
                ->withErrors([
                    'subscription' => 'Не удалось проверить статус платежа.',
                ]);
        }

        $data = $response->json();

        $status = $data['status'] ?? 'pending';
        $paid = (bool) ($data['paid'] ?? false);

        $payment->update([
            'status' => $status,
            'paid_at' => $paid ? now() : null,
            'metadata' => [
                ...($payment->metadata ?? []),
                'checked_at' => now()->toDateTimeString(),
                'last_yookassa_status' => $status,
            ],
        ]);

        if ($status === 'succeeded' && $paid) {
            $user->activateProSubscription(self::SUBSCRIPTION_DAYS);

            return redirect()
                ->route('home')
                ->with('success', 'Подписка PRO активирована.');
        }

        return redirect()
            ->route('home')
            ->withErrors([
                'subscription' => 'Оплата ещё не подтверждена или была отменена.',
            ]);
    }

    public function cancel(Request $request)
    {
        $user = $request->user();

        abort_if($user->isAdmin(), 403);

        $user->update([
            'subscription_plan' => 'free',
            'subscription_status' => 'inactive',
            'subscription_ends_at' => null,
        ]);

        return back()->with('success', 'Подписка отключена.');
    }

    public function canAddCards(User $user, int $cardsToAdd): bool
    {
        if ($this->isPro($user)) {
            return true;
        }

        return ($this->cardsCount($user) + $cardsToAdd) <= $this->limit('cards');
    }

    public function remainingSets(User $user): int
    {
        if ($this->isPro($user)) {
            return PHP_INT_MAX;
        }

        return max(0, $this->limit('sets') - $this->setsCount($user));
    }

    public function remainingCards(User $user): int
    {
        if ($this->isPro($user)) {
            return PHP_INT_MAX;
        }

        return max(0, $this->limit('cards') - $this->cardsCount($user));
    }
}
