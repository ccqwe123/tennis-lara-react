<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGuide extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'order'];

    public function steps()
    {
        return $this->hasMany(UserGuideStep::class)->orderBy('order');
    }
}
