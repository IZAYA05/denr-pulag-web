<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\ReportExport;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Generate and download an administrative report.
     */
    public function download(Request $request)
    {
        $validated = $request->validate([
            'type' => [
                'required',
                'in:reservations,package-bookings,visitors,daily-visitors,trails,users',
            ],
            'format' => [
                'required',
                'in:pdf,xlsx,csv',
            ],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $type = $validated['type'];
        $format = $validated['format'];

        [$headings, $rows] = $this->buildReport(
            $type,
            $validated['date_from'] ?? null,
            $validated['date_to'] ?? null
        );

        $title = Str::headline($type) . ' Report';
        $filename = $type . '_report_' . now()->format('Ymd_His');

        // CSV EXPORT
        if ($format === 'csv') {
            return $this->downloadCsv(
                $filename,
                $headings,
                $rows
            );
        }

        // EXCEL EXPORT
        if ($format === 'xlsx') {
            return Excel::download(
                new ReportExport($title, $headings, $rows),
                $filename . '.xlsx'
            );
        }

        // PDF EXPORT
        $pdf = Pdf::loadView('reports.pdf', [
            'title' => $title,
            'headings' => $headings,
            'rows' => $rows,
            'dateFrom' => $validated['date_from'] ?? null,
            'dateTo' => $validated['date_to'] ?? null,
            'generatedAt' => now(),
        ])->setPaper('a4', 'landscape');

        return $pdf->download($filename . '.pdf');
    }

    /**
     * Build report data using the existing database tables.
     */
    private function buildReport(
        string $type,
        ?string $dateFrom,
        ?string $dateTo
    ): array {
        return match ($type) {
            'reservations' => $this->reservationReport($dateFrom, $dateTo),
            'package-bookings' => $this->packageBookingReport($dateFrom, $dateTo),
            'visitors' => $this->visitorReport($dateFrom, $dateTo),
            'daily-visitors' => $this->dailyVisitorReport($dateFrom, $dateTo),
            'trails' => $this->trailReport(),
            'users' => $this->userReport($dateFrom, $dateTo),
        };
    }

    /**
     * Direct DENR reservation report.
     */
    private function reservationReport(
        ?string $dateFrom,
        ?string $dateTo
    ): array {
        $query = DB::table('reservations')
            ->leftJoin('trails', 'reservations.trail_id', '=', 'trails.id')
            ->leftJoin('users', 'reservations.user_id', '=', 'users.id')
            ->select([
                'reservations.reservation_number',
                'reservations.group_leader_name',
                'reservations.group_leader_phone',
                'reservations.booking_date',
                'reservations.hiking_date',
                'reservations.total_participants',
                'reservations.status',
                'reservations.remarks',
                'trails.name as trail_name',
                'users.email as account_email',
            ]);

        $this->applyDateFilter(
            $query,
            'reservations.hiking_date',
            $dateFrom,
            $dateTo
        );

        $rows = $query->orderBy('reservations.hiking_date')
            ->get()
            ->map(fn ($item) => (array) $item)
            ->all();

        return [
            [
                'Reservation Number',
                'Group Leader',
                'Phone',
                'Booking Date',
                'Hiking Date',
                'Participants',
                'DENR Status',
                'Remarks',
                'Trail',
                'Account Email',
            ],
            $rows,
        ];
    }

    /**
     * Package booking report.
     *
     * Package bookings have two separate decisions:
     * 1. Organizer approval.
     * 2. Final DENR approval.
     */
    private function packageBookingReport(
        ?string $dateFrom,
        ?string $dateTo
    ): array {
        $query = DB::table('package_bookings')
            ->leftJoin('trails', 'package_bookings.trail_id', '=', 'trails.id')
            ->leftJoin('users', 'package_bookings.customer_id', '=', 'users.id')
            ->select([
                'package_bookings.booking_number',
                'package_bookings.package_id',
                'users.first_name',
                'users.last_name',
                'users.email',
                'package_bookings.hiking_date',
                'package_bookings.tourist_count',
                'package_bookings.status as organizer_status',
                'package_bookings.denr_status',
                'package_bookings.remarks',
                'trails.name as trail_name',
            ]);

        $this->applyDateFilter(
            $query,
            'package_bookings.hiking_date',
            $dateFrom,
            $dateTo
        );

        $rows = $query->orderBy('package_bookings.hiking_date')
            ->get()
            ->map(fn ($item) => (array) $item)
            ->all();

        return [
            [
                'Booking Number',
                'Package ID',
                'Customer First Name',
                'Customer Last Name',
                'Email',
                'Hiking Date',
                'Tourist Count',
                'Organizer Status',
                'DENR Status',
                'Remarks',
                'Trail',
            ],
            $rows,
        ];
    }

    /**
     * Registered package tourist report.
     */
    private function visitorReport(
        ?string $dateFrom,
        ?string $dateTo
    ): array {
        $query = DB::table('package_booking_tourists')
            ->join(
                'package_bookings',
                'package_booking_tourists.package_booking_id',
                '=',
                'package_bookings.id'
            )
            ->select([
                'package_booking_tourists.full_name',
                'package_booking_tourists.age',
                'package_booking_tourists.gender',
                'package_booking_tourists.nationality',
                'package_booking_tourists.contact_number',
                'package_booking_tourists.address',
                'package_booking_tourists.emergency_contact',
                'package_booking_tourists.emergency_number',
                'package_bookings.booking_number',
                'package_bookings.hiking_date',
                'package_bookings.status as organizer_status',
                'package_bookings.denr_status',
            ]);

        $this->applyDateFilter(
            $query,
            'package_bookings.hiking_date',
            $dateFrom,
            $dateTo
        );

        $rows = $query->orderBy('package_bookings.hiking_date')
            ->get()
            ->map(fn ($item) => (array) $item)
            ->all();

        return [
            [
                'Tourist Name',
                'Age',
                'Gender',
                'Nationality',
                'Contact Number',
                'Address',
                'Emergency Contact',
                'Emergency Number',
                'Booking Number',
                'Hiking Date',
                'Organizer Status',
                'DENR Status',
            ],
            $rows,
        ];
    }

    /**
     * Daily visitor totals from direct and package bookings.
     *
     * Counts all booking statuses. Statuses are included in the
     * underlying booking reports for further filtering if required.
     */
    private function dailyVisitorReport(
        ?string $dateFrom,
        ?string $dateTo
    ): array {
        $direct = DB::table('reservations')
            ->selectRaw(
                'hiking_date, SUM(total_participants) as visitors'
            );

        $this->applyDateFilter(
            $direct,
            'hiking_date',
            $dateFrom,
            $dateTo
        );

        $direct = $direct->groupBy('hiking_date')->get();

        $packages = DB::table('package_bookings')
            ->selectRaw(
                'hiking_date, SUM(tourist_count) as visitors'
            );

        $this->applyDateFilter(
            $packages,
            'hiking_date',
            $dateFrom,
            $dateTo
        );

        $packages = $packages->groupBy('hiking_date')->get();

        $totals = [];

        foreach ($direct->concat($packages) as $item) {
            $date = (string) $item->hiking_date;

            if (!isset($totals[$date])) {
                $totals[$date] = 0;
            }

            $totals[$date] += (int) $item->visitors;
        }

        ksort($totals);

        $rows = [];

        foreach ($totals as $date => $visitors) {
            $rows[] = [
                'Hiking Date' => $date,
                'Total Visitors' => $visitors,
            ];
        }

        return [
            ['Hiking Date', 'Total Visitors'],
            $rows,
        ];
    }

    /**
     * Trail report.
     */
    private function trailReport(): array
    {
        $rows = DB::table('trails')
            ->select([
                'name',
                'description',
                'difficulty',
                'max_capacity',
                'is_active',
                'created_at',
            ])
            ->orderBy('name')
            ->get()
            ->map(fn ($item) => (array) $item)
            ->all();

        return [
            [
                'Trail Name',
                'Description',
                'Difficulty',
                'Maximum Capacity',
                'Active',
                'Created At',
            ],
            $rows,
        ];
    }

    /**
     * User account report. Passwords and tokens are never exported.
     */
    private function userReport(
        ?string $dateFrom,
        ?string $dateTo
    ): array {
        $query = DB::table('users')
            ->select([
                'first_name',
                'last_name',
                'email',
                'phone',
                'role',
                'status',
                'created_at',
            ]);

        $this->applyDateFilter(
            $query,
            'created_at',
            $dateFrom,
            $dateTo
        );

        $rows = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($item) => (array) $item)
            ->all();

        return [
            [
                'First Name',
                'Last Name',
                'Email',
                'Phone',
                'Role',
                'Status',
                'Registered At',
            ],
            $rows,
        ];
    }

    /**
     * Apply optional date filters.
     */
    private function applyDateFilter(
        $query,
        string $column,
        ?string $dateFrom,
        ?string $dateTo
    ): void {
        if ($dateFrom) {
            $query->whereDate($column, '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate($column, '<=', $dateTo);
        }
    }

    /**
     * Generate CSV download.
     */
    private function downloadCsv(
        string $filename,
        array $headings,
        array $rows
    ): StreamedResponse {
        return response()->streamDownload(function () use ($headings, $rows) {
            $output = fopen('php://output', 'w');

            // UTF-8 BOM for compatibility with Microsoft Excel.
            fwrite($output, "\xEF\xBB\xBF");

            fputcsv($output, $headings);

            foreach ($rows as $row) {
                fputcsv($output, array_values($row));
            }

            fclose($output);
        }, $filename . '.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
