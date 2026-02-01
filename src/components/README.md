# /src/components Directory - React Components

## Overview
This directory contains all React components for the DailyFlame extension. Components are organized by feature and follow a modular architecture with clear separation of concerns.

## Component Architecture

### Global Context Providers

#### `AuthContext.tsx`
**Purpose**: Provides authentication state and methods throughout the application.

**Exports**:
- `AuthProvider`: Context provider component
- `useAuth()`: Hook to access auth state and methods

**Key State**:
```typescript
- user: FirebaseUser | null
- isAdmin: boolean
- isEmailVerified: boolean
- loading: boolean
```

**Methods**:
- `signIn(email, password)`
- `signUp(email, password, displayName)`
- `signInWithGoogle()`
- `signOut()`
- `sendVerificationEmail()`

---

#### `ToastContext.tsx`
**Purpose**: Global notification system for user feedback.

**Exports**:
- `ToastProvider`: Context provider component
- `useToast()`: Hook to show notifications

**Methods**:
- `showToast(message, type)`: Display notification
  - Types: 'success' | 'error' | 'info' | 'warning'

---

### Main Components

#### `Toast.tsx`
**Purpose**: Visual toast notification component.

**Props**:
```typescript
{
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
}
```

**Features**:
- Auto-dismiss after 5 seconds
- Manual dismiss option
- Animated entrance/exit
- Icon based on type

---

## /VerseOverlay Subdirectory

### Main Component

#### `VerseOverlay/index.tsx` (1045 lines)
**Purpose**: Primary verse display component managing all verse-related UI.

**State Management**:
```typescript
// Verse state
- currentVerse: VerseData
- showContext: boolean
- chapterContent: ChapterData

// UI state
- showSettings: boolean
- showSignIn/SignUp: boolean
- theme: 'light' | 'dark'
- currentTranslation: BibleTranslation

// Animation refs
- overlayRef, modalRef, verseContentRef
- verseDisplayRef, topControlsRef, logoRef
```

**Key Features**:
1. **GSAP Animations**:
   - Modal entrance/exit animations
   - Letter-by-letter verse reveal
   - Decorative line animations
   - Theme transitions

2. **View States**:
   - Main verse display
   - Settings view
   - Context (full chapter) view
   - Authentication modals

3. **Settings Integration**:
   - Bible translation selector
   - Theme toggle
   - User preference persistence

**Animation Timeline**:
```
1. Modal slides in from side (0.6s)
2. Backdrop blur effect (0.3s)
3. Modal scales to full size (0.5s)
4. Verse letters animate in (0.7s each)
5. Reference and lines appear (0.8s)
6. Buttons and controls fade in (0.5s)
```

---

### /components Subdirectory

#### `AdminControls.tsx`
**Purpose**: Admin-only controls for verse management.

**Features**:
- Set daily verse
- Override current verse
- View verse statistics

**Visibility**: Only shown to authenticated admin users

---

#### `AuthButtons.tsx`
**Purpose**: Sign in/Sign up buttons for unauthenticated users.

**Props**:
```typescript
{
  onSignInClick: () => void
}
```

---

#### `ContextView.tsx`
**Purpose**: Full chapter view for reading verse in context.

**Props**:
```typescript
{
  verse: VerseData
  chapterContent: ChapterData | null
  contextLoading: boolean
  contextTranslation: BibleTranslation
  onBack: () => void
  onDone: () => void
  onTranslationChange: (translation: string) => void
}
```

**Features**:
- Full chapter display
- Translation switcher
- Verse highlighting
- Smooth scrolling

---

#### `ProfileDropdown.tsx`
**Purpose**: User profile menu with settings access and glassmorphic hover effects.

**Props**:
```typescript
{
  user: FirebaseUser
  isAdmin: boolean
  isEmailVerified: boolean
  onSignOut: () => void
  onSettingsClick: () => void
  shadowRoot: ShadowRoot | null
}
```

**Menu Items**:
- User info display
- Admin/Unverified badges
- Settings button → Triggers settings sidebar panel
- Resend verification (if unverified)
- Sign out (with divider line)

**Implementation Details**:

**State Management**:
```typescript
const [showDropdown, setShowDropdown] = useState(false);
```

**Event Handling Architecture**:
1. **Toggle Mechanism**: Button click toggles dropdown visibility and dispatches custom `dropdown-open` event
2. **Click-Outside Detection**:
   - Uses event capture phase (`addEventListener(..., true)`) for early detection
   - Checks if click is outside both `.profile-dropdown-menu` AND `.profile-button`
   - Works within Shadow DOM by using `shadowRoot || document`
3. **Cross-Dropdown Communication**:
   - Listens for `dropdown-open` events from other components
   - Auto-closes when another dropdown opens (single dropdown policy)

**Visual Design**:
- **Menu Background**: Solid `rgb(26, 26, 26)` for proper contrast
- **Hover Effect**: `rgba(255, 255, 255, 0.15)` overlay with `!important` flag
- **Border**: 2px solid `rgba(255, 255, 255, 0.2)` for definition
- **Shadow**: `0 4px 20px rgba(0, 0, 0, 0.8)` for depth

**Key Behavior**:
- Click outside to close
- Closes when other dropdowns open via custom event system
- Settings click triggers settings sidebar panel animation
- Hover states provide visual feedback on all interactive elements

---

#### `ThemeToggle.tsx`
**Purpose**: Toggle between light and dark themes.

**Props**:
```typescript
{
  theme: 'light' | 'dark'
  onToggle: () => void
}
```

**Features**:
- Sun/Moon icons
- Smooth icon transitions
- Saves preference to storage

---

#### `VerseDisplay.tsx`
**Purpose**: Core verse text display with animations.

**Refs Exposed**:
```typescript
{
  verseTextRef: RefObject<HTMLDivElement>
  verseReferenceRef: RefObject<HTMLDivElement>
  leftLineRef: RefObject<HTMLDivElement>
  rightLineRef: RefObject<HTMLDivElement>
  doneButtonRef: RefObject<HTMLButtonElement>
  moreButtonRef: RefObject<HTMLButtonElement>
}
```

**Props**:
```typescript
{
  verse: VerseData
  onDone: () => void
  onMore: () => void
  onTranslationChange: (translation: BibleTranslation) => void
  shadowRoot: ShadowRoot | null
  isAdmin: boolean
}
```

**Features**:
- Translation dropdown
- Letter-by-letter animation
- Decorative lines
- Done button (marks verse as read)
- More button (opens context view)

---

#### `SettingsSidebar.tsx` & `SettingsContent.tsx`
**Purpose**: Settings panel with glassmorphic sidebar design.

**Implementation Architecture**:

**Settings Sidebar Panel**:
- Slides in from right side of modal (40% width)
- Glassmorphic design with backdrop blur
- Positioned absolutely within modal boundaries
- Dimming effect on main content when open

**Glassmorphic Styling (Dark Theme)**:
```css
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(16px);
border-left: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 0 40px rgba(0, 0, 0, 0.3),
           inset 0 0 0 1px rgba(255, 255, 255, 0.1);
```

**Light Theme Adjustments**:
```css
background: rgba(0, 0, 0, 0.04);
border-left: 1px solid rgba(0, 0, 0, 0.1);
/* Text colors inverted for readability */
```

**Features**:
- Backdrop click to close
- Glassmorphic close button with hover effects
- Smooth slide-in/out animations via GSAP
- Content scrolling within panel
- Responsive width adjustments

**State Management**:
- Controlled by parent `VerseOverlay` component
- `showSettings` state triggers panel visibility
- Animation handled by GSAP timeline

---

### /hooks Subdirectory

#### `useContextScroll.ts`
**Purpose**: Custom hook for managing scroll position in context view.

**Returns**:
```typescript
{
  scrollToVerse: (verseNumber: number) => void
  saveScrollPosition: () => void
  restoreScrollPosition: () => void
}
```

---

### /utils Subdirectory

#### `unifiedVerseRenderer.tsx`
**Purpose**: Unified rendering logic for verse text across translations.

**Functions**:
- `renderVerse(verse, parser)`: Renders verse with appropriate formatting
- `parseVerseStructure(text)`: Extracts verse numbers and text

---

## /forms Subdirectory

### Form Components

#### `FormInput.tsx`
**Purpose**: Reusable text input component.

**Props**:
```typescript
{
  label: string
  type: string
  value: string
  onChange: (e: ChangeEvent) => void
  error?: string
  required?: boolean
}
```

---

#### `FormPasswordInput.tsx`
**Purpose**: Password input with show/hide toggle.

**Features**:
- Toggle password visibility
- Strength indicator (optional)
- Error display

---

#### `FormError.tsx`
**Purpose**: Error message display component.

**Props**:
```typescript
{
  message: string
}
```

---

#### `SignInForm.tsx`
**Purpose**: User sign-in modal.

**Props**:
```typescript
{
  onClose: () => void
  onSwitchToSignUp: () => void
  onVerificationRequired: (email: string) => void
}
```

**Features**:
- Email/password sign in
- Google sign in
- Remember me option
- Switch to sign up
- Error handling

---

#### `SignUpForm.tsx`
**Purpose**: User registration modal.

**Props**:
```typescript
{
  onClose: () => void
  onSwitchToSignIn: () => void
  onSuccess: () => void
}
```

**Features**:
- Email/password registration
- Display name field
- Google sign up
- Email verification flow
- Terms acceptance

---

#### `VerificationReminder.tsx`
**Purpose**: Email verification reminder component.

**Props**:
```typescript
{
  userEmail: string
  onClose: () => void
}
```

**Features**:
- Resend verification email
- Countdown timer
- Success/error feedback

---

## Component Communication Flow

### Settings Feature Flow
```
1. User clicks ProfileDropdown → Settings
2. ProfileDropdown calls onSettingsClick()
3. VerseOverlay animates verse out, settings in
4. Settings view renders with current preferences
5. User changes preference → UserPreferencesService
6. Service saves to local storage + Firebase
7. Component updates UI with new preference
```

### Authentication Flow
```
1. Unauthenticated: AuthButtons visible
2. User clicks Sign In → SignInForm modal
3. Successful auth → AuthContext updates
4. ProfileDropdown replaces AuthButtons
5. User preferences load from Firebase
6. UI updates with user's saved preferences
```

## Development Guidelines

### Creating New Components
1. Place in appropriate subdirectory
2. Use TypeScript for props interface
3. Create matching CSS in `/styles/components/`
4. Use semantic class names
5. Support both themes via CSS variables
6. Export from index file if needed

### State Management
- Use Context for global state (auth, notifications)
- Use component state for UI-specific state
- Use refs for animation targets
- Avoid prop drilling - use Context instead

### Animation Guidelines
- Use GSAP for complex animations
- Store animation state in refs
- Clean up timelines on unmount
- Use requestAnimationFrame for render sync
- Avoid animating during state changes

### Testing Components
- Test user interactions
- Test state changes
- Test error states
- Mock external dependencies
- Use React Testing Library