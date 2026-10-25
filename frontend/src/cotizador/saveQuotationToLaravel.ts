/**
 * saveQuotationToLaravel.ts
 * ─────────────────────────────────────────────────────────────────────
 * Persiste una cotización en el backend Laravel de Jayka.
 * Usa graceful fail: si el servidor no responde, el flujo del usuario
 * no se interrumpe (el PDF y WhatsApp funcionan igual).
 * ─────────────────────────────────────────────────────────────────────
 */

import type { QuotationLineItem, QuotationResult } from './jayka.types';

export interface QuotationPayload {
  client_name: string;
  client_phone: string;
  client_email?: string;
  project_location?: string;
  wants_contact: boolean;
  services: QuotationLineItem[];
  grand_total: number;
  result_json: QuotationResult;
  type?: string;
}

/**
 * Envía la cotización al endpoint POST /api/v1/quotations del backend.
 * Retorna `true` si fue guardada, `false` si falló (silencioso).
 */
export async function saveQuotationToLaravel(payload: QuotationPayload): Promise<boolean> {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

  try {
    const res = await fetch(`${apiUrl}/api/v1/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, type: payload.type ?? 'jayka' }),
    });
    return res.ok;
  } catch (err) {
    // Graceful fail — el usuario no se entera
    console.warn('[Jayka Cotizador] No se pudo guardar en backend:', err);
    return false;
  }
}
