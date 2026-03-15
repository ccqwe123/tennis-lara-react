<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Setting;
use App\Models\Tournament;
use App\Models\TournamentCourtBooking;
use App\Models\TournamentRegistration;
use Inertia\Inertia;

class TournamentController extends Controller
{
    public function manage(Request $request)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $query = Tournament::withCount('registrations');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Date filter
        if ($request->filled('date_from')) {
            $query->whereDate('start_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('start_date', '<=', $request->date_to);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tournaments = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($tournament) {
                return [
                    'id' => $tournament->id,
                    'name' => $tournament->name,
                    'start_date' => $tournament->start_date->format('M d, Y'),
                    'end_date' => $tournament->end_date->format('M d, Y'),
                    'registration_fee' => $tournament->registration_fee,
                    'max_participants' => $tournament->max_participants,
                    'status' => $tournament->status,
                    'registrations_count' => $tournament->registrations_count,
                    'created_at' => $tournament->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Tournaments/Manage', [
            'tournaments' => $tournaments,
            'filters' => [
                'search' => $request->search ?? '',
                'date_from' => $request->date_from ?? '',
                'date_to' => $request->date_to ?? '',
                'status' => $request->status ?? '',
            ],
        ]);
    }

    public function index()
    {
        $tournaments = Tournament::where('status', 'open')
            ->orWhere('status', 'ongoing')
            ->orderBy('start_date')
            ->get();

        return Inertia::render('Tournaments/Index', [
            'tournaments' => $tournaments
        ]);
    }

    public function show(Tournament $tournament)
    {
        $gcashQrCode = \App\Models\Setting::where('key', 'gcash_qr_code')->first()?->value;

        return Inertia::render('Tournaments/Show', [
            'tournament' => $tournament,
            'myRegistration' => $tournament->registrations()->where('user_id', auth()->id())->first(),
            'myCourtBookingsCount' => $tournament->courtBookings()->where('user_id', auth()->id())->count(),
            'gcashQrCode' => $gcashQrCode ? \Illuminate\Support\Facades\Storage::url($gcashQrCode) : null,
        ]);
    }

    public function store(Request $request, Tournament $tournament)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,gcash',
        ]);

        $registration = TournamentRegistration::create([
            'tournament_id' => $tournament->id,
            'user_id' => auth()->id(),
            'payment_method' => $request->payment_method,
            'payment_reference' => 'TRN-' . strtoupper(uniqid()),
            'payment_status' => 'unpaid',
            'amount_paid' => $tournament->registration_fee,
            'user_type_at_booking' => auth()->user()->type->value,
        ]);

        \App\Services\ActivityLogger::log('tournament_join', "User joined tournament: {$tournament->name}", $registration);

        // Notify Admins and Staff
        $adminsAndStaff = \App\Models\User::whereIn('type', ['admin', 'staff'])->get();
        \Illuminate\Support\Facades\Notification::send($adminsAndStaff, new \App\Notifications\NewTournamentRegistrationNotification($registration));

        return back()->with('success', 'Registered successfully!');
    }

    public function create()
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        return Inertia::render('Tournaments/Create');
    }

    public function storeTournament(Request $request)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'registration_fee' => 'required|numeric|min:0',
            'max_participants' => 'nullable|integer|min:1',
            'status' => 'required|in:open,ongoing,completed',
        ]);

        $tournament = Tournament::create($validated);

        \App\Services\ActivityLogger::log('tournament_create', "Admin created tournament: {$tournament->name}", $tournament);

        return redirect()->route('tournaments.manage')->with('success', 'Tournament created successfully!');
    }

    public function edit(Tournament $tournament)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        return Inertia::render('Tournaments/Edit', [
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'start_date' => $tournament->start_date->format('Y-m-d'),
                'end_date' => $tournament->end_date->format('Y-m-d'),
                'registration_fee' => $tournament->registration_fee,
                'max_participants' => $tournament->max_participants,
                'status' => $tournament->status,
            ],
        ]);
    }

    public function update(Request $request, Tournament $tournament)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'registration_fee' => 'required|numeric|min:0',
            'max_participants' => 'nullable|integer|min:1',
            'status' => 'required|in:open,ongoing,completed',
        ]);

        $tournament->update($validated);

        \App\Services\ActivityLogger::log('tournament_update', "Admin updated tournament: {$tournament->name}", $tournament);

        return redirect()->route('tournaments.manage')->with('success', 'Tournament updated successfully!');
    }

    public function participants(Tournament $tournament)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }
        // info($tournament->registrations()->with('user')->get());
        $registrations = $tournament->registrations()
            ->with('user:id,name,email,type')
            ->get()
            ->map(function ($registration) {
                return [
                    'id' => $registration->id,
                    'user_id' => $registration->user_id,
                    'user_name' => $registration->user->name,
                    'user_email' => $registration->user->email,
                    'user_type' => $registration->user_type_at_booking ? ucfirst($registration->user_type_at_booking) : $registration->user->type->value,
                    'payment_method' => $registration->payment_method,
                    'payment_status' => $registration->payment_status,
                    'amount_paid' => $registration->amount_paid,
                    'created_at' => $registration->created_at->format('M d, Y H:i'),
                ];
            });

        $summary = [
            'total' => $registrations->count(),
            'paid' => $registrations->where('payment_status', 'paid')->count(),
            'unpaid' => $registrations->where('payment_status', '!=', 'paid')->count(),
            'total_amount' => $registrations->where('payment_status', 'paid')->sum('amount_paid'),
        ];

        return Inertia::render('Tournaments/Participants', [
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'registration_fee' => $tournament->registration_fee,
            ],
            'registrations' => $registrations->values(),
            'summary' => $summary,
        ]);
    }

    public function removeParticipant(Tournament $tournament, TournamentRegistration $registration)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        // Ensure the registration belongs to this tournament
        if ($registration->tournament_id !== $tournament->id) {
            abort(404);
        }

        $userName = $registration->user->name;
        $registration->delete();

        \App\Services\ActivityLogger::log('tournament_participant_remove', "Admin removed participant {$userName} from tournament {$tournament->name}");

        return back()->with('success', 'Participant removed successfully!');
    }
    public function markAsPaid(Tournament $tournament, TournamentRegistration $registration)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        // Ensure the registration belongs to this tournament
        if ($registration->tournament_id !== $tournament->id) {
            abort(404);
        }

        $registration->update([
            'payment_status' => 'paid'
        ]);

        return back()->with('success', 'Participant marked as paid successfully!');
    }

    public function bookCourt(Tournament $tournament)
    {
        $user = auth()->user();
        $isStaff = $user->isStaff();
        $isAdmin = $user->isAdmin();

        if (!$isStaff && !$isAdmin) {
            $registration = TournamentRegistration::where('tournament_id', $tournament->id)
                ->where('user_id', $user->id)
                ->where('payment_status', 'paid')
                ->first();

            if (!$registration) {
                abort(403, 'You must have a paid registration in this tournament to book a court.');
            }
        }

        $settings = Setting::all()->pluck('value', 'key');
        $gcashQrCode = Setting::where('key', 'gcash_qr_code')->first()?->value;
        $users = $isStaff || $isAdmin
            ? \App\Models\User::all()->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'type' => $u->type,
                'membership_status' => $u->membership_status,
            ])
            : [];

        return Inertia::render('Tournaments/BookCourt', [
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'start_date' => $tournament->start_date->format('Y-m-d'),
                'end_date' => $tournament->end_date->format('Y-m-d'),
            ],
            'settings' => $settings,
            'gcashQrCode' => $gcashQrCode ? \Illuminate\Support\Facades\Storage::url($gcashQrCode) : null,
            'isStaff' => $isStaff,
            'isAdmin' => $isAdmin,
            'users' => $users,
        ]);
    }

    public function storeCourtBooking(Request $request, Tournament $tournament)
    {
        $user = auth()->user();
        $isStaff = $user->isStaff();
        $isAdmin = $user->isAdmin();

        if (!$isStaff && !$isAdmin) {
            $registration = TournamentRegistration::where('tournament_id', $tournament->id)
                ->where('user_id', $user->id)
                ->where('payment_status', 'paid')
                ->first();

            if (!$registration) {
                abort(403, 'You must have a paid registration in this tournament to book a court.');
            }
        }

        $request->validate([
            'schedule_type' => 'required|in:day,night',
            'games_count' => 'required|integer|min:1|max:4',
            'with_trainer' => 'boolean',
            'payment_method' => 'required|in:cash,gcash',
            'is_guest' => 'boolean',
            'guest_name' => 'required_if:is_guest,true|nullable|string|max:255',
            'user_id' => ($isStaff || $isAdmin) ? 'nullable|exists:users,id' : 'nullable',
        ]);

        $settings = Setting::all()->pluck('value', 'key');

        $isGuest = $request->boolean('is_guest');
        $userId = $isStaff || $isAdmin
            ? ($isGuest ? null : ($request->user_id ?? null))
            : $user->id;

        $userType = 'non-member';
        if (!$isGuest && $userId) {
            $bookedUser = \App\Models\User::find($userId);
            if ($bookedUser) $userType = $bookedUser->type->value;
        }

        if ($userType === 'member') {
            $rate = $request->schedule_type === 'day' ? 75 : 85;
        } elseif ($userType === 'student') {
            $rate = 45;
        } else {
            $rate = 150;
        }

        $trainerFee = $request->with_trainer ? (float) ($settings['fee_trainer'] ?? 0) : 0;
        $total = ($rate * $request->games_count) + ($trainerFee * $request->games_count);

        $booking = TournamentCourtBooking::create([
            'tournament_id' => $tournament->id,
            'user_id' => $userId,
            'staff_id' => ($isStaff || $isAdmin) ? $user->id : null,
            'guest_name' => $isGuest ? $request->guest_name : null,
            'schedule_type' => $request->schedule_type,
            'booking_date' => now('Asia/Manila')->toDateString(),
            'games_count' => $request->games_count,
            'with_trainer' => $request->with_trainer ?? false,
            'payment_method' => $request->payment_method,
            'payment_reference' => 'TCB-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8)),
            'payment_status' => 'pending',
            'total_amount' => $total,
            'user_type_at_booking' => $userType,
        ]);

        \App\Services\ActivityLogger::log('tournament_court_booking', "Court booked for tournament: {$tournament->name}", $booking);

        $adminsAndStaff = \App\Models\User::whereIn('type', ['admin', 'staff'])->get();
        \Illuminate\Support\Facades\Notification::send($adminsAndStaff, new \App\Notifications\NewBookingNotification($booking));

        if ($isStaff || $isAdmin) {
            return redirect()->route('dashboard')->with('success', 'Court booked successfully!');
        }

        return redirect()->route('tournaments.my-court-bookings', $tournament->id)
            ->with('success', 'Court booked successfully! Please complete your payment.');
    }

    public function myCourtBookings(Tournament $tournament)
    {
        $user = auth()->user();

        $registration = TournamentRegistration::where('tournament_id', $tournament->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$registration) {
            abort(403, 'You must be registered in this tournament.');
        }

        $bookings = TournamentCourtBooking::where('tournament_id', $tournament->id)
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(5)
            ->withQueryString();

        $gcashQrCode = Setting::where('key', 'gcash_qr_code')->first()?->value;

        return Inertia::render('Tournaments/MyCourtBookings', [
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
            ],
            'bookings' => $bookings,
            'gcashQrCode' => $gcashQrCode ? \Illuminate\Support\Facades\Storage::url($gcashQrCode) : null,
        ]);
    }

    public function courtBookings(Tournament $tournament)
    {
        if (!auth()->user()->isAdmin() && !auth()->user()->isStaff()) {
            abort(403);
        }

        $bookings = TournamentCourtBooking::with('user:id,name,email')
            ->where('tournament_id', $tournament->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(fn($b) => [
                'id' => $b->id,
                'user_name' => $b->guest_name ?? $b->user?->name ?? 'Unknown',
                'user_email' => $b->user?->email ?? '-',
                'is_guest' => !is_null($b->guest_name),
                'schedule_type' => $b->schedule_type,
                'booking_date' => $b->booking_date,
                'games_count' => $b->games_count,
                'with_trainer' => $b->with_trainer,
                'payment_method' => $b->payment_method,
                'payment_reference' => $b->payment_reference,
                'payment_status' => $b->payment_status,
                'total_amount' => $b->total_amount,
                'created_at' => $b->created_at->format('M d, Y H:i'),
            ]);

        return Inertia::render('Tournaments/CourtBookings', [
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
            ],
            'bookings' => $bookings,
        ]);
    }

    public function markCourtBookingPaid(Tournament $tournament, TournamentCourtBooking $booking)
    {
        if (!auth()->user()->isAdmin() && !auth()->user()->isStaff()) {
            abort(403);
        }

        if ($booking->tournament_id !== $tournament->id) {
            abort(404);
        }

        $booking->update(['payment_status' => $booking->payment_status === 'paid' ? 'pending' : 'paid']);

        if ($booking->payment_status === 'paid' && $booking->user) {
            $booking->user->notify(new \App\Notifications\PaymentStatusNotification(
                'Tournament Court Booking Payment Confirmed',
                'Your court booking payment for tournament ' . $tournament->name . ' (Ref: ' . $booking->payment_reference . ') has been confirmed.',
                '/tournaments/' . $tournament->id . '/my-court-bookings'
            ));
        }

        return back()->with('success', 'Booking payment status updated.');
    }

    public function cancelCourtBooking(Tournament $tournament, TournamentCourtBooking $booking)
    {
        if ($booking->user_id !== auth()->id() || $booking->tournament_id !== $tournament->id) {
            abort(403);
        }

        if ($booking->payment_status !== 'pending') {
            return back()->with('error', 'Only pending bookings can be cancelled.');
        }

        $booking->update(['payment_status' => 'cancelled']);

        \App\Services\ActivityLogger::log('tournament_court_booking_cancel', "User cancelled court booking for tournament: {$tournament->name}", $booking);

        $adminsAndStaff = \App\Models\User::whereIn('type', ['admin', 'staff'])->get();
        $customerName = $booking->guest_name ?? $booking->user?->name ?? 'A user';
        \Illuminate\Support\Facades\Notification::send($adminsAndStaff, new \App\Notifications\CancelBookingNotification(
            $booking,
            "{$customerName} has cancelled a tournament court booking for {$tournament->name}",
            url('/tournaments/' . $tournament->id . '/court-bookings'),
            'booking',
            'Tournament Court Booking Cancelled'
        ));

        return back()->with('success', 'Booking cancelled successfully.');
    }
}

