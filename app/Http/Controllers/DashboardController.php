<?php

namespace App\Http\Controllers;

use App\Models\CourtBooking;
use App\Models\MemberSubscription;
use App\Models\User;
use App\Models\TournamentRegistration;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->hasStaffAccess()) {
            return $this->adminDashboard();
        }

        return $this->userDashboard($user);
    }

    private function adminDashboard()
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->subDays(30);

        // Stats
        $dailyBookings = CourtBooking::whereDate('booking_date', $today)->count();
        $dailyPaid = CourtBooking::whereDate('booking_date', $today)->where('payment_status', 'paid')->count();
        $dailyUnpaid = CourtBooking::whereDate('booking_date', $today)->where('payment_status', 'pending')->count();
        $totalMembers = User::where('type', 'member')->count();

        // Chart Data (Last 30 Days Bookings)
        $chartData = CourtBooking::selectRaw('DATE(booking_date) as date, COUNT(*) as count')
            ->where('booking_date', '>=', $startOfMonth)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('M d'),
                    'count' => $item->count,
                ];
            });

        // Today's Players (Categorized)
        $playerType = request('player_type', 'all');

        $playersQuery = CourtBooking::with('user')
            ->whereDate('booking_date', $today)
            ->orderBy('created_at', 'asc');

        if ($playerType !== 'all') {
            if ($playerType === 'guest') {
                $playersQuery->whereNull('user_id');
            } else {
                $playersQuery->whereHas('user', function ($q) use ($playerType) {
                    $q->where('type', $playerType);
                });
            }
        }

        $todaysBookings = $playersQuery
            ->paginate(5)
            ->appends(request()->query())
            ->through(function ($booking) {
                return [
                    'id' => $booking->id,
                    'user_name' => $booking->user ? $booking->user->name : ($booking->guest_name ?? 'Guest'),
                    'user_type' => $booking->user ? $booking->user->type : 'guest',
                    'time' => Carbon::parse($booking->created_at)->format('h:i A'),
                    'court' => $booking->court_number,
                    'status' => $booking->payment_status,
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'daily_bookings' => $dailyBookings,
                'daily_paid' => $dailyPaid,
                'daily_unpaid' => $dailyUnpaid,
                'total_members' => $totalMembers,
            ],
            'chart_data' => $chartData,
            'todays_players' => $todaysBookings,
            'filters' => [
                'player_type' => $playerType,
            ],
        ]);
    }

    private function userDashboard($user)
    {
        // Active bookings (future)
        $activeBookings = CourtBooking::where('user_id', $user->id)
            ->where('booking_date', '>=', Carbon::today())
            ->count();

        // Tournament Stats
        $tournamentRegistrations = TournamentRegistration::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->count();

        // Current Plan
        $subscription = MemberSubscription::where('user_id', $user->id)
            ->latest()
            ->first();

        $currentPlan = $subscription ? ucfirst($subscription->type) : 'None';

        return Inertia::render('Dashboard', [
            'stats' => [
                'active_bookings' => $activeBookings,
                'tournaments_joined' => $tournamentRegistrations,
                'current_plan' => $currentPlan,
            ]
        ]);
    }
}
