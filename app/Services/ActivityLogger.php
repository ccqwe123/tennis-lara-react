<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    /**
     * Log an activity.
     *
     * @param string $action The action performed.
     * @param string|null $description Optional description.
     * @param \Illuminate\Database\Eloquent\Model|null $subject Optional subject model.
     * @return ActivityLog
     */
    public static function log(string $action, ?string $description = null, $subject = null): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'description' => $description,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject ? $subject->id : null,
            'ip_address' => Request::ip(),
        ]);
    }
}
