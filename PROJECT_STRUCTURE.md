# DailyFlame Project Structure

## Overview
DailyFlame (Daily Bread) is a Chrome Extension (Manifest V3) that displays daily Bible verses with beautiful animations and multiple translation support. Built with React, TypeScript, and Firebase.

## Complete File & Folder Structure

```
DailyFlame/
├── src/                           # Main source code directory
│   ├── admin/                     # Admin panel components
│   │   └── index.tsx             # Admin entry point
│   │
│   ├── auth/                      # Authentication pages
│   │   ├── auth.css              # Auth page styles
│   │   ├── auth.html             # Auth page template
│   │   └── auth.ts               # Auth page logic
│   │
│   ├── background/                # Chrome extension background scripts
│   │   └── index-simple.ts       # Service worker for Manifest V3
│   │
│   ├── components/                # React components
│   │   ├── forms/                # Form components
│   │   │   ├── FormError.tsx
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormPasswordInput.tsx
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   ├── VerificationReminder.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── VerseOverlay/         # Main verse display component
│   │   │   ├── components/       # Sub-components
│   │   │   │   ├── AdminControls.tsx
│   │   │   │   ├── AuthButtons.tsx
│   │   │   │   ├── ContextView.tsx
│   │   │   │   ├── ProfileDropdown.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   └── VerseDisplay.tsx
│   │   │   │
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   │   └── useContextScroll.ts
│   │   │   │
│   │   │   ├── utils/            # Utility functions
│   │   │   │   ├── __tests__/   # Unit tests
│   │   │   │   ├── unifiedVerseRenderer.tsx
│   │   │   │   └── verseRenderer.tsx
│   │   │   │
│   │   │   ├── index.tsx         # Main VerseOverlay component
│   │   │   └── types.ts          # TypeScript type definitions
│   │   │
│   │   ├── AuthContext.tsx       # Authentication context provider
│   │   ├── Toast.tsx             # Toast notification component
│   │   └── ToastContext.tsx      # Toast context provider
│   │
│   ├── content/                   # Content scripts for Chrome extension
│   │   ├── monitor.ts            # Page monitor script
│   │   └── verse-app.ts          # Main app injection script
│   │
│   ├── hooks/                     # Global custom hooks
│   │   └── useAuthForm.ts        # Authentication form hook
│   │
│   ├── services/                  # Service layer
│   │   ├── parsers/              # Bible text parsers
│   │   │   ├── __tests__/       # Parser tests
│   │   │   ├── base-parser.ts   # Abstract base parser
│   │   │   ├── esv-parser.ts    # ESV-specific parser
│   │   │   ├── nlt-parser.ts    # NLT-specific parser
│   │   │   └── standard-parser.ts # Generic Bible parser
│   │   │
│   │   ├── __tests__/            # Service tests
│   │   ├── cloud-functions-service.ts  # Firebase Cloud Functions
│   │   ├── esv-service.ts       # ESV API integration
│   │   ├── firebase-config.ts   # Firebase configuration
│   │   ├── firestore-service.ts # Firestore database service
│   │   ├── nlt-service.ts       # NLT API integration
│   │   ├── user-preferences-service.ts # User preferences management
│   │   └── verse-service.ts     # Main verse orchestrator
│   │
│   ├── styles/                    # CSS-in-JS styles for Shadow DOM
│   │   ├── components/           # Component-specific styles
│   │   │   ├── profile-dropdown.css.ts
│   │   │   ├── settings-view.css.ts
│   │   │   ├── theme-toggle.css.ts
│   │   │   └── translation-dropdown.css.ts
│   │   │
│   │   ├── shared/               # Shared styles
│   │   │   └── glassmorphic.css.ts
│   │   │
│   │   ├── shadow-dom-styles.ts  # Main style injection
│   │   └── theme-variables.css.ts # Theme CSS variables
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── bible-formats.ts     # Bible format types
│   │   └── index.ts              # Main type exports
│   │
│   ├── utils/                     # Utility functions
│   │   └── date-utils.ts         # Date manipulation utilities
│   │
│   └── offscreen.ts              # Offscreen document for auth (Manifest V3)
│
├── public/                        # Public assets
│   ├── icon-1024.png            # Extension icon
│   └── ...                      # Other icons
│
├── functions/                     # Firebase Cloud Functions
│   ├── index.js                 # Cloud Functions entry point
│   └── package.json             # Functions dependencies
│
├── firebase-hosting/             # Firebase hosting files
│   └── public/
│       ├── auth-handler.html   # Auth redirect handler
│       └── auth-handler.js     # Auth handler logic
│
├── docs/                         # Documentation
│   ├── index.html               # Documentation site
│   └── verses.json              # Verse data
│
├── .github/                      # GitHub configuration
│   ├── scripts/                 # GitHub Actions scripts
│   │   └── scrape-verses.js    # Verse scraping script
│   └── workflows/               # GitHub Actions workflows
│
├── .claude/                      # Claude AI configuration
│   └── settings.local.json      # Local settings
│
├── coverage/                     # Test coverage reports
├── dist/                        # Build output
├── node_modules/                # Dependencies
│
├── Configuration Files:
├── manifest.json                # Chrome Extension manifest
├── package.json                 # Project dependencies
├── tsconfig.json               # TypeScript configuration
├── webpack.config.js           # Webpack bundler config
├── jest.config.js              # Jest testing config
├── firebase.json               # Firebase config
├── firestore.indexes.json     # Firestore indexes
└── CLAUDE.md                   # AI assistant instructions
```

## Key Architectural Components

### 1. Chrome Extension Architecture (Manifest V3)
- **content.js**: Monitors page loads and determines when to show verses
- **verse-app.js**: Main React application loaded in Shadow DOM
- **background.js**: Service worker for Chrome extension lifecycle
- **offscreen.html**: Required for Firebase auth in Manifest V3

### 2. Shadow DOM Implementation
- All styles must be in `src/styles/shadow-dom-styles.ts` due to Shadow DOM isolation
- Component-specific CSS in `src/styles/components/`
- Regular CSS imports will not work in Shadow DOM context

### 3. Bible Text Processing Pipeline
```
verse-service.ts (orchestrator)
    ├── esv-service.ts (ESV API)
    ├── nlt-service.ts (NLT API)
    └── scripture.api.bible (KJV, ASV, WEB)

Parser System:
    ├── BaseParser (abstract)
    ├── EsvParser (ESV formatting)
    ├── NltParser (NLT formatting)
    └── StandardParser (generic)
```

### 4. User Preference System
- **UserPreferencesService**: Manages user preferences with hybrid storage
  - Local Chrome storage for instant access
  - Firebase Firestore for cloud sync
  - Intelligent conflict resolution
  - Cache management with TTL

### 5. Authentication Flow
- Firebase Authentication integration
- Email verification system
- Admin role management
- Google Sign-In support

## Development Commands

```bash
# Build & Development
npm run build         # Production build
npm run build:dev     # Development build
npm run watch        # Watch mode

# Testing
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# Linting & Type Checking
npm run lint         # Run linter
npm run typecheck    # TypeScript check
```

## Technology Stack
- **Frontend**: React 18, TypeScript
- **Animation**: GSAP (GreenSock)
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **APIs**: ESV API, NLT API, Scripture.api.bible
- **Build**: Webpack, ts-jest
- **Extension**: Chrome Manifest V3

## Key Features
- Multiple Bible translations (ESV, NLT, KJV, ASV, WEB)
- Beautiful verse animations with GSAP
- Dark/Light theme support
- User authentication and preferences
- Admin controls for daily verse management
- Full chapter context view
- Offline support with caching