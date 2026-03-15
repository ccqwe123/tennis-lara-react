<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TournamentCourtBooking extends Model
{
    protected $fillable = [
        'tournament_id',
        'user_id',
        'staff_id',
        'guest_name',
        'schedule_type',
        'booking_date',
        'games_count',
        'with_trainer',
        'payment_method',
        'payment_reference',
        'payment_status',
        'total_amount',
        'user_type_at_booking',
    ];

    protected $casts = [
        'with_trainer' => 'boolean',
        'total_amount' => 'decimal:2',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}
