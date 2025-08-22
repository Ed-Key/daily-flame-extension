# Firebase Functions Deployment Guide

## ✅ Configuration Fixed

The Firebase Functions have been updated to use environment variables instead of the deprecated `functions.config()`.

## 🚀 Deployment Steps (Windows PowerShell)

### Step 1: Open PowerShell as Administrator
1. Press `Win + X` and select "Windows PowerShell (Admin)"
2. Navigate to the functions directory:
   ```powershell
   cd C:\Users\EdKib\DailyFlame\functions
   ```

### Step 2: Set up Firebase Secrets (First Time Only)

You need to set up the API keys as Firebase Secrets. Run these commands one by one:

```powershell
# Set ESV API Key
firebase functions:secrets:set ESV_KEY
# When prompted, enter: d74f42aa54c642a4cbfef2a93c5c67f460f13cdb

# Set NLT API Key
firebase functions:secrets:set NLT_KEY
# When prompted, enter: d74333ee-8951-45dc-9925-5074a8ad2f07

# Set Scripture API Key
firebase functions:secrets:set SCRIPTURE_KEY
# When prompted, enter: 58410e50f19ea158ea4902e05191db02
```

**Alternative:** Run the provided script:
```powershell
.\setup-secrets.ps1
```

### Step 3: Deploy the Functions

```powershell
firebase deploy --only functions
```

## 📝 What Changed

1. **functions/index.js**: Updated to use `process.env` instead of `functions.config()`:
   - `functions.config().esv?.key` → `process.env.ESV_KEY`
   - `functions.config().nlt?.key` → `process.env.NLT_KEY`
   - `functions.config().scripture?.key` → `process.env.SCRIPTURE_KEY`

2. **functions/.env**: Created for local testing (not committed to git)

3. **functions/.gitignore**: Added `.env` to ignore list

## 🧪 Testing After Deployment

### Test Each API Function:

1. **ESV API Test**:
   - Open the extension
   - Select ESV translation
   - Verify verse loads correctly

2. **NLT API Test**:
   - Switch to NLT translation
   - Verify verse loads correctly

3. **KJV/ASV/WEB Test**:
   - Switch to each translation
   - Verify verses load correctly

4. **Preference Sync Test**:
   - Change translation preference
   - Sign out and sign back in
   - Verify preference persists

## 🔍 Troubleshooting

### If deployment fails:

1. **Check Node.js version**:
   ```powershell
   node --version
   ```
   Should be v20.x.x

2. **Check Firebase CLI**:
   ```powershell
   firebase --version
   ```
   Should be latest version

3. **Update Firebase CLI if needed**:
   ```powershell
   npm install -g firebase-tools
   ```

4. **Clear npm cache if module errors**:
   ```powershell
   cd functions
   Remove-Item node_modules -Recurse -Force
   Remove-Item package-lock.json -Force
   npm cache clean --force
   npm install
   ```

### If API calls fail after deployment:

1. **Check secrets are set**:
   ```powershell
   firebase functions:secrets:access ESV_KEY
   firebase functions:secrets:access NLT_KEY
   firebase functions:secrets:access SCRIPTURE_KEY
   ```

2. **Check function logs**:
   ```powershell
   firebase functions:log
   ```

3. **Re-deploy specific function**:
   ```powershell
   firebase deploy --only functions:getESVPassage
   firebase deploy --only functions:getNLTPassage
   firebase deploy --only functions:getScripturePassage
   ```

## ✅ Success Indicators

- Deployment completes without errors
- Functions show as "Deployed" in Firebase Console
- All Bible translations load correctly in extension
- Preferences sync successfully
- No 500 errors in console

## 📌 Important Notes

- API keys are now stored as Firebase Secrets (secure)
- Local testing uses `.env` file (not committed to git)
- Production uses Firebase Secrets (encrypted)
- No API keys in code or config files