/**
 * Standard Bible API Fixture Fetcher
 *
 * Fetches representative chapters from scripture.api.bible for KJV, ASV, and WEB translations.
 * One chapter per book (66 books x 3 translations = 198 requests)
 *
 * Usage: npx ts-node scripts/fetch-standard-fixtures.ts
 *
 * Key difference from NLT:
 * - Uses JSON content type instead of HTML
 * - Includes notes/footnotes via include-notes=true
 * - Different API authentication (header vs query param)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API Configuration
const API_KEY = '58410e50f19ea158ea4902e05191db02';
const BASE_URL = 'https://api.scripture.api.bible/v1';
const DELAY_MS = 150; // 150ms between requests

// Bible IDs from scripture.api.bible
const BIBLE_IDS = {
  KJV: 'de4e12af7f28f599-02',
  ASV: '06125adad2d5898a-01',
  WEB: '9879dbb7cfe39e4d-04'
} as const;

type Translation = keyof typeof BIBLE_IDS;

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../src/services/__tests__/fixtures/standard-api-responses');

// Book definitions with API codes and representative chapters
// Using same chapters as NLT fixtures for consistency
interface BookDefinition {
  name: string;
  chapter: number;
  apiCode: string;
}

const BOOK_CHAPTERS: Record<string, BookDefinition[]> = {
  // Old Testament - Pentateuch (5 books)
  pentateuch: [
    { name: 'Genesis', chapter: 1, apiCode: 'GEN' },
    { name: 'Exodus', chapter: 20, apiCode: 'EXO' },      // Ten Commandments
    { name: 'Leviticus', chapter: 19, apiCode: 'LEV' },   // Holiness code
    { name: 'Numbers', chapter: 6, apiCode: 'NUM' },      // Priestly blessing
    { name: 'Deuteronomy', chapter: 6, apiCode: 'DEU' },  // Shema
  ],

  // Old Testament - Historical Books (12 books)
  historical: [
    { name: 'Joshua', chapter: 1, apiCode: 'JOS' },
    { name: 'Judges', chapter: 7, apiCode: 'JDG' },       // Gideon
    { name: 'Ruth', chapter: 1, apiCode: 'RUT' },
    { name: '1 Samuel', chapter: 17, apiCode: '1SA' },    // David and Goliath
    { name: '2 Samuel', chapter: 7, apiCode: '2SA' },     // Davidic covenant
    { name: '1 Kings', chapter: 3, apiCode: '1KI' },      // Solomon's wisdom
    { name: '2 Kings', chapter: 2, apiCode: '2KI' },      // Elijah taken up
    { name: '1 Chronicles', chapter: 16, apiCode: '1CH' },
    { name: '2 Chronicles', chapter: 7, apiCode: '2CH' }, // Temple dedication
    { name: 'Ezra', chapter: 1, apiCode: 'EZR' },
    { name: 'Nehemiah', chapter: 1, apiCode: 'NEH' },
    { name: 'Esther', chapter: 4, apiCode: 'EST' },       // "For such a time"
  ],

  // Old Testament - Poetry/Wisdom (5 books)
  poetryWisdom: [
    { name: 'Job', chapter: 38, apiCode: 'JOB' },         // God answers Job
    { name: 'Psalms', chapter: 23, apiCode: 'PSA' },      // Shepherd psalm
    { name: 'Proverbs', chapter: 3, apiCode: 'PRO' },     // Trust in the Lord
    { name: 'Ecclesiastes', chapter: 3, apiCode: 'ECC' }, // Time for everything
    { name: 'Song of Solomon', chapter: 1, apiCode: 'SNG' },
  ],

  // Old Testament - Major Prophets (5 books)
  majorProphets: [
    { name: 'Isaiah', chapter: 53, apiCode: 'ISA' },      // Suffering servant
    { name: 'Jeremiah', chapter: 31, apiCode: 'JER' },    // New covenant
    { name: 'Lamentations', chapter: 3, apiCode: 'LAM' }, // Great is thy faithfulness
    { name: 'Ezekiel', chapter: 37, apiCode: 'EZK' },     // Valley of dry bones
    { name: 'Daniel', chapter: 3, apiCode: 'DAN' },       // Fiery furnace
  ],

  // Old Testament - Minor Prophets (12 books)
  minorProphets: [
    { name: 'Hosea', chapter: 11, apiCode: 'HOS' },
    { name: 'Joel', chapter: 2, apiCode: 'JOL' },
    { name: 'Amos', chapter: 5, apiCode: 'AMO' },
    { name: 'Obadiah', chapter: 1, apiCode: 'OBA' },
    { name: 'Jonah', chapter: 1, apiCode: 'JON' },
    { name: 'Micah', chapter: 6, apiCode: 'MIC' },
    { name: 'Nahum', chapter: 1, apiCode: 'NAM' },
    { name: 'Habakkuk', chapter: 3, apiCode: 'HAB' },
    { name: 'Zephaniah', chapter: 3, apiCode: 'ZEP' },
    { name: 'Haggai', chapter: 1, apiCode: 'HAG' },
    { name: 'Zechariah', chapter: 9, apiCode: 'ZEC' },
    { name: 'Malachi', chapter: 3, apiCode: 'MAL' },
  ],

  // New Testament - Gospels (4 books)
  gospels: [
    { name: 'Matthew', chapter: 5, apiCode: 'MAT' },      // Sermon on the Mount
    { name: 'Mark', chapter: 4, apiCode: 'MRK' },         // Parables
    { name: 'Luke', chapter: 15, apiCode: 'LUK' },        // Prodigal Son
    { name: 'John', chapter: 1, apiCode: 'JHN' },         // In the beginning
  ],

  // New Testament - Acts (1 book)
  acts: [
    { name: 'Acts', chapter: 2, apiCode: 'ACT' },         // Pentecost
  ],

  // New Testament - Pauline Epistles (13 books)
  paulineEpistles: [
    { name: 'Romans', chapter: 8, apiCode: 'ROM' },       // No condemnation
    { name: '1 Corinthians', chapter: 13, apiCode: '1CO' }, // Love chapter
    { name: '2 Corinthians', chapter: 12, apiCode: '2CO' },
    { name: 'Galatians', chapter: 5, apiCode: 'GAL' },    // Fruit of the Spirit
    { name: 'Ephesians', chapter: 6, apiCode: 'EPH' },    // Armor of God
    { name: 'Philippians', chapter: 4, apiCode: 'PHP' },  // Rejoice in the Lord
    { name: 'Colossians', chapter: 3, apiCode: 'COL' },
    { name: '1 Thessalonians', chapter: 4, apiCode: '1TH' },
    { name: '2 Thessalonians', chapter: 2, apiCode: '2TH' },
    { name: '1 Timothy', chapter: 6, apiCode: '1TI' },
    { name: '2 Timothy', chapter: 2, apiCode: '2TI' },
    { name: 'Titus', chapter: 2, apiCode: 'TIT' },
    { name: 'Philemon', chapter: 1, apiCode: 'PHM' },
  ],

  // New Testament - General Epistles (8 books)
  generalEpistles: [
    { name: 'Hebrews', chapter: 11, apiCode: 'HEB' },     // Faith chapter
    { name: 'James', chapter: 1, apiCode: 'JAS' },
    { name: '1 Peter', chapter: 2, apiCode: '1PE' },
    { name: '2 Peter', chapter: 1, apiCode: '2PE' },
    { name: '1 John', chapter: 4, apiCode: '1JN' },       // God is love
    { name: '2 John', chapter: 1, apiCode: '2JN' },
    { name: '3 John', chapter: 1, apiCode: '3JN' },
    { name: 'Jude', chapter: 1, apiCode: 'JUD' },
  ],

  // New Testament - Revelation (1 book)
  revelation: [
    { name: 'Revelation', chapter: 21, apiCode: 'REV' },  // New heaven and earth
  ],
};

// Calculate total books
const TOTAL_BOOKS = Object.values(BOOK_CHAPTERS).reduce((sum, books) => sum + books.length, 0);
const TRANSLATIONS: Translation[] = ['KJV', 'ASV', 'WEB'];
const TOTAL_REQUESTS = TOTAL_BOOKS * TRANSLATIONS.length;

interface ChapterResponse {
  reference: string;
  bookName: string;
  chapter: number;
  translation: Translation;
  content: any;  // Raw JSON from API
  fetchedAt: string;
  error?: string;
}

interface CategoryResponses {
  [key: string]: ChapterResponse;
}

interface TranslationResponses {
  [category: string]: CategoryResponses;
}

interface AllResponses {
  KJV: TranslationResponses;
  ASV: TranslationResponses;
  WEB: TranslationResponses;
}

interface Summary {
  translation: Translation;
  total: number;
  success: number;
  failed: string[];
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildChapterRef(apiCode: string, chapter: number): string {
  return `${apiCode}.${chapter}`;
}

async function fetchChapter(
  translation: Translation,
  bookName: string,
  chapter: number,
  apiCode: string
): Promise<ChapterResponse> {
  const bibleId = BIBLE_IDS[translation];
  const chapterRef = buildChapterRef(apiCode, chapter);

  // Key change: include-notes=true to capture footnotes
  const url = `${BASE_URL}/bibles/${bibleId}/chapters/${chapterRef}?content-type=json&include-notes=true&include-titles=true&include-verse-numbers=true`;

  try {
    const response = await fetch(url, {
      headers: { 'api-key': API_KEY }
    });

    if (!response.ok) {
      return {
        reference: `${bookName} ${chapter}`,
        bookName,
        chapter,
        translation,
        content: null,
        fetchedAt: new Date().toISOString(),
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();

    return {
      reference: data.data?.reference || `${bookName} ${chapter}`,
      bookName,
      chapter,
      translation,
      content: data.data,  // Store full response including content array
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      reference: `${bookName} ${chapter}`,
      bookName,
      chapter,
      translation,
      content: null,
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function fetchAllFixtures(): Promise<void> {
  console.log(`\n📖 Standard Bible API Fixture Fetcher`);
  console.log(`===================================`);
  console.log(`Translations: ${TRANSLATIONS.join(', ')}`);
  console.log(`Books per translation: ${TOTAL_BOOKS}`);
  console.log(`Total requests: ${TOTAL_REQUESTS}`);
  console.log(`Estimated time: ${Math.ceil(TOTAL_REQUESTS * DELAY_MS / 1000)} seconds\n`);

  const allResults: AllResponses = {
    KJV: {},
    ASV: {},
    WEB: {}
  };

  const summaries: Record<Translation, Summary> = {
    KJV: { translation: 'KJV', total: TOTAL_BOOKS, success: 0, failed: [] },
    ASV: { translation: 'ASV', total: TOTAL_BOOKS, success: 0, failed: [] },
    WEB: { translation: 'WEB', total: TOTAL_BOOKS, success: 0, failed: [] }
  };

  let completed = 0;

  for (const translation of TRANSLATIONS) {
    console.log(`\n📚 Fetching ${translation}...`);

    for (const [category, books] of Object.entries(BOOK_CHAPTERS)) {
      allResults[translation][category] = {};

      for (const { name, chapter, apiCode } of books) {
        const result = await fetchChapter(translation, name, chapter, apiCode);
        const key = `${name.replace(/\s+/g, '_')}_${chapter}`;

        allResults[translation][category][key] = result;

        if (result.error) {
          summaries[translation].failed.push(`${name} ${chapter}`);
          console.log(`  ❌ ${name} ${chapter}: ${result.error}`);
        } else {
          summaries[translation].success++;
        }

        completed++;
        const percent = Math.round((completed / TOTAL_REQUESTS) * 100);
        process.stdout.write(`\r  [${percent}%] ${completed}/${TOTAL_REQUESTS} - ${name} ${chapter}          `);

        await sleep(DELAY_MS);
      }
    }

    console.log(`\n  ✅ ${translation} complete: ${summaries[translation].success}/${TOTAL_BOOKS} successful`);
  }

  // Save results
  console.log('\n\n📁 Saving fixtures...');
  ensureDir(OUTPUT_DIR);

  // Save per-translation files (organized by category)
  for (const translation of TRANSLATIONS) {
    const translationDir = path.join(OUTPUT_DIR, translation.toLowerCase());
    ensureDir(translationDir);

    // Save category files
    for (const [category, responses] of Object.entries(allResults[translation])) {
      const categoryPath = path.join(translationDir, `${category}.json`);
      fs.writeFileSync(categoryPath, JSON.stringify(responses, null, 2));
    }

    // Save combined file for translation
    const allPath = path.join(OUTPUT_DIR, `all-${translation.toLowerCase()}-responses.json`);
    fs.writeFileSync(allPath, JSON.stringify(allResults[translation], null, 2));

    const stats = fs.statSync(allPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`  📄 ${translation}: ${sizeKB} KB`);
  }

  // Save summary
  const summaryPath = path.join(OUTPUT_DIR, 'fetch-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    totalBooks: TOTAL_BOOKS,
    totalRequests: TOTAL_REQUESTS,
    translations: summaries,
    categories: Object.keys(BOOK_CHAPTERS),
    apiParameters: {
      'content-type': 'json',
      'include-notes': true,
      'include-titles': true,
      'include-verse-numbers': true
    }
  }, null, 2));

  // Print final summary
  console.log('\n✅ Done!\n');
  console.log('Summary:');
  for (const translation of TRANSLATIONS) {
    const s = summaries[translation];
    const status = s.failed.length === 0 ? '✅' : '⚠️';
    console.log(`  ${status} ${translation}: ${s.success}/${s.total} chapters`);
    if (s.failed.length > 0) {
      console.log(`     Failed: ${s.failed.join(', ')}`);
    }
  }

  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
}

// Run the script
fetchAllFixtures().catch(console.error);
