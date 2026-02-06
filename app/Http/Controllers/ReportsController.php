<?php

namespace App\Http\Controllers;

use App\Models\CourtBooking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Spatie\SimpleExcel\SimpleExcelWriter;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function bookingReport(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'type', 'with_trainer', 'payment_status', 'schedule_type']);

        $query = CourtBooking::query()->with(['user']);

        // 1. Date Usage Filter
        if (!empty($filters['date_from'])) {
            $query->whereDate('booking_date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('booking_date', '<=', $filters['date_to']);
        }

        // 2. User Type Filter
        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            if ($filters['type'] === 'guest') {
                $query->whereNull('user_id');
            } else {
                $query->whereHas('user', function ($q) use ($filters) {
                    $q->where('type', $filters['type']);
                });
            }
        }

        // 3. Trainer Filter
        if (isset($filters['with_trainer']) && $filters['with_trainer'] !== 'all') {
            $query->where('with_trainer', filter_var($filters['with_trainer'], FILTER_VALIDATE_BOOLEAN));
        }

        // 4. Payment Status Filter
        if (!empty($filters['payment_status']) && $filters['payment_status'] !== 'all') {
            $query->where('payment_status', $filters['payment_status']);
        }

        // 5. Schedule Type Filter
        if (!empty($filters['schedule_type']) && $filters['schedule_type'] !== 'all') {
            $query->where('schedule_type', $filters['schedule_type']);
        }

        // Clone query for stats to avoid modifying the main query
        $statsQuery = clone $query;

        $bookings = $query->orderBy('booking_date', 'desc')
            ->orderBy('created_at', 'asc')
            ->paginate(10)
            ->through(function ($booking) {
                return [
                    'id' => $booking->id,
                    'date' => Carbon::parse($booking->booking_date)->format('M d, Y'),
                    'time' => $booking->schedule_type === 'day' ? 'Day' : 'Night', // Or exact time if you have it
                    'customer' => $booking->user ? $booking->user->name : ($booking->guest_name ?? 'Guest'),
                    'type' => $booking->user ? $booking->user->type->label() : 'Guest',
                    'games' => $booking->games_count,
                    'with_trainer' => $booking->with_trainer ? 'Yes' : 'No',
                    'total' => $booking->total_amount,
                    'status' => ucfirst($booking->payment_status),
                ];
            });

        // Aggregates
        $totalBookings = $statsQuery->count();
        $totalGames = $statsQuery->sum('games_count');
        $totalPaid = $statsQuery->clone()->where('payment_status', 'paid')->sum('total_amount');
        $totalUnpaid = $statsQuery->clone()->where('payment_status', '!=', 'paid')->sum('total_amount');

        return Inertia::render('Reports/Bookings', [
            'bookings' => $bookings,
            'filters' => $filters,
            'stats' => [
                'total_bookings' => $totalBookings,
                'total_games' => $totalGames,
                'total_paid' => $totalPaid,
                'total_unpaid' => $totalUnpaid,
            ]
        ]);
    }

    public function exportBookingReport(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'type', 'with_trainer', 'payment_status', 'schedule_type']);
        $format = $request->query('format', 'pdf'); // pdf or xlsx

        $query = CourtBooking::query()->with(['user']);

        // Reuse Filter Logic (Ideally refactor to a scope or service)
        if (!empty($filters['date_from']))
            $query->whereDate('booking_date', '>=', $filters['date_from']);
        if (!empty($filters['date_to']))
            $query->whereDate('booking_date', '<=', $filters['date_to']);
        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            if ($filters['type'] === 'guest') {
                $query->whereNull('user_id');
            } else {
                $query->whereHas('user', function ($q) use ($filters) {
                    $q->where('type', $filters['type']);
                });
            }
        }
        if (isset($filters['with_trainer']) && $filters['with_trainer'] !== 'all') {
            $query->where('with_trainer', filter_var($filters['with_trainer'], FILTER_VALIDATE_BOOLEAN));
        }
        if (!empty($filters['payment_status']) && $filters['payment_status'] !== 'all') {
            $query->where('payment_status', $filters['payment_status']);
        }
        if (!empty($filters['schedule_type']) && $filters['schedule_type'] !== 'all') {
            $query->where('schedule_type', $filters['schedule_type']);
        }

        $bookings = $query->orderBy('booking_date', 'desc')->get();

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reports.bookings_pdf', ['bookings' => $bookings, 'filters' => $filters]);
            return $pdf->download('booking_report.pdf');
        }

        if ($format === 'xlsx') {
            $writer = SimpleExcelWriter::streamDownload('booking_report.xlsx');
            foreach ($bookings as $booking) {
                $writer->addRow([
                    'Date' => $booking->booking_date,
                    'Customer' => $booking->user ? $booking->user->name : 'Guest',
                    'Type' => $booking->user ? $booking->user->type->label() : 'Guest',
                    'Schedule' => ucfirst($booking->schedule_type),
                    'Games' => $booking->games_count,
                    'Trainer' => $booking->with_trainer ? 'Yes' : 'No',
                    'Status' => ucfirst($booking->payment_status),
                    'Amount' => $booking->total_amount,
                ]);
            }
            return $writer->toBrowser();
        }
    }
}
