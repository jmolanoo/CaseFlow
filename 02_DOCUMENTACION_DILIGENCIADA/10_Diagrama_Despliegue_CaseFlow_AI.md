# Documento 10: Diagrama de Despliegue de Arquitectura

> **Proyecto:** CaseFlow — Plataforma Inteligente Multi-Tenant de Mesas de Ayuda  
> **Institución:** Universidad Surcolombiana (USCO) — Programa de Ingeniería de Software  
> **Asignatura:** Ingeniería de Software – Electiva 1  
> **Docente Supervisor & Product Owner:** Eduardo Martínez Vidal  
> **Equipo de Trabajo:** Danna Nerieth Palencia & Jairo Molano Salgado  
> **Evento:** INNOVASOFT IX Versión (19 de noviembre de 2026)  

---

## 1. Visión General del Despliegue

La solución adopta una arquitectura desacoplada Cliente-Servidor (no monolítica), dividida en nodos independientes:
1. **Frontend Tier (Cliente SPA):** React 18 + Vite + TypeScript + Tailwind CSS servido mediante servidor web estático o Vite Dev Server en local / Cloud (Vercel / Render / Docker).
2. **Backend API Tier (Servidor REST):** FastAPI + SQLAlchemy + Uvicorn ejecutado en contenedor Docker o entorno virtual Linux.
3. **Persistence Tier:** Base de datos relacional SQLite (concurrente WAL) o PostgreSQL en producción, con bóveda cifrada AES-256 para almacenamiento seguro de credenciales.
4. **External AI Services (BYOK Tier):** Google Gemini API, OpenAI API y Anthropic Claude API comunicados mediante TLS 1.3 saliente directo bajo demanda del usuario.

---

## 2. Diagrama de Despliegue (UML Deployment Diagram)

```mermaid
flowchart TB
    subgraph ClientDevice ["Dispositivo de Usuario Final (Browser / Dispositivo Móvil)"]
        Browser["Navegador Web Moderno (Chrome / Safari / Firefox)"]
        SPABundle["Frontend SPA: React 18 + TypeScript + Tailwind CSS\nModos: Claro / Oscuro / AMOLED"]
        Browser --> SPABundle
    end

    subgraph HostServer ["Servidor de Aplicación (Codespaces / Docker / Cloud VM)"]
        subgraph WebLayer ["Capa de Presentación Web (Puerto 5173 / 80)"]
            StaticServer["Servidor Web Vite / Nginx Proxy"]
        end

        subgraph APILayer ["Capa de Lógica de Negocio (Puerto 8000)"]
            Uvicorn["Servidor ASGI Uvicorn"]
            FastAPIEngine["FastAPI REST Application (SDD & OpenAPI)"]
            AuthModule["Módulo de Autenticación & JWT (HS256)"]
            DeskModule["Motor Multi-Tenant de Mesas & Catálogos"]
            BYOKModule["Bóveda BYOK Cifrada (AES-256-GCM / Fernet)"]
            AIGateway["Gateway Abstracción IA Saliente"]

            Uvicorn --> FastAPIEngine
            FastAPIEngine --> AuthModule
            FastAPIEngine --> DeskModule
            FastAPIEngine --> BYOKModule
            FastAPIEngine --> AIGateway
        end

        subgraph DataLayer ["Capa de Persistencia Relacional"]
            DB[(Base de Datos Relacional SQL\nSQLAlchemy ORM + SQLite WAL)]
            VaultStore["Almacén Cifrado de Credenciales"]
            ContextStore["Memoria Markdown 'Help Desk Context'"]

            DB --> VaultStore
            DB --> ContextStore
        end
    end

    subgraph ExternalAI ["Nubes Externas de Inteligencia Artificial (BYOK)"]
        GeminiNode["Google AI Studio (Gemini 2.0 Flash / 1.5 Flash)\nCosto $0 USD para la Plataforma"]
        OpenAINode["OpenAI API (GPT-4o Mini / GPT-4o)"]
        ClaudeNode["Anthropic Claude API (Claude 3.5 Sonnet / Haiku)"]
    end

    %% Conexiones
    SPABundle -- "HTTPS / JSON REST API (Puerto 8000)" --> Uvicorn
    DeskModule --> DB
    AuthModule --> DB
    BYOKModule --> VaultStore
    AIGateway -- "HTTPS TLS 1.3 (Outbound)" --> GeminiNode
    AIGateway -- "HTTPS TLS 1.3 (Outbound)" --> OpenAINode
    AIGateway -- "HTTPS TLS 1.3 (Outbound)" --> ClaudeNode
```

---

## 3. Especificación de Protocolos y Puertos

| Componente | Protocolo | Puerto Predeterminado | Propósito |
| :--- | :--- | :--- | :--- |
| **Frontend SPA** | HTTP/HTTPS | `5173` (Dev) / `80` (Prod) | Entrega de interfaz gráfica reactiva trimodal |
| **Backend REST API** | HTTP/HTTPS | `8000` | Endpoints de autenticación, gestión de mesas y bóveda |
| **OpenAPI / Swagger** | HTTP | `8000/api/docs` | Documentación interactiva de la API |
| **Persistencia SQL** | IPC / TCP | Local File / `5432` | Persistencia relacional de usuarios, mesas y contextos |
| **Google Gemini API** | HTTPS / TLS 1.3 | `443` | Inferencia BYOK y prueba de latencia milimétrica |
| **OpenAI / Claude API**| HTTPS / TLS 1.3 | `443` | Inferencia BYOK y categorización de casos |

---

## 4. Consideraciones de Seguridad en el Despliegue

1. **Aislamiento de Claves:** El backend no transmite las claves de API a clientes terceros. Las claves se validan contra el proveedor oficial y se guardan cifradas.
2. **Tokens Efímeros:** La autenticación utiliza JSON Web Tokens (JWT) con firma criptográfica simétrica y caducidad definida.
3. **Zero Ingress AI:** Los servidores de CaseFlow no reciben llamadas entrantes de los modelos de IA; toda la comunicación es estrictamente cliente-servidor saliente autenticada.
