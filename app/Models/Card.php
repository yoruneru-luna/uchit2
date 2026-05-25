<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    protected $fillable = [
        'study_set_id',
        'user_id',
        'front',
        'back',
        'transcription',
        'marker',
        'hint',
        'example',
        'image_path',
    ];

    public function studySet()
    {
        return $this->belongsTo(StudySet::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
