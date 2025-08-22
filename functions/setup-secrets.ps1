# PowerShell script to set up Firebase Secrets for production
# Run this from Windows PowerShell in the functions directory

Write-Host "Setting up Firebase Secrets for production..." -ForegroundColor Cyan

# Set the API keys as Firebase Secrets
Write-Host "Setting ESV_KEY..." -ForegroundColor Yellow
firebase functions:secrets:set ESV_KEY

Write-Host "Setting NLT_KEY..." -ForegroundColor Yellow
firebase functions:secrets:set NLT_KEY

Write-Host "Setting SCRIPTURE_KEY..." -ForegroundColor Yellow
firebase functions:secrets:set SCRIPTURE_KEY

Write-Host "`nSecrets configured! Now deploying functions..." -ForegroundColor Green

# Deploy the functions
firebase deploy --only functions

Write-Host "`nDeployment complete!" -ForegroundColor Green