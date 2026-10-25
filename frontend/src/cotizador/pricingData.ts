import type {
  ServiceItem,
  QualityTier,
  DifficultyLevel,
  ServiceCategory,
} from './quotation.types';

// ═══════════════════════════════════════════════════════════════════════
//  SERVICIOS JAYKA CREANDO ESPACIOS
// ═══════════════════════════════════════════════════════════════════════

export const JAYKA_SERVICES: ServiceItem[] = [
  {
    id: 'cocinas',
    label: 'Mobiliario de Cocina',
    category: 'Carpintería',
    icon: '🍳',
    description: 'Cocinas lineales, en L o con isla. Herrajes de cierre lento y mesones en granito/cuarzo.',
    unit: 'm2',
    customAreaRequired: true,
    pricing: {
      baja:  { manoDeObra: 220_000, materiales: 480_000, totalM2: 700_000 },
      media: { manoDeObra: 350_000, materiales: 750_000, totalM2: 1_100_000 },
      alta:  { manoDeObra: 550_000, materiales: 1_250_000, totalM2: 1_800_000 },
    },
  },
  {
    id: 'closets',
    label: 'Closets & Vestieres',
    category: 'Carpintería',
    icon: '🚪',
    description: 'Sistemas corredizos o abatibles con distribución a medida, cajonería y zapateros.',
    unit: 'm2',
    customAreaRequired: true,
    pricing: {
      baja:  { manoDeObra: 180_000, materiales: 370_000, totalM2: 550_000 },
      media: { manoDeObra: 280_000, materiales: 570_000, totalM2: 850_000 },
      alta:  { manoDeObra: 420_000, materiales: 930_000, totalM2: 1_350_000 },
    },
  },
  {
    id: 'puertas',
    label: 'Puertas de Paso e Interiores',
    category: 'Carpintería',
    icon: '🪵',
    description: 'Puertas principales de seguridad o interiores entamboradas y macizas con marco.',
    unit: 'm2',
    customAreaRequired: true,
    pricing: {
      baja:  { manoDeObra: 120_000, materiales: 260_000, totalM2: 380_000 },
      media: { manoDeObra: 190_000, materiales: 390_000, totalM2: 580_000 },
      alta:  { manoDeObra: 280_000, materiales: 600_000, totalM2: 880_000 },
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
    id: 'centros_tv',
    label: 'Centros de TV & Paneles Sala',
    category: 'Carpintería',
    icon: '📺',
    description: 'Muebles suspendidos, paneles alistonados, iluminación LED integrada y gestión de cables.',
    unit: 'm2',
    customAreaRequired: true,
    pricing: {
      baja:  { manoDeObra: 140_000, materiales: 280_000, totalM2: 420_000 },
      media: { manoDeObra: 220_000, materiales: 460_000, totalM2: 680_000 },
      alta:  { manoDeObra: 340_000, materiales: 760_000, totalM2: 1_100_000 },
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
  'ventanas',
  'centros_tv',
  'oficinas',
];

// Opciones de Gama de Materiales
export const QUALITY_OPTIONS: { value: QualityTier; label: string; desc: string; badge: string; color: string }[] = [
  {
    value: 'baja',
    label: 'Línea Estándar',
    desc: 'Melaminas comerciales resistentes, herrajes básicos funcionales y acabados limpios.',
    badge: 'Económica',
    color: '#0D9488',
  },
  {
    value: 'media',
    label: 'Línea Premium',
    desc: 'Melaminas RH antihumedad, cantos rígidos, herrajes de cierre suave y mesones en granito natural.',
    badge: 'Más Popular',
    color: '#2CB99B',
  },
  {
    value: 'alta',
    label: 'Línea Luxury',
    desc: 'Maderas macizas / polilaminados, cuarzo o sinterizados, iluminación LED empotrada y herrajes importados.',
    badge: 'Alta Gama',
    color: '#0F766E',
  },
];

// Factores de dificultad y acceso
export const DIFFICULTY_FACTORS: Record<DifficultyLevel, number> = {
  normal: 1.00,
  moderada: 1.10, // +10%
  alta: 1.20,     // +20%
};

export const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; desc: string; factor: string }[] = [
  {
    value: 'normal',
    label: 'Acceso Normal',
    desc: 'Planta baja, ascensor de carga disponible, sin restricciones horarias.',
    factor: '+0%',
  },
  {
    value: 'moderada',
    label: 'Acceso Moderado',
    desc: 'Pisos superiores por escalera, restricciones de copropiedad o espacio reducido.',
    factor: '+10%',
  },
  {
    value: 'alta',
    label: 'Acceso Complejo',
    desc: 'Trabajo en alturas exteriores, maniobras especiales de izaje o estructuras protegidas.',
    factor: '+20%',
  },
];

// Costos de demolición y escombros (COP por m²)
export const DEMOLITION_COST_PER_M2 = 45_000;
export const DEBRIS_REMOVAL_COST_PER_M2 = 30_000;

// Esquema AIU Colombia
export const ADMIN_RATE = 0.07;       // 7%
export const IMPREVISTOS_RATE = 0.03; // 3%
export const UTILIDAD_RATE = 0.05;    // 5%
export const IVA_RATE = 0.19;         // 19% aplicado exclusivamente sobre la utilidad

// Rendimiento estimado (m² por día hábil por cuadrilla)
export const M2_PER_DAY_ESTIMATE = 5;
