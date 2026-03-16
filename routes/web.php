<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return redirect()->route('login');
});
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/change-password', [ProfileController::class, 'editPassword'])->middleware('auth')->name('profile.password.edit');
    Route::get('/activity-logs', [App\Http\Controllers\ActivityLogController::class, 'index'])->middleware('auth')->name('activity-logs');

    // Notifications
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // POS / Bookings
    Route::get('/bookings', [App\Http\Controllers\CourtBookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/create', [App\Http\Controllers\CourtBookingController::class, 'create'])->name('bookings.create');
    Route::post('/bookings', [App\Http\Controllers\CourtBookingController::class, 'store'])->name('bookings.store');
    Route::get('/bookings/guests', [App\Http\Controllers\CourtBookingController::class, 'getGuests'])->name('bookings.guests');
    Route::get('/my-bookings', [App\Http\Controllers\CourtBookingController::class, 'myBookings'])->name('bookings.my');
    Route::post('/bookings/{booking}/cancel', [App\Http\Controllers\CourtBookingController::class, 'cancel'])->name('bookings.cancel');

    // Tournaments
    Route::get('/tournaments/manage', [App\Http\Controllers\TournamentController::class, 'manage'])->name('tournaments.manage');
    Route::get('/tournaments/create', [App\Http\Controllers\TournamentController::class, 'create'])->name('tournaments.create');
    Route::post('/tournaments', [App\Http\Controllers\TournamentController::class, 'storeTournament'])->name('tournaments.store');
    Route::get('/tournaments/{tournament}/edit', [App\Http\Controllers\TournamentController::class, 'edit'])->name('tournaments.edit');
    Route::put('/tournaments/{tournament}', [App\Http\Controllers\TournamentController::class, 'update'])->name('tournaments.update');
    Route::get('/tournaments/{tournament}/participants', [App\Http\Controllers\TournamentController::class, 'participants'])->name('tournaments.participants');
    Route::delete('/tournaments/{tournament}/participants/{registration}', [App\Http\Controllers\TournamentController::class, 'removeParticipant'])->name('tournaments.participants.remove');
    Route::patch('/tournaments/{tournament}/participants/{registration}/pay', [App\Http\Controllers\TournamentController::class, 'markAsPaid'])->name('tournaments.participants.mark-as-paid');
    Route::resource('tournaments', App\Http\Controllers\TournamentController::class)->only(['index', 'show']);
    Route::post('/tournaments/{tournament}/register', [App\Http\Controllers\TournamentController::class, 'store'])->name('tournaments.register');
    Route::get('/tournaments/{tournament}/book-court', [App\Http\Controllers\TournamentController::class, 'bookCourt'])->name('tournaments.book-court');
    Route::post('/tournaments/{tournament}/book-court', [App\Http\Controllers\TournamentController::class, 'storeCourtBooking'])->name('tournaments.book-court.store');
    Route::get('/tournaments/{tournament}/my-court-bookings', [App\Http\Controllers\TournamentController::class, 'myCourtBookings'])->name('tournaments.my-court-bookings');
    Route::get('/tournaments/{tournament}/court-bookings', [App\Http\Controllers\TournamentController::class, 'courtBookings'])->name('tournaments.court-bookings');
    Route::patch('/tournaments/{tournament}/court-bookings/{booking}/pay', [App\Http\Controllers\TournamentController::class, 'markCourtBookingPaid'])->name('tournaments.court-bookings.pay');
    Route::post('/tournaments/{tournament}/court-bookings/{booking}/cancel', [App\Http\Controllers\TournamentController::class, 'cancelCourtBooking'])->name('tournaments.court-bookings.cancel');

    // Memberships
    Route::get('/memberships/create', [App\Http\Controllers\MemberSubscriptionController::class, 'create'])->name('memberships.create');
    Route::get('/memberships', [App\Http\Controllers\MemberSubscriptionController::class, 'index'])->name('memberships.index');
    Route::get('/manage-memberships', [App\Http\Controllers\MemberSubscriptionController::class, 'manage'])->name('memberships.manage');
    Route::get('/memberships/create', [App\Http\Controllers\MemberSubscriptionController::class, 'create'])->name('memberships.create');
    Route::post('/memberships', [App\Http\Controllers\MemberSubscriptionController::class, 'store'])->name('memberships.store');
    Route::put('/memberships/{user}', [App\Http\Controllers\MemberSubscriptionController::class, 'update'])->name('memberships.update'); // Added update route
    Route::post('/memberships', [App\Http\Controllers\MemberSubscriptionController::class, 'store'])->name('memberships.store');
    Route::get('/api/users/search', [App\Http\Controllers\MemberSubscriptionController::class, 'search'])->name('api.users.search');
    Route::get('/api/tournament-court-bookings/customers', function (\Illuminate\Http\Request $request) {
        $search = $request->input('search', '');
        $query = \App\Models\TournamentCourtBooking::query()
            ->with('user:id,name');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"))
                  ->orWhere('guest_name', 'like', "%{$search}%");
            });
        }
        $results = $query->limit(5)->get()
            ->map(fn($b) => $b->guest_name ?? $b->user?->name ?? 'Guest')
            ->unique()->values();
        return response()->json($results);
    })->middleware('auth')->name('api.tournament-court-bookings.customers');

    Route::get('/api/tournaments/active', function (\Illuminate\Http\Request $request) {
        $query = \App\Models\Tournament::whereIn('status', ['open', 'ongoing'])
            ->orderBy('id', 'desc');
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        } else {
            $query->limit(5);
        }
        return $query->get(['id', 'name', 'status']);
    })->middleware('auth')->name('api.tournaments.active');

    // Payment Verification
    Route::get('/payments/verify/court', [App\Http\Controllers\PaymentVerificationController::class, 'courtBookings'])->name('payments.verify.court');
    Route::get('/payments/verify/tournament', [App\Http\Controllers\PaymentVerificationController::class, 'tournamentBookings'])->name('payments.verify.tournament');
    Route::get('/payments/verify/tournament-court', [App\Http\Controllers\PaymentVerificationController::class, 'tournamentCourtBookings'])->name('payments.verify.tournament-court');
    Route::post('/payments/verify/booking/{booking}/pay', [App\Http\Controllers\PaymentVerificationController::class, 'markBookingPaid'])->name('payments.verify.booking.pay');
    Route::post('/payments/verify/tournament/{registration}/pay', [App\Http\Controllers\PaymentVerificationController::class, 'markTournamentRegistrationPaid'])->name('payments.verify.tournament.pay');
    Route::post('/payments/verify/tournament-court/{booking}/pay', [App\Http\Controllers\PaymentVerificationController::class, 'markTournamentCourtBookingPaid'])->name('payments.verify.tournament-court.pay');

    // Users
    Route::put('/users/{user}/password', [App\Http\Controllers\UserController::class, 'changePassword'])->name('users.password.update');
    Route::resource('users', App\Http\Controllers\UserController::class);

    // Expenses
    Route::resource('expenses', App\Http\Controllers\ExpenseController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('incomes', App\Http\Controllers\IncomeController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('/expenses/export', [App\Http\Controllers\ExpenseController::class, 'export'])->name('expenses.export');

    // Admin Settings
    Route::get('/settings', [App\Http\Controllers\SettingController::class, 'index'])->name('settings.index');
    Route::get('/settings/activity-logs', [App\Http\Controllers\ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::post('/settings', [App\Http\Controllers\SettingController::class, 'update'])->name('settings.update');
    Route::post('/settings/qr-code', [App\Http\Controllers\SettingController::class, 'uploadQrCode'])->name('settings.qr-code.upload');
    Route::delete('/settings/qr-code', [App\Http\Controllers\SettingController::class, 'deleteQrCode'])->name('settings.qr-code.delete');

    // Reports
    Route::get('/reports/bookings', [App\Http\Controllers\ReportsController::class, 'bookingReport'])->name('reports.bookings');
    Route::get('/reports/bookings/export', [App\Http\Controllers\ReportsController::class, 'exportBookingReport'])->name('reports.bookings.export');
    Route::get('/reports/members', [App\Http\Controllers\ReportsController::class, 'memberReport'])->name('reports.members');
    Route::get('/reports/members/export', [App\Http\Controllers\ReportsController::class, 'exportMemberReport'])->name('reports.members.export');
    Route::get('/reports/revenue', [App\Http\Controllers\ReportsController::class, 'revenueReport'])->name('reports.revenue');
    Route::get('/reports/revenue/export', [App\Http\Controllers\ReportsController::class, 'exportRevenueReport'])->name('reports.revenue.export');
    Route::get('/reports/tournaments', [App\Http\Controllers\ReportsController::class, 'tournamentReport'])->name('reports.tournaments');
    Route::get('/reports/tournaments/export', [App\Http\Controllers\ReportsController::class, 'exportTournamentReport'])->name('reports.tournaments.export');
    Route::get('/reports/tournaments/{tournament}/participants', [App\Http\Controllers\ReportsController::class, 'tournamentParticipants'])->name('reports.tournaments.participants');
    Route::get('/reports/tournaments/{tournament}/participants/export', [App\Http\Controllers\ReportsController::class, 'exportTournamentParticipants'])->name('reports.tournaments.participants.export');
    Route::get('/reports/tournament-courts', [App\Http\Controllers\ReportsController::class, 'tournamentCourtReport'])->name('reports.tournament-courts');
    Route::get('/reports/tournament-courts/export', [App\Http\Controllers\ReportsController::class, 'exportTournamentCourtReport'])->name('reports.tournament-courts.export');

// User Guide
    Route::get('/user-guide', [App\Http\Controllers\UserGuideController::class, 'index'])->name('user-guide.index');

    Route::middleware(['auth'])->group(function () {
        Route::post('/user-guide', [App\Http\Controllers\UserGuideController::class, 'store'])->name('user-guide.store');
        Route::patch('/user-guide/{userGuide}', [App\Http\Controllers\UserGuideController::class, 'update'])->name('user-guide.update');
        Route::delete('/user-guide/{userGuide}', [App\Http\Controllers\UserGuideController::class, 'destroy'])->name('user-guide.destroy');
        Route::post('/user-guide/reorder', [App\Http\Controllers\UserGuideController::class, 'reorder'])->name('user-guide.reorder');
    });
});


// TEMP TEST ROUTES - remove after testing
Route::get('/test/membership-expiry-seed', function () {
    $user = App\Models\User::where('id', 3)->first();
    $admin = App\Models\User::where('type', 'admin')->first();
    if (!$user) return 'No non-admin user found.';
    App\Models\MemberSubscription::create([
        'user_id' => $user->id,
        'staff_id' => $admin->id,
        'type' => 'monthly',
        'start_date' => now()->subDays(30),
        'end_date' => now()->addDays(3),
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'amount_paid' => 500,
    ]);
    App\Models\MemberSubscription::create([
        'user_id' => $user->id,
        'staff_id' => $admin->id,
        'type' => 'annual',
        'start_date' => now()->subYear(),
        'end_date' => now()->subDays(2),
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'amount_paid' => 2000,
    ]);
    return 'Test subscriptions created for user: ' . $user->name . ' (type: ' . $user->type->value . ')';
})->middleware('auth');

Route::get('/test/membership-expiry-run', function () {
    \Illuminate\Support\Facades\Cache::forget('membership_expiry_checked');
    (new App\Http\Middleware\CheckMembershipExpiry())->checkExpiry();
    return 'Expiry check ran. Check your notifications.';
})->middleware('auth');

require __DIR__ . '/auth.php';
