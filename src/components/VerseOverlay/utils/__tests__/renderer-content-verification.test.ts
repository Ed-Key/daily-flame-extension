/**
 * NLT Content Verification Test
 *
 * Strategy: Compare UnifiedChapter (parsed data) → Rendered Output
 *
 * This test verifies that **every word** from parsed content appears in rendered
 * output. No filtering of "common words" or "short words" - if it's in verse.text,
 * it should be in the rendered HTML.
 *
 * Fields checked:
 * - verse.text: Contains ALL verse content (prose + poetry combined)
 * - verse.heading: Section headings rendered above verses
 * - verse.speakerLabels: Song of Solomon dialogue labels (e.g., "Young Woman")
 * - psalmMetadata.superscription: Psalm titles rendered at top of chapter
 *
 * NOT checked (parsed but not currently rendered):
 * - hebrewLetter: Psalm 119 acrostic letters (future enhancement)
 */

import * as fs from 'fs';
import * as path from 'path';
import { NLTHTMLParser } from '../../../../services/parsers/nlt-html-parser';
import {
  ContentIssue,
  normalizeText,
  getWords,
  extractRenderedText,
  verifyAllWordsPresent,
  extractExpectedContent,
  renderChapterToHTML,
  verifyFieldRendered
} from './content-verification-utils';

// === TESTS ===

describe('Content Verification - UnifiedChapter to Rendered', () => {
  const fixturePath = path.join(__dirname, '../../../../services/__tests__/fixtures/full-bible-nlt.json');

  let fixtures: Record<string, Record<string, { reference: string; html: string }>>;
  let parser: NLTHTMLParser;

  beforeAll(() => {
    if (!fs.existsSync(fixturePath)) {
      console.warn('Full Bible fixture not found, skipping tests');
      return;
    }
    fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
    parser = new NLTHTMLParser();
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
          const chapter = parser.parseToUnified(fixture.html, fixture.reference);

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
    console.log('NLT CONTENT VERIFICATION REPORT (Full Word Matching)');
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

        // Show all issues with full detail
        for (const issue of sourceIssues) {
          console.log(`\n  ${issue.reference} verse ${issue.verseNum}:`);
          console.log(`    verse.text: "${issue.expectedText}${issue.expectedText.length >= 100 ? '...' : ''}"`);
          console.log(`    Missing words: [${issue.missingWords.join(', ')}]`);
        }
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // This test reports ALL issues - no filtering
    // Review the output to categorize issues as:
    // - Rendering bugs (fix the renderer)
    // - Parser bugs (content shouldn't be in verse.text)
    // - Test normalization issues (edge cases in word extraction)
    expect(issues).toHaveLength(0);
  });

  it('should render all section headings', () => {
    if (!fixtures) return;

    const headingIssues: { reference: string; verseNum: string; heading: string; missing: string[] }[] = [];

    for (const [bookName, chapters] of Object.entries(fixtures)) {
      for (const [chapterNum, fixture] of Object.entries(chapters)) {
        const chapter = parser.parseToUnified(fixture.html, fixture.reference);
        const renderedHTML = renderChapterToHTML(chapter);
        const renderedText = extractRenderedText(renderedHTML);

        for (const verse of chapter.verses) {
          if (verse.heading) {
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
      }
    }

    if (headingIssues.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('SECTION HEADING ISSUES');
      console.log('='.repeat(60));
      for (const issue of headingIssues) {
        console.log(`\n  ${issue.reference} verse ${issue.verseNum}:`);
        console.log(`    heading: "${issue.heading}"`);
        console.log(`    Missing words: [${issue.missing.join(', ')}]`);
      }
      console.log('\n' + '='.repeat(60) + '\n');
    }

    expect(headingIssues).toHaveLength(0);
  });

  it('should render all psalm superscriptions', () => {
    if (!fixtures) return;

    const superscriptionIssues: { reference: string; superscription: string; missing: string[] }[] = [];

    for (const [bookName, chapters] of Object.entries(fixtures)) {
      // Only check Psalms
      if (bookName !== 'Psalms') continue;

      for (const [chapterNum, fixture] of Object.entries(chapters)) {
        const chapter = parser.parseToUnified(fixture.html, fixture.reference);

        if (chapter.psalmMetadata?.superscription) {
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
      }
    }

    if (superscriptionIssues.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('PSALM SUPERSCRIPTION ISSUES');
      console.log('='.repeat(60));
      for (const issue of superscriptionIssues) {
        console.log(`\n  ${issue.reference}:`);
        console.log(`    superscription: "${issue.superscription}"`);
        console.log(`    Missing words: [${issue.missing.join(', ')}]`);
      }
      console.log('\n' + '='.repeat(60) + '\n');
    }

    expect(superscriptionIssues).toHaveLength(0);
  });

  it('should render all speaker labels (Song of Solomon)', () => {
    if (!fixtures) return;

    const speakerIssues: { reference: string; verseNum: string; speaker: string; missing: string[] }[] = [];
    let totalSpeakerLabels = 0;

    for (const [bookName, chapters] of Object.entries(fixtures)) {
      // Only check Song of Solomon (only book with speaker labels)
      if (bookName !== 'Song of Solomon') continue;

      for (const [chapterNum, fixture] of Object.entries(chapters)) {
        const chapter = parser.parseToUnified(fixture.html, fixture.reference);
        const renderedHTML = renderChapterToHTML(chapter);
        const renderedText = extractRenderedText(renderedHTML);

        for (const verse of chapter.verses) {
          if (verse.speakerLabels && verse.speakerLabels.length > 0) {
            for (const speaker of verse.speakerLabels) {
              totalSpeakerLabels++;
              const result = verifyAllWordsPresent(speaker.text, renderedText);

              if (!result.allPresent) {
                speakerIssues.push({
                  reference: fixture.reference,
                  verseNum: verse.number,
                  speaker: speaker.text,
                  missing: result.missingWords
                });
              }
            }
          }
        }
      }
    }

    console.log(`\nTotal speaker labels checked: ${totalSpeakerLabels}`);

    if (speakerIssues.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('SPEAKER LABEL ISSUES');
      console.log('='.repeat(60));
      for (const issue of speakerIssues) {
        console.log(`\n  ${issue.reference} verse ${issue.verseNum}:`);
        console.log(`    speaker: "${issue.speaker}"`);
        console.log(`    Missing words: [${issue.missing.join(', ')}]`);
      }
      console.log('\n' + '='.repeat(60) + '\n');
    }

    expect(speakerIssues).toHaveLength(0);
  });
});
