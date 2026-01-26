# Firebase Sync Testing

Manual testing procedures for preference synchronization.

## Quick Test

1. Open extension, sign in with test account
2. Change Bible translation in Settings
3. Verify in DevTools Console:
   ```javascript
   chrome.storage.local.get(['userPreferences'], console.log);
   ```
4. Check Firestore Console → `users` collection → your UID → `preferences` field

## Debug Commands

```javascript
// Check auth state
chrome.storage.local.get(['authUser'], console.log);

// Force sync test
const { authUser } = await chrome.storage.local.get('authUser');
chrome.runtime.sendMessage({
  action: 'syncPreferences',
  data: { userId: authUser.uid, preferences: { bibleTranslation: 'KJV', theme: 'dark' }}
});

// Clear preferences (reset test)
chrome.storage.local.remove(['userPreferences']);
```

## Inspect Logs

- **Offscreen document:** `chrome://extensions/` → DailyFlame → "offscreen.html"
- **Background script:** `chrome://extensions/` → DailyFlame → "service worker"

## Expected Behavior

- No "Missing or insufficient permissions" errors
- Preferences save locally immediately
- Background logs: "Handling preference sync request"
- Offscreen logs: "Preferences synced to Firestore successfully"
