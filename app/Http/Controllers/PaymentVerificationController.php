<?php

namespace App\Http\Controllers;

use App\Models\CourtBooking;
use App\Models\Tournament;
use App\Models\TournamentCourtBooking;
use App\Models\TournamentRegistration;
use App\Services\IncomeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PaymentVerificationController extends Controller
{
    private function resolveDate(Request $request, bool $isAdmin): string
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        return $isAdmin ? $date : Carbon::today()->toDateString();
    }

    public function courtBookings(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        $date = $this->resolveDate($request, $isAdmin);

        $transform = fn($b) => [
            'id' => $b->id,
            'reference' => $b->payment_reference,
            'customer' => $b->user ? $b->user->name : 'Guest',
            'amount' => $b->total_amount,
            'date' => $b->booking_date,
            'details' => $b->schedule_type,
            'category' => $b->category,
            'type' => 'booking',
            'method' => $b->payment_method ? ucfirst($b->payment_method) : '-',
        ];

        $q = CourtBooking::with('user')->when($date, fn($q) => $q->whereDate('booking_date', $date))->orderBy('created_at', 'desc');

        return Inertia::render('Payments/VerifyCourt', [
            'unpaid'    => (clone $q)->where('payment_status', 'pending')->get()->transform($transform),
            'paid'      => (clone $q)->where('payment_status', 'paid')->get()->transform($transform),
            'cancelled' => (clone $q)->where('payment_status', 'cancelled')->get()->transform($transform),
            'filters'   => ['date' => $date, 'tab' => $request->input('tab', 'unpaid')],
            'isAdmin'   => $isAdmin,
        ]);
    }

    public function tournamentBookings(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        $date = $this->resolveDate($request, $isAdmin);

        $transform = fn($r) => [
            'id' => $r->id,
            'reference' => $r->payment_reference,
            'customer' => $r->user ? $r->user->name : 'Unknown',
            'amount' => $r->amount_paid > 0 ? $r->amount_paid : $r->tournament->registration_fee,
            'expected_amount' => $r->tournament->registration_fee,
            'date' => $r->created_at->format('Y-m-d'),
            'details' => $r->tournament->name,
            'type' => 'tournament',
            'method' => $r->payment_method ? ucfirst($r->payment_method) : '-',
        ];

        $q = TournamentRegistration::with(['user', 'tournament'])->when($date, fn($q) => $q->whereDate('created_at', $date))->orderBy('created_at', 'desc');

        return Inertia::render('Payments/VerifyTournament', [
            'unpaid'    => (clone $q)->where('payment_status', 'unpaid')->get()->transform($transform),
            'paid'      => (clone $q)->where('payment_status', 'paid')->get()->transform($transform),
            'cancelled' => (clone $q)->where('payment_status', 'cancelled')->get()->transform($transform),
            'filters'   => ['date' => $date, 'tab' => $request->input('tab', 'unpaid')],
            'isAdmin'   => $isAdmin,
        ]);
    }

    public function tournamentCourtBookings(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        $date = $this->resolveDate($request, $isAdmin);
        $tournamentId = $request->input('tournament_id');

        $transform = fn($b) => [
            'id' => $b->id,
            'reference' => $b->payment_reference,
            'customer' => $b->guest_name ?? ($b->user ? $b->user->name : 'Guest'),
            'tournament_name' => $b->tournament->name,
            'amount' => $b->total_amount,
            'date' => $b->booking_date,
            'method' => $b->payment_method ? ucfirst($b->payment_method) : '-',
        ];

        $q = TournamentCourtBooking::with(['user', 'tournament'])
            ->when($date, fn($q) => $q->whereDate('booking_date', $date))
            ->when($tournamentId, fn($q) => $q->where('tournament_id', $tournamentId))
            ->orderBy('created_at', 'desc');

        $tournaments = Tournament::orderBy('name')->get()->map(fn($t) => ['id' => $t->id, 'name' => $t->name]);

        return Inertia::render('Payments/VerifyTournamentCourt', [
            'unpaid'      => (clone $q)->where('payment_status', 'pending')->get()->transform($transform),
            'paid'        => (clone $q)->where('payment_status', 'paid')->get()->transform($transform),
            'cancelled'   => (clone $q)->where('payment_status', 'cancelled')->get()->transform($transform),
            'tournaments' => $tournaments,
            'filters'     => ['date' => $date, 'tab' => $request->input('tab', 'unpaid'), 'tournament_id' => $tournamentId],
            'isAdmin'     => $isAdmin,
        ]);
    }

    public function markTournamentCourtBookingPaid(Request $request, TournamentCourtBooking $booking)
    {
        $booking->update([
            'payment_status' => $request->status,
            'staff_id' => $request->user()->id,
        ]);

        if ($request->status === 'paid') {
            IncomeService::record('tournament_court_booking', $booking->id, 'Tournament Court Booking - ' . $booking->payment_reference, $booking->total_amount, $booking->booking_date);
        }

        \App\Services\ActivityLogger::log('payment_verify_tournament_court', "{$request->user()->type->label()} marked tournament court booking {$booking->payment_reference} as {$request->status}", $booking);

        if ($booking->user) {
            $booking->user->notify(new \App\Notifications\PaymentStatusNotification(
                $request->status === 'pending' ? 'Payment Pending' : 'Payment Confirmed',
                $request->status === 'pending'
                    ? 'Your tournament court booking ' . $booking->payment_reference . ' has been marked as pending.'
                    : 'Your tournament court booking ' . $booking->payment_reference . ' has been confirmed.',
                '/tournaments/' . $booking->tournament_id . '/my-court-bookings'
            ));
        }

        return redirect()->back()->with('success', 'Booking payment updated.');
    }

    public function markBookingPaid(Request $request, CourtBooking $booking)
    {

        $booking->update([
            'payment_status' => $request->status,
            'staff_id' => $request->user()->id,
            'payment_method' => 'cash',
        ]);

        if ($request->status === 'paid') {
            IncomeService::record('court_booking', $booking->id, 'Court Booking - ' . $booking->payment_reference, $booking->total_amount, $booking->booking_date);
        }

        if ($request->status === 'pending') {
            \App\Services\ActivityLogger::log('payment_verify_booking', "{$request->user()->type->label()} marked payment as pending for booking {$booking->payment_reference}", $booking);
        } else {
            \App\Services\ActivityLogger::log('payment_verify_booking', "{$request->user()->type->label()} marked payment as paid for booking {$booking->payment_reference}", $booking);
        }

        if ($booking->user) {
            $booking->user->notify(new \App\Notifications\PaymentStatusNotification(
                $request->status === 'pending' ? 'Payment Pending' : 'Payment Confirmed',
                $request->status === 'pending' ? 'Your payment for booking ' . $booking->payment_reference . ' has been marked as pending.' : 'Your payment for booking ' . $booking->payment_reference . ' has been confirmed.',
                '/my-bookings'
            ));
        }

        return redirect()->back()->with('success', 'Booking marked as paid.');
    }

    public function markTournamentRegistrationPaid(Request $request, TournamentRegistration $registration)
    {
        info($request->all());
        info($registration);
        $registration->update([
            'payment_status' => $request->status,
            'staff_id' => $request->user()->id,
            'payment_method' => 'cash',
        ]);

        if ($request->status === 'paid') {
            $amount = $registration->amount_paid > 0 ? $registration->amount_paid : $registration->tournament->registration_fee;
            IncomeService::record('tournament_registration', $registration->id, 'Tournament Registration - ' . $registration->payment_reference, $amount);
        }

        if ($request->status === 'unpaid') {
            \App\Services\ActivityLogger::log('payment_verify_tournament', "{$request->user()->type->label()} marked payment as unpaid for tournament registration {$registration->payment_reference}", $registration);
        } else {
            \App\Services\ActivityLogger::log('payment_verify_tournament', "{$request->user()->type->label()} marked payment as paid for tournament registration {$registration->payment_reference}", $registration);
        }

        if ($registration->user) {
            $registration->user->notify(new \App\Notifications\PaymentStatusNotification(
                $request->status === 'unpaid' ? 'Payment Unpaid' : 'Payment Confirmed',
                $request->status === 'unpaid' ? 'Your payment for tournament registration ' . $registration->payment_reference . ' has been marked as unpaid.' : 'Your payment for tournament registration ' . $registration->payment_reference . ' has been confirmed.',
                '/tournaments/' . $registration->tournament_id
            ));
        }

        return redirect()->back()->with('success', 'Registration updated.');
    }
}
