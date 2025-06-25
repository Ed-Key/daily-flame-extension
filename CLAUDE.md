**Project Name:** Daily Flame (Chrome Extension)

### 🧠 Overview

Daily Flame is a Chrome extension that shows users a fullscreen Bible verse overlay each day before allowing them to use their browser. It uses the [scripture.api.bible](https://scripture.api.bible/) API for fetching verse text, and currently supports KJV and other public-domain translations. Users must read the verse and click a button to dismiss it.

### 🏗️ Current Architecture

**Tech Stack:**
- **React** + **TypeScript** + **Tailwind CSS**
- **Firebase Authentication** (Email/Password + Google OAuth)
- **Chrome Extension Manifest V3**
- **Webpack** build system
- **GSAP** for professional animations

**Project Structure:**
```
src/
├── components/
│   ├── AuthContext.tsx          # Firebase auth state management
│   ├── VerseOverlay.tsx         # Main overlay with auth modals & animations
│   ├── PasswordInput.tsx        # Password input with visibility toggle
│   ├── Toast.tsx                # Toast notification component
│   └── ToastContext.tsx         # Toast state management
├── services/
│   ├── firebase-config.ts       # Firebase configuration
│   └── verse-service.ts         # Bible API integration
├── background/
│   └── index.ts                 # Service worker with Google auth handling
├── content/
│   └── index.ts                 # Content script injection
├── newtab/
│   ├── index.tsx                # New tab page React component
│   └── newtab.html              # HTML template
├── admin/
│   └── index.tsx                # Admin portal (standalone page)
├── types/
│   └── index.ts                 # TypeScript definitions
└── styles/
    ├── globals.css              # Tailwind CSS for standalone pages
    └── shadow-dom-styles.ts     # Complete CSS for Shadow DOM isolation
```

### ⚙️ Current Working Features

**Core Functionality:**
- Daily verse overlay triggered on new tab or browser open (shown once per day)
- Professional word-by-word verse reveal animation using GSAP
- Verse display UI with animated text, reference, and dismiss button
- API integration for fetching Bible verses (KJV, WEB, WEB British, WEB Updated)
- Storage of daily-shown state via `chrome.storage.local`

**Authentication System:**
- Firebase Authentication with Email/Password and Google Sign-In
- Email verification requirement (except for admin@dailyflame.com)
- User profile management with display names and profile photos
- Admin role detection for enhanced features
- Toast notifications for user feedback
- Password visibility toggles and inline form validation
- Keyboard shortcut (Ctrl+Shift+C) for clearing auth tokens

**User Interface:**
- Fullscreen verse overlay with glassmorphism design
- Sign-in/Sign-up modals with modern UI patterns
- Profile dropdown with user info and admin badges
- Remember me functionality
- Comprehensive error handling with user-friendly messages
- **Shadow DOM implementation** for complete CSS isolation preventing host page conflicts
- Smooth animations and transitions throughout

**Admin Features:**
- Admin portal accessible via separate page (`admin/index.tsx`)
- Verse preview tool for testing different Bible references
- Admin controls embedded in verse overlay for authenticated admins
- Google Sign-In with account selection forcing
- Auth token clearing for testing different accounts

**Chrome Extension Integration:**
- Background service worker handling Google OAuth via `chrome.identity` API
- Content script with Shadow DOM for isolated verse overlay display
- Message passing between background and content scripts
- New tab override with React-based landing page
- Complete style encapsulation preventing interference with host websites

### 🔧 Technical Implementation Details

**Shadow DOM Implementation:**
- Complete CSS isolation using Shadow DOM in content script
- All styles contained within shadow-dom-styles.ts
- Prevents any CSS leakage to or from host websites
- React app rendered inside Shadow DOM container
- Event handling properly scoped within Shadow boundary

**Authentication Flow:**
- Email/Password: Standard Firebase auth with email verification blocking
- Google Sign-In: Uses `chrome.identity` API to bypass CSP restrictions
- Profile photos fetched from Google User Info API
- Automatic sign-out after account creation (except admin) to enforce verification
- Resend verification email functionality with inline UI

**State Management:**
- React Context for authentication state
- React Context for toast notifications
- Chrome storage for daily verse tracking
- Firebase Auth for user persistence

**Error Handling:**
- Comprehensive Firebase error code mapping
- Inline validation with real-time feedback
- Toast notifications replacing browser alerts
- Debug logging throughout authentication flow
- Special handling for email verification errors

**Bible Verse System:**
- Daily verse fetching with caching
- Multiple translation support
- Admin verse preview functionality
- Verse reference validation

**GSAP Animation System:**
- Professional word-by-word verse reveal animation using GSAP v3.13.0
- React integration with `@gsap/react` hooks for proper lifecycle management
- Enhanced animation sequence:
  1. Opening quotation mark appears first
  2. Words animate with stagger effect (80ms delay between words)
  3. Closing quotation mark appears after last word
  4. Verse reference fades and scales in
  5. Done button bounces in with elastic effect
- Sequential animation timeline with strategic overlaps for smooth flow
- Elastic button entrance with `back.out(1.7)` bounce effect
- Animation scoping and dependency tracking for verse content changes
- Proper opacity handling to ensure all elements animate from invisible to visible

### 🎯 Current Status

The codebase has been fully migrated from vanilla JavaScript to React + TypeScript + Tailwind CSS with professional GSAP animations. All authentication features are implemented with industry-standard patterns including email verification, password security, and comprehensive error handling. The extension successfully integrates Firebase Authentication within Chrome extension security constraints and features a premium animated verse revelation experience.

**Key Files:**
- `src/components/VerseOverlay.tsx` - Main component with verse display, auth modals, and GSAP animations
- `src/components/AuthContext.tsx` - Firebase authentication logic and state
- `src/content/index.ts` - Shadow DOM implementation and React app injection
- `src/styles/shadow-dom-styles.ts` - Complete CSS isolation for content script
- `src/background/index.ts` - Google OAuth handling and extension messaging
- `src/admin/index.tsx` - Standalone admin portal
- `manifest.json` - Extension configuration with Firebase permissions

**Feature Status:**
- ✅ Email/Password sign-up with verification
- ✅ Google Sign-In with profile photo integration
- ✅ Email verification enforcement with resend functionality
- ✅ Admin role management
- ✅ Comprehensive error handling
- ✅ Modern UI patterns with accessibility
- ✅ Shadow DOM implementation for complete CSS isolation
- ✅ Professional GSAP animations with enhanced verse reveal sequence
- ✅ Animated quotation marks and proper visibility handling for all elements

**Recent Updates:**
- Implemented complete Shadow DOM isolation to prevent CSS conflicts with host websites
- Enhanced GSAP animation sequence to include animated quotation marks
- Fixed verse reference animation by removing CSS !important conflicts
- Removed global CSS imports from content script to prevent style leakage
- Added comprehensive CSS to shadow-dom-styles.ts for complete encapsulation
- Fixed password input eye icon positioning within Shadow DOM
- Improved animation visibility handling for all elements

**Known Issues:**
- Email verification emails may experience delivery delays with certain providers
- Debug logging enabled for troubleshooting (can be disabled in production)
