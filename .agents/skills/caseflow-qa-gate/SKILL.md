---
name: caseflow-qa-gate
description: Protocolo estricto de auditoría y puerta de calidad (Quality Gate v2) para CaseFlow. Evalúa simultáneamente completitud de formatos PMO en Drive, ausencia de tecnicismos/clichés académicos en el software, fidelidad estética Duo-Tone trimodal y suite de pruebas.
---

# Protocolo de Puerta de Calidad (Quality Gate v2) CaseFlow

## 1. Criterios de Evaluación Obligatorios

Para que el auditor de calidad otorgue un `[VEREDICTO: APROBADO 100%]`, deben satisfacerse todos los criterios siguientes sin excepción:

### A. Documentación y Formatos PMO en Google Drive
1. **Formularios Oficiales Diligenciados al 100%:**
   - Ningún formato (`CF - PMO-*.docx`, `CF - *.xlsx`) puede contener textos de plantilla sin sustituir como `[Nombre del Proyecto]`, `[dd/mm/aaaa]`, `[Nombre de Actor]`, `[completar aquí]` o `Lorem ipsum`.
   - Todos los formatos deben estar actualizados con el alcance acumulado (Sprint 1 + Sprint 2).
2. **Autores y Roles Institucionales:**
   - En la documentación formal y actas, reflejar con exactitud al equipo: **Danna Nerieth Palencia** y **Jairo Molano Salgado** (co-desarrollo e ingeniería conjunta sin roles jerárquicos), y al **Ing. Eduardo Martínez Vidal** (Docente Supervisor y Product Owner).
3. **Trazabilidad Integral (Spec-Driven):**
   - Requerimientos (RF/RNF) ↔ Historias de Usuario (con criterios Gherkin Dado/Cuando/Entonces) ↔ Casos de Uso (flujo normal y alternos) ↔ Casos de Prueba (estado Aprobado) ↔ Reporte de Errores (defectos tabulados y resueltos).
4. **Entregables y Rúbrica:**
   - La carpeta `entregables` de Google Drive debe contener el documento consolidado del Sprint en Google Docs y su respectivo export en PDF oficial (`entregable sprint 2 v2.pdf`). Prohibido subir archivos `.md` crudos como entregables finales.

### B. Software: Tono Comercial, Tipografía y Experiencia Visual
1. **Eliminación Total de 'Proyecto Universitario':**
   - Prohibido incluir menciones académicas ("USCO", "Electiva 1", "Sustentación", "Semestre") en el footer, headers, modales o placeholders de la interfaz gráfica. El software debe lucir como un producto SaaS comercial de clase mundial.
   - Prohibido colocar nombres de los desarrolladores en placeholders de formularios (usar `Tu nombre completo` o `ej. Carlos Mendoza`).
   - Prohibido mostrar etiquetas de versión (`v1.0.0`, `v2.0-beta`) en barras de navegación o encabezados de usuario.
2. **Lenguaje Comercial sin Tecnicismos Abstrusos:**
   - No vender conceptos internos ("Bóveda BYOK", "ping sintético a nodos", "spec-driven development", "costo $0 USD").
   - Comunicar beneficios claros de cara al negocio: "Asistencia con Inteligencia Artificial Privada", "Memoria de Soporte Viva", "Tiempos de Respuesta Garantizados", "Espacios Aislados por Empresa".
3. **Tipografía Estricta:**
   - Todo el software debe usar únicamente **Google Sans** (con fallbacks limpios en Sans-serif) y una **fuente cursiva delgada atractiva** para acentos editoriales y detalles visuales en la Landing Page.
   - Cero fuentes de terminal o monoespaciadas en la interfaz de usuario general.
4. **Paleta Duo-Tone Trimodal y Color Secundario:**
   - **Modo Claro:** Fondo blanco puro, textos oscuros nítidos. Botones secundarios en **Negro profundo con texto blanco**.
   - **Modo Oscuro Neutral:** Fondo gris carbón oscuro (`#121214` / `#18181b`), eliminando cualquier fondo azulado/navy que desentone con el color primario (Salmón/Rose `#f43f5e`). Botones secundarios en **Blanco con texto negro**.
   - **Modo AMOLED:** Fondo negro puro (`#000000`). Botones secundarios en **Blanco con texto negro**.
5. **Ergonomía de Formularios y Bento Cards:**
   - Los iconos dentro de campos de texto deben estar perfectamente alineados y centrados verticalmente (`top-1/2 -translate-y-1/2 left-3.5 pointer-events-none`) con margen izquierdo suficiente (`craft-input-with-icon`, padding `2.75rem`), sin solaparse jamás con el placeholder o el texto ingresado.
   - Cards y contenedores estilizados bajo estética Bento Grid / Linear: bordes sutiles, esquinas amplias (`rounded-2xl`), sombras suaves y espaciados confortables (`p-6`).
6. **Micro-interacciones y Fluidez:**
   - Elementos interactivos con `cursor-pointer`, transiciones suaves de color y escala sutil al pasar el cursor (`hover:scale-[1.02]`).

### C. Backend, Pruebas y Seguridad
1. **Pruebas Automatizadas:** 100% de tests unitarios e integrados pasando exitosamente con cobertura >80%.
2. **Seguridad BYOK:** Claves API cifradas mediante AES-256 en reposo, nunca expuestas en respuestas HTTP ni registradas en logs.
3. **Validación Semántica:** Esquemas Pydantic rigurosos y respuestas semánticas en la API FastAPI.

## 2. Formato del Veredicto
- **Resumen Ejecutivo de la Auditoría**
- **Matriz de Conformidad (Checklist con Estado PASS/FAIL)**
- **Hallazgos y Mejoras Continuas**
- **Veredicto Final Definitivo**
