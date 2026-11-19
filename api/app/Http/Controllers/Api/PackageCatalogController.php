<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizerPackage;
use Illuminate\Http\JsonResponse;

class PackageCatalogController extends Controller
{
    public function index(): JsonResponse
    {
        $packages = OrganizerPackage::with('services')
            ->where('status', 'ACTIVE')
            ->where(function ($query) {
                $query->where('is_walk_in', true)
                    ->orWhere('approval_status', 'APPROVED');
            })
            ->latest()
            ->get();

        return response()->json([
            'packages' => $packages,
        ]);
    }
}