# CaseFlow (Dev) - Reglas y Memoria del Proyecto

> **Regla de Contexto Estricto:** Este proyecto (CaseFlow) es COMPLETAMENTE INDEPENDIENTE Y SEPARADO de cualquier otro proyecto (incluyendo AgroFusion). No mezclar roles, docentes, ni información de otros proyectos.

## Información Institucional y Equipo
- **Institución:** Universidad Surcolombiana (USCO) - Programa de Ingeniería de Software.
- **Asignatura:** Ingeniería de Software – Electiva 1.
- **Docente Supervisor y Product Owner:** Eduardo Martínez Vidal.
- **Evento de Sustentación:** INNOVASOFT IX Versión (19 de noviembre de 2026).

### Equipo de Trabajo
- **Integrantes:**
  - **Danna Nerieth Palencia** (Estudiante de Ingeniería de Software, USCO).
  - **Jairo Molano Salgado** (Estudiante de Ingeniería de Software, USCO).
  - *Regla Estricta:* El equipo trabaja de manera conjunta y horizontal, **sin roles específicos ni jerarquías impuestas**.
- **Docente Supervisor y Product Owner:** **Eduardo Martínez Vidal**.

---

## Principios y Reglas de Desarrollo
1. **Desarrollo y Documentación Simultánea:**
   - Cada funcionalidad desarrollada en código debe registrarse de inmediato en los formatos oficiales (Historias de usuario, Backlog, Lista de tareas, Casos de prueba, Reporte de errores).
   - NUNCA crear formatos nuevos si ya existe una plantilla oficial en `01_DOCUMENTACION_FORMATOS/`.
2. **Revisor de Calidad Obligatorio:**
   - Ninguna fase ni sprint puede considerarse cerrado sin la auditoría formal del subagente `quality-reviewer` y su veredicto explícito `[VEREDICTO: APROBADO 100%]`.
3. **Arquitectura No Monolítica:**
   - Frontend SPA (React + TypeScript + Tailwind CSS + Framer Motion) desacoplado del backend.
   - Backend API REST estructurado en FastAPI con Spec-Driven Development (SDD) y contratos OpenAPI.
4. **Integración de Inteligencia Artificial (BYOK / Desacoplada):**
   - La IA es agnóstica y desacoplada: funciona bajo el modelo Bring Your Own Key / Account (Gemini, Claude, ChatGPT).
   - El sistema proporciona contexto empresarial ("Help Desk Context") que evoluciona dinámicamente con los tickets y resoluciones.
   - El administrador tiene control total (RBAC) para activar/desactivar funciones de IA y editar el contexto.

## Separación Estricta de Entornos (VPS vs GitHub Codespaces)
- **Servidor VPS (antigravity-bot):**
  - **Uso Exclusivo:** Gestión de memoria, documentación, skills, MCP, orquestación y el daemon del bot (`bot.py`).
  - **Prohibido:** Desarrollar en el VPS, levantar Docker del proyecto o instalar paquetes/dependencias (`node_modules`, `venv` del proyecto).
- **GitHub Codespaces (Entorno de Desarrollo 100%):**
  - **Uso:** Todo el código crudo, frontend, backend, Docker Compose, librerías, migraciones y pruebas viven y se ejecutan exclusivamente en el Codespace de GitHub.
  - **Control:** Toda interacción de desarrollo se realiza mediante GitHub CLI (`gh codespace ssh`).

## Reglas de Documentación y Entregables (Google Drive & Google Docs)
- **Carpeta Oficial de Drive:** Carpeta `CaseFlow` (`1fOxxIMx1X4v0kP6cjUhT_2Kx5HgNSQ5o`).
- **Diligenciamiento con Formato:** Si ya existen formatos/plantillas oficiales en Google Drive, documentar directamente mediante las herramientas de `gdocs` y `gdrive`.
- **Entregables sin Formato Previo:** Crear los documentos directamente en **Google Docs** usando el plugin `gdocs`. **ESTÁ ESTRICTAMENTE PROHIBIDO SUBIR MARKDOWN (.md) COMO ENTREGABLES**.
- **Diagramas en Documentación:** En los Google Docs donde se requiera un diagrama, insertar el código plano Mermaid y notificar al usuario para que inserte la imagen renderizada.
