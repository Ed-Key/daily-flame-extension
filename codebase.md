# .claude\settings.local.json

```json
{
  "permissions": {
    "allow": [
      "WebFetch(domain:api.esv.org)",
      "Bash(git init:*)",
      "Bash(git branch:*)",
      "Bash(git add:*)",
      "Bash(npm run build:*)",
      "Bash(npm run lint)",
      "Bash(grep:*)",
      "Bash(rg:*)"
    ],
    "deny": []
  }
}
```

# .gitignore

```
node_modules

```

# CLAUDE.md

```md
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
\`\`\`
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
    └── globals.css              # Tailwind CSS with custom animations
\`\`\`

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
- **CSS isolation system** with maximum specificity to prevent host page conflicts
- Smooth animations and transitions throughout

**Admin Features:**
- Admin portal accessible via separate page (`admin/index.tsx`)
- Verse preview tool for testing different Bible references
- Admin controls embedded in verse overlay for authenticated admins
- Google Sign-In with account selection forcing
- Auth token clearing for testing different accounts

**Chrome Extension Integration:**
- Background service worker handling Google OAuth via `chrome.identity` API
- Content script injection for verse overlay display
- Message passing between background and content scripts
- New tab override with React-based landing page

### 🔧 Technical Implementation Details

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
- Staggered text animation (80ms delay between words) with `power2.out` easing
- Sequential animation timeline: words → reference → button with strategic overlaps
- Elastic button entrance with `back.out(1.7)` bounce effect
- Animation scoping and dependency tracking for verse content changes
- Proper opacity handling to ensure text visibility during animations

### 🎯 Current Status

The codebase has been fully migrated from vanilla JavaScript to React + TypeScript + Tailwind CSS with professional GSAP animations. All authentication features are implemented with industry-standard patterns including email verification, password security, and comprehensive error handling. The extension successfully integrates Firebase Authentication within Chrome extension security constraints and features a premium animated verse revelation experience.

**Key Files:**
- `src/components/VerseOverlay.tsx` - Main component with verse display, auth modals, and GSAP animations
- `src/components/AuthContext.tsx` - Firebase authentication logic and state
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
- ✅ CSS isolation system preventing host page conflicts
- ✅ Professional GSAP animations with word-by-word verse reveals
- ✅ Proper animation visibility handling

**Recent Updates:**
- Fixed GSAP animation visibility issue where verse text wasn't displaying
- Added explicit opacity handling for parent containers during animations
- Improved email verification flow with inline resend functionality
- Enhanced error messages for better user experience

**Known Issues:**
- Email verification emails may experience delivery delays with certain providers
- Debug logging enabled for troubleshooting (can be disabled in production)

```

# CLAUDE.md.save

```save
**Project Name:** Daily Flame (Chrome Extension)

### 🧠 Overview

Daily Flame is a Chrome extension that shows users a fullscreen Bible verse overlay each day before allowing them to use their browser. It uses the [scripture.api.bible](https://scripture.api.bible/) API for fetching verse text, and currently supports KJV and other public-domain translations. Users must read the verse and click a button to dismiss it.

### 🏗️ Current Architecture

**Tech Stack:**
- **React** + **TypeScript** + **Tailwind CSS**
- **Firebase Authentication** (Email/Password + Google OAuth)
- **Chrome Extension Manifest V3**
 **Webpack** build system

**Project Structure:**
\`\`\`
src/
├── components/
│   ├── AuthContext.tsx          # Firebase auth state management
│   ├── VerseOverlay.tsx         # Main overlay with auth modals
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
    └── globals.css              # Tailwind CSS
\`\`\`

### ⚙️ Current Working Features

**Core Functionality:**
- Daily verse overlay triggered on new tab or browser open (shown once per day)
- Verse display UI with text, reference, and dismiss button
- API integration for fetching Bible verses (KJV, WEB, WEB British, WEB Updated)
- Storage of daily-shown state via `chrome.storage.local`
x
**Authentication System:**
- Firebase Authentication with Email/Password and Google Sign-In
- Email verification requirement (except for admin@dailyflame.com)
- User profile management with display names and profile photos
- Admin role detection for enhanced features
- Toast notifications for user feedback
- Password visibility toggles and inline form validation

**User Interface:**
- Fullscreen verse overlay with glassmorphism design
- Sign-in/Sign-up modals with modern UI patterns
- Profile dropdown with user info and admin badges
- Remember me functionality
- Comprehensive error handling with user-friendly messages

**Admin Features:**
- Admin portal accessible via separate page (`admin/index.tsx`)
- Verse preview tool for testing different Bible references
- Admin controls embedded in verse overlay for authenticated admins
- Google Sign-In with account selection forcing
- Auth token clearing for testing different accounts

**Chrome Extension Integration:**
- Background service worker handling Google OAuth via `chrome.identity` API
- Content script injection for verse overlay display
- Message passing between background and content scripts
- New tab override with React-based landing page

### 🔧 Technical Implementation Details

**Authentication Flow:**
- Email/Password: Standard Firebase auth with email verification blocking
- Google Sign-In: Uses `chrome.identity` API to bypass CSP restrictions
- Profile photos fetched from Google User Info API
- Automatic sign-out after account creation (except admin) to enforce verification

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

**Bible Verse System:**
- Daily verse fetching with caching
- Multiple translation support
- Admin verse preview functionality
- Verse reference validation

### 🎯 Current Status

The codebase has been fully migrated from vanilla JavaScript to React + TypeScript + Tailwind CSS. All authentication features are implemented with industry-standard patterns including email verification, password security, and comprehensive error handling. The extension successfully integrates Firebase Authentication within Chrome extension security constraints.

**Key Files:**
- `src/components/VerseOverlay.tsx` - Main component with verse display and auth modals
- `src/components/AuthContext.tsx` - Firebase authentication logic and state
- `src/background/index.ts` - Google OAuth handling and extension messaging
- `src/admin/index.tsx` - Standalone admin portal
- `manifest.json` - Extension configuration with Firebase permissions

**Authentication Status:**
- ✅ Email/Password sign-up with verification
- ✅ Google Sign-In with profile photo integration
- ✅ Email verification enforcement
- ✅ Admin role management
- ✅ Comprehensive error handling
- ✅ Modern UI patterns with accessibility

**Known Issues:**
- Email verification emails may experience delivery delays with certain providers
- Debug logging enabled for troubleshooting email delivery

```

# image copy 2.png

This is a binary file of the type: Image

# image copy 3.png

This is a binary file of the type: Image

# image copy 4.png

This is a binary file of the type: Image

# image copy 5.png

This is a binary file of the type: Image

# image copy 6.png

This is a binary file of the type: Image

# image copy 7.png

This is a binary file of the type: Image

# image copy 8.png

This is a binary file of the type: Image

# image copy.png

This is a binary file of the type: Image

# image.png

This is a binary file of the type: Image

# manifest.json

```json
{
  "manifest_version": 3,
  "name": "Daily Flame",
  "version": "1.0",
  "description": "Display a daily Bible verse as a fullscreen overlay for spiritual checkpoints",
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "identity"
  ],
  "host_permissions": [
    "<all_urls>",
    "https://api.scripture.api.bible/*",
    "https://*.firebaseapp.com/*",
    "https://*.googleapis.com/*",
    "https://securetoken.googleapis.com/*",
    "https://identitytoolkit.googleapis.com/*",
    "https://accounts.google.com/*"
  ],
  "oauth2": {
    "client_id": "129859451154-k5rac7rbnfbbiatr3oci3dbgb6n127r7.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ]
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_title": "Open Daily Flame",
    "default_icon": {
      "16": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ctext y='14' font-size='14'%3E🔥%3C/text%3E%3C/svg%3E",
      "48": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ctext y='36' font-size='36'%3E🔥%3C/text%3E%3C/svg%3E",
      "128": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Ctext y='96' font-size='96'%3E🔥%3C/text%3E%3C/svg%3E"
    }
  },
  "icons": {
    "16": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ctext y='14' font-size='14'%3E🔥%3C/text%3E%3C/svg%3E",
    "48": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ctext y='36' font-size='36'%3E🔥%3C/text%3E%3C/svg%3E",
    "128": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Ctext y='96' font-size='96'%3E🔥%3C/text%3E%3C/svg%3E"
  }
}
```

# newtab.png

This is a binary file of the type: Image

# package.json

```json
{
  "name": "dailyflame",
  "version": "1.0.0",
  "description": "Daily Flame Chrome Extension - React + TypeScript + Tailwind CSS",
  "main": "dist/background.js",
  "scripts": {
    "build": "webpack",
    "build:dev": "webpack --mode=development",
    "build:prod": "webpack --mode=production",
    "watch": "webpack --watch --mode=development",
    "clean": "rm -rf dist",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@gsap/react": "^2.1.2",
    "firebase": "^11.9.1",
    "gsap": "^3.13.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.326",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "autoprefixer": "^10.4.21",
    "clean-webpack-plugin": "^4.0.0",
    "copy-webpack-plugin": "^13.0.0",
    "css-loader": "^7.1.2",
    "html-webpack-plugin": "^5.6.3",
    "postcss": "^8.5.6",
    "postcss-loader": "^8.1.1",
    "style-loader": "^4.0.0",
    "tailwindcss": "^3.4.17",
    "ts-loader": "^9.5.2",
    "typescript": "^5.8.3",
    "webpack": "^5.99.9",
    "webpack-cli": "^6.0.1",
    "webpack-merge": "^6.0.1"
  }
}

```

# postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

# src\admin\index.tsx

```tsx
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from '../components/AuthContext';
import { BIBLE_VERSIONS, BibleTranslation, VerseData } from '../types';
import { VerseService } from '../services/verse-service';
import '../styles/globals.css';

const AdminPage: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [reference, setReference] = useState('');
  const [translation, setTranslation] = useState<BibleTranslation>('KJV');
  const [previewVerse, setPreviewVerse] = useState<VerseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handlePreview = async () => {
    if (!reference || !translation) {
      setError('Please enter a Bible reference and select a translation');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPreviewVerse(null);

    try {
      const verse = await VerseService.getVerse(reference, BIBLE_VERSIONS[translation]);
      setPreviewVerse(verse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleTestVerse = async () => {
    try {
      setIsLoading(true);
      // Clear the daily status so the verse will show again
      await new Promise<void>((resolve) => {
        chrome.runtime.sendMessage({ action: 'clearStorage' }, () => {
          resolve();
        });
      });
      alert('Daily status reset! The verse overlay will appear on your next page visit.');
    } catch (error) {
      alert('Error resetting daily status');
    } finally {
      setIsLoading(false);
    }
  };

  const AuthModal = () => {
    const { signIn, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const handleEmailSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!email || !password) {
        setAuthError('Please enter both email and password');
        return;
      }

      setAuthLoading(true);
      setAuthError(null);

      try {
        await signIn(email, password);
        setShowAuthModal(false);
      } catch (err: any) {
        setAuthError(err.message || 'Failed to sign in');
      } finally {
        setAuthLoading(false);
      }
    };

    const handleGoogleSignIn = async () => {
      setAuthLoading(true);
      setAuthError(null);

      try {
        await signInWithGoogle();
        setShowAuthModal(false);
      } catch (err: any) {
        setAuthError(err.message || 'Failed to sign in with Google');
      } finally {
        setAuthLoading(false);
      }
    };

    if (!showAuthModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Admin Sign In</h2>
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={authLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={authLoading}
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                <p className="text-red-700 text-sm">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="my-4 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {authLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🔥</span>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Daily Flame Admin</h1>
                <p className="text-gray-600">Manage your daily Bible verses</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <span className="text-sm text-gray-600">
                    {user.email} {isAdmin && '(Admin)'}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>

          {!user ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">Admin access required</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : !isAdmin ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Admin access denied</p>
              <p className="text-sm text-gray-500">Your account does not have admin privileges</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Testing Section */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Testing</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Reset the daily verse status to test the overlay again.
                </p>
                <button
                  onClick={handleTestVerse}
                  disabled={isLoading}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? 'Resetting...' : 'Reset Daily Status'}
                </button>
              </div>

              {/* Verse Preview Section */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Verse Preview Tool</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="verse-reference" className="block text-sm font-medium text-gray-700 mb-2">
                      Bible Reference
                    </label>
                    <input
                      id="verse-reference"
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g., John 3:16, Psalms 23:1-3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Examples: John 3:16, Romans 8:28, Psalms 23:1-6
                    </p>
                  </div>

                  <div>
                    <label htmlFor="bible-translation" className="block text-sm font-medium text-gray-700 mb-2">
                      Translation
                    </label>
                    <select
                      id="bible-translation"
                      value={translation}
                      onChange={(e) => setTranslation(e.target.value as BibleTranslation)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="KJV">KJV - King James Version</option>
                      <option value="WEB">WEB - World English Bible</option>
                      <option value="WEB_BRITISH">WEB British - World English Bible (British)</option>
                      <option value="WEB_UPDATED">WEB Updated - World English Bible (Updated)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handlePreview}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Preview Verse'}
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {previewVerse && (
                  <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="italic text-gray-700 mb-3 text-lg leading-relaxed">
                      "{previewVerse.text}"
                    </div>
                    <div className="font-medium text-gray-800">
                      {previewVerse.reference} ({translation})
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AdminPage />
    </AuthProvider>
  );
};

// Initialize the React app
const container = document.getElementById('admin-root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
```

# src\background\index.ts

```ts
import { VerseService } from '../services/verse-service';
import { ChromeMessage, ChromeResponse } from '../types';

// Google Sign-In handler using chrome.identity API
async function handleGoogleSignIn(): Promise<{ token: string; userInfo: any }> {
  console.log('Background: Starting Google Sign-In process');
  
  return new Promise((resolve, reject) => {
    // Force account selection by using 'any' account parameter
    chrome.identity.getAuthToken({ 
      interactive: true,
      account: { id: 'any' } as any // Force account picker
    }, async (result) => {
      if (chrome.runtime.lastError || !result) {
        console.error('Background: Google Sign-In failed', chrome.runtime.lastError);
        reject(new Error(chrome.runtime.lastError?.message || 'Failed to get auth token'));
        return;
      }
      
      // Extract token from result (could be string or object depending on API version)
      const authToken = typeof result === 'string' ? result : result.token;
      if (!authToken) {
        reject(new Error('No auth token received'));
        return;
      }
      
      console.log('Background: Google Sign-In successful, token received');
      
      // Fetch user info from Google API to get profile photo and details
      try {
        const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authToken}`);
        
        if (!userInfoResponse.ok) {
          console.warn('Background: Failed to fetch user info, proceeding with token only');
          resolve({ token: authToken, userInfo: null });
          return;
        }
        
        const userInfo = await userInfoResponse.json();
        console.log('Background: User info fetched successfully');
        resolve({ token: authToken, userInfo });
      } catch (error) {
        console.warn('Background: Error fetching user info:', error);
        resolve({ token: authToken, userInfo: null });
      }
    });
  });
}

// Clear all cached auth tokens for testing different accounts
async function clearAuthTokens(): Promise<void> {
  console.log('Background: Clearing all cached auth tokens');
  
  return new Promise((resolve, reject) => {
    // First, try to get current token to revoke it
    chrome.identity.getAuthToken({ interactive: false }, (result) => {
      const token = typeof result === 'string' ? result : result?.token;
      if (token) {
        // Revoke the token first
        chrome.identity.removeCachedAuthToken({ token }, () => {
          console.log('Background: Removed cached token');
        });
      }
      
      // Then clear all cached tokens
      chrome.identity.clearAllCachedAuthTokens(() => {
        if (chrome.runtime.lastError) {
          console.error('Background: Error clearing auth tokens', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        console.log('Background: All auth tokens cleared successfully');
        resolve();
      });
    });
  });
}


// Handle messages from content script and other parts of the extension
chrome.runtime.onMessage.addListener((request: ChromeMessage, sender, sendResponse) => {
    if (request.action === 'getVerseShownDate') {
        const today = new Date().toISOString().split("T")[0];
        chrome.storage.local.get("verseShownDate", ({ verseShownDate }) => {
            sendResponse({ 
                success: true,
                verseShownDate: verseShownDate, 
                today: today,
                shouldShow: verseShownDate !== today 
            } as ChromeResponse);
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'setVerseShownDate') {
        const today = new Date().toISOString().split("T")[0];
        chrome.storage.local.set({ verseShownDate: today }, () => {
            console.log('Daily Flame: Verse shown for', today);
            sendResponse({ success: true } as ChromeResponse);
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'clearStorage') {
        chrome.storage.local.clear(() => {
            console.log('Daily Flame: Storage cleared');
            sendResponse({ success: true } as ChromeResponse);
        });
        return true;
    }
    
    if (request.action === 'getDailyVerse') {
        VerseService.getDailyVerse()
            .then(verse => {
                sendResponse({ success: true, verse: verse } as ChromeResponse);
            })
            .catch(error => {
                console.error('Error fetching daily verse:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'getVerse') {
        VerseService.getVerse(request.reference, request.bibleId)
            .then(verse => {
                sendResponse({ success: true, verse: verse } as ChromeResponse);
            })
            .catch(error => {
                console.error('Error fetching verse:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'saveVerses') {
        VerseService.saveVerses(request.verses)
            .then(() => {
                sendResponse({ success: true } as ChromeResponse);
            })
            .catch(error => {
                console.error('Error saving verses:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'getStoredVerses') {
        VerseService.getStoredVerses()
            .then(verses => {
                sendResponse({ success: true, verses: verses } as ChromeResponse);
            })
            .catch(error => {
                console.error('Error getting stored verses:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'googleSignIn') {
        handleGoogleSignIn()
            .then(result => {
                sendResponse({ 
                    success: true, 
                    token: result.token, 
                    userInfo: result.userInfo 
                } as ChromeResponse);
            })
            .catch(error => {
                console.error('Background: Error with Google sign-in:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'clearAuthTokens') {
        clearAuthTokens()
            .then(() => {
                sendResponse({ success: true } as ChromeResponse);
            })
            .catch(error => {
                console.error('Background: Error clearing auth tokens:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }

});

// Handle extension icon clicks - always show verse overlay first
chrome.action.onClicked.addListener((tab) => {
    if (!tab.id || !tab.url) {
        console.log('Background: No tab ID or URL available');
        return;
    }

    // For restricted URLs, open a new tab with a regular website
    const skipSites = ["chrome://", "chrome-extension://", "moz-extension://", "extensions", "about:", "file://"];
    if (skipSites.some(site => tab.url!.includes(site))) {
        console.log('Background: Cannot inject into restricted URL, opening new tab:', tab.url);
        chrome.tabs.create({ url: 'https://www.google.com' }, (newTab) => {
            if (newTab.id) {
                // Wait a moment for the tab to load, then show verse overlay
                setTimeout(() => {
                    chrome.scripting.executeScript({
                        target: { tabId: newTab.id! },
                        func: () => {
                            // Clear storage and show verse overlay
                            if (typeof (window as any).resetDailyFlame === 'function') {
                                (window as any).resetDailyFlame();
                            }
                        }
                    }).catch((error) => {
                        console.error('Background: Error injecting script in new tab:', error);
                    });
                }, 1500);
            }
        });
        return;
    }

    try {
        // For regular URLs, inject content script to show verse overlay
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Always show verse overlay first when icon is clicked (clear storage to force show)
                if (typeof (window as any).resetDailyFlame === 'function') {
                    (window as any).resetDailyFlame();
                }
            }
        }).catch((error) => {
            console.error('Background: Error injecting script:', error);
        });
    } catch (error) {
        console.error('Background: Failed to execute script on tab:', tab.url, error);
    }
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('Daily Flame extension installed');
});
```

# src\components\AdminModal.tsx

```tsx
import React, { useState } from 'react';
import { AdminModalProps, BIBLE_VERSIONS, BibleTranslation, VerseData } from '../types';
import { VerseService } from '../services/verse-service';
import { useAuth } from './AuthContext';

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const [reference, setReference] = useState('');
  const [translation, setTranslation] = useState<BibleTranslation>('KJV');
  const [previewVerse, setPreviewVerse] = useState<VerseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      // Clear form after success
      setEmail('');
      setPassword('');
      setIsSignUp(false);
      
      // Auto-close modal after successful authentication
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setAuthError(err.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await signInWithGoogle();
      // Clear form after success
      setEmail('');
      setPassword('');
      setIsSignUp(false);
      
      // Auto-close modal after successful authentication
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in with Google');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Reset form state
      setEmail('');
      setPassword('');
      setIsSignUp(false);
      setAuthError(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handlePreview = async () => {
    if (!reference || !translation) {
      setError('Please enter a Bible reference and select a translation');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPreviewVerse(null);

    try {
      const verse = await VerseService.getVerse(reference, BIBLE_VERSIONS[translation]);
      setPreviewVerse(verse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    // Prevent propagation to parent VerseOverlay
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onKeyDown={handleModalKeyDown}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            {!user ? (
              <h2 className="text-xl font-semibold text-gray-800">Sign In to Daily Flame</h2>
            ) : isAdmin ? (
              <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
            ) : (
              <h2 className="text-xl font-semibold text-gray-800">Welcome</h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {!user ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </h3>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={authLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={authLoading}
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                  <p className="text-red-700 text-sm">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {authLoading ? `${isSignUp ? 'Signing up' : 'Signing in'}...` : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {authLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {isAdmin ? (
              <>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Admin: Verse Preview Tool</h3>
            
            <div>
              <label htmlFor="verse-reference" className="block text-sm font-medium text-gray-700 mb-2">
                Bible Reference
              </label>
              <input
                id="verse-reference"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., John 3:16, Psalms 23:1-3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: John 3:16, Romans 8:28, Psalms 23:1-6
              </p>
            </div>

            <div>
              <label htmlFor="bible-translation" className="block text-sm font-medium text-gray-700 mb-2">
                Translation
              </label>
              <select
                id="bible-translation"
                value={translation}
                onChange={(e) => setTranslation(e.target.value as BibleTranslation)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="KJV">KJV - King James Version</option>
                <option value="WEB">WEB - World English Bible</option>
                <option value="WEB_BRITISH">WEB British - World English Bible (British)</option>
                <option value="WEB_UPDATED">WEB Updated - World English Bible (Updated)</option>
              </select>
            </div>

            <button
              onClick={handlePreview}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Preview Verse'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {previewVerse && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="italic text-gray-700 mb-2">
                  "{previewVerse.text}"
                </div>
                <div className="font-medium text-gray-800">
                  {previewVerse.reference} ({translation})
                </div>
              </div>
            )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">Welcome, {user.displayName || user.email}!</p>
                <p className="text-sm text-gray-500">You are signed in to Daily Flame</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
```

# src\components\AuthContext.tsx

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from '../services/firebase-config';
import { AuthContextType, FirebaseUser } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin users list (in a real app, this would be in Firestore or a database)
  const adminEmails = [
    'admin@dailyflame.com',
    'e.kibomaseeds@gmail.com', // Your admin email
    // Add more admin emails as needed
  ];

  const isAdmin = user ? adminEmails.includes(user.email || '') : false;
  
  // Special handling for admin@dailyflame.com - treat as verified
  const isEmailVerifiedCheck = user ? (
    user.emailVerified || user.email === 'admin@dailyflame.com'
  ) : false;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      console.log('🔄 [DEBUG] Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      
      if (firebaseUser) {
        console.log('👤 [DEBUG] User details:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          providerData: firebaseUser.providerData.map(p => ({
            providerId: p.providerId,
            email: p.email
          }))
        });
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        console.log('🚪 [DEBUG] No user signed in');
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check email verification (except for admin)
      if (email !== 'admin@dailyflame.com' && !userCredential.user.emailVerified) {
        console.log('🚨 [DEBUG] User email not verified, signing them out');
        console.log('📧 [DEBUG] User email that needs verification:', userCredential.user.email);
        
        // Sign them out immediately if not verified
        await firebaseSignOut(auth);
        
        // Create a special error that includes email verification context
        const verificationError = new Error('VERIFICATION_REQUIRED') as any;
        verificationError.isVerificationError = true;
        verificationError.userEmail = userCredential.user.email;
        throw verificationError;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Map Firebase error codes to user-friendly messages
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            throw new Error('No account found with this email address.');
          case 'auth/wrong-password':
            throw new Error('Incorrect password. Please try again.');
          case 'auth/invalid-email':
            throw new Error('Please enter a valid email address.');
          case 'auth/user-disabled':
            throw new Error('This account has been disabled. Please contact support.');
          case 'auth/too-many-requests':
            throw new Error('Too many failed attempts. Please try again later.');
          case 'auth/invalid-credential':
            throw new Error('Invalid email or password. Please check your credentials.');
          default:
            throw error;
        }
      }
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name if provided
      if (firstName && lastName) {
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`
        });
      }
      
      // Send email verification (except for admin email)
      if (email !== 'admin@dailyflame.com') {
        console.log('🔍 [DEBUG] Sign up successful, attempting to send verification email...');
        console.log('👤 [DEBUG] New user created:', {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified,
          displayName: userCredential.user.displayName
        });
        
        try {
          await sendEmailVerification(userCredential.user);
          console.log('✅ [DEBUG] Verification email sent during sign up to:', userCredential.user.email);
        } catch (emailError: any) {
          console.error('❌ [DEBUG] Failed to send verification email during sign up:', emailError);
          // Don't throw here - let the user know they can resend later
          console.warn('⚠️ [DEBUG] Continuing with sign up despite email verification failure');
        }
        
        // Sign the user out immediately so they can't use the account until verified
        console.log('🔐 [DEBUG] Signing user out to enforce email verification');
        await firebaseSignOut(auth);
        console.log('✅ [DEBUG] User signed out successfully after account creation');
      } else {
        console.log('👑 [DEBUG] Admin account created - auto-verified, no email verification needed');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Map Firebase error codes to user-friendly messages
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            throw new Error('An account with this email address already exists.');
          case 'auth/invalid-email':
            throw new Error('Please enter a valid email address.');
          case 'auth/operation-not-allowed':
            throw new Error('Email/password accounts are not enabled. Please contact support.');
          case 'auth/weak-password':
            throw new Error('Password is too weak. Please choose a stronger password.');
          default:
            throw error;
        }
      }
      
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      console.log('AuthContext: Starting Google Sign-In via background script');
      
      // Send message to background script to handle Google authentication
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ action: 'googleSignIn' }, resolve);
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Google sign-in failed');
      }
      
      const token = response.token;
      const userInfo = response.userInfo;
      
      if (!token) {
        throw new Error('No auth token received from background script');
      }
      
      console.log('AuthContext: Received token from background, creating Firebase credential');

      // Create Firebase credential with the Google token
      const credential = GoogleAuthProvider.credential(null, token);

      // Sign in to Firebase with the credential
      const userCredential = await signInWithCredential(auth, credential);
      
      // Update user profile with photo URL if available from Google
      if (userInfo && userInfo.picture && userCredential.user) {
        try {
          await updateProfile(userCredential.user, {
            photoURL: userInfo.picture,
            displayName: userCredential.user.displayName || userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim()
          });
          console.log('AuthContext: Updated user profile with Google photo and name');
        } catch (profileError) {
          console.warn('AuthContext: Failed to update profile with Google info:', profileError);
        }
      }
      
      console.log('AuthContext: Google sign-in successful');
    } catch (error) {
      console.error('AuthContext: Google sign-in error:', error);
      throw error;
    }
  };


  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    console.log('🔍 [DEBUG] sendVerificationEmail called');
    
    if (!auth.currentUser) {
      console.error('🚨 [DEBUG] No current user found when trying to send verification email');
      throw new Error('No user signed in');
    }
    
    const currentUser = auth.currentUser;
    console.log('👤 [DEBUG] Current user state:', {
      uid: currentUser.uid,
      email: currentUser.email,
      emailVerified: currentUser.emailVerified,
      displayName: currentUser.displayName,
      isAnonymous: currentUser.isAnonymous,
      providerData: currentUser.providerData
    });
    
    try {
      console.log('📧 [DEBUG] Attempting to send verification email to:', currentUser.email);
      await sendEmailVerification(currentUser);
      console.log('✅ [DEBUG] sendEmailVerification() completed successfully');
      console.log('📬 [DEBUG] Verification email should have been sent to:', currentUser.email);
    } catch (error: any) {
      console.error('❌ [DEBUG] Error sending verification email:', error);
      console.error('🔍 [DEBUG] Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Map Firebase email verification errors to user-friendly messages
      if (error.code) {
        switch (error.code) {
          case 'auth/too-many-requests':
            throw new Error('Too many email verification requests. Please wait a few minutes before trying again.');
          case 'auth/user-token-expired':
            throw new Error('Your session has expired. Please sign out and sign back in.');
          case 'auth/network-request-failed':
            throw new Error('Network error. Please check your internet connection and try again.');
          case 'auth/quota-exceeded':
            throw new Error('Email quota exceeded. Please try again later.');
          default:
            throw new Error(`Failed to send verification email: ${error.message}`);
        }
      }
      
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    sendVerificationEmail,
    isAdmin,
    isEmailVerified: isEmailVerifiedCheck,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
```

# src\components\AuthModal.tsx

```tsx
import React, { useState } from 'react';
import { AuthModalProps } from '../types';
import { useAuth } from './AuthContext';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      onAuthSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      onAuthSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <h2 className="text-xl font-semibold text-gray-800">
              Admin {isSignUp ? 'Sign Up' : 'Sign In'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? `${isSignUp ? 'Signing up' : 'Signing in'}...` : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="my-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="my-4 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Admin access required. Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
```

# src\components\PasswordInput.tsx

```tsx
import React, { useState } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
  error?: string | null;
  name?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
  error,
  name
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`df-glassmorphism-input w-full pr-10 px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${error ? 'border-red-400 border-opacity-70' : ''} ${className}`}
        disabled={disabled}
        name={name}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className={`absolute right-3 top-1/2 transform -translate-y-0.5 text-white text-opacity-70 hover:text-opacity-100 transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        disabled={disabled}
      >
        {showPassword ? (
          // Eye slash icon (hide password)
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
            />
          </svg>
        ) : (
          // Eye icon (show password)
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-300">{error}</p>
      )}
    </div>
  );
};

export default PasswordInput;
```

# src\components\Toast.tsx

```tsx
import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show toast with animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 max-w-sm";
    
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-600 bg-opacity-90 border-green-400 text-white translate-x-0 opacity-100`;
      case 'error':
        return `${baseStyles} bg-red-600 bg-opacity-90 border-red-400 text-white translate-x-0 opacity-100`;
      case 'info':
        return `${baseStyles} bg-blue-600 bg-opacity-90 border-blue-400 text-white translate-x-0 opacity-100`;
      default:
        return `${baseStyles} bg-gray-600 bg-opacity-90 border-gray-400 text-white translate-x-0 opacity-100`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center">
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-3 text-white hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
```

# src\components\ToastContext.tsx

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info', duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const value: ToastContextType = {
    showToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Render toasts */}
      <div className="fixed top-0 right-0 z-50 space-y-2 p-4">
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ top: `${index * 80}px` }} className="relative">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
```

# src\components\VerseOverlay.tsx

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { VerseOverlayProps, BIBLE_VERSIONS, BibleTranslation, VerseData } from '../types';
import { VerseService } from '../services/verse-service';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import PasswordInput from './PasswordInput';
import '../styles/globals.css';

const VerseOverlay: React.FC<VerseOverlayProps> = ({ 
  verse, 
  onDismiss
}) => {
  const { user, isAdmin, signIn, signUp, signInWithGoogle, signOut, sendVerificationEmail, isEmailVerified } = useAuth();
  const { showToast } = useToast();
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  
  // GSAP animation refs
  const verseTextRef = useRef<HTMLParagraphElement>(null);
  const verseReferenceRef = useRef<HTMLParagraphElement>(null);
  const verseContentRef = useRef<HTMLDivElement>(null);
  
  // Debug logging
  useEffect(() => {
    console.log('VerseOverlay: Auth state changed', { user, isAdmin });
  }, [user, isAdmin]);
  
  // Admin verse controls state
  const [adminReference, setAdminReference] = useState('');
  const [adminTranslation, setAdminTranslation] = useState<BibleTranslation>('KJV');
  const [adminPreviewVerse, setAdminPreviewVerse] = useState<VerseData | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  
  // Authentication state
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form validation and state
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    // Focus the done button after a short delay
    const timer = setTimeout(() => {
      doneButtonRef.current?.focus();
    }, 100);

    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';

    // Click outside handler for profile dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileDropdown) {
        const target = event.target as Element;
        if (!target.closest('.profile-dropdown')) {
          setShowProfileDropdown(false);
        }
      }
    };

    // Keyboard shortcut for clearing auth tokens (Ctrl+Shift+C)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        handleClearAuthTokens();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfileDropdown]);

  // GSAP Animation Setup
  useGSAP(() => {
    console.log('GSAP useGSAP hook running');
    
    // Split verse text into words for word-by-word animation
    if (verseTextRef.current && verseReferenceRef.current && doneButtonRef.current && verseContentRef.current) {
      console.log('All refs are available, setting up animation');
      
      // Ensure parent container is visible
      gsap.set(verseContentRef.current, {
        opacity: 1
      });
      
      // Set initial states for animation elements
      // Don't hide verseTextRef since we're animating the words inside it
      gsap.set([verseReferenceRef.current, doneButtonRef.current], {
        opacity: 0,
        y: 30,
        scale: 0.95
      });
      
      // Make sure the verse text container is visible
      gsap.set(verseTextRef.current, {
        opacity: 1
      });
      
      const verseWords = verse.text.split(' ');
      const wordSpans = verseWords.map((word, index) => 
        `<span class="verse-word">${word}</span>`
      ).join('');
      
      verseTextRef.current.innerHTML = `"${wordSpans}"`;
    
      // Get all word spans for animation
      const wordElements = verseTextRef.current.querySelectorAll('.verse-word');
      console.log('Found word elements:', wordElements.length);
      
      if (wordElements.length > 0) {
        // Set initial state for word elements
        gsap.set(wordElements, {
          opacity: 0,
          y: 20,
          display: 'inline-block'
        });
        
        // Create timeline for smooth verse reveal
        const tl = gsap.timeline({ 
          delay: 0.3,
          onStart: () => {
            console.log('GSAP timeline started');
          },
          onComplete: () => {
            console.log('GSAP timeline completed');
          }
        });
        
        // Animate words one by one with stagger
        tl.to(wordElements, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08, // 80ms delay between each word
          clearProps: "all" // Clear inline styles after animation
        })
        // Then animate verse reference
        .to(verseReferenceRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "all"
        }, "-=0.4") // Start before words finish
        // Finally animate done button
        .to(doneButtonRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          clearProps: "all"
        }, "-=0.2"); // Start before reference finishes
        
        // Force play the timeline
        tl.play();
      } else {
        console.error('No word elements found to animate');
      }
    } else {
      console.error('One or more refs are null:', {
        verseText: !!verseTextRef.current,
        verseReference: !!verseReferenceRef.current,
        doneButton: !!doneButtonRef.current
      });
    }

  }, { dependencies: [verse.text, verse.reference], scope: verseContentRef });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Disable keyboard dismissal to prevent accidental dismissal when testing admin features
    // Only the "Done" button should dismiss the overlay
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Disable click-to-dismiss to prevent accidental dismissal when testing admin features
    // Only the "Done" button should dismiss the overlay
  };

  const handleAdminPreview = async () => {
    if (!adminReference || !adminTranslation) {
      setAdminError('Please enter a Bible reference and select a translation');
      return;
    }

    setAdminLoading(true);
    setAdminError(null);
    setAdminPreviewVerse(null);

    try {
      const previewVerse = await VerseService.getVerse(adminReference, BIBLE_VERSIONS[adminTranslation]);
      setAdminPreviewVerse(previewVerse);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to load verse');
    } finally {
      setAdminLoading(false);
    }
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordError(validateConfirmPassword(password, confirmPassword));
  };

  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRememberMe(false);
    setAuthError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      await signIn(email, password);
      clearForm();
      setShowSignIn(false);
      showToast('Successfully signed in!', 'success');
    } catch (err: any) {
      // Check if this is a verification error
      if (err.isVerificationError) {
        setAuthError('VERIFICATION_REQUIRED');
      } else {
        setAuthError(err.message || 'Failed to sign in');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await signInWithGoogle();
      setAuthError(null);
      setShowSignIn(false);
      setShowSignUp(false);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in with Google');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setAuthError('Please fill in all fields');
      return;
    }

    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);

    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (confirmPasswordValidation) {
      setConfirmPasswordError(confirmPasswordValidation);
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    try {
      // TODO: Update signUp to accept first/last name
      await signUp(email, password, firstName, lastName);
      clearForm();
      setShowSignUp(false);
      setShowEmailVerification(true);
      showToast('Account created! Please check your email for verification.', 'success');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create account');
    } finally {
      setAuthLoading(false);
    }
  };

  const switchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
    setShowEmailVerification(false);
    clearForm();
  };

  const switchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
    setShowEmailVerification(false);
    clearForm();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowProfileDropdown(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleClearAuthTokens = async () => {
    try {
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ action: 'clearAuthTokens' }, resolve);
      });
      
      if (response && response.success) {
        console.log('Auth tokens cleared successfully');
        showToast('Auth tokens cleared! You can now test with different Google accounts.', 'success');
      } else {
        console.error('Failed to clear auth tokens:', response?.error);
        showToast('Failed to clear auth tokens. Try using Ctrl+Shift+C shortcut or sign out.', 'error');
      }
    } catch (error) {
      console.error('Error clearing auth tokens:', error);
      showToast('Error clearing auth tokens. Try the keyboard shortcut Ctrl+Shift+C.', 'error');
    }
  };

  const getUserInitials = (user: any) => {
    if (user.displayName) {
      return user.displayName.split(' ').map((name: string) => name[0]).join('').toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserAvatar = (user: any) => {
    // For Google users, we might have a photoURL
    if (user.photoURL) {
      return user.photoURL;
    }
    return null;
  };

  const handleResendVerification = async () => {
    try {
      setAuthLoading(true);
      
      // First, sign the user back in temporarily to send verification email
      await signIn(email, password);
      
      // Now send the verification email
      await sendVerificationEmail();
      
      // Sign them back out
      await signOut();
      
      showToast('Verification email sent! Please check your inbox and spam folder.', 'success');
      setAuthError(null);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      showToast('Failed to resend verification email. Please try again.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div 
      className="verse-overlay"
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
      tabIndex={0}
    >
      {/* Top-Right Controls */}
      <div className="absolute top-4 right-4">
        {!user ? (
          /* Sign In Button - Only visible when not authenticated */
          <button
            onClick={() => setShowSignIn(true)}
            className="df-glassmorphism-element px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors backdrop-blur-sm border border-white border-opacity-30"
          >
            Sign In
          </button>
        ) : (
          /* Profile Dropdown - Only visible when authenticated */
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="df-glassmorphism-element flex items-center gap-2 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors backdrop-blur-sm border border-white border-opacity-30"
            >
              {getUserAvatar(user) ? (
                <img
                  src={getUserAvatar(user)}
                  alt="Profile"
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {getUserInitials(user)}
                </div>
              )}
              <span className="text-sm">{user.displayName || user.email?.split('@')[0]}</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="df-glassmorphism-dropdown absolute top-12 right-0 w-64 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 p-2 z-20">
                <div className="px-3 py-2 border-b border-white border-opacity-20 mb-2">
                  <p className="text-white text-sm font-medium">{user.displayName || 'User'}</p>
                  <p className="text-white text-opacity-70 text-xs">{user.email}</p>
                  <div className="mt-1 flex gap-2">
                    {isAdmin && (
                      <span className="inline-block px-2 py-1 bg-green-600 bg-opacity-20 text-green-200 text-xs rounded border border-green-400 border-opacity-50">
                        Admin
                      </span>
                    )}
                    {!isEmailVerified && (
                      <span className="inline-block px-2 py-1 bg-yellow-600 bg-opacity-20 text-yellow-200 text-xs rounded border border-yellow-400 border-opacity-50">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Email Verification Section */}
                {!isEmailVerified && (
                  <button
                    onClick={async () => {
                      try {
                        await sendVerificationEmail();
                        showToast('Verification email sent! Please check your inbox.', 'success');
                      } catch (error) {
                        console.error('Error sending verification email:', error);
                        showToast('Failed to send verification email. Please try again.', 'error');
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-white text-sm hover:bg-white hover:bg-opacity-10 rounded transition-colors"
                  >
                    Resend Verification Email
                  </button>
                )}
                
                {/* Clear Auth Tokens */}
                <button
                  onClick={handleClearAuthTokens}
                  className="w-full text-left px-3 py-2 text-white text-sm hover:bg-white hover:bg-opacity-10 rounded transition-colors"
                  title="Clear auth tokens to test with different Google accounts"
                >
                  Clear Auth Tokens
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-white text-sm hover:bg-white hover:bg-opacity-10 rounded transition-colors border-t border-white border-opacity-20 mt-2 pt-2"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sign-In Modal */}
      {showSignIn && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="df-glassmorphism-modal bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg border border-white border-opacity-20 w-80 max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Sign In</h3>
              <button
                onClick={() => setShowSignIn(false)}
                className="text-white hover:text-gray-300 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="df-glassmorphism-input w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                disabled={authLoading}
              />
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Password"
                disabled={authLoading}
              />
              
              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 rounded"
                  disabled={authLoading}
                />
                <label htmlFor="rememberMe" className="text-white text-sm">
                  Remember me
                </label>
              </div>
              
              {authError && (
                <div className="p-3 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded text-red-200 text-sm">
                  {authError === 'VERIFICATION_REQUIRED' ? (
                    <div>
                      <p className="mb-2 text-red-200 text-sm">
                        Please verify your email before signing in. Check your inbox for a verification link.
                      </p>
                      <p className="text-red-200 text-sm">
                        Didn't receive an email?{' '}
                        <button
                          onClick={handleResendVerification}
                          disabled={authLoading}
                          className={`text-blue-300 underline bg-transparent border-none text-inherit font-medium p-0 ${authLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {authLoading ? 'Sending...' : 'Resend verification link here'}
                        </button>
                      </p>
                      <p className="mt-2 text-red-200 text-opacity-75 text-xs">
                        Make sure to check your spam folder. Emails can take a few minutes to arrive.
                      </p>
                    </div>
                  ) : (
                    authError
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className={`w-full px-4 py-2 rounded text-sm font-medium border-none transition-colors outline-none bg-blue-600 text-white ${authLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'}`}
                >
                  {authLoading ? 'Signing in...' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className={`w-full px-4 py-2 rounded text-sm font-medium border-none transition-colors outline-none bg-white bg-opacity-20 text-white flex items-center justify-center gap-2 ${authLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-30 cursor-pointer'}`}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </form>
            
            {/* Sign-up link */}
            <div className="mt-4 text-center">
              <p className="text-white text-sm">
                Don't have an account?{' '}
                <button
                  onClick={switchToSignUp}
                  className="text-blue-300 hover:text-blue-200 underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sign-Up Modal */}
      {showSignUp && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="df-glassmorphism-modal bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg border border-white border-opacity-20 w-80 max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Create Account</h3>
              <button
                onClick={() => setShowSignUp(false)}
                className="text-white hover:text-gray-300 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="df-glassmorphism-input w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  disabled={authLoading}
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="df-glassmorphism-input w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  disabled={authLoading}
                />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="df-glassmorphism-input w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                disabled={authLoading}
              />
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Password"
                disabled={authLoading}
                error={passwordError}
                name="password"
              />
              <div onBlur={handleConfirmPasswordBlur}>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm Password"
                  disabled={authLoading}
                  error={confirmPasswordError}
                  name="confirmPassword"
                />
              </div>
              
              {authError && (
                <div className="p-2 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded text-red-200 text-sm">
                  {authError}
                </div>
              )}
              
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white py-2 px-4 rounded transition-colors"
                >
                  {authLoading ? 'Creating Account...' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:bg-gray-500 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </button>
              </div>
            </form>
            
            {/* Sign-in link */}
            <div className="mt-4 text-center">
              <p className="text-white text-sm">
                Already have an account?{' '}
                <button
                  onClick={switchToSignIn}
                  className="text-blue-300 hover:text-blue-200 underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showEmailVerification && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="df-glassmorphism-modal bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg border border-white border-opacity-20 w-80 max-w-sm">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Check Your Email</h3>
              <p className="text-white text-sm mb-4">
                We've sent a verification link to your email address. Please click the link to verify your account before signing in.
              </p>
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    try {
                      await sendVerificationEmail();
                      showToast('Verification email resent!', 'success');
                    } catch (error) {
                      showToast('Failed to resend email. Please try again.', 'error');
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Resend Email
                </button>
                <button
                  onClick={() => {
                    setShowEmailVerification(false);
                    switchToSignIn();
                  }}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={verseContentRef} className="verse-content">

        {/* Admin Controls - Only visible to authenticated admins */}
        {user && isAdmin && (
          <div className="df-glassmorphism-modal mb-8 p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg backdrop-blur-sm">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <span>⚙️</span>
              Admin: Set Daily Verse
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={adminReference}
                  onChange={(e) => setAdminReference(e.target.value)}
                  placeholder="e.g., John 3:16, Psalms 23:1-3"
                  className="df-glassmorphism-input flex-1 px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
                <select
                  value={adminTranslation}
                  onChange={(e) => setAdminTranslation(e.target.value as BibleTranslation)}
                  className="df-glassmorphism-input px-3 py-2 rounded bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="KJV" className="text-black">KJV</option>
                  <option value="WEB" className="text-black">WEB</option>
                  <option value="WEB_BRITISH" className="text-black">WEB British</option>
                  <option value="WEB_UPDATED" className="text-black">WEB Updated</option>
                </select>
                <button
                  onClick={handleAdminPreview}
                  disabled={adminLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded transition-colors"
                >
                  {adminLoading ? 'Loading...' : 'Preview'}
                </button>
              </div>
              
              {adminError && (
                <div className="p-2 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded text-red-200 text-sm">
                  {adminError}
                </div>
              )}
              
              {adminPreviewVerse && (
                <div className="p-3 bg-yellow-500 bg-opacity-20 border border-yellow-400 border-opacity-50 rounded">
                  <p className="text-yellow-100 italic mb-2">
                    Preview: "{adminPreviewVerse.text}"
                  </p>
                  <p className="text-yellow-200 font-medium text-sm">
                    {adminPreviewVerse.reference} ({adminTranslation})
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-10">
          <p ref={verseTextRef} className="verse-text">
            "{verse.text}"
          </p>
          <p ref={verseReferenceRef} className="verse-reference">
            {verse.reference}
          </p>
        </div>
        <button
          ref={doneButtonRef}
          className="verse-done-btn"
          onClick={onDismiss}
          type="button"
        >
          Done
        </button>
      </div>

    </div>
  );
};

export default VerseOverlay;

```

# src\content\index.ts

```ts
import React from 'react';
import { createRoot } from 'react-dom/client';
import VerseOverlay from '../components/VerseOverlay';
import { AuthProvider } from '../components/AuthContext';
import { ToastProvider } from '../components/ToastContext';
import { VerseData, ChromeMessage, ChromeResponse } from '../types';

(function() {
    'use strict';
    
    // Add global function to reset verse (for testing)
    (window as any).resetDailyFlame = function() {
        // If overlay already exists, just clear storage and return
        const existingOverlay = document.getElementById('daily-flame-extension-root');
        if (existingOverlay) {
            console.log('Daily Flame: Overlay already exists, not recreating');
            // Just clear storage to allow showing again
            chrome.runtime.sendMessage({ action: 'clearStorage' }, (response: ChromeResponse) => {
                console.log('Daily Flame: Storage cleared, overlay already visible');
            });
            return;
        }
        
        // Clear storage and show verse overlay immediately
        chrome.runtime.sendMessage({ action: 'clearStorage' }, (response: ChromeResponse) => {
            console.log('Daily Flame: Storage cleared, showing verse overlay');
            // Show verse overlay immediately without page reload
            createVerseOverlay();
        });
    };

    
    const skipSites = [
        "chrome://", 
        "chrome-extension://", 
        "moz-extension://", 
        "extensions",
        "accounts.google.com",
        "accounts.googleapis.com",
        "www.google.com/accounts",
        "oauth.google.com"
    ];
    
    if (skipSites.some(site => window.location.href.includes(site))) {
        console.log('Daily Flame: Skipping restricted site:', window.location.href);
        return;
    }
    
    // Initialize with proper timing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Add small delay to ensure page is fully ready
            setTimeout(initDailyFlame, 100);
        });
    } else {
        // Add small delay for already loaded pages
        setTimeout(initDailyFlame, 100);
    }
    
    let isInitialized = false;
    
    function initDailyFlame() {
        // Prevent multiple initializations
        if (isInitialized) {
            console.log('Daily Flame: Already initialized, skipping');
            return;
        }
        
        console.log('Daily Flame: Initializing on:', window.location.href);
        isInitialized = true;
        
        try {
            chrome.runtime.sendMessage({ action: 'getVerseShownDate' }, (response: ChromeResponse) => {
                if (chrome.runtime.lastError) {
                    console.error('Daily Flame: Runtime error:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.shouldShow) {
                    console.log('Daily Flame: Should show verse, creating overlay');
                    createVerseOverlay();
                } else {
                    console.log('Daily Flame: Verse already shown today or not needed');
                }
            });
        } catch (error) {
            console.error('Daily Flame: Error during initialization:', error);
        }
    }
    
    async function createVerseOverlay() {
        if (document.getElementById('daily-flame-extension-root')) {
            return;
        }
        
        try {
            // Get today's verse from the background script
            const verseResponse = await sendMessage({ action: 'getDailyVerse' });
            
            if (!verseResponse.success) {
                // Fallback to hardcoded verse if API fails
                const fallbackVerse: VerseData = {
                    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
                    reference: "Jeremiah 29:11",
                    bibleId: "de4e12af7f28f599-02"
                };
                renderOverlay(fallbackVerse);
                return;
            }
            
            renderOverlay(verseResponse.verse);
            
        } catch (error) {
            console.error('Daily Flame: Error creating overlay:', error);
            // Still show overlay with fallback verse
            const fallbackVerse: VerseData = {
                text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
                reference: "Proverbs 3:5-6",
                bibleId: "de4e12af7f28f599-02"
            };
            renderOverlay(fallbackVerse);
        }
    }
    
    function renderOverlay(verse: VerseData) {
        // Create high-specificity container for CSS isolation
        const overlayContainer = document.createElement('div');
        overlayContainer.id = 'daily-flame-extension-root';
        
        // Apply initial styles to ensure proper isolation
        overlayContainer.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 999999 !important;
            pointer-events: auto !important;
        `;
        
        // Create inner container for React app
        const reactContainer = document.createElement('div');
        reactContainer.id = 'daily-flame-overlay';
        overlayContainer.appendChild(reactContainer);
        
        // Add the overlay container to the page
        document.body.appendChild(overlayContainer);
        
        // Prevent scrolling on the body
        document.body.style.overflow = 'hidden';
        
        // Create React root
        const root = createRoot(reactContainer);
        
        // Error boundary component
        class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
            constructor(props: {children: React.ReactNode}) {
                super(props);
                this.state = { hasError: false };
            }
            
            static getDerivedStateFromError() {
                return { hasError: true };
            }
            
            componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
                console.error('Daily Flame: React error caught:', error, errorInfo);
            }
            
            render() {
                if (this.state.hasError) {
                    return React.createElement('div', {
                        style: { 
                            position: 'fixed', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            bottom: 0, 
                            backgroundColor: 'rgba(0,0,0,0.9)', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            zIndex: 999999
                        }
                    }, 'Daily Flame encountered an error. Please refresh the page.');
                }
                
                return this.props.children;
            }
        }
        
        const OverlayApp = () => {
            const handleDismiss = () => {
                dismissOverlay();
            };
            
            return React.createElement(ErrorBoundary, { 
                children: React.createElement(ToastProvider, { 
                    children: React.createElement(AuthProvider, { 
                        children: React.createElement(VerseOverlay, {
                            verse,
                            onDismiss: handleDismiss
                        })
                    })
                })
            });
        };
        
        root.render(React.createElement(OverlayApp));
    }
    
    function dismissOverlay() {
        try {
            const overlay = document.getElementById('daily-flame-extension-root');
            if (overlay) {
                console.log('Daily Flame: Dismissing verse overlay');
                
                // Clean up styles first
                document.body.style.overflow = '';
                
                // Remove overlay with a small delay to allow React cleanup
                setTimeout(() => {
                    overlay.remove();
                }, 100);
                
                // Save to storage that verse was shown today
                chrome.runtime.sendMessage({ action: 'setVerseShownDate' }, (response: ChromeResponse) => {
                    if (chrome.runtime.lastError) {
                        console.error('Daily Flame: Error setting verse shown date:', chrome.runtime.lastError);
                    } else if (response && response.success) {
                        console.log('Daily Flame: Verse dismissed for today');
                    }
                });
            }
        } catch (error) {
            console.error('Daily Flame: Error dismissing overlay:', error);
        }
    }
    

    function sendMessage(message: ChromeMessage): Promise<ChromeResponse> {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, resolve);
        });
    }
})();
```

# src\newtab\index.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import VerseOverlay from '../components/VerseOverlay';
import { AuthProvider } from '../components/AuthContext';
import { ToastProvider } from '../components/ToastContext';
import { VerseData, ChromeMessage, ChromeResponse } from '../types';
import '../styles/globals.css';

const NewTabPage: React.FC = () => {
  const [showVerseOverlay, setShowVerseOverlay] = useState(false);
  const [verse, setVerse] = useState<VerseData | null>(null);

  useEffect(() => {
    // Check if we should show the verse overlay
    checkAndShowVerse();
  }, []);

  const checkAndShowVerse = async () => {
    try {
      // Check if verse should be shown today
      const response = await sendMessage({ action: 'getVerseShownDate' });
      
      if (response && response.shouldShow) {
        console.log('New Tab: Should show verse overlay');
        
        // Get today's verse
        const verseResponse = await sendMessage({ action: 'getDailyVerse' });
        
        if (verseResponse.success) {
          setVerse(verseResponse.verse);
          setShowVerseOverlay(true);
        } else {
          // Fallback verse if API fails
          const fallbackVerse: VerseData = {
            text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
            reference: "Jeremiah 29:11",
            bibleId: "de4e12af7f28f599-02"
          };
          setVerse(fallbackVerse);
          setShowVerseOverlay(true);
        }
      } else {
        console.log('New Tab: Verse already shown today or not needed');
        // If no verse needed, redirect to default new tab immediately
        redirectToDefaultNewTab();
      }
    } catch (error) {
      console.error('New Tab: Error checking verse status:', error);
      // On error, just redirect to default new tab
      redirectToDefaultNewTab();
    }
  };

  const handleDismissVerse = async () => {
    try {
      // Mark verse as shown for today
      await sendMessage({ action: 'setVerseShownDate' });
      console.log('New Tab: Verse dismissed for today');
      
      // Redirect back to default new tab page
      redirectToDefaultNewTab();
    } catch (error) {
      console.error('New Tab: Error dismissing verse:', error);
      // Still redirect even if there's an error
      redirectToDefaultNewTab();
    }
  };

  const redirectToDefaultNewTab = () => {
    // Navigate to chrome's default new tab page
    window.location.href = 'chrome://newtab/';
  };

  const sendMessage = (message: ChromeMessage): Promise<ChromeResponse> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  };

  // If no verse overlay is needed, show loading state while redirecting
  if (!showVerseOverlay && !verse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4">🔥</div>
          <h1 className="text-2xl font-light text-gray-600 mb-2">Daily Flame</h1>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Verse Overlay */}
      {showVerseOverlay && verse && (
        <ToastProvider>
          <AuthProvider>
            <VerseOverlay 
              verse={verse} 
              onDismiss={handleDismissVerse}
            />
          </AuthProvider>
        </ToastProvider>
      )}
    </>
  );
};

// Initialize the React app
const container = document.getElementById('newtab-root');
if (container) {
  const root = createRoot(container);
  root.render(<NewTabPage />);
}
```

# src\newtab\newtab.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Flame</title>
</head>
<body>
    <div id="newtab-root"></div>
    <script src="newtab.js"></script>
</body>
</html>
```

# src\services\firebase-config.ts

```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANFOOgSGPLhyzri5jaPOYmAv-CeGIv4zs",
  authDomain: "daily-flame.firebaseapp.com",
  projectId: "daily-flame",
  storageBucket: "daily-flame.firebasestorage.app",
  messagingSenderId: "129859451154",
  appId: "1:129859451154:web:583759894f1ce471b35bcb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
```

# src\services\verse-service.ts

```ts
import {
  VerseData,
  StoredVerse,
  ApiResponse,
  PassageResponse,
  BIBLE_VERSIONS,
  BibleTranslation,
  BibleVersion
} from '../types';

export class VerseService {
  private static readonly API_KEY = '58410e50f19ea158ea4902e05191db02';
  private static readonly BASE_URL = 'https://api.scripture.api.bible/v1';

  static async getBibles(): Promise<BibleVersion[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/bibles`, {
        headers: {
          'api-key': this.API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data: ApiResponse<BibleVersion[]> = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Bibles:', error);
      throw error;
    }
  }

  static async getVerse(reference: string, bibleId: string = BIBLE_VERSIONS.KJV): Promise<VerseData> {
    try {
      const apiReference = this.convertReferenceToApiFormat(reference);
      const url = `${this.BASE_URL}/bibles/${bibleId}/passages/${apiReference}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false`;
      
      console.log('Daily Flame API Call:', {
        reference: reference,
        apiReference: apiReference,
        bibleId: bibleId,
        url: url
      });
      
      const response = await fetch(url, {
        headers: {
          'api-key': this.API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
      }
      
      const data: ApiResponse<PassageResponse> = await response.json();
      
      if (!data.data || !data.data.content) {
        throw new Error('No verse content found');
      }
      
      // Clean up the text content
      let text = data.data.content;
      text = text.replace(/[\r\n]+/g, ' ').trim();
      text = text.replace(/\s+/g, ' ');
      
      return {
        text: text,
        reference: data.data.reference || reference,
        bibleId: bibleId
      };
      
    } catch (error) {
      console.error('Error fetching verse:', error);
      throw error;
    }
  }

  static async getRandomVerse(verseList?: StoredVerse[]): Promise<VerseData> {
    try {
      const verses = verseList || await this.getStoredVerses();
      
      if (!verses || verses.length === 0) {
        throw new Error('No verses available');
      }
      
      const randomIndex = Math.floor(Math.random() * verses.length);
      const selectedVerse = verses[randomIndex];
      
      return await this.getVerse(selectedVerse.reference, selectedVerse.bibleId);
      
    } catch (error) {
      console.error('Error getting random verse:', error);
      throw error;
    }
  }

  static async getDailyVerse(): Promise<VerseData> {
    try {
      const verses = await this.getStoredVerses();
      
      if (!verses || verses.length === 0) {
        throw new Error('No verses configured');
      }
      
      // Use date as seed for consistent daily verse
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const verseIndex = dayOfYear % verses.length;
      
      const selectedVerse = verses[verseIndex];
      return await this.getVerse(selectedVerse.reference, selectedVerse.bibleId);
      
    } catch (error) {
      console.error('Error getting daily verse:', error);
      throw error;
    }
  }

  static async getStoredVerses(): Promise<StoredVerse[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get('verseList', (result) => {
        resolve(result.verseList || this.getDefaultVerses());
      });
    });
  }

  static async saveVerses(verses: StoredVerse[]): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ verseList: verses }, () => {
        resolve(true);
      });
    });
  }

  static getDefaultVerses(): StoredVerse[] {
    const kjvId = BIBLE_VERSIONS.KJV;
    return [
      { reference: 'John 3:16', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
      { reference: 'Jeremiah 29:11', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
      { reference: 'Philippians 4:13', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
      { reference: 'Romans 8:28', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
      { reference: 'Joshua 1:9', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
      { reference: 'Proverbs 3:5-6', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
      { reference: '1 Peter 5:7', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() }
    ];
  }

  private static convertReferenceToApiFormat(reference: string): string {
    const bookMappings: Record<string, string> = {
      // Old Testament
      'genesis': 'GEN', 'gen': 'GEN',
      'exodus': 'EXO', 'exo': 'EXO', 'ex': 'EXO',
      'leviticus': 'LEV', 'lev': 'LEV',
      'numbers': 'NUM', 'num': 'NUM',
      'deuteronomy': 'DEU', 'deut': 'DEU', 'deu': 'DEU',
      'joshua': 'JOS', 'josh': 'JOS', 'jos': 'JOS',
      'judges': 'JDG', 'judg': 'JDG', 'jdg': 'JDG',
      'ruth': 'RUT', 'rut': 'RUT',
      '1 samuel': '1SA', '1samuel': '1SA', '1sa': '1SA', '1 sam': '1SA', '1sam': '1SA',
      '2 samuel': '2SA', '2samuel': '2SA', '2sa': '2SA', '2 sam': '2SA', '2sam': '2SA',
      '1 kings': '1KI', '1kings': '1KI', '1ki': '1KI', '1 kgs': '1KI', '1kgs': '1KI',
      '2 kings': '2KI', '2kings': '2KI', '2ki': '2KI', '2 kgs': '2KI', '2kgs': '2KI',
      'psalms': 'PSA', 'psalm': 'PSA', 'psa': 'PSA', 'ps': 'PSA',
      'proverbs': 'PRO', 'prov': 'PRO', 'pro': 'PRO',
      'ecclesiastes': 'ECC', 'eccl': 'ECC', 'ecc': 'ECC',
      'isaiah': 'ISA', 'isa': 'ISA',
      'jeremiah': 'JER', 'jer': 'JER',
      'ezekiel': 'EZK', 'ezek': 'EZK', 'ezk': 'EZK',
      'daniel': 'DAN', 'dan': 'DAN',
      // New Testament
      'matthew': 'MAT', 'matt': 'MAT', 'mat': 'MAT', 'mt': 'MAT',
      'mark': 'MRK', 'mrk': 'MRK', 'mk': 'MRK',
      'luke': 'LUK', 'luk': 'LUK', 'lk': 'LUK',
      'john': 'JHN', 'jhn': 'JHN', 'jn': 'JHN',
      'acts': 'ACT', 'act': 'ACT',
      'romans': 'ROM', 'rom': 'ROM',
      '1 corinthians': '1CO', '1corinthians': '1CO', '1co': '1CO', '1 cor': '1CO', '1cor': '1CO',
      '2 corinthians': '2CO', '2corinthians': '2CO', '2co': '2CO', '2 cor': '2CO', '2cor': '2CO',
      'galatians': 'GAL', 'gal': 'GAL',
      'ephesians': 'EPH', 'eph': 'EPH',
      'philippians': 'PHP', 'phil': 'PHP', 'php': 'PHP',
      'colossians': 'COL', 'col': 'COL',
      '1 thessalonians': '1TH', '1thessalonians': '1TH', '1th': '1TH', '1 thess': '1TH', '1thess': '1TH',
      '2 thessalonians': '2TH', '2thessalonians': '2TH', '2th': '2TH', '2 thess': '2TH', '2thess': '2TH',
      '1 timothy': '1TI', '1timothy': '1TI', '1ti': '1TI', '1 tim': '1TI', '1tim': '1TI',
      '2 timothy': '2TI', '2timothy': '2TI', '2ti': '2TI', '2 tim': '2TI', '2tim': '2TI',
      'titus': 'TIT', 'tit': 'TIT',
      'philemon': 'PHM', 'phlm': 'PHM', 'phm': 'PHM',
      'hebrews': 'HEB', 'heb': 'HEB',
      'james': 'JAS', 'jas': 'JAS',
      '1 peter': '1PE', '1peter': '1PE', '1pe': '1PE', '1 pet': '1PE', '1pet': '1PE',
      '2 peter': '2PE', '2peter': '2PE', '2pe': '2PE', '2 pet': '2PE', '2pet': '2PE',
      '1 john': '1JN', '1john': '1JN', '1jn': '1JN', '1 jn': '1JN',
      '2 john': '2JN', '2john': '2JN', '2jn': '2JN', '2 jn': '2JN',
      '3 john': '3JN', '3john': '3JN', '3jn': '3JN', '3 jn': '3JN',
      'jude': 'JUD', 'jud': 'JUD',
      'revelation': 'REV', 'rev': 'REV'
    };
    
    try {
      const match = reference.match(/^([123]?\s*[a-zA-Z]+)\s+(\d+):(\d+)(?:-(\d+))?$/i);
      if (!match) {
        throw new Error(`Invalid reference format: ${reference}`);
      }
      
      const [, bookName, chapter, startVerse, endVerse] = match;
      const bookKey = bookName.toLowerCase().trim();
      const bookCode = bookMappings[bookKey];
      
      if (!bookCode) {
        throw new Error(`Unknown book: ${bookName}`);
      }
      
      if (endVerse) {
        return `${bookCode}.${chapter}.${startVerse}-${bookCode}.${chapter}.${endVerse}`;
      } else {
        return `${bookCode}.${chapter}.${startVerse}`;
      }
      
    } catch (error) {
      console.error('Reference conversion error:', error);
      return reference.replace(/\s+/g, '');
    }
  }

  static isValidReference(reference: string): boolean {
    const referencePattern = /^[1-3]?\s*[A-Za-z]+\s+\d+:\d+(-\d+)?$/;
    return referencePattern.test(reference.trim());
  }
}
```

# src\styles\globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .verse-overlay {
    @apply fixed inset-0 bg-black flex items-center justify-center z-[999999] p-5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  .verse-content {
    @apply max-w-2xl text-center text-white;
  }

  .verse-text {
    @apply text-2xl leading-relaxed mb-5 font-light;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .verse-word {
    display: inline-block;
    margin-right: 0.25em;
  }

  .verse-reference {
    @apply text-lg mb-10 italic opacity-90 font-normal;
  }

  .verse-done-btn {
    @apply bg-white text-black border-none py-4 px-10 text-lg font-semibold rounded-lg cursor-pointer transition-all duration-200 min-w-[120px];
    box-shadow: 0 2px 10px rgba(255, 255, 255, 0.2);
  }

  .verse-done-btn:hover {
    @apply bg-gray-100 transform -translate-y-0.5;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
  }

  .verse-done-btn:active {
    @apply transform translate-y-0;
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
  }

  .verse-done-btn:focus {
    @apply outline-none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
  }

  .modal-overlay {
    @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000000] p-4;
  }

  .modal-content {
    @apply bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .verse-content {
    @apply max-w-[90%] px-2.5;
  }
  
  .verse-text {
    @apply text-xl leading-6;
  }
  
  .verse-reference {
    @apply text-base;
  }
  
  .verse-done-btn {
    @apply py-3 px-8 text-base;
  }
}

@media (max-width: 480px) {
  .verse-text {
    @apply text-lg;
  }
  
  .verse-reference {
    @apply text-sm;
  }
  
  .verse-done-btn {
    @apply py-2.5 px-6 text-sm;
  }
}

/* Daily Flame CSS Isolation - Maximum Specificity */
/* Uses exact values from compiled Tailwind to preserve appearance */
#daily-flame-extension-root {
  /* CSS Custom Properties with exact Tailwind values */
  --df-bg-white-10: rgba(255, 255, 255, 0.1);
  --df-bg-white-20: rgba(255, 255, 255, 0.2);
  --df-bg-white-30: rgba(255, 255, 255, 0.3);
  --df-backdrop-blur-sm: blur(4px);
  --df-backdrop-blur-md: blur(12px);
  --df-border-white-20: rgba(255, 255, 255, 0.2);
  --df-border-white-30: rgba(255, 255, 255, 0.3);
}

/* Glassmorphism elements with maximum specificity */
#daily-flame-extension-root .df-glassmorphism-element {
  background-color: var(--df-bg-white-20) !important;
  backdrop-filter: var(--df-backdrop-blur-sm) !important;
  border-color: var(--df-border-white-30) !important;
}

#daily-flame-extension-root .df-glassmorphism-element:hover {
  background-color: var(--df-bg-white-30) !important;
}

#daily-flame-extension-root .df-glassmorphism-modal {
  background-color: var(--df-bg-white-10) !important;
  backdrop-filter: var(--df-backdrop-blur-md) !important;
  border-color: var(--df-border-white-20) !important;
}

#daily-flame-extension-root .df-glassmorphism-input {
  background-color: var(--df-bg-white-20) !important;
  border-color: var(--df-border-white-30) !important;
}

#daily-flame-extension-root .df-glassmorphism-dropdown {
  background-color: var(--df-bg-white-10) !important;
  backdrop-filter: var(--df-backdrop-blur-md) !important;
  border-color: var(--df-border-white-20) !important;
}
```

# src\types\index.ts

```ts
// Bible API types
export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
}

export interface VerseData {
  text: string;
  reference: string;
  bibleId: string;
}

export interface StoredVerse {
  reference: string;
  bibleId: string;
  translation: string;
  dateAdded: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PassageResponse {
  id: string;
  orgId: string;
  bibleId: string;
  bookId: string;
  chapterId: string;
  content: string;
  reference: string;
  verseCount: number;
}

// Chrome extension message types
export interface ChromeMessage {
  action: string;
  [key: string]: any;
}

export interface ChromeResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

// Component props types
export interface VerseOverlayProps {
  verse: VerseData;
  onDismiss: () => void;
}

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Keep AdminModalProps for backward compatibility
export interface AdminModalProps extends UserModalProps {}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

// Firebase Auth types
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL?: string | null;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  isAdmin: boolean;
  isEmailVerified: boolean;
}

// Bible translation mappings
export const BIBLE_VERSIONS = {
  'KJV': 'de4e12af7f28f599-02',
  'WEB': '9879dbb7cfe39e4d-04', 
  'WEB_BRITISH': '7142879509583d59-04',
  'WEB_UPDATED': '72f4e6dc683324df-03'
} as const;

export type BibleTranslation = keyof typeof BIBLE_VERSIONS;
```

# tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

# test.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Flame Test</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            min-height: 100vh;
        }
        .content {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            line-height: 1.6;
            color: #666;
            margin-bottom: 16px;
        }
        .test-button {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        .test-button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="content">
        <h1>Daily Flame Extension Test Page</h1>
        <p>This is a test page to verify the Daily Flame Chrome extension is working properly.</p>
        <p>If the extension is installed and working, you should see a full-screen Bible verse overlay when you first visit this page (unless it has already been shown today).</p>
        <p>The overlay should have:</p>
        <ul>
            <li>Black background covering the entire page</li>
            <li>Centered white verse text</li>
            <li>Italic verse reference below the text</li>
            <li>Large white "Done" button</li>
            <li>Simple grey "Sign In" button in the top-right corner</li>
            <li>If signed in as admin: Profile button should be properly positioned in top-right corner</li>
            <li>If signed in as admin: Profile dropdown menu should appear aligned correctly when clicked</li>
            <li>If signed in as admin: "Admin: Set Daily Verse" section should have clean layout without unwanted border lines</li>
            <li>No stray border lines or visual artifacts should be visible</li>
        </ul>
        <button class="test-button" onclick="if(window.resetDailyFlame) window.resetDailyFlame(); else alert('Extension not loaded or resetDailyFlame function not available');">
            Test Extension (Reset Daily Verse)
        </button>
        <p><em>Note: Click the button above to force-show the verse overlay for testing.</em></p>
    </div>
</body>
</html>
```

# tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "jsx": "react-jsx"
  },
  "include": [
    "src/**/*",
    "src/**/*.tsx",
    "src/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "*.js"
  ]
}
```

# webpack.config.js

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    content: './src/content/index.ts',
    background: './src/background/index.ts',
    newtab: './src/newtab/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'manifest.json',
          to: 'manifest.json',
        },
        {
          from: 'src/assets',
          to: 'assets',
          noErrorOnMissing: true,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: './src/newtab/newtab.html',
      filename: 'newtab.html',
      chunks: ['newtab'],
    }),
  ],
  mode: 'development',
  devtool: 'cheap-module-source-map',
};
```

