<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResponseFormatter
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response instanceof \Illuminate\Http\JsonResponse) {
            $data = $response->getData(true);

            // Ensure consistent structure for all API responses
            if (!isset($data['success'])) {
                $status = $response->getStatusCode();
                $isSuccess = $status >= 200 && $status < 300;

                $formatted = [
                    'success' => $isSuccess,
                    'message' => $data['message'] ?? ($isSuccess ? 'Operation successful' : 'An error occurred'),
                    'data' => $data['data'] ?? $data,
                    'errors' => $data['errors'] ?? null,
                ];

                return response()->json($formatted, $status);
            }
        }

        return $response;
    }
}
