# Documento 19: Informe Técnico de Arquitectura y Buenas Prácticas

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Evento:** INNOVASOFT IX Versión (19 de noviembre de 2026)  

---

## 1. Introducción y Justificación Tecnológica

**CaseFlow** es una solución Cliente-Servidor diseñada bajo principios rigurosos de ingeniería de software para resolver la gestión descentralizada de incidencias en instituciones y empresas multi-departamento.

### Decisiones de Stack Tecnológico:
- **Frontend SPA:** React 18 con TypeScript y Tailwind CSS. Se adoptó una arquitectura de componentes modulares con **sistema trimodal de temas** (Claro, Oscuro y AMOLED) con paleta Duo-Tone estricta (Salmón/Fucsia `#F43F5E` / `#FB7185` + Blanco/Negro), alejándose de clichés genéricos de diseño (cero degradados morados, cero sombras hinchadas, líneas hairline milimétricas estilo *Linear / Raycast / Supabase*).
- **Backend API REST:** FastAPI en Python 3.12. Proporciona alto rendimiento asíncrono (ASGI), contratos formales OpenAPI/Swagger generados automáticamente, y validaciones rigurosas con **Pydantic v2**.
- **Capa de Persistencia:** SQLAlchemy ORM con soporte relacional SQLite WAL (concurrencia sin bloqueos) y migración directa a PostgreSQL para despliegues empresariales.
- **Criptografía:** Algoritmo AES-256 (Fernet con claves derivadas SHA-256) para proteger credenciales de API en reposo.

---

## 2. Aplicación de Metodologías de Desarrollo con IA

### 2.1. Spec-Driven Development (SDD)
Antes de escribir cualquier componente de interfaz o función de backend, se estructuraron los contratos de datos y especificaciones OpenAPI en `schemas.py`. Esto garantiza que los clientes (SPA frontend, servicios de prueba o integraciones externas) se apeguen estrictamente a los contratos semánticos.

### 2.2. Test-Driven Development (TDD) en IA y Lógica de Negocio
Se construyó una suite de 20 pruebas automatizadas previas a la certificación del Sprint 2, logrando un **88% de cobertura total verificada** sin pruebas rotas. Se validaron tanto la lógica tradicional (hashing bcrypt, tokens JWT, slugs únicos, creación y ciclo de vida de tickets, SLAs, comentarios) como las pruebas de integración con el Gateway de IA (simulaciones de latencia, sanitización de respuestas JSON, refinamiento heurístico e ingesta retrospectiva).

### 2.3. Criterios de Aceptación Gherkin
Las Historias de Usuario de los Sprints 1 y 2 se formalizaron bajo la estructura estandarizada:
```gherkin
Escenario: Radicación asistida de tickets con refinamiento contextual
  Dado que el usuario redacta una descripción informal del problema en una mesa con IA
  Cuando presiona el botón "Refinar con IA"
  Entonces el sistema analiza el texto contra el Help Desk Context
  Y sugiere un título profesional, clasifica la categoría óptima y calcula la prioridad con su SLA
```

---

## 3. Estado de Cumplimiento Consolidado (Sprints 1 y 2)

| Componente | Sprint | Estado | Verificación |
| :--- | :---: | :--- | :--- |
| **Landing Page Trimodal (100% Producción)** | 1 | Terminado | Selector Claro / Oscuro / AMOLED activo y funcional con paleta Duo-Tone |
| **Módulo de Autenticación (JWT + Bcrypt)** | 1 | Terminado | Registro, login y rutas protegidas con 100% de pruebas pasadas |
| **Dashboard Central "Mis Help Desks"** | 1 | Terminado | Visualización multi-tenant, tarjetas Bento y métricas de SLAs |
| **Bóveda BYOK (Gemini, OpenAI, Claude)** | 1 | Terminado | Test de latencia en milisegundos, cifrado AES-256 en base de datos |
| **Onboarding Wizard Guiado** | 1 | Terminado | Creación atómica de 4 pasos (identidad, categorías, SLAs, confirmación) |
| **Workspace de Mesa de Ayuda (`/desk/:slug`)** | 2 | Terminado | Vistas modulares por rol: Casos & Tickets, Memoria Contextual y Configuración |
| **Módulo de Radicación de Tickets (Manual & IA)** | 2 | Terminado | Radicación con cálculo de SLAs dinámicos y asistente de refinamiento IA |
| **Gestión Integral de Tickets & Ciclo de Vida** | 2 | Terminado | Estados (Open, In Progress, Waiting, Resolved, Closed), historial de respuestas y diagnósticos |
| **Motor de Ingesta Retrospectiva de Casos** | 2 | Terminado | Ingesta de todos los tickets históricos hacia el `Help Desk Context` con versionamiento |
| **Suite Automatizada de Pruebas (>80% Cobertura)** | 1 y 2 | Terminado | 20/20 pruebas superadas (100% PASSED), 88% de cobertura verificada |
| **Pulido Visual Anti-Clichés de IA (Software Craft)** | 1 y 2 | Terminado | Eliminación de sombras difusas, degradados arcoíris e iconografía genérica; bordes milimétricos de 1px |
