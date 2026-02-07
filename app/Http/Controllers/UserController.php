<?php

namespace App\Http\Controllers;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Exclude Admin and Staff from stats and list
        $excludedTypes = [UserType::ADMIN];

        // Stats
        $stats = [
            'total' => User::whereNotIn('type', $excludedTypes)->count(),
            'members' => User::where('type', UserType::MEMBER)->count(),
            'non_members' => User::where('type', UserType::NON_MEMBER)->count(),
            'students' => User::where('type', UserType::STUDENT)->count(),
        ];

        // Users List
        $query = User::query()
            ->whereNotIn('type', $excludedTypes)
            ->withCount([
                'bookings as paid_bookings_count' => function ($query) {
                    $query->where('payment_status', 'paid');
                },
                'registrations as paid_tournaments_count' => function ($query) {
                    $query->where('payment_status', 'paid');
                }
            ]);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // Handle sorting by computed columns if necessary, or just standard columns
        if (in_array($sortField, ['name', 'email', 'type', 'created_at'])) {
            $query->orderBy($sortField, $sortDirection);
        } elseif ($sortField === 'paid_bookings_count') {
            $query->orderBy('paid_bookings_count', $sortDirection);
        } elseif ($sortField === 'paid_tournaments_count') {
            $query->orderBy('paid_tournaments_count', $sortDirection);
        }

        $users = $query->paginate(10)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['search', 'sort_field', 'sort_direction']),
            // Pass user types for dropdowns
            'userTypes' => collect(UserType::cases())->map(fn($type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Only Admin can create
        if (!$request->user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'type' => ['required', Rule::enum(UserType::class)],
            'phone' => 'nullable|string|max:20',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'type' => $validated['type'],
            'phone' => $validated['phone'] ?? null,
        ]);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $currentUser = $request->user();

        // Admin can edit everything
        if ($currentUser->isAdmin()) {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
                'type' => ['required', Rule::enum(UserType::class)],
                'phone' => 'nullable|string|max:20',
            ]);

            $user->update($validated);
        }
        // Staff can only edit user type to Non-Member or Student
        elseif ($currentUser->isStaff()) {
            $validated = $request->validate([
                'type' => ['required', Rule::in([UserType::NON_MEMBER->value, UserType::STUDENT->value])],
            ]);

            $user->update(['type' => $validated['type']]);
        } else {
            abort(403, 'Unauthorized action.');
        }

        // Log Activity
        $logAction = $currentUser->isAdmin() ? 'user_update' : 'user_type_update';
        $logDesc = $currentUser->isAdmin()
            ? "Admin updated user details for {$user->name}"
            : "Staff updated user type for {$user->name}";

        \App\Services\ActivityLogger::log($logAction, $logDesc, $user);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user)
    {
        // Only Admin can delete
        if (!$request->user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        // Prevent deleting self
        if ($request->user()->id === $user->id) {
            return redirect()->back()->with('error', 'You cannot delete yourself.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }
    /**
     * Change the password of the specified user.
     */
    public function changePassword(Request $request, User $user)
    {
        // Only Admin can change password
        if (!$request->user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        \App\Services\ActivityLogger::log('user_password_change', "Admin changed password for user {$user->name}", $user);

        return redirect()->back()->with('success', 'User password updated successfully.');
    }
}
