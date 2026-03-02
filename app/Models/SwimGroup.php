<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SwimGroup extends Model
{
    protected $fillable = [
        'coach_id',
        'name',
        'description',
    ];

    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function athletes()
    {
        return $this->belongsToMany(Athlete::class);
    }
}
