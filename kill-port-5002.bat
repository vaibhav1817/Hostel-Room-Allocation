@echo off
echo Stopping all Node.js processes on port 5002...
echo.

REM Find and display processes using port 5002
echo Finding processes on port 5002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002') do (
    echo Killing process %%a...
    taskkill /F /PID %%a 2>nul
)

echo.
echo Done! Port 5002 should now be free.
echo You can now run: npm run server
pause
