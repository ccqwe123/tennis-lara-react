<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentRegistration extends Model
{
    protected $fillable = [
        'tournament_id',
        'user_id',
        'staff_id',
        'payment_method',
        'payment_reference',
        'payment_status',
        'amount_paid'
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
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
