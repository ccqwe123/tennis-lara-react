<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGuideStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_guide_id',
        'content',
        'image_path',
        'order',
    ];

    public function userGuide()
    {
        return $this->belongsTo(UserGuide::class);
    }
}
