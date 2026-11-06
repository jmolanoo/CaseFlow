# Documento 19: Informe Técnico de Arquitectura y Buenas Prácticas

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Evento:** INNOVASOFT IX Versión (19 de noviembre de 2026)  
> **Fase:** Fase 1 / Consolidación Integral y Auditoría Rigurosa  

---

## 1. Introducción y Justificación Tecnológica

**CaseFlow** es una solución Cliente-Servidor diseñada bajo principios rigurosos de ingeniería de software para resolver la gestión descentralizada de incidencias en instituciones y empresas multi-departamento.

### Decisiones de Stack Tecnológico:
- **Frontend SPA:** React 18 con TypeScript y Tailwind CSS. Se adoptó una arquitectura de componentes modulares con **sistema trimodal de temas** (Claro, Oscuro y AMOLED) con paleta Duo-Tone estricta (Salmón/Fucsia `#F43F5E` / `#FB7185` + Blanco/Negro), alejándose de clichés genéricos de diseño (cero degradados morados, cero sombras hinchadas, líneas hairline milimétricas estilo *Linear / Raycast / Supabase*).
- **Backend API REST:** FastAPI en Python 3.12. Proporciona alto rendimiento asíncrono (ASGI), contratos formales OpenAPI/Swagger generados automáticamente, y validaciones rigurosas con **Pydantic v2**.
- **Capa de Persistencia:** SQLAlchemy ORM con soporte relacional SQLite WAL (concurrencia sin bloqueos) y migración directa a PostgreSQL para despliegues empresariales.
- **Criptografía:** Algoritmo AES-256 (Fernet con claves derivadas SHA-256) para proteger credenciales de API en reposo.

---

## 2. Decisiones Arquitectónicas y Mejoras Clave de la Fase 1

### 2.1. Rediseño Completo de la Landing Page y Eliminación de Pruebas Sintéticas
- Se removió por completo la tarjeta de prueba interactiva de modelos de IA de la vista pública.
- Las 4 capacidades principales fueron transformadas de tarjetas compactas a 4 macro-secciones visualmente extensas a lo largo de la página, combinando la tipografía principal *Google Sans* con acentos decorativos en la tipografía cursiva *Alex Brush*, acompañadas de diagramas visuales y mockups en código nativo.

### 2.2. Estandarización de Botones Pill (`rounded-full`)
- Todos los botones interactivos del sistema (primarios, secundarios, filtros, selectores de tema, modales y acciones rápidas) adoptaron geometría de píldora pura (`border-radius: 9999px !important`), garantizando una experiencia táctil y visual uniforme con micro-animaciones `hover:scale-105`.

### 2.3. Animaciones Suaves y Desenfoque Completo de Pantalla (Full-Screen Backdrop Blur)
- Se integró `AnimatePresence` y componentes `motion.div` de Framer Motion en todos los modales para transiciones de entrada y salida pulidas.
- Se ajustó la jerarquía de capas (`z-[100]`) y se posicionó el desenfoque en coordenadas absolutas `top: 0, left: 0`, garantizando que la Topbar quede 100% desenfocada de manera idéntica al modal de autenticación de la Landing Page.
- Se eliminó el badge estático "Asistencia IA: Inactiva" de la Topbar global para mayor pulcritud.

### 2.4. Purga Estricta de Tipografías Monospaciadas
- Se prohíbe cualquier tipografía estilo terminal o monospace (`font-mono`). Se definieron formalmente solo 2 tipografías: *Google Sans* para interfaces, tablas y lectura técnica, y *Alex Brush* para detalles tipográficos de alto impacto.

### 2.5. Consistencia Absoluta en el Estado de Asistencia de IA
- El backend calcula de manera verídica y centralizada `is_ai_active = desk.enable_ai and has_active_byok_credential`.
- Se erradicaron incongruencias donde un panel indicaba "Sin configurar" mientras la cabecera marcaba "IA Activa".

### 2.6. Separación de Responsabilidades en Modales de Tickets
- **Modal de Inspección (`TicketViewModal`):** Permite ver la descripción completa del caso sin truncamiento ni elipses, línea de tiempo de respuestas y notas internas, y triaje de prioridad inmediato para personal técnico.
- **Modal de Atención Formal (`TicketAttendModal`):** Vista enfocada con editor de texto manual (mensajes al solicitante o notas internas técnicas), selector de transiciones de estado (`in_progress`, `resolved`, `closed`), campo de diagnóstico técnico de resolución obligatorio al resolver, y panel de Copilot con inserción de sugerencias en 1 clic.

### 2.7. Lógica Desacoplada de Prioridades
- Los solicitantes no seleccionan prioridad al radicar tickets.
- Si la mesa tiene IA activa: el motor estima y asigna la prioridad analizando el impacto.
- Si la mesa no tiene IA activa: el ticket se crea como "Sin prioridad asignada" (`priority_id = null`).
- El personal técnico puede asignar o reclasificar la prioridad directamente vía `PATCH /api/desks/{slug}/tickets/{ticket_code}/priority`.

### 2.8. Depuración de Paleta Cromática y Gráficas Avanzadas
- Se eliminaron colores ajenos (azules, verdes, morados), consolidando la identidad Duo-Tone: Salmón/Fucsia `#f43f5e`, blanco puro, negro carbón y grises neutros `#18181b` / `#232328`.
- Se incorporaron métricas ejecutivas con tarjetas Bento renovadas y gráficas interactivas SVG en el Dashboard y en el Workspace.

---

## 3. Estado de Pruebas y Cobertura (Fase 1)

| Métrica | Meta Rúbrica | Resultado Obtenido | Estado |
| :--- | :---: | :---: | :---: |
| **Pruebas Automatizadas (Pytest)** | > 20 | **27 / 27 Aprobadas** | **100% Exitoso** |
| **Cobertura de Líneas (`app/`)** | > 80% | **85% (1149 / 1345)** | **Superado** |
| **Compilación Frontend (`npm run build`)** | 0 Errores | **0 Errores (TypeScript + Vite)** | **100% Exitoso** |
| **Apego a Paleta y Tipografía** | Estricto | **Google Sans + Alex Brush, Rose-500 Duo-Tone** | **100% Exitoso** |
