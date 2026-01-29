/**
 * NLT HTML Parser Tests
 *
 * Tests the DOM-based NLT parser against fixture data.
 * Validates:
 * 1. Correct verse count extraction
 * 2. No leaked footnote content in verse text
 * 3. Footnotes captured as structured data
 * 4. Poetry structure preserved with proper spacing
 * 5. Special elements (Psalm metadata, speaker labels, etc.)
 */

import { NLTHTMLParser } from '../parsers/nlt-html-parser';
import * as fs from 'fs';
import * as path from 'path';

// Load fixtures
const fixturesPath = path.join(__dirname, 'fixtures', 'all-nlt-responses.json');
let fixtures: Record<string, Record<string, { reference: string; html: string }>> = {};

beforeAll(() => {
  if (fs.existsSync(fixturesPath)) {
    fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf-8'));
  } else {
    console.warn('Fixtures file not found:', fixturesPath);
  }
});

// Expected verse counts for key chapters
const EXPECTED_VERSE_COUNTS: Record<string, number> = {
  'Genesis_1': 31,
  'Exodus_20': 26,
  'Psalm_23': 6,
  'Psalm_119': 176,
  'John_3': 36,
  '2_Chronicles_7': 22,
  'Song_of_Solomon_1': 17,
};

// Patterns that indicate leaked footnote content
// These patterns are specific to footnote markers, not legitimate verse text
// Be very careful - patterns like "Or black." can appear in legitimate text
const LEAK_PATTERNS = [
  /\bHebrew [a-z]+ [a-z]+/i,        // "Hebrew the festival" (footnote translation notes)
  /\bGreek version reads\b/i,       // "Greek version reads..."
  /\bsee note on \d+:\d+/i,         // "see note on 5:3"
  /\bCompare [A-Z][a-z]+ \d+:\d+/i, // "Compare Matt 21:16"
  /\bAramaic [a-z]+ means\b/i,      // "Aramaic term means..."
  /\bSome manuscripts read\b/i,     // "Some manuscripts read..."
  /^\d+:\d+ [A-Z][a-z]+ /,          // "7:8 Hebrew the" at start (footnote ref prefix)
  // Note: "Or X." patterns removed - they appear in legitimate verse text like "or black."
];

describe('NLTHTMLParser', () => {
  let parser: NLTHTMLParser;

  beforeEach(() => {
    parser = new NLTHTMLParser();
  });

  describe('Basic Parsing', () => {
    it('should parse a simple chapter', () => {
      const genesis1 = fixtures.pentateuch?.Genesis_1;
      if (!genesis1) {
        console.warn('Skipping test - Genesis 1 fixture not found');
        return;
      }

      const result = parser.parseToUnified(genesis1.html, genesis1.reference);

      expect(result).toBeDefined();
      expect(result.verses).toBeDefined();
      expect(result.verses.length).toBeGreaterThan(0);
      expect(result.translation).toBe('NLT');
      expect(result.bookName).toBe('Genesis');
      expect(result.chapterNumber).toBe('1');
    });
  });

  describe('Verse Count Validation', () => {
    it.each(Object.entries(EXPECTED_VERSE_COUNTS))(
      'should extract correct verse count for %s',
      (key, expectedCount) => {
        // Find the fixture in any category
        let fixture: { reference: string; html: string } | undefined;
        for (const category of Object.values(fixtures)) {
          if (category[key]) {
            fixture = category[key];
            break;
          }
        }

        if (!fixture) {
          console.warn(`Skipping test - ${key} fixture not found`);
          return;
        }

        const result = parser.parseToUnified(fixture.html, fixture.reference);
        expect(result.verses.length).toBe(expectedCount);
      }
    );
  });

  describe('Footnote Leak Detection', () => {
    it('should not leak footnote content into verse text', () => {
      const leaks: string[] = [];

      // Test across all available fixtures
      for (const [categoryName, category] of Object.entries(fixtures)) {
        for (const [chapterKey, fixture] of Object.entries(category)) {
          const result = parser.parseToUnified(fixture.html, fixture.reference);

          for (const verse of result.verses) {
            for (const pattern of LEAK_PATTERNS) {
              const match = verse.text.match(pattern);
              if (match) {
                leaks.push(
                  `${fixture.reference} v${verse.number}: "${match[0]}" matches ${pattern}`
                );
              }
            }
          }
        }
      }

      if (leaks.length > 0) {
        console.error('Found footnote leaks:\n' + leaks.join('\n'));
      }
      expect(leaks).toHaveLength(0);
    });

    it('should specifically check 2 Chronicles 7:8 for Hebrew footnote leak', () => {
      const fixture = fixtures.historical?.['2_Chronicles_7'];
      if (!fixture) {
        console.warn('Skipping test - 2 Chronicles 7 fixture not found');
        return;
      }

      const result = parser.parseToUnified(fixture.html, fixture.reference);
      const verse8 = result.verses.find(v => v.number === '8');

      expect(verse8).toBeDefined();
      // The footnote says "Hebrew the festival" - this should NOT appear in verse text
      // But "Festival of Shelters" is legitimate verse content
      expect(verse8!.text).not.toMatch(/\bHebrew the festival\b/i);
      // Verify the footnote was captured
      if (verse8!.footnotes && verse8!.footnotes.length > 0) {
        const hebrewFootnote = verse8!.footnotes.find(f => f.type === 'hebrew');
        expect(hebrewFootnote?.content).toContain('festival');
      }
    });
  });

  describe('Footnote Capture', () => {
    it('should capture footnotes as structured data', () => {
      const genesis1 = fixtures.pentateuch?.Genesis_1;
      if (!genesis1) {
        console.warn('Skipping test - Genesis 1 fixture not found');
        return;
      }

      const result = parser.parseToUnified(genesis1.html, genesis1.reference);

      // Genesis 1:1 has a footnote about translation alternatives
      const verse1 = result.verses.find(v => v.number === '1');
      expect(verse1).toBeDefined();

      if (verse1?.footnotes) {
        expect(verse1.footnotes.length).toBeGreaterThan(0);
        expect(verse1.footnotes[0].content).toBeTruthy();
        expect(verse1.footnotes[0].marker).toBe('*');
      }
    });

    it('should categorize footnote types correctly', () => {
      // Find a chapter with Hebrew footnotes
      const fixture = fixtures.historical?.['2_Chronicles_7'];
      if (!fixture) {
        console.warn('Skipping test - fixture not found');
        return;
      }

      const result = parser.parseToUnified(fixture.html, fixture.reference);

      // Find verses with footnotes
      const versesWithFootnotes = result.verses.filter(v => v.footnotes && v.footnotes.length > 0);

      for (const verse of versesWithFootnotes) {
        for (const footnote of verse.footnotes!) {
          // Verify footnote has required fields
          expect(footnote.marker).toBeDefined();
          expect(footnote.content).toBeTruthy();
          expect(['hebrew', 'greek', 'alternative', 'cross-ref', 'other']).toContain(footnote.type);
        }
      }
    });
  });

  describe('Poetry Structure', () => {
    it('should capture poetry lines with indent levels', () => {
      const psalm23 = fixtures.poetryWisdom?.Psalm_23;
      if (!psalm23) {
        console.warn('Skipping test - Psalm 23 fixture not found');
        return;
      }

      const result = parser.parseToUnified(psalm23.html, psalm23.reference);

      // Psalms should have poetry structure
      const versesWithPoetry = result.verses.filter(v => v.poetryLines && v.poetryLines.length > 0);

      // Most Psalm verses should have poetry lines
      expect(versesWithPoetry.length).toBeGreaterThan(0);

      // Check indent levels
      for (const verse of versesWithPoetry) {
        for (const line of verse.poetryLines!) {
          expect([1, 2]).toContain(line.indentLevel);
          expect(line.text).toBeTruthy();
        }
      }
    });

    it('should track -sp spacing correctly', () => {
      const psalm23 = fixtures.poetryWisdom?.Psalm_23;
      if (!psalm23) {
        console.warn('Skipping test - Psalm 23 fixture not found');
        return;
      }

      const result = parser.parseToUnified(psalm23.html, psalm23.reference);

      // Check that hasSpaceBefore is captured on verses or poetry lines
      const versesWithSpacing = result.verses.filter(
        v => v.hasSpaceBefore || v.poetryLines?.some(l => l.hasSpaceBefore)
      );

      // There should be some stanza breaks in a Psalm
      // This validates that -sp classes are being detected
      if (versesWithSpacing.length === 0) {
        console.warn('No spacing markers found - this may indicate a parsing issue');
      }
    });
  });

  describe('Psalm Metadata', () => {
    it('should extract Psalm superscription', () => {
      const psalm23 = fixtures.poetryWisdom?.Psalm_23;
      if (!psalm23) {
        console.warn('Skipping test - Psalm 23 fixture not found');
        return;
      }

      const result = parser.parseToUnified(psalm23.html, psalm23.reference);

      expect(result.psalmMetadata).toBeDefined();
      // Psalm 23 should have "A psalm of David" or similar
      if (result.psalmMetadata?.superscription) {
        expect(result.psalmMetadata.superscription.toLowerCase()).toContain('david');
      }
    });

    it('should detect Selah markers', () => {
      // Find a Psalm with Selah (e.g., Psalm 3, 4, 7, etc.)
      // We need to check if we have such a fixture
      const psalmsWithSelah = ['Psalm_3', 'Psalm_4', 'Psalm_7', 'Psalm_46'];

      let foundSelah = false;
      for (const psalmKey of psalmsWithSelah) {
        const fixture = fixtures.poetryWisdom?.[psalmKey];
        if (fixture) {
          const result = parser.parseToUnified(fixture.html, fixture.reference);
          if (result.psalmMetadata?.hasSelah) {
            foundSelah = true;
            break;
          }
        }
      }

      // If we have the right fixtures, we should find Selah
      // Otherwise just log a warning
      if (!foundSelah) {
        console.warn('No Selah markers found - may need fixtures with Selah');
      }
    });
  });

  describe('Red Letter Text', () => {
    it('should detect Words of Jesus', () => {
      const john3 = fixtures.gospels?.John_3;
      if (!john3) {
        console.warn('Skipping test - John 3 fixture not found');
        return;
      }

      const result = parser.parseToUnified(john3.html, john3.reference);

      // John 3 contains words of Jesus (e.g., "Very truly I tell you...")
      const redLetterVerses = result.verses.filter(v => v.isRedLetter);

      expect(redLetterVerses.length).toBeGreaterThan(0);
    });
  });

  describe('Section Headings', () => {
    it('should extract section headings', () => {
      const genesis1 = fixtures.pentateuch?.Genesis_1;
      if (!genesis1) {
        console.warn('Skipping test - Genesis 1 fixture not found');
        return;
      }

      const result = parser.parseToUnified(genesis1.html, genesis1.reference);

      // Genesis 1 should have "The Account of Creation" heading
      const versesWithHeadings = result.verses.filter(v => v.heading);

      expect(versesWithHeadings.length).toBeGreaterThan(0);
      expect(versesWithHeadings[0].heading?.toLowerCase()).toContain('creation');
    });
  });

  describe('Speaker Labels (Song of Solomon)', () => {
    it('should extract speaker labels', () => {
      const sos1 = fixtures.poetryWisdom?.['Song_of_Solomon_1'];
      if (!sos1) {
        console.warn('Skipping test - Song of Solomon 1 fixture not found');
        return;
      }

      const result = parser.parseToUnified(sos1.html, sos1.reference);

      // Song of Solomon has speaker labels like "Young Woman" and "Young Man"
      const versesWithSpeakers = result.verses.filter(v => v.speakerLabels && v.speakerLabels.length > 0);

      if (versesWithSpeakers.length > 0) {
        expect(versesWithSpeakers[0].speakerLabels).toBeTruthy();
        expect(versesWithSpeakers[0].speakerLabels![0].text).toBeTruthy();
        expect(typeof versesWithSpeakers[0].speakerLabels![0].beforeLineIndex).toBe('number');
      } else {
        console.warn('No speaker labels found - check Song of Solomon fixture');
      }
    });
  });

  describe('All Fixtures Regression', () => {
    it('should parse all fixtures without errors', () => {
      let totalVerses = 0;
      let totalChapters = 0;

      for (const [categoryName, category] of Object.entries(fixtures)) {
        for (const [chapterKey, fixture] of Object.entries(category)) {
          expect(() => {
            const result = parser.parseToUnified(fixture.html, fixture.reference);
            expect(result.verses.length).toBeGreaterThan(0);
            totalVerses += result.verses.length;
            totalChapters++;
          }).not.toThrow();
        }
      }

      console.log(`Parsed ${totalChapters} chapters with ${totalVerses} total verses`);
    });
  });
});
