<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Routing\Middleware\Middleware;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Register global middleware for API responses
        $this->app['router']->aliasMiddleware('api.format', \App\Http\Middleware\ResponseFormatter::class);
    }
}
