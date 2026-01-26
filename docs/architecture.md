# Component Architecture

React/TypeScript Chrome extension with Shadow DOM isolation.

## Entry Point

**File:** `src/content/verse-app.ts`

```
verse-app.ts
├── Fetches daily verse via VerseService
├── Creates Shadow DOM container
├── Injects styles from getShadowDomStyles()
└── Mounts React: ErrorBoundary → ToastProvider → AuthProvider → VerseOverlay
```

## Component Hierarchy

```
VerseOverlay (Root)
├── Top Controls
│   ├── ThemeToggle
│   └── AuthButtons | ProfileDropdown
│
├── Modal Content
│   ├── AdminControls (admin only)
│   └── VerseDisplay | ContextView (conditional)
│       ├── Verse text with translation dropdown
│       └── Done/More action buttons
│
├── SettingsSidebar (drawer from right)
│   └── SettingsContent (theme, translation)
│
└── Auth Modals
    ├── SignInForm
    ├── SignUpForm
    └── VerificationReminder
```

## Key Components

### VerseOverlay (`components/VerseOverlay/index.tsx`)
Main orchestrator. Manages:
- Verse state and translation switching
- Modal visibility (context view, settings, auth modals)
- GSAP animation coordination
- Theme application to Shadow DOM host

### VerseDisplay (`components/VerseDisplay.tsx`)
Renders verse text and reference. Exposes refs for parent GSAP animations:
- `verseTextRef` - animated letter-by-letter
- `leftLineRef, rightLineRef` - decorative borders
- `doneButtonRef, moreButtonRef` - action buttons

### ContextView (`components/ContextView.tsx`)
Full chapter reading view. Uses `renderUnifiedVerses()` for translation-specific formatting.

### ProfileDropdown (`components/ProfileDropdown.tsx`)
User menu with settings access, sign out, verification status.

### SettingsSidebar/SettingsContent
Sliding panel for theme and translation preferences.

## State Management

### React Context
- **AuthContext** - User auth state, sign in/out methods
- **ToastContext** - Notification system

### Local State (VerseOverlay)
```typescript
currentVerse: VerseData
showContext: boolean
showSettings: boolean
theme: 'light' | 'dark'
currentTranslation: BibleTranslation
```

### Persistence
**UserPreferencesService** handles hybrid storage:
1. In-memory cache (30s TTL)
2. Chrome local storage
3. Firestore (if signed in)

## GSAP Animations

### Modal Entrance
1. Slide in from random side (left/right) - 0.6s
2. Add backdrop blur - 0.3s
3. Scale up to full size - 0.5s

### Verse Reveal
1. Letter-by-letter animation with glow effect
2. Decorative lines expand
3. Buttons fade in

### Settings Sidebar
Slides in from right edge with backdrop dimming.

## Verse Rendering

**File:** `utils/unifiedVerseRenderer.tsx`

Routes to translation-specific renderers:
- ESV/NLT: Floating chapter numbers, grouped paragraphs
- KJV/ASV: Verse-by-verse format
- Standard: Natural paragraph grouping

Features:
- Current verse highlighting
- Poetry indentation
- Red letter (Words of Jesus)
- Psalm superscriptions
- Selah markers

## Component Communication

1. **Props drilling** - Main data flow
2. **Custom events** - Dropdown coordination (`dropdown-open`)
3. **Refs** - Parent controls child animations
4. **Context** - Global auth/toast state

## Key Files

- `src/components/VerseOverlay/index.tsx` - Root component
- `src/components/VerseOverlay/components/` - Sub-components
- `src/components/VerseOverlay/utils/` - Rendering utilities
- `src/components/VerseOverlay/hooks/` - Custom hooks
- `src/components/AuthContext.tsx` - Auth provider
