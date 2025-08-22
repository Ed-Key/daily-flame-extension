# PowerShell script to set up Firebase Secrets and deploy
# Run this from Windows PowerShell in the functions directory

Write-Host "Setting up Firebase Secrets for production..." -ForegroundColor Cyan
Write-Host "This will set your API keys as Firebase Secrets" -ForegroundColor Yellow

# Set the API keys as Firebase Secrets using echo to pipe the values
Write-Host "`nSetting ESV_KEY..." -ForegroundColor Yellow
echo "d74f42aa54c642a4cbfef2a93c5c67f460f13cdb" | firebase functions:secrets:set ESV_KEY

Write-Host "`nSetting NLT_KEY..." -ForegroundColor Yellow  
echo "d74333ee-8951-45dc-9925-5074a8ad2f07" | firebase functions:secrets:set NLT_KEY

Write-Host "`nSetting SCRIPTURE_KEY..." -ForegroundColor Yellow
echo "58410e50f19ea158ea4902e05191db02" | firebase functions:secrets:set SCRIPTURE_KEY

Write-Host "`n✅ Secrets configured!" -ForegroundColor Green
Write-Host "`nNow deploying functions..." -ForegroundColor Cyan

# Deploy the functions
firebase deploy --only functions

Write-Host "`n🎉 Deployment complete!" -ForegroundColor Green