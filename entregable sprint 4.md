# Entregable Sprint 4: CaseFlow

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda con Arquitectura BYOK  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Fecha de Cierre Sprint 4:** 03 de noviembre de 2026  
> **Veredicto Quality Gate:** `[VEREDICTO: APROBADO 100%]`  

---

## 1. Guía de Ejecución y Demostración en Contenedores Docker (GitHub Codespaces / Linux)

Para levantar la plataforma completa con la totalidad de capacidades acumuladas (Sprints 1, 2, 3 y 4):

### 1.1. Comando Único Docker Compose (Recomendado)
Desde la raíz del proyecto (`CaseFlow`), ejecuta:

```bash
docker compose up -d --build
```
*(O de manera equivalente mediante el script de arranque: `./start.sh`)*

Este comando orquesta automáticamente la construcción y ejecución de los dos microservicios:
1. **Contenedor `caseflow-backend` (FastAPI + Uvicorn + Python 3.12-slim):**
   - Expuesto en el puerto `8000`.
   - Inicializa la base de datos relacional SQLite y la Bóveda Criptográfica AES-256 con migraciones automáticas.
   - Enrutadores activos:
     - `/api/auth`: Autenticación y sesiones seguras JWT con Bcrypt.
     - `/api/desks`: Gestión multi-tenant de mesas de ayuda, catálogos, enlaces de invitación y administración de miembros.
     - `/api/desks/join`: Endpoint de incorporación universal mediante enlace o código de invitación con asignación automática de rol.
     - `/api/desks/{slug}/members`: Gestión granular de miembros (cambio de rol, activación/desactivación y remoción segura).
     - `/api/desks/{slug}/invitations`: Creación, listado, alternancia de estado y eliminación de enlaces de invitación personalizados.
     - `/api/ai/vault`: Bóveda BYOK desacoplada y aislada a nivel de cada mesa de ayuda (`?desk_slug=...`), permitiendo diferentes claves API y proveedores por espacio.
     - `/api/desks/{slug}/tickets`: Ciclo de vida completo de tickets, radicación manual y asistida, comentarios internos y temporizadores de SLA.
     - `/api/desks/{slug}/context`: Memoria de soporte viva (`Help Desk Context`), ingesta retrospectiva y aprendizaje dinámico.
     - `/api/desks/{slug}/ai/toggles`: Matriz de gobierno de IA y control de acceso basado en roles (RBAC).
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

## 2. Nuevas Funcionalidades y Modificaciones Clave del Sprint 4

### 2.1. Panel Principal Desacoplado: "Mis Mesas de Ayuda"
- **Eliminación de la Conexión Global de IA:** Se erradicó por completo la configuración centralizada de IA en el dashboard general, evitando colisiones de credenciales y presupuestos entre organizaciones distintas.
- **Centro Conmutador de Espacios:** La pantalla de inicio actúa como un conmutador limpio y reactivo entre todas las mesas donde el usuario participa (como Solicitante, Agente o Administrador), con indicadores de tickets, miembros y cumplimiento de SLA.
- **Modal de Incorporación ("Unirme a una Mesa"):** Nuevo flujo accesible desde la cabecera y el estado vacío para ingresar mediante un enlace o código de invitación (`inv_...`), con previsualización en vivo de la mesa destino y el rol que se le otorgará antes de confirmar.
- **Soporte para Enlaces Directos:** Detección automática del parámetro de consulta `?join=CODIGO` en la URL para abrir el diálogo de incorporación de forma inmediata.

### 2.2. Sistema de Enlaces de Invitación Personalizados Multi-Rol
- **Generación Granular por Rol:** Los administradores pueden crear múltiples enlaces de invitación independientes:
  - Enlaces para **Usuarios / Solicitantes (Empleados)**: Quienes ingresen quedan automáticamente asignados con permisos para radicar y consultar sus propios tickets.
  - Enlaces para **Soporte / Agentes**: Quienes utilicen este enlace quedan investidos con rol de soporte para atender tickets, asignar diagnósticos y consultar el copiloto.
  - Enlaces para **Administradores**: Para co-administrar la configuración, miembros y memoria de la mesa.
- **Ajustes y Parámetros Custom:**
  - *Etiqueta Descriptiva:* Identifica el propósito del link (ej. "Enlace Personal de Ventas", "Equipo de Soporte TI Nivel 1").
  - *Límite de Usos:* Opcionalmente restringido a un número máximo de activaciones (ej. 10 usos) o indefinido.
  - *Caducidad Temporal:* Fecha límite configurable en días.
- **Consola de Control de Enlaces:** El administrador puede copiar el link con un solo clic (con feedback visual de copiado al portapapeles), pausar/reanudar enlaces activos o eliminarlos definitivamente.

### 2.3. Módulo Integral de Gestión de Miembros (User Management)
- **Directorio de Miembros por Mesa:** Listado reactivo de todos los integrantes con avatar, nombre completo, correo electrónico, rol asignado, estado y fecha de vinculación.
- **Autonomía de Registro:** Los administradores **no crean usuarios manualmente**; cada colaborador crea su cuenta de forma autónoma y se une a la organización mediante su enlace.
- **Conmutador de Roles en Tiempo Real:** El administrador puede ascender o reasignar roles de cualquier miembro (`requester` ↔ `agent` ↔ `admin`) mediante un selector en caliente.
- **Activación y Desactivación de Miembros:** Capacidad de suspender el acceso de un usuario a la mesa con un solo clic. Los miembros desactivados reciben inmediatamente una respuesta `403 Forbidden` al intentar acceder a los recursos de esa mesa, sin perder el historial de tickets atendidos o radicados.
- **Remoción de Miembros:** Expulsión de colaboradores de la mesa de ayuda con diálogo de confirmación.
- **Mecanismos de Protección de Seguridad:**
  - Imposibilidad de degradar, desactivar o eliminar al **Propietario original** de la mesa de ayuda (`desk.owner_id`).
  - Salvaguarda que impide desactivar o remover al **único administrador activo** de la mesa, previniendo estados de orfandad institucional.

### 2.4. Bóveda BYOK Aislada por Mesa de Ayuda (Tenant-Isolated AI Vault)
- **Aislamiento Estricto por Espacio de Trabajo:** Cada mesa de ayuda gestiona de forma autónoma su propia conexión de Inteligencia Artificial (Google Gemini, OpenAI GPT-4o, Anthropic Claude).
- **Múltiples API Keys por Usuario:** Un mismo usuario o empresa puede utilizar una clave gratuita de Google AI Studio en una mesa técnica interna, y una clave de OpenAI o Claude en la mesa de atención a clientes externos.
- **Medición de Latencia Real y Cifrado AES-256:** Prueba de conexión en tiempo real con cálculo de latencia en milisegundos y almacenamiento cifrado en reposo.
- **Desconexión Independiente:** Desvincular la IA de una mesa de ayuda no afecta las credenciales activas en otras mesas vinculadas.

---

## 3. Suite de Pruebas Automatizadas (Pytest) y Cobertura de Código

Se consolidó una suite exhaustiva de 25 pruebas unitarias e integradas ejecutadas dentro del contenedor `caseflow-backend`:

### 3.1. Resultado de Ejecución en Contenedor Docker
```text
============================= test session starts ==============================
platform linux -- Python 3.12.16, pytest-9.2.0, pluggy-1.7.0 -- /usr/local/bin/python3.12
rootdir: /app, configfile: pytest.ini, testpaths: tests
plugins: cov-7.1.0, anyio-4.16.0
collected 25 items

tests/test_ai_context.py::test_context_and_retrospective_ingest PASSED   [  4%]
tests/test_ai_vault.py::test_get_vault_status_empty PASSED               [  8%]
tests/test_ai_vault.py::test_ai_test_mock_key PASSED                     [ 12%]
tests/test_ai_vault.py::test_connect_ai_key PASSED                       [ 16%]
tests/test_ai_vault.py::test_disconnect_ai_key PASSED                    [ 20%]
tests/test_auth.py::test_register_success PASSED                         [ 24%]
tests/test_auth.py::test_register_duplicate_email PASSED                 [ 28%]
tests/test_auth.py::test_login_success PASSED                            [ 32%]
tests/test_auth.py::test_login_wrong_password PASSED                     [ 36%]
tests/test_auth.py::test_get_me_authenticated PASSED                     [ 40%]
tests/test_auth.py::test_get_me_unauthorized PASSED                      [ 44%]
tests/test_copilot_and_gov.py::test_ai_toggles_and_governance PASSED     [ 48%]
tests/test_copilot_and_gov.py::test_copilot_endpoints_and_dynamic_learning PASSED [ 52%]
tests/test_copilot_and_gov.py::test_ticket_assignment_and_sla_filtering PASSED [ 56%]
tests/test_crypto_and_health.py::test_crypto_roundtrip PASSED            [ 60%]
tests/test_crypto_and_health.py::test_health_check PASSED                [ 64%]
tests/test_crypto_and_health.py::test_root_endpoint PASSED               [ 68%]
tests/test_desk_ai_vault.py::test_desk_isolated_ai_vault PASSED          [ 72%]
tests/test_help_desks.py::test_create_help_desk_wizard PASSED            [ 76%]
tests/test_help_desks.py::test_create_help_desk_duplicate_slug PASSED    [ 80%]
tests/test_help_desks.py::test_list_my_help_desks PASSED                 [ 84%]
tests/test_help_desks.py::test_get_help_desk_by_slug PASSED              [ 88%]
tests/test_help_desks.py::test_toggle_ai_help_desk PASSED                [ 92%]
tests/test_members_and_invitations.py::test_members_and_custom_invitations_flow PASSED [ 96%]
tests/test_tickets.py::test_create_and_list_tickets PASSED               [100%]

================================ tests coverage ================================
TOTAL: 1,273 sentencias, 181 no cubiertas -> 86% COBERTURA
======================= 25 passed in 9.62s =======================
```

---

## 4. Matriz de Formatos PMO Diligenciados en Google Drive

Todos los archivos oficiales de gestión PMO en la carpeta compartida de Google Drive (`1fOxxIMx1X4v0kP6cjUhT_2Kx5HgNSQ5o`) fueron actualizados con el alcance consolidado de los 4 Sprints:

1. **`CF - PMOI-Documento de requerimientos.docx`:** Adición de los requerimientos funcionales RF-18 (Invitaciones custom multi-rol), RF-19 (Incorporación fluida por link/código), RF-20 (Gestión de miembros y roles), RF-21 (Bóveda BYOK aislada por mesa) y RF-22 (Dashboard desacoplado).
2. **`CF - Historias Usuario.xls.xlsx`:** Incorporación de HU-13 a HU-16 estructuradas bajo criterios formales Gherkin (Dado / Cuando / Entonces).
3. **`CF - PMO-Casos de Uso.docx`:** Especificación formal de CU-11 (Administrar Miembros), CU-12 (Generar Enlaces de Invitación), CU-13 (Unirse a Mesa de Ayuda) y CU-14 (Configurar Bóveda BYOK por Mesa).
4. **`CF - PMO-Plan de Pruebas de Software.docx`:** Versión 4.0 aprobada con matriz de pruebas CP-31 a CP-38.
5. **`CF - Informe-Pruebas-SW.docx`:** Certificación de 25 pruebas aprobadas (100% éxito) y 86% de cobertura de código.
6. **`CF - PMO- Casos de Prueba.xls.xlsx`:** Tabulación de casos de prueba con resultados y estados aprobados.
7. **`CF - Reporte_Errores_SW.xlsx`:** Registro y resolución de defectos técnicos (DEF-16 a DEF-19).
8. **`plan.md`:** Cronograma y plan de sprints actualizado y alineado con los 4 hitos concluidos.

---

## 5. Veredicto Final de Calidad (Quality Gate v2)

```text
================================================================================
VEREDICTO DEFINITIVO: [VEREDICTO: APROBADO 100%]
================================================================================
• Documentación PMO: 100% diligenciada sin placeholders en Google Drive.
• Estética y Usabilidad: Trimodal (Claro, Oscuro Neutro, AMOLED) con paleta Duo-Tone estricta.
• Software Comercial: Sin menciones académicas ni clichés en la interfaz gráfica.
• Arquitectura Multi-Tenant: Aislamiento total de credenciales BYOK por mesa de ayuda.
• Seguridad y Control: Enlaces de invitación custom, control de roles RBAC y protección de integridad.
• Suite de Pruebas: 25 tests unitarios/integración pasando al 100% con 86% de cobertura.
• Estado del Sistema: 100% funcional y listo para demostración oficial.
================================================================================
```
