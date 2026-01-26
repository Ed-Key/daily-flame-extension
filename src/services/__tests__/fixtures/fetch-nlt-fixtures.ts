/**
 * NLT API Response Fetcher
 *
 * This script fetches real responses from the NLT API and saves them as fixtures
 * for testing the NLT parser with actual API data.
 *
 * Run with: npx tsx src/services/__tests__/fixtures/fetch-nlt-fixtures.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'd74333ee-8951-45dc-9925-5074a8ad2f07';
const BASE_URL = 'https://api.nlt.to/api';

// Book name mappings for NLT API (some books need special handling)
const BOOK_NAME_MAPPINGS: Record<string, string> = {
  'Song of Solomon': 'Song',
  'Psalms': 'Psalm',
};

// All 66 books of the Bible - one chapter from each
const ALL_BOOKS_CHAPTERS = {
  // Old Testament - Pentateuch
  pentateuch: [
    'Genesis 1',
    'Exodus 20',        // Ten Commandments
    'Leviticus 19',     // Holiness code
    'Numbers 6',        // Priestly blessing
    'Deuteronomy 6',    // Shema
  ],

  // Old Testament - Historical Books
  historical: [
    'Joshua 1',
    'Judges 7',         // Gideon
    'Ruth 1',
    '1 Samuel 17',      // David and Goliath
    '2 Samuel 7',       // Davidic covenant
    '1 Kings 3',        // Solomon's wisdom
    '2 Kings 2',        // Elijah taken up
    '1 Chronicles 16',  // Ark brought to Jerusalem
    '2 Chronicles 7',   // Temple dedication
    'Ezra 1',
    'Nehemiah 1',
    'Esther 4',         // "For such a time as this"
  ],

  // Old Testament - Poetry/Wisdom
  poetryWisdom: [
    'Job 38',           // God answers Job
    'Psalm 23',         // Shepherd psalm
    'Proverbs 3',       // Trust in the Lord
    'Ecclesiastes 3',   // Time for everything
    'Song of Solomon 1', // Love poetry
  ],

  // Old Testament - Major Prophets
  majorProphets: [
    'Isaiah 53',        // Suffering servant
    'Jeremiah 31',      // New covenant
    'Lamentations 3',   // Great is thy faithfulness
    'Ezekiel 37',       // Valley of dry bones
    'Daniel 3',         // Fiery furnace
  ],

  // Old Testament - Minor Prophets
  minorProphets: [
    'Hosea 11',
    'Joel 2',           // Day of the Lord
    'Amos 5',
    'Obadiah 1',        // Single chapter
    'Jonah 1',
    'Micah 6',          // What does the Lord require?
    'Nahum 1',
    'Habakkuk 3',
    'Zephaniah 3',
    'Haggai 1',
    'Zechariah 9',
    'Malachi 3',
  ],

  // New Testament - Gospels
  gospels: [
    'Matthew 5',        // Sermon on the Mount
    'Mark 4',           // Parables
    'Luke 15',          // Prodigal Son
    'John 1',           // In the beginning was the Word
  ],

  // New Testament - Acts
  acts: [
    'Acts 2',           // Pentecost
  ],

  // New Testament - Pauline Epistles
  paulineEpistles: [
    'Romans 8',         // No condemnation
    '1 Corinthians 13', // Love chapter
    '2 Corinthians 12', // Thorn in the flesh
    'Galatians 5',      // Fruit of the Spirit
    'Ephesians 6',      // Armor of God
    'Philippians 4',    // Rejoice in the Lord
    'Colossians 3',     // Set your minds on things above
    '1 Thessalonians 4',
    '2 Thessalonians 2',
    '1 Timothy 6',
    '2 Timothy 2',
    'Titus 2',
    'Philemon 1',       // Single chapter
  ],

  // New Testament - General Epistles
  generalEpistles: [
    'Hebrews 11',       // Faith chapter
    'James 1',
    '1 Peter 2',
    '2 Peter 1',
    '1 John 4',         // God is love
    '2 John 1',         // Single chapter
    '3 John 1',         // Single chapter
    'Jude 1',           // Single chapter
  ],

  // New Testament - Revelation
  revelation: [
    'Revelation 21',    // New heaven and earth
  ],
};

// Convert reference to NLT API format
function convertToNLTFormat(reference: string): string {
  let formatted = reference;

  // Apply book name mappings first
  for (const [from, to] of Object.entries(BOOK_NAME_MAPPINGS)) {
    if (formatted.startsWith(from)) {
      formatted = formatted.replace(from, to);
      break;
    }
  }

  // Replace colons with dots
  formatted = formatted.replace(/:/g, '.');

  // For numbered books (1, 2, 3), keep space after number
  if (/^[123]\s+/.test(formatted)) {
    const parts = formatted.split(/\s+/);
    if (parts.length >= 2) {
      const bookName = parts[0] + ' ' + parts[1];
      const rest = parts.slice(2).join('.');
      formatted = rest ? bookName + '.' + rest : bookName;
    }
  } else {
    formatted = formatted.replace(/\s+/g, '.');
  }

  return formatted;
}

async function fetchChapter(reference: string): Promise<{ reference: string; html: string; error?: string }> {
  try {
    const nltReference = convertToNLTFormat(reference);
    const url = `${BASE_URL}/passages?ref=${encodeURIComponent(nltReference)}&version=NLT&key=${API_KEY}`;

    console.log(`  Fetching: ${reference} → ${nltReference}`);

    const response = await fetch(url);

    if (!response.ok) {
      return {
        reference,
        html: '',
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const html = await response.text();

    return { reference, html };
  } catch (error) {
    return {
      reference,
      html: '',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function fetchAllChapters(): Promise<void> {
  const outputDir = path.join(__dirname, 'nlt-responses');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const allResponses: Record<string, Record<string, { reference: string; html: string; error?: string }>> = {};
  const summary: Record<string, { total: number; success: number; failed: string[] }> = {};

  // Count total books
  const totalBooks = Object.values(ALL_BOOKS_CHAPTERS).flat().length;
  console.log(`\n📚 Fetching ${totalBooks} chapters (one from each book of the Bible)...\n`);

  for (const [category, chapters] of Object.entries(ALL_BOOKS_CHAPTERS)) {
    console.log(`\n📖 Fetching ${category} chapters...`);
    allResponses[category] = {};
    summary[category] = { total: chapters.length, success: 0, failed: [] };

    for (const chapter of chapters) {
      const result = await fetchChapter(chapter);
      const key = chapter.replace(/\s+/g, '_').replace(/:/g, '-');
      allResponses[category][key] = result;

      if (result.error) {
        console.log(`    ❌ ${chapter}: ${result.error}`);
        summary[category].failed.push(chapter);
      } else {
        console.log(`    ✅ ${chapter}: ${result.html.length} bytes`);
        summary[category].success++;
      }

      // Rate limiting - be nice to the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Save all responses as a single JSON file
  const allResponsesPath = path.join(outputDir, 'all-nlt-responses.json');
  fs.writeFileSync(allResponsesPath, JSON.stringify(allResponses, null, 2));
  console.log(`\n💾 Saved all responses to: ${allResponsesPath}`);

  // Save individual category files for easier testing
  for (const [category, responses] of Object.entries(allResponses)) {
    const categoryPath = path.join(outputDir, `${category}.json`);
    fs.writeFileSync(categoryPath, JSON.stringify(responses, null, 2));
  }

  // Save summary
  const summaryPath = path.join(outputDir, 'fetch-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  // Print summary
  console.log('\n📊 FETCH SUMMARY (All 66 Books):');
  console.log('─'.repeat(50));
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const [category, stats] of Object.entries(summary)) {
    console.log(`${category}: ${stats.success}/${stats.total} successful`);
    if (stats.failed.length > 0) {
      console.log(`  Failed: ${stats.failed.join(', ')}`);
    }
    totalSuccess += stats.success;
    totalFailed += stats.failed.length;
  }

  console.log('─'.repeat(50));
  console.log(`TOTAL: ${totalSuccess}/66 books successful, ${totalFailed} failed`);

  if (totalFailed > 0) {
    console.log('\n⚠️  Some books failed. Check the reference format mappings.');
  } else {
    console.log('\n✅ All 66 books fetched successfully!');
  }
}

// Run the fetcher
fetchAllChapters().catch(console.error);
