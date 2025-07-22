@echo off
echo Creating Clockwork Elite shortcuts...
echo =====================================

:: Create shortcut on Desktop
set "shortcutPath=%USERPROFILE%\Desktop\Clockwork Elite - Push Changes.lnk"
set "targetPath=%CD%\auto-push.bat"
set "workingDir=%CD%"

powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%shortcutPath%'); $Shortcut.TargetPath = '%targetPath%'; $Shortcut.WorkingDirectory = '%workingDir%'; $Shortcut.IconLocation = 'shell32.dll,13'; $Shortcut.Description = 'Push Clockwork Elite changes to GitHub Pages'; $Shortcut.Save()"

:: Create shortcut to open folder
set "folderShortcut=%USERPROFILE%\Desktop\Clockwork Elite - Project Folder.lnk"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%folderShortcut%'); $Shortcut.TargetPath = '%CD%'; $Shortcut.IconLocation = 'shell32.dll,3'; $Shortcut.Description = 'Open Clockwork Elite project folder'; $Shortcut.Save()"

:: Create shortcut to open VS Code (if available)
where code >nul 2>nul
if %errorlevel% == 0 (
    set "vscodeShortcut=%USERPROFILE%\Desktop\Clockwork Elite - Edit Code.lnk"
    powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%vscodeShortcut%'); $Shortcut.TargetPath = 'code'; $Shortcut.Arguments = '%CD%'; $Shortcut.WorkingDirectory = '%CD%'; $Shortcut.IconLocation = 'shell32.dll,270'; $Shortcut.Description = 'Edit Clockwork Elite in VS Code'; $Shortcut.Save()"
    echo ✅ VS Code shortcut created
)

echo.
echo ✅ Desktop shortcuts created:
echo    📤 Clockwork Elite - Push Changes.lnk
echo    📁 Clockwork Elite - Project Folder.lnk
if exist "%USERPROFILE%\Desktop\Clockwork Elite - Edit Code.lnk" echo    📝 Clockwork Elite - Edit Code.lnk

echo.
echo 🎉 Setup complete! You can now:
echo    • Double-click "Push Changes" to update your site
echo    • Double-click "Project Folder" to open the project
echo    • Use the 📤 Push Changes button in the web app
echo.
pause