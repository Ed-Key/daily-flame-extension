# Bible API Architecture

The extension supports 7+ Bible translations via multiple APIs. The `VerseService` acts as an orchestrator that routes requests to the appropriate API.

## Request Routing

```
VerseService.getVerse(reference, bibleId)
├── ESV → ESVService (dedicated API)
├── NLT → NLTService (dedicated API)
└── KJV/ASV/WEB → scripture.api.bible (standard API)
```

## ESV API

**Base URL:** `https://api.esv.org/v3`
**Auth:** Token-based header (`Authorization: Token {KEY}`)

### Endpoints

**Single Verse:**
```
GET /passage/text/?q={reference}&include-verse-numbers=false
```

**Chapter (with red letters):**
```
GET /passage/html/?q={reference}&include-headings=true&include-verse-numbers=true
```

### HTML Structure
- Chapter numbers: `<b class="chapter-num">1:1&nbsp;</b>`
- Verse numbers: `<b class="verse-num">2</b>`
- Section headings: `<h3 id="...">heading</h3>`
- Words of Christ: `<span class="woc">text</span>`
- Poetry lines: `<span class="line">...</span>`
- Stanza breaks: `<span class="end-line-group">`

## NLT API

**Base URL:** `https://api.nlt.to/api`
**Auth:** Query parameter (`key={KEY}`)

### Reference Format Conversion
```
John 3:16     → John.3.16      (colons → dots)
2 Chronicles  → 2 Chronicles.7.14  (numbered books keep space)
```

### Endpoint
```
GET /passages?ref={nltReference}&version=NLT
```

### HTML Structure (Custom Tags)
```html
<verse_export vn="1">
  <h2 class="chapter-number"><span class="cw_ch">3</span></h2>
  <p class="body"><span class="vn">1</span>verse text</p>
</verse_export>
```

**Key elements:**
- Verse wrapper: `<verse_export vn="1">`
- Chapter number: `<span class="cw_ch">`
- Verse number: `<span class="vn">`
- Red letters: `<span class="red">`
- Footnotes: `<a class="a-tn">` + `<span class="tn">` (must remove)

### Parsing Challenges
NLT HTML is messy. The parser uses 3 fallback strategies:
1. DOM parsing (primary)
2. Regex parsing (fallback)
3. Text content extraction (last resort)

## Scripture.api.bible (Standard)

**Base URL:** `https://api.scripture.api.bible/v1`
**Auth:** API key header

### Bible IDs
- KJV: `de4e12af7f28f599-02`
- ASV: `06125adad2d5898a-01`
- WEB: `9879dbb7cfe39e4d-04`

### Endpoints
```
GET /bibles/{bibleId}/passages/{reference}?content-type=text
GET /bibles/{bibleId}/chapters/{bookCode}.{chapter}?content-type=json
```

### JSON Structure
```json
{
  "data": {
    "content": [{
      "items": [
        { "type": "verse", "number": "1", "text": "..." }
      ]
    }]
  }
}
```

## Parser System

Abstract factory pattern with base class:

```
BaseBibleParser (abstract)
├── ESVBibleParser   → handles ESV HTML
├── NLTBibleParser   → handles NLT HTML + verse_export tags
└── StandardBibleParser → handles scripture.api.bible JSON
```

All parsers output `UnifiedChapter` format for consistent rendering.

## Unified Output Format

```typescript
interface UnifiedVerse {
  number: string;           // "1", "16"
  text: string;             // Cleaned verse text
  lines?: string[];         // Poetry lines (Psalms)
  isRedLetter?: boolean;    // Words of Jesus
  isFirstVerse?: boolean;   // First verse of chapter
  heading?: string;         // Section heading
  isSelah?: boolean;        // Psalm "Selah" marker
  poetryIndentLevel?: number; // 0, 1, 2 for q1/q2
  stanzaBreakAfter?: boolean;
}

interface UnifiedChapter {
  reference: string;        // "John 3"
  translation: BibleTranslation;
  bookName: string;
  chapterNumber: string;
  verses: UnifiedVerse[];
  psalmMetadata?: PsalmMetadata;
}
```

## Reference Normalization

`VerseService.convertReferenceToApiFormat()` handles:
- Unicode dashes (–, —) → ASCII hyphen
- Whitespace normalization
- 66 books with 100+ aliases (full names, abbreviations)

**Output formats:**
- Single verse: `GEN.1.1`
- Range: `GEN.1.1-GEN.1.5`

## Key Files

- `src/services/verse-service.ts` - Main orchestrator
- `src/services/esv-service.ts` - ESV API integration
- `src/services/nlt-service.ts` - NLT API integration
- `src/services/parsers/` - Parser implementations
- `src/types/bible-formats.ts` - Unified interfaces
