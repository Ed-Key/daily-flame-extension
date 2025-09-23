import { VerseService } from '../verse-service';
import { loadVersesFromFile } from './verses-test-helpers';
import { BIBLE_VERSIONS, BibleTranslation } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

describe('All 90 Verses Test - REAL APIs', () => {
  it('should test all 90 verses from verses.json', async () => {
    const verses = loadVersesFromFile();
    const translations: BibleTranslation[] = ['ESV', 'NLT', 'KJV'];

    console.log('\n🚀 Testing ALL 90 verses with 3 translations (270 total API calls)');
    console.log('⏳ This will take about 2-3 minutes with rate limiting...\n');

    const results: any[] = [];
    let successCount = 0;
    let failureCount = 0;
    let currentVerse = 0;

    // Test each verse
    for (const verseData of verses) {
      currentVerse++;
      process.stdout.write(`\r[${currentVerse}/${verses.length}] Testing: ${verseData.reference.padEnd(20)}`);

      for (const translation of translations) {
        const bibleId = BIBLE_VERSIONS[translation];

        try {
          // Rate limit: 100ms between calls
          await new Promise(resolve => setTimeout(resolve, 100));

          const result = await VerseService.getVerse(verseData.reference, bibleId);

          results.push({
            verse: verseData.reference,
            translation,
            success: true,
            textLength: result.text.length
          });
          successCount++;

        } catch (error: any) {
          results.push({
            verse: verseData.reference,
            translation,
            success: false,
            error: error.message
          });
          failureCount++;

          // Log failures immediately
          console.log(`\n❌ FAILED: ${verseData.reference} (${translation}): ${error.message}`);
        }
      }
    }

    // Final summary
    console.log('\n\n========================================');
    console.log('📊 FINAL RESULTS:');
    console.log(`✅ Successful: ${successCount}/${results.length} (${Math.round((successCount/results.length)*100)}%)`);
    console.log(`❌ Failed: ${failureCount}/${results.length}`);

    // Group failures by translation
    const failuresByTranslation: Record<string, number> = {};
    translations.forEach(t => failuresByTranslation[t] = 0);

    results.filter(r => !r.success).forEach(r => {
      failuresByTranslation[r.translation]++;
    });

    console.log('\nFailures by translation:');
    Object.entries(failuresByTranslation).forEach(([trans, count]) => {
      console.log(`  ${trans}: ${count} failures`);
    });

    // List all failed verses
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('\n❌ Failed verse/translation combinations:');
      failures.forEach(f => {
        console.log(`  - ${f.verse} (${f.translation})`);
      });
    }

    // Save results to file
    const reportPath = path.join(__dirname, '../../../test-reports');
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(reportPath, `verse-test-results-${timestamp}.json`);

    fs.writeFileSync(filename, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
        successRate: Math.round((successCount/results.length)*100)
      },
      failuresByTranslation,
      results
    }, null, 2));

    console.log(`\n📁 Results saved to: ${filename}`);

    // Test passes if success rate is above 95%
    expect(successCount/results.length).toBeGreaterThan(0.95);

  }, 600000); // 10 minute timeout for 270 API calls
});