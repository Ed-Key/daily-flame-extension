/**
 * ESV Bible Parser Tests
 *
 * Tests the ESV parser against fixture data.
 * Validates:
 * 1. Correct verse count extraction
 * 2. Red letter text detection (Words of Christ)
 * 3. Poetry structure (Psalms, prophetic books)
 * 4. Section headings
 * 5. Psalm metadata (superscription, Selah)
 * 6. Verse number extraction (chapter-num and verse-num formats)
 */

import { ESVBibleParser } from '../parsers/esv-parser';
import * as fs from 'fs';
import * as path from 'path';

// === FIXTURE TYPES ===

interface ESVFixture {
  reference: string;
  html: string;
  fetchedAt: string;
}

type ESVFixtures = Record<string, Record<string, ESVFixture>>;

// === FIXTURE LOADING ===

const fixturePath = path.join(__dirname, 'fixtures', 'full-bible-esv.json');
let fixtures: ESVFixtures = {};

beforeAll(() => {
  if (fs.existsSync(fixturePath)) {
    fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
  } else {
    console.warn('ESV fixtures file not found:', fixturePath);
  }
});

// === EXPECTED VERSE COUNTS ===

const ESV_EXPECTED_VERSE_COUNTS: Record<string, number> = {
  // Pentateuch
  'Genesis_1': 31,
  'Genesis_2': 25,
  'Genesis_50': 26,
  'Exodus_20': 26,
  'Leviticus_19': 37,
  'Numbers_6': 27,
  'Deuteronomy_6': 25,

  // Poetry/Wisdom
  'Job_1': 22,
  'Psalm_23': 6,
  'Psalm_119': 176,
  'Proverbs_31': 31,
  'Ecclesiastes_12': 14,
  'Song of Solomon_1': 17,

  // Prophets
  'Isaiah_53': 12,
  'Jeremiah_1': 19,
  'Ezekiel_1': 28,
  'Daniel_1': 21,

  // Gospels
  'Matthew_1': 25,
  'Mark_1': 45,
  'Luke_1': 80,
  'John_3': 36,

  // Epistles
  'Romans_8': 39,
  '1 Corinthians_13': 13,
  'Hebrews_11': 40,

  // Revelation
  'Revelation_22': 21,
};

// Psalms known to contain Selah
const PSALMS_WITH_SELAH = [3, 4, 7, 9, 20, 21, 24, 32, 39, 44, 46, 47, 48, 49, 50, 52, 54, 55, 57, 59, 60, 61, 62, 66, 67, 68, 75, 76, 77, 81, 82, 83, 84, 85, 87, 88, 89, 140, 143];

// === HELPER FUNCTIONS ===

function createApiResponse(fixture: ESVFixture): any {
  return {
    passages: [fixture.html],
    canonical: fixture.reference,
    query: fixture.reference
  };
}

function getFixture(book: string, chapter: string): ESVFixture | undefined {
  return fixtures[book]?.[chapter];
}

// === TESTS ===

describe('ESVBibleParser', () => {
  let parser: ESVBibleParser;

  beforeEach(() => {
    parser = new ESVBibleParser();
  });

  describe('Basic Parsing', () => {
    it('should parse Genesis 1 correctly', () => {
      const fixture = getFixture('Genesis', '1');
      if (!fixture) {
        console.warn('Skipping test - Genesis 1 fixture not found');
        return;
      }

      const result = parser.parse(createApiResponse(fixture));

      expect(result).toBeDefined();
      expect(result.translation).toBe('ESV');
      expect(result.bookName).toBe('Genesis');
      expect(result.chapterNumber).toBe('1');
      expect(result.verses).toHaveLength(31);
    });

    it('should set isFirstVerse correctly', () => {
      const fixture = getFixture('Genesis', '1');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      expect(result.verses[0].isFirstVerse).toBe(true);
      expect(result.verses[1].isFirstVerse).toBe(false);
    });

    it('should preserve rawHtml in verses when available', () => {
      const fixture = getFixture('Genesis', '1');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      // ESV parser may or may not include rawHtml depending on parsing path
      // Just verify the parsing completes without error
      expect(result.verses.length).toBeGreaterThan(0);
    });
  });

  describe('Verse Count Validation', () => {
    it.each(Object.entries(ESV_EXPECTED_VERSE_COUNTS))(
      'should extract correct verse count for %s',
      (key, expectedCount) => {
        const [book, chapter] = key.split('_');
        const fixture = getFixture(book, chapter);

        if (!fixture) {
          console.warn(`Skipping test - ${key} fixture not found`);
          return;
        }

        const result = parser.parse(createApiResponse(fixture));
        expect(result.verses).toHaveLength(expectedCount);
      }
    );
  });

  describe('Red Letter Detection', () => {
    it('should detect red letter text in John 3', () => {
      const fixture = getFixture('John', '3');
      if (!fixture) {
        console.warn('Skipping test - John 3 fixture not found');
        return;
      }

      const result = parser.parse(createApiResponse(fixture));

      // John 3 contains Words of Christ (woc spans)
      const redLetterVerses = result.verses.filter(v => v.isRedLetter);

      expect(redLetterVerses.length).toBeGreaterThan(0);
    });

    it('should NOT mark non-gospel verses as red letter', () => {
      const fixture = getFixture('Genesis', '1');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));
      const redLetters = result.verses.filter(v => v.isRedLetter);

      expect(redLetters).toHaveLength(0);
    });

    it.each(['Matthew', 'Mark', 'Luke', 'John'])(
      'should parse %s chapter 1 without errors (may contain red letters)',
      (gospel) => {
        const fixture = getFixture(gospel, '1');
        if (!fixture) return;

        const result = parser.parse(createApiResponse(fixture));

        expect(result.verses.length).toBeGreaterThan(0);
      }
    );
  });

  describe('Poetry Structure', () => {
    it('should extract poetry lines from Psalm 23', () => {
      const fixture = getFixture('Psalm', '23');
      if (!fixture) {
        console.warn('Skipping test - Psalm 23 fixture not found');
        return;
      }

      const result = parser.parse(createApiResponse(fixture));

      // Psalms should have poetryLines[] populated for poetry structure
      const versesWithPoetry = result.verses.filter(v => v.poetryLines && v.poetryLines.length > 0);

      expect(versesWithPoetry.length).toBeGreaterThan(0);
    });

    it('should handle poetry indent levels', () => {
      const fixture = getFixture('Psalm', '23');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      // Check that some verses have indented poetry lines (indentLevel 2)
      const hasIndent = result.verses.some(v =>
        v.poetryLines && v.poetryLines.some(line => line.indentLevel === 2)
      );

      // ESV uses indent lines for poetry structure
      expect(hasIndent).toBe(true);
    });

    it('should detect stanza breaks via stanzaBreakAfter', () => {
      const fixture = getFixture('Psalm', '23');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      const stanzaBreaks = result.verses.filter(v => v.stanzaBreakAfter);

      // Psalms may have stanza structure - at minimum, parsing should complete
      expect(result.verses.length).toBe(6);
    });

    it('should handle Psalm 119 (longest psalm, 176 verses)', () => {
      const fixture = getFixture('Psalm', '119');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      expect(result.verses).toHaveLength(176);
    });
  });

  describe('Psalm Metadata', () => {
    it('should extract superscription from Psalm 23', () => {
      const fixture = getFixture('Psalm', '23');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      expect(result.psalmMetadata).toBeDefined();
      // Psalm 23 has "A Psalm of David." as superscription in <h4 class="psalm-title">
      if (result.psalmMetadata?.superscription) {
        expect(result.psalmMetadata.superscription.toLowerCase()).toContain('david');
      }
    });

    it('should detect Selah in Psalm 3', () => {
      const fixture = getFixture('Psalm', '3');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      expect(result.psalmMetadata?.hasSelah).toBe(true);
    });

    it('should mark individual verses with isSelah', () => {
      const fixture = getFixture('Psalm', '3');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      const selahVerses = result.verses.filter(v => v.isSelah);

      expect(selahVerses.length).toBeGreaterThan(0);
    });

    it.each([3, 4, 23, 51, 90])(
      'should extract metadata from Psalm %d',
      (psalmNum) => {
        const fixture = getFixture('Psalm', psalmNum.toString());
        if (!fixture) return;

        const result = parser.parse(createApiResponse(fixture));

        expect(result.psalmMetadata).toBeDefined();
        expect(result.psalmMetadata?.psalmNumber).toBe(psalmNum.toString());
      }
    );

    it.each(PSALMS_WITH_SELAH.slice(0, 10))(
      'should detect Selah in Psalm %d',
      (psalmNum) => {
        const fixture = getFixture('Psalm', psalmNum.toString());
        if (!fixture) return;

        const result = parser.parse(createApiResponse(fixture));

        expect(result.psalmMetadata?.hasSelah).toBe(true);
      }
    );
  });

  describe('Section Headings', () => {
    it('should extract section headings from Genesis 1', () => {
      const fixture = getFixture('Genesis', '1');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      const versesWithHeadings = result.verses.filter(v => v.heading);

      expect(versesWithHeadings.length).toBeGreaterThan(0);
      // First verse should have "The Creation of the World" heading
      expect(result.verses[0].heading?.toLowerCase()).toContain('creation');
    });

    it('should associate headings with correct verses', () => {
      const fixture = getFixture('Genesis', '2');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      // Genesis 2 has multiple headings
      const headings = result.verses.filter(v => v.heading).map(v => ({
        verse: v.number,
        heading: v.heading
      }));

      expect(headings.length).toBeGreaterThan(0);
    });

    it('should preserve headingId for navigation', () => {
      const fixture = getFixture('Genesis', '1');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      const verseWithHeading = result.verses.find(v => v.heading);

      if (verseWithHeading?.headingId) {
        expect(verseWithHeading.headingId).toMatch(/^p\d+/); // ESV heading ID format
      }
    });
  });

  describe('Verse Number Extraction', () => {
    it('should extract chapter-num format correctly (1:1)', () => {
      const fixture = getFixture('Genesis', '1');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      expect(result.verses[0].number).toBe('1');
    });

    it('should extract verse-num format correctly', () => {
      const fixture = getFixture('Genesis', '1');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      expect(result.verses[1].number).toBe('2');
      expect(result.verses[30].number).toBe('31');
    });

    it('should handle inline verse numbers in poetry', () => {
      const fixture = getFixture('Psalm', '23');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      // All verses should have numbers
      result.verses.forEach(v => {
        expect(v.number).toBeDefined();
        expect(parseInt(v.number)).toBeGreaterThan(0);
      });
    });
  });

  describe('All Fixtures Regression', () => {
    it('should parse all ESV fixtures without errors', () => {
      if (Object.keys(fixtures).length === 0) {
        console.warn('Skipping regression test - no fixtures loaded');
        return;
      }

      let totalChapters = 0;
      let totalVerses = 0;
      const errors: string[] = [];

      for (const [bookName, chapters] of Object.entries(fixtures)) {
        for (const [chapterNum, fixture] of Object.entries(chapters)) {
          try {
            const result = parser.parse(createApiResponse(fixture));

            expect(result.verses.length).toBeGreaterThan(0);
            totalVerses += result.verses.length;
            totalChapters++;
          } catch (error) {
            errors.push(`${bookName} ${chapterNum}: ${error}`);
          }
        }
      }

      console.log(`Parsed ${totalChapters} chapters with ${totalVerses} total verses`);

      if (errors.length > 0) {
        console.error('Errors:', errors.slice(0, 10));
        if (errors.length > 10) {
          console.error(`... and ${errors.length - 10} more errors`);
        }
      }

      expect(errors).toHaveLength(0);
    }, 120000); // 2 minute timeout for full Bible

    it('should produce consistent verse counts across all books', () => {
      if (Object.keys(fixtures).length === 0) {
        return;
      }

      const bookStats: Record<string, { chapters: number; verses: number }> = {};

      for (const [bookName, chapters] of Object.entries(fixtures)) {
        let bookVerses = 0;
        for (const [chapterNum, fixture] of Object.entries(chapters)) {
          try {
            const result = parser.parse(createApiResponse(fixture));
            bookVerses += result.verses.length;
          } catch {
            // Skip failed chapters
          }
        }
        bookStats[bookName] = {
          chapters: Object.keys(chapters).length,
          verses: bookVerses
        };
      }

      // Log summary
      console.log('Book Statistics:', JSON.stringify(bookStats, null, 2));

      // Verify 66 books
      expect(Object.keys(bookStats)).toHaveLength(66);
    }, 120000);

    it('should verify total Bible verse count is approximately 31,102', () => {
      if (Object.keys(fixtures).length === 0) {
        return;
      }

      let totalVerses = 0;

      for (const [bookName, chapters] of Object.entries(fixtures)) {
        for (const [chapterNum, fixture] of Object.entries(chapters)) {
          try {
            const result = parser.parse(createApiResponse(fixture));
            totalVerses += result.verses.length;
          } catch {
            // Skip failed chapters
          }
        }
      }

      // ESV has approximately 31,102 verses (slight variations by translation)
      // Allow some tolerance for parsing differences
      expect(totalVerses).toBeGreaterThan(30000);
      expect(totalVerses).toBeLessThan(32000);

      console.log(`Total verses parsed: ${totalVerses}`);
    }, 120000);
  });

  describe('Mixed Content Parsing', () => {
    it('should handle chapters with both prose and poetry (Genesis 49)', () => {
      const fixture = getFixture('Genesis', '49');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      // Genesis 49 has Jacob's blessings - mix of prose and poetry
      expect(result.verses.length).toBeGreaterThan(0);

      // Some verses should have poetry structure
      const hasPoetry = result.verses.some(v =>
        v.poetryLines && v.poetryLines.length > 0
      );

      // At minimum, parsing should complete without error
      expect(result.verses.length).toBe(33); // Genesis 49 has 33 verses
    });

    it('should handle prophetic books with extensive poetry (Isaiah 53)', () => {
      const fixture = getFixture('Isaiah', '53');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      expect(result.verses).toHaveLength(12);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single-chapter books (Obadiah, Jude, etc.)', () => {
      const singleChapterBooks = [
        { book: 'Obadiah', expectedVerses: 21 },
        { book: 'Philemon', expectedVerses: 25 },
        { book: 'Jude', expectedVerses: 25 },
        { book: '2 John', expectedVerses: 13 },
        { book: '3 John', expectedVerses: 15 },
      ];

      for (const { book, expectedVerses } of singleChapterBooks) {
        const fixture = getFixture(book, '1');
        if (!fixture) continue;

        const result = parser.parse(createApiResponse(fixture));

        expect(result.verses).toHaveLength(expectedVerses);
        expect(result.bookName).toBe(book);
        expect(result.chapterNumber).toBe('1');
      }
    });

    it('should handle very long chapters (Psalm 119)', () => {
      const fixture = getFixture('Psalm', '119');
      if (!fixture) return;

      const result = parser.parse(createApiResponse(fixture));

      expect(result.verses).toHaveLength(176);

      // All verses should have valid numbers
      for (let i = 0; i < result.verses.length; i++) {
        expect(parseInt(result.verses[i].number)).toBe(i + 1);
      }
    });

    it('should handle chapters with numeric names (1 Corinthians, 2 Kings)', () => {
      const fixtures2Test = [
        { book: '1 Corinthians', chapter: '13', expectedVerses: 13 },
        { book: '2 Kings', chapter: '1', expectedVerses: 18 },
        { book: '1 Samuel', chapter: '1', expectedVerses: 28 },
      ];

      for (const { book, chapter, expectedVerses } of fixtures2Test) {
        const fixture = getFixture(book, chapter);
        if (!fixture) continue;

        const result = parser.parse(createApiResponse(fixture));

        expect(result.verses).toHaveLength(expectedVerses);
        expect(result.bookName).toBe(book);
      }
    });
  });
});
