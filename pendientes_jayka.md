# 📋 Pendientes — Jayka Creando Espacios

> Última actualización: 2026-10-24

---

## 🗂 Estado general

| # | Tarea | Estado | Prioridad |
|---|-------|--------|-----------|
| 1 | API de Noticias — integración con filtros de diseño de interiores | 🔴 Pendiente | Alta |
| 2 | Componentes embebidos de Términos y Condiciones + Tratamiento de Datos | 🔴 Pendiente | Alta |

---

## 1. 📰 API de Noticias — Filtros de Diseño de Interiores

### Descripción
Conectar una fuente externa de noticias (p.ej. NewsAPI, GNews, o similar) al módulo de blog del frontend, filtrando únicamente contenido relacionado con **diseño de interiores, decoración, tendencias de mobiliario y carpintería**.

### Subtareas

- [ ] **Elegir proveedor de API de noticias**
  - Opciones: [NewsAPI.org](https://newsapi.org), [GNews](https://gnews.io), [Mediastack](https://mediastack.com)
  - Verificar plan gratuito vs. pago, límites de peticiones y soporte en español

- [ ] **Definir keywords / categorías de filtro**
  - Palabras clave sugeridas: `diseño de interiores`, `decoración`, `interiorismo`, `mobiliario`, `carpintería`, `tendencias hogar`
  - Considerar filtros por idioma (`es`) y región (Colombia / Latam)

- [ ] **Crear endpoint en el backend (Laravel)**
  - Ruta sugerida: `GET /api/v1/news`
  - Parámetros: `?category=interiorismo&page=1&per_page=10`
  - Usar un **Job programado** (Laravel Scheduler) para cachear resultados cada X horas y no exceder límites de la API

- [ ] **Crear componente en el frontend**
  - Sección "Inspiración / Noticias" en la landing o en la sección del blog
  - Tarjetas con imagen, título, fuente y enlace externo
  - Skeleton loader mientras carga

- [ ] **Variables de entorno**
  - Agregar `NEWS_API_KEY` al `.env` del backend
  - Documentar en `.env.example`

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
