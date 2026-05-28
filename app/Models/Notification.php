<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'action_text',
        'action_url',
        'data',
        'read_at',
        'created_for_date',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'created_for_date' => 'datetime',
    ];
}
