# Firestore Setup Guide for DailyFlame

This guide explains how to set up Firestore for the DailyFlame Chrome Extension.

## Overview

DailyFlame now uses Firebase Firestore to store and serve daily Bible verses. This provides:
- Real-time updates without extension updates
- Scalability for future features (favorites, notes, sharing)
- Works when the repository is private
- Better performance (only fetches today's verse)

## Architecture

```
Chrome Extension → Firestore → Daily Verses
                ↓
         Default Hardcoded Verses (fallback)
```

## Setup Steps

### 1. Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your "daily-flame" project
3. Navigate to "Firestore Database" in the left menu
4. Click "Create Database"
5. Choose "Start in production mode"
6. Select your preferred location (e.g., us-central1)
7. Click "Enable"

### 2. Deploy Security Rules

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy the security rules
firebase deploy --only firestore:rules
```

### 3. Create Service Account for GitHub Actions

1. In Firebase Console, go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. In GitHub repository settings:
   - Go to Settings → Secrets and variables → Actions
   - Create a new secret named `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Paste the entire JSON content as the value

### 4. Test Verse Scraping to Firestore

```bash
# For local testing (place service account key in .github/scripts/)
cd .github/scripts
node scrape-verses.js

# Or use environment variable
export FIREBASE_SERVICE_ACCOUNT_KEY='<paste JSON here>'
node scrape-verses.js
```

This will scrape verses from YouVersion and upload them directly to Firestore.

### 5. Test the GitHub Action

1. Go to Actions tab in your GitHub repository
2. Select "Update Daily Verses" workflow
3. Click "Run workflow"
4. Choose "dry_run: false" to actually update Firestore
5. Monitor the workflow execution

## Firestore Structure

```
dailyVerses/ (collection)
├── 2025-07-09 (document)
│   ├── reference: "Mark 11:24"
│   ├── book: "Mark"
│   ├── chapter: 11
│   ├── verse: "24"
│   ├── bibleId: "de4e12af7f28f599-02"
│   ├── url: "https://bible.com/..."
│   ├── addedAt: <timestamp>
│   └── order: 1
├── 2025-07-10 (document)
│   └── ...
└── _metadata (document)
    ├── lastUpdated: "2025-07-08T..."
    ├── nextUpdate: "2025-10-01T..."
    ├── source: "YouVersion..."
    ├── totalDays: 90
    └── version: "1.0"
```

## Local Development

For local development without Firestore:
1. The extension will automatically fall back to default hardcoded verses

To test with Firestore locally:
1. The extension uses your Firebase config (already in code)
2. Firestore rules allow public read access
3. No additional setup needed for reading verses

## Troubleshooting

### Extension can't fetch verses
1. Check browser console for errors
2. Verify Firestore is enabled in Firebase Console
3. Check security rules are deployed
4. Ensure verses are migrated to Firestore

### GitHub Action fails
1. Verify `FIREBASE_SERVICE_ACCOUNT_KEY` secret is set
2. Check workflow logs for specific errors
3. Ensure service account has Firestore write permissions

### Manual verse update
1. Run the migration script locally with service account
2. Or trigger GitHub Action manually

## Future Features Enabled

With Firestore, we can now add:
- ✨ User favorite verses
- 📝 Personal notes on verses
- 📊 Popular verses analytics
- 🔄 Verse sharing between users
- 📅 Verse reading history
- 🏷️ Custom verse collections

## Security Considerations

- Verses are publicly readable (as intended)
- Only service account can write verses (via GitHub Actions)
- User data (future) is private to each user
- No API keys are exposed in the extension