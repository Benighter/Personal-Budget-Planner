# Budget Tracker Pro - Complete APK Build Script
# Builds a debug APK installable via: adb install BudgetTrackerPro-debug.apk
#
# Requirements fulfilled automatically:
#   - Downloads Android SDK command-line tools (~130MB)
#   - Installs: platform android-35, build-tools 35.0.0, platform-tools (adb)
#   - Java 17+ must be installed (detected automatically)
#
# Usage: Right-click -> Run with PowerShell  OR  .\build-debug-apk.ps1
# ADB install: adb install android\app\build\outputs\apk\debug\app-debug.apk

$ErrorActionPreference = "Continue"   # Don't stop on native stderr output
$ScriptDir = $PSScriptRoot

# ── Helpers ──────────────────────────────────────────────────────────────────
function Write-Step($msg) { Write-Host "`n>>> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    OK: $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "`nERROR: $msg" -ForegroundColor Red; exit 1 }
function Invoke-Checked {
    param([string]$Cmd, [string[]]$Args, [string]$ErrMsg)
    & $Cmd @Args
    if ($LASTEXITCODE -ne 0) { Write-Fail $ErrMsg }
}

# ── 1. Detect Java ────────────────────────────────────────────────────────────
Write-Step "Detecting Java installation"

$javaCmd = $null
$knownJavaHomes = @(
    "C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot",
    "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot",
    "C:\Program Files\Java\jdk-17",
    "C:\Program Files\Java\jdk-21"
)

foreach ($jh in $knownJavaHomes) {
    if (Test-Path "$jh\bin\java.exe") {
        $env:JAVA_HOME = $jh
        $javaCmd = "$jh\bin\java.exe"
        break
    }
}

if (-not $javaCmd) {
    $javaCmdObj = Get-Command java -ErrorAction SilentlyContinue
    if ($javaCmdObj) {
        $javaCmd = $javaCmdObj.Source
        $env:JAVA_HOME = (Split-Path (Split-Path $javaCmd))
    }
}

if (-not $javaCmd -or -not (Test-Path $javaCmd)) {
    Write-Fail "Java not found. Install JDK 17+ from https://adoptium.net/ then re-run."
}
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$javaVer = (& "$javaCmd" -version 2>&1)[0]
Write-OK "Java found at $env:JAVA_HOME  ($javaVer)"

# ── 2. Android SDK setup ──────────────────────────────────────────────────────
Write-Step "Setting up Android SDK"

$SDK_DIR      = "$ScriptDir\android-sdk"
$TOOLS_DIR    = "$SDK_DIR\cmdline-tools\latest"
$SDKMANAGER   = "$TOOLS_DIR\bin\sdkmanager.bat"
$TOOLS_URL    = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$TOOLS_ZIP    = "$ScriptDir\cmdline-tools-win.zip"

$env:ANDROID_HOME     = $SDK_DIR
$env:ANDROID_SDK_ROOT = $SDK_DIR
$env:PATH             = "$SDK_DIR\platform-tools;$TOOLS_DIR\bin;$env:PATH"

if (-not (Test-Path $SDKMANAGER)) {
    Write-Host "    Downloading Android command-line tools (~130MB)..."
    Write-Host "    URL: $TOOLS_URL"
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $TOOLS_URL -OutFile $TOOLS_ZIP -UseBasicParsing
        $ProgressPreference = 'Continue'
    } catch {
        Write-Fail "Download failed: $_`n`nDownload manually from https://developer.android.com/studio#command-tools`nExtract to: $TOOLS_DIR"
    }

    Write-Host "    Extracting..."
    $tempDir = "$ScriptDir\cmdline-tools-temp"
    if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
    Expand-Archive -Path $TOOLS_ZIP -DestinationPath $tempDir -Force

    New-Item -ItemType Directory -Path $TOOLS_DIR -Force | Out-Null
    Get-ChildItem "$tempDir\cmdline-tools" | Move-Item -Destination $TOOLS_DIR -Force
    Remove-Item $tempDir -Recurse -Force
    Remove-Item $TOOLS_ZIP -Force -ErrorAction SilentlyContinue
    Write-OK "Command-line tools ready"
} else {
    Write-OK "Command-line tools already present"
}

# ── 3. Accept licenses & install SDK components ───────────────────────────────
Write-Step "Installing Android SDK components (may take a few minutes)"

# Accept all licenses non-interactively
"y`ny`ny`ny`ny`ny`ny`ny`n" | & $SDKMANAGER --licenses 2>&1 | Where-Object { $_ -match "Licensed|accepted" } | ForEach-Object { Write-Host "    $_" }
$components = @(
    "platforms;android-35",
    "build-tools;35.0.0",
    "platform-tools"
)

foreach ($comp in $components) {
    $compPath = "$SDK_DIR\$($comp -replace ';', '\')"
    if (-not (Test-Path $compPath)) {
        Write-Host "    Installing $comp ..."
        "y" | & $SDKMANAGER $comp 2>&1 | Where-Object { $_ -match "Unzip|Install|done" } | ForEach-Object { Write-Host "    $_" }
        Write-OK "Installed $comp"
    } else {
        Write-OK "Already installed: $comp"
    }
}

# ── 4. Write android/local.properties ─────────────────────────────────────────
Write-Step "Configuring Android project"

# Java Properties format: use forward slashes (no escaping needed)
$sdkPathForward = $SDK_DIR -replace '\\', '/'
Set-Content -Path "$ScriptDir\android\local.properties" -Value "sdk.dir=$sdkPathForward"
Write-OK "Written android/local.properties"

# ── 5. Build web app ──────────────────────────────────────────────────────────
Write-Step "Building web app (pnpm build)"

Set-Location $ScriptDir

# Prefer pnpm if available, fall back to npm
$pkgManager = if (Get-Command pnpm -ErrorAction SilentlyContinue) { "pnpm" } else { "npm" }
Write-Host "    Using $pkgManager"

& $pkgManager run build
if ($LASTEXITCODE -ne 0) { Write-Fail "Web build failed" }
Write-OK "Web app built -> dist/"

# ── 6. Capacitor sync ─────────────────────────────────────────────────────────
Write-Step "Syncing Capacitor assets to Android project"

& npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Fail "cap sync failed" }
Write-OK "Capacitor sync complete"

# ── 7. Gradle: build debug APK ────────────────────────────────────────────────
Write-Step "Building debug APK (Gradle assembleDebug)"

Set-Location "$ScriptDir\android"

# Ensure gradle wrapper is executable  
& cmd /c "gradlew.bat assembleDebug"
if ($LASTEXITCODE -ne 0) {
    Set-Location $ScriptDir
    Write-Fail "Gradle build failed. Check output above for details."
}

Set-Location $ScriptDir

# ── 8. Locate & copy APK ──────────────────────────────────────────────────────
Write-Step "Finalizing"

$apkSource = "android\app\build\outputs\apk\debug\app-debug.apk"
$apkDest   = "$ScriptDir\BudgetTrackerPro-debug.apk"

if (-not (Test-Path $apkSource)) {
    Write-Fail "APK not found at expected path: $apkSource"
}

Copy-Item $apkSource $apkDest -Force
$apkSize = [math]::Round((Get-Item $apkDest).Length / 1MB, 1)

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  APK BUILD SUCCESSFUL!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  APK: $apkDest  ($apkSize MB)" -ForegroundColor White
Write-Host ""
Write-Host "  Install via ADB:" -ForegroundColor Yellow
Write-Host "    adb install BudgetTrackerPro-debug.apk" -ForegroundColor White
Write-Host ""
Write-Host "  Or with ADB from this script's folder (adb is now at):" -ForegroundColor Yellow
Write-Host "    $SDK_DIR\platform-tools\adb.exe install BudgetTrackerPro-debug.apk" -ForegroundColor White
Write-Host ""
Write-Host "  Enable USB Debugging on your phone first:" -ForegroundColor Yellow
Write-Host "    Settings > About Phone > tap Build Number 7x" -ForegroundColor White
Write-Host "    Settings > Developer Options > USB Debugging ON" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
