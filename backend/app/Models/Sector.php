<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sector extends Model
{
    protected $fillable = [
        'name',
        'x',
        'y',
        'width',
        'height',
        'color',
        'tags',
        'view_id'
    ];

    protected $casts = [
        'x' => 'integer',
        'y' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'tags' => 'array'
    ];

    public function view(): BelongsTo
    {
        return $this->belongsTo(View::class);
    }
}