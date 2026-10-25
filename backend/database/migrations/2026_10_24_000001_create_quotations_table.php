<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla de cotizaciones generadas desde el cotizador de Jayka.
     * Cada fila representa una cotización completa descargada por un cliente.
     */
    public function up(): void
    {
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();

            // ── Datos del cliente ─────────────────────────────────────────
            $table->string('client_name');
            $table->string('client_phone', 30);
            $table->string('client_email')->nullable();
            $table->string('project_location')->nullable();
            $table->boolean('wants_contact')->default(false);

            // ── Resumen financiero ────────────────────────────────────────
            $table->decimal('grand_total', 15, 2);

            // ── Detalle completo (JSON) ───────────────────────────────────
            // 'services'    → array de line items [{ service, area, unitPrice, subtotal }]
            // 'result_json' → objeto QuotationResult completo (para reportes)
            $table->json('services');
            $table->json('result_json');

            // ── Metadatos ─────────────────────────────────────────────────
            $table->string('type')->default('jayka'); // preparado para multi-tenant
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
