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
        info($request);
        $user = $request->user();
        $isAdmin = $user->isAdmin();

        // Default to today
        $date = $request->input('date', Carbon::today()->toDateString());

        // If not admin, force date to today
        if (!$isAdmin) {
            $date = Carbon::today()->toDateString();
        }

        $baseQuery = CourtBooking::with('user');
        if ($date) {
            $baseQuery->whereDate('booking_date', $date);
        }
        $baseQuery->orderBy('created_at', 'desc');
        $paidBookings = (clone $baseQuery)
            ->where('payment_status', 'paid')
            ->get()
            ->transform(function ($booking) {
                return [
                    'id' => $booking->id,
                    'reference' => $booking->payment_reference,
                    'customer' => $booking->user ? $booking->user->name : 'Guest',
                    'amount' => $booking->total_amount,
                    'status' => ucfirst($booking->payment_status),
                    'date' => $booking->booking_date,
                    'details' => "Court Booking - " . $booking->schedule_type,
                    'category' => $booking->category,
                    'type' => 'booking',
                    'method' => $booking->payment_method ? ucfirst($booking->payment_method) : '-',
                ];
            });

        $unpaidBookings = (clone $baseQuery)
            ->where('payment_status', '!=', 'paid')
            ->get()
            ->transform(function ($booking) {
                return [
                    'id' => $booking->id,
                    'reference' => $booking->payment_reference,
                    'customer' => $booking->user ? $booking->user->name : 'Guest',
                    'amount' => $booking->total_amount,
                    'status' => ucfirst($booking->payment_status),
                    'date' => $booking->booking_date,
                    'details' => "Court Booking - " . $booking->time_slot,
                    'category' => $booking->category,
                    'type' => 'booking',
                    'method' => $booking->payment_method ? ucfirst($booking->payment_method) : '-',
                ];
            });

        $tournamentsQuery = TournamentRegistration::with(['user', 'tournament']);
        if ($date) {
            $tournamentsQuery->whereDate('created_at', $date);
        }
        $tournamentsQuery->orderBy('created_at', 'desc');

        // Clone queries for separate filters
        $paidTournament = (clone $tournamentsQuery)->where('payment_status', 'paid');
        $unpaidTournament = (clone $tournamentsQuery)->where('payment_status', 'unpaid');

        // Paid registrations
        $registrations = $paidTournament->get()->transform(function ($reg) {
            return [
                'id' => $reg->id,
                'reference' => $reg->payment_reference,
                'customer' => $reg->user ? $reg->user->name : 'Unknown',
                'amount' => $reg->amount_paid > 0 ? $reg->amount_paid : $reg->tournament->registration_fee,
                'expected_amount' => $reg->tournament->registration_fee,
                'status' => ucfirst($reg->payment_status),
                'date' => $reg->created_at->format('Y-m-d'),
                'details' => $reg->tournament->name,
                'type' => 'tournament',
                'method' => $reg->payment_method ? ucfirst($reg->payment_method) : '-',
            ];
        });

        // Unpaid registrations
        $unpaidRegistrations = $unpaidTournament->get()->transform(function ($reg) {
            return [
                'id' => $reg->id,
                'reference' => $reg->payment_reference,
                'customer' => $reg->user ? $reg->user->name : 'Unknown',
                'amount' => $reg->amount_paid > 0 ? $reg->amount_paid : $reg->tournament->registration_fee,
                'expected_amount' => $reg->tournament->registration_fee,
                'status' => ucfirst($reg->payment_status),
                'date' => $reg->created_at->format('Y-m-d'),
                'details' => $reg->tournament->name,
                'type' => 'tournament',
                'method' => $reg->payment_method ? ucfirst($reg->payment_method) : '-',
            ];
        });


        return Inertia::render('Payments/Verify', [
            'bookings' => $unpaidBookings,
            'registrations' => $unpaidRegistrations,
            'paid_bookings' => $paidBookings,
            'paid_registrations' => $registrations,
            'filters' => [
                'date' => $date,
                'tab' => $request->input('tab', 'bookings'),
            ],
            'isAdmin' => $isAdmin,
        ]);
    }

    public function markBookingPaid(Request $request, CourtBooking $booking)
    {

        $booking->update([
            'payment_status' => $request->status == 'paid' ? 'pending' : 'paid',
            'staff_id' => $request->user()->id,
            'payment_method' => 'cash', // Defaulting to cash for manual verification
        ]);

        if ($request->status == 'paid') {
            \App\Services\ActivityLogger::log('payment_verify_booking', "{$request->user()->type->label()} they payment status mark as pending for booking {$booking->payment_reference}", $booking);
        } else {
            \App\Services\ActivityLogger::log('payment_verify_booking', "{$request->user()->type->label()} they payment status mark as paid for booking {$booking->payment_reference}", $booking);
        }

        if ($booking->user) {
            $booking->user->notify(new \App\Notifications\PaymentStatusNotification(
                $request->status == 'paid' ? 'Payment Pending' : 'Payment Confirmed',
                $request->status == 'paid' ? 'Your payment for booking ' . $booking->payment_reference . ' has been marked as pending.' : 'Your payment for booking ' . $booking->payment_reference . ' has been confirmed.',
                '/my-bookings'
            ));
        }

        return redirect()->back()->with('success', 'Booking marked as paid.');
    }

    public function markTournamentRegistrationPaid(Request $request, TournamentRegistration $registration)
    {
        $registration->update([
            'payment_status' => $request->status == 'paid' ? 'unpaid' : 'paid',
            'staff_id' => $request->user()->id,
            'payment_method' => 'cash',
        ]);

        if ($request->status == 'paid') {
            \App\Services\ActivityLogger::log('payment_verify_tournament', "{$request->user()->type->label()} they payment status mark as pending for tournament registration {$registration->payment_reference}", $registration);
        } else {
            \App\Services\ActivityLogger::log('payment_verify_tournament', "{$request->user()->type->label()} they payment status mark as paid for tournament registration {$registration->payment_reference}", $registration);
        }

        if ($registration->user) {
            $registration->user->notify(new \App\Notifications\PaymentStatusNotification(
                $request->status == 'paid' ? 'Payment Pending' : 'Payment Confirmed',
                $request->status == 'paid' ? 'Your payment for tournament registration ' . $registration->payment_reference . ' has been marked as pending.' : 'Your payment for tournament registration ' . $registration->payment_reference . ' has been confirmed.',
                '/tournaments/' . $registration->tournament_id
            ));
        }

        return redirect()->back()->with('success', 'Registration marked as paid.');
    }
}
