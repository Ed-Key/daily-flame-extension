# Testing Strategy: Parser & Renderer Verification

This document explains the fixture-based testing pattern used for Bible API parsing and rendering. This approach ensures no content is lost from raw API responses through to final rendered output.

## The Pipeline

```
Raw API HTML              Parser                 UnifiedChapter           Renderer
(from API)           ─────────────>            (structured data)      ──────────>
                     NLTHTMLParser                                     renderUnified
<verse_export>         .parseToUnified()         {                      Verses()
  <p class="poet1">                                verses: [
    verse text...                                    { text,
  </p>                                                 poetryLines,
</verse_export>                                        heading,
                                                       isRedLetter }
                                                   ]
                                                 }
        │                                              │
        │                                              │
        ▼                                              ▼
  ┌──────────────┐                           ┌──────────────────┐
  │ Parser Tests │                           │ Content Verify   │
  │              │                           │                  │
  │ "Did we      │                           │ "Did we render   │
  │  extract     │                           │  everything we   │
  │  everything  │                           │  parsed?"        │
  │  from HTML?" │                           │                  │
  └──────────────┘                           └──────────────────┘
```

## Two Complementary Test Layers

### Layer 1: Parser Tests

**File:** `src/services/__tests__/nlt-parser.test.ts`

**Question:** "Did we extract everything from the raw HTML correctly?"

**Approach:**
```typescript
// Load fixture (real API response)
const fixture = fullBible['Psalms']['23'];

// Parse to structured data
const result = parser.parseToUnified(fixture.html, fixture.reference);

// Assert extraction was correct
expect(result.verses).toHaveLength(6);
expect(result.verses[0].poetryLines).toBeDefined();
expect(result.psalmMetadata?.superscription).toContain('David');
```

**What it catches:**
- Content not extracted from HTML
- Wrong verse counts
- Missing poetry structure
- Footnote content leaked into verse text
- Missing metadata (headings, Psalm titles, red letter flags)

**Key test patterns:**
- Verse count validation against known values
- Footnote leak detection with regex patterns
- Feature presence checks (poetry, red letter, speakers)

### Layer 2: Content Verification

**File:** `src/components/VerseOverlay/utils/__tests__/renderer-content-verification.test.ts`

**Question:** "Did we render everything we parsed?"

**Approach:**
```typescript
// Parse fixture
const chapter = parser.parseToUnified(fixture.html, fixture.reference);

// Render to HTML string
const rendered = renderToStaticMarkup(
  <>{renderUnifiedVerses({ chapter, ... })}</>
);

// Extract words from parsed data
const expectedWords = getWords(verse.text);

// Extract words from rendered output
const renderedWords = new Set(getWords(rendered));

// Verify every parsed word appears in output
for (const word of expectedWords) {
  expect(renderedWords.has(word)).toBe(true);
}
```

**What it catches:**
- Parsed fields that aren't rendered (e.g., `speakerLabel` extracted but ignored)
- Content in wrong field that renderer doesn't use
- Rendering logic bugs that skip content

**Example failure:**
```
Song of Solomon 5:1
  verse.text: "I have entered my garden... Young Women of Jerusalem..."
  Missing words: [young, women, jerusalem]

  Root cause: Parser only removed first speaker label, second leaked into text
```

## Why Both Tests Are Needed

| Bug Type | Parser Test | Content Verify |
|----------|-------------|----------------|
| Content not extracted from HTML | ✅ Catches | ❌ Misses (nothing to render) |
| Content extracted but not rendered | ❌ Misses | ✅ Catches |
| Content in wrong field | ⚠️ Maybe | ✅ Catches (if field not rendered) |
| Footnote leaked into verse text | ✅ Catches | ❌ Misses (just renders it) |
| Wrong verse count | ✅ Catches | ❌ Misses |
| Missing poetry indentation | ✅ Catches | ❌ Misses (words still present) |

**Together:** Raw HTML → Parsed Data → Rendered Output loses nothing.

## Fixture-Based Testing

### Why Fixtures?

1. **Fast** - No network calls, tests run in milliseconds
2. **Deterministic** - Same input every time, no API changes
3. **Comprehensive** - Test all 66 books, 1,189 chapters automatically
4. **Real edge cases** - Actual API responses contain real complexity

### Fixture Structure

```
src/services/__tests__/fixtures/
├── full-bible-nlt.json      # All 66 books (12MB, dev branch only)
└── nlt-responses/           # Individual book fixtures
    ├── genesis.json
    ├── psalms.json
    └── ...
```

**Fixture format:**
```json
{
  "Genesis": {
    "1": {
      "reference": "Genesis 1",
      "html": "<div id=\"bibletext\">..."
    }
  }
}
```

### Creating Fixtures

Fixtures are captured from real API responses:

```typescript
// One-time capture script (not in test suite)
const response = await NLTService.getChapterWithRedLetters('Genesis', 1);
fixtures['Genesis']['1'] = {
  reference: 'Genesis 1',
  html: response
};
fs.writeFileSync('fixtures/genesis.json', JSON.stringify(fixtures));
```

## Adding Tests for New Parsers

To replicate this pattern for a new translation (e.g., ESV):

### Step 1: Create Fixtures

```typescript
// Capture real API responses
const esvFixtures = {};
for (const book of BIBLE_BOOKS) {
  for (let ch = 1; ch <= getChapterCount(book); ch++) {
    const html = await ESVService.getChapter(book, ch);
    esvFixtures[book] = esvFixtures[book] || {};
    esvFixtures[book][ch] = { reference: `${book} ${ch}`, html };
  }
}
```

### Step 2: Parser Tests

```typescript
describe('ESV Parser', () => {
  it('should parse correct verse count', () => {
    const fixture = esvFixtures['John']['3'];
    const result = parser.parseToUnified(fixture.html, fixture.reference);
    expect(result.verses).toHaveLength(36);
  });

  it('should detect red letter text', () => {
    const fixture = esvFixtures['John']['3'];
    const result = parser.parseToUnified(fixture.html, fixture.reference);
    const redLetterVerses = result.verses.filter(v => v.isRedLetter);
    expect(redLetterVerses.length).toBeGreaterThan(0);
  });

  it('should not leak footnotes into verse text', () => {
    // Test all fixtures for footnote patterns
  });
});
```

### Step 3: Content Verification

Add ESV to the existing content verification test:

```typescript
// In renderer-content-verification.test.ts
const ESV_FIXTURES = require('../fixtures/full-bible-esv.json');

describe('ESV Content Verification', () => {
  Object.entries(ESV_FIXTURES).forEach(([book, chapters]) => {
    Object.entries(chapters).forEach(([chNum, fixture]) => {
      it(`renders all content for ${book} ${chNum}`, () => {
        const chapter = esvParser.parseToUnified(fixture.html, fixture.reference);
        const rendered = renderToStaticMarkup(...);

        // Verify all words present
        verifyAllWordsRendered(chapter, rendered);
      });
    });
  });
});
```

## Key Test Utilities

### Word Extraction

```typescript
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,;:!?"'()[\]""''—–\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getWords(text: string): string[] {
  return normalizeText(text).split(' ').filter(w => w.length > 0);
}
```

### Footnote Leak Detection

```typescript
const LEAK_PATTERNS = [
  /\bHeb(?:rew)?\b/i,           // Hebrew translation notes
  /\bGr(?:eek)?\b/i,            // Greek translation notes
  /\bLit(?:erally)?\b/i,        // Literal translation notes
  /\bSome manuscripts\b/i,      // Textual variants
  /\bOr,?\s+[A-Z]/,             // Alternative readings
];

function hasFootnoteLeak(text: string): boolean {
  return LEAK_PATTERNS.some(p => p.test(text));
}
```

## Debugging Test Failures

### Parser Test Failure

```
Expected verse count: 31
Received: 29
```

**Debug steps:**
1. Open fixture HTML in browser dev tools
2. Count `<verse_export>` tags manually
3. Check if parser is merging verses incorrectly
4. Look for unusual HTML structure in missing verses

### Content Verification Failure

```
Micah 2:4 - Missing words: [taking, betrayed]
```

**Debug steps:**
1. Find the verse in fixture: `fixtures['Micah']['2']`
2. Parse and inspect: `parser.parseToUnified(...).verses[3]`
3. Check if words are in `verse.text` or another field
4. Check if renderer uses that field
5. Trace back to parser extraction logic

## Summary

| Test Type | File | What It Verifies |
|-----------|------|------------------|
| Parser unit tests | `nlt-parser.test.ts` | Correct extraction from HTML |
| Content verification | `renderer-content-verification.test.ts` | All parsed content is rendered |
| Parser integration | `nlt-parser-integration.test.ts` | API response format handling |
| Data capture tests | `nlt-parser-data-capture.test.ts` | Advanced features (tables, footnote types) |

**The key insight:** Parser tests and content verification are complementary. Parser tests catch extraction bugs. Content verification catches rendering bugs. Together, they ensure nothing is lost from raw API response to final display.
