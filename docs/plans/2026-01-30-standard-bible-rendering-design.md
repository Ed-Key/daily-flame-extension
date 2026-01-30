# Standard Bible Rendering Enhancement Design

**Date:** 2026-01-30
**Status:** Approved
**Scope:** KJV, ASV, WEB translations

## Overview

Enhance Standard Bible translations (KJV/ASV/WEB) to render with the same quality as NLT/ESV - proper stanza breaks, poetry structure, and paragraph grouping.

## Problem

Current Standard translations render poorly:
- No stanza breaks in Psalms (data exists but ignored)
- No poetry line structure (single text blob per verse)
- No paragraph grouping in prose (every verse separate)
- KJV renders verse-per-paragraph instead of flowing prose

## Solution

Enhance `standard-parser.ts` to extract rich data that already exists in the API response, then route all translations through the existing `renderESVStyle()` renderer.

## Target Output Structure

**Current parser output:**
```typescript
{
  number: "1",
  text: "The LORD is my shepherd; I shall not want.",
  poetryIndentLevel: 1,
  isRedLetter: false
}
```

**Enhanced parser output:**
```typescript
{
  number: "1",
  text: "The LORD is my shepherd; I shall not want.",
  poetryIndentLevel: 1,
  isRedLetter: false,

  // NEW fields:
  poetryLines: [
    { text: "The LORD is my shepherd; I shall not want.", indentLevel: 1, isRedLetter: false }
  ],
  stanzaBreakAfter: true,
  startsParagraph: true,
  speakerLabels: [
    { text: "Young Woman", beforeLineIndex: 0 }
  ]
}
```

## Extraction Logic

### 1. Stanza Breaks
- Detect blank `b` paragraphs: `{ "attrs": { "style": "b" }, "items": [] }`
- Mark the **previous verse** with `stanzaBreakAfter: true`

### 2. Paragraph Boundaries
- Track paragraph style changes (`p` → `q1`, `q1` → `p`, etc.)
- Set `startsParagraph: true` on first verse after style change

### 3. Poetry Lines Array
- For verses in `q1`/`q2` paragraphs, create `poetryLines[]` array
- Map indent level: `q1` → 1, `q2` → 2
- Standard API typically has one verse per paragraph

### 4. Speaker Labels with Position
- Add `beforeLineIndex: 0` to existing speaker extraction
- Works for Standard since verses are typically single-line

## Rendering Changes

Route all Standard translations through `renderESVStyle()`:

```typescript
// Before
const useKJVFormatting = translation === 'KJV' || translation === 'ASV';
if (useKJVFormatting) {
  return renderKJVStyle(...);
}

// After
const useRichFormatting = ['ESV', 'NLT', 'KJV', 'ASV', 'WEB'].includes(translation);
if (useRichFormatting) {
  return renderESVStyle(...);
}
```

**Visual change:** KJV/ASV verse numbers change from bold to superscript for consistency.

## Files to Modify

| File | Changes |
|------|---------|
| `src/services/parsers/standard-parser.ts` | Add stanza break, poetry lines, paragraph boundary extraction |
| `src/components/VerseOverlay/utils/unifiedVerseRenderer.tsx` | Route KJV/ASV/WEB through `renderESVStyle()` |
| `src/services/__tests__/standard-parser-fixtures.test.ts` | Add tests for new extracted fields |

## Implementation Order

1. **Parser: Stanza breaks** (~20 lines)
   - Detect `style: "b"` paragraphs
   - Mark previous verse with `stanzaBreakAfter: true`

2. **Parser: Paragraph boundaries** (~15 lines)
   - Track paragraph style changes
   - Set `startsParagraph: true` on first verse after change

3. **Parser: Poetry lines** (~30 lines)
   - For `q1`/`q2` paragraphs, create `poetryLines[]` array
   - Map indent level from paragraph style

4. **Parser: Speaker label positioning** (~10 lines)
   - Add `beforeLineIndex: 0` to existing speaker extraction

5. **Renderer: Update routing** (~5 lines)
   - Route Standard translations through `renderESVStyle()`

6. **Run full test suite**
   - Verify 0 content loss across all translations

## Testing Strategy

**Existing coverage (no changes needed):**
- `standard-content-verification.test.ts` - Verifies all 31K+ fields render
- `standard-parser-fixtures.test.ts` - Verifies parser extraction

**New tests to add:**
```typescript
describe('stanza break extraction', () => {
  it('should mark verse before blank paragraph with stanzaBreakAfter');
});

describe('poetry lines extraction', () => {
  it('should create poetryLines array for q1/q2 paragraphs');
});

describe('paragraph boundary extraction', () => {
  it('should mark startsParagraph on style transitions');
});
```

## Estimated Scope

- ~80 lines of parser changes
- ~5 lines of renderer changes
- ~50 lines of new tests

## Success Criteria

1. All existing content verification tests pass (0 word loss)
2. Psalm 23 renders with visible stanza breaks
3. Genesis 1 renders with paragraph grouping
4. Song of Solomon renders with positioned speaker labels
