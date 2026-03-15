<!DOCTYPE html>
<html>
<head>
    <title>Tournament Court Bookings Report</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        h2, p { text-align: center; margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 14px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .footer { margin-top: 16px; text-align: right; font-weight: bold; }
    </style>
</head>
<body>
    <h2>Tournament Court Bookings Report</h2>
    <p>Generated on: {{ now()->format('M d, Y h:i A') }}</p>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Tournament</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Slot</th>
                <th>Games</th>
                <th>Trainer</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($bookings as $b)
            <tr>
                <td>{{ $b['booking_date'] }}</td>
                <td>{{ $b['tournament_name'] }}</td>
                <td>{{ $b['customer'] }}</td>
                <td>{{ $b['user_type'] }}</td>
                <td>{{ $b['schedule_type'] }}</td>
                <td>{{ $b['games_count'] }}</td>
                <td>{{ $b['with_trainer'] }}</td>
                <td>{{ $b['payment_method'] }}</td>
                <td>{{ $b['payment_reference'] }}</td>
                <td>{{ $b['payment_status'] }}</td>
                <td>₱{{ $b['total_amount'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">Total Records: {{ count($bookings) }}</div>
</body>
</html>
