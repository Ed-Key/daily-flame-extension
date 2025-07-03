# Daily Flame - Production Deployment Checklist

## Pre-Deployment Steps

### 1. Code Preparation
- [ ] Remove all `console.log` statements (except critical error logging)
- [ ] Ensure all API keys are properly secured
- [ ] Run `npm run build` to create production build
- [ ] Test the production build locally as unpacked extension

### 2. Google OAuth Configuration for Production
- [ ] **Before Publishing**: Note down your development extension ID
- [ ] **After Publishing**: Get your permanent Chrome Web Store extension ID
- [ ] **Update Google Cloud Console**:
  - Go to APIs & Services → Credentials
  - Edit your OAuth 2.0 Client ID
  - Add production redirect URI: `https://CHROME_STORE_EXTENSION_ID.chromiumapp.org/`
  - Keep the development URI for testing
  - Save and wait 5-30 minutes for propagation

## Chrome Web Store Publishing

### 1. Prepare Store Assets
- [ ] Create extension icons (128x128, 48x48, 16x16 PNG files)
- [ ] Take 5 screenshots (1280x800 or 640x400)
- [ ] Write compelling store description
- [ ] Create promotional images if needed

### 2. Package Extension
- [ ] Create a ZIP file containing:
  - `manifest.json`
  - `background.js`
  - `content.js`
  - `verse-app.js` (and any .map files)
  - All other built files from `dist/`
  - Do NOT include `node_modules/`, `src/`, or development files

### 3. Chrome Web Store Developer Dashboard
- [ ] Go to https://chrome.google.com/webstore/devconsole
- [ ] Pay one-time developer fee ($5) if not already done
- [ ] Click "New Item"
- [ ] Upload your ZIP file
- [ ] Fill in all required fields:
  - Detailed description
  - Category (likely "Productivity" or "Lifestyle")
  - Language
  - Screenshots
  - Privacy policy (required for extensions using auth)

### 4. Privacy Policy Requirements
Since you use Google OAuth, you need:
- [ ] Create a privacy policy explaining:
  - What data you collect (email, profile info)
  - How you use it (authentication only)
  - That you don't share/sell data
  - How users can delete their account
- [ ] Host it somewhere (GitHub Pages, Google Sites, etc.)
- [ ] Add the URL to your store listing

## Post-Publishing Steps

### 1. Update OAuth Configuration
- [ ] Once published, get your permanent extension ID from the store
- [ ] Go back to Google Cloud Console
- [ ] Add the new production redirect URI
- [ ] Test Google Sign-In with the published version

### 2. Monitor Initial Launch
- [ ] Check Chrome Web Store developer dashboard for:
  - Installation counts
  - User reviews
  - Crash reports
- [ ] Be ready to push quick fixes if needed

## Important Notes for Production

### API Keys & Security
- Your Firebase config is client-side (this is normal)
- Ensure Firebase Security Rules are properly configured
- Set up domain restrictions in Google Cloud Console

### Version Management
- Use semantic versioning (1.0.0, 1.0.1, etc.)
- Update version in `manifest.json` for each release
- Keep a CHANGELOG.md file

### Testing Checklist Before Each Release
- [ ] Test on fresh Chrome profile
- [ ] Test sign up flow
- [ ] Test sign in flow
- [ ] Test Google OAuth
- [ ] Test verse display and animations
- [ ] Test "More" button functionality
- [ ] Test on different screen sizes
- [ ] Verify daily verse only shows once per day
- [ ] Test temporary vs permanent dismissal

### Quick Fixes That Don't Require Republishing
- Firebase Security Rules
- Backend API changes
- Verse content updates

### Changes That Require Republishing
- Any JavaScript changes
- Manifest.json updates
- New permissions
- UI/UX changes

## Rollback Plan
- [ ] Keep previous version ZIP files
- [ ] Document what changed in each version
- [ ] Have a plan to revert if critical issues found

## Future Considerations
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Add analytics to understand usage
- [ ] Plan for handling user feedback
- [ ] Consider beta testing channel