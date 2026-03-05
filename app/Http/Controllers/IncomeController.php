<?php

namespace App\Http\Controllers;

use App\Models\Income;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class IncomeController extends Controller
{
    public function index()
    {
        $date = request('date');

        if ($date) {
            $incomes = Income::whereDate('date', $date)
                ->latest('created_at')
                ->get();

            return Inertia::render('Income/Index', [
                'mode' => 'detail',
                'date' => $date,
                'incomes' => $incomes,
                'total' => $incomes->sum('amount'),
            ]);
        } else {
            $dailyIncomes = Income::query()
                ->selectRaw('date, count(*) as count, sum(amount) as total')
                ->groupBy('date')
                ->orderByDesc('date')
                ->paginate(10);

            return Inertia::render('Income/Index', [
                'mode' => 'summary',
                'dailyIncomes' => $dailyIncomes,
            ]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'item' => 'required|string|max:255',
            'receipt_no' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'amount' => 'required|numeric|min:0',
        ]);

        Income::create($validated);

        return redirect()->back()->with('success', 'Income added successfully.');
    }

    public function update(Request $request, Income $income)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'item' => 'required|string|max:255',
            'receipt_no' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'amount' => 'required|numeric|min:0',
        ]);

        $income->update($validated);

        return redirect()->back()->with('success', 'Income updated successfully.');
    }

    public function destroy(Income $income)
    {
        $income->delete();

        return redirect()->back()->with('success', 'Income deleted successfully.');
    }

    public function export(Request $request)
    {
        $date = $request->query('date');

        if ($date) {
            $incomes = Income::whereDate('date', $date)->latest('created_at')->get();
            $filename = 'incomes-' . $date . '.pdf';
        } else {
            $incomes = Income::orderByDesc('date')->get();
            $filename = 'incomes-summary-' . now()->format('Y-m-d') . '.pdf';
        }

        $pdf = Pdf::loadView('reports.incomes_pdf', [
            'incomes' => $incomes,
            'date' => $date,
        ]);

        return $pdf->download($filename);
    }
}
