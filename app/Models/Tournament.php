<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tournament extends Model
{
    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'registration_fee',
        'max_participants',
        'status',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'registration_fee' => 'decimal:2',
    ];

    public function registrations()
    {
        return $this->hasMany(TournamentRegistration::class);
    }
}
