@echo off

:: Install npm packages
echo Installing npm packages...
call npm install

:: Check if npm install was successful
if %errorlevel% neq 0 (
    echo npm install failed, exiting...
    exit /b %errorlevel%
)

:: Run the build process
echo Building the project...
call npm run build

:: Check if the build was successful
if %errorlevel% neq 0 (
    echo Build process failed, exiting...
    exit /b %errorlevel%
)

:: Check if the standalone build directory exists, if not, create it
if not exist ".\build\standalone\build" (
    mkdir ".\build\standalone\build"
)

:: Copy the static folder (Windows)
echo Copying the static folder...
xcopy /E /I ".\build\static" ".\build\standalone\build\static"

:: Check if the standalone directory exists, if not, create it
if not exist ".\build\standalone" (
    mkdir ".\build\standalone"
)

:: Copy the public folder (Windows)
echo Copying the public folder...
xcopy /E /I ".\public" ".\build\standalone\public"

echo Script executed successfully!
pause
