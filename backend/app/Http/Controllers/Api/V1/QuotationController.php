<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use Illuminate\Http\Request;

class QuotationController extends Controller
{
    /**
     * Recibe y persiste una cotización generada desde el cotizador de Jayka.
     *
     * POST /api/v1/quotations
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'client_name'      => 'required|string|max:255',
            'client_phone'     => 'required|string|max:30',
            'client_email'     => 'nullable|email|max:255',
            'project_location' => 'nullable|string|max:255',
            'wants_contact'    => 'boolean',
            'grand_total'      => 'required|numeric|min:0',
            'services'         => 'required|array',
            'services.*.service'   => 'required|string',
            'services.*.area'      => 'required|numeric',
            'services.*.unitPrice' => 'required|numeric',
            'services.*.subtotal'  => 'required|numeric',
            'result_json'      => 'required|array',
            'type'             => 'nullable|string|max:50',
        ]);

        $quotation = Quotation::create($data);

        return response()->json([
            'success' => true,
            'data'    => $quotation,
            'message' => 'Cotización guardada correctamente.',
        ], 201);
    }

    /**
     * Lista todas las cotizaciones (solo admin).
     *
     * GET /api/v1/admin/quotations
     */
    public function index()
    {
        $quotations = Quotation::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data'    => $quotations,
            'message' => 'Cotizaciones recuperadas.',
        ]);
    }
}
