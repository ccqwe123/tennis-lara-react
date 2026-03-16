<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberSubscription extends Model
{
    protected $fillable = [
        'user_id',
        'staff_id',
        'type',
        'start_date',
        'end_date',
        'payment_method',
        'payment_reference',
        'payment_status',
        'amount_paid',
        'notified_expiring_at',
        'notified_expired_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'amount_paid' => 'decimal:2',
        'notified_expiring_at' => 'datetime',
        'notified_expired_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}
