# Settings Panel Slide-In UI/UX Implementation Plan

## PR Title: feat: Transform settings to slide-in panel overlay

## Description
Transform the settings interface from a fade transition to a modern slide-in panel that overlays the verse content, providing better context and a more app-like experience.

## User Experience Goals
- Settings panel slides in from the right, covering ~80% of screen width
- Verse content remains visible but inactive underneath
- Smooth GSAP animations for professional feel
- Click-outside-to-close functionality
- Responsive design for mobile/tablet/desktop

## Implementation Steps

### Step 1: Basic Slide-In Animation POC
**Goal**: Replace fade animation with slide-in from right

#### Changes Required:
1. **Modify `VerseOverlay/index.tsx`** (lines 808-830)
   - Remove fade-out animation for verse content
   - Add slide-in animation for settings container
   - Keep verse content rendered and visible

2. **Update GSAP Animation**
   ```typescript
   // OLD: Fade out verse, then show settings
   gsap.to(verseElements, { opacity: 0, y: -10 })

   // NEW: Keep verse visible, slide in settings
   gsap.fromTo('.settings-view-container',
     { x: '100%', opacity: 0 },
     { x: '0%', opacity: 1, duration: 0.4, ease: 'power2.out' }
   )
   ```

3. **Test Points**
   - Animation triggers correctly
   - No layout shift occurs
   - Performance is smooth

---

### Step 2: Panel Container Structure
**Goal**: Create proper container for slide-in panel

#### Changes Required:
1. **Add New Container Wrapper**
   ```typescript
   // Add wrapper around settings content
   <div className="settings-panel-wrapper">
     <div className="settings-panel">
       {/* Existing settings content */}
     </div>
   </div>
   ```

2. **Create `settings-panel.css.ts`**
   ```css
   .settings-panel-wrapper {
     position: fixed;
     top: 0;
     right: 0;
     bottom: 0;
     width: 80%;
     max-width: 600px;
     z-index: 2000;
     transform: translateX(100%);
   }

   .settings-panel {
     height: 100%;
     background: /* glassmorphic style */
     overflow-y: auto;
   }
   ```

3. **Import in `shadow-dom-styles.ts`**

---

### Step 3: Backdrop/Overlay Implementation
**Goal**: Add semi-transparent overlay behind settings panel

#### Changes Required:
1. **Add Backdrop Element**
   ```typescript
   {showSettings && (
     <>
       <div className="settings-backdrop" onClick={handleCloseSettings} />
       <div className="settings-panel-wrapper">
         {/* Panel content */}
       </div>
     </>
   )}
   ```

2. **Style the Backdrop**
   ```css
   .settings-backdrop {
     position: fixed;
     top: 0;
     left: 0;
     right: 0;
     bottom: 0;
     background: rgba(0, 0, 0, 0.4);
     backdrop-filter: blur(2px);
     z-index: 1999;
   }
   ```

3. **Animate Backdrop**
   - Fade in with panel slide
   - Fade out with panel exit

---

### Step 4: Click Outside to Close
**Goal**: Close settings when clicking backdrop or pressing ESC

#### Changes Required:
1. **Add Click Handler**
   ```typescript
   const handleBackdropClick = (e: React.MouseEvent) => {
     if (e.target === e.currentTarget) {
       handleCloseSettings();
     }
   };
   ```

2. **Add Keyboard Handler**
   ```typescript
   useEffect(() => {
     const handleEsc = (e: KeyboardEvent) => {
       if (e.key === 'Escape' && showSettings) {
         handleCloseSettings();
       }
     };
     document.addEventListener('keydown', handleEsc);
     return () => document.removeEventListener('keydown', handleEsc);
   }, [showSettings]);
   ```

3. **Prevent Verse Interaction**
   ```css
   .verse-content.settings-open {
     pointer-events: none;
   }
   ```

---

### Step 5: Slide-Out Animation
**Goal**: Smooth exit animation when closing

#### Changes Required:
1. **Create Exit Animation**
   ```typescript
   const handleCloseSettings = () => {
     const tl = gsap.timeline();

     // Slide panel out
     tl.to('.settings-panel-wrapper', {
       x: '100%',
       duration: 0.3,
       ease: 'power2.in'
     })
     // Fade backdrop
     .to('.settings-backdrop', {
       opacity: 0,
       duration: 0.3
     }, '-=0.3')
     // Clean up state
     .call(() => setShowSettings(false));
   };
   ```

2. **Handle Animation Interruption**
   - Kill existing animations before starting new ones
   - Prevent rapid open/close issues

---

### Step 6: Responsive Design
**Goal**: Optimize for different screen sizes

#### Changes Required:
1. **Mobile (< 768px)**
   - Panel takes 100% width
   - Simplified backdrop

2. **Tablet (768px - 1024px)**
   - Panel takes 80% width
   - Max-width: 500px

3. **Desktop (> 1024px)**
   - Panel takes 60% width
   - Max-width: 600px

4. **CSS Media Queries**
   ```css
   @media (max-width: 768px) {
     .settings-panel-wrapper {
       width: 100%;
       max-width: none;
     }
   }
   ```

---

### Step 7: Polish & Accessibility
**Goal**: Refine animations and ensure accessibility

#### Changes Required:
1. **Focus Management**
   - Focus first interactive element when panel opens
   - Return focus to trigger button when closed
   - Trap focus within panel

2. **ARIA Attributes**
   ```html
   role="dialog"
   aria-modal="true"
   aria-labelledby="settings-title"
   ```

3. **Animation Performance**
   - Use `will-change: transform`
   - Test on low-end devices
   - Add `prefers-reduced-motion` support

4. **Visual Polish**
   - Add subtle shadow to panel edge
   - Smooth scrolling within panel
   - Loading states for preference changes

---

## Testing Checklist

### Functional Tests
- [ ] Settings button opens panel
- [ ] Panel slides in from right
- [ ] Verse content remains visible
- [ ] Backdrop appears and dims content
- [ ] Click backdrop closes panel
- [ ] ESC key closes panel
- [ ] Back button closes panel
- [ ] Panel slides out smoothly
- [ ] Rapid open/close handled gracefully

### Visual Tests
- [ ] No layout shift during animation
- [ ] Smooth 60fps animations
- [ ] Proper z-index layering
- [ ] Responsive on all screen sizes
- [ ] Theme compatibility (light/dark)

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader announces panel
- [ ] Focus properly managed
- [ ] Reduced motion respected

### Performance Tests
- [ ] Animation performance on low-end devices
- [ ] Memory usage with both components rendered
- [ ] No animation jank or stuttering

---

## Rollback Plan
If issues arise, we can easily revert by:
1. Restoring original fade animations
2. Removing backdrop element
3. Reverting CSS changes

The changes are isolated and won't affect core functionality.

---

## Success Metrics
- Smooth animations at 60fps
- No increase in memory usage > 10%
- Positive user feedback on new UX
- No accessibility regressions
- Works on 95% of target browsers

---

## Next Steps After This PR
1. Extract settings into dedicated `SettingsPanel` component
2. Refactor state management
3. Add animation presets for consistency
4. Consider adding more panel-based features (help, about, etc.)