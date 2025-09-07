@echo off
echo ========================================
echo Starting Admin System (Backend + Frontend)
echo ========================================
echo.

echo Step 1: Starting Admin Backend Server (Port 5001)...
echo.
cd "Admin\Backend"
start "Admin Backend" cmd /k "npm start"
echo Backend server starting in new window...
echo.

echo Step 2: Starting Admin Frontend Server (Port 3001)...
echo.
cd "..\Frontend"
start "Admin Frontend" cmd /k "npm run dev"
echo Frontend server starting in new window...
echo.

echo ========================================
echo Both servers are starting...
echo ========================================
echo.
echo Admin Backend: http://localhost:5001
echo Admin Frontend: http://localhost:3001
echo.
echo Wait for both servers to fully start before testing uploads.
echo.
pause
