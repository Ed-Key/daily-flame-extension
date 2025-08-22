@echo off
REM Batch script to deploy auth-fixed Firebase Functions
REM Run this from Windows Command Prompt in the functions directory

echo.
echo ==========================================
echo    Firebase Functions Auth Fix Deployment
echo ==========================================
echo.

echo This script will:
echo 1. Deploy the updated functions with auth token verification
echo 2. Fix the 401 authentication errors
echo 3. Enable preference syncing
echo.

echo Deploying functions with auth fixes...
echo.

firebase deploy --only functions

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Deployment complete!
    echo.
    echo Next steps to test:
    echo 1. Open the Chrome extension
    echo 2. Sign in with your Google account
    echo 3. Change your Bible translation preference
    echo 4. Check the console - no more 401 errors!
    echo 5. Sign out and back in to verify preferences persist
) else (
    echo.
    echo ERROR: Deployment failed!
    echo Please check the error messages above
)

echo.
echo ==========================================
pause