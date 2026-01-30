/**
 * Standard Bible Fixture Fetcher (KJV, ASV, WEB)
 *
 * Fetches all 1,189 chapters of the Bible from scripture.api.bible
 * for KJV, ASV, and WEB translations and saves them as test fixtures.
 *
 * Usage: npx ts-node scripts/fetch-standard-full-bible.ts
 *
 * API: scripture.api.bible
 * - Rate limit: Be conservative with delays
 * - Total requests: 3,567 (1,189 chapters × 3 translations)
 * - Runtime: ~9 minutes with 150ms delays
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = '58410e50f19ea158ea4902e05191db02';
const BASE_URL = 'https://api.scripture.api.bible/v1';
const OUTPUT_DIR = path.join(__dirname, '../src/services/__tests__/fixtures');
const DELAY_MS = 150; // 150ms between requests to avoid rate limiting

// Bible IDs from scripture.api.bible
const BIBLE_IDS = {
  KJV: 'de4e12af7f28f599-02',
  ASV: '06125adad2d5898a-01',
  WEB: '9879dbb7cfe39e4d-04',
} as const;

type Translation = keyof typeof BIBLE_IDS;

// All 66 books with their chapter counts and API codes
const BIBLE_BOOKS = [
  // Old Testament
  { name: 'Genesis', chapters: 50, apiCode: 'GEN' },
  { name: 'Exodus', chapters: 40, apiCode: 'EXO' },
  { name: 'Leviticus', chapters: 27, apiCode: 'LEV' },
  { name: 'Numbers', chapters: 36, apiCode: 'NUM' },
  { name: 'Deuteronomy', chapters: 34, apiCode: 'DEU' },
  { name: 'Joshua', chapters: 24, apiCode: 'JOS' },
  { name: 'Judges', chapters: 21, apiCode: 'JDG' },
  { name: 'Ruth', chapters: 4, apiCode: 'RUT' },
  { name: '1 Samuel', chapters: 31, apiCode: '1SA' },
  { name: '2 Samuel', chapters: 24, apiCode: '2SA' },
  { name: '1 Kings', chapters: 22, apiCode: '1KI' },
  { name: '2 Kings', chapters: 25, apiCode: '2KI' },
  { name: '1 Chronicles', chapters: 29, apiCode: '1CH' },
  { name: '2 Chronicles', chapters: 36, apiCode: '2CH' },
  { name: 'Ezra', chapters: 10, apiCode: 'EZR' },
  { name: 'Nehemiah', chapters: 13, apiCode: 'NEH' },
  { name: 'Esther', chapters: 10, apiCode: 'EST' },
  { name: 'Job', chapters: 42, apiCode: 'JOB' },
  { name: 'Psalm', chapters: 150, apiCode: 'PSA' },
  { name: 'Proverbs', chapters: 31, apiCode: 'PRO' },
  { name: 'Ecclesiastes', chapters: 12, apiCode: 'ECC' },
  { name: 'Song of Solomon', chapters: 8, apiCode: 'SNG' },
  { name: 'Isaiah', chapters: 66, apiCode: 'ISA' },
  { name: 'Jeremiah', chapters: 52, apiCode: 'JER' },
  { name: 'Lamentations', chapters: 5, apiCode: 'LAM' },
  { name: 'Ezekiel', chapters: 48, apiCode: 'EZK' },
  { name: 'Daniel', chapters: 12, apiCode: 'DAN' },
  { name: 'Hosea', chapters: 14, apiCode: 'HOS' },
  { name: 'Joel', chapters: 3, apiCode: 'JOL' },
  { name: 'Amos', chapters: 9, apiCode: 'AMO' },
  { name: 'Obadiah', chapters: 1, apiCode: 'OBA' },
  { name: 'Jonah', chapters: 4, apiCode: 'JON' },
  { name: 'Micah', chapters: 7, apiCode: 'MIC' },
  { name: 'Nahum', chapters: 3, apiCode: 'NAM' },
  { name: 'Habakkuk', chapters: 3, apiCode: 'HAB' },
  { name: 'Zephaniah', chapters: 3, apiCode: 'ZEP' },
  { name: 'Haggai', chapters: 2, apiCode: 'HAG' },
  { name: 'Zechariah', chapters: 14, apiCode: 'ZEC' },
  { name: 'Malachi', chapters: 4, apiCode: 'MAL' },
  // New Testament
  { name: 'Matthew', chapters: 28, apiCode: 'MAT' },
  { name: 'Mark', chapters: 16, apiCode: 'MRK' },
  { name: 'Luke', chapters: 24, apiCode: 'LUK' },
  { name: 'John', chapters: 21, apiCode: 'JHN' },
  { name: 'Acts', chapters: 28, apiCode: 'ACT' },
  { name: 'Romans', chapters: 16, apiCode: 'ROM' },
  { name: '1 Corinthians', chapters: 16, apiCode: '1CO' },
  { name: '2 Corinthians', chapters: 13, apiCode: '2CO' },
  { name: 'Galatians', chapters: 6, apiCode: 'GAL' },
  { name: 'Ephesians', chapters: 6, apiCode: 'EPH' },
  { name: 'Philippians', chapters: 4, apiCode: 'PHP' },
  { name: 'Colossians', chapters: 4, apiCode: 'COL' },
  { name: '1 Thessalonians', chapters: 5, apiCode: '1TH' },
  { name: '2 Thessalonians', chapters: 3, apiCode: '2TH' },
  { name: '1 Timothy', chapters: 6, apiCode: '1TI' },
  { name: '2 Timothy', chapters: 4, apiCode: '2TI' },
  { name: 'Titus', chapters: 3, apiCode: 'TIT' },
  { name: 'Philemon', chapters: 1, apiCode: 'PHM' },
  { name: 'Hebrews', chapters: 13, apiCode: 'HEB' },
  { name: 'James', chapters: 5, apiCode: 'JAS' },
  { name: '1 Peter', chapters: 5, apiCode: '1PE' },
  { name: '2 Peter', chapters: 3, apiCode: '2PE' },
  { name: '1 John', chapters: 5, apiCode: '1JN' },
  { name: '2 John', chapters: 1, apiCode: '2JN' },
  { name: '3 John', chapters: 1, apiCode: '3JN' },
  { name: 'Jude', chapters: 1, apiCode: 'JUD' },
  { name: 'Revelation', chapters: 22, apiCode: 'REV' },
];

// Calculate total chapters
const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0);

async function fetchChapter(bibleId: string, bookCode: string, chapter: number): Promise<any> {
  const chapterRef = `${bookCode}.${chapter}`;
  const url = `${BASE_URL}/bibles/${bibleId}/chapters/${chapterRef}?content-type=json&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`;

  const response = await fetch(url, {
    headers: {
      'api-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.data) {
    throw new Error('No chapter content found');
  }

  return {
    id: data.data.id,
    bibleId: data.data.bibleId,
    number: data.data.number,
    bookId: data.data.bookId,
    reference: data.data.reference,
    copyright: data.data.copyright,
    verseCount: data.data.verseCount,
    content: data.data.content,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface FixtureData {
  [bookName: string]: {
    [chapter: string]: {
      reference: string;
      bookName: string;
      chapter: number;
      translation: string;
      content: any;
      fetchedAt: string;
    };
  };
}

async function fetchFullBible(translation: Translation): Promise<void> {
  const bibleId = BIBLE_IDS[translation];
  const outputPath = path.join(OUTPUT_DIR, `full-bible-${translation.toLowerCase()}.json`);

  console.log(`\nStarting ${translation} Bible fixture fetch...`);
  console.log(`Bible ID: ${bibleId}`);
  console.log(`Total chapters to fetch: ${TOTAL_CHAPTERS}`);
  console.log(`Estimated time: ${Math.ceil((TOTAL_CHAPTERS * DELAY_MS) / 1000 / 60)} minutes\n`);

  const fixtures: FixtureData = {};
  let completed = 0;
  const errors: string[] = [];

  for (const book of BIBLE_BOOKS) {
    fixtures[book.name] = {};

    for (let ch = 1; ch <= book.chapters; ch++) {
      const reference = `${book.name} ${ch}`;

      try {
        const content = await fetchChapter(bibleId, book.apiCode, ch);

        fixtures[book.name][ch] = {
          reference,
          bookName: book.name,
          chapter: ch,
          translation,
          content,
          fetchedAt: new Date().toISOString(),
        };

        completed++;
        const percent = Math.round((completed / TOTAL_CHAPTERS) * 100);
        process.stdout.write(
          `\r[${percent}%] ${translation} Fetched ${completed}/${TOTAL_CHAPTERS}: ${reference}          `
        );
      } catch (error) {
        const errorMsg = `Failed to fetch ${translation} ${reference}: ${error}`;
        errors.push(errorMsg);
        console.error(`\n${errorMsg}`);
      }

      // Rate limiting delay
      await sleep(DELAY_MS);
    }
  }

  console.log('\n\nWriting fixtures to file...');

  // Ensure directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write fixtures
  fs.writeFileSync(outputPath, JSON.stringify(fixtures, null, 2));

  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log(`\n${translation} Done!`);
  console.log(`   Chapters fetched: ${completed}/${TOTAL_CHAPTERS}`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   File size: ${sizeMB} MB`);
  console.log(`   Output: ${outputPath}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach((e) => console.log(`  - ${e}`));
  }
}

async function fetchAllTranslations(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Standard Bible API Full Fixture Fetcher');
  console.log('='.repeat(60));
  console.log(`Translations: ${Object.keys(BIBLE_IDS).join(', ')}`);
  console.log(`Chapters per translation: ${TOTAL_CHAPTERS}`);
  console.log(`Total requests: ${TOTAL_CHAPTERS * Object.keys(BIBLE_IDS).length}`);
  console.log(
    `Estimated total time: ${Math.ceil((TOTAL_CHAPTERS * Object.keys(BIBLE_IDS).length * DELAY_MS) / 1000 / 60)} minutes`
  );

  const translations = Object.keys(BIBLE_IDS) as Translation[];

  for (const translation of translations) {
    await fetchFullBible(translation);
  }

  console.log('\n' + '='.repeat(60));
  console.log('All translations complete!');
  console.log('='.repeat(60));
}

// Run the script
fetchAllTranslations().catch(console.error);
