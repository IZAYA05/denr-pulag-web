<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class ActivityLogger
{
    public function log(
        ?User $user,
        string $action,
        string $module,
        string $description,
        ?Request $request = null
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => $user?->id,
            'role' => $user?->role,
            'action' => strtoupper($action),
            'module' => strtoupper($module),
            'description' => $description,
            'ip_address' => $request?->ip(),
        ]);
    }
}