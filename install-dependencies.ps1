# Automated Installation Script for React Native Dependencies
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "React Native Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Create temp directory
$tempDir = "$env:TEMP\rn-setup"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Step 1: Install Java 17
Write-Host ""
Write-Host "[1/3] Installing Java 17 (Eclipse Temurin)..." -ForegroundColor Green
$jdkUrl = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jdk_x64_windows_hotspot_17.0.13_11.msi"
$jdkInstaller = "$tempDir\temurin17.msi"

Write-Host "  Downloading JDK 17..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkInstaller -UseBasicParsing
    Write-Host "  Download complete!" -ForegroundColor Green
    
    Write-Host "  Installing JDK 17..." -ForegroundColor Yellow
    $installArgs = "/i `"$jdkInstaller`" ADDLOCAL=FeatureMain,FeatureEnvironment,FeatureJarFileRunWith,FeatureJavaHome /quiet /norestart"
    Start-Process msiexec.exe -ArgumentList $installArgs -Wait
    Write-Host "  Java 17 installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "  Failed to install Java 17: $_" -ForegroundColor Red
}

# Step 2: Install Android Command Line Tools
Write-Host ""
Write-Host "[2/3] Installing Android SDK Command Line Tools..." -ForegroundColor Green
$androidSdkUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$androidZip = "$tempDir\cmdline-tools.zip"
$androidSdkPath = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"

Write-Host "  Downloading Android Command Line Tools..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $androidSdkUrl -OutFile $androidZip -UseBasicParsing
    Write-Host "  Download complete!" -ForegroundColor Green
    
    Write-Host "  Extracting..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "$androidSdkPath\cmdline-tools" | Out-Null
    Expand-Archive -Path $androidZip -DestinationPath "$androidSdkPath\cmdline-tools" -Force
    
    # Rename cmdline-tools folder to 'latest'
    if (Test-Path "$androidSdkPath\cmdline-tools\cmdline-tools") {
        Move-Item -Path "$androidSdkPath\cmdline-tools\cmdline-tools" -Destination "$androidSdkPath\cmdline-tools\latest" -Force
    }
    
    Write-Host "  Android Command Line Tools installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "  Failed to install Android tools: $_" -ForegroundColor Red
}

# Step 3: Install Android SDK Components
Write-Host ""
Write-Host "[3/3] Installing Android SDK Components..." -ForegroundColor Green
$sdkmanager = "$androidSdkPath\cmdline-tools\latest\bin\sdkmanager.bat"

if (Test-Path $sdkmanager) {
    Write-Host "  Installing platform-tools, build-tools, and platforms..." -ForegroundColor Yellow
    
    # Accept licenses automatically
    $yesInput = "y`ny`ny`ny`ny`ny`ny`ny`n"
    $yesInput | & $sdkmanager --licenses --sdk_root="$androidSdkPath" 2>&1 | Out-Null
    
    # Install required components
    & $sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" --sdk_root="$androidSdkPath"
    
    Write-Host "  Android SDK components installed successfully!" -ForegroundColor Green
} else {
    Write-Host "  SDK Manager not found!" -ForegroundColor Red
}

# Step 4: Set Environment Variables
Write-Host ""
Write-Host "[4/4] Setting Environment Variables..." -ForegroundColor Green

# Set JAVA_HOME
$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot"
if (Test-Path $javaHome) {
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, [System.EnvironmentVariableTarget]::Machine)
    Write-Host "  JAVA_HOME set to: $javaHome" -ForegroundColor Green
} else {
    # Try to find JDK 17 installation
    $adoptiumPath = "C:\Program Files\Eclipse Adoptium"
    if (Test-Path $adoptiumPath) {
        $jdkPath = Get-ChildItem $adoptiumPath -Directory | Where-Object { $_.Name -like "jdk-17*" } | Select-Object -First 1
        if ($jdkPath) {
            [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkPath.FullName, [System.EnvironmentVariableTarget]::Machine)
            Write-Host "  JAVA_HOME set to: $($jdkPath.FullName)" -ForegroundColor Green
        } else {
            Write-Host "  Could not find JDK 17 installation" -ForegroundColor Red
        }
    }
}

# Set ANDROID_HOME
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, [System.EnvironmentVariableTarget]::Machine)
Write-Host "  ANDROID_HOME set to: $androidSdkPath" -ForegroundColor Green

# Update PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)
$pathsToAdd = @(
    "%JAVA_HOME%\bin",
    "%ANDROID_HOME%\platform-tools",
    "%ANDROID_HOME%\cmdline-tools\latest\bin",
    "%ANDROID_HOME%\emulator"
)

foreach ($pathToAdd in $pathsToAdd) {
    if ($currentPath -notlike "*$pathToAdd*") {
        $currentPath += ";$pathToAdd"
    }
}

[System.Environment]::SetEnvironmentVariable("Path", $currentPath, [System.EnvironmentVariableTarget]::Machine)
Write-Host "  PATH updated successfully!" -ForegroundColor Green

# Cleanup
Write-Host ""
Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "IMPORTANT: You must RESTART YOUR COMPUTER for changes to take effect!" -ForegroundColor Yellow
Write-Host ""
Write-Host "After restart, verify installation with:" -ForegroundColor White
Write-Host "  java -version" -ForegroundColor Gray
Write-Host "  adb --version" -ForegroundColor Gray
Write-Host '  $env:ANDROID_HOME' -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"
