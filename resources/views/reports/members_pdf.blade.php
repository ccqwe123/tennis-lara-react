<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Members Report</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 10pt;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
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
            margin-bottom: 20px;
        }

        .meta {
            margin-bottom: 10px;
            font-size: 9pt;
            color: #555;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Members Report</h1>
        <div class="meta">
            Generated on: {{ now()->format('M d, Y h:i A') }}<br>
            @if(!empty($filters['search'])) Search: {{ $filters['search'] }} <br> @endif
            @if(!empty($filters['type'])) Type: {{ ucfirst($filters['type']) }} <br> @endif
            @if(!empty($filters['status'])) Status: {{ ucfirst($filters['status']) }} <br> @endif
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Status</th>
                <th>Sub End</th>
            </tr>
        </thead>
        <tbody>
            @forelse($users as $user)
                <tr>
                    <td>{{ $user->name }}</td>
                    <td>{{ $user->email }}</td>
                    <td>{{ $user->type_label }}</td>
                    <td>{{ $user->status_label }}</td>
                    <td>{{ $user->subscription_end }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center;">No members found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>

</html>