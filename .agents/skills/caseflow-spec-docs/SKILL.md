---
name: caseflow-spec-docs
description: Guía de sincronización continua y diligenciamiento exhaustivo de las plantillas oficiales PMO (Word y Excel) de CaseFlow y su reflejo inmediato en Google Drive y entregables PDF.
---

# Procedimiento de Documentación Simultánea y Diligenciamiento PMO

## 1. Regla de Oro
Ningún formato de plantilla PMO debe quedar con valores por defecto o marcadores `[Nombre...]`. Toda funcionalidad codificada debe reflejarse en:
- `CF - PMO-Modelo Propuesta.docx`
- `CF - PMOI-Documento de requerimientos.docx`
- `CF - Historias Usuario.xls.xlsx` (con Gherkin)
- `CF - PMOInformatica Plantilla de Product Backlog.xlsx`
- `CF - PMOInformatica Plantilla Scrum Lista de tareas de la iteración.xlsx`
- `CF - PMO-Casos de Uso.docx`
- `CF - PMO-Plan de Pruebas de Software.docx`
- `CF - Informe-Pruebas-SW.docx`
- `CF - PMO- Casos de Prueba.xls.xlsx`
- `CF - Reporte_Errores_SW.xlsx`

## 2. Flujo de Sincronización con Google Drive
1. Los archivos se preparan en `02_DOCUMENTACION_DILIGENCIADA/`.
2. Se valida mediante script automatizado la ausencia total de texto placeholder (`[Nombre del Proyecto]`, `[dd/mm/aaaa]`, etc.).
3. Se actualizan o reemplazan los archivos en la carpeta de Google Drive `CaseFlow` (`1fOxxIMx1X4v0kP6cjUhT_2Kx5HgNSQ5o`).
4. Se genera el documento consolidado en Google Docs y se exporta como PDF en la carpeta `entregables` (`1Lm7gEpNLzGx0DPuSsibLy2uur0iprjzF`).
