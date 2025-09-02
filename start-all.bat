@echo off
echo ========================================
echo AI-PSM Study Material System
echo Local Development Startup Script
echo ========================================
echo.

echo Starting all services locally...
echo.

echo [1/4] Starting Main Backend...
cd Backend
start "Main Backend" cmd /k "npm install && npm run dev"
cd ..

echo [2/4] Starting Admin Backend...
cd Admin\Backend
start "Admin Backend" cmd /k "npm install && npm run dev"
cd ..\..

echo [3/4] Starting Main Frontend...
cd Frontend
start "Main Frontend" cmd /k "npm install && npm run dev"
cd ..

echo [4/4] Starting Admin Frontend...
cd Admin\Frontend
start "Admin Frontend" cmd /k "npm install && npm run dev"
cd ..\..

echo.
echo ========================================
echo All services are starting...
echo.
echo Main Backend: http://localhost:5000
echo Admin Backend: http://localhost:5001
echo Main Frontend: http://localhost:5173
echo Admin Frontend: http://localhost:5174
echo.
echo Press any key to exit...
pause > nul
