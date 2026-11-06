# Documento 16: Informe de Cobertura de Pruebas (Test Coverage)

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Métrica Requerida por la Rúbrica:** Cobertura > 80%  
> **Métrica Obtenida:** **85% de Cobertura Total Verificada (1345 declaraciones analizadas)**  

---

## 1. Resumen Ejecutivo de Cobertura

La suite de pruebas automatizadas alcanzó un **85% de cobertura de líneas** sobre el código fuente integral del backend (`app/`), superando el umbral mínimo del 80% exigido en la rúbrica institucional con un total de 1,345 sentencias evaluadas.

```text
================================ tests coverage ================================
_______________ coverage: platform linux, python 3.12.16-final-0 _______________

Name                             Stmts   Miss  Cover   Missing
--------------------------------------------------------------
app/__init__.py                      0      0   100%
app/auth.py                         39      5    87%   25, 42, 44-45, 49
app/config.py                       14      0   100%
app/database.py                     31     10    68%   23-24, 30-33, 36-40
app/main.py                         19      0   100%
app/models.py                      137      0   100%
app/routers/__init__.py              0      0   100%
app/routers/ai_context.py          216     45    79%   62, 76, 107, 109, 114, 116, 118, 157-173, 190, 239-240, 275-280, 283, 287, 289, 294, 349, 385, 401-421, 453, 493
app/routers/ai_vault.py             85     14    84%   23, 31, 72, 97, 104, 110, 133-137, 176, 183, 185
app/routers/auth.py                 29      0   100%
app/routers/help_desks.py          261     49    81%   67, 69, 71, 216, 227, 244, 253, 271, 279, 306, 314, 321, 326, 332-338, 368, 376, 383, 386, 389-395, 413, 421, 467, 475, 506, 514, 521, 550, 558, 565, 579, 582, 593, 604, 633, 645, 651, 668-678
app/routers/tickets.py             197     40    80%   22, 31, 36, 89, 109-123, 159, 168, 210, 212, 224-226, 229-235, 253, 308, 346-351, 387, 391, 420, 425-427
app/schemas.py                     259      0   100%
app/services/__init__.py             0      0   100%
app/services/ai_service.py          44     33    25%   (Líneas de conexión a red externa HTTP)
app/services/crypto_service.py      14      0   100%
--------------------------------------------------------------
TOTAL                             1345    196    85%
====================== 27 passed, 177 warnings in 10.25s =======================
```

---

## 2. Análisis por Capas de Arquitectura (Fase 1 Consolidación)

1. **Modelos y Esquemas de Datos (`models.py`, `schemas.py`): 100% Cobertura**
   - Entidades relacionales (`User`, `UserAICredential`, `HelpDesk`, `Category`, `Priority`, `HelpDeskMember`, `HelpDeskInvitation`, `HelpDeskContext`, `AIFeatureToggle`, `Ticket`, `TicketComment`) y esquemas Pydantic v2 (259 declaraciones).
2. **Criptografía y Seguridad (`crypto_service.py`): 100% Cobertura**
   - Cifrado simétrico AES-256 verificado en reposo para bóvedas globales y por mesa.
3. **Módulo de Autenticación (`routers/auth.py`, `auth.py`): 93% Cobertura**
   - Registro, verificación de contraseñas Bcrypt, emisión de JWT y protección de endpoints.
4. **Módulo de Mesas de Ayuda e Invitaciones (`routers/help_desks.py`): 81% Cobertura**
   - Onboarding Wizard, categorización, matrices SLA, toggles de IA, sistema de invitaciones con enlace y límites de uso.
5. **Módulo de Tickets, SLAs y Prioridad (`routers/tickets.py`): 80% Cobertura**
   - Radicación sin prioridad para usuarios regulares, asignación automática con IA activa, triaje manual staff vía `PATCH /tickets/{code}/priority`, diagnóstico de resolución y ciclo de vida.
6. **Módulo de Memoria y Contexto IA (`routers/ai_context.py`): 79% Cobertura**
   - Ingesta retrospectiva de tickets, control de versiones Markdown, copiloto de sugerencias, diagnóstico y resumen.
