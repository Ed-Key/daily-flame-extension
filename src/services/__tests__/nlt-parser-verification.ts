/**
 * NLT Parser Verification Script
 *
 * Tests the refactored NLT parser against real API fixtures.
 * Run with: npx tsx src/services/__tests__/nlt-parser-verification.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { NLTHTMLParser } from '../parsers/nlt-html-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new NLTHTMLParser();

interface TestResult {
  reference: string;
  success: boolean;
  verseCount: number;
  hasRedLetter: boolean;
  hasPoetry: boolean;
  hasSpeakerLabels: boolean;
  hasHebrewLetters: boolean;
  error?: string;
  sampleVerse?: string;
}

function testFixture(reference: string, html: string): TestResult {
  try {
    const result = parser.parseToUnified(html, reference);

    const hasRedLetter = result.verses.some(v => v.isRedLetter);
    const hasPoetry = result.verses.some(v => v.poetryIndentLevel && v.poetryIndentLevel > 0);
    const hasSpeakerLabels = result.verses.some(v => v.speakerLabels && v.speakerLabels.length > 0);
    const hasHebrewLetters = result.verses.some(v => v.hebrewLetter);

    return {
      reference,
      success: true,
      verseCount: result.verses.length,
      hasRedLetter,
      hasPoetry,
      hasSpeakerLabels,
      hasHebrewLetters,
      sampleVerse: result.verses[0]?.text.substring(0, 50) + '...'
    };
  } catch (error) {
    return {
      reference,
      success: false,
      verseCount: 0,
      hasRedLetter: false,
      hasPoetry: false,
      hasSpeakerLabels: false,
      hasHebrewLetters: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function testPsalmMetadata(reference: string, html: string) {
  const metadata = parser.extractPsalmMetadata(html);
  console.log(`\n📖 Psalm Metadata for ${reference}:`);
  console.log(`   Superscription: ${metadata.superscription || '(none)'}`);
  console.log(`   Has Selah: ${metadata.hasSelah}`);
  console.log(`   Selah positions: ${metadata.selahPositions.join(', ') || '(none)'}`);
  console.log(`   Hebrew letters: ${metadata.hebrewLetters.length > 0 ? metadata.hebrewLetters.map(l => l.letter).join(', ') : '(none)'}`);
  console.log(`   Book division: ${metadata.bookDivision || '(none)'}`);
}

async function runTests() {
  const fixturesDir = path.join(__dirname, 'fixtures/nlt-responses');

  console.log('═'.repeat(60));
  console.log('NLT Parser Verification');
  console.log('═'.repeat(60));

  const results: TestResult[] = [];

  // Test ALL fixture files to ensure complete coverage
  const allFixtureFiles = fs.readdirSync(fixturesDir)
    .filter(f => f.endsWith('.json') && f !== 'all-nlt-responses.json' && f !== 'fetch-summary.json');

  console.log(`\nFound ${allFixtureFiles.length} fixture files to test.\n`);

  const categoriesToTest = allFixtureFiles.map(file => ({ file }));

  for (const category of categoriesToTest) {
    const filePath = path.join(fixturesDir, category.file);
    if (!fs.existsSync(filePath)) {
      console.log(`\n⚠️  Fixture not found: ${category.file}`);
      continue;
    }

    console.log(`\n📁 Testing ${category.file}:`);
    const fixtures = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    for (const [key, data] of Object.entries(fixtures)) {
      const { reference, html } = data as { reference: string; html: string };
      if (!html) continue;

      const result = testFixture(reference, html);
      results.push(result);

      const status = result.success ? '✅' : '❌';
      const features = [
        result.hasRedLetter ? '🔴red' : '',
        result.hasPoetry ? '📜poetry' : '',
        result.hasSpeakerLabels ? '💬speaker' : '',
        result.hasHebrewLetters ? '🔤hebrew' : ''
      ].filter(Boolean).join(' ');

      console.log(`   ${status} ${reference}: ${result.verseCount} verses ${features}`);

      if (!result.success) {
        console.log(`      Error: ${result.error}`);
      }
    }
  }

  // Test Psalm metadata extraction specifically
  console.log('\n' + '─'.repeat(60));
  console.log('Psalm Metadata Extraction Tests:');
  console.log('─'.repeat(60));

  // Load psalms fixture if available
  const psalmsPath = path.join(fixturesDir, 'psalms.json');
  if (fs.existsSync(psalmsPath)) {
    const psalms = JSON.parse(fs.readFileSync(psalmsPath, 'utf-8'));

    // Test a few specific psalms
    for (const key of ['Psalm_23', 'Psalm_46', 'Psalm_51', 'Psalm_119', 'Psalm_1']) {
      if (psalms[key]) {
        testPsalmMetadata(psalms[key].reference, psalms[key].html);
      }
    }
  }

  // Test Song of Solomon speaker labels
  console.log('\n' + '─'.repeat(60));
  console.log('Song of Solomon Speaker Label Test:');
  console.log('─'.repeat(60));

  const wisdomPath = path.join(fixturesDir, 'poetryWisdom.json');
  if (fs.existsSync(wisdomPath)) {
    const wisdom = JSON.parse(fs.readFileSync(wisdomPath, 'utf-8'));
    if (wisdom['Song_of_Solomon_1']) {
      const result = parser.parseToUnified(wisdom['Song_of_Solomon_1'].html, 'Song of Solomon 1');
      const speakerVerses = result.verses.filter(v => v.speakerLabels && v.speakerLabels.length > 0);
      console.log(`\n   Found ${speakerVerses.length} verses with speaker labels:`);
      speakerVerses.forEach(v => {
        console.log(`      Verse ${v.number}: ${v.speakerLabels!.map(s => `"${s.text}" (before line ${s.beforeLineIndex})`).join(', ')}`);
      });
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const withRedLetter = results.filter(r => r.hasRedLetter).length;
  const withPoetry = results.filter(r => r.hasPoetry).length;
  const withSpeakers = results.filter(r => r.hasSpeakerLabels).length;
  const withHebrew = results.filter(r => r.hasHebrewLetters).length;

  console.log(`\nTotal tested: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\nFeature detection:`);
  console.log(`   🔴 Red letter: ${withRedLetter} chapters`);
  console.log(`   📜 Poetry: ${withPoetry} chapters`);
  console.log(`   💬 Speaker labels: ${withSpeakers} chapters`);
  console.log(`   🔤 Hebrew letters: ${withHebrew} chapters`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ${r.reference}: ${r.error}`);
    });
  } else {
    console.log('\n✅ All tests passed!');
  }
}

runTests().catch(console.error);
