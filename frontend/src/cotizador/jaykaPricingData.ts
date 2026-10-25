/**
 * jaykaPricingData.ts
 * ─────────────────────────────────────────────────────────────────────
 * Catálogo de precios de Jayka Creando Espacios — Villavicencio, Meta.
 *
 * ⚠️  PENDIENTE DE PRECIOS REALES
 * ─────────────────────────────────────────────────────────────────────
 * Todos los valores marcados con  ← PRECIO A DEFINIR  deben ser
 * reemplazados con los valores reales en COP antes de salir a producción.
 *
 * Estructura de cada nivel de calidad:
 *   fabricacion : costo de fabricación por m² (o por unidad si unit='unidad')
 *   instalacion : costo de instalación por m²
 *   totalM2     : valor total usado por el calculador = fabricacion + instalacion
 *
 * Rangos orientativos para mobiliario de madera en Colombia 2025-2026:
 *   Estándar : mdf liso, herrajes básicos
 *   Premium  : enchape de madera, herrajes europeos
 *   Luxury   : madera maciza / lacado, herrajes de alta gama importados
 * ─────────────────────────────────────────────────────────────────────
 */

import type { JaykaService, QualityTier, DifficultyLevel } from './jayka.types';

// ═══════════════════════════════════════════════════════════════════════
//  CATÁLOGO DE SERVICIOS
// ═══════════════════════════════════════════════════════════════════════

export const jaykaServices: JaykaService[] = [
  // ── 1. MOBILIARIO DE COCINA ─────────────────────────────────────────
  {
    id: 'cocina',
    label: 'Mobiliario de Cocina',
    icon: '🍳',
    unit: 'm2',
    pricing: {
      // Nivel Estándar — MDF liso, herrajes básicos
      baja: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)  [suele ser fabricacion + instalacion]
      },
      // Nivel Premium — enchape de madera, herrajes europeos
      media: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
      // Nivel Luxury — madera maciza, lacado, herrajes importados
      alta: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
    },
  },

  // ── 2. CLOSETS ─────────────────────────────────────────────────────
  {
    id: 'closets',
    label: 'Closets',
    icon: '🚪',
    unit: 'm2',
    pricing: {
      baja: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
      media: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
      alta: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
    },
  },

  // ── 3. PUERTAS ─────────────────────────────────────────────────────
  {
    id: 'puertas',
    label: 'Puertas',
    icon: '🚪',
    unit: 'unidad',
    pricing: {
      // NOTA: para 'unidad', totalM2 = precio por unidad completa
      baja: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/unidad)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/unidad)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/unidad)
      },
      media: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/unidad)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/unidad)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/unidad)
      },
      alta: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/unidad)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/unidad)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/unidad)
      },
    },
  },

  // ── 4. MUEBLES DE BAÑO ─────────────────────────────────────────────
  {
    id: 'banos',
    label: 'Muebles de Baño',
    icon: '🛁',
    unit: 'm2',
    pricing: {
      baja: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
      media: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
      alta: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
    },
  },

  // ── 5. MUEBLES DE SALA / COMEDOR ────────────────────────────────────
  {
    id: 'muebles_sala',
    label: 'Muebles de Sala / Comedor',
    icon: '🛋️',
    unit: 'm2',
    pricing: {
      baja: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
      media: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
      alta: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
    },
  },

  // ── 6. VESTIER ──────────────────────────────────────────────────────
  {
    id: 'vestier',
    label: 'Vestier',
    icon: '👔',
    unit: 'm2',
    pricing: {
      baja: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
      media: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
      alta: {
        fabricacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        instalacion: 0,   // ← PRECIO A DEFINIR (COP/m²)
        totalM2:     0,   // ← PRECIO A DEFINIR (COP/m²)
      },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  CONSTANTES DE CÁLCULO
// ═══════════════════════════════════════════════════════════════════════

/** Multiplicadores por dificultad de instalación */
export const DIFFICULTY_FACTORS: Record<DifficultyLevel, number> = {
  normal:   1.0,   // Sin recargo
  moderada: 1.10,  // +10% — espacios reducidos, pisos altos sin ascensor
  alta:     1.20,  // +20% — obra nueva, acceso muy limitado
};

/** Costo de desmonte de muebles existentes por m² */
export const DISMANTLING_COST_PER_M2 = 0;  // ← PRECIO A DEFINIR (COP/m²)

/** Costo de retiro de escombros / residuos por m² */
export const DEBRIS_REMOVAL_COST_PER_M2 = 0;  // ← PRECIO A DEFINIR (COP/m²)

// ── Márgenes financieros ──────────────────────────────────────────────
/** Administración: 7% del subtotal neto */
export const ADMIN_RATE = 0.07;

/** Imprevistos: 3% del subtotal neto */
export const IMPREVISTOS_RATE = 0.03;

/** Utilidad: 5% del subtotal neto */
export const UTILIDAD_RATE = 0.05;

/** IVA: 19% — se aplica SOLO sobre la utilidad */
export const IVA_RATE = 0.19;

/** Estimado de m² instalados por día por cuadrilla */
export const M2_PER_DAY_ESTIMATE = 4;  // ← Ajustar según capacidad de Jayka
