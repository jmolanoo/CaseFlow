# Documento 15: Evidencia de Pruebas de Unidad (Unit Testing)

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Fecha de Ejecución:** 06 de noviembre de 2026 (Fase 1 / Consolidación Integral)  
> **Estado de la Suite:** 100% Aprobada (27/27 pruebas superadas sin fallos)  

---

## 1. Resumen de la Suite Automatizada de Pruebas

Se ejecutó la suite completa de pruebas unitarias y de integración utilizando **Pytest** y **FastAPI TestClient**, cubriendo todos los dominios arquitectónicos del sistema:
- **Autenticación y Criptografía (`tests/test_auth.py`, `tests/test_crypto_and_health.py`):** 9 pruebas.
- **Bóveda BYOK y Aislamiento por Mesa (`tests/test_ai_vault.py`, `tests/test_desk_ai_vault.py`):** 5 pruebas.
- **Mesas de Ayuda, Onboarding y Toggles (`tests/test_help_desks.py`):** 5 pruebas.
- **Gestión de Miembros, Invitaciones con Código y Expiración (`tests/test_members_and_invitations.py`):** 1 prueba integral.
- **Matriz de Control de Acceso por Roles RBAC (`tests/test_role_permissions.py`):** 1 prueba integral de aislamiento de privilegios.
- **Tickets, SLAs, Asignación de Prioridad sin IA y Triage Staff (`tests/test_tickets.py`):** 2 pruebas integrales.
- **Memoria Contextual, Ingesta Retrospectiva y Asistente IA (`tests/test_ai_context.py`):** 1 prueba integral.
- **Copilot de Diagnóstico, Sugerencias y Gobierno Ético (`tests/test_copilot_and_gov.py`):** 3 pruebas integrales.

---

## 2. Detalle de Casos de Prueba Ejecutados

| Archivo de Prueba | Nombre del Test | Propósito Técnico | Resultado |
| :--- | :--- | :--- | :--- |
| `test_auth.py` | `test_register_success` | Registro con datos válidos y emisión de token JWT | **PASSED** |
| `test_auth.py` | `test_register_duplicate_email` | Verificación de unicidad de email (HTTP 400) | **PASSED** |
| `test_auth.py` | `test_login_success` | Verificación de hash bcrypt y login exitoso (HTTP 200) | **PASSED** |
| `test_auth.py` | `test_login_wrong_password` | Rechazo seguro ante contraseña errónea (HTTP 401) | **PASSED** |
| `test_auth.py` | `test_get_me_authenticated` | Retorno de usuario actual vía Bearer token | **PASSED** |
| `test_auth.py` | `test_get_me_unauthorized` | Bloqueo estricto de rutas protegidas sin token | **PASSED** |
| `test_ai_vault.py` | `test_get_vault_status_empty` | Estado desconectado por defecto sin credenciales | **PASSED** |
| `test_ai_vault.py` | `test_ai_test_mock_key` | Validación sintética y cálculo de latencia en ms | **PASSED** |
| `test_ai_vault.py` | `test_connect_ai_key` | Conexión, cifrado en BD y confirmación de estado | **PASSED** |
| `test_ai_vault.py` | `test_disconnect_ai_key` | Desacoplamiento seguro de credenciales de IA | **PASSED** |
| `test_desk_ai_vault.py` | `test_desk_isolated_ai_vault` | Cifrado y desacoplamiento de API Key aislada por mesa | **PASSED** |
| `test_crypto_and_health.py` | `test_crypto_roundtrip` | Cifrado y descifrado bidireccional AES íntegro | **PASSED** |
| `test_crypto_and_health.py` | `test_health_check` | Sonda de vida operativa `/api/health` | **PASSED** |
| `test_crypto_and_health.py` | `test_root_endpoint` | Metadatos de la aplicación y proveedores soportados | **PASSED** |
| `test_help_desks.py` | `test_create_help_desk_wizard` | Creación atómica de mesa + categorías + SLAs | **PASSED** |
| `test_help_desks.py` | `test_create_help_desk_duplicate_slug` | Validación de unicidad de slug URL | **PASSED** |
| `test_help_desks.py` | `test_list_my_help_desks` | Listado multi-tenant con métricas y roles | **PASSED** |
| `test_help_desks.py` | `test_get_help_desk_by_slug` | Detalle estructurado de categorías y prioridades | **PASSED** |
| `test_help_desks.py` | `test_toggle_ai_help_desk` | Alternancia de estado de IA en mesa por admin | **PASSED** |
| `test_members_and_invitations.py` | `test_members_and_custom_invitations_flow` | Ciclo de invitaciones multi-rol con límite y expiración | **PASSED** |
| `test_role_permissions.py` | `test_role_based_permissions_matrix` | Matriz RBAC (admin vs agent vs requester) | **PASSED** |
| `test_tickets.py` | `test_create_and_list_tickets` | Creación de tickets, cálculo SLA, filtros, comentarios, resolución y diagnóstico | **PASSED** |
| `test_tickets.py` | `test_update_ticket_priority_and_unassigned_flow` | Radicación sin prioridad, triaje staff y actualización de prioridad vía PATCH | **PASSED** |
| `test_ai_context.py` | `test_context_and_retrospective_ingest` | Ingesta retrospectiva de tickets, control de versión y refinamiento IA | **PASSED** |
| `test_copilot_and_gov.py` | `test_ai_toggles_and_governance` | Gobierno de funciones IA y políticas por rol | **PASSED** |
| `test_copilot_and_gov.py` | `test_copilot_endpoints_and_dynamic_learning` | Diagnóstico técnico, sugerencias y aprendizaje dinámico | **PASSED** |
| `test_copilot_and_gov.py` | `test_ticket_assignment_and_sla_filtering` | Asignación de casos a agentes y filtros de SLA en tiempo real | **PASSED** |

---

## 3. Conclusión de Calidad

- **Pruebas Totales:** 27
- **Aprobadas:** 27 (100%)
- **Fallidas:** 0
- **Tiempo Total de Ejecución:** ~10.25 segundos
- **Cumplimiento de Rúbrica:** 100% Satisfactorio
