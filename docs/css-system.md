# CSS & Shadow DOM System

This Chrome extension injects onto every website, so complete style isolation is critical. We use Shadow DOM with a sophisticated CSS architecture.

## Why Shadow DOM?

1. **Complete Isolation** - Host page CSS cannot affect our extension
2. **No Pollution** - Our CSS doesn't leak to the host page
3. **Predictability** - Looks identical on all websites
4. **Clean Removal** - Remove one element, everything gone

## Injection Architecture

**Entry Point:** `src/content/verse-app.ts`

```typescript
// 1. Create container with inline !important styles
const overlayContainer = document.createElement('div');
overlayContainer.id = 'daily-bread-extension-root';
overlayContainer.style.cssText = `
    position: fixed !important;
    z-index: 999999 !important;
    // ... more !important overrides
`;

// 2. Attach Shadow DOM
const shadowRoot = overlayContainer.attachShadow({ mode: 'open' });

// 3. Inject ALL styles as single <style> element
const shadowStyles = document.createElement('style');
shadowStyles.textContent = getShadowDomStyles();  // ~2200 lines
shadowRoot.appendChild(shadowStyles);

// 4. Mount React inside Shadow DOM
const reactContainer = document.createElement('div');
shadowRoot.appendChild(reactContainer);
```

## Critical Reset

The `:host` selector resets ALL inherited styles:

```css
:host {
  all: initial;  /* Nuclear reset - removes ALL inherited CSS */
  display: block !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  /* Re-apply only what we need */
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

**Why `all: initial`?** Shadow DOM still inherits some properties (font, color) from the light DOM. This prevents host page styles from bleeding through.

## File Structure

```
src/styles/
├── shadow-dom-styles.ts      # Main bundle (~2200 lines) - exports getShadowDomStyles()
├── theme-variables.css.ts    # CSS custom properties for dark/light themes
├── components/               # Component-specific styles
│   ├── profile-dropdown.css.ts
│   ├── translation-dropdown.css.ts
│   ├── settings-sidebar.css.ts
│   ├── settings-content.css.ts
│   └── theme-toggle.css.ts
└── shared/
    └── glassmorphic.css.ts   # Reusable glass effects
```

## Component CSS Pattern

All component styles follow the `.css.ts` pattern:

```typescript
// src/styles/components/my-component.css.ts
export const myComponentStyles = `
  .my-component {
    display: flex;
    background: var(--glass-bg);  /* Use CSS variables */
    backdrop-filter: blur(12px);
  }

  .my-component__element {
    /* BEM naming convention */
  }

  .my-component--active {
    /* State modifier */
  }
`;
```

Then import in `shadow-dom-styles.ts`:
```typescript
import { myComponentStyles } from './components/my-component.css';

export const getShadowDomStyles = (): string => {
  return `
    ${themeVariables}
    /* ... main styles ... */
    ${myComponentStyles}
  `;
};
```

## Theme System

Themes use CSS custom properties with `:host` attribute selector:

```css
/* Dark theme (default) */
:host {
  --bg-primary: rgba(0, 0, 0, 0.95);
  --text-primary: white;
  --glass-bg: rgba(255, 255, 255, 0.1);
  --red-letter: #ff4444;
}

/* Light theme override */
:host([data-theme="light"]) {
  --bg-primary: rgba(255, 255, 255, 0.98);
  --text-primary: #1a1a1a;
  --glass-bg: rgba(0, 0, 0, 0.05);
  --red-letter: #cc0000;
}
```

**Theme switching in React:**
```typescript
useEffect(() => {
  const host = shadowRoot.host as HTMLElement;
  if (theme === 'light') {
    host.setAttribute('data-theme', 'light');
  } else {
    host.removeAttribute('data-theme');
  }
}, [theme]);
```

Theme changes are instant - pure CSS variable substitution, no re-render needed.

## Glassmorphic Design

Core glass effect used throughout:

```css
.glassmorphic {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);  /* Safari */
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## Why `!important` Is Used

Strategic use on critical properties to prevent host page interference:

| Property | Reason |
|----------|--------|
| `position: fixed !important` | Prevent host changing modal position |
| `z-index: 999999 !important` | Guarantee top-layer rendering |
| `width/height: 100% !important` | Ensure overlay covers viewport |

## Responsive Breakpoints

```css
/* Desktop: default */
.verse-modal { max-width: 840px; }

/* Tablet */
@media (max-width: 768px) {
  .verse-modal { width: 95%; }
  .settings-sidebar-panel { width: 70%; }
}

/* Mobile */
@media (max-width: 480px) {
  .verse-modal { padding: 24px; }
  .settings-sidebar-panel { width: 85%; }
}
```

## Animation CSS

CSS handles simple transitions:
```css
.transition-all { transition: all 150ms ease; }
.hover\:bg-gray-100:hover { background-color: #f3f4f6; }
```

GSAP handles complex sequenced animations (modal entrance, verse reveal, etc.)

## Key Rules

1. **Never use Tailwind** - Not available in Shadow DOM
2. **All styles in shadow-dom-styles.ts** - Regular CSS imports won't work
3. **Use CSS variables** for theme-aware colors
4. **BEM naming** for component classes
5. **Component CSS files** for new components in `src/styles/components/`
