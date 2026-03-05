<!DOCTYPE html>
<html>

<head>
    <title>Tournament Participants Report</title>
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
    </style>
</head>

<body>
    <div class="header">
        <h2>Tournament Participants: {{ $tournament->name }}</h2>
        <p>Generated on: {{ now()->format('M d, Y h:i A') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Participant Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Registered At</th>
            </tr>
        </thead>
        <tbody>
            @foreach($participants as $participant)
                <tr>
                    <td>{{ $participant['name'] }}</td>
                    <td>{{ $participant['email'] }}</td>
                    <td>{{ $participant['user_type'] }}</td>
                    <td>{{ $participant['payment_method'] }}</td>
                    <td>{{ $participant['payment_status'] }}</td>
                    <td>{{ $participant['amount'] }}</td>
                    <td>{{ $participant['registered_at'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <div style="margin-top: 20px; text-align: right;">
        <strong>Total Participants: {{ count($participants) }}</strong>
    </div>
</body>

</html>