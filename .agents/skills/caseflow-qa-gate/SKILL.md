---
name: caseflow-qa-gate
description: Protocolo estricto de auditoría y puerta de calidad (Quality Gate) para el revisor de calidad antes de cerrar sprints o fases del proyecto CaseFlow.
---

# Protocolo de Puerta de Calidad (Quality Gate) CaseFlow

## 1. Criterios de Evaluación Obligatorios
Para que el revisor de calidad otorgue un `[VEREDICTO: APROBADO 100%]`, se deben verificar los siguientes puntos sin excepción:

### A. Documentación
1. **Formato:** Los formatos oficiales PMO deben estar completamente diligenciados sin textos de marcador de posición (tipo "[completar aquí]" o "Lorem ipsum").
2. **Autores y Roles:** Deben reflejar al equipo de desarrollo (Danna Nerieth Palencia y Jairo Molano Salgado como equipo de ingeniería sin roles específicos, y Eduardo Martínez Vidal como Docente Supervisor y Product Owner).
3. **Trazabilidad:** Cada Caso de Uso debe vincularse a una o más Historias de Usuario, y cada Historia debe poseer criterios Gherkin y sus respectivos Casos de Prueba.
4. **Pruebas y Defectos:** Todos los casos de prueba ejecutados deben tener estado (Aprobado / Fallido) y cualquier defecto detectado debe estar registrado en el formato de Reporte de Errores con su severidad y estado de resolución.

### B. Código y Arquitectura
1. **Separación de Responsabilidades:** Arquitectura cliente-servidor desacoplada (Frontend React + Backend FastAPI).
2. **Pruebas Automatizadas:** Cobertura de código superior al 80% en los módulos principales, sin pruebas rotas.
3. **Manejo de Errores:** Endpoints con validaciones de esquemas Pydantic y respuestas HTTP semánticas.
4. **Higiene de IA:** La integración de IA debe ser BYOK (Bring Your Own Key / Account), con fallback seguro si no hay API key o si se pierde conectividad, sin almacenar claves en texto plano de forma insegura.

## 2. Formato de Salida del Revisor
El revisor debe emitir un informe estructurado:
- **Resumen de la Auditoría**
- **Lista de Verificación (Checklist con estado)**
- **Hallazgos / Observaciones (si las hay)**
- **Veredicto Final:** `[VEREDICTO: APROBADO 100%]` o `[VEREDICTO: RECHAZADO]`
