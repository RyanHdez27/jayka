# Architecture Decision Records (ADR) - Jayka

## ADR 001: Backend Framework
**Decision:** Laravel 11
**Status:** Approved
**Context:** Necesidad de un backend robusto, escalable y con rápido tiempo de desarrollo para soportar una landing page dinámica.
**Reasoning:** Laravel ofrece el ecosistema más completo para PHP moderno, incluyendo Eloquent ORM, migraciones, y un sistema de rutas eficiente.

## ADR 002: Database Engine & Hosting
**Decision:** PostgreSQL via Supabase
**Status:** Approved
**Context:** Requerimiento de una base de datos relacional potente con facilidad de gestión.
**Reasoning:** PostgreSQL es el estándar para integridad de datos. Supabase permite un despliegue rápido de la base de datos y gestión visual sin necesidad de administrar el servidor de DB manualmente.

## ADR 003: Authentication Strategy
**Decision:** Laravel Sanctum
**Status:** Approved
**Context:** El sistema requiere un panel administrativo para gestionar contenidos.
**Reasoning:** Sanctum proporciona una autenticación ligera basada en tokens, ideal para SPAs (como el frontend en React), evitando la complejidad de JWT puro o OAuth2.

## ADR 004: Infrastructure
**Decision:** Dockerized Development Environment
**Status:** Approved
**Context:** Necesidad de consistencia entre el entorno de desarrollo local y producción.
**Reasoning:** El uso de Docker (PHP-FPM, Nginx, Postgres) asegura que el proyecto corra exactamente igual en cualquier máquina.

## ADR 005: Scope
**Decision:** MVP based on current Frontend
**Status:** Approved
**Context:** Definición de funcionalidades iniciales.
**Reasoning:** Para acelerar el lanzamiento, el backend soportará estrictamente las entidades visibles en el frontend actual (Servicios, Proyectos, Blog, Leads).
