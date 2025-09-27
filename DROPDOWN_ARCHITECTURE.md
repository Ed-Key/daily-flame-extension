# Dropdown Architecture Documentation

## Overview
This document describes the implementation of dropdown menus in the DailyFlame Chrome extension, specifically the Profile Dropdown and Settings Panel. Both components use Shadow DOM encapsulation with custom event handling and CSS-in-JS styling.

## Profile Dropdown Implementation

### Component Structure
**File**: `/src/components/VerseOverlay/components/ProfileDropdown.tsx`

The ProfileDropdown is a React functional component that manages its own visibility state and integrates with the Shadow DOM event system.

### State Management
```typescript
const [showDropdown, setShowDropdown] = useState(false);
```

### Event Handling System

#### 1. Toggle Mechanism
When the profile button is clicked:
- Toggles the `showDropdown` state
- Dispatches a custom `dropdown-open` event if opening
- This ensures only one dropdown is open at a time

```typescript
onClick={() => {
  const newState = !showDropdown;
  setShowDropdown(newState);
  if (newState) {
    document.dispatchEvent(new CustomEvent('dropdown-open', {
      detail: { source: 'profile' }
    }));
  }
}}
```

#### 2. Click-Outside Detection
Uses event capture phase for early detection:
```typescript
eventTarget.addEventListener('click', handleClickOutside, true);
```

The handler checks if the click target is outside both:
- `.profile-dropdown-menu`
- `.profile-button`

This works within Shadow DOM by using `shadowRoot || document` as the event target.

#### 3. Cross-Dropdown Communication
Listens for `dropdown-open` events from other components:
```typescript
const handleCloseDropdown = (event: CustomEvent) => {
  if (event.detail.source !== 'profile') {
    setShowDropdown(false);
  }
};
```

### Styling Architecture
**File**: `/src/styles/components/profile-dropdown.css.ts`

#### Visual Design Decisions
1. **Solid Background**: Uses `rgb(26, 26, 26)` instead of glassmorphic for better contrast
2. **Hover Effects**: `rgba(255, 255, 255, 0.15)` overlay with `!important` flag
3. **No Gaps**: Full-width buttons with `margin: 0` for seamless appearance

#### Key CSS Properties
```css
.profile-dropdown-menu {
  background-color: rgb(26, 26, 26) !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8) !important;
}

.profile-dropdown-action:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
}
```

## Settings Panel Implementation

### Component Structure
The settings functionality is split across multiple components:
- `SettingsContent.tsx`: Main settings form and controls
- `SettingsSidebar.tsx`: Sidebar panel wrapper with animations
- Controlled by `VerseOverlay/index.tsx` parent component

### Glassmorphic Design
**File**: `/src/styles/components/settings-sidebar.css.ts`

The settings panel uses true glassmorphism with backdrop blur:

#### Dark Theme
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

#### Light Theme
```css
background: rgba(0, 0, 0, 0.04);
border-left: 1px solid rgba(0, 0, 0, 0.1);
```

### Animation System
Uses GSAP for smooth slide-in/out animations:
- Panel slides from right: `transform: translateX(100%)`
- Content dims when settings open: `.verse-dimmed` class
- Backdrop click detection for closing

### Close Button
Glassmorphic design with hover effects:
```css
.settings-sidebar-close {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.settings-sidebar-close:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.2);
}
```

## Shadow DOM Considerations

### Style Injection
All styles are injected as a single style tag into the Shadow DOM:
```typescript
const style = document.createElement('style');
style.textContent = getShadowDomStyles();
shadowRoot.appendChild(style);
```

### Event Handling
- Events must be attached to the Shadow Root or document depending on scope
- Custom events propagate across Shadow DOM boundaries
- Click-outside detection requires capture phase listeners

### CSS Specificity
- Use `!important` flags when necessary to override defaults
- Theme switching uses `:host([data-theme="light"])` selectors
- All styles must be in template strings, not external CSS files

## Common Patterns

### Dropdown Communication Pattern
1. Component opens → dispatches `dropdown-open` event
2. Other dropdowns listen → close themselves if different source
3. Ensures single dropdown policy across the application

### Hover State Pattern
```css
.element {
  background: transparent;
  transition: background-color 0.15s ease;
}
.element:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
}
```

### Glassmorphic Pattern
```css
.glassmorphic {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
}
```

## Debugging Tips

### Dropdown Not Closing
1. Check if click-outside listener is using capture phase
2. Verify Shadow DOM event target is correct
3. Check for event.stopPropagation() blocking

### Hover Effects Not Visible
1. Verify `!important` flags are present
2. Check base background isn't transparent over transparent
3. Ensure sufficient color contrast for visibility

### Glassmorphic Effects Not Working
1. Check browser support for backdrop-filter
2. Add -webkit-backdrop-filter for Safari
3. Verify background has transparency

## Future Improvements
1. Consider using React Context for dropdown state management
2. Add keyboard navigation support (Escape to close)
3. Implement focus trapping for accessibility
4. Add transition animations for dropdown appearance