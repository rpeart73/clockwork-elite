@echo off
echo Clockwork Elite Auto-Push Script
echo ================================

:: Check if we're in the right directory
if not exist "index.html" (
    echo Error: index.html not found. Make sure you're running this from the clockwork-elite directory.
    pause
    exit /b 1
)

:: Get current timestamp for commit message
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a:%%b
set timestamp=%mydate% %mytime%

:: Check git status
echo.
echo Checking git status...
git status

:: Ask for confirmation
echo.
set /p confirm=Do you want to push changes to GitHub Pages? (y/n): 
if /i not "%confirm%"=="y" (
    echo Push cancelled.
    pause
    exit /b 0
)

:: Ask for commit message
echo.
set /p message=Enter commit message (or press Enter for auto message): 

:: Use auto message if none provided
if "%message%"=="" (
    set "message=Auto-update Clockwork Elite - %timestamp%"
)

:: Add, commit, and push
echo.
echo Adding files...
git add index.html

echo Committing changes...
git commit -m "%message%

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo Pushing to GitHub...
git push

echo.
echo ✅ Changes pushed successfully!
echo Your site will be updated at: https://rpeart73.github.io/clockwork-elite/
echo It may take 1-5 minutes for changes to appear.

pause