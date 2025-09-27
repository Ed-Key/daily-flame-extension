# /src Directory - Core Application Source Code

## Overview
The `src` directory contains all the TypeScript and React source code for the DailyFlame Chrome extension. It follows a modular architecture with clear separation of concerns.

## Directory Structure

### `/admin` - Admin Panel
**Purpose**: Administrative interface for managing daily verses and system settings.

**Files**:
- `index.tsx`: Main admin panel component with Firebase admin authentication

**Key Functions**:
- Daily verse management
- User management (when implemented)
- System monitoring

---

### `/auth` - Authentication Pages
**Purpose**: Standalone authentication pages for OAuth redirects and email verification.

**Files**:
- `auth.html`: HTML template for auth page
- `auth.css`: Styles for auth page
- `auth.ts`: Authentication logic and Firebase auth handling

**Key Functions**:
- OAuth redirect handling
- Email verification landing page
- Auth state persistence

---

### `/background` - Service Worker
**Purpose**: Chrome extension background script (Manifest V3 service worker).

**Files**:
- `index-simple.ts`: Simplified service worker for extension lifecycle

**Key Functions**:
- Extension installation/update handling
- Message passing between components
- Chrome storage management
- Badge updates

---

### `/components` - React Components
**Purpose**: All React components organized by feature.

**Subdirectories**:
- `/forms`: Reusable form components
- `/VerseOverlay`: Main verse display component and sub-components

**Key Components**:
- `AuthContext.tsx`: Global authentication state provider
- `ToastContext.tsx`: Global notification system
- `Toast.tsx`: Toast notification UI component

---

### `/content` - Content Scripts
**Purpose**: Scripts injected into web pages by the Chrome extension.

**Files**:
- `monitor.ts`: Monitors page navigation and determines when to show verses
- `verse-app.ts`: Injects the React application into the page's Shadow DOM

**Key Functions**:
- Page load detection
- Shadow DOM creation and management
- React app mounting/unmounting
- Message passing with background script

---

### `/hooks` - Custom React Hooks
**Purpose**: Reusable React hooks for common functionality.

**Files**:
- `useAuthForm.ts`: Form validation and submission logic for auth forms

---

### `/services` - Business Logic Layer
**Purpose**: Core business logic, API integrations, and data management.

**Subdirectories**:
- `/parsers`: Bible text parsing strategies
- `/__tests__`: Service layer unit and integration tests

**Key Services**:
- `verse-service.ts`: Main orchestrator for verse fetching and caching
- `user-preferences-service.ts`: User preference management with hybrid storage
- `firebase-config.ts`: Firebase initialization and configuration
- `firestore-service.ts`: Firestore database operations
- `cloud-functions-service.ts`: Cloud function invocations
- `esv-service.ts`: ESV API integration
- `nlt-service.ts`: NLT API integration

---

### `/styles` - CSS-in-JS Styles
**Purpose**: Component styles compatible with Shadow DOM isolation.

**Structure**:
- `/components`: Component-specific styles
- `/shared`: Reusable style utilities
- `shadow-dom-styles.ts`: Main style injection point
- `theme-variables.css.ts`: CSS custom properties for theming

**Important**: All styles must be exported as template strings and imported through `shadow-dom-styles.ts` due to Shadow DOM requirements.

---

### `/types` - TypeScript Definitions
**Purpose**: Centralized type definitions for type safety.

**Files**:
- `index.ts`: Main type exports (User, Verse, Preferences, etc.)
- `bible-formats.ts`: Bible-specific type definitions

---

### `/utils` - Utility Functions
**Purpose**: Reusable utility functions.

**Files**:
- `date-utils.ts`: Date manipulation and formatting utilities

---

### `offscreen.ts` - Offscreen Document
**Purpose**: Required for Firebase Auth in Manifest V3 extensions.

**Key Functions**:
- Firebase Auth operations in extension context
- Message passing with content scripts

## Key Architectural Decisions

### 1. Shadow DOM Isolation
All UI components are rendered inside a Shadow DOM to prevent style conflicts with host pages. This requires:
- CSS-in-JS approach with template strings
- No external CSS imports
- All styles injected through `shadow-dom-styles.ts`

### 2. Hybrid Storage Strategy
User preferences use a multi-tier storage approach:
- In-memory cache (fastest, 30-second TTL)
- Chrome local storage (fast, offline support)
- Firebase Firestore (cloud sync, persistence)

### 3. Parser Strategy Pattern
Different Bible translations require different parsing strategies:
- `BaseParser`: Abstract base class defining the interface
- Translation-specific parsers extend and implement parsing logic
- `verse-service.ts` selects appropriate parser based on translation

### 4. React Context for Global State
- `AuthContext`: Authentication state and methods
- `ToastContext`: Global notification system

### 5. Service Layer Architecture
All business logic is encapsulated in service classes:
- Single responsibility principle
- Dependency injection where needed
- Clear separation from UI components

## Development Guidelines

### Adding New Components
1. Create component in appropriate directory
2. Add component-specific styles to `/styles/components/`
3. Import styles in `shadow-dom-styles.ts`
4. Export from parent index file if needed

### Adding New Services
1. Create service class in `/services`
2. Follow singleton pattern if stateful
3. Add TypeScript interfaces in `/types`
4. Write unit tests in `__tests__`

### Styling Guidelines
1. Use semantic class names (e.g., `.settings-title`)
2. Create component-specific CSS files
3. Export as template strings
4. Support both light and dark themes
5. Use CSS custom properties for theming

### Testing Strategy
1. Unit tests for services and utilities
2. Integration tests for API services
3. Component tests for complex UI logic
4. Mock Chrome APIs and external dependencies