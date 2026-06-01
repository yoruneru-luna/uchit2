<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SetController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\StudyReviewController;
use App\Http\Controllers\StudyController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SubscriptionController;
use App\Models\Card;
use App\Models\CardReviewProgress;
use App\Models\CardReviewLog;
use App\Models\StudySet;
use App\Http\Controllers\NotificationController;
use App\Services\StudyQueueService;
use Illuminate\Support\Facades\Password;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

Route::get('/ui-kit', function () {
    return view('ui-kit');
})->name('ui-kit');

Route::view('/policy', 'components.legal.policy')->name('policy');
Route::view('/terms', 'components.legal.terms')->name('terms');

Route::post('/contact', [ContactController::class, 'store'])
    ->name('contact.store');

Route::middleware('guest')->group(function () {
    Route::view('/', 'pages/landing')->name('landing');

    Route::get('/welcome', [AuthController::class, 'welcome'])->name('welcome');
    Route::post('/welcome/validate-email', [AuthController::class, 'validateEmail'])
        ->name('welcome.validate-email');
    Route::post('/welcome', [AuthController::class, 'checkEmail'])->name('welcome.check');

    Route::get('/login', [AuthController::class, 'loginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');

    Route::get('/register', [AuthController::class, 'registerForm'])->name('register');
    Route::post('/register/validate', [AuthController::class, 'validateRegister'])
        ->name('register.validate');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');

    Route::get('/auth/yandex/redirect', [AuthController::class, 'redirectToYandex'])->name('auth.yandex.redirect');
    Route::get('/auth/yandex/callback', [AuthController::class, 'handleYandexCallback'])->name('auth.yandex.callback');

    Route::get('/forgot-password', [PasswordResetController::class, 'request'])
        ->name('password.request');

    Route::post('/forgot-password', [PasswordResetController::class, 'email'])
        ->name('password.email');

    Route::get('/reset-password/{token}', [PasswordResetController::class, 'reset'])
        ->name('password.reset');

    Route::post('/reset-password', [PasswordResetController::class, 'update'])
        ->name('password.update');
});

Route::middleware(['auth', 'not_blocked'])->group(function () {
    Route::get('/home', function (StudyQueueService $studyQueue) {
        $user = auth()->user();

        $studyQueue->introduceNewCardsForToday($user);

        $hasCards = Card::query()
            ->where('user_id', $user->id)
            ->exists();

        $repeatCount = CardReviewProgress::query()
            ->where('user_id', $user->id)
            ->whereNotNull('due_at')
            ->where('due_at', '<=', now())
            ->whereHas('studySet', function ($query) {
                $query->where('fsrs_enabled', true);
            })
            ->count();

        $repeatState = match (true) {
            ! $hasCards => 'onboarding',
            $repeatCount > 0 => 'due',
            default => 'empty',
        };

        $learnedCardsCount = CardReviewProgress::query()
            ->where('user_id', $user->id)
            ->where('state', 'review')
            ->count();

        $inProgressCardsCount = CardReviewProgress::query()
            ->where('user_id', $user->id)
            ->whereIn('state', ['learning', 'relearning'])
            ->count();

        $totalReviewsCount = CardReviewLog::query()
            ->where('user_id', $user->id)
            ->count();

        $successfulReviewsCount = CardReviewLog::query()
            ->where('user_id', $user->id)
            ->whereIn('rating', ['hard', 'good', 'easy'])
            ->count();

        $retentionPercent = $totalReviewsCount > 0
            ? (int) round(($successfulReviewsCount / $totalReviewsCount) * 100)
            : 0;

        $onTimeReviewsCount = CardReviewLog::query()
            ->where('user_id', $user->id)
            ->whereIn('rating', ['hard', 'good', 'easy'])
            ->count();

        $setsCount = StudySet::query()
            ->where('user_id', $user->id)
            ->count();

        $cardsCount = Card::query()
            ->where('user_id', $user->id)
            ->count();

        $profileStats = [
            'learned_cards_count' => $learnedCardsCount,
            'on_time_reviews_count' => $onTimeReviewsCount,
            'retention_percent' => $retentionPercent,
            'in_progress_cards_count' => $inProgressCardsCount,
            'sets_count' => $setsCount,
            'cards_count' => $cardsCount,
            'repeat_count' => $repeatCount,
        ];

        $totalCardsCount = Card::query()
            ->where('cards.user_id', $user->id)
            ->whereHas('studySet', function ($query) {
                $query->where('fsrs_enabled', true);
            })
            ->count();

        $progressCardsCount = CardReviewProgress::query()
            ->where('user_id', $user->id)
            ->whereHas('studySet', function ($query) {
                $query->where('fsrs_enabled', true);
            })
            ->count();

        $newCardsCount = max(0, $totalCardsCount - $progressCardsCount);

        $fadingCardsCount = CardReviewProgress::query()
            ->where('user_id', $user->id)
            ->whereNotNull('due_at')
            ->where('due_at', '<=', now())
            ->whereHas('studySet', function ($query) {
                $query->where('fsrs_enabled', true);
            })
            ->count();

        $longTermBorder = now()->copy()->addYear();

        $learnedThresholdDays = (int) config('fsrs.learned_threshold_days', 90);

        $learnedCardsCount = CardReviewProgress::query()
            ->where('user_id', $user->id)
            ->where('state', 'review')
            ->whereHas('studySet', function ($query) {
                $query->where('fsrs_enabled', true);
            })
            ->where('scheduled_days', '>=', $learnedThresholdDays)
            ->where(function ($query) {
                $query
                    ->whereNull('due_at')
                    ->orWhere('due_at', '>', now());
            })
            ->count();

        $processCardsCount = max(
            0,
            $progressCardsCount - $fadingCardsCount - $learnedCardsCount
        );

        $toPercent = function (int $count) use ($totalCardsCount) {
            if ($totalCardsCount <= 0) {
                return 0;
            }

            return (int) round(($count / $totalCardsCount) * 100);
        };

        $progressSummary = [
            'fading' => $toPercent($fadingCardsCount),
            'learned' => $toPercent($learnedCardsCount),
            'process' => $toPercent($processCardsCount),
            'new' => $toPercent($newCardsCount),
        ];

        return view('pages.home', [
            'repeatState' => $repeatState,
            'repeatCount' => $repeatCount,
            'profileStats' => $profileStats,
            'total_reviews_count' => $totalReviewsCount,
            'progressSummary' => $progressSummary,
        ]);
    })->name('home');

    Route::get('/study/due-cards', [StudyController::class, 'dueCards'])
        ->name('study.due-cards');

    Route::get('/categories', [CategoryController::class, 'index'])
        ->name('categories.index');
    Route::get('/categories/check-title', [CategoryController::class, 'checkTitle'])
        ->name('categories.check-title');
    Route::post('/categories', [CategoryController::class, 'store'])
        ->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])
        ->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
        ->name('categories.destroy');

    Route::get('/api/sets', [SetController::class, 'index'])
        ->name('sets.index');
    Route::get('/sets/create-data', [SetController::class, 'createData'])
        ->name('sets.create-data');
    Route::get('/sets/check-title', [SetController::class, 'checkTitle'])->name('sets.check-title');
    Route::post('/sets', [SetController::class, 'store'])->name('sets.store');
    Route::put('/sets/{set}', [SetController::class, 'update'])
        ->name('sets.update');
    Route::delete('/sets/{set}', [SetController::class, 'destroy'])
        ->name('sets.destroy');

    Route::get('/sets/{set}/cards', [CardController::class, 'index'])
        ->name('cards.index');
    Route::post('/cards/check-duplicates', [CardController::class, 'checkDuplicates'])
        ->name('cards.check-duplicates');
    Route::post('/cards', [CardController::class, 'store'])
        ->name('cards.store');

    Route::post('/cards/suggestions', [CardController::class, 'suggestions'])
        ->name('cards.suggestions');
    Route::post('/cards/suggestion-image', [CardController::class, 'suggestionImage'])
        ->name('cards.suggestion-image');
    Route::get('/cards/{card}', [CardController::class, 'show'])
        ->name('cards.show');
    Route::match(['put', 'patch'], '/cards/{card}', [CardController::class, 'update'])
        ->name('cards.update');
    Route::delete('/cards/{card}', [CardController::class, 'destroy'])
        ->name('cards.destroy');

    Route::get('/profile', [ProfileController::class, 'show'])
        ->name('profile.show');
    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');
    Route::patch('/settings/learning', [ProfileController::class, 'updateLearningSettings'])
        ->name('settings.learning.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');

    Route::get('/global-search', [GlobalSearchController::class, 'index'])
        ->name('global-search.index');
    Route::get('/global-search/sets/{set}', [GlobalSearchController::class, 'show'])
        ->name('global-search.show');
    Route::post('/global-search/sets/{set}/save', [GlobalSearchController::class, 'save'])
        ->name('global-search.save');

    Route::post('/study/review', [StudyReviewController::class, 'store'])
        ->name('study.review.store');
    Route::get('/sets/{set}/study-cards', [StudyController::class, 'cards'])
        ->name('study.cards');

    Route::get('/notifications', [NotificationController::class, 'index'])
        ->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])
        ->name('notifications.read-all');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])
        ->name('notifications.destroy');
    Route::delete('/notifications', [NotificationController::class, 'destroyAll'])
        ->name('notifications.destroy-all');

    Route::post('/subscription/checkout', [SubscriptionController::class, 'checkout'])
        ->name('subscription.checkout');
    Route::get('/subscription/success', [SubscriptionController::class, 'success'])
        ->name('subscription.success');
    Route::post('/subscription/cancel', [SubscriptionController::class, 'cancel'])
        ->name('subscription.cancel');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

Route::middleware(['auth', 'not_blocked', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/users', [AdminController::class, 'users'])
            ->name('users');

        Route::post('/users/{user}/block', [AdminController::class, 'blockUser'])
            ->name('users.block');

        Route::post('/users/{user}/unblock', [AdminController::class, 'unblockUser'])
            ->name('users.unblock');

        Route::get('/public-sets', [AdminController::class, 'publicSets'])
            ->name('public-sets');

        Route::get('/public-sets/{set}', [AdminController::class, 'publicSet'])
            ->name('public-sets.show');

        Route::post('/public-sets/{set}/block', [AdminController::class, 'blockPublicSet'])
            ->name('public-sets.block');

        Route::post('/public-sets/{set}/unblock', [AdminController::class, 'unblockPublicSet'])
            ->name('public-sets.unblock');
    });
