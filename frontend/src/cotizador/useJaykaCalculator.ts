/**
 * useJaykaCalculator.ts
 * ─────────────────────────────────────────────────────────────────────
 * Motor de cálculo puro para el cotizador de Jayka.
 * Sin efectos secundarios ni llamadas a APIs — solo cálculo.
 *
 * Esquema de márgenes:
 *   - Administración : 7%  del subtotal neto
 *   - Imprevistos    : 3%  del subtotal neto
 *   - Utilidad       : 5%  del subtotal neto
 *   - IVA            : 19% SOLO sobre la utilidad
 * ─────────────────────────────────────────────────────────────────────
 */

import { useMemo } from 'react';
import type {
  JaykaCategory,
  QualityTier,
  DifficultyLevel,
  QuotationResult,
  QuotationLineItem,
} from './jayka.types';
import {
  jaykaServices,
  DIFFICULTY_FACTORS,
  DISMANTLING_COST_PER_M2,
  DEBRIS_REMOVAL_COST_PER_M2,
  ADMIN_RATE,
  IMPREVISTOS_RATE,
  UTILIDAD_RATE,
  IVA_RATE,
  M2_PER_DAY_ESTIMATE,
} from './jaykaPricingData';

// ── Servicios con m² independiente del área global ────────────────────
// (el usuario ingresa el m² específico para cada uno)
const CUSTOM_AREA_SERVICES: JaykaCategory[] = [
  'cocina', 'closets', 'banos', 'vestier',
];

export interface CalculatorInput {
  selectedServices: JaykaCategory[];
  areaM2: number;
  /** m² por servicio (para servicios con medidas independientes) */
  serviceAreas: Partial<Record<JaykaCategory, number>>;
  /** Cantidad de unidades (para 'puertas') */
  unitCount: number;
  qualityTier: QualityTier;
  difficulty: DifficultyLevel;
  includesDismantling: boolean;
  includesDebrisRemoval: boolean;
}

// ─────────────────────────────────────────────────────────────────────
//  FUNCIÓN PURA — usable sin React
// ─────────────────────────────────────────────────────────────────────
export function calculateQuotation(input: CalculatorInput): QuotationResult {
  const {
    selectedServices,
    areaM2,
    serviceAreas,
    unitCount,
    qualityTier,
    difficulty,
    includesDismantling,
    includesDebrisRemoval,
  } = input;

  // ── 1. Construir line items ──────────────────────────────────────
  const lineItems: QuotationLineItem[] = selectedServices.map((svcId) => {
    const svc = jaykaServices.find((s) => s.id === svcId);
    if (!svc) return { service: svcId, area: 0, unitPrice: 0, subtotal: 0 };

    const unitPrice = svc.pricing[qualityTier].totalM2;

    let effectiveArea: number;
    if (svcId === 'puertas') {
      // Puertas se cotizan por unidad
      effectiveArea = unitCount > 0 ? unitCount : 1;
    } else if (CUSTOM_AREA_SERVICES.includes(svcId) && (serviceAreas[svcId] ?? 0) > 0) {
      effectiveArea = serviceAreas[svcId]!;
    } else {
      effectiveArea = areaM2;
    }

    return {
      service: svc.label,
      area: effectiveArea,
      unitPrice,
      subtotal: effectiveArea * unitPrice,
    };
  });

  // ── 2. Subtotal de servicios ─────────────────────────────────────
  const subtotalServices = lineItems.reduce((acc, li) => acc + li.subtotal, 0);

  // ── 3. Recargo por dificultad ────────────────────────────────────
  const difficultyMultiplier = DIFFICULTY_FACTORS[difficulty];
  const difficultyAmount = subtotalServices * (difficultyMultiplier - 1);

  // ── 4. Extras opcionales ─────────────────────────────────────────
  const dismantlingCost   = includesDismantling   ? areaM2 * DISMANTLING_COST_PER_M2   : 0;
  const debrisRemovalCost = includesDebrisRemoval ? areaM2 * DEBRIS_REMOVAL_COST_PER_M2 : 0;

  // ── 5. Subtotal antes de márgenes ────────────────────────────────
  const subtotalBeforeMargin =
    subtotalServices + difficultyAmount + dismantlingCost + debrisRemovalCost;

  // ── 6. Desglose de márgenes ──────────────────────────────────────
  const adminAmount       = subtotalBeforeMargin * ADMIN_RATE;
  const imprevistosAmount = subtotalBeforeMargin * IMPREVISTOS_RATE;
  const utilidadAmount    = subtotalBeforeMargin * UTILIDAD_RATE;

  // ── 7. IVA — solo sobre la utilidad ─────────────────────────────
  const ivaAmount = utilidadAmount * IVA_RATE;

  // ── 8. Subtotal antes de IVA ─────────────────────────────────────
  const subtotalBeforeTax =
    subtotalBeforeMargin + adminAmount + imprevistosAmount + utilidadAmount;

  // ── 9. Total final ───────────────────────────────────────────────
  const grandTotal = subtotalBeforeTax + ivaAmount;

  // ── 10. Tiempo estimado ──────────────────────────────────────────
  const estimatedDays = Math.ceil(areaM2 / M2_PER_DAY_ESTIMATE) * selectedServices.length;

  return {
    lineItems,
    subtotalServices,
    difficultyMultiplier,
    difficultyAmount,
    dismantlingCost,
    debrisRemovalCost,
    subtotalBeforeMargin,
    adminRate: ADMIN_RATE,
    adminAmount,
    imprevistosRate: IMPREVISTOS_RATE,
    imprevistosAmount,
    utilidadRate: UTILIDAD_RATE,
    utilidadAmount,
    ivaRate: IVA_RATE,
    ivaAmount,
    margin: ADMIN_RATE + IMPREVISTOS_RATE + UTILIDAD_RATE,
    marginAmount: adminAmount + imprevistosAmount + utilidadAmount,
    subtotalBeforeTax,
    iva: IVA_RATE,
    grandTotal,
    estimatedDays,
  };
}

// ─────────────────────────────────────────────────────────────────────
//  HOOK REACT — recalcula reactivamente
// ─────────────────────────────────────────────────────────────────────
export function useJaykaCalculator(input: CalculatorInput): QuotationResult {
  return useMemo(() => calculateQuotation(input), [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(input.selectedServices),
    input.areaM2,
    JSON.stringify(input.serviceAreas),
    input.unitCount,
    input.qualityTier,
    input.difficulty,
    input.includesDismantling,
    input.includesDebrisRemoval,
  ]);
}
