// ─── Quality Tiers ─────────────────────────────────────────────────
export type QualityTier = 'baja' | 'media' | 'alta';

// ─── Jayka Service Categories ──────────────────────────────────────
export type ServiceCategory =
  | 'cocinas'
  | 'closets'
  | 'puertas'
  | 'centros_tv'
  | 'ventanas'
  | 'oficinas'
  | 'divisiones_bano'
  | 'remodelacion'
  | 'pisos'
  | 'pintura';

// ─── Configuración detallada para servicios estandarizados ─────────
export type KitchenShape = 'lineal' | 'en_l';

export interface KitchenConfig {
  shape: KitchenShape;
  linearMeters: number;      // si es lineal
  ladoA: number;             // si es en L (m)
  ladoB: number;             // si es en L (m)
  deductionSuperior: number; // 0.30 m
  deductionInferior: number; // 0.60 m
  mlSuperior: number;
  mlInferior: number;
  mlCalculated: number;
}

export interface ClosetConfig {
  width: number;             // m
  height: number;            // m
  m2: number;                // width * height
}

export interface DoorsConfig {
  under90: number;           // cantidad de puertas hasta 90 cm ($950.000)
  over90: number;            // cantidad de puertas desde 90 cm ($1.100.000)
}

export interface TvUnitConfig {
  sheetsCount: number;       // cantidad de láminas de material ($1'000.000 c/u)
}

export interface StandardizedServicesState {
  kitchen: KitchenConfig;
  closet: ClosetConfig;
  doors: DoorsConfig;
  tvUnit: TvUnitConfig;
}

// ─── Configuración de Envío y Domicilio (Paso 4) ───────────────────
export type ShippingZone = 'villavicencio' | 'fuera';

export interface ShippingConfig {
  zone: ShippingZone;
  destinationCity: string;
  distanceKm: number;
  fuelCostPerKm: number;
  tollCount: number;
  tollCostEach: number;
  shippingCost: number;
  shippingDetails: string;
}

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
  unit: 'm2' | 'unidad' | 'ml' | 'lámina';
  customAreaRequired?: boolean;
}

// ─── Difficulty levels (mantenido por compatibilidad opcional) ─────
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
  standardizedState: StandardizedServicesState;

  // Step 3: Quality
  qualityTier: QualityTier;

  // Step 4: Envío y Logística
  shipping: ShippingConfig;
  additionalNotes: string;
}

// ─── Line item in result ───────────────────────────────────────────
export interface QuotationLineItem {
  service: string;
  details?: string;
  area: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

// ─── Result breakdown ──────────────────────────────────────────────
export interface QuotationResult {
  lineItems: QuotationLineItem[];
  subtotalServices: number;

  // Envío y Logística (Paso 4)
  shippingCost: number;
  shippingDetails: string;
  shippingZone: ShippingZone;
  destinationCity: string;
  distanceKm: number;
  tollCount: number;

  // Compatibilidad con extras previos
  difficultyMultiplier: number;
  difficultyAmount: number;
  demolitionCost: number;
  debrisRemovalCost: number;
  subtotalBeforeMargin: number;

  // AIU
  isAllInclusive: boolean;
  adminRate: number;
  adminAmount: number;
  imprevistosRate: number;
  imprevistosAmount: number;
  utilidadRate: number;
  utilidadAmount: number;
  ivaRate: number;
  ivaAmount: number;

  // Totales
  margin: number;
  marginAmount: number;
  subtotalBeforeTax: number;
  iva: number;
  grandTotal: number;
  estimatedDays: number;
}
