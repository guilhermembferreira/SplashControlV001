<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SwimSession extends Model
{
    protected $fillable = [
        'user_id',
        'group_name',
        'session_date',
        'elapsed_ms',
        'distance_m',
        'swimmer_count',
        'splits',
    ];

    protected $casts = [
        'session_date' => 'date:Y-m-d',
        'splits'       => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
