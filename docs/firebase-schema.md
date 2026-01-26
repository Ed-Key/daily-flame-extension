# Firebase Schema & Architecture

**Project ID:** daily-flame
**Auth Domain:** daily-flame.firebaseapp.com

## Firestore Collections

### `dailyVerses`

Daily Bible verses displayed to users.

**Document ID:** Date string (YYYY-MM-DD)
**Access:** Public read, admin-only write

```typescript
{
  reference: string;      // "John 3:16"
  book: string;           // "John"
  chapter: number;        // 3
  verse: string;          // "16" or "16-17"
  bibleId: string;        // "ESV", "NLT", or API bible ID
  url?: string;           // Optional reference URL
  addedAt?: Timestamp;
  order?: number;
}
```

### `users`

User-specific data and preferences.

**Document ID:** Firebase Auth UID
**Access:** User can only read/write their own document

```typescript
{
  uid: string;
  email: string;
  lastActive: Timestamp;
  updatedAt: Timestamp;
  preferences: {
    bibleTranslation: 'ESV' | 'NLT' | 'KJV' | 'ASV' | 'WEB';
    theme: 'light' | 'dark';
    autoDisplay?: boolean;
    lastModified: number;    // Client timestamp
    lastSynced: Timestamp;   // Server timestamp
  }
}
```

### Subcollections (Future)

- `users/{userId}/favorites` - Saved verses
- `users/{userId}/history` - Viewing history (backdating prevented)
- `sharedCollections` - Shared verse collections

## Security Rules Summary

```
dailyVerses/{date}     → read: public, write: admin only
dailyVerses/_metadata  → read: public, write: none (service account only)
users/{userId}         → read/write: only if auth.uid == userId
users/{userId}/history → write only if viewedAt == request.time
```

## Cloud Functions

### `syncUserPreferences`
Syncs preferences from extension to Firestore.

**Trigger:** Callable (HTTP)
**Auth:** Required

### `getUserPreferences`
Retrieves user preferences from Firestore.

**Trigger:** Callable (HTTP)
**Auth:** Required

## Authentication Flow (Manifest V3)

Manifest V3 requires offscreen documents for Firebase popup auth:

```
Extension UI → Background Script → Offscreen Document → Auth iframe
                                                             ↓
                                                        Firebase Auth
                                                             ↓
                                                        Firestore
```

**Key files:**
- `src/background/offscreen.ts` - Creates iframe for auth
- `public/auth-handler.html` - Hosted on Firebase, handles auth popups
- `src/auth/auth-handler.js` - Firebase SDK operations

## Preference Sync Strategy

**Hybrid storage model:**
1. Chrome local storage (immediate, offline-capable)
2. Firestore (synced when online)

**Conflict resolution:**
- Compare `lastModified` timestamps
- Newer version wins
- Sync older version to other storage

**Caching:**
- Verses: 6-hour cache in `FirestoreService`
- Preferences: 30-second in-memory cache

## Firebase MCP Tools

Query Firestore directly from Claude Code:

```bash
# Get today's verse
firestore_get_documents(paths: ["dailyVerses/2026-01-25"])

# Query users
firestore_query_collection(collection_path: "users", filters: [...])

# Check auth users
auth_get_users(emails: ["user@example.com"])

# View function logs
functions_get_logs(min_severity: "ERROR")
```

## Key Files

- `src/services/firestore-service.ts` - Firestore operations
- `src/services/user-preferences-service.ts` - Hybrid preference management
- `functions/index.js` - Cloud Functions
- `firestore.rules` - Security rules
