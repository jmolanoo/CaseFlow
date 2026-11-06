---
name: caseflow-qa-gate
description: Protocolo estricto de auditoría y puerta de calidad (Quality Gate) para el revisor de calidad antes de cerrar sprints o fases del proyecto CaseFlow.
---

# Protocolo de Puerta de Calidad (Quality Gate) CaseFlow - Versión Rigurosa

## 1. Criterios de Evaluación Obligatorios
Para que el revisor de calidad otorgue un `[VEREDICTO: APROBADO 100%]`, se deben verificar los siguientes puntos sin excepción:

### A. Diseño Visual, Tipografía y Paleta de Colores
1. **Regla de 2 Tipografías Exclusivas:** Únicamente se permite Google Sans para lectura/sistema y Alex Brush / cursiva fina para acentos visuales. **PROHIBIDO TERMINANTEMENTE EL USO DE TIPOGRAFÍA DE TERMINAL O MONOESPACIADA (`font-mono`)**.
2. **Purga Total de Colores Ajenos:** Cero uso de azules (`blue-*`), verdes (`emerald-*`, `green-*`) o morados no institucionales. La paleta permitida consta únicamente de:
   - Salmón / Fucsia claro primario (`#f43f5e`, `#e11d48`, `rose-500`)
   - Dúo-tono de alto contraste: Negro en modo claro y Blanco en modo oscuro/amoled
   - Grises neutros de fondo y superficie sin tinte azulado (`#121214`, `#18181b`, `#232328`, `#000000`).
3. **Forma de Botones Obligatoria (Pills):** Todos los botones del sistema deben tener forma de píldora (`rounded-full`), con animaciones de hover visibles (`scale-105`, sombras con resplandor sutil).
4. **Animaciones de Modales:** Todo modal debe contar con animación fluida de entrada y salida (`AnimatePresence` de Framer Motion).
5. **Desenfoque de Pantalla Completa (Backdrop Blur):** El desenfoque de fondo al abrir cualquier modal post-login debe cubrir el 100% del viewport sin iniciar a media topbar (`fixed inset-0 z-[100] backdrop-blur-md`).
6. **Eliminación de la Píldora de IA en Topbar:** No debe existir ninguna píldora de "Asistencia IA: Inactiva/Activa" en la barra de navegación superior.

### B. Funcionalidades de Tickets y Mesas de Ayuda
1. **Separación de Responsabilidades en Modales de Tickets:**
   - **Modal de Consulta:** Al hacer clic en una petición, se visualiza únicamente el detalle de la petición con su texto íntegro sin recortes y el hilo de respuestas completo.
   - **Modal de Atención:** Al presionar "Atender Petición", se abre un segundo modal interactivo con todas las herramientas de respuesta manual (área de texto amplia), diagnóstico de resolución, reasignación y asistencia Copilot.
2. **Lógica de Prioridades:**
   - Los solicitantes no eligen prioridad al radicar.
   - Si la mesa tiene IA conectada y activa, la IA clasifica y asigna la prioridad automáticamente.
   - Si la mesa opera de forma manual (sin IA conectada), el ticket se registra como "Sin prioridad asignada", permitiendo al personal de soporte clasificar la prioridad al instante desde el tablero sin tener que abrir el caso formalmente.
3. **Consistencia de Estado de IA:** El estado de IA debe ser verídico. Si una mesa no tiene credencial BYOK conectada, no puede mostrarse como "IA Activa" en ningún encabezado ni tarjeta.
4. **Dashboard y Estadísticas Avanzadas:** Cards analíticas enriquecidas con métricas operativas y componentes de gráficas visuales interactivas (flujo de tickets, desglose por categoría, porcentaje de SLA).

### C. Código, Pruebas y Documentación
1. **Pruebas Automatizadas:** Cobertura de backend superior al 80% con 100% de tests aprobados (`pytest`).
2. **Compilación Frontend:** Compilación TypeScript (`tsc && vite build`) limpia sin advertencias críticas ni errores.
3. **Documentación Simultánea:** Formatos oficiales PMO actualizados en `02_DOCUMENTACION_DILIGENCIADA/`.

## 2. Formato de Salida del Revisor
El revisor debe emitir un informe estructurado:
- **Resumen Ejecutivo de la Auditoría**
- **Lista de Verificación (Checklist con estado Pass/Fail)**
- **Hallazgos / Observaciones**
- **Veredicto Final:** `[VEREDICTO: APROBADO 100%]` o `[VEREDICTO: RECHAZADO]`
