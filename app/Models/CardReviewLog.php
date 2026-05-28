<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardReviewLog extends Model
{
    protected $fillable = [
        'user_id',
        'study_set_id',
        'card_id',
        'mode',
        'rating',
        'stability_before',
        'difficulty_before',
        'stability_after',
        'difficulty_after',
        'reviewed_at',
        'next_due_at',
    ];

    protected $casts = [
        'stability_before' => 'float',
        'difficulty_before' => 'float',
        'stability_after' => 'float',
        'difficulty_after' => 'float',
        'reviewed_at' => 'datetime',
        'next_due_at' => 'datetime',
    ];
}
