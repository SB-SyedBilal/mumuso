@echo off
echo ============================================
echo  MUMUSO APP - Clean Build and Run Script
echo ============================================
echo.

echo [1/8] Killing any process on port 8081...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
echo Done.
echo.

echo [2/8] Stopping all Gradle daemons...
cd /d C:\Professional\mumuso\android
call gradlew.bat --stop 2>nul
echo Done.
echo.

echo [3/8] Cleaning node_modules and reinstalling...
cd /d C:\Professional\mumuso
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json
call npm install
echo Done.
echo.

echo [4/8] Cleaning ALL Gradle caches...
cd /d C:\Professional\mumuso\android
if exist ".gradle" rmdir /s /q .gradle
if exist "build" rmdir /s /q build
if exist "app\build" rmdir /s /q app\build
if exist "%USERPROFILE%\.gradle\daemon" rmdir /s /q "%USERPROFILE%\.gradle\daemon"
echo Done.
echo.

echo [5/8] Starting Metro bundler in background...
cd /d C:\Professional\mumuso
start "Metro Bundler" cmd /c "npx react-native start --reset-cache"
echo Waiting 15 seconds for Metro to start...
timeout /t 15 /nobreak >nul
echo Done.
echo.

echo [6/8] Building app with Gradle...
cd /d C:\Professional\mumuso\android
call gradlew.bat app:installDebug -PreactNativeDevServerPort=8081
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo BUILD FAILED! See errors above.
    pause
    exit /b 1
)
echo Done.
echo.

echo [7/8] Launching app on device...
cd /d C:\Professional\mumuso
adb shell am start -n com.mumuso/.MainActivity
echo Done.
echo.

echo ============================================
echo [8/8] App launched successfully!
echo ============================================
pause
