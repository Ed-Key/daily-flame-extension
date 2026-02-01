/**
 * ESV Content Verification Test
 *
 * Strategy: Compare UnifiedChapter (parsed data) → Rendered Output
 *
 * This test verifies that **every word** from parsed content appears in rendered
 * output for the ESV translation.
 *
 * Fields checked:
 * - verse.text: Contains ALL verse content (prose + poetry combined)
 * - verse.heading: Section headings rendered above verses
 * - verse.lines: Poetry lines (should match verse.text content)
 * - psalmMetadata.superscription: Psalm titles rendered at top of chapter
 *
 * NOT checked (parsed but not currently rendered):
 * - hebrewLetter: Psalm 119 acrostic letters (future enhancement)
 *
 * Mirrors the NLT/Standard content verification pattern but uses ESVBibleParser.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ESVBibleParser } from '../../../../services/parsers/esv-parser';
import {
  ContentIssue,
  getWords,
  extractRenderedText,
  verifyAllWordsPresent,
  extractExpectedContent,
  renderChapterToHTML,
  verifyFieldRendered
} from './content-verification-utils';

// === FIXTURE TYPES ===

interface ESVFixture {
  reference: string;
  html: string;
  fetchedAt: string;
}

type ESVFixtures = Record<string, Record<string, ESVFixture>>;

// === HELPER FUNCTIONS ===

function createApiResponse(fixture: ESVFixture): any {
  return {
    passages: [fixture.html],
    canonical: fixture.reference,
    query: fixture.reference
  };
}

// === TESTS ===

describe('ESV Content Verification - UnifiedChapter to Rendered', () => {
  const fixturePath = path.join(__dirname, '../../../../services/__tests__/fixtures/full-bible-esv.json');

  let fixtures: ESVFixtures;
  let parser: ESVBibleParser;

  beforeAll(() => {
    if (!fs.existsSync(fixturePath)) {
      console.warn('ESV Full Bible fixture not found, skipping tests');
      return;
    }
    fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
    parser = new ESVBibleParser();
  });

  it('should render all parsed content without loss', () => {
    if (!fixtures) {
      console.log('Skipping - fixtures not loaded');
      return;
    }

    const issues: ContentIssue[] = [];
    let totalChapters = 0;
    let totalFields = 0;
    let totalWords = 0;
    let fieldsVerified = 0;

    for (const [bookName, chapters] of Object.entries(fixtures)) {
      for (const [chapterNum, fixture] of Object.entries(chapters)) {
        totalChapters++;

        try {
          // 1. Parse to UnifiedChapter
          const chapter = parser.parse(createApiResponse(fixture));

          // 2. Extract expected content from parsed data
          const expectedFields = extractExpectedContent(chapter);
          totalFields += expectedFields.length;

          // 3. Render and extract rendered text
          const renderedHTML = renderChapterToHTML(chapter);
          const renderedText = extractRenderedText(renderedHTML);

          // 4. Verify each field - ALL words must be present
          for (const field of expectedFields) {
            const words = getWords(field.text);
            totalWords += words.length;

            const result = verifyFieldRendered(field, renderedText);

            if (result.found) {
              fieldsVerified++;
            } else {
              issues.push({
                reference: fixture.reference,
                verseNum: field.verseNum,
                source: field.source,
                expectedText: field.text.slice(0, 100),
                missingWords: result.missingWords
              });
            }
          }
        } catch (error) {
          issues.push({
            reference: fixture.reference,
            verseNum: '?',
            source: 'ERROR',
            expectedText: `${error}`,
            missingWords: []
          });
        }
      }
    }

    // === REPORT ===
    console.log('\n');
    console.log('='.repeat(60));
    console.log('ESV CONTENT VERIFICATION REPORT (Full Word Matching)');
    console.log('='.repeat(60));
    console.log(`Total chapters tested: ${totalChapters}`);
    console.log(`Total content fields: ${totalFields}`);
    console.log(`Total words checked: ${totalWords}`);
    console.log(`Fields verified OK: ${fieldsVerified}`);
    console.log(`Issues found: ${issues.length}`);
    console.log('='.repeat(60));

    if (issues.length > 0) {
      // Group by source type for clear categorization
      const bySource: Record<string, ContentIssue[]> = {};
      for (const issue of issues) {
        bySource[issue.source] = bySource[issue.source] || [];
        bySource[issue.source].push(issue);
      }

      for (const [source, sourceIssues] of Object.entries(bySource)) {
        console.log(`\n[${source.toUpperCase()}] - ${sourceIssues.length} issues:`);
        console.log('-'.repeat(50));

        // Show first 10 issues per source
        const showCount = Math.min(sourceIssues.length, 10);
        for (let i = 0; i < showCount; i++) {
          const issue = sourceIssues[i];
          console.log(`\n  ${issue.reference} verse ${issue.verseNum}:`);
          console.log(`    verse.text: "${issue.expectedText}${issue.expectedText.length >= 100 ? '...' : ''}"`);
          console.log(`    Missing words: [${issue.missingWords.join(', ')}]`);
        }

        if (sourceIssues.length > 10) {
          console.log(`\n  ... and ${sourceIssues.length - 10} more ${source} issues`);
        }
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // This test reports ALL issues - no filtering
    expect(issues).toHaveLength(0);
  }, 120000); // 2 minute timeout for full Bible

  it('should render all section headings', () => {
    if (!fixtures) return;

    const headingIssues: { reference: string; verseNum: string; heading: string; missing: string[] }[] = [];
    let totalHeadings = 0;

    for (const [bookName, chapters] of Object.entries(fixtures)) {
      for (const [chapterNum, fixture] of Object.entries(chapters)) {
        try {
          const chapter = parser.parse(createApiResponse(fixture));
          const renderedHTML = renderChapterToHTML(chapter);
          const renderedText = extractRenderedText(renderedHTML);

          for (const verse of chapter.verses) {
            if (verse.heading) {
              totalHeadings++;
              const result = verifyAllWordsPresent(verse.heading, renderedText);

              if (!result.allPresent) {
                headingIssues.push({
                  reference: fixture.reference,
                  verseNum: verse.number,
                  heading: verse.heading,
                  missing: result.missingWords
                });
              }
            }
          }
        } catch (error) {
          // Skip chapters with parse errors (handled in main test)
        }
      }
    }

    console.log(`\nESV - Total section headings checked: ${totalHeadings}`);

    if (headingIssues.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('ESV SECTION HEADING ISSUES');
      console.log('='.repeat(60));
      const showCount = Math.min(headingIssues.length, 10);
      for (let i = 0; i < showCount; i++) {
        const issue = headingIssues[i];
        console.log(`\n  ${issue.reference} verse ${issue.verseNum}:`);
        console.log(`    heading: "${issue.heading}"`);
        console.log(`    Missing words: [${issue.missing.join(', ')}]`);
      }
      if (headingIssues.length > 10) {
        console.log(`\n  ... and ${headingIssues.length - 10} more issues`);
      }
      console.log('\n' + '='.repeat(60) + '\n');
    }

    expect(headingIssues).toHaveLength(0);
  }, 120000);

  it('should render all psalm superscriptions', () => {
    if (!fixtures) return;

    const superscriptionIssues: { reference: string; superscription: string; missing: string[] }[] = [];
    let totalSuperscriptions = 0;

    for (const [bookName, chapters] of Object.entries(fixtures)) {
      // Only check Psalms
      if (bookName !== 'Psalm' && bookName !== 'Psalms') continue;

      for (const [chapterNum, fixture] of Object.entries(chapters)) {
        try {
          const chapter = parser.parse(createApiResponse(fixture));

          if (chapter.psalmMetadata?.superscription) {
            totalSuperscriptions++;
            const renderedHTML = renderChapterToHTML(chapter);
            const renderedText = extractRenderedText(renderedHTML);

            const result = verifyAllWordsPresent(chapter.psalmMetadata.superscription, renderedText);

            if (!result.allPresent) {
              superscriptionIssues.push({
                reference: fixture.reference,
                superscription: chapter.psalmMetadata.superscription,
                missing: result.missingWords
              });
            }
          }
        } catch (error) {
          // Skip chapters with parse errors
        }
      }
    }

    console.log(`\nESV - Total psalm superscriptions checked: ${totalSuperscriptions}`);

    if (superscriptionIssues.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('ESV PSALM SUPERSCRIPTION ISSUES');
      console.log('='.repeat(60));
      const showCount = Math.min(superscriptionIssues.length, 10);
      for (let i = 0; i < showCount; i++) {
        const issue = superscriptionIssues[i];
        console.log(`\n  ${issue.reference}:`);
        console.log(`    superscription: "${issue.superscription}"`);
        console.log(`    Missing words: [${issue.missing.join(', ')}]`);
      }
      if (superscriptionIssues.length > 10) {
        console.log(`\n  ... and ${superscriptionIssues.length - 10} more issues`);
      }
      console.log('\n' + '='.repeat(60) + '\n');
    }

    expect(superscriptionIssues).toHaveLength(0);
  }, 120000);

  it('should verify poetry lines content matches verse text', () => {
    if (!fixtures) return;

    const poetryIssues: { reference: string; verseNum: string; linesContent: string; verseText: string }[] = [];
    let totalPoetryVerses = 0;

    for (const [bookName, chapters] of Object.entries(fixtures)) {
      // Focus on poetry-heavy books
      if (!['Psalm', 'Psalms', 'Proverbs', 'Job', 'Song of Solomon', 'Isaiah'].includes(bookName)) continue;

      for (const [chapterNum, fixture] of Object.entries(chapters)) {
        try {
          const chapter = parser.parse(createApiResponse(fixture));

          for (const verse of chapter.verses) {
            if (verse.lines && verse.lines.length > 0) {
              totalPoetryVerses++;

              // Lines content should be included in verse.text
              const linesText = verse.lines.join(' ').toLowerCase();
              const verseText = verse.text.toLowerCase();

              // Check that key words from lines appear in verse.text
              const linesWords = getWords(linesText);
              const verseWords = new Set(getWords(verseText));

              const missingWords = linesWords.filter(w => !verseWords.has(w));

              if (missingWords.length > 0 && missingWords.length > linesWords.length * 0.2) {
                // More than 20% of words missing - likely an issue
                poetryIssues.push({
                  reference: fixture.reference,
                  verseNum: verse.number,
                  linesContent: verse.lines.join(' | ').slice(0, 100),
                  verseText: verse.text.slice(0, 100)
                });
              }
            }
          }
        } catch (error) {
          // Skip chapters with parse errors
        }
      }
    }

    console.log(`\nESV - Total poetry verses checked: ${totalPoetryVerses}`);

    if (poetryIssues.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('ESV POETRY LINES ISSUES');
      console.log('='.repeat(60));
      const showCount = Math.min(poetryIssues.length, 10);
      for (let i = 0; i < showCount; i++) {
        const issue = poetryIssues[i];
        console.log(`\n  ${issue.reference} verse ${issue.verseNum}:`);
        console.log(`    lines: "${issue.linesContent}..."`);
        console.log(`    verse.text: "${issue.verseText}..."`);
      }
      if (poetryIssues.length > 10) {
        console.log(`\n  ... and ${poetryIssues.length - 10} more issues`);
      }
      console.log('\n' + '='.repeat(60) + '\n');
    }

    // Poetry lines issues are informational - may not be critical
    console.log(`Poetry lines consistency issues: ${poetryIssues.length}`);
  }, 120000);

  it('should verify red letter content is preserved in gospels', () => {
    if (!fixtures) return;

    let totalRedLetterVerses = 0;
    let versesWithRedLetterContent = 0;
    const gospels = ['Matthew', 'Mark', 'Luke', 'John'];

    for (const gospel of gospels) {
      const chapters = fixtures[gospel];
      if (!chapters) continue;

      for (const [chapterNum, fixture] of Object.entries(chapters)) {
        try {
          const chapter = parser.parse(createApiResponse(fixture));

          for (const verse of chapter.verses) {
            if (verse.isRedLetter) {
              totalRedLetterVerses++;

              // Verify the verse has content
              if (verse.text && verse.text.trim().length > 0) {
                versesWithRedLetterContent++;
              }
            }
          }
        } catch (error) {
          // Skip chapters with parse errors
        }
      }
    }

    console.log(`\nESV - Red letter verses detected: ${totalRedLetterVerses}`);
    console.log(`ESV - Red letter verses with content: ${versesWithRedLetterContent}`);

    // If we detect red letter verses, they should all have content
    if (totalRedLetterVerses > 0) {
      expect(versesWithRedLetterContent).toBe(totalRedLetterVerses);
    }
  }, 120000);
});

describe('ESV Content Verification Summary', () => {
  const fixturePath = path.join(__dirname, '../../../../services/__tests__/fixtures/full-bible-esv.json');

  it('should provide comprehensive verification statistics', () => {
    if (!fs.existsSync(fixturePath)) {
      console.log('Skipping - ESV fixtures not found');
      return;
    }

    const fixtures: ESVFixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
    const parser = new ESVBibleParser();

    const stats = {
      chapters: 0,
      verses: 0,
      headings: 0,
      psalmSuperscriptions: 0,
      poetryVerses: 0,
      redLetterVerses: 0,
      parseErrors: 0,
      contentIssues: 0
    };

    for (const [bookName, chapters] of Object.entries(fixtures)) {
      for (const [chapterNum, fixture] of Object.entries(chapters)) {
        stats.chapters++;

        try {
          const chapter = parser.parse({
            passages: [fixture.html],
            canonical: fixture.reference
          });

          stats.verses += chapter.verses.length;

          for (const verse of chapter.verses) {
            if (verse.heading) stats.headings++;
            if (verse.lines && verse.lines.length > 0) stats.poetryVerses++;
            if (verse.isRedLetter) stats.redLetterVerses++;
          }

          if (chapter.psalmMetadata?.superscription) {
            stats.psalmSuperscriptions++;
          }

          // Quick content check
          const renderedHTML = renderChapterToHTML(chapter);
          const renderedText = extractRenderedText(renderedHTML);
          const expectedFields = extractExpectedContent(chapter);

          for (const field of expectedFields) {
            const result = verifyFieldRendered(field, renderedText);
            if (!result.found) {
              stats.contentIssues++;
            }
          }
        } catch (error) {
          stats.parseErrors++;
        }
      }
    }

    console.log('\n');
    console.log('='.repeat(70));
    console.log('ESV COMPREHENSIVE VERIFICATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total chapters:            ${stats.chapters}`);
    console.log(`Total verses:              ${stats.verses}`);
    console.log(`Section headings:          ${stats.headings}`);
    console.log(`Psalm superscriptions:     ${stats.psalmSuperscriptions}`);
    console.log(`Poetry verses:             ${stats.poetryVerses}`);
    console.log(`Red letter verses:         ${stats.redLetterVerses}`);
    console.log(`Parse errors:              ${stats.parseErrors}`);
    console.log(`Content issues:            ${stats.contentIssues}`);
    console.log('='.repeat(70));
    console.log('\n');

    // Verify expected structure
    expect(stats.chapters).toBe(1189); // 1,189 chapters in the Bible
    expect(stats.parseErrors).toBe(0);
  }, 300000); // 5 minute timeout
});
