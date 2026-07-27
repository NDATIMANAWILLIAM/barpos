<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Render (and most PaaS hosts) terminate HTTPS at their edge proxy and
        // forward plain HTTP to the container, signaling the original scheme via
        // X-Forwarded-Proto. Without trusting that header, Laravel thinks every
        // request is HTTP and generates asset/route URLs with the wrong scheme.
        // Safe to trust all proxies here since the container only receives
        // traffic from Render's internal network, never directly from clients.
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Public JSON endpoints don't need CSRF — clients have no session cookie
        $middleware->validateCsrfTokens(except: [
            '/order',
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
