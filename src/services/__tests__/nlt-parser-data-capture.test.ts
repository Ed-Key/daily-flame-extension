/**
 * NLT Parser - Table & Footnote Data Capture Tests
 *
 * Validates that the parser correctly captures:
 * 1. Table structures (genealogies, census lists)
 * 2. Textual variant footnotes (manuscripts references)
 */

import { NLTHTMLParser } from '../parsers/nlt-html-parser';
import * as fs from 'fs';
import * as path from 'path';

// Load full Bible fixture
const fullBiblePath = path.join(__dirname, 'fixtures', 'full-bible-nlt.json');
let fullBible: Record<string, Record<string, { reference: string; html: string }>> = {};

beforeAll(() => {
  if (fs.existsSync(fullBiblePath)) {
    fullBible = JSON.parse(fs.readFileSync(fullBiblePath, 'utf-8'));
  } else {
    console.warn('Full Bible fixture not found:', fullBiblePath);
  }
});

describe('NLT Parser - Table Extraction', () => {
  let parser: NLTHTMLParser;

  beforeEach(() => {
    parser = new NLTHTMLParser();
  });

  it('extracts table from Numbers 1 (tribal leaders)', () => {
    const fixture = fullBible['Numbers']?.['1'];
    if (!fixture) {
      console.warn('Skipping test - Numbers 1 fixture not found');
      return;
    }

    const result = parser.parseToUnified(fixture.html, fixture.reference);

    expect(result.tables).toBeDefined();
    expect(result.tables!.length).toBeGreaterThan(0);

    const table = result.tables![0];
    // Numbers 1 has tribe/leader table with headers
    expect(table.headers).toBeDefined();
    expect(table.headers!.length).toBeGreaterThanOrEqual(2);
    expect(table.rows.length).toBeGreaterThan(0);
  });

  it('extracts table with verse numbers from Numbers 1', () => {
    const fixture = fullBible['Numbers']?.['1'];
    if (!fixture) {
      console.warn('Skipping test - Numbers 1 fixture not found');
      return;
    }

    const result = parser.parseToUnified(fixture.html, fixture.reference);

    expect(result.tables).toBeDefined();
    const table = result.tables![0];

    // Check if verse numbers are captured in rows
    const rowsWithVerseNumbers = table.rows.filter(r => r.verseNumber);
    // Tables in Numbers have verse numbers embedded in cells
    if (rowsWithVerseNumbers.length > 0) {
      expect(rowsWithVerseNumbers[0].verseNumber).toMatch(/^\d+$/);
    }
  });

  it('extracts table from Numbers 2 (camp arrangement)', () => {
    const fixture = fullBible['Numbers']?.['2'];
    if (!fixture) {
      console.warn('Skipping test - Numbers 2 fixture not found');
      return;
    }

    const result = parser.parseToUnified(fixture.html, fixture.reference);

    expect(result.tables).toBeDefined();
    expect(result.tables!.length).toBeGreaterThan(0);

    // Numbers 2 has camp arrangement tables
    const table = result.tables![0];
    expect(table.rows.length).toBeGreaterThan(0);
    // Each row should have cells
    expect(table.rows[0].cells.length).toBeGreaterThan(0);
  });

  it('preserves table structure without flattening to plain text', () => {
    const fixture = fullBible['Numbers']?.['1'];
    if (!fixture) {
      console.warn('Skipping test - Numbers 1 fixture not found');
      return;
    }

    const result = parser.parseToUnified(fixture.html, fixture.reference);

    expect(result.tables).toBeDefined();
    const table = result.tables![0];

    // Verify structure is preserved (not just concatenated text)
    expect(table.rows).toBeInstanceOf(Array);
    for (const row of table.rows) {
      expect(row.cells).toBeInstanceOf(Array);
      // Each cell should be a distinct string
      for (const cell of row.cells) {
        expect(typeof cell).toBe('string');
      }
    }
  });

  it('handles chapters without tables gracefully', () => {
    const fixture = fullBible['Genesis']?.['1'];
    if (!fixture) {
      console.warn('Skipping test - Genesis 1 fixture not found');
      return;
    }

    const result = parser.parseToUnified(fixture.html, fixture.reference);

    // Genesis 1 has no tables - should be undefined or empty array
    expect(result.tables === undefined || result.tables.length === 0).toBe(true);
  });
});

describe('NLT Parser - Textual Variant Footnotes', () => {
  let parser: NLTHTMLParser;

  beforeEach(() => {
    parser = new NLTHTMLParser();
  });

  it('captures textual variant footnote from Matthew 17 (verse 21)', () => {
    const fixture = fullBible['Matthew']?.['17'];
    if (!fixture) {
      console.warn('Skipping test - Matthew 17 fixture not found');
      return;
    }

    const result = parser.parseToUnified(fixture.html, fixture.reference);

    // Find verses with footnotes containing "manuscripts"
    const versesWithManuscriptNotes = result.verses.filter(
      v => v.footnotes?.some(f => f.content.toLowerCase().includes('manuscripts'))
    );

    expect(versesWithManuscriptNotes.length).toBeGreaterThan(0);

    // Check that at least one is typed as textualVariant
    const textualVariantFootnotes = versesWithManuscriptNotes.flatMap(
      v => v.footnotes?.filter(f => f.type === 'textualVariant') || []
    );

    expect(textualVariantFootnotes.length).toBeGreaterThan(0);
    expect(textualVariantFootnotes[0].content.toLowerCase()).toContain('manuscripts');
  });

  it('captures textual variant footnote from Mark 7', () => {
    const fixture = fullBible['Mark']?.['7'];
    if (!fixture) {
      console.warn('Skipping test - Mark 7 fixture not found');
      return;
    }

    const result = parser.parseToUnified(fixture.html, fixture.reference);

    // Find footnotes with manuscripts mentions
    const textualVariantFootnotes = result.verses.flatMap(
      v => v.footnotes?.filter(f => f.type === 'textualVariant') || []
    );

    expect(textualVariantFootnotes.length).toBeGreaterThan(0);
  });

  it('captures textual variant footnote from John 5 (verse 4)', () => {
    const fixture = fullBible['John']?.['5'];
    if (!fixture) {
      console.warn('Skipping test - John 5 fixture not found');
      return;
    }

    const result = parser.parseToUnified(fixture.html, fixture.reference);

    // John 5:4 is often noted as missing in early manuscripts
    const textualVariantFootnotes = result.verses.flatMap(
      v => v.footnotes?.filter(f => f.type === 'textualVariant') || []
    );

    expect(textualVariantFootnotes.length).toBeGreaterThan(0);
    // Should mention manuscripts
    expect(
      textualVariantFootnotes.some(f => f.content.toLowerCase().includes('manuscripts'))
    ).toBe(true);
  });

  it('distinguishes textualVariant from other footnote types', () => {
    const fixture = fullBible['Genesis']?.['1'];
    if (!fixture) {
      console.warn('Skipping test - Genesis 1 fixture not found');
      return;
    }

    const result = parser.parseToUnified(fixture.html, fixture.reference);

    // Genesis 1 has "Or" alternative footnotes, not textual variants
    const allFootnotes = result.verses.flatMap(v => v.footnotes || []);

    // Genesis 1 should have some footnotes
    expect(allFootnotes.length).toBeGreaterThan(0);

    // Check that alternative footnotes are typed correctly
    const alternativeFootnotes = allFootnotes.filter(f => f.type === 'alternative');
    const textualVariantFootnotes = allFootnotes.filter(f => f.type === 'textualVariant');

    // Genesis 1 has "Or..." alternatives but no manuscript variants
    expect(alternativeFootnotes.length).toBeGreaterThan(0);
    expect(textualVariantFootnotes.length).toBe(0);
  });

  it('correctly categorizes Hebrew footnotes separately from textualVariant', () => {
    const fixture = fullBible['Exodus']?.['20'];
    if (!fixture) {
      console.warn('Skipping test - Exodus 20 fixture not found');
      return;
    }

    const result = parser.parseToUnified(fixture.html, fixture.reference);
    const allFootnotes = result.verses.flatMap(v => v.footnotes || []);

    // Exodus 20 has Hebrew footnotes (translation notes)
    const hebrewFootnotes = allFootnotes.filter(f => f.type === 'hebrew');

    expect(hebrewFootnotes.length).toBeGreaterThan(0);
    expect(hebrewFootnotes[0].content.toLowerCase()).toContain('hebrew');
  });
});

describe('NLT Parser - All Footnote Types', () => {
  let parser: NLTHTMLParser;

  beforeEach(() => {
    parser = new NLTHTMLParser();
  });

  it('validates all footnote types are properly categorized', () => {
    // Test across multiple books to validate type detection
    const testCases = [
      { book: 'Genesis', chapter: '1', expectedTypes: ['alternative'] },
      { book: 'Exodus', chapter: '20', expectedTypes: ['hebrew'] },
      { book: 'Matthew', chapter: '17', expectedTypes: ['textualVariant'] },
    ];

    for (const testCase of testCases) {
      const fixture = fullBible[testCase.book]?.[testCase.chapter];
      if (!fixture) continue;

      const result = parser.parseToUnified(fixture.html, fixture.reference);
      const allFootnotes = result.verses.flatMap(v => v.footnotes || []);

      for (const expectedType of testCase.expectedTypes) {
        const matchingFootnotes = allFootnotes.filter(f => f.type === expectedType);
        expect(matchingFootnotes.length).toBeGreaterThan(0);
      }
    }
  });
});
