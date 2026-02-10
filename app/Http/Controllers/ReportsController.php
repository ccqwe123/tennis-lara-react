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
        $filters = $request->only(['date_from', 'date_to', 'type', 'with_trainer', 'payment_status', 'schedule_type', 'with_priest', 'with_picker']);

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
                $query->where('user_type_at_booking', $filters['type'])
                    ->whereNotNull('user_id');
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

        // 6. Priest Filter
        if (isset($filters['with_priest']) && $filters['with_priest'] !== 'all') {
            $withPriest = filter_var($filters['with_priest'], FILTER_VALIDATE_BOOLEAN);
            if ($withPriest) {
                $query->where('priest_count', '>', 0);
            } else {
                $query->where('priest_count', '=', 0);
            }
        }

        // 7. Picker Filter
        if (isset($filters['with_picker']) && $filters['with_picker'] !== 'all') {
            // JSON Contains check for true in array. Note: JSON in MySQL/MariaDB stores true as true (lowercase) usually.
            // We can check if array contains true.
            $withPicker = filter_var($filters['with_picker'], FILTER_VALIDATE_BOOLEAN);
            if ($withPicker) {
                $query->whereJsonContains('picker_selection', true);
            } else {
                $query->where(function ($q) {
                    $q->whereNull('picker_selection')
                        ->orWhereJsonDoesntContain('picker_selection', true);
                });
            }
        }

        // Clone query for stats to avoid modifying the main query
        $statsQuery = clone $query;

        $basePickerFee = (float) \App\Models\Setting::getValue('fee_picker', 80);

        $bookings = $query->orderBy('booking_date', 'desc')
            ->orderBy('created_at', 'asc')
            ->paginate($request->input('per_page', 10));

        $bookings->getCollection()->transform(function ($booking) use ($basePickerFee) {
            return $this->transformBooking($booking, $basePickerFee);
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
        $filters = $request->only(['date_from', 'date_to', 'type', 'with_trainer', 'payment_status', 'schedule_type', 'with_priest', 'with_picker']);
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
                $query->where('user_type_at_booking', $filters['type'])
                    ->whereNotNull('user_id');
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
        if (isset($filters['with_priest']) && $filters['with_priest'] !== 'all') {
            $withPriest = filter_var($filters['with_priest'], FILTER_VALIDATE_BOOLEAN);
            if ($withPriest) {
                $query->where('priest_count', '>', 0);
            } else {
                $query->where('priest_count', '=', 0);
            }
        }
        if (isset($filters['with_picker']) && $filters['with_picker'] !== 'all') {
            $withPicker = filter_var($filters['with_picker'], FILTER_VALIDATE_BOOLEAN);
            if ($withPicker) {
                $query->whereJsonContains('picker_selection', true);
            } else {
                $query->where(function ($q) {
                    $q->whereNull('picker_selection')
                        ->orWhereJsonDoesntContain('picker_selection', true);
                });
            }
        }

        $bookings = $query->orderBy('booking_date', 'desc')->get();
        $basePickerFee = (float) \App\Models\Setting::getValue('fee_picker', 80);


        if ($format === 'pdf') {
            // Transform bookings for PDF to include calculated fields
            $bookings->transform(function ($booking) use ($basePickerFee) {
                $pickerFee = 0;
                $pickersUsed = 0;
                if ($booking->picker_selection && is_array($booking->picker_selection)) {
                    $pickersUsed = count(array_filter($booking->picker_selection, function ($v) {
                        return $v === true;
                    }));
                    if ($pickersUsed > 0) {
                        $categoryDivisor = ($booking->category === 'double') ? 4 : 2;
                        if (!$booking->category)
                            $categoryDivisor = 2;

                        $priestCount = $booking->priest_count ?? 0;
                        $pickerDivisor = max(1, $categoryDivisor - $priestCount);
                        $feePerPicker = $basePickerFee / $pickerDivisor;
                        $pickerFee = $feePerPicker * $pickersUsed;
                    }
                }
                $booking->picker_fee_calculated = $pickerFee;
                $booking->with_picker_label = $pickersUsed > 0 ? 'Yes' : 'No';
                return $booking;
            });
            info($bookings);
            $pdf = Pdf::loadView('reports.bookings_pdf', ['bookings' => $bookings, 'filters' => $filters]);
            return $pdf->download('booking_report.pdf');
        }

        if ($format === 'xlsx') {
            $writer = SimpleExcelWriter::streamDownload('booking_report.xlsx');
            foreach ($bookings as $booking) {
                // Calc fee
                $pickerFee = 0;
                $pickersUsed = 0;
                if ($booking->picker_selection && is_array($booking->picker_selection)) {
                    $pickersUsed = count(array_filter($booking->picker_selection, function ($v) {
                        return $v === true;
                    }));
                    if ($pickersUsed > 0) {
                        $categoryDivisor = ($booking->category === 'double') ? 4 : 2;
                        if (!$booking->category)
                            $categoryDivisor = 2;

                        $priestCount = $booking->priest_count ?? 0;
                        $pickerDivisor = max(1, $categoryDivisor - $priestCount);
                        $feePerPicker = $basePickerFee / $pickerDivisor;
                        $pickerFee = $feePerPicker * $pickersUsed;
                    }
                }

                $writer->addRow([
                    'Date' => $booking->booking_date,
                    'Customer' => $booking->user ? $booking->user->name : ($booking->guest_name ?? 'Guest'),
                    // Use historical user type if available, else fallback to current type or 'Guest'
                    'Type' => $booking->user ? $booking->user_type_at_booking : 'Guest',
                    'Schedule' => ucfirst($booking->schedule_type),
                    'Games' => $booking->games_count,
                    'Trainer' => $booking->with_trainer ? 'Yes' : 'No',
                    'Priest Count' => $booking->priest_count ?? 0,
                    'With Picker' => $pickersUsed > 0 ? 'Yes' : 'No',
                    'Picker Fee' => number_format($pickerFee, 2),
                    'Status' => ucfirst($booking->payment_status),
                    'Amount' => $booking->total_amount,
                ]);
            }
            return $writer->toBrowser();
        }

        if ($format === 'json') {
            $basePickerFee = (float) \App\Models\Setting::getValue('fee_picker', 80);
            $transformed = $bookings->map(function ($booking) use ($basePickerFee) {
                return $this->transformBooking($booking, $basePickerFee);
            });
            return response()->json($transformed);
        }
    }

    private function transformBooking($booking, $basePickerFee)
    {
        // Calculate Picker Fee
        $pickerFee = 0;
        $pickersUsed = 0;
        if ($booking->picker_selection && is_array($booking->picker_selection)) {
            $pickersUsed = count(array_filter($booking->picker_selection, function ($v) {
                return $v === true;
            }));
            if ($pickersUsed > 0) {
                $categoryDivisor = ($booking->category === 'double') ? 4 : 2;
                if (!$booking->category)
                    $categoryDivisor = 2;

                $priestCount = $booking->priest_count ?? 0;
                $pickerDivisor = max(1, $categoryDivisor - $priestCount);
                $feePerPicker = $basePickerFee / $pickerDivisor;
                $pickerFee = $feePerPicker * $pickersUsed;
            }
        }

        return [
            'id' => $booking->id,
            'date' => Carbon::parse($booking->booking_date)->format('M d, Y'),
            'time' => $booking->schedule_type === 'day' ? 'Day' : 'Night',
            'customer' => $booking->user ? $booking->user->name : ($booking->guest_name ?? 'Guest'),
            'type' => $booking->user ? $booking->user_type_at_booking : 'Guest',
            // 'type' => $booking->user ? $booking->user->type->label() : 'Guest',
            'games' => $booking->games_count,
            'with_trainer' => $booking->with_trainer ? 'Yes' : 'No',
            'priest_count' => $booking->priest_count ?? 0,
            'with_picker' => $pickersUsed > 0 ? 'Yes' : 'No',
            'picker_fee' => number_format($pickerFee, 2),
            'total' => $booking->total_amount,
            'status' => ucfirst($booking->payment_status),
        ];
    }

    public function memberReport(Request $request)
    {
        $filters = $request->only(['search', 'type', 'status']);

        $query = \App\Models\User::query()
            ->with([
                'subscriptions' => function ($q) {
                    $q->latest('end_date');
                }
            ])
            ->whereNotIn('type', [\App\Enums\UserType::ADMIN->value, \App\Enums\UserType::STAFF->value]);

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $query->where('membership_status', $filters['type']);
        }

        // Apply Status Filter (This is tricky in SQL directly without subqueries/joins.
        // For simplicity with moderate datasets, we can filter after retrieval or use whereHas for precise logic.
        // Actually, let's use whereHas for 'Active' (has a subscription ending >= now)
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'active') {
                $query->whereHas('subscriptions', function ($q) {
                    $q->whereDate('end_date', '>=', now());
                });
            } elseif ($filters['status'] === 'expired') {
                // Users who HAVE had a subscription but all are expired OR no active one?
                // Usually "Expired Member" implies they were a member.
                // Strict "Expired": Has subscriptions, but NONE are active.
                $query->whereHas('subscriptions')
                    ->whereDoesntHave('subscriptions', function ($q) {
                        $q->whereDate('end_date', '>=', now());
                    });
            }
        }

        // Stats
        $totalUsers = \App\Models\User::whereNotIn('type', [\App\Enums\UserType::ADMIN->value, \App\Enums\UserType::STAFF->value])->count();
        $activeMembers = \App\Models\User::whereNotIn('membership_status', [\App\Enums\UserType::ADMIN->value, \App\Enums\UserType::STAFF->value])
            ->whereHas('subscriptions', function ($q) {
                $q->whereDate('end_date', '>=', now());
            })->count();
        // Expired: Has subs but no active ones
        $expiredMembers = \App\Models\User::whereNotIn('membership_status', [\App\Enums\UserType::ADMIN->value, \App\Enums\UserType::STAFF->value])
            ->whereHas('subscriptions')
            ->whereDoesntHave('subscriptions', function ($q) {
                $q->whereDate('end_date', '>=', now());
            })->count();

        $users = $query->paginate($request->input('per_page', 10));

        $users->getCollection()->transform(function ($user) {
            $latestSub = $user->subscriptions->first(); // Since we eager loaded with latest('end_date')? No wait, standard relation is hasMany.
            // We need to ensure we get the latest info.
            // Let's rely on the collection's loaded relation if possible, or simplified logic.
            // Actually, in the query above we did `with(['subscriptions' => ... latest...])` but standard `with` doesn't sort the relation collection unless constrained.
            // Let's refine the transform.
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'type' => $user->membership_status, // Assuming enum cast
                'status' => $this->getMemberStatus($user),
                'last_payment_date' => $latestSub ? $latestSub->created_at->format('M d, Y') : '-',
                'subscription_end' => $latestSub ? $latestSub->end_date->format('M d, Y') : '-',
            ];
        });

        // Exclude Admin and Staff from dropdown
        // $memberStatus = array_filter(\App\Enums\UserType::values(), function ($val) {
        //     return !in_array($val, [\App\Enums\UserType::ADMIN->value, \App\Enums\UserType::STAFF->value]);
        // });
        // Renumber array to avoid gaps in JSON/JS loop
        $memberStatus = array_values([
            'member',
            'non-member',
        ]);

        return Inertia::render('Reports/Members', [
            'users' => $users,
            'filters' => $filters,
            'stats' => [
                'total_users' => $totalUsers,
                'active_members' => $activeMembers,
                'expired_members' => $expiredMembers,
            ],
            'memberStatus' => $memberStatus,
        ]);
    }

    public function exportMemberReport(Request $request)
    {
        $filters = $request->only(['search', 'type', 'status']);
        $format = $request->query('format', 'pdf');

        $query = \App\Models\User::query()
            ->with(['subscriptions'])
            ->whereNotIn('type', [\App\Enums\UserType::ADMIN->value, \App\Enums\UserType::STAFF->value]);

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
        }
        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'active') {
                $query->whereHas('subscriptions', function ($q) {
                    $q->whereDate('end_date', '>=', now());
                });
            } elseif ($filters['status'] === 'expired') {
                $query->whereHas('subscriptions')
                    ->whereDoesntHave('subscriptions', function ($q) {
                        $q->whereDate('end_date', '>=', now());
                    });
            }
        }

        $users = $query->get();

        // Transform for Export
        $users->transform(function ($user) {
            $latestSub = $user->subscriptions->sortByDesc('end_date')->first();
            $user->status_label = $this->getMemberStatus($user);
            $user->last_payment_date = $latestSub ? $latestSub->created_at->format('M d, Y') : '-';
            $user->subscription_end = $latestSub ? $latestSub->end_date->format('M d, Y') : '-';
            $user->type_label = $user->type->label();
            return $user;
        });

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reports.members_pdf', ['users' => $users, 'filters' => $filters]);
            return $pdf->download('members_report.pdf');
        }

        if ($format === 'xlsx') {
            $writer = SimpleExcelWriter::streamDownload('members_report.xlsx');
            foreach ($users as $user) {
                $writer->addRow([
                    'Name' => $user->name,
                    'Email' => $user->email,
                    'Type' => $user->type_label,
                    'Status' => $user->status_label,
                    'Last Payment' => $user->last_payment_date,
                    'Subscription End' => $user->subscription_end,
                ]);
            }
            return $writer->toBrowser();
        }

        if ($format === 'json') {
            return response()->json($users);
        }
    }

    private function getMemberStatus($user)
    {
        // Simple logic: If they have ANY subscription ending in future/today, they are Active.
        // If they have subscriptions but all past, Expired.
        // If no subscriptions, N/A or just based on Type.

        $activeSub = $user->subscriptions->where('end_date', '>=', now())->first();
        if ($activeSub)
            return 'Active';

        if ($user->subscriptions->count() > 0)
            return 'Expired';

        return 'No Record';
    }

    public function revenueReport(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', Carbon::now()->endOfMonth()->toDateString());

        $data = $this->getRevenueData($dateFrom, $dateTo);

        return Inertia::render('Reports/Revenue', [
            'data' => $data,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ]
        ]);
    }

    public function exportRevenueReport(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', Carbon::now()->endOfMonth()->toDateString());
        $format = $request->query('format', 'pdf');

        $data = $this->getRevenueData($dateFrom, $dateTo);

        if ($format === 'json') {
            return response()->json($data);
        }

        if ($format === 'xlsx') {
            $writer = SimpleExcelWriter::streamDownload('revenue_report.xlsx');
            foreach ($data as $row) {
                $writer->addRow([
                    'Date' => $row['date'],
                    'Income' => number_format($row['income'], 2),
                    'Expenses' => number_format($row['expenses'], 2),
                    'Net Revenue' => number_format($row['net'], 2),
                ]);
            }
            return $writer->toBrowser();
        }

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reports.revenue_pdf', ['data' => $data, 'filters' => compact('dateFrom', 'dateTo')]);
            return $pdf->download('revenue_report.pdf');
        }
    }

    private function getRevenueData($dateFrom, $dateTo)
    {
        // 1. Bookings Income (Paid)
        $bookings = CourtBooking::query()
            ->where('payment_status', 'paid')
            ->whereDate('booking_date', '>=', $dateFrom)
            ->whereDate('booking_date', '<=', $dateTo)
            ->get()
            ->groupBy(function ($val) {
                return Carbon::parse($val->booking_date)->format('Y-m-d');
            });

        // 2. Tournament Registrations Income (Paid)
        // Using updated_at as proxy for payment date
        $registrations = \App\Models\TournamentRegistration::query()
            ->where('payment_status', 'paid')
            ->whereDate('updated_at', '>=', $dateFrom)
            ->whereDate('updated_at', '<=', $dateTo)
            ->get()
            ->groupBy(function ($val) {
                return Carbon::parse($val->updated_at)->format('Y-m-d');
            });

        // 3. Expenses
        $expenses = \App\Models\Expense::query()
            ->whereDate('date', '>=', $dateFrom)
            ->whereDate('date', '<=', $dateTo)
            ->get()
            ->groupBy(function ($val) {
                return Carbon::parse($val->date)->format('Y-m-d');
            });

        // Merge Dates
        $dates = collect();
        $dates = $dates->merge($bookings->keys())
            ->merge($registrations->keys())
            ->merge($expenses->keys())
            ->unique()
            ->sort();

        $result = [];

        foreach ($dates as $date) {
            $dayBookings = $bookings->get($date, collect());
            $dayRegistrations = $registrations->get($date, collect());
            $dayExpenses = $expenses->get($date, collect());

            $income = $dayBookings->sum('total_amount') + $dayRegistrations->sum('amount_paid');
            $expenseAmount = $dayExpenses->sum('amount');

            $result[] = [
                'date' => Carbon::parse($date)->format('M d, Y'),
                'raw_date' => $date, // for sorting if needed
                'income' => $income,
                'expenses' => $expenseAmount,
                'net' => $income - $expenseAmount,
            ];
        }

        return $result;
    }

    public function tournamentReport(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'status', 'search']);

        $query = \App\Models\Tournament::query()->withCount('registrations');

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('start_date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('end_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }



        $tournaments = $query->paginate($request->input('per_page', 10));

        $tournaments->through(function ($tournament) {
            return [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'start_date' => $tournament->start_date->format('M d, Y'),
                'end_date' => $tournament->end_date->format('M d, Y'),
                'status' => ucfirst($tournament->status),
                'fee' => number_format($tournament->registration_fee, 2),
                'participants_count' => $tournament->registrations_count,
                'max_participants' => $tournament->max_participants,
            ];
        });

        return Inertia::render('Reports/Tournaments/Index', [
            'tournaments' => $tournaments,
            'filters' => $filters,
        ]);
    }

    public function exportTournamentReport(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'status', 'search']);
        $format = $request->query('format', 'pdf');

        $query = \App\Models\Tournament::query()->withCount('registrations');

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }
        if (!empty($filters['date_from'])) {
            $query->whereDate('start_date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('end_date', '<=', $filters['date_to']);
        }
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }



        $tournaments = $query->get();

        $data = $tournaments->map(function ($tournament) {
            return [
                'name' => $tournament->name,
                'start_date' => $tournament->start_date->format('M d, Y'),
                'end_date' => $tournament->end_date->format('M d, Y'),
                'status' => ucfirst($tournament->status),
                'fee' => number_format($tournament->registration_fee, 2),
                'participants' => $tournament->registrations_count . ' / ' . $tournament->max_participants,
            ];
        });

        if ($format === 'json') {
            return response()->json($data);
        }

        if ($format === 'xlsx') {
            $writer = SimpleExcelWriter::streamDownload('tournaments_report.xlsx');
            foreach ($data as $item) {
                $writer->addRow($item);
            }
            return $writer->toBrowser();
        }

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reports.tournaments_pdf', ['tournaments' => $data, 'filters' => $filters]);
            return $pdf->download('tournaments_report.pdf');
        }
    }

    public function tournamentParticipants(Request $request, \App\Models\Tournament $tournament)
    {
        $filters = $request->only(['search', 'payment_status', 'payment_method']);

        $query = $tournament->registrations()->with('user');

        if (!empty($filters['search'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['payment_status']) && $filters['payment_status'] !== 'all') {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['payment_method']) && $filters['payment_method'] !== 'all') {
            $query->where('payment_method', $filters['payment_method']);
        }

        // Default sorting
        $query->orderBy('created_at', 'desc');

        $participants = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $participants->through(function ($participant) {
            return [
                'id' => $participant->id,
                'name' => $participant->user->name,
                'email' => $participant->user->email,
                // 'user_type' => $participant->user_type_at_booking ?? $participant->user->type->label(),
                'user_type' => $participant->user_type_at_booking ?? 'N/A',
                'payment_method' => ucfirst($participant->payment_method),
                'payment_status' => ucfirst($participant->payment_status),
                'amount' => number_format($participant->amount_paid, 2),
                'registered_at' => $participant->created_at->format('M d, Y H:i'),
            ];
        });

        return Inertia::render('Reports/Tournaments/Participants', [
            'tournament' => $tournament,
            'participants' => $participants,
            'filters' => $filters,
        ]);
    }

    public function exportTournamentParticipants(Request $request, \App\Models\Tournament $tournament)
    {
        $filters = $request->only(['search', 'payment_status', 'payment_method']);
        $format = $request->query('format', 'pdf');

        $query = $tournament->registrations()->with('user');

        if (!empty($filters['search'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
        }
        if (!empty($filters['payment_status']) && $filters['payment_status'] !== 'all') {
            $query->where('payment_status', $filters['payment_status']);
        }
        if (!empty($filters['payment_method']) && $filters['payment_method'] !== 'all') {
            $query->where('payment_method', $filters['payment_method']);
        }

        // Default sorting
        $query->orderBy('created_at', 'desc');

        $participants = $query->get()->map(function ($participant) {
            return [
                'name' => $participant->user->name,
                'email' => $participant->user->email,
                'user_type' => $participant->user_type_at_booking ?? 'N/A',
                'payment_method' => ucfirst($participant->payment_method),
                'payment_status' => ucfirst($participant->payment_status),
                'amount' => number_format($participant->amount_paid, 2),
                'registered_at' => $participant->created_at->format('M d, Y H:i'),
            ];
        });

        if ($format === 'json') {
            return response()->json($participants);
        }

        if ($format === 'xlsx') {
            $writer = SimpleExcelWriter::streamDownload('tournament_participants.xlsx');
            foreach ($participants as $p) {
                $writer->addRow($p);
            }
            return $writer->toBrowser();
        }

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reports.tournament_participants_pdf', [
                'tournament' => $tournament,
                'participants' => $participants,
                'filters' => $filters
            ]);
            return $pdf->download('tournament_participants.pdf');
        }
    }
}
