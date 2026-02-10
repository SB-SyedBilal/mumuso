# Quick Installation Script for Environment Variables
# Run this in PowerShell AS ADMINISTRATOR after installing JDK 17 and Android Studio

Write-Host "Setting up environment variables for React Native..." -ForegroundColor Green

# Get username
$username = $env:USERNAME

# Set JAVA_HOME (adjust path if JDK installed elsewhere)
$jdkPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
if (Test-Path $jdkPath) {
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkPath, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✓ JAVA_HOME set to: $jdkPath" -ForegroundColor Green
} else {
    Write-Host "✗ JDK 17 not found at: $jdkPath" -ForegroundColor Red
    Write-Host "  Please adjust the path in this script" -ForegroundColor Yellow
}

# Set ANDROID_HOME
$androidSdkPath = "C:\Users\$username\AppData\Local\Android\Sdk"
if (Test-Path $androidSdkPath) {
    [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "✓ ANDROID_HOME set to: $androidSdkPath" -ForegroundColor Green
} else {
    Write-Host "✗ Android SDK not found at: $androidSdkPath" -ForegroundColor Red
    Write-Host "  Install Android Studio first" -ForegroundColor Yellow
}

# Update PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)

$pathsToAdd = @(
    "%JAVA_HOME%\bin",
    "%ANDROID_HOME%\platform-tools",
    "%ANDROID_HOME%\emulator",
    "%ANDROID_HOME%\tools",
    "%ANDROID_HOME%\tools\bin"
)

foreach ($pathToAdd in $pathsToAdd) {
    if ($currentPath -notlike "*$pathToAdd*") {
        $currentPath += ";$pathToAdd"
    }
}

[System.Environment]::SetEnvironmentVariable("Path", $currentPath, [System.EnvironmentVariableTarget]::Machine)
Write-Host "✓ PATH updated with Android and Java tools" -ForegroundColor Green

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Environment variables configured!" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan
Write-Host "IMPORTANT: Restart your computer for changes to take effect!" -ForegroundColor Yellow
Write-Host "`nAfter restart, verify with:" -ForegroundColor White
Write-Host "  java -version" -ForegroundColor Gray
Write-Host "  echo `$env:ANDROID_HOME" -ForegroundColor Gray
Write-Host "  adb --version" -ForegroundColor Gray
