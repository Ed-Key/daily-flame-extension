# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
DailyFlame is a Chrome extension (Manifest V3) that displays daily Bible verses with beautiful animations. It features Firebase authentication, multiple Bible translation support, and a modular React/TypeScript architecture.

## Development Commands

### Build & Development
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run watch` - Watch mode for development
- `npm run clean` - Clean dist directory

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Watch mode for tests
- `npm run test:coverage` - Generate coverage report

### Linting & Type Checking
**IMPORTANT**: Always run these commands before completing any task:
- Check if lint/typecheck commands exist in package.json
- If not found, ask user for the correct commands
- Suggest adding them to this file for future reference

## Architecture Overview

### Chrome Extension Structure (Manifest V3)
- **content.js**: Monitors page loads and determines when to show verses
- **verse-app.js**: Main React application loaded in Shadow DOM
- **background.js**: Service worker for Chrome extension lifecycle
- **offscreen.html**: Required for Firebase auth in Manifest V3

### Shadow DOM Implementation
**CRITICAL**: All styles must be in `src/styles/shadow-dom-styles.ts` due to Shadow DOM isolation. Regular CSS imports will not work.

### Bible Text Processing Architecture
```
verse-service.ts (orchestrator)
    ├── esv-service.ts (ESV API integration)
    ├── nlt-service.ts (NLT API integration)
    └── scripture.api.bible (KJV, ASV, WEB)
    
Parser System:
    ├── BaseParser (abstract base class)
    ├── EsvParser (ESV-specific formatting)
    ├── NltParser (NLT-specific formatting)
    └── StandardParser (generic Bible formatting)
```

### Component Architecture
The main VerseOverlay component is modularized:
- `ProfileDropdown`: User authentication state and preferences
- `AdminControls`: Daily verse management (admin only)
- `VerseDisplay`: Core verse display with GSAP animations
- `ContextView`: Full chapter reading view
- `AuthButtons`: Sign in/up UI components

### API Integrations
- **ESV API**: `https://api.esv.org/v3` - Requires API key
- **NLT API**: `https://api.nlt.to` - Requires API key
- **Scripture.api.bible**: For KJV, ASV, WEB translations
- **Firebase**: Authentication and Firestore for data persistence

### Key Technical Constraints
1. **Shadow DOM**: All styling must be injected via shadow-dom-styles.ts
2. **Manifest V3**: Requires offscreen documents for Firebase auth
3. **GSAP Animations**: Used for verse reveal and transitions
4. **React 18**: With TypeScript for type safety

## Testing Approach
- Jest with ts-jest for TypeScript support
- Test files in `__tests__` directories
- Integration tests for API services and parsers
- Mock Chrome APIs for extension-specific code

## Recent Implementation Notes

### ESV Bible Formatting (2025-07-07)
- Large floating chapter numbers (e.g., "4" floats left of first verse)
- Paragraph indentation (2em) except for first paragraph
- Section headings in italics
- Fixed verse number parsing ("4:1" was showing as "41")

### Line Animation Fix
When returning from context view, use `requestAnimationFrame` to ensure proper animation sequencing.

## Performance Considerations
- Verses are cached in Chrome storage to reduce API calls
- GSAP animations are optimized for smooth performance
- React components use proper memoization where needed

## Security Notes
- API keys are stored in Firebase config
- User authentication via Firebase Auth
- Content Security Policy configured for extension context