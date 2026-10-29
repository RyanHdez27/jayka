import { useMemo } from 'react';
import type {
  ServiceCategory,
  QualityTier,
  DifficultyLevel,
  QuotationResult,
  QuotationLineItem,
  StandardizedServicesState,
  ShippingConfig,
} from './quotation.types';
import {
  JAYKA_SERVICES,
  KITCHEN_PRICE_PER_ML,
  KITCHEN_DEDUCTION_SUPERIOR_L,
  KITCHEN_DEDUCTION_INFERIOR_L,
  CLOSET_PRICE_PER_M2,
  DOOR_PRICE_UNDER_90,
  DOOR_PRICE_OVER_90,
  TV_UNIT_PRICE_PER_SHEET,
  QUALITY_OPTIONS,
  DEFAULT_FUEL_RATE_PER_KM,
  DEFAULT_TOLL_COST,
} from './pricingData';

export interface CalculatorInput {
  selectedServices: ServiceCategory[];
  areaM2: number;
  serviceAreas: Partial<Record<ServiceCategory, number>>;
  bathroomCount: number;
  standardizedState?: StandardizedServicesState;
  qualityTier: QualityTier;
  shipping?: ShippingConfig;
  difficulty?: DifficultyLevel;
  includesDemolition?: boolean;
  includesDebrisRemoval?: boolean;
}

export function calculateQuotation(input: CalculatorInput): QuotationResult {
  const {
    selectedServices,
    areaM2,
    serviceAreas,
    bathroomCount,
    standardizedState,
    qualityTier,
    shipping,
  } = input;

  const qualityOption = QUALITY_OPTIONS.find((q) => q.value === qualityTier);
  const qualityFactor = qualityOption ? qualityOption.factor : 1.0;

  const lineItems: QuotationLineItem[] = [];

  for (const svcId of selectedServices) {
    if (svcId === 'cocinas') {
      const kState = standardizedState?.kitchen;
      const shape = kState?.shape ?? 'lineal';
      let effectiveMl = 3.0;
      let details = 'Cocina lineal (mueble superior, inferior y mesón)';

      if (shape === 'lineal') {
        effectiveMl = kState?.linearMeters && kState.linearMeters > 0 ? kState.linearMeters : 3.0;
        details = `Cocina lineal de ${effectiveMl.toFixed(2)} ml (mueble sup. e inf.)`;
      } else {
        const ladoA = kState?.ladoA && kState.ladoA > 0 ? kState.ladoA : 2.5;
        const ladoB = kState?.ladoB && kState.ladoB > 0 ? kState.ladoB : 2.0;
        const totalL = ladoA + ladoB;
        const supMl = Math.max(0.2, totalL - KITCHEN_DEDUCTION_SUPERIOR_L);
        const infMl = Math.max(0.2, totalL - KITCHEN_DEDUCTION_INFERIOR_L);
        effectiveMl = Math.round(((supMl + infMl) / 2) * 100) / 100;
        details = `Cocina en L (${ladoA.toFixed(2)}m + ${ladoB.toFixed(2)}m) · Sup: ${supMl.toFixed(2)}ml (-0.30m) · Inf: ${infMl.toFixed(2)}ml (-0.60m)`;
      }

      const unitPrice = Math.round(KITCHEN_PRICE_PER_ML * qualityFactor);
      const subtotal = Math.round(effectiveMl * unitPrice);

      lineItems.push({
        service: 'Mobiliario de Cocina Integral',
        details,
        area: effectiveMl,
        unit: 'ml',
        unitPrice,
        subtotal,
      });
    } else if (svcId === 'closets') {
      const cState = standardizedState?.closet;
      const width = cState?.width && cState.width > 0 ? cState.width : 2.0;
      const height = cState?.height && cState.height > 0 ? cState.height : 2.3;
      const effectiveArea =
        cState?.m2 && cState.m2 > 0 ? cState.m2 : Math.round(width * height * 100) / 100;
      const details = `Closet a medida (${width.toFixed(2)}m ancho × ${height.toFixed(2)}m alto)`;

      const unitPrice = Math.round(CLOSET_PRICE_PER_M2 * qualityFactor);
      const subtotal = Math.round(effectiveArea * unitPrice);

      lineItems.push({
        service: 'Closets & Vestieres',
        details,
        area: effectiveArea,
        unit: 'm²',
        unitPrice,
        subtotal,
      });
    } else if (svcId === 'puertas') {
      const dState = standardizedState?.doors;
      const under90 = dState ? dState.under90 : 1;
      const over90 = dState ? dState.over90 : 0;

      if (under90 > 0) {
        const unitPrice = Math.round(DOOR_PRICE_UNDER_90 * qualityFactor);
        lineItems.push({
          service: 'Puertas Entamboradas (≤ 90 cm)',
          details: 'Puertas entamboradas estándar con marco, cerradura e instalación',
          area: under90,
          unit: 'und',
          unitPrice,
          subtotal: under90 * unitPrice,
        });
      }

      if (over90 > 0) {
        const unitPrice = Math.round(DOOR_PRICE_OVER_90 * qualityFactor);
        lineItems.push({
          service: 'Puertas Entamboradas (> 90 cm)',
          details: 'Puertas entamboradas de gran formato con marco e instalación',
          area: over90,
          unit: 'und',
          unitPrice,
          subtotal: over90 * unitPrice,
        });
      }

      if (under90 === 0 && over90 === 0) {
        const unitPrice = Math.round(DOOR_PRICE_UNDER_90 * qualityFactor);
        lineItems.push({
          service: 'Puerta Entamborada Estándar',
          details: 'Puerta de paso con marco e instalación',
          area: 1,
          unit: 'und',
          unitPrice,
          subtotal: unitPrice,
        });
      }
    } else if (svcId === 'centros_tv') {
      const tvState = standardizedState?.tvUnit;
      const sheetsCount = tvState?.sheetsCount && tvState.sheetsCount > 0 ? tvState.sheetsCount : 1;
      const details = `${sheetsCount} lámina(s) de material · Todo incluido: tableros, herrajes, transporte y mano de obra`;

      const unitPrice = Math.round(TV_UNIT_PRICE_PER_SHEET * qualityFactor);
      const subtotal = Math.round(sheetsCount * unitPrice);

      lineItems.push({
        service: 'Centro de Entretenimiento & TV',
        details,
        area: sheetsCount,
        unit: 'láminas',
        unitPrice,
        subtotal,
      });
    } else {
      // Otros servicios del catálogo
      const svc = JAYKA_SERVICES.find((s) => s.id === svcId);
      if (svc) {
        let effArea = areaM2 > 0 ? areaM2 : 1;
        if (svcId === 'divisiones_bano') {
          effArea = (bathroomCount > 0 ? bathroomCount : 1) * 3.5;
        } else if (serviceAreas[svcId] && serviceAreas[svcId]! > 0) {
          effArea = serviceAreas[svcId]!;
        }

        const unitPrice = Math.round(svc.pricing[qualityTier].totalM2 * qualityFactor);
        const subtotal = Math.round(effArea * unitPrice);

        lineItems.push({
          service: svc.label,
          details: svc.description,
          area: effArea,
          unit: svc.unit,
          unitPrice,
          subtotal,
        });
      }
    }
  }

  // Subtotal de partidas directas
  const subtotalServices = lineItems.reduce((acc, li) => acc + li.subtotal, 0);

  // ── LOGÍSTICA DE ENVÍO Y DOMICILIO (PASO 4) ──────────────────────
  let shippingCost = 0;
  let shippingDetails = 'Envío urbano en Villavicencio (Incluido)';
  const shippingZone = shipping?.zone ?? 'villavicencio';
  const destinationCity = shipping?.destinationCity || (shippingZone === 'villavicencio' ? 'Villavicencio' : 'Fuera de ciudad');
  const distanceKm = shipping?.distanceKm ?? 0;
  const tollCount = shipping?.tollCount ?? 0;

  if (shippingZone === 'villavicencio') {
    shippingCost = 0;
    shippingDetails = 'Envío e instalación en Villavicencio (100% Incluido)';
  } else {
    const fuelRate = shipping?.fuelCostPerKm && shipping.fuelCostPerKm > 0 ? shipping.fuelCostPerKm : DEFAULT_FUEL_RATE_PER_KM;
    const tollCostEach = shipping?.tollCostEach && shipping.tollCostEach > 0 ? shipping.tollCostEach : DEFAULT_TOLL_COST;
    const fuelCost = Math.round(distanceKm * fuelRate);
    const tollsTotal = Math.round(tollCount * tollCostEach);
    shippingCost = fuelCost + tollsTotal;

    const tollText = tollCount > 0 ? ` + ${tollCount} peaje(s)` : ' (sin peajes)';
    shippingDetails = `Transporte a ${destinationCity} (${distanceKm} km combustible${tollText})`;
  }

  const subtotalBeforeMargin = subtotalServices + shippingCost;
  const isAllInclusive = true;
  const subtotalBeforeTax = subtotalBeforeMargin;
  const grandTotal = subtotalBeforeTax;

  // Estimado de días de producción e instalación
  const totalAreaOrUnits = lineItems.reduce((sum, item) => sum + item.area, 0);
  const baseDays = Math.max(6, Math.ceil(totalAreaOrUnits * 1.5));
  const estimatedDays = shippingZone === 'fuera' ? baseDays + 1 : baseDays;

  return {
    lineItems,
    subtotalServices,

    // Envío y Logística
    shippingCost,
    shippingDetails,
    shippingZone,
    destinationCity,
    distanceKm,
    tollCount,

    // Compatibilidad
    difficultyMultiplier: 1.0,
    difficultyAmount: 0,
    demolitionCost: 0,
    debrisRemovalCost: 0,
    subtotalBeforeMargin,

    isAllInclusive,
    adminRate: 0,
    adminAmount: 0,
    imprevistosRate: 0,
    imprevistosAmount: 0,
    utilidadRate: 0,
    utilidadAmount: 0,
    ivaRate: 0,
    ivaAmount: 0,

    margin: 0,
    marginAmount: 0,
    subtotalBeforeTax,
    iva: 0,
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
    input.standardizedState,
    input.qualityTier,
    input.shipping,
  ]);
}
