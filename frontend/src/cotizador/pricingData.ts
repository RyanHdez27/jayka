import type {
  ServiceItem,
  QualityTier,
  DifficultyLevel,
  ServiceCategory,
  ShippingZone,
} from './quotation.types';

// ═══════════════════════════════════════════════════════════════════════
//  TARIFAS ESTANDARIZADAS TODO INCLUIDO JAYKA CREANDO ESPACIOS (COP)
// ═══════════════════════════════════════════════════════════════════════

// 1. Cocina Integral: $950.000 / metro lineal
export const KITCHEN_PRICE_PER_ML = 950_000;
export const KITCHEN_DEDUCTION_SUPERIOR_L = 0.30; // 0.30 m (30 cm) resta al superior en L
export const KITCHEN_DEDUCTION_INFERIOR_L = 0.60; // 0.60 m (60 cm) resta al inferior en L

// 2. Closets: $850.000 / m²
export const CLOSET_PRICE_PER_M2 = 850_000;

// 3. Puertas Entamboradas: hasta 90 cm vs desde 90 cm
export const DOOR_PRICE_UNDER_90 = 950_000;
export const DOOR_PRICE_OVER_90 = 1_100_000;

// 4. Centros de Entretenimiento: $1'000.000 / lámina (material + MO + herrajes + flete + 30% utilidad)
export const TV_UNIT_PRICE_PER_SHEET = 1_000_000;
export const TV_UNIT_PROFIT_MARGIN = 0.30; // 30%

// ═══════════════════════════════════════════════════════════════════════
//  LOGÍSTICA DE ENVÍO, FLETE Y DOMICILIO (PASO 4)
// ═══════════════════════════════════════════════════════════════════════

export interface PresetDestination {
  id: string;
  name: string;
  zone: ShippingZone;
  distanceKm: number;
  tollCount: number;
  tollCostEach: number;
  fuelCostPerKm: number;
  note: string;
}

export const DEFAULT_FUEL_RATE_PER_KM = 3_500; // COP por km de transporte/combustible
export const DEFAULT_TOLL_COST = 20_000;       // COP por peaje promedio

export const PRESET_DESTINATIONS: PresetDestination[] = [
  {
    id: 'villavicencio',
    name: 'Villavicencio (Casco Urbano)',
    zone: 'villavicencio',
    distanceKm: 0,
    tollCount: 0,
    tollCostEach: 0,
    fuelCostPerKm: 0,
    note: 'Envío e instalación urbana 100% incluido en el precio.',
  },
  {
    id: 'restrepo',
    name: 'Restrepo / Cumaral',
    zone: 'fuera',
    distanceKm: 25,
    tollCount: 0,
    tollCostEach: 0,
    fuelCostPerKm: 3_500,
    note: 'Trayecto de ~25 km sin peajes en el corredor.',
  },
  {
    id: 'acacias',
    name: 'Acacías',
    zone: 'fuera',
    distanceKm: 28,
    tollCount: 1,
    tollCostEach: 18_000,
    fuelCostPerKm: 3_500,
    note: 'Trayecto de ~28 km con 1 peaje vehicular.',
  },
  {
    id: 'puerto_lopez',
    name: 'Puerto López',
    zone: 'fuera',
    distanceKm: 85,
    tollCount: 1,
    tollCostEach: 20_000,
    fuelCostPerKm: 3_500,
    note: 'Trayecto intermunicipal de ~85 km con 1 peaje.',
  },
  {
    id: 'granada',
    name: 'Granada / San Martín',
    zone: 'fuera',
    distanceKm: 85,
    tollCount: 2,
    tollCostEach: 19_000,
    fuelCostPerKm: 3_500,
    note: 'Trayecto de ~85 km con 2 peajes.',
  },
  {
    id: 'bogota',
    name: 'Bogotá D.C. / Sabana',
    zone: 'fuera',
    distanceKm: 110,
    tollCount: 3,
    tollCostEach: 24_000,
    fuelCostPerKm: 3_500,
    note: 'Vía al Llano (~110 km) con 3 peajes (Pipiral, Naranjal, Boquerón).',
  },
  {
    id: 'personalizado',
    name: 'Otro Municipio / Destino Personalizado',
    zone: 'fuera',
    distanceKm: 50,
    tollCount: 1,
    tollCostEach: 20_000,
    fuelCostPerKm: 3_500,
    note: 'Cálculo a medida según los km exactos y peajes de la ruta.',
  },
];

// Categorías estandarizadas prioritarias
export const STANDARDIZED_SERVICES: ServiceCategory[] = [
  'cocinas',
  'closets',
  'puertas',
  'centros_tv',
];

export const JAYKA_SERVICES: ServiceItem[] = [
  {
    id: 'cocinas',
    label: 'Mobiliario de Cocina Integral',
    category: 'Carpintería',
    icon: '🍳',
    description: 'Cocinas lineales o en L. Incluye mueble superior e inferior, herrajes de cierre suave y mesón.',
    unit: 'ml',
    customAreaRequired: true,
    pricing: {
      baja:  { manoDeObra: 350_000, materiales: 600_000, totalM2: 950_000 },
      media: { manoDeObra: 350_000, materiales: 600_000, totalM2: 950_000 },
      alta:  { manoDeObra: 350_000, materiales: 600_000, totalM2: 950_000 },
    },
  },
  {
    id: 'closets',
    label: 'Closets & Vestieres',
    category: 'Carpintería',
    icon: '🚪',
    description: 'Diseño a medida con cajonería, maleteros y colgadores en melamina RH de alta resistencia.',
    unit: 'm2',
    customAreaRequired: true,
    pricing: {
      baja:  { manoDeObra: 300_000, materiales: 550_000, totalM2: 850_000 },
      media: { manoDeObra: 300_000, materiales: 550_000, totalM2: 850_000 },
      alta:  { manoDeObra: 300_000, materiales: 550_000, totalM2: 850_000 },
    },
  },
  {
    id: 'puertas',
    label: 'Puertas Entamboradas',
    category: 'Carpintería',
    icon: '🪵',
    description: 'Puertas de paso entamboradas con marco, cerradura e instalación (hasta 90 cm y desde 90 cm).',
    unit: 'unidad',
    customAreaRequired: true,
    pricing: {
      baja:  { manoDeObra: 350_000, materiales: 600_000, totalM2: 950_000 },
      media: { manoDeObra: 350_000, materiales: 600_000, totalM2: 950_000 },
      alta:  { manoDeObra: 350_000, materiales: 600_000, totalM2: 950_000 },
    },
  },
  {
    id: 'centros_tv',
    label: 'Centros de Entretenimiento & TV',
    category: 'Carpintería',
    icon: '📺',
    description: 'Paneles flotantes y muebles de TV suspendidos. Se cotiza por lámina de material con herrajes.',
    unit: 'lámina',
    customAreaRequired: true,
    pricing: {
      baja:  { manoDeObra: 350_000, materiales: 650_000, totalM2: 1_000_000 },
      media: { manoDeObra: 350_000, materiales: 650_000, totalM2: 1_000_000 },
      alta:  { manoDeObra: 350_000, materiales: 650_000, totalM2: 1_000_000 },
    },
  },
  {
    id: 'ventanas',
    label: 'Ventanería en Aluminio & Vidrio',
    category: 'Aluminio y Vidrio',
    icon: '🪟',
    description: 'Ventanería residencial y comercial, perfilería moderna, vidrio templado y acústico.',
    unit: 'm2',
    customAreaRequired: true,
    pricing: {
      baja:  { manoDeObra:  70_000, materiales: 250_000, totalM2: 320_000 },
      media: { manoDeObra: 110_000, materiales: 370_000, totalM2: 480_000 },
      alta:  { manoDeObra: 180_000, materiales: 720_000, totalM2: 900_000 },
    },
  },
  {
    id: 'oficinas',
    label: 'Mobiliario Corporativo & Oficina',
    category: 'Carpintería',
    icon: '💼',
    description: 'Escritorios ergonómicos, estanterías modulares, bibliotecas y recepciones.',
    unit: 'm2',
    customAreaRequired: true,
    pricing: {
      baja:  { manoDeObra: 130_000, materiales: 270_000, totalM2: 400_000 },
      media: { manoDeObra: 210_000, materiales: 440_000, totalM2: 650_000 },
      alta:  { manoDeObra: 320_000, materiales: 680_000, totalM2: 1_000_000 },
    },
  },
  {
    id: 'divisiones_bano',
    label: 'Divisiones de Baño en Vidrio Templado',
    category: 'Aluminio y Vidrio',
    icon: '🚿',
    description: 'Vidrio de seguridad templado de 6mm y 8mm con accesorios en acero inoxidable.',
    unit: 'm2',
    pricing: {
      baja:  { manoDeObra: 100_000, materiales: 350_000, totalM2: 450_000 },
      media: { manoDeObra: 130_000, materiales: 490_000, totalM2: 620_000 },
      alta:  { manoDeObra: 180_000, materiales: 740_000, totalM2: 920_000 },
    },
  },
  {
    id: 'remodelacion',
    label: 'Remodelación Integral',
    category: 'Construcción',
    icon: '🏠',
    description: 'Transformación integral de espacios con demolición, adecuaciones y nuevos ambientes.',
    unit: 'm2',
    pricing: {
      baja:  { manoDeObra: 150_000, materiales: 400_000, totalM2: 550_000 },
      media: { manoDeObra: 260_000, materiales: 740_000, totalM2: 1_000_000 },
      alta:  { manoDeObra: 450_000, materiales: 1_450_000, totalM2: 1_900_000 },
    },
  },
  {
    id: 'pisos',
    label: 'Pisos y Enchapes',
    category: 'Acabados',
    icon: '✨',
    description: 'Porcelanato, pisos laminados, SPC de alto tráfico y enchapes para baños y cocinas.',
    unit: 'm2',
    pricing: {
      baja:  { manoDeObra:  35_000, materiales:  65_000, totalM2: 100_000 },
      media: { manoDeObra:  55_000, materiales: 115_000, totalM2: 170_000 },
      alta:  { manoDeObra:  85_000, materiales: 175_000, totalM2: 260_000 },
    },
  },
  {
    id: 'pintura',
    label: 'Pintura & Drywall',
    category: 'Acabados',
    icon: '🎨',
    description: 'Resane, estuco plástico, cielo raso en drywall y pintura lavable tipo 1.',
    unit: 'm2',
    pricing: {
      baja:  { manoDeObra:  25_000, materiales:  45_000, totalM2:  70_000 },
      media: { manoDeObra:  40_000, materiales:  70_000, totalM2: 110_000 },
      alta:  { manoDeObra:  65_000, materiales: 115_000, totalM2: 180_000 },
    },
  },
];

// Servicios que comúnmente requieren su propio metraje específico
export const CUSTOM_AREA_SERVICES: ServiceCategory[] = [
  'cocinas',
  'closets',
  'puertas',
  'centros_tv',
  'ventanas',
  'oficinas',
];

// Opciones de Gama de Materiales
export const QUALITY_OPTIONS: { value: QualityTier; label: string; desc: string; badge: string; color: string; factor: number }[] = [
  {
    value: 'baja',
    label: 'Línea Estándar Jayka (Incluida)',
    desc: 'Melamina RH antihumedad, cantos rígidos termoadheridos, rieles telescópicos y bisagras de cierre suave con garantía.',
    badge: 'Estándar Incluido',
    color: '#0D9488',
    factor: 1.0,
  },
  {
    value: 'media',
    label: 'Línea Premium (+15%)',
    desc: 'Tableros texturizados sincronizados madera, perfil gola de aluminio e iluminación LED empotrada en muebles.',
    badge: 'Más Elegante',
    color: '#2CB99B',
    factor: 1.15,
  },
  {
    value: 'alta',
    label: 'Línea Luxury (+30%)',
    desc: 'Acabados polilaminados alto brillo/mate antihuella, sistemas de elevación Aventos y herrajes europeos Blum.',
    badge: 'Alta Gama',
    color: '#0F766E',
    factor: 1.30,
  },
];

// Factores de dificultad y acceso (mantenidos por compatibilidad)
export const DIFFICULTY_FACTORS: Record<DifficultyLevel, number> = {
  normal: 1.00,
  moderada: 1.10,
  alta: 1.20,
};

export const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; desc: string; factor: string }[] = [
  {
    value: 'normal',
    label: 'Acceso Normal',
    desc: 'Planta baja o ascensor de carga disponible, sin restricciones de horario ni izaje.',
    factor: '+0%',
  },
  {
    value: 'moderada',
    label: 'Acceso Moderado',
    desc: 'Pisos superiores por escalera o restricciones de administración.',
    factor: '+10%',
  },
  {
    value: 'alta',
    label: 'Acceso Complejo',
    desc: 'Maniobras complejas de izaje en fachada o espacio de trabajo muy reducido.',
    factor: '+20%',
  },
];

// Costos de demolición y escombros (COP por m²)
export const DEMOLITION_COST_PER_M2 = 45_000;
export const DEBRIS_REMOVAL_COST_PER_M2 = 30_000;

// Esquema AIU Colombia (para obras civiles donde no esté incluido)
export const ADMIN_RATE = 0.07;
export const IMPREVISTOS_RATE = 0.03;
export const UTILIDAD_RATE = 0.05;
export const IVA_RATE = 0.19;

// Rendimiento estimado (unidades o ml por día)
export const M2_PER_DAY_ESTIMATE = 4;
