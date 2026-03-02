<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SwimRecord extends Model
{
    protected $fillable = [
        'athlete_id',
        'record_type',
        'stroke',
        'distance',
        'time_ms',
        'pool_length',
        'date',
        'competition_name',
        'competition_location',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function athlete()
    {
        return $this->belongsTo(Athlete::class);
    }

    public function getFormattedTimeAttribute()
    {
        $minutes = floor($this->time_ms / 60000);
        $seconds = floor(($this->time_ms % 60000) / 1000);
        $milliseconds = $this->time_ms % 1000;

        if ($minutes > 0) {
            return sprintf('%d:%02d.%02d', $minutes, $seconds, floor($milliseconds / 10));
        }

        return sprintf('%d.%02d', $seconds, floor($milliseconds / 10));
    }
}
