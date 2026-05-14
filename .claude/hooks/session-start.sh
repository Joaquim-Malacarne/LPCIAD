#!/bin/bash
set -euo pipefail

# Only run in remote (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-/home/user/LPCIAD}"
FRONTEND_DIR="$PROJECT_DIR/frontend/LPCIAD_Web"
BACKEND_DIR="$PROJECT_DIR/backend/LPCIAD.WebApi"
PUBLISH_DIR="$BACKEND_DIR/publish"

# --- Frontend: install npm dependencies ---
echo "[setup] Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install --prefer-offline 2>&1 | tail -3

# --- Backend: build via Docker .NET SDK if not already built ---
if [ ! -f "$PUBLISH_DIR/LPCIAD.WebApi.dll" ]; then
  echo "[setup] Building backend (.NET 8)..."
  sudo dockerd --host unix:///var/run/docker.sock &>/tmp/dockerd.log &
  sleep 4

  docker run --rm --network=host \
    -v /etc/ssl/certs:/etc/ssl/certs:ro \
    -v "$BACKEND_DIR:/src" \
    -v /tmp/nuget-packages:/root/.nuget/packages \
    -w /src \
    mcr.microsoft.com/dotnet/sdk:8.0 \
    bash -c "dotnet restore LPCIAD.WebApi.csproj && dotnet publish LPCIAD.WebApi.csproj -c Release -o /src/publish"

  mkdir -p "$PUBLISH_DIR/Posts"
  echo "[setup] Backend build complete."
else
  echo "[setup] Backend already built, skipping."
  sudo dockerd --host unix:///var/run/docker.sock &>/tmp/dockerd.log &
  sleep 4
fi

# --- Start backend container ---
docker rm -f lpciad-backend 2>/dev/null || true
docker run -d --name lpciad-backend \
  --network=host \
  -e ASPNETCORE_ENVIRONMENT=Development \
  -e ASPNETCORE_URLS=http://+:5136 \
  -e JWT__Secret="segredo-de-desenvolvimento-lpciad-32chars+" \
  -v "$PUBLISH_DIR:/app" \
  -w /app \
  mcr.microsoft.com/dotnet/aspnet:8.0 \
  dotnet LPCIAD.WebApi.dll

echo "[setup] Backend started on http://localhost:5136"

# --- Start frontend dev server ---
cd "$FRONTEND_DIR"
nohup /opt/node22/bin/npx ng serve --host 0.0.0.0 --port 4200 > /tmp/ng-serve.log 2>&1 &
echo "[setup] Frontend started on http://localhost:4200"

echo "[setup] Done! Access the app at http://localhost:4200"
