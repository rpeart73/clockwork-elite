@echo off
:: This opens a command prompt in the project directory
cd /d "C:\Users\raymo\projects\clockwork-elite"
start cmd /k "echo Clockwork Elite Terminal Ready && echo. && echo Commands to push changes: && echo git add index.html && echo git commit -m \"Your message here\" && echo git push && echo. && echo Type the commands above or run: auto-push.bat && echo."