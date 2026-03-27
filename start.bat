@echo off
title AccountingPulse
echo Starting AccountingPulse...
echo.
echo Backend: http://localhost:4000
echo Frontend: http://accountingpulse.local
echo.
start "AP-Backend" cmd /c "cd /d %~dp0 && node server/index.js"
timeout /t 3 /noq >nul
start "AP-Frontend" cmd /c "cd /d %~dp0 && npx vite"
echo.
echo Both servers starting. Open http://accountingpulse.local in Chrome.
echo.
pause
