<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class View extends Model
{
    protected $fillable = [
        'name',
        'x',
        'y',
        'width',
        'height',
        'scale',
        'page_id'
    ];

    protected $casts = [
        'scale' => 'float',
        'x' => 'integer',
        'y' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    public function sectors(): HasMany
    {
        return $this->hasMany(Sector::class);
    }
}