# Documento 16: Informe de Cobertura de Pruebas (Test Coverage)

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Métrica Requerida por la Rúbrica:** Cobertura > 80%  
> **Métrica Obtenida:** **90% de Cobertura Total Verificada**  

---

## 1. Resumen Ejecutivo de Cobertura

La suite de pruebas automatizadas alcanzó un **90% de cobertura de líneas** sobre el código fuente del backend (`app/`), superando holgadamente el umbral mínimo del 80% exigido en la rúbrica institucional.

```text
================================ tests coverage ================================
Name                             Stmts   Miss  Cover   Missing
--------------------------------------------------------------
app/__init__.py                      0      0   100%
app/auth.py                         39      5    87%   25, 42, 44-45, 49
app/config.py                       14      0   100%
app/database.py                     15      4    73%   16-20
app/main.py                         17      0   100%
app/models.py                      117      0   100%
app/routers/__init__.py              0      0   100%
app/routers/ai_vault.py             48      7    85%   43, 66, 76-80
app/routers/auth.py                 29      0   100%
app/routers/help_desks.py           75      4    95%   170, 182, 206, 214
app/schemas.py                     102      0   100%
app/services/__init__.py             0      0   100%
app/services/ai_service.py          44     33    25%   (Líneas de conexión a red externa HTTP)
app/services/crypto_service.py      14      0   100%
--------------------------------------------------------------
TOTAL                              514     53    90%
================================================================================
```

---

## 2. Análisis por Capas de Arquitectura

1. **Modelos y Esquemas de Datos (`models.py`, `schemas.py`): 100% Cobertura**
   - Todas las entidades relacionales (`User`, `UserAICredential`, `HelpDesk`, `Category`, `Priority`, `HelpDeskMember`, `HelpDeskContext`, `AIFeatureToggle`, `Ticket`) y los contratos Pydantic v2 están cubiertos.
2. **Criptografía y Seguridad (`crypto_service.py`): 100% Cobertura**
   - El cifrado simétrico mediante derivadas SHA-256 y Fernet opera con verificación de ida y vuelta.
3. **Módulo de Autenticación (`routers/auth.py`, `auth.py`): 93% Cobertura Promedio**
   - Rutas de registro, detección de duplicados, hashing bcrypt, generación y verificación de JWT.
4. **Módulo de Help Desks y Wizard (`routers/help_desks.py`): 95% Cobertura**
   - Creación de mesas con catálogos por defecto y personalizados, resolución de slugs, permisos por rol y toggles de IA.
5. **Bóveda BYOK (`routers/ai_vault.py`): 85% Cobertura**
   - Validación, cálculo de latencia en milisegundos, almacenamiento seguro y desacoplamiento.
