/**
 * NLT Bible Fixture Fetcher
 *
 * Fetches all 1,189 chapters of the Bible from the NLT API
 * and saves them as test fixtures.
 *
 * Usage: npx ts-node scripts/fetch-nlt-fixtures.ts
 *
 * API Limits (with API key):
 * - 5,000 requests/day
 * - 500 verses/request
 *
 * With 100ms delays between requests, this takes ~2-3 minutes.
 */

import * as fs from 'fs';
import * as path from 'path';

const API_KEY = 'd74333ee-8951-45dc-9925-5074a8ad2f07';
const BASE_URL = 'https://api.nlt.to/api';
const OUTPUT_PATH = path.join(__dirname, '../src/services/__tests__/fixtures/full-bible-nlt.json');
const DELAY_MS = 100; // 100ms between requests to avoid rate limiting

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

function convertToNLTFormat(reference: string): string {
  // Replace colons with dots (for verse references)
  let formatted = reference.replace(/:/g, '.');

  // Handle numbered books (1 Samuel, 2 Kings, 1 Corinthians, etc.)
  if (/^[123I]\s+/.test(formatted)) {
    const parts = formatted.split(/\s+/);
    if (parts.length >= 2) {
      const bookName = parts[0] + ' ' + parts[1];
      const rest = parts.slice(2).join('.');
      formatted = rest ? bookName + '.' + rest : bookName;
    }
  }
  // Handle "Song of Solomon" - NLT API uses abbreviation "Song"
  else if (formatted.startsWith('Song of Solomon')) {
    formatted = formatted.replace('Song of Solomon', 'Song');
  }
  // Handle single-word books (Genesis, Exodus, etc.)
  else {
    formatted = formatted.replace(/\s+/g, '.');
  }

  return formatted;
}

async function fetchChapter(reference: string): Promise<string> {
  const nltReference = convertToNLTFormat(reference);
  const url = `${BASE_URL}/passages?ref=${encodeURIComponent(nltReference)}&version=NLT&key=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
  }

  return await response.text();
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

async function fetchFullBible(): Promise<void> {
  console.log(`Starting NLT Bible fixture fetch...`);
  console.log(`Total chapters to fetch: ${TOTAL_CHAPTERS}`);
  console.log(`Estimated time: ${Math.ceil(TOTAL_CHAPTERS * DELAY_MS / 1000 / 60)} minutes\n`);

  const fixtures: FixtureData = {};
  let completed = 0;
  let errors: string[] = [];

  for (const book of BIBLE_BOOKS) {
    fixtures[book.name] = {};

    for (let ch = 1; ch <= book.chapters; ch++) {
      const reference = `${book.name} ${ch}`;

      try {
        const html = await fetchChapter(reference);

        fixtures[book.name][ch] = {
          reference,
          html,
          fetchedAt: new Date().toISOString(),
        };

        completed++;
        const percent = Math.round((completed / TOTAL_CHAPTERS) * 100);
        process.stdout.write(`\r[${percent}%] Fetched ${completed}/${TOTAL_CHAPTERS}: ${reference}          `);

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
