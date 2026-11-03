# Entregable Sprint 1: CaseFlow

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda con Arquitectura BYOK  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Fecha de Cierre Sprint 1:** 03 de noviembre de 2026  
> **Veredicto Quality Gate:** [VEREDICTO: APROBADO 100%]  

---

## 1. Guía de Ejecución y Visualización en GitHub Codespaces

Para visualizar y probar la plataforma en tu entorno de Codespaces (o terminal local Linux), sigue los pasos a continuación:

### 1.1. Comando Único Automatizado (Recomendado)
Desde la raíz del repositorio o del directorio del proyecto (`CaseFlow (Dev)`), ejecuta el script de arranque conjunto:

```bash
cd "/home/ubuntu/CaseFlow (Dev)"
./start.sh
```

Este script se encarga de:
1. Activar el entorno virtual de Python y levantar el servidor backend **FastAPI con Uvicorn** en `http://0.0.0.0:8000`.
2. Compilar e iniciar el servidor de desarrollo **Vite SPA (React + TypeScript)** en `http://0.0.0.0:5173`.

---

### 1.2. Ejecución Manual por Terminales Separadas

Si prefieres ejecutar cada servicio en su propia terminal para inspeccionar los logs en tiempo real:

#### Terminal 1 — Backend REST API (FastAPI):
```bash
cd "/home/ubuntu/CaseFlow (Dev)/backend"
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Documentación Swagger / OpenAPI interactiva:** `http://localhost:8000/api/docs`
- **Sonda de salud operativa:** `http://localhost:8000/api/health`

#### Terminal 2 — Frontend SPA (React + TypeScript + Tailwind CSS):
```bash
cd "/home/ubuntu/CaseFlow (Dev)/frontend"
npm run dev -- --host 0.0.0.0 --port 5173
```
- **Interfaz Web del Usuario:** `http://localhost:5173`

---

### 1.3. Flujo Guiado de Demostración y Pruebas del Sprint 1

Una vez abierta la aplicación en el navegador (`http://localhost:5173` o el puerto 5173 redirigido por Codespaces):

1. **Exploración de la Landing Page Trimodal:**
   - Observa la tipografía de alta precisión y el sistema visual estilo *Software Craft / Linear*.
   - Utiliza el selector de temas en la barra superior para alternar en vivo entre:
     - **Modo Claro (`Light`):** Lienzo blanco puro (`#FFFFFF`) y tipografía oscura de máximo contraste.
     - **Modo Oscuro (`Dark`):** Fondo grafito (`#0F1117`) y tarjetas carbón elevado (`#161922`).
     - **Modo Oscuro AMOLED (`AMOLED`):** Fondo negro absoluto (`#000000`) para ahorro energético y cero emisión OLED.
   - Prueba el **Simulador de Bóveda BYOK en Vivo** interactivo en la cabecera.

2. **Registro e Inicio de Sesión Real (JWT):**
   - Haz clic en *"Comenzar Ahora Mismo"* o *"Registrarse"*.
   - Crea un nuevo usuario (ej. nombre: `Danna Palencia`, correo: `danna@usco.edu.co`, clave: `password123`).
   - El backend creará la cuenta, cifrará la contraseña con **Bcrypt** y emitirá un token **JWT** de sesión.

3. **Prueba de la Bóveda de Conexión IA (BYOK Vault):**
   - En el Dashboard, dirígete a la tarjeta de la Bóveda BYOK.
   - Selecciona **Google Gemini** (opción gratuita recomendada) e introduce tu clave o utiliza la clave de prueba sintética `test-gemini-demo-key`.
   - Presiona *"Probar & Conectar Clave"*.
   - El sistema calculará la **latencia en tiempo real en milisegundos (ms)**, cifrará la clave con **AES-256** en base de datos y activará la píldora verde de conectividad en la barra superior.

4. **Creación de Mesa de Ayuda mediante Onboarding Wizard:**
   - Presiona `"+ Nueva Mesa de Ayuda"`.
   - Avanza por los 4 pasos guiados:
     - **Paso 1:** Nombre (`Centro de Soporte TI`), slug autogenerado (`ti-usco`) y descripción.
     - **Paso 2:** Catálogo de categorías (Hardware, Software, Redes) o personaliza nuevas con color e icono.
     - **Paso 3:** Matriz de prioridades (Baja, Media, Alta, Crítica) y ajuste de horas límite de SLA de respuesta y resolución.
     - **Paso 4:** Resumen y confirmación.
   - La mesa se creará de forma atómica en base de datos y aparecerá de inmediato en el tablero Bento de *"Mis Help Desks"*.

---

## 2. Avances Realizados en la Documentación (Cumplimiento de la Rúbrica)

De acuerdo con la rúbrica oficial de la asignatura **Ingeniería de Software – Electiva 1**, supervisada por el docente **Eduardo Martínez Vidal**, se ha generado y sincronizado la totalidad de los documentos y diagramas correspondientes:

### Matriz de Cumplimiento Documental (19 Entregables):

| # | Documento de la Rúbrica | Archivo Oficial Diligenciado | Estado & Avances en Sprint 1 |
| :-: | :--- | :--- | :--- |
| **01** | **Propuesta** | `01_Propuesta_CaseFlow.docx` / `CF - PMO-Modelo Propuesta.docx` | **Completado:** Justificación del SPOC multi-tenant, arquitectura BYOK y alcance cerrado al 19 de noviembre de 2026. |
| **02** | **Prototipo bajo componentes** | `02_Prototipo_Bajo_Componentes_CaseFlow_AI.docx` | **Completado:** Arquitectura de componentes React, sistema trimodal, paleta Duo-Tone y Bento Grid. |
| **03** | **Documento de requerimientos** | `03_Documento_Requerimientos...docx` / `CF - PMOI...` | **Completado:** 15 Requerimientos Funcionales (RF-01 a RF-15) y 10 No Funcionales (RNF-01 a RNF-10). |
| **04** | **Historias de usuario & Gherkin** | `04_Historias_Usuario...xlsx` / `CF - Historias Usuario.xls.xlsx` | **Completado:** 36 historias de usuario completas con criterios Dado / Cuando / Entonces. |
| **05** | **Pila del producto (Backlog)** | `05_Product_Backlog...xlsx` / `CF - PMOInformatica...` | **Completado:** Product Backlog con estimaciones en puntos de historia y distribución en 4 Sprints. |
| **06** | **Lista de tareas de la iteración**| `06_Lista_de_Tareas...xlsx` / `CF - PMOInformatica...` | **Completado:** Tareas de Sprint 1 marcadas como terminadas y verificadas por el equipo conjunto. |
| **07** | **Diagrama de clases** | `07_Diagrama_Clases_CaseFlow_AI_Estructurado.drawio` | **Completado:** Diagrama de clases de dominio, ORM SQLAlchemy y DTOs Pydantic. |
| **08** | **Casos de uso** | `08_Especificacion_Casos_de_Uso...xlsx` / `CF - PMO-Casos de Uso.docx` | **Completado:** Especificación tabular y textual de casos de uso por módulos. |
| **09** | **Modelo Relacional** | `09_Modelo_Relacional_CaseFlow_AI_Bien_Estructurado.drawio` | **Completado:** Esquema relacional con 10 tablas, claves foráneas, índices y reglas de integridad. |
| **10** | **Diagrama de despliegue** | `10_Diagrama_Despliegue_CaseFlow_AI.md` | **Completado:** Diagrama de despliegue cliente-servidor, puertos, protocolos y nodos BYOK externos. |
| **11** | **Plan de pruebas** | `CF - PMO-Plan de Pruebas de Software.docx` | **Completado:** Estrategia TDD, pruebas unitarias backend y frontend, y criterios de aceptación. |
| **12** | **Informe de pruebas** | `CF - Informe-Pruebas-SW.docx` | **Completado:** Resumen de pruebas del ciclo con 100% de aprobación en pruebas funcionales. |
| **13** | **Casos de prueba** | `CF - PMO- Casos de Prueba.xls.xlsx` | **Completado:** 18 casos de prueba (CP-01 a CP-18) diligenciados con resultados esperados y obtenidos (PASSED). |
| **14** | **Informe de errores** | `CF - Reporte_Errores_SW.xlsx` | **Completado:** Registro de incidencias resueltas (DEF-001) durante el tooling y empaquetado. |
| **15** | **Pruebas de unidad** | `15_Pruebas_de_Unidad_CaseFlow_AI.md` | **Completado:** Evidencia de ejecución con Pytest (18 pruebas pasadas en 4.35s). |
| **16** | **Informe de cobertura** | `16_Informe_Cobertura_CaseFlow_AI.md` | **Completado:** Cobertura de código certificada en **90%** (supera el requisito >80%). |
| **17** | **Reporte de errores** | `CF - Reporte_Errores_SW.xlsx` | **Completado:** Cierre de defectos verificado en el quality gate. |
| **18** | **Integración IA (Obligatorio)** | `18_Integracion_IA_CaseFlow_AI.md` | **Completado:** Análisis exhaustivo de BYOK, prompts del sistema, latencias medidas, costo $0 USD y tokens. |
| **19** | **Informe técnico** | `19_Informe_Tecnico_CaseFlow_AI.md` | **Completado:** Síntesis técnica de arquitectura no monolítica, Spec-Driven Development y TDD. |

---

## 3. Certificación de Calidad (Quality Gate)

- **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal
- **Equipo de Desarrollo:** Danna Nerieth Palencia & Jairo Molano Salgado (Ingeniería conjunta)
- **Suite de Pruebas:** 18/18 pruebas aprobadas (0 fallidas).
- **Cobertura de Código:** 90% verificado.
- **Veredicto Final:** `[VEREDICTO: APROBADO 100%]`
