<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">

    <title>{{ $title }}</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #222;
        }

        h1 {
            text-align: center;
            font-size: 18px;
            margin-bottom: 5px;
        }

        .details {
            text-align: center;
            margin-bottom: 20px;
            color: #555;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #ccc;
            padding: 6px;
            text-align: left;
        }

        th {
            background-color: #e9ecef;
            font-weight: bold;
        }

        tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        .empty {
            text-align: center;
            padding: 20px;
        }

        .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 8px;
            color: #777;
        }
    </style>
</head>

<body>

    <h1>{{ $title }}</h1>

    <div class="details">
        <p>
            Report Period:
            {{ $dateFrom ?? 'All dates' }}
            to
            {{ $dateTo ?? 'Present' }}
        </p>
    </div>

    <table>
        <thead>
            <tr>
                @foreach ($headings as $heading)
                    <th>{{ $heading }}</th>
                @endforeach
            </tr>
        </thead>

        <tbody>
            @forelse ($rows as $row)
                <tr>
                    @foreach ($row as $value)
                        <td>{{ $value ?? '-' }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($headings) }}" class="empty">
                        No records found for this report.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Generated: {{ $generatedAt->format('F d, Y h:i A') }}
    </div>

</body>
</html>
