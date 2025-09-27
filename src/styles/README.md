# /src/styles Directory - Shadow DOM Compatible CSS

## Overview
The styles directory contains all CSS for the DailyFlame extension using a CSS-in-JS approach. This architecture is required due to Shadow DOM isolation - regular CSS imports don't work within Shadow DOM boundaries.

## Architecture

### Why CSS-in-JS?
Shadow DOM creates an isolated DOM tree that:
- Prevents external styles from affecting internal elements
- Prevents internal styles from leaking out
- Requires all styles to be injected directly into the shadow root

### File Structure
```
/styles
├── components/               # Component-specific styles
│   ├── profile-dropdown.css.ts
│   ├── settings-view.css.ts
│   ├── theme-toggle.css.ts
│   └── translation-dropdown.css.ts
├── shared/                   # Reusable style utilities
│   └── glassmorphic.css.ts
├── shadow-dom-styles.ts      # Main style aggregator
└── theme-variables.css.ts   # CSS custom properties
```

## Core Files

### `shadow-dom-styles.ts` - Style Aggregator
**Purpose**: Central point for all style injection into Shadow DOM.

**Structure**:
```typescript
// Import all component styles
import { profileDropdownStyles } from './components/profile-dropdown.css';
import { settingsViewStyles } from './components/settings-view.css';
// ... more imports

// Aggregate and export
export const shadowDomStyles = `
  ${themeVariables}
  ${globalStyles}
  ${profileDropdownStyles}
  ${settingsViewStyles}
  // ... all styles
`;
```

**Usage**:
```typescript
// In React component
const style = document.createElement('style');
style.textContent = shadowDomStyles;
shadowRoot.appendChild(style);
```

---

### `theme-variables.css.ts` - Design System
**Purpose**: CSS custom properties for consistent theming.

**Variables**:
```css
:host {
  /* Colors - Dark Theme (default) */
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --accent: #4a9eff;

  /* Colors - Light Theme */
  :host([data-theme="light"]) {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #333333;
    --text-secondary: #666666;
    --accent: #0066cc;
  }

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Typography */
  --font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI";
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 20px;
  --font-size-xl: 32px;

  /* Animations */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

---

## Component Styles

### `settings-view.css.ts` - Settings UI Styles
**Purpose**: Styles for the settings panel interface.

**Key Classes**:
```css
.settings-view-container     # Main container
.settings-title              # Page title
.settings-back-button        # Back navigation
.settings-section            # Content sections
.settings-label              # Field labels
.settings-description        # Helper text
.settings-translation-select # Translation dropdown
```

**Features**:
- Animated back button with arrow reveal
- Responsive layout
- Theme-aware styling
- GSAP animation hooks

---

### `profile-dropdown.css.ts` - User Menu Styles
**Purpose**: Styles for the profile dropdown menu with solid backgrounds for visibility.

**Key Classes**:
```css
.profile-dropdown           # Container (z-index: 21)
.profile-button             # Trigger button (transparent bg)
.profile-button__avatar     # User avatar (28x28px circle)
.profile-button__name       # User name display
.profile-dropdown-menu      # Dropdown panel (solid dark bg)
.profile-dropdown-action    # Menu items (full width, no gaps)
.profile-dropdown-badge     # Admin/Unverified badges
```

**Visual Design Implementation**:

**Menu Background (Dark Theme)**:
```css
background-color: rgb(26, 26, 26) !important; /* Solid dark */
border: 2px solid rgba(255, 255, 255, 0.2) !important;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8) !important;
```

**Hover Effects**:
```css
.profile-dropdown-action {
  background: transparent;
  transition: background-color 0.15s ease;
}
.profile-dropdown-action:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
}
```

**Important Implementation Notes**:
- Uses `!important` flags to override Shadow DOM defaults
- Solid backgrounds instead of glassmorphic for better hover visibility
- Full-width buttons with no margins for seamless appearance
- 150ms transitions for smooth hover feedback

---

### `theme-toggle.css.ts` - Theme Switcher
**Purpose**: Styles for the dark/light mode toggle.

**Key Classes**:
```css
.theme-toggle              # Container
.theme-toggle-icon        # Sun/Moon icons
.theme-toggle-icon--sun   # Sun icon
.theme-toggle-icon--moon  # Moon icon
```

**Animations**:
- Icon rotation on toggle
- Opacity transitions
- Scale effects

---

### `translation-dropdown.css.ts` - Bible Version Selector
**Purpose**: Styles for the translation selection dropdown.

**Key Classes**:
```css
.translation-dropdown          # Container
.translation-dropdown-button   # Current selection
.translation-dropdown-menu     # Options panel
.translation-dropdown-option   # Individual options
```

**Features**:
- Custom dropdown styling
- Hover effects
- Active state indication
- Smooth transitions

---

### `settings-sidebar.css.ts` - Settings Panel Glassmorphism
**Purpose**: Glassmorphic settings sidebar panel that slides in from the right.

**Key Classes**:
```css
.settings-sidebar-backdrop    # Click-to-close backdrop
.settings-sidebar-panel       # Main glassmorphic panel
.settings-sidebar-content     # Content container
.settings-sidebar-close       # Glassmorphic close button
.verse-dimmed                # Applied to main content when settings open
```

**Glassmorphic Implementation (Dark Theme)**:
```css
.settings-sidebar-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.3),
             inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}
```

**Light Theme Glassmorphism**:
```css
background: rgba(0, 0, 0, 0.04);
border-left: 1px solid rgba(0, 0, 0, 0.1);
```

**Close Button Design**:
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.2);
/* Scales up on hover with transform: scale(1.05) */
```

**Key Features**:
- 40% width with min/max constraints
- Slides in from right (`transform: translateX(100%)`)
- Backdrop blur creates frosted glass effect
- Layered shadows for depth
- Text colors optimized for semi-transparent background
- Responsive width adjustments for mobile

---

## Shared Styles

### `glassmorphic.css.ts` - Glass Effect Utilities
**Purpose**: Reusable glassmorphic design elements.

**Classes**:
```css
.df-glassmorphism         # Base glass effect
.df-glassmorphism-modal  # Modal variant
.df-glassmorphism-button  # Button variant
```

**Properties**:
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

---

## Theming System

### Theme Application
Themes are applied via the `:host` pseudo-class:

```typescript
// Set theme on Shadow DOM host
shadowRoot.host.setAttribute('data-theme', 'light');

// Remove for dark theme (default)
shadowRoot.host.removeAttribute('data-theme');
```

### Theme-Aware Components
All components support both themes:

```css
/* Dark theme (default) */
.component {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* Light theme override */
:host([data-theme="light"]) .component {
  color: #333;
  background: rgba(0, 0, 0, 0.05);
}
```

---

## Style Guidelines

### 1. Naming Conventions
```css
/* Block */
.settings-view

/* Element (BEM-like) */
.settings-view__title
.profile-button__avatar

/* Modifier */
.profile-dropdown-badge--admin
.theme-toggle-icon--active

/* State */
.translation-dropdown-option:hover
.profile-button.is-active
```

### 2. Component Isolation
Each component style file is self-contained:
- No dependencies on other component styles
- Use CSS custom properties for shared values
- Export as template string

### 3. Responsive Design
```css
/* Mobile-first approach */
.component {
  width: 100%;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    width: 50%;
  }
}
```

### 4. Animation Hooks
Provide classes for GSAP animations:
```css
/* Initial state for animations */
.verse-letter {
  opacity: 0;
  display: inline-block;
}

/* Don't use CSS transitions on GSAP-animated properties */
.animated-element {
  /* Let GSAP handle these */
  /* transition: opacity 0.3s; ❌ */
}
```

### 5. Theme Variables Usage
Always use CSS custom properties:
```css
/* Good ✅ */
.component {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

/* Bad ❌ */
.component {
  color: #ffffff;
  background: #2a2a2a;
}
```

---

## Development Workflow

### Adding New Component Styles

1. **Create component style file**:
```typescript
// src/styles/components/my-component.css.ts
export const myComponentStyles = `
  .my-component {
    /* styles */
  }
`;
```

2. **Import in shadow-dom-styles.ts**:
```typescript
import { myComponentStyles } from './components/my-component.css';

export const shadowDomStyles = `
  ${existingStyles}
  ${myComponentStyles}
`;
```

3. **Use semantic class names in component**:
```tsx
<div className="my-component">
  <h2 className="my-component__title">Title</h2>
</div>
```

### Testing Styles
1. Test in both themes
2. Check responsive breakpoints
3. Verify Shadow DOM isolation
4. Test with GSAP animations
5. Check browser compatibility

### Performance Considerations
- Styles are injected once per shadow root
- Use CSS custom properties for dynamic values
- Avoid expensive selectors
- Minimize specificity wars
- Group related styles together

---

## Common Patterns

### Glassmorphic Card
```css
.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: var(--spacing-md);
}
```

### Hover Button
```css
.button {
  background: rgba(255, 255, 255, 0.1);
  transition: var(--transition-fast);
}

.button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}
```

### Fade Transition
```css
.element {
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.element.is-visible {
  opacity: 1;
}
```

---

## Debugging Tips

### Shadow DOM Inspector
1. Open Chrome DevTools
2. Settings → Preferences → Elements
3. Enable "Show user agent shadow DOM"
4. Inspect shadow roots in Elements panel

### Style Injection Verification
```javascript
// In console
const shadowRoot = document.querySelector('#verse-app-root').shadowRoot;
const styles = shadowRoot.querySelector('style');
console.log(styles.textContent);
```

### Theme Testing
```javascript
// Toggle theme in console
const host = document.querySelector('#verse-app-root');
host.setAttribute('data-theme', 'light'); // Light theme
host.removeAttribute('data-theme');        // Dark theme
```

### CSS Variable Inspection
```javascript
// Get computed styles
const element = shadowRoot.querySelector('.component');
const styles = getComputedStyle(element);
console.log(styles.getPropertyValue('--text-primary'));
```