# DailyFlame Chrome Extension - Development Notes

## Project Overview
DailyFlame is a Chrome extension that displays daily Bible verses to users. It features authentication, verse display with animations, and support for multiple Bible translations.

## Recent Updates (2025-07-07)

### ESV Bible Format Implementation
- Implemented ESV-specific formatting that matches traditional Bible typography
- Added large chapter number display (e.g., "4") that floats to the left of the first verse
- Fixed verse number extraction issue where "4:1" was displaying as "41" 
- Added paragraph indentation (2em) for all paragraphs except the first
- Section headings are displayed in italics and left-aligned
- Improved spacing to prevent text overlap with chapter number

### Modularized VerseOverlay Component
- Broke down the 1255-line VerseOverlay.tsx into smaller, maintainable components:
  - ProfileDropdown: User profile menu
  - AdminControls: Admin panel for daily verses
  - VerseDisplay: Main verse display with animations
  - ContextView: Full chapter view
  - AuthButtons: Sign in/up buttons
- Created utility functions and hooks for better organization
- Fixed line animation issue when returning from context view using requestAnimationFrame

### Key Technical Details
- ESV API endpoint: `https://api.esv.org/v3`
- Shadow DOM is used for style isolation in the Chrome extension
- GSAP animations for verse reveal and modal transitions
- React with TypeScript for component development
- Webpack for bundling

### Important Commands
- Build: `npm run build`
- The extension uses Shadow DOM, so all styles must be in shadow-dom-styles.ts

### API Services
- ESV Bible API is integrated with HTML parsing for red-letter support
- Scripture.api.bible is used for other translations (KJV, ASV, WEB)
- Firebase for authentication and data storage

### File Structure
```
src/
├── components/
│   ├── VerseOverlay/
│   │   ├── index.tsx (main component)
│   │   ├── components/ (sub-components)
│   │   ├── hooks/ (custom hooks)
│   │   └── utils/ (utilities)
│   └── forms/ (auth forms)
├── services/
│   ├── verse-service.ts
│   └── esv-service.ts
└── styles/
    └── shadow-dom-styles.ts
```

### Current Focus
The project recently implemented ESV Bible formatting to match traditional printed Bible layouts, with proper chapter numbers, verse numbers, and paragraph formatting.