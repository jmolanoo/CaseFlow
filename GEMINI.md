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
