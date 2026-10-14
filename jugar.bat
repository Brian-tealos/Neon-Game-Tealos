@echo off
title Neon Void: Rogue Survivor - Servidor Local
echo ====================================================
echo   INICIANDO NEON VOID: ROGUE SURVIVOR
echo ====================================================
echo Abriendo juego en tu navegador predeterminado...
start http://localhost:8000
echo.
echo Presiona Ctrl+C para detener el servidor cuando termines.
echo.
python -m http.server 8000
pause
