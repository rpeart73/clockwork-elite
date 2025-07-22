@echo off
echo Clockwork Elite - Force Refresh Tool
echo =====================================
echo.
echo This will open Clockwork Elite with cache completely bypassed.
echo.
echo Clearing DNS cache...
ipconfig /flushdns > nul 2>&1

echo Opening Clockwork Elite with cache bypass...
echo.

:: Generate unique timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt%"

:: Open in default browser with cache-busting parameters
start "" "https://rpeart73.github.io/clockwork-elite/?cachebust=%timestamp%&verify=true"

echo.
echo Browser opened! The page will:
echo 1. Load with cache completely bypassed
echo 2. Automatically verify all features are updated
echo 3. Show you a report of what version you have
echo.
echo If you still see old content:
echo - Press Ctrl+F5 in the browser
echo - Or use the "Clear Cache" button on the page
echo.
pause