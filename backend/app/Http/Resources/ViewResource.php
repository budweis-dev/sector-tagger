<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ViewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'x' => $this->x,
            'y' => $this->y,
            'width' => $this->width,
            'height' => $this->height,
            'scale' => $this->scale,
            'sectors' => SectorResource::collection($this->whenLoaded('sectors')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}