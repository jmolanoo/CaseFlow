# Documento 15: Evidencia de Pruebas de Unidad (Unit Testing)

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Fecha de Ejecución:** 03 de noviembre de 2026 (Sprint 2 Cierre)  
> **Estado de la Suite:** 100% Aprobada (20/20 pruebas superadas sin fallos)  

---

## 1. Resumen de la Suite Automatizada de Pruebas

Se amplió la suite completa de pruebas unitarias y de integración utilizando **Pytest** y **FastAPI TestClient**, cubriendo los 5 dominios de la arquitectura:
- **Módulo de Autenticación y Criptografía (`tests/test_auth.py`, `tests/test_crypto_and_health.py`):** 9 pruebas.
- **Módulo de Bóveda BYOK y Latencia (`tests/test_ai_vault.py`):** 4 pruebas.
- **Módulo de Help Desks y Onboarding Wizard (`tests/test_help_desks.py`):** 5 pruebas.
- **Módulo de Tickets, Comentarios y SLAs (`tests/test_tickets.py`):** Suite completa con ciclo de vida, filtros, cálculo de SLA y diagnóstico de resolución.
- **Módulo de Contexto e Ingesta Retrospectiva (`tests/test_ai_context.py`):** Suite completa con lectura/edición de `Help Desk Context`, ingesta retrospectiva multi-ticket y asistente de refinamiento IA.

---

## 2. Detalle de Casos de Prueba Ejecutados

| Archivo de Prueba | Nombre del Test | Propósito Técnico | Resultado | Tiempo (s) |
| :--- | :--- | :--- | :--- | :--- |
| `test_auth.py` | `test_register_success` | Registro con datos válidos y emisión de token JWT | **PASSED** | 0.28s |
| `test_auth.py` | `test_register_duplicate_email` | Verificación de unicidad de email (HTTP 400) | **PASSED** | 0.25s |
| `test_auth.py` | `test_login_success` | Verificación de hash bcrypt y login exitoso (HTTP 200) | **PASSED** | 0.26s |
| `test_auth.py` | `test_login_wrong_password` | Rechazo seguro ante contraseña errónea (HTTP 401) | **PASSED** | 0.24s |
| `test_auth.py` | `test_get_me_authenticated` | Retorno de usuario actual vía Bearer token | **PASSED** | 0.05s |
| `test_auth.py` | `test_get_me_unauthorized` | Bloqueo estricto de rutas protegidas sin token | **PASSED** | 0.03s |
| `test_ai_vault.py` | `test_get_vault_status_empty` | Estado desconectado por defecto sin credenciales | **PASSED** | 0.04s |
| `test_ai_vault.py` | `test_ai_test_mock_key` | Validación sintética y cálculo de latencia en ms | **PASSED** | 0.05s |
| `test_ai_vault.py` | `test_connect_ai_key` | Conexión, cifrado en BD y confirmación de estado | **PASSED** | 0.06s |
| `test_ai_vault.py` | `test_disconnect_ai_key` | Desacoplamiento seguro de credenciales de IA | **PASSED** | 0.07s |
| `test_crypto_and_health.py` | `test_crypto_roundtrip` | Cifrado y descifrado bidireccional AES íntegro | **PASSED** | 0.01s |
| `test_crypto_and_health.py` | `test_health_check` | Sonda de vida operativa `/api/health` | **PASSED** | 0.03s |
| `test_crypto_and_health.py` | `test_root_endpoint` | Metadatos de la aplicación y proveedores soportados | **PASSED** | 0.02s |
| `test_help_desks.py` | `test_create_help_desk_wizard` | Creación atómica de mesa + categorías + SLAs | **PASSED** | 0.08s |
| `test_help_desks.py` | `test_create_help_desk_duplicate_slug` | Validación de unicidad de slug URL | **PASSED** | 0.06s |
| `test_help_desks.py` | `test_list_my_help_desks` | Listado multi-tenant con métricas y roles | **PASSED** | 0.07s |
| `test_help_desks.py` | `test_get_help_desk_by_slug` | Detalle estructurado de categorías y prioridades | **PASSED** | 0.05s |
| `test_help_desks.py` | `test_toggle_ai_help_desk` | Alternancia de estado de IA en mesa por admin | **PASSED** | 0.06s |
| `test_tickets.py` | `test_create_and_list_tickets` | Creación de tickets, cálculo SLA, filtros, comentarios, resolución y diagnóstico | **PASSED** | 0.35s |
| `test_ai_context.py` | `test_context_and_retrospective_ingest` | Ingesta retrospectiva de tickets históricos, versión de contexto y refinamiento IA | **PASSED** | 0.38s |

---

## 3. Log de Ejecución Oficial (Pytest Output)

```text
============================= test session starts ==============================
platform linux -- Python 3.12.16, pytest-9.2.0, pluggy-1.7.0 -- /usr/local/bin/python3.12
rootdir: /app
configfile: pytest.ini
testpaths: tests
plugins: cov-7.1.0, anyio-4.16.0
collected 20 items

tests/test_ai_context.py::test_context_and_retrospective_ingest PASSED   [  5%]
tests/test_ai_vault.py::test_get_vault_status_empty PASSED               [ 10%]
tests/test_ai_vault.py::test_ai_test_mock_key PASSED                     [ 15%]
tests/test_ai_vault.py::test_connect_ai_key PASSED                       [ 20%]
tests/test_ai_vault.py::test_disconnect_ai_key PASSED                    [ 25%]
tests/test_auth.py::test_register_success PASSED                         [ 30%]
tests/test_auth.py::test_register_duplicate_email PASSED                 [ 35%]
tests/test_auth.py::test_login_success PASSED                            [ 40%]
tests/test_auth.py::test_login_wrong_password PASSED                     [ 45%]
tests/test_auth.py::test_get_me_authenticated PASSED                     [ 50%]
tests/test_auth.py::test_get_me_unauthorized PASSED                      [ 55%]
tests/test_crypto_and_health.py::test_crypto_roundtrip PASSED            [ 60%]
tests/test_crypto_and_health.py::test_health_check PASSED                [ 65%]
tests/test_crypto_and_health.py::test_root_endpoint PASSED               [ 70%]
tests/test_help_desks.py::test_create_help_desk_wizard PASSED            [ 75%]
tests/test_help_desks.py::test_create_help_desk_duplicate_slug PASSED    [ 80%]
tests/test_help_desks.py::test_list_my_help_desks PASSED                 [ 85%]
tests/test_help_desks.py::test_get_help_desk_by_slug PASSED              [ 90%]
tests/test_help_desks.py::test_toggle_ai_help_desk PASSED                [ 95%]
tests/test_tickets.py::test_create_and_list_tickets PASSED               [100%]

======================= 20 passed in 6.25s ========================
```
