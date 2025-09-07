@echo off
echo Starting Admin Backend Server...
echo.
echo This will start the admin backend server on port 5001
echo Make sure MongoDB is running before starting this server
echo.
cd "Admin\Backend"
echo Current directory: %CD%
echo.
echo Installing dependencies if needed...
call npm install
echo.
echo Starting server...
call npm start
pause
