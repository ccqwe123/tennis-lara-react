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

Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

// POS / Bookings
Route::get('/bookings', [App\Http\Controllers\CourtBookingController::class, 'index'])->name('bookings.index');
Route::get('/bookings/create', [App\Http\Controllers\CourtBookingController::class, 'create'])->name('bookings.create');
Route::post('/bookings', [App\Http\Controllers\CourtBookingController::class, 'store'])->name('bookings.store');
Route::get('/my-bookings', [App\Http\Controllers\CourtBookingController::class, 'myBookings'])->name('bookings.my');

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

// Memberships
Route::get('/memberships/create', [App\Http\Controllers\MemberSubscriptionController::class, 'create'])->name('memberships.create');
Route::get('/memberships', [App\Http\Controllers\MemberSubscriptionController::class, 'index'])->name('memberships.index');
Route::get('/manage-memberships', [App\Http\Controllers\MemberSubscriptionController::class, 'manage'])->name('memberships.manage');
Route::get('/memberships/create', [App\Http\Controllers\MemberSubscriptionController::class, 'create'])->name('memberships.create');
Route::post('/memberships', [App\Http\Controllers\MemberSubscriptionController::class, 'store'])->name('memberships.store');
Route::put('/memberships/{user}', [App\Http\Controllers\MemberSubscriptionController::class, 'update'])->name('memberships.update'); // Added update route
Route::post('/memberships', [App\Http\Controllers\MemberSubscriptionController::class, 'store'])->name('memberships.store');
Route::get('/api/users/search', [App\Http\Controllers\MemberSubscriptionController::class, 'search'])->name('api.users.search');

// Payment Verification
Route::get('/payments/verify', [App\Http\Controllers\PaymentVerificationController::class, 'index'])->name('payments.verify');
Route::post('/payments/verify/booking/{booking}/pay', [App\Http\Controllers\PaymentVerificationController::class, 'markBookingPaid'])->name('payments.verify.booking.pay');
Route::post('/payments/verify/tournament/{registration}/pay', [App\Http\Controllers\PaymentVerificationController::class, 'markTournamentRegistrationPaid'])->name('payments.verify.tournament.pay');

// Users
Route::put('/users/{user}/password', [App\Http\Controllers\UserController::class, 'changePassword'])->name('users.password.update');
Route::resource('users', App\Http\Controllers\UserController::class);

// Expenses
Route::resource('expenses', App\Http\Controllers\ExpenseController::class)->only(['index', 'store', 'update', 'destroy']);

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

require __DIR__ . '/auth.php';
