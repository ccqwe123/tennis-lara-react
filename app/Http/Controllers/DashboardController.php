<?php

namespace App\Http\Controllers;

use App\Models\CourtBooking;
use App\Models\MemberSubscription;
use App\Models\User;
use App\Models\TournamentRegistration;
use App\Models\Tournament;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->hasStaffAccess()) {
            $this->checkExpiryNotifications();
            return $this->adminDashboard();
        }

        return $this->userDashboard($user);
    }

    /**
     * Lazy check for memberships expiring in 3 days.
     * Runs once per day when a staff member visits the dashboard.
     */
    private function checkExpiryNotifications()
    {
        $lastCheck = cache('last_membership_expiry_check');
        $today = now()->format('Y-m-d');

        if ($lastCheck === $today) {
            return;
        }

        // Check for expiry within the next 3 days (tomorrow, day after, 3 days from now)
        $startDate = now()->addDay()->format('Y-m-d');
        $endDate = now()->addDays(3)->format('Y-m-d');

        $subscriptions = MemberSubscription::whereBetween('end_date', [$startDate, $endDate])
            ->with('user')
            ->get();

        foreach ($subscriptions as $subscription) {
            if (!$subscription->user)
                continue;

            $notificationDate = $subscription->end_date->format('M d, Y');

            // Check if we already notified this user about this specific expiration date
            $alreadyNotified = $subscription->user->notifications()
                ->where('type', 'App\Notifications\MembershipExpiryNotification')
                ->where('data->message', 'like', "%{$notificationDate}%")
                ->exists();

            if (!$alreadyNotified) {
                $subscription->user->notify(new \App\Notifications\MembershipExpiryNotification($subscription));
            }
        }

        cache(['last_membership_expiry_check' => $today], now()->addDay());
    }

    private function adminDashboard()
    {
        $today = Carbon::today();
        $pieFilter = request('pie_filter', 'today');
        $dateFrom = request('date_from', $today->format('Y-m-d'));
        $dateTo = request('date_to', $today->format('Y-m-d'));
        $startOfMonth = Carbon::now()->subDays(30);
        $startDateTime = Carbon::parse($dateFrom)->startOfDay();
        $endDateTime = Carbon::parse($dateTo)->endOfDay();

        // Stats
        $tournamentBookingsQuery = TournamentRegistration::query()
            ->whereBetween('created_at', [$startDateTime, $endDateTime]);
        $dailyTournamentBookings = (clone $tournamentBookingsQuery)->count();
        $dailyTournamentPaidBookings = (clone $tournamentBookingsQuery)->where('payment_status', 'paid')->count();
        $dailyTournamentUnpaidBookings = (clone $tournamentBookingsQuery)->where('payment_status', 'unpaid')->count();
        $totalTournaments = Tournament::whereBetween('created_at', [$startDateTime, $endDateTime])->count();

        $totalTournaments = Tournament::whereBetween('created_at', [Carbon::parse($dateFrom)->format('Y-m-d') . " 00:00:00", Carbon::parse($dateTo)->format('Y-m-d') . " 23:59:59"])->count();
        $bookings = CourtBooking::query();
        $bookings->whereBetween('booking_date', [$dateFrom, $dateTo]);
        $stats = $bookings->selectRaw("
            count(*) as total,
            sum(case when payment_status = 'paid' then 1 else 0 end) as paid_count,
            sum(case when payment_status = 'pending' then 1 else 0 end) as pending_count
        ")->first();
        $dailyBookings = $stats->total;
        $dailyPaid = $stats->paid_count;
        $dailyUnpaid = $stats->pending_count;

        $unpaidBookingList = CourtBooking::with('user')->whereBetween('booking_date', [$dateFrom, $dateTo])->where('payment_status', 'pending');
        $unpaidBookingList = $unpaidBookingList->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'user_name' => $booking->user?->name ?? 'Guest',
                    'user_email' => $booking->user?->email ?? '-',
                    'reference_number' => $booking->payment_reference,
                    'membership_status' => $booking->user_id ? $booking?->user_type_at_booking : 'guest',
                    'schedule_type' => $booking->schedule_type,
                    'booking_date' => $booking->booking_date,
                    'booking_date_raw' => $booking->booking_date,
                    'games_count' => $booking->games_count,
                    'with_trainer' => $booking->with_trainer,
                    'payment_method' => $booking->payment_method,
                    'category' => $booking->category,
                    'payment_status' => $booking->payment_status,
                    'total_amount' => $booking->total_amount,
                    'discount_applied' => $booking->discount_applied,
                    'staff_name' => $booking->staff?->name,
                    'created_at' => $booking->created_at->format('M d, Y H:i'),
                ];
            });
        $unpaidTournamentList = TournamentRegistration::with(['tournament', 'user'])->whereBetween('created_at', [$startDateTime, $endDateTime])->where('payment_status', 'unpaid');
        $unpaidTournamentList = $unpaidTournamentList->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'user_name' => $booking->user?->name ?? 'Guest',
                    'tournament_name' => $booking->tournament?->name ?? 'N/A',
                    'reference_number' => $booking->payment_reference,
                    'payment_method' => $booking->payment_method,
                    'start_date' => $booking->tournament?->start_date,
                    'end_date' => $booking->tournament?->end_date,
                    'amount' => $booking->amount_paid,
                    'membership_status' => $booking->user_id ? $booking?->user_type_at_booking : 'guest',
                    'created_at' => $booking->created_at->format('M d, Y H:i'),
                ];
            });
        $totalMembers = User::query();
        if ($pieFilter === 'today') {
            $totalMembers->whereDate('created_at', $today);
        }
        $totalMembers = $totalMembers->where('type', 'member')->count();
        // Chart Data (Last 30 Days Bookings)
        $chartData = CourtBooking::selectRaw('DATE(booking_date) as date, COUNT(*) as count')
            ->where('booking_date', '>=', $startOfMonth)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date, 'Asia/Manila')->format('M d'),
                    'count' => $item->count,
                ];
            });

        // Today's Players (Categorized)
        $playerType = request('player_type', 'all');

        $playersQuery = CourtBooking::with('user')
            // ->whereDate('booking_date', $today)
            ->orderBy('created_at', 'asc');
        if ($pieFilter === 'today') {
            $playersQuery->whereDate('booking_date', $today);
        }

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

        // Pie Chart Data
        $pieQuery = CourtBooking::with('user');
        if ($pieFilter === 'today') {
            $pieQuery->whereDate('booking_date', $today);
        }

        $pieBookings = $pieQuery->get();
        $memberCount = $pieBookings->filter(fn($b) => $b->user_type_at_booking === 'member')->count();
        $nonMemberCount = $pieBookings->filter(fn($b) => $b->user_type_at_booking === 'non-member')->count();
        $guestCount = $pieBookings->filter(fn($b) => $b->user == null)->count();
        $studentCount = $pieBookings->filter(fn($b) => $b->user_type_at_booking === 'student')->count();

        // Revenue vs Expenses Chart (last 30 days)
        // Revenue: paid court bookings per day
        $bookingRevenue = CourtBooking::selectRaw('DATE(booking_date) as date, SUM(total_amount) as total')
            ->where('payment_status', 'paid')
            ->where('booking_date', '>=', $startOfMonth)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Revenue: paid memberships per day
        $membershipRevenue = \App\Models\MemberSubscription::selectRaw('DATE(created_at) as date, SUM(amount_paid) as total')
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', $startOfMonth)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Expenses per day
        $expenseData = \App\Models\Expense::selectRaw('DATE(date) as date, SUM(amount) as total')
            ->where('date', '>=', $startOfMonth)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Merge all dates across revenue + expenses into one series
        $allDates = collect()
            ->merge($bookingRevenue->keys())
            ->merge($membershipRevenue->keys())
            ->merge($expenseData->keys())
            ->unique()
            ->sort()
            ->values();

        $revenueChart = $allDates->map(function ($date) use ($bookingRevenue, $membershipRevenue, $expenseData) {
            $bookings = (float) ($bookingRevenue->get($date)->total ?? 0);
            $memberships = (float) ($membershipRevenue->get($date)->total ?? 0);
            $expenses = (float) ($expenseData->get($date)->total ?? 0);
            return [
                'date' => Carbon::parse($date)->format('M d'),
                'revenue' => round($bookings + $memberships, 2),
                'expenses' => round($expenses, 2),
            ];
        })->values();
        return Inertia::render('Dashboard', [
            'stats' => [
                'daily_bookings' => $dailyBookings,
                'daily_tournament_bookings' => $dailyTournamentBookings,
                'daily_paid' => $dailyPaid,
                'daily_unpaid' => $dailyUnpaid,
                'total_members' => $totalMembers,
                'daily_tournament_paid' => $dailyTournamentPaidBookings,
                'daily_tournament_unpaid' => $dailyTournamentUnpaidBookings,
                'total_tournaments' => $totalTournaments,
                'pending_list' => $unpaidBookingList,
                'pending_tournament_list' => $unpaidTournamentList,
            ],
            'chart_data' => $chartData,
            'todays_players' => $todaysBookings,
            'filters' => [
                'player_type' => $playerType,
                'pie_filter' => $pieFilter,
            ],
            'pie_data' => [
                ['name' => 'Member', 'value' => $memberCount],
                ['name' => 'Non-Member', 'value' => $nonMemberCount],
                ['name' => 'Guest', 'value' => $guestCount],
                ['name' => 'Student', 'value' => $studentCount],
            ],
            'revenue_chart' => $revenueChart,
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
