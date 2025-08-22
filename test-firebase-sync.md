# Testing Firebase Sync with Message Passing

## Test Steps

### 1. Initial Setup
1. Open Chrome and navigate to `chrome://extensions/`
2. Click "Reload" on the DailyFlame extension
3. Open Chrome DevTools (F12) and navigate to any website (e.g., google.com)

### 2. Test Sign In and Preferences Sync
1. Click the DailyFlame extension icon to open the verse overlay
2. Click "Sign In" and authenticate with your account
3. Once signed in, click your profile icon and select "Settings"
4. Change the Bible translation to a different version (e.g., from ESV to NLT)
5. Open the Chrome DevTools Console

### 3. Verify Message Passing
Run these commands in the console to check if preferences are syncing:

```javascript
// Check if preferences were saved locally
chrome.storage.local.get(['userPreferences'], (result) => {
  console.log('Local preferences:', result.userPreferences);
});

// Force a sync to test message passing
(async () => {
  const { authUser } = await chrome.storage.local.get('authUser');
  if (authUser) {
    const response = await chrome.runtime.sendMessage({
      action: 'syncPreferences',
      data: {
        userId: authUser.uid,
        preferences: {
          bibleTranslation: 'KJV',
          theme: 'dark',
          lastModified: Date.now()
        }
      }
    });
    console.log('Sync response:', response);
  } else {
    console.log('No user signed in');
  }
})();
```

### 4. Check Firebase Console
1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Look for the `users` collection
4. Find your user document (by UID)
5. Verify that the `preferences` field exists with:
   - `bibleTranslation`
   - `theme`
   - `lastModified`
   - `lastSynced`

### 5. Expected Results
- ✅ No "Missing or insufficient permissions" errors
- ✅ Preferences save locally immediately
- ✅ Background script logs show "Handling preference sync request"
- ✅ Offscreen document logs show "Preferences synced to Firestore successfully"
- ✅ Firebase Console shows the updated preferences

### 6. Cross-Device Sync Test
1. Sign in with the same account on another device/browser
2. The preferences should automatically load from Firebase
3. Changes made on one device should sync to the other

## Debug Commands

If you need to debug, use these commands:

```javascript
// Check offscreen document logs
// Open chrome://extensions/ → DailyFlame → Inspect views: offscreen.html

// Check background script logs  
// Open chrome://extensions/ → DailyFlame → Inspect views: service worker

// Test auth state
chrome.storage.local.get(['authUser', 'authTimestamp'], (result) => {
  console.log('Auth state:', result);
});

// Clear all preferences (for testing)
chrome.storage.local.remove(['userPreferences', 'preferencesSyncTimestamp'], () => {
  console.log('Preferences cleared');
});
```

## Common Issues and Solutions

### Issue 1: "Missing or insufficient permissions"
**Solution**: This should no longer occur with message passing. If it does, check:
- Offscreen document is created and running
- Message routing in background script is working
- Firebase Auth is properly initialized in offscreen document

### Issue 2: Preferences not syncing to Firebase
**Check**:
- User is signed in (check authUser in storage)
- Network tab shows successful Firestore API calls
- No errors in offscreen document console

### Issue 3: Preferences not loading from Firebase
**Check**:
- Firestore security rules allow read/write for authenticated users
- User document exists in Firebase
- Network connectivity is working

## Success Indicators
1. No permission errors in any console
2. Preferences sync seamlessly between local and Firebase
3. Cross-device sync works for signed-in users
4. Offline changes sync when back online