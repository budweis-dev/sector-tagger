<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ViewController;
use App\Http\Controllers\Api\SectorController;


Route::get('/', function () {
    return view('welcome');
});


Route::middleware('api')->group(function () {
    // Pages
    Route::apiResource('pages', PageController::class);
    Route::post('pages/{page}/image', [PageController::class, 'uploadImage']);
    
    // Views
    Route::apiResource('views', ViewController::class);
    
    // Sectors
    Route::apiResource('sectors', SectorController::class);
});
