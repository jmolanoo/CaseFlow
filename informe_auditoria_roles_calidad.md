# CaseFlow — Informe de Auditoría de Calidad, Permisos RBAC y Datos de Prueba

**Documento Oficial de Auditoría y Control de Acceso**  
**Proyecto:** CaseFlow — Plataforma Multi-Tenant Inteligente de Soporte Técnico (BYOK)  
**Equipo de Ingeniería:** Danna Nerieth Palencia & Jairo Molano Salgado  
**Docente Supervisor & Product Owner:** Ing. Eduardo Martínez Vidal  
**Fecha de Emisión:** 4 de noviembre de 2026  
**Versión:** 2.1.0 (Post-Sprint 4 Quality Gate)

---

## 1. Resumen Ejecutivo

En atención a la revisión técnica sobre las interfaces y permisos del software, se identificó que roles no administrativos (como Soporte/Agente y Solicitante) tenían acceso visual y funcional a módulos de configuración sensible que corresponden exclusivamente al rol de Administrador (gestión de llaves de IA en Bóveda BYOK, edición directa de la memoria de soporte/contexto organizacional, matriz de gobierno de IA y generación de enlaces de invitación).

Se ejecutó una intervención exhaustiva de ingeniería que abarcó:
1. **Reestructuración de la Matriz de Control de Acceso Basada en Roles (RBAC):** Alineación estricta de vistas tanto a nivel frontend como en las políticas de autorización de la API FastAPI.
2. **Depuración y Siembra de Datos Empresariales:** Eliminación de usuarios de prueba temporales y creación de tres usuarios modelo pertenecientes a una misma mesa de ayuda institucional, acompañados de un conjunto enriquecido de datos reales (incidentes, categorización, SLAs y notas internas).
3. **Auditoría Integral de Calidad y Pruebas Automatizadas:** Creación de una suite de regresión y seguridad (`test_role_permissions.py` y `test_e2e_roles.py`) logrando 26 pruebas automáticas aprobadas al 100% con 86% de cobertura de código.

---

## 2. Matriz de Roles y Permisos Alineada

```
+-----------------------------------+---------------+-------------------+-----------------------+
| Módulo / Funcionalidad             | Administrador | Soporte / Agente  | Usuario / Solicitante |
+-----------------------------------+---------------+-------------------+-----------------------+
| Cola de Tickets Global de la Mesa | Total (Ver/Asig/Mod) | Total (Ver/Asig/Mod) | Solo Propios (Lectura)|
| Radicación Asistida de Casos      | Sí            | Sí                | Sí                    |
| Cambio de Estado del Ticket       | Libre         | Libre             | Solo Confirmar Cierre |
| Asignación de Caso ("Tomar Caso") | Sí            | Sí                | Bloqueado / Oculto    |
| Inserción de Diagnóstico de Cierre| Sí            | Sí                | Bloqueado / Oculto    |
| Visualización de Notas Internas   | Sí            | Sí                | Bloqueado / Oculto    |
| Creación de Notas Internas        | Sí            | Sí                | Bloqueado / Oculto    |
| Copiloto: Sugerencia de Respuestas| Sí            | Sí                | Bloqueado / Oculto    |
| Copiloto: Diagnóstico y Similares | Sí            | Sí                | Bloqueado / Oculto    |
| Copiloto: Resumen Ejecutivo       | Sí            | Sí                | Según Toggle          |
| Gestión de Usuarios e Invitaciones| Total         | Oculto (403)      | Oculto (403)          |
| Bóveda BYOK (Configuración IA)    | Total         | Oculto (403)      | Oculto (403)          |
| Memoria de Soporte (Edición/Ing.) | Total         | Oculto (403)      | Oculto (403)          |
| Matriz de Gobernanza y SLAs       | Total         | Oculto (403)      | Oculto (403)          |
+-----------------------------------+---------------+-------------------+-----------------------+
```

---

## 3. Acciones de Corrección Implementadas

### A. Consola del Espacio de Trabajo (`WorkspaceView.tsx`)
- **Pestañas Condicionales:** Se restringieron las pestañas *Usuarios e Invitaciones*, *Conexión de IA (BYOK)*, *Memoria de Soporte* y *Gobernanza & SLAs* para que sean renderizadas **únicamente** cuando `desk.user_role === 'admin'`.
- **Vista Especializada para Solicitante:** El encabezado de tickets muestra automáticamente *"Mis Incidencias Radicadas"* y la barra de métricas refleja el estado personal del usuario (*Mis Tickets Radicados*, *En Atención Activa*, *Casos Resueltos*, *SLA Promedio*).
- **Protección de Enrutamiento en Cliente:** Se agregó un efecto de auto-corrección que restablece `activeTab` a `'tickets'` si un usuario no administrador intenta acceder a pestañas restringidas.

### B. Modal de Detalle de Incidencias (`TicketDetailModal.tsx`)
- **Control de Flujo de Estados:** Se reemplazó el selector editable de estados por un badge de solo lectura para el Solicitante, añadiendo un botón directo de *"Dar por Resuelto"* que permite al cliente validar su satisfacción sin alterar flujos técnicos internos.
- **Aislamiento de Asignación y Copiloto:** Los botones *"Tomar Caso (Asignarme)"*, *"Sugerir Respuesta"* y *"Diagnóstico y Casos Similares"* se ocultan automáticamente para el rol solicitante.
- **Notas Internas Confidenciales:** Los agentes y administradores disponen ahora de un selector para alternar entre *"Respuesta Pública al Usuario"* y *"Nota Interna (solo equipo)"* con indicador visual distintivo. Los usuarios solicitantes nunca reciben ni visualizan estas notas.

### C. Fortalecimiento de la API REST (Backend)
- **`tickets.py`:**
  - `GET /desks/{slug}/tickets`: Aplica filtro estricto `Ticket.requester_id == current_user.id` cuando el usuario tiene rol de solicitante.
  - `GET /desks/{slug}/tickets/{ticket_code}`: Responde con HTTP 403 si un solicitante intenta consultar un caso radicado por otro usuario, y excluye los comentarios marcados con `is_internal == True`.
  - `PATCH /desks/{slug}/tickets/{ticket_code}/status`: Impide a solicitantes modificar casos ajenos o aplicar diagnósticos técnicos de aprendizaje.
  - `PATCH /desks/{slug}/tickets/{ticket_code}/assign`: Exige membresía activa con rol `admin` o `agent` (HTTP 403 para solicitantes).
- **`ai_context.py`:**
  - `GET /desks/{slug}/context` y `PUT /desks/{slug}/context`: Exigen rol de Administrador.
  - `GET /desks/{slug}/ai/toggles` y `PUT /desks/{slug}/ai/toggles`: Exigen rol de Administrador.
  - Endpoints de Copiloto técnico (`suggest-reply`, `diagnose`): Exigen rol `admin` o `agent`.
- **`ai_vault.py`:**
  - `POST /ai/vault/connect` y `DELETE /ai/vault/disconnect`: Exigen rol de Administrador al operar sobre una mesa de ayuda específica.

---

## 4. Usuarios de Demostración y Datos Sembrados

Se eliminaron los tres usuarios de prueba preliminares y se aprovisionaron tres nuevos usuarios corporativos vinculados al mismo espacio de trabajo:

### Mesa de Ayuda Unificada
- **Nombre:** Centro de Servicios Tecnológicos
- **Slug:** `centro-de-servicios`
- **Estado de IA:** Activa (Arquitectura BYOK)

### Credenciales de Acceso

1. **Rol Administrador**
   - **Nombre Completo:** Carlos Mendoza
   - **Correo Electrónico:** `admin@caseflow.co`
   - **Contraseña:** `CaseFlow2026!`
   - **Alcance:** Control total de la mesa, invitaciones, configuración de IA BYOK, memoria viva y SLAs.

2. **Rol Soporte Técnico / Agente**
   - **Nombre Completo:** Valeria Ríos
   - **Correo Electrónico:** `soporte@caseflow.co`
   - **Contraseña:** `CaseFlow2026!`
   - **Alcance:** Atención de incidentes en cola, reasignación, uso de copiloto de respuestas, diagnóstico y notas internas.

3. **Rol Usuario / Solicitante**
   - **Nombre Completo:** Santiago Torres
   - **Correo Electrónico:** `usuario@caseflow.co`
   - **Contraseña:** `CaseFlow2026!`
   - **Alcance:** Radicación asistida de incidencias, seguimiento exclusivo a sus propios casos y cierre por conformidad.

### Catálogo de Categorías y SLAs Precargados
- **Hardware & Estaciones:** SLA 8h resp / 24h res (Fallas físicas, dockings, monitores).
- **Software & Licencias:** SLA 8h resp / 24h res (Docker Desktop, JetBrains, ofimática).
- **Redes & Conectividad:** SLA 4h resp / 12h res (Túneles VPN, WiFi, switches).
- **Accesos & Ciberseguridad:** SLA 1h resp / 4h res (MFA, directorio activo, firewalls).
- **Infraestructura Cloud:** SLA 24h resp / 72h res (Buckets S3, Kubernetes, bases de datos).

### Casos de Prueba Precargados con Hilos de Conversación
- **CF-001 (Crítica - Resuelto):** *Bloqueo masivo de autenticación MFA tras rotación de certificados.* Incluye diagnóstico técnico inyectado a la memoria organizacional y nota interna del equipo.
- **CF-002 (Alta - En Progreso):** *Intermitencia en túnel VPN corporativo sede Bogotá y desconexiones VoIP.* Asignado a Valeria Ríos con diálogo activo.
- **CF-003 (Media - Abierto / Sin Asignar):** *Falla de encendido en docking station USB-C y parpadeo en segundo monitor.* Disponible para que el agente use *"Tomar Caso"*.
- **CF-004 (Media - En Espera):** *Solicitud de provisión de licencia Docker Desktop y JetBrains Suite.* Con mensaje de confirmación hacia el solicitante.
- **CF-005 (Baja - Resuelto):** *Ajuste de cuota de almacenamiento en bucket S3 de respaldos analíticos.* Resuelto por Carlos Mendoza con política de transición a Glacier.
- **CF-006 (Alta - Resuelto):** *Alerta de acceso sospechoso detectado desde IP no reconocida.* Validación de batch nocturno y whitelist perimetral.

---

## 5. Resultados de Auditoría y Puerta de Calidad (Quality Gate v2)

| Criterio Evaluado | Estado | Evidencia de Verificación |
|---|---|---|
| Aislamiento de Roles RBAC | APROBADO 100% | Validación automatizada en `test_role_permissions.py` y `test_e2e_roles.py`. |
| Privacidad de Tickets por Solicitante | APROBADO 100% | Pruebas de consulta cruzada retornan HTTP 403 e ignoran registros de terceros. |
| Ocultamiento de Notas Internas | APROBADO 100% | Respuestas HTTP a solicitantes excluyen registros con `is_internal == True`. |
| Bloqueo de IA/Contexto a no Administradores | APROBADO 100% | Intentos de consulta o edición por agentes y solicitantes devuelven HTTP 403. |
| Suite de Pruebas Unitarias e Integración | APROBADO 100% | 26 pruebas automáticas pasando (0 fallos) con 86% de cobertura. |
| Fidelidad Estética Duo-Tone Trimodal | APROBADO 100% | Verificación en modos Claro, Oscuro Carbón y AMOLED sin desajustes de contraste. |
| Ergonomía de Formularios | APROBADO 100% | Iconos alineados verticalmente sin solapamiento con textos de entrada. |
| Construcción Limpia Frontend | APROBADO 100% | Bundle generado en 2.34s sin errores de tipado TypeScript ni dependencias rotas. |

**Veredicto Final:** **[APROBADO 100% — APTO PARA DEMOSTRACIÓN COMERCIAL]**
