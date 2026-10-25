/**
 * jayka.types.ts
 * ─────────────────────────────────────────────────────────────────────
 * Tipos del sistema de cotización de Jayka Creando Espacios.
 * Categorías: mobiliario y carpintería de interior.
 * ─────────────────────────────────────────────────────────────────────
 */

// ── Niveles de calidad ────────────────────────────────────────────────
export type QualityTier = 'baja' | 'media' | 'alta';

// ── Categorías de productos Jayka ─────────────────────────────────────
export type JaykaCategory =
  | 'cocina'
  | 'closets'
  | 'puertas'
  | 'banos'
  | 'muebles_sala'
  | 'vestier';

// ── Niveles de dificultad de instalación ──────────────────────────────
export type DifficultyLevel = 'normal' | 'moderada' | 'alta';

// ── Precio por m² (o por unidad según el servicio) ───────────────────
export interface JaykaPricing {
  fabricacion: number;   // COP — costo de fabricación por m²/unidad
  instalacion: number;   // COP — costo de instalación por m²/unidad
  totalM2: number;       // COP — valor total usado en el cálculo
}

// ── Definición de un servicio Jayka ───────────────────────────────────
export interface JaykaService {
  id: JaykaCategory;
  label: string;
  icon: string;
  unit: 'm2' | 'ml' | 'unidad';
  pricing: Record<QualityTier, JaykaPricing>;
}

// ── Datos del formulario wizard ───────────────────────────────────────
export interface QuotationFormData {
  // Paso 1 — Datos cliente
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectLocation: string;

  // Paso 2 — Servicios y medidas
  selectedServices: JaykaCategory[];
  areaM2: number;
  serviceAreas: Partial<Record<JaykaCategory, number>>;

  // Paso 3 — Calidad
  qualityTier: QualityTier;

  // Paso 4 — Extras
  difficulty: DifficultyLevel;
  includesDismantling: boolean;  // desmonte de muebles existentes
  includesDebrisRemoval: boolean;
  additionalNotes: string;
  wantsContact: boolean;
}

// ── Ítem de línea en el resultado ────────────────────────────────────
export interface QuotationLineItem {
  service: string;
  area: number;
  unitPrice: number;
  subtotal: number;
}

// ── Resultado completo de la cotización ──────────────────────────────
export interface QuotationResult {
  lineItems: QuotationLineItem[];
  subtotalServices: number;
  difficultyMultiplier: number;
  difficultyAmount: number;
  dismantlingCost: number;
  debrisRemovalCost: number;
  subtotalBeforeMargin: number;

  // Desglose de márgenes
  adminRate: number;
  adminAmount: number;
  imprevistosRate: number;
  imprevistosAmount: number;
  utilidadRate: number;
  utilidadAmount: number;
  ivaRate: number;
  ivaAmount: number;

  margin: number;
  marginAmount: number;
  subtotalBeforeTax: number;
  iva: number;
  grandTotal: number;
  estimatedDays: number;
}
