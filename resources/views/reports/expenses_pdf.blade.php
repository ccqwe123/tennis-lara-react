<!DOCTYPE html>
<html>

<head>
    <title>Expenses Report</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .summary {
            margin-bottom: 20px;
        }

        .summary-item {
            display: inline-block;
            margin-right: 20px;
            font-weight: bold;
        }

        .text-right {
            text-align: right;
        }

        .total-row {
            font-weight: bold;
            background-color: #f2f2f2;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>Expenses Report</h2>
        <p>Generated on: {{ now()->format('M d, Y h:i A') }}</p>
        @if($date)
            <p>Date: {{ \Carbon\Carbon::parse($date)->format('M d, Y') }}</p>
        @endif
    </div>

    <div class="summary">
        <div class="summary-item">Total Items: {{ $expenses->count() }}</div>
        <div class="summary-item">Total Amount: {{ number_format($expenses->sum('amount'), 2) }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Item / Description</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($expenses as $expense)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($expense->date)->format('M d, Y') }}</td>
                    <td>{{ $expense->item }}</td>
                    <td class="text-right">{{ number_format($expense->amount, 2) }}</td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="2">Total</td>
                <td class="text-right">{{ number_format($expenses->sum('amount'), 2) }}</td>
            </tr>
        </tbody>
    </table>
</body>

</html>