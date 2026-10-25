<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ContentController;
use App\Http\Controllers\Api\V1\QuotationController;

Route::prefix('v1')->middleware(['api.format'])->group(function () {

    // Auth
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);

    // Public Content
    Route::get('/services', [ContentController::class, 'services']);
    Route::get('/projects', [ContentController::class, 'projects']);
    Route::get('/posts', [ContentController::class, 'posts']);
    Route::get('/posts/{id}', [ContentController::class, 'postShow']);
    Route::post('/leads', [ContentController::class, 'storeLead'])->middleware('throttle:5,1');

    // Cotizaciones — público (el cliente genera desde el wizard)
    Route::post('/quotations', [QuotationController::class, 'store'])->middleware('throttle:10,1');

    // Admin Only
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/admin/leads', function() {
            return response()->json(['success' => true, 'data' => \App\Models\Lead::all()]);
        });
        // Listado de cotizaciones (admin)
        Route::get('/admin/quotations', [QuotationController::class, 'index']);
        // Other admin routes would go here
    });
});
