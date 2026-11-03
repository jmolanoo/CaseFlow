#!/bin/bash
# ==============================================================================
# CaseFlow — Script de Arranque para Entornos de Desarrollo / GitHub Codespaces
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=================================================="
echo "⚡ Iniciando CaseFlow (Plataforma Help Desk Multi-Tenant)"
echo "   Docente Supervisor: Eduardo Martínez Vidal"
echo "   Desarrollado por: Danna Nerieth Palencia & Jairo Molano"
echo "=================================================="

# 1. Iniciar Backend FastAPI en segundo plano
echo "🚀 [1/2] Iniciando Backend REST API en puerto 8000..."
cd "$DIR/backend"
if [ ! -d "venv" ]; then
    echo "Configurando entorno virtual backend..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 2. Iniciar Frontend Vite SPA
echo "🎨 [2/2] Iniciando Frontend SPA (React + TypeScript) en puerto 5173..."
cd "$DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "Instalando paquetes npm..."
    npm install
fi

# Trap para matar procesos al presionar Ctrl+C
trap "kill $BACKEND_PID 2>/dev/null || true; exit 0" INT TERM

npm run dev -- --host 0.0.0.0 --port 5173

wait $BACKEND_PID
