---
name: caseflow-spec-docs
description: Guía y procedimientos para mantener sincronizada la documentación técnica y de gestión del proyecto CaseFlow en las plantillas oficiales PMO (Word, Excel y PDF) en paralelo con el código.
---

# Procedimiento de Documentación Simultánea CaseFlow

## 1. Regla Fundamental
No se deben crear archivos o formatos nuevos si ya existe una plantilla establecida en `01_DOCUMENTACION_FORMATOS/`. Toda actualización de requisitos, historias, tareas, pruebas y defectos debe realizarse sobre las copias activas en `02_DOCUMENTACION_DILIGENCIADA/`.

## 2. Mapeo de Plantillas Oficiales vs Entregables de la Rúbrica
- **01. Propuesta:** `CF - PMO-Modelo Propuesta.docx`
- **02. Prototipo bajo componentes:** `02_Prototipo_Bajo_Componentes_CaseFlow_AI.docx`
- **03. Documento de requerimientos:** `CF - PMOI-Documento de requerimientos.docx`
- **04. Historias de usuario y criterios de aceptación:** `CF - Historias Usuario.xls.xlsx` (con criterios en formato Gherkin: Dado/Cuando/Entonces).
- **05. Pila del producto (Product Backlog):** `CF - PMOInformatica Plantilla de Product Backlog.xlsx`
- **06. Lista de tareas de la iteración:** `CF - PMOInformatica Plantilla Scrum Lista de tareas de la iteración.xlsx`
- **07. Diagrama de clases:** UML exportable y documentado en reporte técnico.
- **08. Casos de uso:** `CF - PMO-Casos de Uso.docx`
- **09. Modelo Relacional:** Esquema de base de datos entidad-relación y scripts DDL.
- **10. Diagrama de despliegue:** Arquitectura de servidores, SPA, API, base de datos y proveedores externos de IA.
- **11. Plan de pruebas:** `CF - PMO-Plan de Pruebas de Software.docx`
- **12. Informe de pruebas:** `CF - Informe-Pruebas-SW.docx`
- **13. Casos de prueba:** `CF - PMO- Casos de Prueba.xls.xlsx`
- **14. / 17. Reporte de errores:** `CF - Reporte_Errores_SW.xlsx`
- **15. Pruebas de unidad:** Evidencia de ejecución con Pytest / Vitest.
- **16. Informe de cobertura:** Métricas de cobertura de código (>80%).
- **18. Integración IA:** Documentación técnica exhaustiva de la arquitectura BYOK, modelos soportados, prompts, tokens, latencia, costos y gestión de contexto ("Help Desk Context").
- **19. Informe técnico:** Síntesis técnica de arquitectura y buenas prácticas.

## 3. Protocolo de Sincronización
1. **Antes de codificar:** Registrar o actualizar la Historia de Usuario en el Backlog y la Lista de Tareas del Sprint correspondiente.
2. **Durante la codificación:** Desarrollar bajo TDD (Test-Driven Development), creando la prueba antes o junto al código funcional.
3. **Al finalizar la funcionalidad:**
   - Registrar los casos de prueba en `CF - PMO- Casos de Prueba.xls.xlsx`.
   - Ejecutar la suite de pruebas unitarias y de integración.
   - Si se detectan bugs durante las pruebas, tabularlos en `CF - Reporte_Errores_SW.xlsx`.
   - Solicitar auditoría al subagente `quality-reviewer`.
