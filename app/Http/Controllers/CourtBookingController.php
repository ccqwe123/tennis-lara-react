<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Setting;
use App\Models\User;
use App\Models\CourtBooking;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CourtBookingController extends Controller
{
    public function index(Request $request)
    {
        $query = CourtBooking::with(['user', 'staff']);

        // Search by user name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        // Filter by membership status (including guest)
        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status;
            if ($status === 'guest') {
                $query->whereNull('user_id');
            } else {
                $query->whereHas('user', function ($q) use ($status) {
                    $q->where('membership_status', $status);
                });
            }
        }

        // Filter by date
        if ($request->has('date') && $request->date) {
            $query->whereDate('booking_date', $request->date);
        }

        // Sorting
        $sortColumn = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        // Map sortable columns
        $allowedSortColumns = ['booking_date', 'created_at', 'total_amount', 'games_count'];
        if (!in_array($sortColumn, $allowedSortColumns)) {
            $sortColumn = 'created_at';
        }

        $bookings = $query->orderBy($sortColumn, $sortDirection)
            ->paginate(10)
            ->withQueryString()
            ->through(function ($booking) {
                return [
                    'id' => $booking->id,
                    'user_name' => $booking->user?->name ?? 'Guest',
                    'user_email' => $booking->user?->email ?? '-',
                    'membership_status' => $booking->user?->membership_status ?? 'guest',
                    'schedule_type' => $booking->schedule_type,
                    'booking_date' => $booking->booking_date->format('M d, Y'),
                    'booking_date_raw' => $booking->booking_date->format('Y-m-d'),
                    'games_count' => $booking->games_count,
                    'with_trainer' => $booking->with_trainer,
                    'payment_method' => $booking->payment_method,
                    'payment_status' => $booking->payment_status,
                    'total_amount' => $booking->total_amount,
                    'discount_applied' => $booking->discount_applied,
                    'staff_name' => $booking->staff?->name,
                    'created_at' => $booking->created_at->format('M d, Y H:i'),
                ];
            });

        // Calculate summary statistics
        $statsQuery = CourtBooking::query();

        // Apply same filters for stats
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $statsQuery->where(function ($q) use ($search) {
                $q->whereHas('user', function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }
        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status;
            if ($status === 'guest') {
                $statsQuery->whereNull('user_id');
            } else {
                $statsQuery->whereHas('user', function ($q) use ($status) {
                    $q->where('membership_status', $status);
                });
            }
        }
        if ($request->has('date') && $request->date) {
            $statsQuery->whereDate('booking_date', $request->date);
        }

        $totalCashPaid = (clone $statsQuery)->where('payment_method', 'cash')->where('payment_status', 'paid')->sum('total_amount');
        $totalGcashPaid = (clone $statsQuery)->where('payment_method', 'gcash')->where('payment_status', 'paid')->sum('total_amount');
        $totalUnpaid = (clone $statsQuery)->where('payment_status', '!=', 'paid')->sum('total_amount');

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search', 'status', 'date']),
            'sort' => [
                'column' => $sortColumn,
                'direction' => $sortDirection,
            ],
            'stats' => [
                'total_cash_paid' => $totalCashPaid,
                'total_gcash_paid' => $totalGcashPaid,
                'total_unpaid' => $totalUnpaid,
            ],
        ]);
    }

    public function myBookings(Request $request)
    {
        $user = $request->user();

        $bookings = CourtBooking::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString()
            ->through(function ($booking) {
                return [
                    'id' => $booking->id,
                    'schedule_type' => $booking->schedule_type,
                    'booking_date' => $booking->booking_date->format('M d, Y'),
                    'booking_date_full' => $booking->booking_date->format('l, F d, Y'),
                    'games_count' => $booking->games_count,
                    'with_trainer' => $booking->with_trainer,
                    'payment_method' => $booking->payment_method,
                    'payment_reference' => $booking->payment_reference,
                    'payment_status' => $booking->payment_status,
                    'total_amount' => $booking->total_amount,
                    'discount_applied' => $booking->discount_applied,
                    'created_at' => $booking->created_at->format('M d, Y H:i'),
                ];
            });

        return Inertia::render('Bookings/MyBookings', [
            'bookings' => $bookings,
            'gcashQrCode' => Setting::where('key', 'gcash_qr_code')->first()?->value
                ? Storage::url(Setting::where('key', 'gcash_qr_code')->first()->value)
                : null,
        ]);
    }

    public function create()
    {
        $settings = Setting::all()->pluck('value', 'key');
        $users = User::all()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'type' => $user->type,
                'membership_status' => $user->membership_status,
                'player_level' => $user->player_level,
            ];
        });

        return Inertia::render('Bookings/Create', [
            'settings' => $settings,
            'users' => $users,
            'isStaff' => auth()->user()->isStaff(),
        ]);
    }

    public function store(Request $request)
    {
        $isStaff = auth()->user()->isStaff();

        $request->validate([
            'user_id' => $isStaff ? 'nullable|exists:users,id' : 'nullable',
            'schedule_type' => 'required|in:day,night',
            'booking_date' => 'required|date',
            'games_count' => 'required|integer|min:1|max:4',
            'payment_method' => 'required|in:cash,gcash',
            'with_trainer' => 'boolean',
        ]);

        // Determine effective user ID
        $userId = $isStaff ? $request->user_id : auth()->id();

        $settings = Setting::all()->pluck('value', 'key');

        // Pricing Logic
        $userType = 'non-member';
        if ($userId) {
            $user = User::find($userId);
            if ($user) {
                $userType = $user->type->value;
            }
        }

        $rate = 150; // Default Non-member rate

        if ($userType === 'member') {
            $rate = $request->schedule_type === 'day' ? 75 : 85;
        } elseif ($userType === 'student') {
            $rate = 45;
        } elseif ($userType === 'non-member') {
            $rate = 150;
        }

        $trainerFee = $request->with_trainer ? $settings['fee_trainer'] : 0;

        $subtotal = ($rate * $request->games_count) + ($trainerFee * $request->games_count);
        $discount = 0; // Discount logic removed

        $total = $subtotal;

        // Generate unique payment reference
        $paymentReference = 'TC-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));

        // Staff bookings are auto-paid, member/non-member bookings are pending
        $paymentStatus = $isStaff ? 'paid' : 'pending';

        CourtBooking::create([
            'user_id' => $userId,
            'staff_id' => $isStaff ? auth()->id() : null,
            'schedule_type' => $request->schedule_type,
            'booking_date' => $request->booking_date,
            'games_count' => $request->games_count,
            'with_trainer' => $request->with_trainer ?? false,
            'payment_method' => $request->payment_method,
            'payment_reference' => $paymentReference,
            'payment_status' => $paymentStatus,
            'total_amount' => $total,
            'discount_applied' => $discount,
        ]);

        // Redirect to my bookings for non-staff, dashboard for staff
        if ($isStaff) {
            return redirect()->route('dashboard')->with('success', 'Booking created successfully!');
        }
        return redirect()->route('bookings.my')->with('success', 'Booking created! Please complete payment.');
    }
}
