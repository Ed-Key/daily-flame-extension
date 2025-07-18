# CLAUDE.md

**⚡ ALWAYS USE SUPERCLAUDE**: This project requires SuperClaude tools for all operations. 
See "MANDATORY: Always Use SuperClaude Tools" section below.

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

### Build After Edit Rule
**MANDATORY**: After making ANY code changes:
1. Always run `npm run build:dev` to verify compilation
2. Check for any build errors and fix them immediately
3. Only mark tasks as complete after successful build

## Architecture Overview

### Chrome Extension Structure (Manifest V3)
- **content.js**: Monitors page loads and determines when to show verses
- **verse-app.js**: Main React application loaded in Shadow DOM
- **background.js**: Service worker for Chrome extension lifecycle
- **offscreen.html**: Required for Firebase auth in Manifest V3

### Shadow DOM Implementation
**CRITICAL**: All styles must be in `src/styles/shadow-dom-styles.ts` due to Shadow DOM isolation. Regular CSS imports will not work.

### CSS Architecture (NO TAILWIND)
**IMPORTANT**: This project does NOT use Tailwind CSS. We use component-specific CSS for better Shadow DOM compatibility and performance.

#### CSS Structure:
```
src/styles/
├── shadow-dom-styles.ts      # Main style injection (imports all component styles)
├── components/               # Component-specific styles
│   ├── profile-dropdown.css.ts
│   ├── translation-dropdown.css.ts
│   └── [component-name].css.ts
└── shared/                   # Shared styles
    └── glassmorphic.css.ts   # Reusable glassmorphic effects
```

#### CSS Guidelines:
1. **Use semantic class names** (e.g., `.profile-button`, `.translation-dropdown-menu`)
2. **Create component-specific CSS files** in `src/styles/components/`
3. **Export styles as template strings** from `.css.ts` files
4. **Import component styles** in `shadow-dom-styles.ts`
5. **Never use Tailwind utility classes** - they're not available in Shadow DOM

#### Example Component CSS:
```typescript
// src/styles/components/my-component.css.ts
export const myComponentStyles = `
  .my-component {
    display: flex;
    align-items: center;
    /* Component-specific styles */
  }
`;
```

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

### CSS Migration from Tailwind (2025-07-17)
- Migrated from Tailwind utility classes to component-specific CSS
- Created modular CSS architecture in `src/styles/components/`
- Improved performance by eliminating ~2,000 lines of unused Tailwind utilities
- All components now use semantic class names for better maintainability

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

## MANDATORY: Always Use SuperClaude Tools

**CRITICAL**: You MUST use SuperClaude commands and personas for ALL tasks. Never use generic approaches.

### ABSOLUTE REQUIREMENTS:
1. **ALWAYS USE SUPERCLAUDE COMMANDS** - No exceptions
2. **ALWAYS RUN `npm run build:dev`** after ANY code changes
3. **COMBINE COMMANDS** as needed (e.g., `/build --feature --tdd --magic --persona-frontend`)
4. **USE APPROPRIATE PERSONAS** for each task type

### Before ANY task:
1. Identify the task type (frontend, backend, debugging, etc.)
2. Select appropriate persona using `--persona-[type]`
3. Choose the right command (/build, /analyze, /improve, etc.)
4. Enable relevant MCP servers (--c7, --magic, --seq, --pup)
5. Always announce which SuperClaude tools you're using

### Response Format:
"I'll use SuperClaude's [command] with [persona] to accomplish this:
`/[command] --[flags] --persona-[type]`"

## SuperClaude Configuration
**IMPORTANT**: This project uses SuperClaude - an advanced AI assistant framework. When responding to user requests, actively consider and use these tools when appropriate.

Full documentation: `/mnt/c/Users/EdKib/DailyFlame/Super_Claude_Docs.md`

### When to Use SuperClaude Tools:

#### 1. PERSONAS - Automatically activate based on task type:
- **Frontend work** (React, UI, CSS) → Use `--persona-frontend`
- **API/Backend work** → Use `--persona-backend`
- **System design/Architecture** → Use `--persona-architect`
- **Debugging/Investigation** → Use `--persona-analyzer`
- **Security concerns** → Use `--persona-security`
- **Testing/QA** → Use `--persona-qa`
- **Performance issues** → Use `--persona-performance`
- **Code cleanup** → Use `--persona-refactorer`
- **Documentation/Teaching** → Use `--persona-mentor`

#### 2. MCP SERVERS - Enable for specialized capabilities:
- **Library/Framework questions** → Use `--c7` (Context7 for official docs)
- **Complex analysis/debugging** → Use `--seq` (Sequential thinking)
- **UI component generation** → Use `--magic` (Magic UI components)
- **E2E testing/browser automation** → Use `--pup` (Puppeteer)

#### 3. COMMANDS - Use these instead of generic responses:
- **Understanding code** → `/analyze --code --arch`
- **Building features** → `/build --feature --tdd`
- **Finding bugs** → `/troubleshoot --investigate --seq`
- **Security review** → `/scan --security --owasp`
- **Performance optimization** → `/improve --performance --profile`
- **Code quality** → `/improve --quality --iterate`
- **Testing** → `/test --coverage --e2e`
- **Documentation** → `/document --user --examples`

#### 4. THINKING MODES - Apply based on complexity:
- **Simple tasks** → Normal mode
- **Multi-file analysis** → `--think` (4K tokens)
- **Architecture decisions** → `--think-hard` (10K tokens)
- **System redesign** → `--ultrathink` (32K tokens)

#### 5. AUTO-ACTIVATION RULES:
- **3+ step tasks** → Automatically use TodoWrite
- **Bug/error keywords** → Activate analyzer persona
- **Performance keywords** → Activate performance persona
- **Security keywords** → Activate security persona + scan
- **Large context (>75%)** → Enable `--uc` (UltraCompressed)

### Example Usage in Responses:

```bash
# When user asks about a bug:
/troubleshoot --investigate --seq --persona-analyzer

# When building a React component:
/build --feature --react --magic --persona-frontend

# When reviewing security:
/scan --security --owasp --persona-security

# When optimizing performance:
/analyze --performance --pup --persona-performance
```

### Key Principles:
1. **Always consider** which SuperClaude tools match the user's request
2. **Proactively suggest** using appropriate commands and personas
3. **Use evidence-based language** ("may", "could", "typically" instead of "best", "optimal")
4. **Enable MCP servers** when they provide value for the task
5. **Apply thinking modes** for complex analysis
6. **Use TodoWrite** for multi-step tasks automatically

### SuperClaude Enforcement Rules:
- **NEVER** edit files without using a SuperClaude command
- **ALWAYS** state which persona you're activating at the start
- **ALWAYS** explain which MCP servers would help and why
- **MUST** announce the SuperClaude command before executing
- For UI work: **MUST** use `--persona-frontend` with `--magic`
- For debugging: **MUST** use `--persona-analyzer` with `--seq`
- For architecture: **MUST** use `--persona-architect` with `--ultrathink`
- For security: **MUST** use `--persona-security` with OWASP scanning
- For performance: **MUST** use `--persona-performance` with `--pup`

### Decision Matrix for Tool Selection:

| User Says | Claude Should Use |
|-----------|-------------------|
| "help me debug", "fix this error", "investigate issue" | `/troubleshoot --investigate --seq --persona-analyzer` |
| "build a component", "create UI", "implement feature" | `/build --feature --magic --persona-frontend` |
| "design API", "system architecture", "database schema" | `/design --api --seq --ultrathink --persona-architect` |
| "security audit", "check vulnerabilities", "OWASP scan" | `/scan --security --owasp --persona-security` |
| "slow performance", "optimize", "bottleneck" | `/analyze --performance --pup --profile --persona-performance` |
| "clean up code", "refactor", "technical debt" | `/improve --quality --iterate --persona-refactorer` |
| "write tests", "test coverage", "E2E testing" | `/test --coverage --e2e --pup --persona-qa` |
| "explain this", "document", "tutorial" | `/document --user --examples --persona-mentor` |
| "understand codebase", "analyze project" | `/analyze --code --arch --c7` |

### Integration Instructions for Claude:
1. **Read user request** → Identify keywords/intent
2. **Match to SuperClaude tools** → Select appropriate command/persona/MCP
3. **Mention the tool in response** → e.g., "I'll use the /analyze command with the performance persona to investigate this"
4. **Execute with proper flags** → Include all relevant flags for comprehensive results
5. **Use TodoWrite for complex tasks** → Automatically for 3+ steps

### Response Format Example:
```
User: "Can you help me fix this performance issue in my React app?"

Claude: "I'll help you investigate this performance issue. Let me use SuperClaude's performance analysis tools:

/analyze --performance --pup --profile --persona-performance

This will:
- Enable the performance persona for specialized optimization expertise
- Use Puppeteer to measure real browser performance metrics
- Generate detailed profiling data

Let me start by analyzing your React components..."
```

### Auto-Activate SuperClaude Based on Keywords:
When these keywords appear in user requests, IMMEDIATELY activate the corresponding SuperClaude tools:

- **UI/Frontend Keywords**: "UI", "button", "component", "design", "style", "CSS", "React", "interface"
  → Auto-activate: `/build --react --magic --persona-frontend`
  
- **Debug Keywords**: "debug", "error", "fix", "bug", "issue", "not working", "problem"
  → Auto-activate: `/troubleshoot --investigate --seq --persona-analyzer`
  
- **Performance Keywords**: "slow", "performance", "optimize", "lag", "speed up", "bottleneck"
  → Auto-activate: `/analyze --performance --pup --profile --persona-performance`
  
- **Security Keywords**: "security", "vulnerability", "auth", "permission", "OWASP", "exploit"
  → Auto-activate: `/scan --security --owasp --persona-security`
  
- **Architecture Keywords**: "design", "architecture", "structure", "system", "API", "database"
  → Auto-activate: `/design --seq --ultrathink --persona-architect`
  
- **Code Quality Keywords**: "refactor", "clean", "improve", "quality", "technical debt"
  → Auto-activate: `/improve --quality --iterate --persona-refactorer`
  
- **Testing Keywords**: "test", "coverage", "E2E", "unit test", "integration"
  → Auto-activate: `/test --coverage --e2e --pup --persona-qa`