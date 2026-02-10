<!DOCTYPE html>
<html>

<head>
    <title>Revenue Report</title>
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
            text-align: right;
        }

        th {
            background-color: #f2f2f2;
            text-align: center;
        }

        td:first-child,
        th:first-child {
            text-align: left;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .text-green {
            color: green;
        }

        .text-red {
            color: red;
        }

        .text-blue {
            color: #0000FF;
        }

        .font-bold {
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>Revenue Report</h2>
        <p>Generated on: {{ now()->format('M d, Y h:i A') }}</p>
        <p>
            Period:
            {{ \Carbon\Carbon::parse($filters['dateFrom'])->format('M d, Y') }}
            to
            {{ \Carbon\Carbon::parse($filters['dateTo'])->format('M d, Y') }}
        </p>
    </div>

    @php
        $totalIncome = collect($data)->sum('income');
        $totalExpenses = collect($data)->sum('expenses');
        $netRevenue = $totalIncome - $totalExpenses;
    @endphp

    <div style="margin-bottom: 20px;">
        <table style="width: 50%; margin: 0 auto; border: none;">
            <tr style="border: none;">
                <td style="border: none; text-align: left;">Total Income:</td>
                <td style="border: none; text-align: right;" class="text-green font-bold">
                    ₱{{ number_format($totalIncome, 2) }}</td>
            </tr>
            <tr style="border: none;">
                <td style="border: none; text-align: left;">Total Expenses:</td>
                <td style="border: none; text-align: right;" class="text-red font-bold">
                    ₱{{ number_format($totalExpenses, 2) }}</td>
            </tr>
            <tr style="border: none; border-top: 2px solid #000;">
                <td style="border: none; text-align: left; font-size: 14px;">Net Revenue:</td>
                <td style="border: none; text-align: right; font-size: 14px;"
                    class="{{ $netRevenue >= 0 ? 'text-blue' : 'text-red' }} font-bold">
                    ₱{{ number_format($netRevenue, 2) }}
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Income</th>
                <th>Expenses</th>
                <th>Net Revenue</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $row)
                <tr>
                    <td>{{ $row['date'] }}</td>
                    <td class="text-green">{{ number_format($row['income'], 2) }}</td>
                    <td class="text-red">{{ number_format($row['expenses'], 2) }}</td>
                    <td class="{{ $row['net'] >= 0 ? 'text-blue' : 'text-red' }} font-bold">
                        {{ number_format($row['net'], 2) }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center;">No data found for this period.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>

</html>