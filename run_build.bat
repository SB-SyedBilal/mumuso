@echo off
cd /d "C:\Professional\mumuso\android"
echo Starting build at %TIME% > build.log 2>&1
call gradlew.bat assembleDebug --stacktrace >> build.log 2>&1
echo Build finished with exit code %ERRORLEVEL% at %TIME% >> build.log 2>&1
echo %ERRORLEVEL% > exitcode.txt
