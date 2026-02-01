/**
 * ESV Bible Fixture Fetcher
 *
 * Fetches all 1,189 chapters of the Bible from the ESV API
 * and saves them as test fixtures.
 *
 * Usage: npx ts-node scripts/fetch-esv-fixtures.ts
 *
 * API Limits:
 * - 5,000 requests/day (plenty for 1,189 chapters)
 * - No per-minute limits documented
 *
 * With 100ms delays between requests, this takes ~2-3 minutes.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ESV API configuration
const API_KEY = 'd74f42aa54c642a4cbfef2a93c5c67f460f13cdb';
const BASE_URL = 'https://api.esv.org/v3/passage/html/';
const OUTPUT_PATH = path.join(__dirname, '../src/services/__tests__/fixtures/full-bible-esv.json');
const DELAY_MS = 500; // 500ms between requests (ESV API is strict)
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000; // Wait 5 seconds before retry on 429

// All 66 books with their chapter counts
const BIBLE_BOOKS = [
  // Old Testament
  { name: 'Genesis', chapters: 50 },
  { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 },
  { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 },
  { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 },
  { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 },
  { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 },
  { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 },
  { name: 'Job', chapters: 42 },
  { name: 'Psalm', chapters: 150 },
  { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 },
  { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 },
  { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 },
  { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 },
  { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 },
  { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 },
  { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 },
  { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 },
  { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 },
  // New Testament
  { name: 'Matthew', chapters: 28 },
  { name: 'Mark', chapters: 16 },
  { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 },
  { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 },
  { name: '2 Corinthians', chapters: 13 },
  { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 },
  { name: 'Philippians', chapters: 4 },
  { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 },
  { name: '2 Thessalonians', chapters: 3 },
  { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 },
  { name: 'Titus', chapters: 3 },
  { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 },
  { name: 'James', chapters: 5 },
  { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 },
  { name: '1 John', chapters: 5 },
  { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 },
  { name: 'Jude', chapters: 1 },
  { name: 'Revelation', chapters: 22 },
];

// Calculate total chapters
const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0);

async function fetchChapter(reference: string, retryCount = 0): Promise<string> {
  const params = new URLSearchParams({
    q: reference,
    'include-passage-references': 'false',
    'include-verse-numbers': 'true',
    'include-first-verse-numbers': 'true',
    'include-footnotes': 'false',
    'include-headings': 'true',
    'include-audio-link': 'false',
    'include-short-copyright': 'false',
  });

  const response = await fetch(`${BASE_URL}?${params}`, {
    headers: {
      'Authorization': `Token ${API_KEY}`,
    },
  });

  // Handle rate limiting with exponential backoff
  if (response.status === 429 && retryCount < MAX_RETRIES) {
    const backoffMs = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff: 5s, 10s, 20s, 40s, 80s
    console.log(`\n  Rate limited on ${reference}, waiting ${backoffMs / 1000}s and retrying (${retryCount + 1}/${MAX_RETRIES})...`);
    await sleep(backoffMs);
    return fetchChapter(reference, retryCount + 1);
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.passages || data.passages.length === 0) {
    throw new Error('No passage content found');
  }

  return data.passages[0];
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface FixtureData {
  [bookName: string]: {
    [chapter: string]: {
      reference: string;
      html: string;
      fetchedAt: string;
    };
  };
}

// Single-chapter books need special handling - ESV API interprets "Obadiah 1" as verse 1
const SINGLE_CHAPTER_BOOKS = new Set(['Obadiah', 'Philemon', '2 John', '3 John', 'Jude']);

async function fetchFullBible(): Promise<void> {
  console.log(`Starting ESV Bible fixture fetch...`);
  console.log(`Total chapters to fetch: ${TOTAL_CHAPTERS}`);
  console.log(`Estimated time: ${Math.ceil(TOTAL_CHAPTERS * DELAY_MS / 1000 / 60)} minutes\n`);

  // Load existing fixtures if available (resume support)
  let fixtures: FixtureData = {};
  let skipped = 0;

  if (fs.existsSync(OUTPUT_PATH)) {
    console.log('Found existing fixture file, will resume from where we left off...\n');
    try {
      fixtures = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
    } catch (e) {
      console.log('Could not parse existing file, starting fresh.\n');
    }
  }

  let completed = 0;
  let errors: string[] = [];

  for (const book of BIBLE_BOOKS) {
    if (!fixtures[book.name]) {
      fixtures[book.name] = {};
    }

    for (let ch = 1; ch <= book.chapters; ch++) {
      // For single-chapter books, use just the book name to get the entire book
      // ESV API interprets "Obadiah 1" as verse 1, not chapter 1
      const reference = SINGLE_CHAPTER_BOOKS.has(book.name) ? book.name : `${book.name} ${ch}`;

      // Skip if we already have valid data for this chapter
      // For single-chapter books, verify we have more than just one verse worth of content
      const existing = fixtures[book.name][ch];
      const minLength = SINGLE_CHAPTER_BOOKS.has(book.name) ? 2000 : 100; // Single-chapter books should have substantial content
      if (existing && existing.html && existing.html.length > minLength) {
        skipped++;
        continue;
      }

      try {
        const html = await fetchChapter(reference);

        // Always store with "Book Chapter" format for consistency
        const storedReference = `${book.name} ${ch}`;
        fixtures[book.name][ch] = {
          reference: storedReference,
          html,
          fetchedAt: new Date().toISOString(),
        };

        completed++;
        const total = TOTAL_CHAPTERS - skipped;
        const percent = Math.round((completed / total) * 100);
        process.stdout.write(`\r[${percent}%] Fetched ${completed}/${total}: ${reference} (skipped ${skipped})          `);

      } catch (error) {
        const errorMsg = `Failed to fetch ${reference}: ${error}`;
        errors.push(errorMsg);
        console.error(`\n${errorMsg}`);
      }

      // Rate limiting delay
      await sleep(DELAY_MS);
    }
  }

  console.log('\n\nWriting fixtures to file...');

  // Ensure directory exists
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write fixtures
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(fixtures, null, 2));

  const stats = fs.statSync(OUTPUT_PATH);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log(`\n✅ Done!`);
  console.log(`   Chapters fetched: ${completed}/${TOTAL_CHAPTERS}`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   File size: ${sizeMB} MB`);
  console.log(`   Output: ${OUTPUT_PATH}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }
}

// Run the script
fetchFullBible().catch(console.error);
