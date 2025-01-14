<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PageController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $pages = Page::with(['views.sectors'])->get();
        return PageResource::collection($pages);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'x' => 'required|integer',
            'y' => 'required|integer',
            'width' => 'required|integer',
            'height' => 'required|integer',
            'scale' => 'numeric|default:1',
            'background_image' => 'nullable|string'
        ]);

        $page = Page::create($validated);
        return new PageResource($page);
    }

    public function show(Page $page): PageResource
    {
        return new PageResource($page->load(['views.sectors']));
    }

    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'x' => 'sometimes|integer',
            'y' => 'sometimes|integer',
            'width' => 'sometimes|integer',
            'height' => 'sometimes|integer',
            'scale' => 'sometimes|numeric',
            'background_image' => 'nullable|string'
        ]);

        $page->update($validated);
        return new PageResource($page);
    }

    public function destroy(Page $page)
    {
        $page->delete();
        return response()->noContent();
    }

    public function uploadImage(Request $request, Page $page)
    {
        $request->validate([
            'image' => 'required|image|max:2048'
        ]);

        $path = $request->file('image')->store('images', 'public');
        $page->update(['background_image' => $path]);

        return new PageResource($page);
    }
}