// ─── Quality Tiers ─────────────────────────────────────────────────
export type QualityTier = 'baja' | 'media' | 'alta';

// ─── Jayka Service Categories ──────────────────────────────────────
export type ServiceCategory =
  | 'cocinas'
  | 'closets'
  | 'puertas'
  | 'ventanas'
  | 'centros_tv'
  | 'oficinas'
  | 'divisiones_bano'
  | 'remodelacion'
  | 'pisos'
  | 'pintura';

// ─── Pricing shape per m² (COP) ────────────────────────────────────
export interface PricingPerM2 {
  manoDeObra: number;
  materiales: number;
  totalM2: number;
}

// ─── Service definition ────────────────────────────────────────────
export interface ServiceItem {
  id: ServiceCategory;
  label: string;
  category: string;
  icon: string;
  description: string;
  pricing: Record<QualityTier, PricingPerM2>;
  unit: 'm2' | 'unidad' | 'ml';
  customAreaRequired?: boolean;
}

// ─── Difficulty levels ─────────────────────────────────────────────
export type DifficultyLevel = 'normal' | 'moderada' | 'alta';

// ─── Form data ─────────────────────────────────────────────────────
export interface QuotationFormData {
  // Step 1: Info
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectLocation: string;
  wantsContact: boolean;

  // Step 2: Scope
  selectedServices: ServiceCategory[];
  areaM2: number;
  serviceAreas: Partial<Record<ServiceCategory, number>>;
  bathroomCount: number;

  // Step 3: Quality
  qualityTier: QualityTier;

  // Step 4: Extras
  difficulty: DifficultyLevel;
  includesDemolition: boolean;
  includesDebrisRemoval: boolean;
  additionalNotes: string;
}

// ─── Line item in result ───────────────────────────────────────────
export interface QuotationLineItem {
  service: string;
  area: number;
  unitPrice: number;
  subtotal: number;
}

// ─── Result breakdown ──────────────────────────────────────────────
export interface QuotationResult {
  lineItems: QuotationLineItem[];
  subtotalServices: number;
  difficultyMultiplier: number;
  difficultyAmount: number;
  demolitionCost: number;
  debrisRemovalCost: number;
  subtotalBeforeMargin: number;

  // AIU legal Colombia
  adminRate: number;         // 7%
  adminAmount: number;
  imprevistosRate: number;   // 3%
  imprevistosAmount: number;
  utilidadRate: number;      // 5%
  utilidadAmount: number;
  ivaRate: number;           // 19%
  ivaAmount: number;         // 19% sobre utilidad

  // Totales
  margin: number;
  marginAmount: number;
  subtotalBeforeTax: number;
  iva: number;
  grandTotal: number;
  estimatedDays: number;
}
