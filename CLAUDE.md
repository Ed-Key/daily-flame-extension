# CLAUDE.md

## Project: Daily Bread

Chrome extension (Manifest V3) displaying daily Bible verses with animations, Firebase auth, and 7+ translation support.

## Commands

```bash
npm run build:dev   # Dev build - RUN AFTER EVERY CODE CHANGE
npm run build       # Production build
npm run watch       # Watch mode
npm test            # Run tests
```

## Critical Constraints

### Shadow DOM (Most Important)
This extension injects onto every website. ALL styles must go in `src/styles/shadow-dom-styles.ts` - regular CSS imports will not work. See `@docs/css-system.md` for the full CSS architecture.

### No Tailwind
We use component-specific CSS in `src/styles/components/*.css.ts`. Tailwind is not available in Shadow DOM.

### Manifest V3
Requires offscreen documents for Firebase auth popup flows.

## Key Patterns

### Adding New Component Styles
1. Create `src/styles/components/my-component.css.ts`
2. Export styles as template string
3. Import in `shadow-dom-styles.ts`
4. Use CSS variables for theme support (`var(--glass-bg)`)

### Theme Switching
Controlled via `data-theme` attribute on Shadow DOM host:
```typescript
shadowRoot.host.setAttribute('data-theme', 'light');
```

### Bible Translation Routing
```
ESV → ESVService (api.esv.org)
NLT → NLTService (api.nlt.to)
KJV/ASV/WEB → scripture.api.bible
```
All output as `UnifiedChapter` format. See `@docs/bible-apis.md`.

## Git Branching Workflow

**Branch Structure:**
```
main (production - clean, shipped code)
  └── dev (development base - has debug tools, test fixtures, 12MB Bible data)
        └── feature/xyz (feature branches created from dev)
```

**Key Points:**
- `main` = Clean production code (what gets shipped/released)
- `dev` = Development environment with debug UI, test fixtures, and tooling
- `dev` has permanent stuff (debug tools, fixtures) that should NEVER go to `main`

**Workflow:**
1. `git checkout dev` → Start from dev branch
2. `git checkout -b feature/my-feature` → Create feature branch off dev
3. Develop and test using debug tools on the feature branch
4. When done, merge feature branch back to `dev`
5. Test thoroughly on `dev` with debug UI
6. **Cherry-pick** clean feature commits to `main` (excludes debug code)

**Why Cherry-Pick Instead of Merge:**
Since `dev` contains debug UI and large test fixtures that shouldn't be in production, we cherry-pick specific commits to `main` rather than merging the entire branch.

**Quick Commands:**
```bash
# Start new feature
git checkout dev
git checkout -b feature/something

# When done, merge to dev
git checkout dev
git merge feature/something

# Release to main (cherry-pick specific commits)
git checkout main
git cherry-pick <commit-hash>
git push origin main
```

## Architecture Overview

```
src/
├── content/verse-app.ts      # Entry: Shadow DOM + React mount
├── components/VerseOverlay/  # Main UI components
├── services/                 # API integrations
│   ├── verse-service.ts      # Orchestrator (routes to APIs)
│   ├── esv-service.ts        # ESV API
│   ├── nlt-service.ts        # NLT API
│   └── parsers/              # HTML/JSON → UnifiedChapter
├── styles/
│   ├── shadow-dom-styles.ts  # ALL CSS injected here
│   ├── components/           # Component-specific CSS
│   └── theme-variables.css.ts
└── types/bible-formats.ts    # Unified verse interfaces
```

## Firebase MCP

Use Firebase MCP tools to query Firestore directly:

```
# Get today's verse
firestore_get_documents(paths: ["dailyVerses/YYYY-MM-DD"])

# Query users collection
firestore_query_collection(collection_path: "users", ...)

# Check function logs
functions_get_logs(min_severity: "ERROR")
```

See `@docs/firebase-schema.md` for collection schemas.

## Workflow Guidelines

### Before Implementing Features
Run an Explore agent to understand existing patterns before proposing changes. The codebase has specific conventions for CSS, parsing, and component structure.

### After Any Code Changes
Always run `npm run build:dev` to verify compilation before considering work complete.

### When Debugging
Use sequential thinking for complex parsing or animation issues. The NLT parser has 3 fallback strategies for a reason.

### Git Commits
Do NOT include "Co-Authored-By: Claude" in commit messages. Just write the commit message normally.

## Detailed Documentation

For deeper context, these files are automatically imported:

@docs/architecture.md - Component hierarchy, state management, GSAP animations
@docs/css-system.md - Shadow DOM injection, theme system, component CSS patterns
@docs/bible-apis.md - ESV/NLT/Standard API details, parser system, unified format
@docs/firebase-schema.md - Firestore collections, security rules, auth flow
