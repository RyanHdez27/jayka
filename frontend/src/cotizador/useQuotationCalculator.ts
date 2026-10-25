import { useMemo } from 'react';
import type {
  ServiceCategory,
  QualityTier,
  DifficultyLevel,
  QuotationResult,
  QuotationLineItem,
} from './quotation.types';
import {
  JAYKA_SERVICES,
  CUSTOM_AREA_SERVICES,
  DIFFICULTY_FACTORS,
  DEMOLITION_COST_PER_M2,
  DEBRIS_REMOVAL_COST_PER_M2,
  ADMIN_RATE,
  IMPREVISTOS_RATE,
  UTILIDAD_RATE,
  IVA_RATE,
  M2_PER_DAY_ESTIMATE,
} from './pricingData';

export interface CalculatorInput {
  selectedServices: ServiceCategory[];
  areaM2: number;
  serviceAreas: Partial<Record<ServiceCategory, number>>;
  bathroomCount: number;
  qualityTier: QualityTier;
  difficulty: DifficultyLevel;
  includesDemolition: boolean;
  includesDebrisRemoval: boolean;
}

export function calculateQuotation(input: CalculatorInput): QuotationResult {
  const {
    selectedServices,
    areaM2,
    serviceAreas,
    bathroomCount,
    qualityTier,
    difficulty,
    includesDemolition,
    includesDebrisRemoval,
  } = input;

  const M2_PER_BATHROOM = 3.5;

  // 1. Desglose de partidas (Line Items)
  const lineItems: QuotationLineItem[] = selectedServices.map((svcId) => {
    const svc = JAYKA_SERVICES.find((s) => s.id === svcId);
    if (!svc) {
      return { service: svcId, area: areaM2, unitPrice: 0, subtotal: 0 };
    }

    const unitPrice = svc.pricing[qualityTier].totalM2;

    let effectiveArea: number;
    if (svcId === 'divisiones_bano') {
      effectiveArea = (bathroomCount > 0 ? bathroomCount : 1) * M2_PER_BATHROOM;
    } else if (CUSTOM_AREA_SERVICES.includes(svcId) && (serviceAreas[svcId] ?? 0) > 0) {
      effectiveArea = serviceAreas[svcId]!;
    } else {
      effectiveArea = areaM2 > 0 ? areaM2 : 1;
    }

    return {
      service: svc.label,
      area: effectiveArea,
      unitPrice,
      subtotal: Math.round(effectiveArea * unitPrice),
    };
  });

  // 2. Subtotal de partidas directas
  const subtotalServices = lineItems.reduce((acc, li) => acc + li.subtotal, 0);

  // 3. Recargo por dificultad de acceso
  const difficultyMultiplier = DIFFICULTY_FACTORS[difficulty] ?? 1.0;
  const difficultyAmount = Math.round(subtotalServices * (difficultyMultiplier - 1));

  // 4. Extras opcionales (Demolición y retiro)
  const demolitionCost = includesDemolition ? Math.round(areaM2 * DEMOLITION_COST_PER_M2) : 0;
  const debrisRemovalCost = includesDebrisRemoval ? Math.round(areaM2 * DEBRIS_REMOVAL_COST_PER_M2) : 0;

  // 5. Costo Directo Total antes de AIU
  const subtotalBeforeMargin =
    subtotalServices + difficultyAmount + demolitionCost + debrisRemovalCost;

  // 6. Desglose AIU (Administración 7%, Imprevistos 3%, Utilidad 5%)
  const adminAmount = Math.round(subtotalBeforeMargin * ADMIN_RATE);
  const imprevistosAmount = Math.round(subtotalBeforeMargin * IMPREVISTOS_RATE);
  const utilidadAmount = Math.round(subtotalBeforeMargin * UTILIDAD_RATE);

  // 7. IVA (19% exclusivamente sobre la Utilidad legal)
  const ivaAmount = Math.round(utilidadAmount * IVA_RATE);

  // 8. Subtotal antes de IVA
  const subtotalBeforeTax =
    subtotalBeforeMargin + adminAmount + imprevistosAmount + utilidadAmount;

  // 9. Total estimado final
  const grandTotal = subtotalBeforeTax + ivaAmount;

  // 10. Tiempo estimado de ejecución
  const totalEffectiveArea = lineItems.reduce((sum, item) => sum + item.area, 0);
  const baseDays = Math.ceil(totalEffectiveArea / M2_PER_DAY_ESTIMATE);
  const estimatedDays = Math.max(5, baseDays);

  return {
    lineItems,
    subtotalServices,
    difficultyMultiplier,
    difficultyAmount,
    demolitionCost,
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

export function useQuotationCalculator(input: CalculatorInput): QuotationResult {
  return useMemo(() => calculateQuotation(input), [
    input.selectedServices,
    input.areaM2,
    input.serviceAreas,
    input.bathroomCount,
    input.qualityTier,
    input.difficulty,
    input.includesDemolition,
    input.includesDebrisRemoval,
  ]);
}
