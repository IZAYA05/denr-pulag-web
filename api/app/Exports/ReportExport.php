<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class ReportExport implements FromArray, WithHeadings, ShouldAutoSize, WithTitle
{
    protected string $reportTitle;

    protected array $headings;

    protected array $rows;

    public function __construct(
        string $reportTitle,
        array $headings,
        array $rows
    ) {
        $this->reportTitle = $reportTitle;
        $this->headings = $headings;
        $this->rows = $rows;
    }

    /**
     * Export report data.
     */
    public function array(): array
    {
        return array_map(
            fn ($row) => array_values($row),
            $this->rows
        );
    }

    /**
     * Excel column headings.
     */
    public function headings(): array
    {
        return $this->headings;
    }

    /**
     * Worksheet name.
     */
    public function title(): string
    {
        return substr($this->reportTitle, 0, 31);
    }
}
