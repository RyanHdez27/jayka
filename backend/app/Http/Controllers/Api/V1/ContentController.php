<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Project;
use App\Models\Post;
use App\Models\Lead;
use App\Http\Requests\StoreLeadRequest;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function services()
    {
        return response()->json([
            'success' => true,
            'data' => Service::with('projects')->get(),
            'message' => 'Servicios recuperados'
        ]);
    }

    public function projects()
    {
        return response()->json([
            'success' => true,
            'data' => Project::all(),
            'message' => 'Proyectos recuperados'
        ]);
    }

    public function posts()
    {
        return response()->json([
            'success' => true,
            'data' => Post::with('category')->whereNotNull('published_at')->orderBy('published_at', 'desc')->get(),
            'message' => 'Artículos recuperados'
        ]);
    }

    public function postShow($id)
    {
        $post = Post::with('category', 'author')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $post,
            'message' => 'Artículo recuperado'
        ]);
    }

    public function storeLead(StoreLeadRequest $request)
    {
        $lead = Lead::create($request->validated());

        return response()->json([
            'success' => true,
            'data' => $lead,
            'message' => 'Su mensaje ha sido enviado correctamente. Nos contactaremos pronto.'
        ], 201);
    }
}
