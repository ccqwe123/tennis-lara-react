<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Income extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'source_type',
        'source_id',
        'item',
        'receipt_no',
        'notes',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function source()
    {
        return $this->morphTo();
    }
}
