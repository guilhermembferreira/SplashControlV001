<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Athlete extends Model
{
    protected $fillable = [
        'coach_id',
        'name',
        'date_of_birth',
        'gender',
        'club',
        'started_year',
        'height_cm',
        'weight_kg',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
        ];
    }

    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function swimGroups()
    {
        return $this->belongsToMany(SwimGroup::class);
    }

    public function swimRecords()
    {
        return $this->hasMany(SwimRecord::class);
    }
}
