# /src/services Directory - Business Logic Layer

## Overview
The services directory contains all business logic, API integrations, and data management for the DailyFlame extension. Services follow a singleton pattern and provide clean interfaces for the UI layer.

## Architecture Overview

### Service Layer Design Principles
1. **Single Responsibility**: Each service handles one domain
2. **Dependency Injection**: Services can depend on other services
3. **Error Handling**: All services handle and transform errors
4. **Caching Strategy**: Multi-tier caching for performance
5. **Type Safety**: Full TypeScript interfaces

## Core Services

### `verse-service.ts` - Main Verse Orchestrator
**Purpose**: Central service for fetching, caching, and managing Bible verses.

**Key Methods**:
```typescript
- getVerse(reference: string, bibleId: string): Promise<VerseData>
- getDailyVerse(): Promise<VerseData>
- getChapter(reference: string, bibleId: string): Promise<ChapterData>
- cacheVerse(verse: VerseData): Promise<void>
```

**Architecture**:
```
VerseService (Orchestrator)
    ├── Cache Check (Chrome Storage)
    ├── API Selection based on bibleId
    │   ├── ESV Service
    │   ├── NLT Service
    │   └── Scripture.api.bible (KJV, ASV, WEB)
    ├── Parser Selection
    │   ├── EsvParser
    │   ├── NltParser
    │   └── StandardParser
    └── Cache Storage
```

**Caching Strategy**:
- 7-day TTL for verses
- Key format: `verse_${bibleId}_${reference}`
- Automatic cache cleanup

---

### `user-preferences-service.ts` - Preference Management
**Purpose**: Manages user preferences with intelligent hybrid storage.

**Storage Tiers**:
1. **In-Memory Cache**: 30-second TTL, fastest access
2. **Chrome Local Storage**: Offline support, instant access
3. **Firebase Firestore**: Cloud sync, cross-device

**Key Methods**:
```typescript
- loadPreferences(user: FirebaseUser | null): Promise<UserPreferences>
- saveBibleTranslation(translation: BibleTranslation, user: FirebaseUser | null)
- saveTheme(theme: 'light' | 'dark', user: FirebaseUser | null)
- getBibleTranslation(user: FirebaseUser | null): Promise<BibleTranslation>
- getTheme(user: FirebaseUser | null): Promise<'light' | 'dark'>
- onSignIn(user: FirebaseUser): Promise<void>
- onSignOut(): Promise<void>
```

**Conflict Resolution Algorithm**:
```typescript
1. Check if local preferences are defaults
   - If yes → use cloud preferences
   - If no → continue

2. Compare timestamps
   - Cloud newer → use cloud
   - Local newer → check content
     - Different → sync local to cloud
     - Same → use cloud (sync timestamps)

3. No cloud preferences
   - Local differs from defaults → sync to cloud
   - Local matches defaults → don't sync
```

**Key Features**:
- Automatic conflict resolution
- Background sync to Firebase
- Migration from old preference keys
- Cache invalidation on sign in/out

---

### `firebase-config.ts` - Firebase Configuration
**Purpose**: Initializes and configures Firebase services.

**Exports**:
```typescript
- firebaseApp: Firebase App instance
- auth: Firebase Auth instance
- db: Firestore instance
- firebaseConfig: Configuration object
```

**Environment Detection**:
- Chrome extension context
- Web context
- Development environment

---

### `firestore-service.ts` - Database Operations
**Purpose**: Firestore database operations and data management.

**Collections**:
- `users/`: User profiles and preferences
- `dailyVerses/`: Daily verse assignments
- `verseHistory/`: User reading history

**Key Methods**:
```typescript
- getUserPreferences(userId: string): Promise<UserPreferences>
- saveUserPreferences(userId: string, preferences: UserPreferences)
- getDailyVerse(date: string): Promise<VerseData>
- saveVerseHistory(userId: string, verse: VerseData)
```

**Security Rules**:
- Users can only read/write their own data
- Admin role for daily verse management
- Public read for daily verses

---

### `cloud-functions-service.ts` - Cloud Functions
**Purpose**: Interface for Firebase Cloud Functions.

**Functions**:
```typescript
- syncPreferences(preferences: UserPreferences, user: FirebaseUser): Promise<boolean>
- getPreferences(user: FirebaseUser): Promise<UserPreferences | null>
- logUserActivity(activity: ActivityData): Promise<void>
```

**Error Handling**:
- Retry logic with exponential backoff
- Fallback to local operations
- Error logging and reporting

---

### `esv-service.ts` - ESV API Integration
**Purpose**: Fetches verses from the ESV API.

**API Endpoints**:
- `https://api.esv.org/v3/passage/text/`
- `https://api.esv.org/v3/passage/html/`

**Key Methods**:
```typescript
- fetchVerse(reference: string): Promise<string>
- fetchChapter(reference: string): Promise<string>
- parseResponse(data: ESVResponse): VerseData
```

**Features**:
- API key management
- Rate limiting
- Response caching
- Error transformation

---

### `nlt-service.ts` - NLT API Integration
**Purpose**: Fetches verses from the NLT API.

**API Endpoints**:
- `https://api.nlt.to/api/passages`

**Key Methods**:
```typescript
- fetchVerse(reference: string): Promise<string>
- fetchChapter(reference: string): Promise<string>
- parseResponse(data: NLTResponse): VerseData
```

**Features**:
- API key management
- Response parsing
- Error handling

---

## /parsers Subdirectory

### Parser Architecture
All parsers extend the abstract `BaseParser` class and implement translation-specific formatting.

### `base-parser.ts` - Abstract Base Parser
**Purpose**: Defines the parser interface and common functionality.

**Abstract Methods**:
```typescript
- parseVerse(text: string, reference: string): ParsedVerse
- parseChapter(text: string, reference: string): ParsedChapter
- formatVerse(parsed: ParsedVerse): FormattedVerse
```

**Common Features**:
- Verse number extraction
- Reference normalization
- Error handling

---

### `esv-parser.ts` - ESV-Specific Parser
**Purpose**: Handles ESV translation formatting.

**Formatting Rules**:
- Large floating chapter numbers
- Paragraph indentation (2em except first)
- Section headings in italics
- Verse numbers in superscript

**Special Handling**:
- Poetry formatting
- Footnote processing
- Cross-reference links

---

### `nlt-parser.ts` - NLT-Specific Parser
**Purpose**: Handles NLT translation formatting.

**Formatting Rules**:
- Thought-for-thought translation style
- Modern language rendering
- Contextual verse grouping

---

### `standard-parser.ts` - Generic Bible Parser
**Purpose**: Handles KJV, ASV, WEB, and other translations.

**Formatting Rules**:
- Standard verse numbering
- Basic paragraph breaks
- Minimal formatting

**Compatibility**:
- Scripture.api.bible format
- Generic Bible text format

---

## Service Communication Flow

### Verse Fetching Flow
```
1. UI requests verse
   ↓
2. VerseService checks cache
   ↓ (cache miss)
3. Determines API service (ESV/NLT/Standard)
   ↓
4. API service fetches from external API
   ↓
5. Response parsed by appropriate parser
   ↓
6. Formatted verse cached
   ↓
7. Verse returned to UI
```

### Preference Sync Flow
```
1. User changes preference in UI
   ↓
2. UserPreferencesService.savePreference()
   ↓
3. Save to local storage (immediate)
   ↓
4. Update in-memory cache
   ↓
5. If signed in → background sync to Firebase
   ↓
6. CloudFunctionsService.syncPreferences()
   ↓
7. Cloud Function updates Firestore
```

### Sign-In Preference Flow
```
1. User signs in
   ↓
2. UserPreferencesService.onSignIn()
   ↓
3. Clear local cache
   ↓
4. Fetch preferences from Cloud Function
   ↓
5. Compare with local preferences
   ↓
6. Resolve conflicts (newer wins)
   ↓
7. Update UI with synced preferences
```

## Testing Strategy

### Unit Tests
Located in `__tests__/` directories:
- Service method testing
- Parser accuracy tests
- Cache behavior tests
- Error handling tests

### Integration Tests
- API service tests with real endpoints
- End-to-end preference sync tests
- Parser integration with real verse data

### Test Files
- `all-verses-real.test.ts`: Real API integration tests
- `verse-service-integration.test.ts`: Service orchestration tests
- `nlt-service.test.ts`: NLT API tests
- Parser tests in `/parsers/__tests__/`

## Error Handling Patterns

### API Errors
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }
  return await response.json();
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API-specific errors
  }
  // Fall back to cached data or defaults
}
```

### Preference Sync Errors
- Silent fail with local storage fallback
- Background retry with exponential backoff
- User notification only for critical errors

## Performance Optimizations

### Caching Strategy
1. **In-memory cache**: Sub-millisecond access
2. **Chrome storage**: ~10ms access
3. **Firebase**: ~100-500ms access
4. **External APIs**: ~500-2000ms access

### Batch Operations
- Batch Firestore writes
- Aggregate API requests where possible
- Debounce preference saves

### Background Operations
- Preference sync happens in background
- Cache cleanup runs periodically
- Non-critical operations are deferred

## Development Guidelines

### Adding New Services
1. Create service class in `/services`
2. Follow singleton pattern if stateful
3. Implement error handling
4. Add TypeScript interfaces
5. Write comprehensive tests
6. Document public API

### Adding New Parsers
1. Extend `BaseParser` class
2. Implement required methods
3. Add parser tests
4. Register in `verse-service.ts`
5. Document formatting rules

### Best Practices
- Always handle errors gracefully
- Implement proper caching
- Use TypeScript for type safety
- Write tests for critical paths
- Document complex algorithms
- Follow single responsibility principle