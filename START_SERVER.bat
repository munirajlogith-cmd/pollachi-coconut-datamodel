@echo off
title Pollachi Coconut Agro-Analytics System
color 0A
cls
cd /d "%~dp0"

echo ===============================================================
echo     POLLACHI COCONUT AGRO-ANALYTICS PORTAL - ONE-CLICK LAUNCH
echo ===============================================================
echo.
echo  [+] Local Server : http://localhost:5000
echo  [+] Student Login: student  ^|  Password: student123
echo  [+] Browser will open automatically when server starts.
echo.
echo  Keep this black window OPEN while using the website.
echo  To stop the server, simply close this window.
echo ===============================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo  [*] Starting Node.js Dynamic Server (server.js)...
    node server.js
    goto :end
)

if exist "D:\node.exe" (
    echo  [*] Starting Node.js at D:\node.exe (server.js)...
    "D:\node.exe" server.js
    goto :end
)

:: 2. Check Python fallback
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo  [*] Starting Python Server (server.py)...
    python server.py
    goto :end
)

if exist "C:\Users\KISHORE\AppData\Local\Programs\Python\Python315\python.exe" (
    echo  [*] Starting Python fallback server...
    "C:\Users\KISHORE\AppData\Local\Programs\Python\Python315\python.exe" server.py
    goto :end
)

:: 3. Static fallback
echo  [!] No server runtime detected in PATH.
echo  [*] Opening standalone dashboard directly in your browser...
start "" "%~dp0index.html"

:end
echo.
echo Server stopped.
pause
