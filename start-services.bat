@echo off
echo Starting iBotTester services...
echo.

REM Start PostgreSQL if not running
echo [1/3] Checking PostgreSQL...
docker-compose up -d postgres
timeout /t 3 /nobreak > nul

REM Start Backend
echo [2/3] Starting Backend API...
cd apps\backend
start "iBotTester Backend" cmd /k "npm run dev"
cd ..\..

REM Wait a moment for backend to start
timeout /t 5 /nobreak > nul

REM Start Frontend
echo [3/3] Starting Frontend...
cd apps\frontend
start "iBotTester Frontend" cmd /k "npm run dev"
cd ..\..

echo.
echo ====================================
echo   iBotTester Services Started!
echo ====================================
echo.
echo  PostgreSQL: http://localhost:5432
echo  Backend API: http://localhost:3001
echo  Frontend: http://localhost:3000
echo.
echo Press any key to run connection test...
pause > nul

REM Run connection test
node test-connections.js
