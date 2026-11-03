import time
import httpx
from typing import List, Dict, Tuple
from app.schemas import ModelOption

PROVIDER_MODELS: Dict[str, List[ModelOption]] = {
    "gemini": [
        ModelOption(id="gemini-2.0-flash", name="Gemini 2.0 Flash (Recomendado)", description="Ultrarrápido, latencia sub-segundo, generosa cuota gratuita."),
        ModelOption(id="gemini-1.5-flash", name="Gemini 1.5 Flash", description="Balance ideal entre velocidad y razonamiento para tickets."),
        ModelOption(id="gemini-1.5-pro", name="Gemini 1.5 Pro", description="Ventana de contexto ultra-extensa para análisis profundo de auditoría."),
    ],
    "openai": [
        ModelOption(id="gpt-4o-mini", name="GPT-4o Mini", description="Rápido, económico y de alta precisión para mesas de ayuda."),
        ModelOption(id="gpt-4o", name="GPT-4o", description="Máxima capacidad multimodal y razonamiento complejo."),
    ],
    "claude": [
        ModelOption(id="claude-3-5-haiku-20241022", name="Claude 3.5 Haiku", description="Respuesta instantánea para categorización y triaje."),
        ModelOption(id="claude-3-5-sonnet-20241022", name="Claude 3.5 Sonnet", description="Líder en síntesis contextual y diagnóstico técnico."),
    ],
}

async def test_ai_connection(provider: str, api_key: str, selected_model: str = None) -> Tuple[bool, float, str, List[ModelOption]]:
    start_time = time.time()
    available_models = PROVIDER_MODELS.get(provider, [])
    
    # Pre-validation for mock/test keys
    if api_key.startswith("test-") or api_key.startswith("demo-"):
        elapsed_ms = round((time.time() - start_time) * 1000 + 45, 1)
        return True, elapsed_ms, f"Conexión exitosa en modo simulado para {provider}", available_models

    timeout = httpx.Timeout(8.0, connect=5.0)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            if provider == "gemini":
                # Test connectivity with models endpoint
                url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
                resp = await client.get(url)
                elapsed_ms = round((time.time() - start_time) * 1000, 1)
                if resp.status_code == 200:
                    return True, elapsed_ms, "Conexión exitosa con Google AI Studio (Gemini)", available_models
                else:
                    err_msg = resp.json().get("error", {}).get("message", f"Error HTTP {resp.status_code}")
                    return False, elapsed_ms, f"Fallo al conectar con Gemini: {err_msg}", []

            elif provider == "openai":
                url = "https://api.openai.com/v1/models"
                headers = {"Authorization": f"Bearer {api_key}"}
                resp = await client.get(url, headers=headers)
                elapsed_ms = round((time.time() - start_time) * 1000, 1)
                if resp.status_code == 200:
                    return True, elapsed_ms, "Conexión exitosa con OpenAI API", available_models
                else:
                    err_msg = resp.json().get("error", {}).get("message", f"Error HTTP {resp.status_code}")
                    return False, elapsed_ms, f"Fallo al conectar con OpenAI: {err_msg}", []

            elif provider == "claude":
                url = "https://api.anthropic.com/v1/models"
                headers = {
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                }
                resp = await client.get(url, headers=headers)
                elapsed_ms = round((time.time() - start_time) * 1000, 1)
                if resp.status_code == 200:
                    return True, elapsed_ms, "Conexión exitosa con Anthropic Claude API", available_models
                else:
                    err_msg = resp.json().get("error", {}).get("message", f"Error HTTP {resp.status_code}")
                    return False, elapsed_ms, f"Fallo al conectar con Claude: {err_msg}", []

            else:
                return False, 0.0, f"Proveedor no soportado: {provider}", []

    except httpx.RequestError as exc:
        elapsed_ms = round((time.time() - start_time) * 1000, 1)
        return False, elapsed_ms, f"Error de red al conectar con {provider}: {str(exc)}", []
