<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Page;
use App\Models\View;
use App\Models\Sector;

class PagesTableSeeder extends Seeder
{
    public function run(): void
    {
        // Vytvoření hlavní stránky
        $page = Page::create([
            'name' => 'Test Page 1',
            'x' => 10,
            'y' => 10,
            'width' => 800,
            'height' => 600,
            'scale' => 1,
            'background_image' => null,
        ]);

        // Vytvoření hlavního View
        $mainView = View::create([
            'page_id' => $page->id,
            'name' => 'Main View',
            'x' => 50,
            'y' => 50,
            'width' => 400,
            'height' => 300,
            'scale' => 1,
        ]);

        // Vytvoření sektorů pro hlavní View
        Sector::create([
            'view_id' => $mainView->id,
            'name' => 'Header Section',
            'x' => 100,
            'y' => 100,
            'width' => 100,
            'height' => 100,
            'color' => '#ff000080',
            'tags' => ['header', 'navigation'],
        ]);

        Sector::create([
            'view_id' => $mainView->id,
            'name' => 'Content Section',
            'x' => 250,
            'y' => 100,
            'width' => 150,
            'height' => 200,
            'color' => '#00ff0080',
            'tags' => ['content', 'main'],
        ]);

        // Vytvoření sekundárního View
        $secondaryView = View::create([
            'page_id' => $page->id,
            'name' => 'Secondary View',
            'x' => 500,
            'y' => 50,
            'width' => 250,
            'height' => 200,
            'scale' => 1,
        ]);

        // Vytvoření sektoru pro sekundární View
        Sector::create([
            'view_id' => $secondaryView->id,
            'name' => 'Sidebar',
            'x' => 520,
            'y' => 70,
            'width' => 80,
            'height' => 150,
            'color' => '#0000ff80',
            'tags' => ['sidebar', 'navigation'],
        ]);
    }
}