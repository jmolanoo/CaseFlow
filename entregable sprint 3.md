# Entregable Sprint 3: CaseFlow

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda con Arquitectura BYOK  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Fecha de Cierre Sprint 3:** 03 de noviembre de 2026  
> **Veredicto Quality Gate:** `[VEREDICTO: APROBADO 100%]`  

---

## 1. Guía de Ejecución y Demostración en Contenedores Docker (GitHub Codespaces / Linux)

Para levantar la plataforma completa con la totalidad de capacidades de los Sprints 1, 2 y 3:

### 1.1. Comando Único Docker Compose (Recomendado)
Desde la raíz del proyecto (`CaseFlow`), ejecuta:

```bash
docker compose up -d --build
```
*(O de manera equivalente mediante el script de arranque: `./start.sh`)*

Este comando orquesta automáticamente la construcción y ejecución de los dos microservicios:
1. **Contenedor `caseflow-backend` (FastAPI + Uvicorn + Python 3.12-slim):**
   - Expuesto en el puerto `8000`.
   - Inicializa la base de datos relacional SQLite y la Bóveda Criptográfica AES-256.
   - Enrutadores activos:
     - `/api/auth`: Autenticación y sesiones seguras JWT con Bcrypt.
     - `/api/desks`: Gestión multi-tenant de mesas de ayuda, catálogos y membresías.
     - `/api/desks/{slug}/tickets`: Ciclo de vida completo de tickets, reasignación a especialistas, filtros avanzados y temporizadores de SLA.
     - `/api/desks/{slug}/context`: Memoria de soporte viva (`Help Desk Context`), ingesta retrospectiva y aprendizaje dinámico al resolver casos.
     - `/api/desks/{slug}/ai/toggles`: Matriz de gobierno de IA y control de acceso basado en roles (RBAC).
     - `/api/desks/{slug}/tickets/{code}/copilot/*`: Endpoints del Copiloto Contextual (sugerencia de respuestas, diagnóstico técnico con detección de incidentes similares y resumen ejecutivo).
   - Sonda de salud integrada (`healthcheck` en `/api/health`).
2. **Contenedor `caseflow-frontend` (Nginx Alpine + React 18 SPA + Vite):**
   - Expuesto en el puerto `5173` (y mapeado al puerto `80`).
   - Servidor web Nginx con proxy inverso optimizado hacia `/api/` en el backend.
   - Interfaz con fidelidad estética de precisión *Software Craft / Linear*, libre de clichés de IA y con sistema trimodal estricto (**Claro**, **Oscuro Neutro** y **AMOLED**).

#### Puntos de Acceso Operativos:
- **Interfaz Web del Usuario (SPA Trimodal):** `http://localhost:5173` (o puerto redirigido en Codespaces)
- **Documentación Swagger / OpenAPI interactiva:** `http://localhost:8000/api/docs`
- **Sonda de salud operativa:** `http://localhost:8000/api/health`

---

### 1.2. Flujo Guiado de Demostración del Sprint 3

Una vez abierta la aplicación en el navegador (`http://localhost:5173`):

1. **Consola del Agente de Soporte con Métricas y Filtros de SLA:**
   - Inicia sesión como miembro de la mesa de ayuda e ingresa al Workspace.
   - En la cabecera del Workspace, visualiza el nuevo **Panel de Métricas Operativas**:
     - *Total de Casos*: Conteo acumulado en la mesa de ayuda.
     - *En Atención*: Casos abiertos o en progreso que demandan acción.
     - *Casos Resueltos*: Historial de incidencias solventadas.
     - *Cumplimiento SLA*: Porcentaje calculado de rendimiento de servicio.
   - Prueba la barra de filtros multifacéticos:
     - Filtro por **Estado** (*Todos*, *Abiertos*, *En Progreso*, *En Espera*, *Resueltos*).
     - Filtro por **Categoría** y por **Prioridad**.
     - Filtro por **Evaluación de SLA**: *A Tiempo*, *En Riesgo (< 4 horas restantes)* y *Vencidos*.

2. **Reasignación Rápida de Tickets ("Tomar Caso / Asignarme"):**
   - Abre cualquier ticket sin asignar.
   - Haz clic en el botón *"Tomar Caso (Asignarme)"*; el sistema asignará el ticket al especialista actual y registrará un evento de trazabilidad en el hilo cronológico.

3. **Copiloto de Soporte Contextual en el Detalle del Ticket:**
   - En el modal de detalle del caso, observa la nueva barra de acción del **Copiloto de Soporte Asistido**:
     - **⚡ Sugerir Respuesta:** Genera una propuesta de respuesta técnica y empática, grounded en las directrices de la categoría y en el `Help Desk Context`. Permite transferir la propuesta directamente al campo de respuesta mediante el botón *"Insertar en Respuesta"*.
     - **🔍 Diagnóstico Técnico y Casos Similares:** Analiza la causa raíz probable, despliega una lista de verificación numerada para el diagnóstico y lista incidentes históricos resueltos similares.
     - **📋 Resumen Ejecutivo:** Sintetiza conversaciones extensas e hilos de comentarios en viñetas de puntos clave.

4. **Flujo de Resolución con Aprendizaje Dinámico en Memoria:**
   - Selecciona el estado *"Resuelto y Cerrado"*.
   - Se desplegará el panel *"Diagnóstico de Cierre y Aprendizaje Activo"*.
   - Ingresa la causa y solución aplicada (ej. *"Se reconfiguró el servidor proxy y se renovaron los certificados TLS"*).
   - Presiona *"Confirmar Cierre y Enriquecer Memoria"*.
   - El sistema cerrará el ticket y **aprenderá inmediatamente**, inyectando el caso resuelto y su diagnóstico en el documento `Help Desk Context`, incrementando su versión (ej. `v3`) de forma automática.

5. **Consola de Administración con Editor y Vista Previa de la Memoria:**
   - Dirígete a la pestaña *"Memoria de Soporte"*.
   - Alterna entre el modo **Editor Markdown** (para realizar ajustes manuales a las directrices) y la **Vista Previa Formateada** de lectura ejecutiva.
   - Si eres administrador, prueba el botón *"Re-indexar Casos"* para ejecutar una síntesis completa mediante el modal retrospectivo.

6. **Matriz de Gobernanza de IA y Control por Rol (RBAC):**
   - Ingresa a la pestaña *"Gobernanza & SLAs"*.
   - Explora la tabla bento **"Matriz de Gobernanza de IA y Control por Rol (RBAC)"**, donde se administran las 5 capacidades del sistema:
     1. *Sugerencia en Radicación*
     2. *Copiloto de Respuestas Técnicas*
     3. *Diagnóstico y Casos Similares*
     4. *Aprendizaje Dinámico al Resolver*
     5. *Resumen Ejecutivo de Casos*
   - Activa o desactiva con un clic los permisos para **Solicitante**, **Agente** o **Administrador**, o pausa globalmente cualquier función.
   - Los cambios se guardan de forma atómica en el backend y se reflejan de inmediato.

---

## 2. Avances Realizados en la Documentación (Cumplimiento de la Rúbrica)

De acuerdo con la rúbrica oficial de la asignatura **Ingeniería de Software – Electiva 1**, supervisada por el docente **Eduardo Martínez Vidal**, se ha generado y sincronizado la totalidad de los 19 formatos y entregables en Google Drive:

### Matriz de Cumplimiento Documental (19 Entregables):

| # | Documento de la Rúbrica | Archivo Oficial Diligenciado | Estado & Avances en Sprint 3 |
| :-: | :--- | :--- | :--- |
| **01** | **Propuesta** | `CF - PMO-Modelo Propuesta.docx` | **Completado:** Alcance consolidado del sistema multi-tenant y arquitectura BYOK sin costos de servidor. |
| **02** | **Prototipo bajo componentes** | `02_Prototipo_Bajo_Componentes_CaseFlow_AI.docx` | **Actualizado:** Componentes de la consola del agente, copiloto contextual y matriz RBAC de gobierno. |
| **03** | **Documento de requerimientos** | `CF - PMOI-Documento de requerimientos.docx` | **Actualizado:** RF-10 (Copiloto Contextual), RF-11 (Gobernanza RBAC), RF-12 (Aprendizaje Dinámico). |
| **04** | **Historias de usuario & Gherkin** | `CF - Historias Usuario.xls.xlsx` | **Actualizado:** Criterios formales Dado / Cuando / Entonces para Copiloto, Matriz RBAC y Reasignación. |
| **05** | **Pila del producto (Backlog)** | `CF - PMOInformatica Plantilla de Product Backlog.xlsx` | **Actualizado:** Historias de Sprint 3 marcadas como terminadas tras validación integral. |
| **06** | **Lista de tareas de la iteración**| `CF - PMOInformatica Plantilla Scrum Lista de tareas...xlsx` | **Actualizado:** Tareas de Sprint 3 completadas al 100% por el equipo conjunto. |
| **07** | **Diagrama de clases** | `07_Diagrama_Clases_CaseFlow_AI_Estructurado.drawio` | **Actualizado:** Entidad `AIFeatureToggle`, esquemas de Copiloto y relaciones con `HelpDeskContext`. |
| **08** | **Casos de uso** | `CF - PMO-Casos de Uso.docx` | **Actualizado:** Casos de uso de Asistencia por Copiloto, Configuración RBAC y Cierre con Aprendizaje. |
| **09** | **Modelo Relacional** | `09_Modelo_Relacional_CaseFlow_AI_Bien_Estructurado.drawio` | **Actualizado:** Tabla `ai_feature_toggles` y llaves foráneas asociadas. |
| **10** | **Diagrama de despliegue** | `10_Diagrama_Despliegue_CaseFlow_AI.md` | **Completado:** Topología contenerizada con orquestación Docker Compose y proxy Nginx. |
| **11** | **Plan de pruebas** | `CF - PMO-Plan de Pruebas de Software.docx` | **Actualizado a v3.0:** Cobertura de Copiloto, Matriz RBAC, Aprendizaje Dinámico y filtros de SLA. |
| **12** | **Informe de pruebas** | `CF - Informe-Pruebas-SW.docx` | **Actualizado a v3.0:** 23/23 pruebas unitarias y de integración aprobadas (100% passing). |
| **13** | **Casos de prueba** | `CF - PMO- Casos de Prueba.xls.xlsx` | **Actualizado:** Casos CP-21 a CP-30 incorporados para Copiloto, RBAC y monitoreo de SLA. |
| **14** | **Informe de errores** | `CF - Reporte_Errores_SW.xlsx` | **Actualizado:** Defectos DEF-13 a DEF-15 tabulados y marcados como cerrados/resueltos. |
| **15** | **Pruebas de unidad** | `15_Pruebas_de_Unidad_CaseFlow_AI.md` | **Actualizado:** Evidencia formal de ejecución de Pytest con suite `test_copilot_and_gov.py`. |
| **16** | **Informe de cobertura** | `16_Informe_Cobertura_CaseFlow_AI.md` | **Actualizado:** Cobertura certificada en **88%** sobre 973 sentencias de código. |
| **17** | **Reporte de errores** | `CF - Reporte_Errores_SW.xlsx` | **Actualizado:** Cierre total de defectos y trazabilidad verificada. |
| **18** | **Integración IA (Obligatorio)** | `18_Integracion_IA_CaseFlow_AI.md` | **Actualizado:** Arquitectura BYOK, prompts de sugerencia, higiene de contexto, mitigación de alucinaciones y costo $0. |
| **19** | **Informe técnico** | `19_Informe_Tecnico_CaseFlow_AI.md` | **Actualizado:** Arquitectura Cliente-Servidor desacoplada, TDD, SDD y diseño Software Craft trimodal. |

---

## 3. Certificación de Calidad (Quality Gate Sprint 3)

- **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal
- **Equipo de Desarrollo:** Danna Nerieth Palencia & Jairo Molano Salgado (Ingeniería conjunta)
- **Suite de Pruebas Automatizadas:** 23/23 pruebas aprobadas (0 fallidas, 100% de éxito).
- **Cobertura de Código Backend:** 88% verificado (973 sentencias analizadas con Pytest).
- **Compilación Frontend:** TypeScript strict + Vite build limpio (0 errores, 0 advertencias).
- **Control de Roles (RBAC):** Verificación estricta de permisos para Solicitantes, Agentes y Administradores.
- **Aprendizaje Continuo:** El sistema enriquece la base de conocimiento con cada diagnóstico final documentado.
- **Estética Visual:** Sistema trimodal Duo-Tone estricto de alta precisión (*Software Craft*), 100% libre de clichés de IA y sin referencias universitarias en la UI comercial.
- **Veredicto Final:** `[VEREDICTO: APROBADO 100%]`
