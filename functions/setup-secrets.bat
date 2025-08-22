@echo off
REM Batch script to set up Firebase Secrets for production
REM Run this from Windows Command Prompt in the functions directory

echo Setting up Firebase Secrets for production...

echo.
echo Setting ESV_KEY...
echo Enter value: d74f42aa54c642a4cbfef2a93c5c67f460f13cdb
firebase functions:secrets:set ESV_KEY

echo.
echo Setting NLT_KEY...
echo Enter value: d74333ee-8951-45dc-9925-5074a8ad2f07
firebase functions:secrets:set NLT_KEY

echo.
echo Setting SCRIPTURE_KEY...
echo Enter value: 58410e50f19ea158ea4902e05191db02
firebase functions:secrets:set SCRIPTURE_KEY

echo.
echo Secrets configured! Now deploying functions...
firebase deploy --only functions

echo.
echo Deployment complete!
pause