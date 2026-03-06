@echo off
echo Launching APK build script...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-debug-apk.ps1"
pause
