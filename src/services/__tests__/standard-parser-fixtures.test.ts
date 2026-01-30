/**
 * Standard Bible Parser Tests (KJV, ASV, WEB)
 *
 * Tests the standard parser against full Bible fixture data.
 * Validates extraction of:
 * 1. Red letters (style: "wj") - Words of Jesus
 * 2. Footnotes (note style: "f") - Hebrew/Greek notes
 * 3. Cross-references (note style: "x") - WEB only
 * 4. Section headings (style: "s1/s2")
 * 5. Poetry structure (style: "q1/q2")
 * 6. Speaker labels (style: "sp") - Song of Solomon
 *
 * Key insight: Expected values are extracted FROM the fixtures themselves,
 * ensuring tests reflect actual API data, not hardcoded assumptions.
 */

import { StandardBibleParser } from '../parsers/standard-parser';
import { Footnote } from '../../types/bible-formats';
import * as fs from 'fs';
import * as path from 'path';

// Full Bible fixture types (flat structure by book)
interface FullBibleChapterEntry {
  reference: string;
  bookName: string;
  chapter: number;
  translation: 'KJV' | 'ASV' | 'WEB';
  content: any;
  fetchedAt: string;
}

interface FullBibleBookChapters {
  [chapter: string]: FullBibleChapterEntry;
}

interface FullBibleFixtures {
  [bookName: string]: FullBibleBookChapters;
}

// Load full Bible fixtures (flat structure)
const fixturesBasePath = path.join(__dirname, 'fixtures');

function loadFullBibleFixtures(translation: string): FullBibleFixtures | null {
  const fullPath = path.join(fixturesBasePath, `full-bible-${translation.toLowerCase()}.json`);
  if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  }
  return null;
}

// Helper to get chapter from flat structure
function getChapter(fixtures: FullBibleFixtures | null, book: string, chapter: number): FullBibleChapterEntry | null {
  if (!fixtures || !fixtures[book] || !fixtures[book][chapter]) {
    return null;
  }
  return fixtures[book][chapter];
}

// Helper: Count occurrences of a style in raw fixture content
function countStyleOccurrences(content: any, styleName: string): number {
  let count = 0;

  function traverse(obj: any): void {
    if (!obj) return;

    if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else if (typeof obj === 'object') {
      // Check for char or para with matching style
      if (obj.attrs?.style === styleName) {
        count++;
      }
      // Recurse into items
      if (obj.items) traverse(obj.items);
      if (obj.content) traverse(obj.content);
    }
  }

  traverse(content);
  return count;
}

// Helper: Count note tags in raw fixture
function countNotes(content: any, noteStyle?: string): number {
  let count = 0;

  function traverse(obj: any): void {
    if (!obj) return;

    if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else if (typeof obj === 'object') {
      // Check for note tag
      if (obj.name === 'note') {
        if (!noteStyle || obj.attrs?.style === noteStyle) {
          count++;
        }
      }
      // Recurse
      if (obj.items) traverse(obj.items);
      if (obj.content) traverse(obj.content);
    }
  }

  traverse(content);
  return count;
}

// Helper: Check if fixture has any of a style
function hasStyle(content: any, styleName: string): boolean {
  return countStyleOccurrences(content, styleName) > 0;
}

// Note: extractUniqueStyles helper available for debugging if needed:
// Traverses content and returns Set of all style names found

// Load full Bible fixtures for each translation
const kjvFixtures = loadFullBibleFixtures('kjv');
const asvFixtures = loadFullBibleFixtures('asv');
const webFixtures = loadFullBibleFixtures('web');

describe('StandardBibleParser', () => {
  describe('KJV Parser', () => {
    let parser: StandardBibleParser;

    beforeEach(() => {
      parser = new StandardBibleParser('KJV');
    });

    describe('Basic Parsing', () => {
      it('should parse a simple chapter', () => {
        const fixture = getChapter(kjvFixtures, 'Genesis', 1);
        if (!fixture) {
          console.warn('Skipping - KJV Genesis 1 fixture not found');
          return;
        }

        const result = parser.parse(fixture.content);

        expect(result).toBeDefined();
        expect(result.verses).toBeDefined();
        expect(result.verses.length).toBeGreaterThan(0);
        expect(result.translation).toBe('KJV');
        expect(result.bookName).toBe('Genesis');
        expect(result.chapterNumber).toBe('1');
      });

      it('should extract correct verse count for Genesis 1', () => {
        const fixture = getChapter(kjvFixtures, 'Genesis', 1);
        if (!fixture) {
          console.warn('Skipping - fixture not found');
          return;
        }

        const result = parser.parse(fixture.content);

        // Genesis 1 has 31 verses
        expect(result.verses.length).toBe(31);
      });
    });

    describe('Red Letter Extraction', () => {
      it('should extract red letters from Matthew 5', () => {
        const fixture = getChapter(kjvFixtures, 'Matthew', 5);
        if (!fixture) {
          console.warn('Skipping - KJV Matthew 5 fixture not found');
          return;
        }

        // Count expected red letter tags from raw fixture
        const expectedRedLetterCount = countStyleOccurrences(fixture.content, 'wj');
        console.log(`Expected red letter tags in Matthew 5: ${expectedRedLetterCount}`);

        // Parse and check
        const result = parser.parse(fixture.content);
        const redLetterVerses = result.verses.filter(v => v.isRedLetter);

        console.log(`Parsed red letter verses: ${redLetterVerses.length}`);

        // Should have red letter verses if fixture has wj tags
        if (expectedRedLetterCount > 0) {
          expect(redLetterVerses.length).toBeGreaterThan(0);
        }
      });

      it('should mark correct verses as red letter in John 1', () => {
        const fixture = getChapter(kjvFixtures, 'John', 1);
        if (!fixture) {
          console.warn('Skipping - KJV John 1 fixture not found');
          return;
        }
        const hasRedLetters = hasStyle(fixture.content, 'wj');

        const result = parser.parse(fixture.content);
        const redLetterVerses = result.verses.filter(v => v.isRedLetter);

        console.log(`John 1 - Has red letters in fixture: ${hasRedLetters}, Parsed: ${redLetterVerses.length}`);

        if (hasRedLetters) {
          expect(redLetterVerses.length).toBeGreaterThan(0);

          // Verify red letter verses have text
          for (const verse of redLetterVerses) {
            expect(verse.text).toBeTruthy();
            expect(verse.text.length).toBeGreaterThan(0);
          }
        }
      });
    });

    describe('Footnote Extraction', () => {
      it('should extract footnotes from Job 38', () => {
        const fixture = getChapter(kjvFixtures, 'Job', 38);
        if (!fixture) {
          console.warn('Skipping - KJV Job 38 fixture not found');
          return;
        }

        // Count expected footnotes from raw fixture
        const expectedFootnoteCount = countNotes(fixture.content, 'f');
        console.log(`Expected footnotes in Job 38: ${expectedFootnoteCount}`);

        // Parse and check
        const result = parser.parse(fixture.content);
        const versesWithFootnotes = result.verses.filter(v => v.footnotes && v.footnotes.length > 0);
        const totalFootnotes = result.verses.reduce(
          (sum, v) => sum + (v.footnotes?.length || 0),
          0
        );

        console.log(`Parsed footnotes: ${totalFootnotes} across ${versesWithFootnotes.length} verses`);

        // Should have footnotes if fixture has note tags
        if (expectedFootnoteCount > 0) {
          expect(totalFootnotes).toBeGreaterThan(0);
        }
      });

      it('should classify footnote types correctly', () => {
        const fixture = getChapter(kjvFixtures, 'Job', 38);
        if (!fixture) {
          console.warn('Skipping - fixture not found');
          return;
        }
        const result = parser.parse(fixture.content);

        const allFootnotes: Footnote[] = [];
        result.verses.forEach(v => {
          if (v.footnotes) {
            allFootnotes.push(...v.footnotes);
          }
        });

        // Verify footnote structure
        for (const footnote of allFootnotes) {
          expect(footnote.marker).toBeDefined();
          expect(footnote.content).toBeTruthy();
          expect(['hebrew', 'greek', 'alternative', 'cross-ref', 'textualVariant', 'other']).toContain(
            footnote.type
          );
        }

        // Job 38 likely has Hebrew footnotes
        const hebrewFootnotes = allFootnotes.filter(f => f.type === 'hebrew');
        console.log(`Hebrew footnotes: ${hebrewFootnotes.length}`);
      });
    });

    describe('Poetry Structure', () => {
      it('should extract poetry indentation from Psalm 23', () => {
        const fixture = getChapter(kjvFixtures, 'Psalm', 23);
        if (!fixture) {
          console.warn('Skipping - KJV Psalm 23 fixture not found');
          return;
        }

        // Check for poetry styles in fixture
        const hasQ1 = hasStyle(fixture.content, 'q1');
        const hasQ2 = hasStyle(fixture.content, 'q2');
        console.log(`Psalm 23 - Has q1: ${hasQ1}, Has q2: ${hasQ2}`);

        const result = parser.parse(fixture.content);

        // Check for poetry indent levels
        const versesWithIndent = result.verses.filter(v => v.poetryIndentLevel);

        if (hasQ1 || hasQ2) {
          expect(versesWithIndent.length).toBeGreaterThan(0);
        }
      });

      it('should detect Selah markers', () => {
        // Check multiple Psalms for Selah
        const psalmsToCheck = [23, 46, 67];

        for (const psalmNum of psalmsToCheck) {
          const fixture = getChapter(kjvFixtures, 'Psalm', psalmNum);
          if (!fixture) continue;

          const result = parser.parse(fixture.content);
          const selahVerses = result.verses.filter(v => v.isSelah);

          if (selahVerses.length > 0) {
            console.log(`Found Selah in Psalm ${psalmNum}: ${selahVerses.map(v => v.number).join(', ')}`);
          }
        }
      });
    });

    describe('Section Headings', () => {
      it('should extract section headings', () => {
        const fixture = getChapter(kjvFixtures, 'Matthew', 5);
        if (!fixture) {
          console.warn('Skipping - fixture not found');
          return;
        }

        // Check for heading styles in fixture
        const hasS1 = hasStyle(fixture.content, 's1');
        const hasS2 = hasStyle(fixture.content, 's2');
        console.log(`Matthew 5 - Has s1: ${hasS1}, Has s2: ${hasS2}`);

        const result = parser.parse(fixture.content);
        const versesWithHeadings = result.verses.filter(v => v.heading);

        console.log(`Verses with headings: ${versesWithHeadings.length}`);

        if (hasS1 || hasS2) {
          expect(versesWithHeadings.length).toBeGreaterThan(0);
        }
      });
    });

    describe('Stanza Breaks', () => {
      it('should mark verses with stanzaBreakAfter when blank paragraph follows', () => {
        // Psalm 42 is known to have stanza breaks (blank 'b' paragraphs)
        const fixture = getChapter(kjvFixtures, 'Psalm', 42);
        if (!fixture) {
          console.warn('Skipping - fixture not found');
          return;
        }

        // Count blank (b) paragraphs in fixture
        const hasBlankParagraphs = hasStyle(fixture.content, 'b');
        console.log(`Psalm 42 - Has blank paragraphs: ${hasBlankParagraphs}`);

        const result = parser.parse(fixture.content);
        const versesWithStanzaBreak = result.verses.filter(v => v.stanzaBreakAfter);

        console.log(`Verses with stanzaBreakAfter: ${versesWithStanzaBreak.length}`);
        console.log(`Verse numbers: ${versesWithStanzaBreak.map(v => v.number).join(', ')}`);

        // Psalm 42 has stanza breaks in all Standard Bible translations
        expect(hasBlankParagraphs).toBe(true);
        expect(versesWithStanzaBreak.length).toBeGreaterThan(0);
      });
    });

    describe('Poetry Lines', () => {
      it('should create poetryLines array for poetry verses', () => {
        const fixture = getChapter(kjvFixtures, 'Psalm', 23);
        if (!fixture) {
          console.warn('Skipping - fixture not found');
          return;
        }

        const result = parser.parse(fixture.content);
        const versesWithPoetryLines = result.verses.filter(v => v.poetryLines && v.poetryLines.length > 0);

        console.log(`Psalm 23 - Verses with poetryLines: ${versesWithPoetryLines.length}`);

        // All Psalm 23 verses should have poetry lines since they're all q1/q2 style
        expect(versesWithPoetryLines.length).toBeGreaterThan(0);

        // Check structure of poetry lines
        for (const verse of versesWithPoetryLines) {
          expect(verse.poetryLines).toBeDefined();
          expect(verse.poetryLines!.length).toBeGreaterThan(0);
          expect(verse.poetryLines![0].text).toBeTruthy();
          expect(verse.poetryLines![0].indentLevel).toBeGreaterThanOrEqual(1);
        }
      });
    });

    describe('Psalm Metadata', () => {
      it('should extract Psalm superscription', () => {
        const fixture = getChapter(kjvFixtures, 'Psalm', 23);
        if (!fixture) {
          console.warn('Skipping - fixture not found');
          return;
        }
        const result = parser.parse(fixture.content);

        expect(result.psalmMetadata).toBeDefined();

        if (result.psalmMetadata?.superscription) {
          console.log(`Psalm 23 superscription: ${result.psalmMetadata.superscription}`);
          // Psalm 23 should mention David
          expect(result.psalmMetadata.superscription.toLowerCase()).toContain('david');
        }
      });
    });

    describe('Prose Paragraph Breaks', () => {
      it('should set startsParagraph for first verse of each prose paragraph after the first', () => {
        // James 1 has 3 paragraphs, all with style 'p' (prose):
        // - Paragraph 0: verse 1
        // - Paragraph 1: verses 2-18
        // - Paragraph 2: verses 19-27
        const fixture = getChapter(kjvFixtures, 'James', 1);
        if (!fixture) {
          console.warn('Skipping - fixture not found');
          return;
        }

        const result = parser.parse(fixture.content);
        const versesWithStartsParagraph = result.verses.filter(v => v.startsParagraph);

        console.log(`James 1 - Verses with startsParagraph: ${versesWithStartsParagraph.map(v => v.number).join(', ')}`);

        // Verses 2 and 19 should have startsParagraph=true (first verse of paragraphs 2 and 3)
        expect(versesWithStartsParagraph.length).toBe(2);
        expect(versesWithStartsParagraph.map(v => v.number)).toContain('2');
        expect(versesWithStartsParagraph.map(v => v.number)).toContain('19');

        // Verse 1 should NOT have startsParagraph (it's in the first paragraph)
        const verse1 = result.verses.find(v => v.number === '1');
        expect(verse1?.startsParagraph).toBeFalsy();
      });

      it('should set startsParagraph for Romans 1 prose paragraphs', () => {
        const fixture = getChapter(kjvFixtures, 'Romans', 1);
        if (!fixture) {
          console.warn('Skipping - fixture not found');
          return;
        }

        const result = parser.parse(fixture.content);
        const versesWithStartsParagraph = result.verses.filter(v => v.startsParagraph);

        console.log(`Romans 1 - Verses with startsParagraph: ${versesWithStartsParagraph.map(v => v.number).join(', ')}`);

        // Romans 1 has multiple prose paragraphs, so should have startsParagraph markers
        expect(versesWithStartsParagraph.length).toBeGreaterThan(0);

        // First verse should NOT have startsParagraph
        const verse1 = result.verses.find(v => v.number === '1');
        expect(verse1?.startsParagraph).toBeFalsy();
      });
    });
  });

  describe('ASV Parser', () => {
    let parser: StandardBibleParser;

    beforeEach(() => {
      parser = new StandardBibleParser('ASV');
    });

    it('should parse ASV fixtures correctly', () => {
      const fixture = getChapter(asvFixtures, 'Genesis', 1);
      if (!fixture) {
        console.warn('Skipping - ASV Genesis 1 fixture not found');
        return;
      }

      const result = parser.parse(fixture.content);

      expect(result.translation).toBe('ASV');
      expect(result.verses.length).toBe(31);
    });

    it('should NOT have red letters (ASV does not support red letters)', () => {
      const fixture = getChapter(asvFixtures, 'Matthew', 5);
      if (!fixture) {
        console.warn('Skipping - ASV Matthew 5 fixture not found');
        return;
      }

      // ASV should have NO red letter tags
      const redLetterCount = countStyleOccurrences(fixture.content, 'wj');
      console.log(`ASV Matthew 5 red letter tags: ${redLetterCount}`);

      const result = parser.parse(fixture.content);
      const redLetterVerses = result.verses.filter(v => v.isRedLetter);

      expect(redLetterVerses.length).toBe(0);
    });
  });

  describe('WEB Parser', () => {
    let parser: StandardBibleParser;

    beforeEach(() => {
      parser = new StandardBibleParser('WEB');
    });

    it('should parse WEB fixtures correctly', () => {
      const fixture = getChapter(webFixtures, 'Genesis', 1);
      if (!fixture) {
        console.warn('Skipping - WEB Genesis 1 fixture not found');
        return;
      }

      const result = parser.parse(fixture.content);

      expect(result.translation).toBe('WEB');
      expect(result.verses.length).toBe(31);
    });

    it('should extract red letters from WEB Gospels', () => {
      const fixture = getChapter(webFixtures, 'Matthew', 5);
      if (!fixture) {
        console.warn('Skipping - WEB Matthew 5 fixture not found');
        return;
      }
      const expectedRedLetterCount = countStyleOccurrences(fixture.content, 'wj');
      console.log(`WEB Matthew 5 red letter tags: ${expectedRedLetterCount}`);

      const result = parser.parse(fixture.content);
      const redLetterVerses = result.verses.filter(v => v.isRedLetter);

      if (expectedRedLetterCount > 0) {
        expect(redLetterVerses.length).toBeGreaterThan(0);
      }
    });

    it('should extract cross-references (WEB-specific)', () => {
      const fixture = getChapter(webFixtures, 'Matthew', 5);
      if (!fixture) {
        console.warn('Skipping - fixture not found');
        return;
      }

      // Count cross-reference notes
      const crossRefCount = countNotes(fixture.content, 'x');
      console.log(`WEB Matthew 5 cross-references: ${crossRefCount}`);

      const result = parser.parse(fixture.content);

      // Find cross-ref footnotes
      const crossRefs: Footnote[] = [];
      result.verses.forEach(v => {
        if (v.footnotes) {
          crossRefs.push(...v.footnotes.filter(f => f.type === 'cross-ref'));
        }
      });

      console.log(`Parsed cross-references: ${crossRefs.length}`);

      if (crossRefCount > 0) {
        expect(crossRefs.length).toBeGreaterThan(0);
      }
    });
  });

  describe('All Fixtures Regression', () => {
    const translations = [
      { name: 'KJV', fixtures: kjvFixtures },
      { name: 'ASV', fixtures: asvFixtures },
      { name: 'WEB', fixtures: webFixtures },
    ];

    it.each(translations)('should parse all $name fixtures without errors', ({ name, fixtures }) => {
      if (!fixtures) {
        console.warn(`Skipping - ${name} fixtures not found`);
        return;
      }

      const parser = new StandardBibleParser(name as any);
      let totalVerses = 0;
      let totalChapters = 0;
      let totalRedLetterVerses = 0;
      let totalFootnotes = 0;

      // Iterate over flat structure: fixtures[bookName][chapter]
      for (const [_bookName, chapters] of Object.entries(fixtures)) {
        for (const [_chapterNum, fixture] of Object.entries(chapters as FullBibleBookChapters)) {
          expect(() => {
            const result = parser.parse(fixture.content);
            expect(result.verses.length).toBeGreaterThan(0);

            totalVerses += result.verses.length;
            totalChapters++;
            totalRedLetterVerses += result.verses.filter(v => v.isRedLetter).length;
            totalFootnotes += result.verses.reduce((sum, v) => sum + (v.footnotes?.length || 0), 0);
          }).not.toThrow();
        }
      }

      console.log(
        `${name}: Parsed ${totalChapters} chapters, ${totalVerses} verses, ` +
          `${totalRedLetterVerses} red letter verses, ${totalFootnotes} footnotes`
      );
    });
  });

  describe('Feature Summary', () => {
    it('should report feature availability by translation', () => {
      const summary: Record<string, Record<string, number>> = {
        KJV: { chapters: 0, redLetterTags: 0, footnotes: 0, crossRefs: 0 },
        ASV: { chapters: 0, redLetterTags: 0, footnotes: 0, crossRefs: 0 },
        WEB: { chapters: 0, redLetterTags: 0, footnotes: 0, crossRefs: 0 },
      };

      const allFixtures = [
        { name: 'KJV', fixtures: kjvFixtures },
        { name: 'ASV', fixtures: asvFixtures },
        { name: 'WEB', fixtures: webFixtures },
      ];

      for (const { name, fixtures } of allFixtures) {
        if (!fixtures) continue;

        // Iterate over flat structure: fixtures[bookName][chapter]
        for (const [_, chapters] of Object.entries(fixtures)) {
          for (const [_, fixture] of Object.entries(chapters as FullBibleBookChapters)) {
            summary[name].chapters++;
            summary[name].redLetterTags += countStyleOccurrences(fixture.content, 'wj');
            summary[name].footnotes += countNotes(fixture.content, 'f');
            summary[name].crossRefs += countNotes(fixture.content, 'x');
          }
        }
      }

      console.log('\n=== Feature Availability Summary ===');
      console.table(summary);

      // Full Bible: 1,189 chapters
      expect(summary.KJV.chapters).toBe(1189);
      expect(summary.ASV.chapters).toBe(1189);
      expect(summary.WEB.chapters).toBe(1189);
    });
  });
});
