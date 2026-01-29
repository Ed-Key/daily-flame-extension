/**
 * Full Bible Validation Script
 *
 * Validates the NLT parser against all 1,189 Bible chapters.
 * Performs thorough checks on parsing quality, verse counts, and content.
 *
 * Usage: npm run validate:full-bible
 */

// Setup global DOMParser for Node.js environment FIRST
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global as any).DOMParser = dom.window.DOMParser;

import * as fs from 'fs';
import * as path from 'path';
import { NLTHTMLParser } from '../src/services/parsers/nlt-html-parser';

// Support both fixture formats
const FULL_BIBLE_PATH = path.join(__dirname, '../src/services/__tests__/fixtures/full-bible-nlt.json');
const PARTIAL_FIXTURE_PATH = path.join(__dirname, '../src/services/__tests__/fixtures/all-nlt-responses.json');
const REPORT_PATH = path.join(__dirname, '../validation-report.json');

// Expected verse counts for each book/chapter (canonical)
// Source: Standard Protestant Bible verse counts
const EXPECTED_VERSE_COUNTS: { [book: string]: number[] } = {
  'Genesis': [0, 31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
  'Exodus': [0, 22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
  'Leviticus': [0, 17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
  'Numbers': [0, 54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13],
  'Deuteronomy': [0, 46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12],
  'Joshua': [0, 18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
  'Judges': [0, 36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25],
  'Ruth': [0, 22, 23, 18, 22],
  '1 Samuel': [0, 28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13],
  '2 Samuel': [0, 27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25],
  '1 Kings': [0, 53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53],
  '2 Kings': [0, 18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
  '1 Chronicles': [0, 54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
  '2 Chronicles': [0, 17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
  'Ezra': [0, 11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
  'Nehemiah': [0, 11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31],
  'Esther': [0, 22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
  'Job': [0, 22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17],
  'Psalm': [0, 6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6],
  'Proverbs': [0, 33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
  'Ecclesiastes': [0, 18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14],
  'Song of Solomon': [0, 17, 17, 11, 16, 16, 13, 13, 14],
  'Isaiah': [0, 31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24],
  'Jeremiah': [0, 19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
  'Lamentations': [0, 22, 22, 66, 22, 22],
  'Ezekiel': [0, 28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
  'Daniel': [0, 21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13],
  'Hosea': [0, 11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
  'Joel': [0, 20, 32, 21],
  'Amos': [0, 15, 16, 15, 13, 27, 14, 17, 14, 15],
  'Obadiah': [0, 21],
  'Jonah': [0, 17, 10, 10, 11],
  'Micah': [0, 16, 13, 12, 13, 15, 16, 20],
  'Nahum': [0, 15, 13, 19],
  'Habakkuk': [0, 17, 20, 19],
  'Zephaniah': [0, 18, 15, 20],
  'Haggai': [0, 15, 23],
  'Zechariah': [0, 21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
  'Malachi': [0, 14, 17, 18, 6],
  'Matthew': [0, 25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
  'Mark': [0, 45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
  'Luke': [0, 80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53],
  'John': [0, 51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
  'Acts': [0, 26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31],
  'Romans': [0, 32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27],
  '1 Corinthians': [0, 31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24],
  '2 Corinthians': [0, 24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14],
  'Galatians': [0, 24, 21, 29, 31, 26, 18],
  'Ephesians': [0, 23, 22, 21, 32, 33, 24],
  'Philippians': [0, 30, 30, 21, 23],
  'Colossians': [0, 29, 23, 25, 18],
  '1 Thessalonians': [0, 10, 20, 13, 18, 28],
  '2 Thessalonians': [0, 12, 17, 18],
  '1 Timothy': [0, 20, 15, 16, 16, 25, 21],
  '2 Timothy': [0, 18, 26, 17, 22],
  'Titus': [0, 16, 15, 15],
  'Philemon': [0, 25],
  'Hebrews': [0, 14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25],
  'James': [0, 27, 26, 18, 17, 20],
  '1 Peter': [0, 25, 25, 22, 19, 14],
  '2 Peter': [0, 21, 22, 18],
  '1 John': [0, 10, 29, 24, 21, 21],
  '2 John': [0, 13],
  '3 John': [0, 14],
  'Jude': [0, 25],
  'Revelation': [0, 20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]
};

// Known verses that are intentionally empty in NLT
// These are textual variants (verses from later manuscripts not in NLT)
const NLT_OMITTED_VERSES: Set<string> = new Set([
  // Matthew - textual variants
  'Matthew 17:21',
  'Matthew 18:11',
  'Matthew 23:14',
  // Mark - textual variants
  'Mark 7:16',
  'Mark 9:44',
  'Mark 9:46',
  'Mark 11:26',
  'Mark 15:28',
  // Luke - textual variants
  'Luke 17:36',
  'Luke 23:17',
  // John - textual variants
  'John 5:4',
  // Acts - textual variants
  'Acts 8:37',
  'Acts 15:34',
  'Acts 24:7',
  'Acts 28:29',
  // Romans - textual variants
  'Romans 16:24',
]);

// Known chapters with list/table formatting where verses are empty placeholders
// The NLT API formats genealogies, census lists, and tribal lists as tables
const NLT_LIST_CHAPTERS: { [key: string]: number[] } = {
  'Numbers 1': [6, 7, 8, 9, 10, 11, 12, 13, 14, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43],
  'Numbers 2': [4, 5, 7, 8, 11, 12, 14, 15, 19, 20, 22, 23, 26, 27, 29, 30],
  'Numbers 13': [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  'Numbers 34': [20, 21, 22, 23, 24, 25, 26, 27],
  '1 Chronicles 27': [17, 18, 19, 20, 21],
  'Ezra 2': [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 37, 38, 41],
  'Nehemiah 7': [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 40, 41, 44],
  'Revelation 7': [5, 6, 7], // List of 12 tribes
};

/**
 * Check if a verse is expected to be empty in NLT
 */
function isExpectedEmptyVerse(reference: string, verseNumber: string): boolean {
  const fullRef = `${reference}:${verseNumber}`;

  // Check textual variants
  if (NLT_OMITTED_VERSES.has(fullRef)) {
    return true;
  }

  // Check list/table sections
  const listVerses = NLT_LIST_CHAPTERS[reference];
  if (listVerses && listVerses.includes(parseInt(verseNumber))) {
    return true;
  }

  return false;
}

interface FixtureData {
  [bookName: string]: {
    [chapter: string]: {
      reference: string;
      html: string;
      fetchedAt?: string;
    };
  };
}

interface QualityIssue {
  type: 'error' | 'warning';
  message: string;
}

interface ChapterResult {
  reference: string;
  success: boolean;
  verseCount: number;
  expectedVerseCount: number | null;
  error?: string;
  features: {
    hasRedLetter: boolean;
    hasPoetry: boolean;
    hasSpeakerLabels: boolean;
    hasHebrewLetters: boolean;
    hasSelah: boolean;
    hasFootnotes: boolean;
    hasSuperscription: boolean;
  };
  qualityIssues: QualityIssue[];
  sampleVerse?: { number: string; text: string };
}

interface BookResult {
  bookName: string;
  totalChapters: number;
  successfulChapters: number;
  failedChapters: number;
  chapters: ChapterResult[];
}

interface ValidationReport {
  timestamp: string;
  summary: {
    totalChapters: number;
    successful: number;
    failed: number;
    successRate: string;
    totalQualityIssues: number;
    verseCountMismatches: number;
  };
  featureSummary: {
    redLetter: number;
    poetry: number;
    speakerLabels: number;
    hebrewLetters: number;
    selah: number;
    footnotes: number;
    superscription: number;
  };
  books: BookResult[];
  failures: Array<{ reference: string; error: string }>;
  qualityIssues: Array<{ reference: string; issues: QualityIssue[] }>;
}

// Format used by all-nlt-responses.json (category-based)
interface PartialFixtureData {
  [category: string]: {
    [bookChapter: string]: {
      reference: string;
      html: string;
    };
  };
}

function convertPartialToFullFormat(partial: PartialFixtureData): FixtureData {
  const result: FixtureData = {};

  for (const category of Object.keys(partial)) {
    const categoryData = partial[category];
    for (const key of Object.keys(categoryData)) {
      const { reference, html } = categoryData[key];
      const match = reference.match(/^(.+)\s+(\d+)$/);
      if (match) {
        const [, bookName, chapter] = match;
        if (!result[bookName]) {
          result[bookName] = {};
        }
        result[bookName][chapter] = {
          reference,
          html,
          fetchedAt: new Date().toISOString(),
        };
      }
    }
  }

  return result;
}

function validateChapter(
  parser: NLTHTMLParser,
  bookName: string,
  chapter: number,
  html: string
): ChapterResult {
  const reference = `${bookName} ${chapter}`;
  const qualityIssues: QualityIssue[] = [];
  const features = {
    hasRedLetter: false,
    hasPoetry: false,
    hasSpeakerLabels: false,
    hasHebrewLetters: false,
    hasSelah: false,
    hasFootnotes: false,
    hasSuperscription: false,
  };

  // Get expected verse count
  const expectedVerseCount = EXPECTED_VERSE_COUNTS[bookName]?.[chapter] ?? null;

  // Check if HTML is empty or too short
  if (!html || html.length < 100) {
    return {
      reference,
      success: false,
      verseCount: 0,
      expectedVerseCount,
      error: html ? 'HTML content too short' : 'Empty HTML content',
      features,
      qualityIssues: [{ type: 'error', message: 'Missing or empty HTML content' }],
    };
  }

  try {
    const result = parser.parseToUnified(html, reference);

    if (!result.verses || result.verses.length === 0) {
      return {
        reference,
        success: false,
        verseCount: 0,
        expectedVerseCount,
        error: 'No verses parsed',
        features,
        qualityIssues: [{ type: 'error', message: 'Parser returned no verses' }],
      };
    }

    // === QUALITY CHECKS ===

    // 1. Check verse count matches expected
    if (expectedVerseCount !== null && result.verses.length !== expectedVerseCount) {
      qualityIssues.push({
        type: 'warning',
        message: `Verse count mismatch: got ${result.verses.length}, expected ${expectedVerseCount}`
      });
    }

    // 2. Check verse numbers are sequential
    let lastVerseNum = 0;
    for (const verse of result.verses) {
      const verseNum = parseInt(verse.number);
      if (verseNum !== lastVerseNum + 1) {
        qualityIssues.push({
          type: 'warning',
          message: `Non-sequential verse: expected ${lastVerseNum + 1}, got ${verseNum}`
        });
      }
      lastVerseNum = verseNum;
    }

    // 3. Check each verse has content
    for (const verse of result.verses) {
      // Check for empty text
      if (!verse.text || verse.text.trim().length === 0) {
        // Check if this is an expected empty verse (textual variant or list section)
        if (isExpectedEmptyVerse(reference, verse.number)) {
          qualityIssues.push({
            type: 'warning',
            message: `Verse ${verse.number}: Empty (expected - NLT omission or list format)`
          });
        } else {
          qualityIssues.push({
            type: 'error',
            message: `Verse ${verse.number}: Empty text content`
          });
        }
      }

      // Check for very short text (might indicate parsing issue)
      if (verse.text && verse.text.trim().length < 5 && verse.text.trim().length > 0) {
        qualityIssues.push({
          type: 'warning',
          message: `Verse ${verse.number}: Suspiciously short text (${verse.text.trim().length} chars): "${verse.text.trim()}"`
        });
      }

      // Check for HTML tags leaked into text
      if (verse.text && /<[^>]+>/.test(verse.text)) {
        qualityIssues.push({
          type: 'error',
          message: `Verse ${verse.number}: HTML tags found in text`
        });
      }

      // Check for footnote content leaked into verse text
      if (verse.text) {
        if (/\d+:\d+[a-z]?\s+(Hebrew|Greek|Or\s)/i.test(verse.text)) {
          qualityIssues.push({
            type: 'error',
            message: `Verse ${verse.number}: Footnote reference pattern detected in text`
          });
        }
        // Check for common footnote markers
        if (verse.text.includes('* ') && verse.text.includes(':')) {
          qualityIssues.push({
            type: 'warning',
            message: `Verse ${verse.number}: Possible footnote marker in text`
          });
        }
      }
    }

    // 4. Detect features
    for (const verse of result.verses) {
      if (verse.isRedLetter) features.hasRedLetter = true;
      if (verse.poetryLines && verse.poetryLines.length > 0) features.hasPoetry = true;
      if (verse.poetryIndentLevel) features.hasPoetry = true;
      if (verse.speakerLabels && verse.speakerLabels.length > 0) features.hasSpeakerLabels = true;
      if (verse.hebrewLetter) features.hasHebrewLetters = true;
      if (verse.hasSelah || verse.isSelah) features.hasSelah = true;
      if (verse.footnotes && verse.footnotes.length > 0) features.hasFootnotes = true;
    }

    if (result.psalmMetadata?.superscription) {
      features.hasSuperscription = true;
    }

    // Get sample verse for report (first verse with content)
    const sampleVerse = result.verses.find(v => v.text && v.text.length > 10);

    // Success if no error-level issues
    const hasErrors = qualityIssues.some(i => i.type === 'error');

    return {
      reference,
      success: !hasErrors,
      verseCount: result.verses.length,
      expectedVerseCount,
      features,
      qualityIssues,
      sampleVerse: sampleVerse ? { number: sampleVerse.number, text: sampleVerse.text.substring(0, 100) } : undefined,
    };
  } catch (error) {
    return {
      reference,
      success: false,
      verseCount: 0,
      expectedVerseCount,
      error: error instanceof Error ? error.message : String(error),
      features,
      qualityIssues: [{ type: 'error', message: `Parser threw: ${error}` }],
    };
  }
}

function runValidation(): void {
  console.log('═'.repeat(60));
  console.log('NLT Full Bible Validation (Enhanced)');
  console.log('═'.repeat(60));
  console.log();

  // Determine which fixture to use
  let fixturePath: string;
  let isFullBible = false;

  if (fs.existsSync(FULL_BIBLE_PATH)) {
    fixturePath = FULL_BIBLE_PATH;
    isFullBible = true;
    console.log('Using full Bible fixtures (1,189 chapters)');
  } else if (fs.existsSync(PARTIAL_FIXTURE_PATH)) {
    fixturePath = PARTIAL_FIXTURE_PATH;
    console.log('Using partial fixtures (66 chapters - one per book)');
    console.log('For full validation, run: npm run fetch:nlt-fixtures');
  } else {
    console.error('❌ No fixture files found');
    process.exit(1);
  }

  console.log('Loading fixtures...');
  const rawData = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

  let fixtureData: FixtureData;
  if (isFullBible) {
    fixtureData = rawData as FixtureData;
  } else {
    fixtureData = convertPartialToFullFormat(rawData as PartialFixtureData);
  }

  const parser = new NLTHTMLParser();
  const books: BookResult[] = [];
  const failures: Array<{ reference: string; error: string }> = [];
  const allQualityIssues: Array<{ reference: string; issues: QualityIssue[] }> = [];

  let totalChapters = 0;
  let successfulChapters = 0;
  let failedChapters = 0;
  let totalQualityIssues = 0;
  let verseCountMismatches = 0;

  const featureSummary = {
    redLetter: 0,
    poetry: 0,
    speakerLabels: 0,
    hebrewLetters: 0,
    selah: 0,
    footnotes: 0,
    superscription: 0,
  };

  const bookNames = Object.keys(fixtureData);
  console.log(`Found ${bookNames.length} books to validate\n`);

  for (const bookName of bookNames) {
    const bookData = fixtureData[bookName];
    const chapterNumbers = Object.keys(bookData).map(Number).sort((a, b) => a - b);

    const bookResult: BookResult = {
      bookName,
      totalChapters: chapterNumbers.length,
      successfulChapters: 0,
      failedChapters: 0,
      chapters: [],
    };

    for (const chapter of chapterNumbers) {
      const chapterData = bookData[chapter];
      const result = validateChapter(parser, bookName, chapter, chapterData.html);

      bookResult.chapters.push(result);
      totalChapters++;

      if (result.qualityIssues.length > 0) {
        totalQualityIssues += result.qualityIssues.length;
        allQualityIssues.push({ reference: result.reference, issues: result.qualityIssues });
      }

      if (result.expectedVerseCount !== null && result.verseCount !== result.expectedVerseCount) {
        verseCountMismatches++;
      }

      if (result.success) {
        successfulChapters++;
        bookResult.successfulChapters++;

        // Aggregate feature counts
        if (result.features.hasRedLetter) featureSummary.redLetter++;
        if (result.features.hasPoetry) featureSummary.poetry++;
        if (result.features.hasSpeakerLabels) featureSummary.speakerLabels++;
        if (result.features.hasHebrewLetters) featureSummary.hebrewLetters++;
        if (result.features.hasSelah) featureSummary.selah++;
        if (result.features.hasFootnotes) featureSummary.footnotes++;
        if (result.features.hasSuperscription) featureSummary.superscription++;
      } else {
        failedChapters++;
        bookResult.failedChapters++;
        failures.push({
          reference: result.reference,
          error: result.error || result.qualityIssues.find(i => i.type === 'error')?.message || 'Unknown error',
        });
      }
    }

    books.push(bookResult);

    // Progress indicator
    const status = bookResult.failedChapters === 0 ? '✅' : '⚠️';
    const expectedTotal = isFullBible ? 1189 : bookNames.length;
    const progressPct = Math.round((totalChapters / expectedTotal) * 100);
    process.stdout.write(
      `\r[${progressPct}%] ${bookName}: ${bookResult.successfulChapters}/${bookResult.totalChapters} chapters ${status}          `
    );
  }

  console.log('\n');
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total chapters: ${totalChapters}`);
  console.log(`Successful: ${successfulChapters} (${((successfulChapters / totalChapters) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failedChapters}`);
  console.log(`Quality issues found: ${totalQualityIssues}`);
  console.log(`Verse count mismatches: ${verseCountMismatches}`);
  console.log();

  console.log('Feature Detection:');
  console.log(`  🔴 Red letter: ${featureSummary.redLetter} chapters`);
  console.log(`  📜 Poetry: ${featureSummary.poetry} chapters`);
  console.log(`  💬 Speaker labels: ${featureSummary.speakerLabels} chapters`);
  console.log(`  🔤 Hebrew letters: ${featureSummary.hebrewLetters} chapters`);
  console.log(`  🎵 Selah markers: ${featureSummary.selah} chapters`);
  console.log(`  📝 Footnotes: ${featureSummary.footnotes} chapters`);
  console.log(`  📖 Psalm superscriptions: ${featureSummary.superscription} chapters`);
  console.log();

  if (failures.length > 0) {
    console.log('FAILURES:');
    console.log('─'.repeat(60));
    failures.slice(0, 10).forEach(f => {
      console.log(`  ❌ ${f.reference}: ${f.error}`);
    });
    if (failures.length > 10) {
      console.log(`  ... and ${failures.length - 10} more (see report)`);
    }
    console.log();
  }

  if (allQualityIssues.length > 0) {
    console.log('QUALITY ISSUES (first 10):');
    console.log('─'.repeat(60));
    allQualityIssues.slice(0, 10).forEach(({ reference, issues }) => {
      issues.forEach(issue => {
        const icon = issue.type === 'error' ? '❌' : '⚠️';
        console.log(`  ${icon} ${reference}: ${issue.message}`);
      });
    });
    if (allQualityIssues.length > 10) {
      console.log(`  ... and ${allQualityIssues.length - 10} more chapters with issues (see report)`);
    }
    console.log();
  }

  // Generate report
  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalChapters,
      successful: successfulChapters,
      failed: failedChapters,
      successRate: `${((successfulChapters / totalChapters) * 100).toFixed(1)}%`,
      totalQualityIssues,
      verseCountMismatches,
    },
    featureSummary,
    books,
    failures,
    qualityIssues: allQualityIssues,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`Report saved to: ${REPORT_PATH}`);

  // Exit with error code if there were failures
  if (failedChapters > 0) {
    process.exit(1);
  }
}

// Run validation
runValidation();
