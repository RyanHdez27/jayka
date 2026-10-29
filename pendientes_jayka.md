# 📋 Pendientes — Jayka Creando Espacios

> Última actualización: 2026-10-24

---

## 🗂 Estado general

| # | Tarea | Estado | Prioridad |
|---|-------|--------|-----------|
| 1 | API de Noticias — integración con filtros de diseño de interiores | 🟢 Completado | Alta |
| 2 | Componentes embebidos de Términos y Condiciones + Tratamiento de Datos | 🔴 Pendiente | Alta |

---

## 1. 📰 API de Noticias — Filtros de Diseño de Interiores

### Descripción
Conectar una fuente externa de noticias (p.ej. NewsAPI, GNews, o similar) al módulo de blog del frontend, filtrando únicamente contenido relacionado con **diseño de interiores, decoración, tendencias de mobiliario y carpintería**.

### Subtareas

- [x] **Elegir proveedor de API de noticias**
  - GNews.io (Soporta CORS en producción para Hostinger, filtrado en español `lang=es`).

- [x] **Definir keywords / categorías de filtro**
  - Segmentado en: `Todas`, `Interiorismo & Tendencias`, `Cocinas Modernas`, `Closets & Almacenamiento`, `Mobiliario a Medida`.

- [x] **Crear servicio con caché inteligente (localStorage TTL 2h)**
  - Servicio `newsService.ts` implementado con fallback enriquecido curado de revistas de diseño (AD, El Mueble, Houzz) para que nunca se quede vacía la web.

- [x] **Crear componente en el frontend**
  - Componente `NewsSection.tsx` con tabs por categoría, skeleton loader, cuadrícula moderna de tarjetas, fotos en alta resolución con zoom hover y enlace directo a la fuente externa original en nueva pestaña (`target="_blank"`).

- [x] **Variables de entorno**
  - Variable `VITE_GNEWS_API_KEY` agregada en `.env`, `.env.example` y `.env.production`.

### Notas
> El endpoint existente `GET /api/v1/posts` maneja el blog propio. Las noticias externas deberían ser un endpoint separado para no mezclar contenido editorial propio con contenido curado.

---

## 2. 📄 Componentes Embebidos — Términos y Condiciones + Tratamiento de Datos

### Descripción
Crear e integrar los textos legales obligatorios de Términos y Condiciones (T&C) y Política de Tratamiento de Datos Personales, accesibles desde el formulario de contacto/leads y el footer.

### Subtareas

- [ ] **Redactar / obtener los textos legales**
  - Términos y Condiciones del sitio web
  - Política de Privacidad y Tratamiento de Datos (Ley 1581 de 2012 — Colombia)
  - Confirmar con asesor legal si aplica

- [ ] **Decidir implementación de visualización**
  - `[ ]` Modal / Dialog emergente (recomendado para el formulario de leads)
  - `[ ]` Página dedicada en ruta `/terminos` y `/privacidad`
  - `[ ]` Ambas opciones (modal en el form + página completa)

- [ ] **Crear componente `<LegalModal>` en el frontend**
  - Props: `type: 'terms' | 'privacy'`, `isOpen`, `onClose`
  - Contenido scrollable con el texto completo
  - Botón de cierre y botón "Acepto"

- [ ] **Agregar checkbox de aceptación en el formulario de leads**
  - Texto: *"He leído y acepto los [Términos y Condiciones] y la [Política de Tratamiento de Datos]"*
  - El formulario no debe enviar si no está marcado
  - Registrar el consentimiento (`accepted_terms_at`) en la tabla `leads` del backend

- [ ] **Agregar links en el footer**
  - Enlace a `/terminos`
  - Enlace a `/privacidad`

- [ ] **Backend: guardar consentimiento en la tabla `leads`**
  - Agregar columna `accepted_terms_at` (timestamp nullable)
  - Actualizar migración y el modelo `Lead`
  - Actualizar validación en `POST /api/v1/leads`

### Notas
> La captura y registro del consentimiento es importante para cumplir con la normativa colombiana de protección de datos (Ley 1581 / Decreto 1377).

---

## 📝 Otras ideas / backlog

- [ ] Integrar Google Analytics o Plausible para métricas del sitio
- [ ] Panel admin: gestión de noticias curadas manualmente
- [ ] Modo oscuro en el frontend

---

*Actualiza este archivo conforme avances. Cambia 🔴 → 🟡 (en progreso) → 🟢 (completado).*
