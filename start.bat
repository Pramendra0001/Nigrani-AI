@echo off
title Nigrani AI Launcher
echo ========================================================
echo    NIGRANI AI - Public Project Intelligence Platform
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "Nigrani AI Backend" cmd /k "cd /d %~dp0 && .\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
cd /d %~dp0frontend
start "Nigrani AI Frontend" cmd /k "npm run dev"

echo.
echo Nigrani AI services launched!
echo - Web Dashboard: http://localhost:5173
echo - API & Docs:    http://127.0.0.1:8000/docs
echo.
pause
