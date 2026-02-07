<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Tournament;
use App\Models\TournamentRegistration;
use Inertia\Inertia;

class TournamentController extends Controller
{
    public function manage(Request $request)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $query = Tournament::withCount('registrations');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Date filter
        if ($request->filled('date_from')) {
            $query->whereDate('start_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('start_date', '<=', $request->date_to);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tournaments = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($tournament) {
                return [
                    'id' => $tournament->id,
                    'name' => $tournament->name,
                    'start_date' => $tournament->start_date->format('M d, Y'),
                    'end_date' => $tournament->end_date->format('M d, Y'),
                    'registration_fee' => $tournament->registration_fee,
                    'max_participants' => $tournament->max_participants,
                    'status' => $tournament->status,
                    'registrations_count' => $tournament->registrations_count,
                    'created_at' => $tournament->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Tournaments/Manage', [
            'tournaments' => $tournaments,
            'filters' => [
                'search' => $request->search ?? '',
                'date_from' => $request->date_from ?? '',
                'date_to' => $request->date_to ?? '',
                'status' => $request->status ?? '',
            ],
        ]);
    }

    public function index()
    {
        $tournaments = Tournament::where('status', 'open')
            ->orWhere('status', 'ongoing')
            ->orderBy('start_date')
            ->get();

        return Inertia::render('Tournaments/Index', [
            'tournaments' => $tournaments
        ]);
    }

    public function show(Tournament $tournament)
    {
        $gcashQrCode = \App\Models\Setting::where('key', 'gcash_qr_code')->first()?->value;

        return Inertia::render('Tournaments/Show', [
            'tournament' => $tournament,
            'myRegistration' => $tournament->registrations()->where('user_id', auth()->id())->first(),
            'gcashQrCode' => $gcashQrCode ? \Illuminate\Support\Facades\Storage::url($gcashQrCode) : null,
        ]);
    }

    public function store(Request $request, Tournament $tournament)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,gcash',
        ]);

        $registration = TournamentRegistration::create([
            'tournament_id' => $tournament->id,
            'user_id' => auth()->id(),
            'payment_method' => $request->payment_method,
            'payment_reference' => 'TRN-' . strtoupper(uniqid()),
            'payment_status' => 'unpaid',
            'amount_paid' => $tournament->registration_fee,
        ]);

        \App\Services\ActivityLogger::log('tournament_join', "User joined tournament: {$tournament->name}", $registration);

        return back()->with('success', 'Registered successfully!');
    }

    public function create()
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        return Inertia::render('Tournaments/Create');
    }

    public function storeTournament(Request $request)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'registration_fee' => 'required|numeric|min:0',
            'max_participants' => 'nullable|integer|min:1',
            'status' => 'required|in:open,ongoing,completed',
        ]);

        $tournament = Tournament::create($validated);

        \App\Services\ActivityLogger::log('tournament_create', "Admin created tournament: {$tournament->name}", $tournament);

        return redirect()->route('tournaments.manage')->with('success', 'Tournament created successfully!');
    }

    public function edit(Tournament $tournament)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        return Inertia::render('Tournaments/Edit', [
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'start_date' => $tournament->start_date->format('Y-m-d'),
                'end_date' => $tournament->end_date->format('Y-m-d'),
                'registration_fee' => $tournament->registration_fee,
                'max_participants' => $tournament->max_participants,
                'status' => $tournament->status,
            ],
        ]);
    }

    public function update(Request $request, Tournament $tournament)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'registration_fee' => 'required|numeric|min:0',
            'max_participants' => 'nullable|integer|min:1',
            'status' => 'required|in:open,ongoing,completed',
        ]);

        $tournament->update($validated);

        \App\Services\ActivityLogger::log('tournament_update', "Admin updated tournament: {$tournament->name}", $tournament);

        return redirect()->route('tournaments.manage')->with('success', 'Tournament updated successfully!');
    }

    public function participants(Tournament $tournament)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $registrations = $tournament->registrations()
            ->with('user:id,name,email')
            ->get()
            ->map(function ($registration) {
                return [
                    'id' => $registration->id,
                    'user_id' => $registration->user_id,
                    'user_name' => $registration->user->name,
                    'user_email' => $registration->user->email,
                    'payment_method' => $registration->payment_method,
                    'payment_status' => $registration->payment_status,
                    'amount_paid' => $registration->amount_paid,
                    'created_at' => $registration->created_at->format('M d, Y H:i'),
                ];
            });

        $summary = [
            'total' => $registrations->count(),
            'paid' => $registrations->where('payment_status', 'paid')->count(),
            'unpaid' => $registrations->where('payment_status', '!=', 'paid')->count(),
            'total_amount' => $registrations->where('payment_status', 'paid')->sum('amount_paid'),
        ];

        return Inertia::render('Tournaments/Participants', [
            'tournament' => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'registration_fee' => $tournament->registration_fee,
            ],
            'registrations' => $registrations->values(),
            'summary' => $summary,
        ]);
    }

    public function removeParticipant(Tournament $tournament, TournamentRegistration $registration)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        // Ensure the registration belongs to this tournament
        if ($registration->tournament_id !== $tournament->id) {
            abort(404);
        }

        $userName = $registration->user->name;
        $registration->delete();

        \App\Services\ActivityLogger::log('tournament_participant_remove', "Admin removed participant {$userName} from tournament {$tournament->name}");

        return back()->with('success', 'Participant removed successfully!');
    }
    public function markAsPaid(Tournament $tournament, TournamentRegistration $registration)
    {
        // Admin only check
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        // Ensure the registration belongs to this tournament
        if ($registration->tournament_id !== $tournament->id) {
            abort(404);
        }

        $registration->update([
            'payment_status' => 'paid'
        ]);

        return back()->with('success', 'Participant marked as paid successfully!');
    }
}

