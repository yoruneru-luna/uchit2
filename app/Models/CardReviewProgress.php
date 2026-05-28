<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardReviewProgress extends Model
{
    protected $table = 'card_review_progress';

    protected $fillable = [
        'user_id',
        'study_set_id',
        'card_id',
        'state',
        'due_at',
        'last_reviewed_at',
        'stability',
        'difficulty',
        'elapsed_days',
        'scheduled_days',
        'reps',
        'lapses',
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'last_reviewed_at' => 'datetime',
        'stability' => 'float',
        'difficulty' => 'float',
    ];

    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    public function studySet()
    {
        return $this->belongsTo(StudySet::class);
    }
}
