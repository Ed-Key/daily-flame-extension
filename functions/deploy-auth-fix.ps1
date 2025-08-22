# PowerShell script to deploy auth-fixed Firebase Functions
# Run this from Windows PowerShell in the functions directory

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "   Firebase Functions Auth Fix Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`nThis script will:" -ForegroundColor Yellow
Write-Host "1. Deploy the updated functions with auth token verification" -ForegroundColor White
Write-Host "2. Fix the 401 authentication errors" -ForegroundColor White
Write-Host "3. Enable preference syncing" -ForegroundColor White

Write-Host "`n📦 Deploying functions with auth fixes..." -ForegroundColor Cyan

# Deploy the functions
firebase deploy --only functions

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    Write-Host "`n🧪 Next steps to test:" -ForegroundColor Yellow
    Write-Host "1. Open the Chrome extension" -ForegroundColor White
    Write-Host "2. Sign in with your Google account" -ForegroundColor White
    Write-Host "3. Change your Bible translation preference" -ForegroundColor White
    Write-Host "4. Check the console - no more 401 errors!" -ForegroundColor White
    Write-Host "5. Sign out and back in to verify preferences persist" -ForegroundColor White
} else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
}

Write-Host "`n==========================================" -ForegroundColor Cyan
pause