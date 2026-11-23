@echo off
title XUPERTV - Iniciar Todo (Proxy + App Web)
echo ========================================================
echo        INICIANDO XUPERTV (PROXY 8080 + VITE WEB 5173)
echo ========================================================
echo.

:: 1. Iniciar el Proxy de Canales en una ventana independiente
echo [*] Abriendo el Proxy de Canales en segundo plano...
start "XUPERTV - Proxy Local (Puerto 8080)" cmd /k "cd /d C:\EL FIN DE UNA ERA && python stream_proxy.py"

:: 2. Iniciar la App Web en el puerto 5173
echo [*] Iniciando servidor web de XUPERTV en http://localhost:5173 ...
cd /d "C:\XUPERTV"
npm run dev

pause
