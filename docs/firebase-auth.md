# Firebase Authentication (Manifest V3)

Chrome Manifest V3 blocks Firebase's popup auth due to CSP restrictions. This document explains our workaround.

## Architecture

```
User clicks "Sign in"
    ↓
AuthContext.tsx → chrome.runtime.sendMessage({action: 'auth'})
    ↓
Background Script → creates offscreen document
    ↓
Offscreen Document → loads iframe from Firebase Hosting
    ↓
iframe (auth-handler.html) → Firebase signInWithPopup()
    ↓
Google OAuth popup → user authenticates
    ↓
Result flows back via postMessage + BroadcastChannel
    ↓
Auth state stored in chrome.storage.local
```

## Why This Works

**The Problem:** Manifest V3 CSP blocks `https://apis.google.com/js/api.js` which Firebase Auth needs.

**The Solution:** Host an auth handler on Firebase Hosting (`daily-flame.web.app/auth-handler.html`). This page runs in a normal web context without CSP restrictions, loaded via iframe in an offscreen document.

## Key Components

| File | Purpose |
|------|---------|
| `src/components/AuthContext.tsx` | React auth state management |
| `src/background/index-simple.ts` | Creates offscreen document, routes messages |
| `src/offscreen.ts` | Bridge between extension and hosted iframe |
| `firebase-hosting/public/auth-handler.html` | Hosted page that runs Firebase Auth |

## Communication Channels (4 Redundant Paths)

We use multiple channels because any single one can fail:

1. **chrome.runtime.sendMessage** - Primary extension messaging
2. **BroadcastChannel** - Cross-context broadcast
3. **window.postMessage** - iframe ↔ parent communication
4. **chrome.storage.local** - Persistent fallback

## Common Issues

### `auth/cancelled-popup-request` on re-sign-in

**Cause:** Firebase had stale popup state after sign-out.

**Fix:** Clear auth state before new sign-in:
```javascript
if (auth.currentUser) {
  await signOut(auth);
}
```

### Auth handler not loading fresh code

**Cause:** Aggressive browser caching of iframe content.

**Fix:** Cache-busting query params:
```javascript
const iframeSrc = `${AUTH_URL}?session=${sessionId}&t=${Date.now()}`;
```

### Popup blocked / silent failure

**Cause:** Browser blocks popups, or message channel fails.

**Fix:**
- Multiple communication channels (redundancy)
- Retry logic (3 attempts, 15s timeout each)
- Storage-based fallback detection

## Configuration

**Firebase Console:**
- Add `chrome-extension://YOUR_EXTENSION_ID` to authorized domains

**manifest.json:**
```json
{
  "permissions": ["offscreen"],
  "host_permissions": ["https://daily-flame.web.app/*"]
}
```

## Security

- Origin validation on all postMessage handlers
- Firebase Auth handles OAuth security (PKCE, state params)
- No tokens stored in extension code - Firebase SDK manages them
- Auth state in chrome.storage.local (extension-only access)
