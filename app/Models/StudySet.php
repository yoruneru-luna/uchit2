<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudySet extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'language',
        'visibility',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function cards()
    {
        return $this->hasMany(Card::class);
    }
}
