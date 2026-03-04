@echo off
echo ========================================
echo Mumuso Admin Dashboard - Installation
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo.
echo [2/3] Checking environment configuration...
if not exist .env.local (
    echo WARNING: .env.local not found
    echo Creating .env.local with default settings...
    echo NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 > .env.local
    echo Created .env.local
) else (
    echo .env.local already exists
)

echo.
echo [3/3] Verifying installation...
call npm run type-check

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure the backend is running on http://localhost:3000
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
echo For more information, see SETUP.md
echo.
pause
