<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model
{
    protected $fillable = [
        'name',
        'x',
        'y',
        'width',
        'height',
        'scale',
        'background_image'
    ];

    protected $casts = [
        'scale' => 'float',
        'x' => 'integer',
        'y' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    public function views(): HasMany
    {
        return $this->hasMany(View::class);
    }
}