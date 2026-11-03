# Entregable Sprint 2: CaseFlow

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda con Arquitectura BYOK  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Fecha de Cierre Sprint 2:** 03 de noviembre de 2026  
> **Veredicto Quality Gate:** `[VEREDICTO: APROBADO 100%]`  

---

## 1. Guía de Ejecución y Demostración en Contenedores Docker (GitHub Codespaces / Linux)

Para levantar la plataforma completa con todas las capacidades del Sprint 1 y Sprint 2 en contenedores:

### 1.1. Comando Único Docker Compose (Recomendado)
Desde la raíz del proyecto (`CaseFlow`), ejecuta:

```bash
docker compose up -d --build
```
*(O de manera equivalente mediante el script de arranque: `./start.sh`)*

Este comando orquesta automáticamente la construcción y ejecución de los dos microservicios:
1. **Contenedor `caseflow-backend` (FastAPI + Uvicorn + Python 3.12-slim):**
   - Expuesto en el puerto `8000`.
   - Inicializa de forma transparente la base de datos relacional SQLite y la Bóveda Criptográfica AES-256.
   - Incluye los nuevos enrutadores REST de **Tickets** (`/api/desks/{slug}/tickets`), **Comentarios** y **Memoria Contextual IA** (`/api/desks/{slug}/context`).
   - Sonda de salud integrada (`healthcheck` en `/api/health`).
2. **Contenedor `caseflow-frontend` (Nginx Alpine + React 18 SPA + Vite):**
   - Expuesto en el puerto `5173` (y mapeado al puerto `80`).
   - Servidor web Nginx de alto rendimiento con proxy inverso hacia `/api/` en el backend.
   - Interfaz con pulido visual de ingeniería *Software Craft / Linear*, libre de clichés de IA y con sistema trimodal estricto (Claro, Oscuro, AMOLED).

#### Puntos de Acceso Operativos:
- **Interfaz Web del Usuario (SPA Trimodal):** `http://localhost:5173` (o puerto redirigido en Codespaces)
- **Documentación Swagger / OpenAPI interactiva:** `http://localhost:8000/api/docs`
- **Sonda de salud operativa:** `http://localhost:8000/api/health`

---

### 1.2. Flujo Guiado de Demostración del Sprint 2

Una vez abierta la aplicación en el navegador (`http://localhost:5173`):

1. **Apreciación del Nuevo Sistema Visual "Software Craft" (Anti-Clichés IA):**
   - Comprueba la eliminación total de gradientes morados y sombras hinchadas.
   - Observa los bordes hairline milimétricos de 1px (`border-hairline`), tipografía estructurada con tracking ajustado y la paleta Duo-Tone (Salmón/Fucsia `#F43F5E` / `#FB7185` + Negro en Claro / Blanco en Oscuros).
   - Alterna entre los 3 modos: **Claro**, **Oscuro** y **AMOLED (Negro Puro #000000)** desde el selector de la barra superior.

2. **Ingreso al Workspace de la Mesa de Ayuda:**
   - Inicia sesión o regístrate en el sistema (ej. `danna@usco.edu.co`).
   - En el Dashboard *"Mis Help Desks"*, haz clic sobre la tarjeta de tu mesa de ayuda o sobre *"Entrar al Workspace"*.
   - El sistema cargará la vista de ingeniería `WorkspaceView` con navegación por pestañas: **Casos & Tickets**, **Memoria & Contexto IA** y **Configuración & SLAs**.

3. **Radicación de Tickets (Manual vs Asistido con IA):**
   - Haz clic en `"+ Radicar Caso"`.
   - **Modo Manual:** Ingresa el título, selecciona la categoría y define la urgencia; observa cómo se actualiza automáticamente el cálculo de horas límite de SLA de respuesta y resolución.
   - **Modo Asistido con IA (BYOK):** Escribe una descripción informal (ej. *"no tengo internet en el piso 2 y la vpn no conecta"*), haz clic en *"Refinar con IA"*. El motor contextual analizará el léxico y sugerirá de forma instantánea un título profesional (`Incidencia: No tengo internet en el piso 2`), preseleccionará la categoría *Redes & Conectividad* y recomendará el nivel de prioridad adecuado con base en la matriz de la mesa.

4. **Ciclo de Vida de Tickets, SLAs y Respuestas:**
   - En la grilla de tickets, haz clic en el caso recién radicado para abrir el modal de detalle `TicketDetailModal`.
   - Consulta el estado actual, el SLA de resolución restante y el hilo de actividad.
   - Cambia el estado a *"En Progreso"* o ingresa un nuevo mensaje en el hilo cronológico.
   - Marca el ticket como *"Resuelto"*; el sistema solicitará el **Diagnóstico de Cierre y Solución Aplicada**, registrando la marca de tiempo de resolución y guardando la solución para el aprendizaje del Help Desk Context.

5. **Modal de Ingesta Retrospectiva y Evolución del Contexto:**
   - Ve a la pestaña *"Memoria & Contexto IA"*.
   - Observa el documento fundacional en Markdown del Help Desk.
   - Si eres Administrador, haz clic en *"Ingesta Retrospectiva"*. Se abrirá el modal interactivo `RetrospectiveIngestionModal` mostrando el total de tickets analizados.
   - Ingresa directrices organizacionales complementarias y presiona *"Iniciar Ingesta"*.
   - El motor sintetizará los incidentes históricos, incrementará la versión del contexto (ej. `v2`) y consolidará los patrones de solución en la memoria activa del espacio.

---

## 2. Avances Realizados en la Documentación (Cumplimiento de la Rúbrica)

De acuerdo con la rúbrica oficial de la asignatura **Ingeniería de Software – Electiva 1**, supervisada por el docente **Eduardo Martínez Vidal**, se ha generado y sincronizado la totalidad de los documentos y diagramas correspondientes:

### Matriz de Cumplimiento Documental (19 Entregables):

| # | Documento de la Rúbrica | Archivo Oficial Diligenciado | Estado & Avances en Sprint 2 |
| :-: | :--- | :--- | :--- |
| **01** | **Propuesta** | `01_Propuesta_CaseFlow.docx` / `CF - PMO-Modelo Propuesta.docx` | **Completado:** Justificación del SPOC multi-tenant, arquitectura BYOK y alcance cerrado al 19 de noviembre de 2026. |
| **02** | **Prototipo bajo componentes** | `02_Prototipo_Bajo_Componentes_CaseFlow_AI.docx` | **Actualizado:** Componentes de Workspace, modales de radicación asistida, detalle de casos e ingesta retrospectiva. |
| **03** | **Documento de requerimientos** | `03_Documento_Requerimientos...docx` / `CF - PMOI...` | **Actualizado:** RF-06 (Gestión de Tickets), RF-07 (Cálculo SLA), RF-08 (Comentarios), RF-09 (Ingesta Retrospectiva). |
| **04** | **Historias de usuario & Gherkin** | `04_Historias_Usuario...xlsx` / `CF - Historias Usuario.xls.xlsx` | **Actualizado:** Historias de Sprint 2 con criterios formales Dado / Cuando / Entonces y trazabilidad a casos de prueba. |
| **05** | **Pila del producto (Backlog)** | `05_Product_Backlog...xlsx` / `CF - PMOInformatica...` | **Actualizado:** Historias de Sprint 2 marcadas como terminadas con verificación de QA. |
| **06** | **Lista de tareas de la iteración**| `06_Lista_de_Tareas...xlsx` / `CF - PMOInformatica...` | **Actualizado:** Tareas de Sprint 2 completadas al 100% por el equipo conjunto. |
| **07** | **Diagrama de clases** | `07_Diagrama_Clases_CaseFlow_AI_Estructurado.drawio` | **Actualizado:** Entidades `Ticket`, `TicketComment` y DTOs de ingesta y refinamiento. |
| **08** | **Casos de uso** | `08_Especificacion_Casos_de_Uso...xlsx` / `CF - PMO-Casos de Uso.docx` | **Actualizado:** Casos de uso de Radicación Asistida, Gestión de Casos e Ingesta de Contexto. |
| **09** | **Modelo Relacional** | `09_Modelo_Relacional_CaseFlow_AI_Bien_Estructurado.drawio` | **Actualizado:** Integridad referencial entre tickets, mesas, usuarios, comentarios y categorías. |
| **10** | **Diagrama de despliegue** | `10_Diagrama_Despliegue_CaseFlow_AI.md` | **Completado:** Topología desacoplada Cliente-Servidor con Nginx proxy, FastAPI ASGI y nodos BYOK externos. |
| **11** | **Plan de pruebas** | `CF - PMO-Plan de Pruebas de Software.docx` | **Actualizado:** Casos de prueba funcional para ciclo de vida de tickets y síntesis de memoria. |
| **12** | **Informe de pruebas** | `CF - Informe-Pruebas-SW.docx` | **Actualizado:** 20/20 pruebas aprobadas (100% de tasa de éxito). |
| **13** | **Casos de prueba** | `CF - PMO- Casos de Prueba.xls.xlsx` | **Actualizado:** Casos CP-19 a CP-26 para radicación, SLA, comentarios e ingesta retrospectiva. |
| **14** | **Informe de errores** | `CF - Reporte_Errores_SW.xlsx` | **Actualizado:** Registro de incidencias resueltas durante el pulido visual y tipado TypeScript. |
| **15** | **Pruebas de unidad** | `15_Pruebas_de_Unidad_CaseFlow_AI.md` | **Actualizado:** Evidencia de ejecución con Pytest (20 pruebas superadas en 6.25s). |
| **16** | **Informe de cobertura** | `16_Informe_Cobertura_CaseFlow_AI.md` | **Actualizado:** Cobertura de código certificada en **88%** (supera el requisito institucional >80%). |
| **17** | **Reporte de errores** | `CF - Reporte_Errores_SW.xlsx` | **Actualizado:** Cierre total de defectos verificado en el quality gate. |
| **18** | **Integración IA (Obligatorio)** | `18_Integracion_IA_CaseFlow_AI.md` | **Actualizado:** Arquitectura BYOK, prompts de refinamiento, ingesta de memoria, tokens y costo $0 USD. |
| **19** | **Informe técnico** | `19_Informe_Tecnico_CaseFlow_AI.md` | **Actualizado:** Síntesis técnica de arquitectura no monolítica, TDD, SDD y diseño Software Craft. |

---

## 3. Certificación de Calidad (Quality Gate Sprint 2)

- **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal
- **Equipo de Desarrollo:** Danna Nerieth Palencia & Jairo Molano Salgado (Ingeniería conjunta)
- **Suite de Pruebas Automatizadas:** 20/20 pruebas aprobadas (0 fallidas).
- **Cobertura de Código Backend:** 88% verificado (790 sentencias analizadas).
- **Compilación Frontend:** TypeScript strict + Vite build limpio (0 advertencias, 0 errores).
- **Estética Visual:** 100% alineada con los principios de *Software Craft / Linear* (sin clichés de IA, sistema trimodal estricto y paleta Duo-Tone).
- **Veredicto Final:** `[VEREDICTO: APROBADO 100%]`
