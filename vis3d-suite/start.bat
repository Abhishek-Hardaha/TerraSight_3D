@echo off
title Vis-Sam-3D Suite Launcher
color 0b

echo =========================================================================
echo          VIS-SAM-3D SUITE -- PRODUCTION 3D RECONSTRUCTION
echo      Meta SAM 3D Objects + Dual GPU Kaggle Acceleration + Three.js
echo =========================================================================
echo.

cd /d "%~dp0frontend"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [!] node_modules not detected. Installing dependencies via npm...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed. Please check your Node.js installation.
        pause
        exit /b %errorlevel%
    )
)

echo [+] Starting Vis-Sam-3D Suite Web Studio on http://localhost:3000...
echo [+] Press Ctrl+C at any time to stop the server.
echo.

:: Open default browser after 2 seconds in background
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3000"

:: Start Next.js Development Server
npm run dev

pause
