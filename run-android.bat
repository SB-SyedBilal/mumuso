@echo off
setlocal enabledelayedexpansion
title Mumuso - React Native Runner
color 0A

echo.
echo  ========================================================
echo        MUMUSO - React Native App Runner
echo  ========================================================
echo.

:: ============================================================
:: STEP 1: Set Environment Variables
:: ============================================================
echo  [1/6] Setting environment variables...

set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
set "ANDROID_HOME=C:\Users\PC\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\emulator;%PATH%"

echo        JAVA_HOME  = %JAVA_HOME%
echo        ANDROID_HOME = %ANDROID_HOME%
echo.

:: ============================================================
:: STEP 2: Check Java
:: ============================================================
echo  [2/6] Checking Java...

if not exist "%JAVA_HOME%\bin\java.exe" (
    echo        [FAIL] Java 17 not found at %JAVA_HOME%
    echo        Please install Eclipse Temurin JDK 17
    echo        Download: https://adoptium.net/temurin/releases/
    goto :error
)

for /f "tokens=3" %%v in ('^""%JAVA_HOME%\bin\java.exe" -version 2^>^&1^" ^| findstr /i "version"') do set JAVA_VER=%%v
echo        [OK] Java found: %JAVA_VER%
echo.

:: ============================================================
:: STEP 3: Check Android SDK
:: ============================================================
echo  [3/6] Checking Android SDK...

if not exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo        [FAIL] Android SDK platform-tools not found
    echo        Please install Android SDK
    goto :error
)
echo        [OK] ADB found

if not exist "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" (
    echo        [WARN] SDK Manager not found - cannot auto-install SDK components
) else (
    echo        [OK] SDK Manager found
    
    :: Check and install required SDK components
    echo.
    echo        Checking required SDK components...
    
    if not exist "%ANDROID_HOME%\platforms\android-36" (
        echo        [INSTALLING] platforms;android-36 ...
        call "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" "platforms;android-36" --sdk_root="%ANDROID_HOME%" < nul
    ) else (
        echo        [OK] platforms;android-36
    )
    
    if not exist "%ANDROID_HOME%\build-tools\36.0.0" (
        echo        [INSTALLING] build-tools;36.0.0 ...
        call "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" "build-tools;36.0.0" --sdk_root="%ANDROID_HOME%" < nul
    ) else (
        echo        [OK] build-tools;36.0.0
    )
    
    if not exist "%ANDROID_HOME%\ndk\27.1.12297006" (
        echo        [INSTALLING] ndk;27.1.12297006 ...
        call "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" "ndk;27.1.12297006" --sdk_root="%ANDROID_HOME%" < nul
    ) else (
        echo        [OK] ndk;27.1.12297006
    )
)
echo.

:: ============================================================
:: STEP 4: Check Connected Devices
:: ============================================================
echo  [4/6] Checking connected devices...

"%ANDROID_HOME%\platform-tools\adb.exe" start-server >nul 2>&1

set DEVICE_COUNT=0
for /f "skip=1 tokens=1,2" %%a in ('"%ANDROID_HOME%\platform-tools\adb.exe" devices') do (
    if not "%%a"=="" (
        set /a DEVICE_COUNT+=1
        if "%%b"=="device" (
            echo        [OK] Device connected: %%a
        ) else if "%%b"=="unauthorized" (
            echo        [WARN] Device %%a is UNAUTHORIZED
            echo        Please check your phone for USB debugging prompt
            echo        and tap "Allow"
        )
    )
)

if %DEVICE_COUNT%==0 (
    echo        [WARN] No devices connected!
    echo.
    echo        To run on a physical device:
    echo          1. Enable USB Debugging on your phone
    echo             Settings ^> About Phone ^> Tap Build Number 7 times
    echo             Settings ^> Developer Options ^> Enable USB Debugging
    echo          2. Connect your phone via USB cable
    echo          3. Tap "Allow" on the USB debugging prompt
    echo.
    set /p CONTINUE="        Continue anyway? (y/n): "
    if /i not "!CONTINUE!"=="y" goto :end
)
echo.

:: ============================================================
:: STEP 5: Clean and Build
:: ============================================================
echo  [5/6] Cleaning previous build...

cd /d "%~dp0android"
call gradlew.bat clean >nul 2>&1
cd /d "%~dp0"
echo        [OK] Build cleaned
echo.

:: ============================================================
:: STEP 6: Start Metro + Build App
:: ============================================================
echo  [6/6] Starting app...
echo.
echo  --------------------------------------------------------
echo   Starting Metro bundler in a new window...
echo   Then building and installing the app...
echo  --------------------------------------------------------
echo.

:: Start Metro in a new window
start "Mumuso Metro Bundler" cmd /k "set JAVA_HOME=%JAVA_HOME%&& set ANDROID_HOME=%ANDROID_HOME%&& set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%&& cd /d %~dp0 && npx react-native start"

:: Wait for Metro to start
echo  Waiting for Metro bundler to start...
timeout /t 5 /nobreak >nul

:: Run the app
echo  Building and installing app on device...
echo.
npx react-native run-android

if %ERRORLEVEL%==0 (
    echo.
    echo  ========================================================
    echo        APP LAUNCHED SUCCESSFULLY!
    echo  ========================================================
    echo.
) else (
    echo.
    echo  ========================================================
    echo        BUILD FAILED - Check errors above
    echo  ========================================================
    echo.
    echo  Common fixes:
    echo    - Make sure USB Debugging is enabled
    echo    - Try: cd android ^&^& gradlew clean ^&^& cd ..
    echo    - Check that your phone is connected and authorized
    echo.
)

goto :end

:error
echo.
echo  ========================================================
echo        SETUP INCOMPLETE - Fix the issues above
echo  ========================================================
echo.

:end
pause
endlocal
