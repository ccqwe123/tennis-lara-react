<!DOCTYPE html>
<html>

<head>
    <title>Booking Report</title>
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

        .paid {
            color: green;
        }

        .pending {
            color: orange;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>Booking Report</h2>
        <p>Generated on: {{ now()->format('M d, Y h:i A') }}</p>
        @if(isset($filters['date_from']) || isset($filters['date_to']))
            <p>
                Period:
                {{ $filters['date_from'] ? \Carbon\Carbon::parse($filters['date_from'])->format('M d, Y') : 'Start' }}
                to
                {{ $filters['date_to'] ? \Carbon\Carbon::parse($filters['date_to'])->format('M d, Y') : 'End' }}
            </p>
        @endif
    </div>

    <div class="summary">
        <div class="summary-item">Total Bookings: {{ $bookings->count() }}</div>
        <div class="summary-item">Total Amount: ₱{{ number_format($bookings->sum('total_amount'), 2) }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Schedule</th>
                <th>Games</th>
                <th>Trainer</th>
                <th>Status</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($bookings as $booking)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($booking->booking_date)->format('M d, Y') }}</td>
                    <td>{{ $booking->user ? $booking->user->name : ($booking->guest_name ?? 'Guest') }}</td>
                    <td>{{ $booking->user ? $booking->user->type->label() : 'Guest' }}</td>
                    <td>{{ ucfirst($booking->schedule_type) }}</td>
                    <td>{{ $booking->games_count }}</td>
                    <td>{{ $booking->with_trainer ? 'Yes' : 'No' }}</td>
                    <td class="{{ $booking->payment_status }}">
                        {{ ucfirst($booking->payment_status) }}
                    </td>
                    <td>{{ number_format($booking->total_amount, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>