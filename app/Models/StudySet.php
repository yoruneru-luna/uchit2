<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Card;

class StudySet extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'language',
        'visibility',
        'source_set_id',
        'source_version',
        'public_version',
        'public_updated_at',
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

    public function sourceSet()
    {
        return $this->belongsTo(StudySet::class, 'source_set_id');
    }

    public function copies()
    {
        return $this->hasMany(StudySet::class, 'source_set_id');
    }

    protected $casts = [
        'public_updated_at' => 'datetime',
    ];
}
