<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\MemberSubscription;
use App\Models\Setting;
use App\Models\User;
use Inertia\Inertia;

class MemberSubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        if ($user->hasStaffAccess()) {
            return redirect()->route('memberships.manage');
        }

        // Normal User View Data
        $currentSubscription = MemberSubscription::where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('end_date', '>', now())
                    ->orWhereNull('end_date');
            })
            ->latest()
            ->first();

        $settings = Setting::whereIn('key', [
            'fee_membership_annual',
            'fee_membership_monthly',
            'fee_membership_lifetime'
        ])->get()->pluck('value', 'key');

        return Inertia::render('Memberships/Index', [
            'fees' => $settings,
            'isStaff' => false,
            'mySubscription' => $currentSubscription ? [
                'type' => ucfirst($currentSubscription->type),
                'start_date' => $currentSubscription->start_date->format('M d, Y'),
                'end_date' => $currentSubscription->end_date ? $currentSubscription->end_date->format('M d, Y') : 'Lifetime',
                'status' => 'Active',
            ] : null,
        ]);
    }

    public function manage(Request $request)
    {
        if (!auth()->user()->hasStaffAccess()) {
            abort(403);
        }

        $settings = Setting::whereIn('key', [
            'fee_membership_annual',
            'fee_membership_monthly',
            'fee_membership_lifetime'
        ])->get()->pluck('value', 'key');

        $query = User::query()->whereNotIn('type', ['admin', 'staff']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by Membership Status
        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status; // 'member' or 'non-member'
            $query->where('membership_status', $status);
        }

        // Sorting
        $sortColumn = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');

        if (in_array($sortColumn, ['name', 'email', 'membership_status'])) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            $query->orderBy('name', 'asc');
        }

        $users = $query->paginate(10)->withQueryString()->through(function ($u) {
            // Get latest active subscription if any
            $sub = MemberSubscription::where('user_id', $u->id)
                ->where(function ($q) {
                    $q->where('end_date', '>', now())
                        ->orWhereNull('end_date'); // Lifetime
                })
                ->latest()
                ->first();

            $expiryDate = $sub ? ($sub->end_date ? $sub->end_date : null) : null;
            $isExpiring = false;

            if ($expiryDate) {
                $daysUntilExpiry = now()->diffInDays($expiryDate, false);
                // Expiring if within 3 days (0, 1, 2, 3) and not expired (negative)
                // Note: diffInDays returns float, strictly less than 0 is expired? 
                // Using start of day comparison is safer but diffInDays is fine roughly.
                // Let's be precise: if expiry is future but <= 3 days.
                $isExpiring = $expiryDate->isFuture() && $expiryDate->diffInDays(now()) <= 3;
            }

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'type' => $u->type,
                'membership_status' => $u->membership_status,
                'current_plan' => $sub ? ucfirst($sub->type) : 'None',
                'subscription_id' => $sub ? $sub->id : null,
                'start_date' => $sub ? $sub->start_date->format('M d, Y') : '-',
                'expiry_date' => $expiryDate ? $expiryDate->format('M d, Y') : ($sub && !$sub->end_date ? 'Lifetime' : '-'),
                'is_expiring' => $isExpiring,
            ];
        });

        return Inertia::render('Memberships/Manage', [
            'fees' => $settings,
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        if (!auth()->user()->hasStaffAccess()) {
            abort(403);
        }

        $settings = Setting::whereIn('key', [
            'fee_membership_annual',
            'fee_membership_monthly',
            'fee_membership_lifetime'
        ])->get()->pluck('value', 'key');

        // Initial list of 10 users for display (exclude admin and staff)
        $users = User::whereNotIn('type', ['admin', 'staff'])->orderBy('name')->take(10)->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'type' => $user->type,
                'membership_status' => $user->membership_status,
                'email' => $user->email,
            ];
        });

        return Inertia::render('Memberships/Create', [
            'fees' => $settings,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $isStaff = auth()->user()->hasStaffAccess();

        $request->validate([
            'type' => 'required|in:annual,monthly,lifetime',
            'payment_method' => 'required|in:cash,gcash',
            'user_id' => $isStaff ? 'required|exists:users,id' : 'nullable', // Staff must select user
        ]);

        $userId = $isStaff ? $request->user_id : auth()->id();

        $settings = Setting::all()->pluck('value', 'key');
        $feeKey = 'fee_membership_' . $request->type;
        $amount = $settings[$feeKey] ?? 0;

        $startDate = now();
        $endDate = match ($request->type) {
            'annual' => now()->addYear(),
            'monthly' => now()->addMonth(),
            'lifetime' => null,
        };

        MemberSubscription::create([
            'user_id' => $userId,
            'staff_id' => $isStaff ? auth()->id() : null, // Record staff if actioned by staff
            'type' => $request->type,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'payment_method' => $request->payment_method,
            'payment_status' => 'paid',
            'amount_paid' => $amount,
        ]);

        // Auto-upgrade user status
        $user = User::find($userId);
        $user->membership_status = 'member';
        if ($user->type !== \App\Enums\UserType::STUDENT) {
            $user->type = \App\Enums\UserType::MEMBER;
        }
        $user->save();

        return redirect()->route('dashboard')->with('success', 'Membership upgrade successful!');
    }
    public function update(Request $request, User $user)
    {
        if (!auth()->user()->hasStaffAccess()) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:annual,monthly,lifetime',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $subscription = MemberSubscription::where('user_id', $user->id)
            ->latest()
            ->first();

        if (!$subscription) {
            // Create if not exists (edge case handling)
            $subscription = MemberSubscription::create([
                'user_id' => $user->id,
                'staff_id' => auth()->id(),
                'type' => $validated['type'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['type'] === 'lifetime' ? null : $validated['end_date'],
                'payment_method' => 'cash', // Default for manual creation/update if missing
                'payment_status' => 'paid',
                'amount_paid' => 0, // Manual update assume handled external or 0
            ]);
        } else {
            $subscription->update([
                'type' => $validated['type'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['type'] === 'lifetime' ? null : $validated['end_date'],
            ]);
        }

        // Update user status based on plan
        $user->membership_status = 'member';
        if ($user->type === 'non-member') {
            $user->type = \App\Enums\UserType::MEMBER;
        }
        $user->save();

        return redirect()->back()->with('success', 'Membership updated successfully.');
    }

    public function search(Request $request)
    {
        $query = $request->input('query');

        $users = User::query()
            ->whereNotIn('type', ['admin', 'staff'])
            ->when($query, function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->orderBy('name')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'type' => $user->type,
                    'membership_status' => $user->membership_status,
                    'email' => $user->email,
                ];
            });

        return response()->json($users);
    }
}
