<!DOCTYPE html>
<html>

<head>
    <title>Tournament Report</title>
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
        <h2>Tournament Report</h2>
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

    <table>
        <thead>
            <tr>
                <th>Tournament Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Registration Fee</th>
                <th>Participants</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tournaments as $tournament)
                <tr>
                    <td>{{ $tournament['name'] }}</td>
                    <td>{{ $tournament['start_date'] }}</td>
                    <td>{{ $tournament['end_date'] }}</td>
                    <td>{{ $tournament['status'] }}</td>
                    <td>{{ $tournament['fee'] }}</td>
                    <td>{{ $tournament['participants'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>