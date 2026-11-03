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
- **Frontend SPA:** React 18 con TypeScript y Tailwind CSS. Se adoptó una arquitectura de componentes modulares con **Framer Motion** para micro-interacciones fluidas y un **sistema trimodal de temas** (Claro, Oscuro y AMOLED) con paleta Duo-Tone estricta (Salmón/Fucsia `#F43F5E` + Blanco/Negro), alejándose de clichés genéricos de diseño.
- **Backend API REST:** FastAPI en Python 3.12. Proporciona alto rendimiento asíncrono (ASGI), contratos formales OpenAPI/Swagger generados automáticamente, y validaciones rigurosas con **Pydantic v2**.
- **Capa de Persistencia:** SQLAlchemy ORM con soporte relacional SQLite WAL (concurrencia sin bloqueos) y migración directa a PostgreSQL para despliegues empresariales.
- **Criptografía:** Algoritmo AES-256 (Fernet con claves derivadas SHA-256) para proteger credenciales de API en reposo.

---

## 2. Aplicación de Metodologías de Desarrollo con IA

### 2.1. Spec-Driven Development (SDD)
Antes de escribir cualquier componente de interfaz o función de backend, se estructuraron los contratos de datos y especificaciones OpenAPI en `schemas.py`. Esto garantiza que los clientes (SPA frontend, servicios de prueba o integraciones externas) se apeguen estrictamente a los contratos semánticos.

### 2.2. Test-Driven Development (TDD) en IA y Lógica de Negocio
Se construyó una suite de 18 pruebas automatizadas previas a la certificación del Sprint 1, logrando un **90% de cobertura total verificada** sin pruebas rotas. Se validaron tanto la lógica tradicional (hashing bcrypt, tokens JWT, slugs únicos) como las pruebas de integración con el Gateway de IA (simulaciones de latencia, sanitización de respuestas JSON).

### 2.3. Criterios de Aceptación Gherkin
Las Historias de Usuario se formalizaron bajo la estructura estandarizada:
```gherkin
Escenario: Registro exitoso de un nuevo administrador
  Dado que el usuario no tiene una cuenta registrada en CaseFlow
  Cuando envía su nombre completo, correo institucional y contraseña válida
  Entonces el sistema crea el registro en la base de datos
  Y emite un token de acceso JWT con código HTTP 201
```

---

## 3. Estado de Cumplimiento del Sprint 1

| Componente | Estado | Verificación |
| :--- | :--- | :--- |
| **Landing Page Trimodal (100% Producción)** | Terminado | Selector Claro / Oscuro / AMOLED activo y funcional |
| **Módulo de Autenticación (JWT + Bcrypt)** | Terminado | Registro, login y rutas protegidas con 100% de pruebas pasadas |
| **Dashboard Central "Mis Help Desks"** | Terminado | Visualización multi-tenant, métricas y toggles de IA |
| **Bóveda BYOK (Gemini, OpenAI, Claude)** | Terminado | Test de latencia en milisegundos, cifrado AES-256 |
| **Onboarding Wizard Guiado** | Terminado | Creación atómica de 4 pasos (identidad, categorías, SLAs, confirmación) |
| **Documentación Oficial Diligenciada** | Terminado | 19 formatos de la rúbrica alineados y sincronizados |
