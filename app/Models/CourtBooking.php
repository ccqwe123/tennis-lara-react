<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourtBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'staff_id',
        'schedule_type',
        'booking_date',
        'games_count',
        'with_trainer',
        'payment_method',
        'payment_reference',
        'payment_status',
        'total_amount',
        'picker_selection',
        'priest_count',
        'discount_applied',
        'user_type_at_booking',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'with_trainer' => 'boolean',
        'total_amount' => 'decimal:2',
        'discount_applied' => 'decimal:2',
        'picker_selection' => 'array',
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
