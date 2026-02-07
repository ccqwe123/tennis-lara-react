<?php

namespace App\Http\Controllers;

use App\Models\CourtBooking;
use App\Models\TournamentRegistration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PaymentVerificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();

        // Default to today
        $date = $request->input('date', Carbon::today()->toDateString());

        // If not admin, force date to today
        if (!$isAdmin) {
            $date = Carbon::today()->toDateString();
        }

        $bookingsQuery = CourtBooking::query()
            ->with(['user'])
            ->where('payment_status', '!=', 'paid')
            ->whereDate('booking_date', $date)
            ->orderBy('created_at', 'desc');

        $tournamentsQuery = TournamentRegistration::query()
            ->with(['user', 'tournament'])
            ->where('payment_status', '!=', 'paid')
            ->whereDate('created_at', $date) // Assuming we verify registrations made on that day
            ->orderBy('created_at', 'desc');

        $bookings = $bookingsQuery->get()->transform(function ($booking) {
            return [
                'id' => $booking->id,
                'reference' => $booking->payment_reference, // Or generate one/use ID
                'customer' => $booking->user ? $booking->user->name : 'Guest', // Handle guest if applicable
                'amount' => $booking->total_amount,
                'status' => ucfirst($booking->payment_status),
                'date' => $booking->booking_date->format('Y-m-d'),
                'details' => "Court Booking - " . $booking->time_slot,
                'type' => 'booking',
                'method' => $booking->payment_method ? ucfirst($booking->payment_method) : '-',
            ];
        });

        $registrations = $tournamentsQuery->get()->transform(function ($reg) {
            return [
                'id' => $reg->id,
                'reference' => $reg->payment_reference,
                'customer' => $reg->user ? $reg->user->name : 'Unknown',
                'amount' => $reg->amount_paid > 0 ? $reg->amount_paid : $reg->tournament->registration_fee, // Logic check: amount_paid might be partial? Assuming full fee if unpaid.
                // Wait, if it's unpaid, amount_paid might be 0. We should fetch the fee from the tournament.
                // But TournamentRegistration might not store the fee snapshot. We'll verify this.
                // For now, let's assume we need to show the expected amount.
                'expected_amount' => $reg->tournament->registration_fee,
                'status' => ucfirst($reg->payment_status),
                'date' => $reg->created_at->format('Y-m-d'),
                'details' => "Tournament: " . $reg->tournament->name,
                'type' => 'tournament',
                'method' => $reg->payment_method ? ucfirst($reg->payment_method) : '-',
            ];
        });

        return Inertia::render('Payments/Verify', [
            'bookings' => $bookings,
            'registrations' => $registrations,
            'filters' => [
                'date' => $date,
            ],
            'isAdmin' => $isAdmin,
        ]);
    }

    public function markBookingPaid(Request $request, CourtBooking $booking)
    {
        $booking->update([
            'payment_status' => 'paid',
            'staff_id' => $request->user()->id,
            'payment_method' => 'cash', // Defaulting to cash for manual verification
        ]);

        \App\Services\ActivityLogger::log('payment_verify_booking', "{$request->user()->type->label()} confirmed payment for booking {$booking->payment_reference}", $booking);

        return redirect()->back()->with('success', 'Booking marked as paid.');
    }

    public function markTournamentRegistrationPaid(Request $request, TournamentRegistration $registration)
    {
        $registration->update([
            'payment_status' => 'paid',
            'staff_id' => $request->user()->id,
            'payment_method' => 'cash',
        ]);

        \App\Services\ActivityLogger::log('payment_verify_tournament', "{$request->user()->type->label()} confirmed payment for tournament registration {$registration->payment_reference}", $registration);

        return redirect()->back()->with('success', 'Registration marked as paid.');
    }
}
