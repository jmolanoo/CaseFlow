# Documento 16: Informe de Cobertura de Pruebas (Test Coverage)

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Métrica Requerida por la Rúbrica:** Cobertura > 80%  
> **Métrica Obtenida:** **88% de Cobertura Total Verificada (790 declaraciones analizadas)**  

---

## 1. Resumen Ejecutivo de Cobertura

La suite de pruebas automatizadas alcanzó un **88% de cobertura de líneas** sobre el código fuente del backend (`app/`), superando holgadamente el umbral mínimo del 80% exigido en la rúbrica institucional.

```text
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.12.16-final-0 _______________

Name                             Stmts   Miss  Cover   Missing
--------------------------------------------------------------
app/__init__.py                      0      0   100%
app/auth.py                         39      5    87%   25, 42, 44-45, 49
app/config.py                       14      0   100%
app/database.py                     15      4    73%   16-20
app/main.py                         19      0   100%
app/models.py                      117      0   100%
app/routers/__init__.py              0      0   100%
app/routers/ai_context.py           99     32    68%   (Invocaciones HTTP externas)
app/routers/ai_vault.py             48      7    85%   43, 66, 76-80
app/routers/auth.py                 29      0   100%
app/routers/help_desks.py           75      4    95%   170, 182, 206, 214
app/routers/tickets.py             104      8    92%   20, 29, 82, 92, 132, 151, 195, 234
app/schemas.py                     173      0   100%
app/services/__init__.py             0      0   100%
app/services/ai_service.py          44     33    25%   (Líneas de conexión a red externa HTTP)
app/services/crypto_service.py      14      0   100%
--------------------------------------------------------------
TOTAL                              790     93    88%
================================================================================
```

---

## 2. Análisis por Capas de Arquitectura (Sprint 2)

1. **Modelos y Esquemas de Datos (`models.py`, `schemas.py`): 100% Cobertura**
   - Entidades relacionales (`User`, `UserAICredential`, `HelpDesk`, `Category`, `Priority`, `HelpDeskMember`, `HelpDeskContext`, `AIFeatureToggle`, `Ticket`, `TicketComment`) y esquemas Pydantic v2 (173 declaraciones).
2. **Criptografía y Seguridad (`crypto_service.py`): 100% Cobertura**
   - Cifrado simétrico AES-256 verificado en reposo.
3. **Módulo de Autenticación (`routers/auth.py`, `auth.py`): 93% Cobertura**
   - Registro, verificación de contraseñas Bcrypt, emisión de JWT y protección de endpoints.
4. **Módulo de Mesas de Ayuda (`routers/help_desks.py`): 95% Cobertura**
   - Onboarding Wizard, categorización, matrices SLA y toggles de IA.
5. **Módulo de Tickets y Comentarios (`routers/tickets.py`): 92% Cobertura**
   - Creación secuencial de tickets, cálculo dinámico de SLAs, estados, filtros y registro de diagnósticos.
6. **Módulo de Memoria y Contexto IA (`routers/ai_context.py`): 68% Cobertura**
   - Ingesta retrospectiva de tickets, control de versiones Markdown y motor de refinamiento.
