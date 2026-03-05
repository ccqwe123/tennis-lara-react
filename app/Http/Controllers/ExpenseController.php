<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ExpenseController extends Controller
{
    public function index()
    {
        $date = request('date');

        if ($date) {
            // Detail View: List expenses for a specific date
            $expenses = Expense::whereDate('date', $date)
                ->latest('created_at')
                ->get();

            return Inertia::render('Expenses/Index', [
                'mode' => 'detail',
                'date' => $date,
                'expenses' => $expenses,
                'total' => $expenses->sum('amount'),
            ]);
        } else {
            // Summary View: Group by date
            $dailyExpenses = Expense::query()
                ->selectRaw('date, count(*) as count, sum(amount) as total')
                ->groupBy('date')
                ->orderByDesc('date')
                ->paginate(10);

            return Inertia::render('Expenses/Index', [
                'mode' => 'summary',
                'dailyExpenses' => $dailyExpenses,
            ]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'item' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'receipt_no' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:255',
        ]);

        Expense::create($validated);

        return redirect()->back()
            ->with('success', 'Expense added successfully.');
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'item' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'receipt_no' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:255',
        ]);

        $expense->update($validated);

        return redirect()->back()
            ->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return redirect()->back()
            ->with('success', 'Expense deleted successfully.');
    }

    public function export(Request $request)
    {
        $date = $request->query('date');

        if ($date) {
            // Detail: expenses for a specific date
            $expenses = Expense::whereDate('date', $date)
                ->latest('created_at')
                ->get();
            $filename = 'expenses-' . $date . '.pdf';
        } else {
            // Summary: all expenses ordered by date descending
            $expenses = Expense::orderByDesc('date')->get();
            $filename = 'expenses-summary-' . now()->format('Y-m-d') . '.pdf';
        }

        $pdf = Pdf::loadView('reports.expenses_pdf', [
            'expenses' => $expenses,
            'date' => $date,
        ]);

        return $pdf->download($filename);
    }
}
