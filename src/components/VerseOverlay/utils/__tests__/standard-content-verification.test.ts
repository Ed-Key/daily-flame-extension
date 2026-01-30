/**
 * Standard Bible Content Verification Tests (KJV, ASV, WEB)
 *
 * Strategy: Compare UnifiedChapter (parsed data) → Rendered Output
 *
 * This test verifies that **every word** from parsed content appears in rendered
 * output for Standard Bible translations (KJV, ASV, WEB).
 *
 * Fields checked:
 * - verse.text: Contains ALL verse content
 * - verse.heading: Section headings rendered above verses
 * - verse.speakerLabels: Song of Solomon dialogue labels
 * - psalmMetadata.superscription: Psalm titles rendered at top of chapter
 *
 * Mirrors the NLT content verification pattern but uses StandardBibleParser.
 */

import * as fs from 'fs';
import * as path from 'path';
import { StandardBibleParser } from '../../../../services/parsers/standard-parser';
import { BibleTranslation } from '../../../../types';
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

interface StandardFixtureChapter {
  reference: string;
  bookName: string;
  chapter: number;
  translation: string;
  content: any;
  fetchedAt?: string;
}

interface StandardFixtures {
  [bookName: string]: {
    [chapter: string]: StandardFixtureChapter;
  };
}

// === TRANSLATION CONFIG ===

interface TranslationConfig {
  name: BibleTranslation;
  fixtureName: string;
  hasRedLetters: boolean;
}

const TRANSLATIONS: TranslationConfig[] = [
  { name: 'KJV', fixtureName: 'full-bible-kjv.json', hasRedLetters: true },
  { name: 'ASV', fixtureName: 'full-bible-asv.json', hasRedLetters: false },
  { name: 'WEB', fixtureName: 'full-bible-web.json', hasRedLetters: true },
];

// === FIXTURE LOADING ===

function loadFixtures(fixtureName: string): StandardFixtures | null {
  const fixturePath = path.join(__dirname, '../../../../services/__tests__/fixtures', fixtureName);
  if (!fs.existsSync(fixturePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
}

// === TESTS ===

describe('Standard Bible Content Verification', () => {
  // Run tests for each translation
  describe.each(TRANSLATIONS)('$name Content Verification', ({ name, fixtureName, hasRedLetters }) => {
    let fixtures: StandardFixtures | null;
    let parser: StandardBibleParser;

    beforeAll(() => {
      fixtures = loadFixtures(fixtureName);
      parser = new StandardBibleParser(name);
    });

    it('should render all parsed content without loss', () => {
      if (!fixtures) {
        console.log(`Skipping ${name} - fixtures not found: ${fixtureName}`);
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
            // 1. Parse to UnifiedChapter using StandardBibleParser
            const chapter = parser.parse(fixture.content);

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
      console.log(`${name} CONTENT VERIFICATION REPORT (Full Word Matching)`);
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

      expect(issues).toHaveLength(0);
    }, 120000); // 120 second timeout for full Bible verification

    it('should render all section headings', () => {
      if (!fixtures) return;

      const headingIssues: { reference: string; verseNum: string; heading: string; missing: string[] }[] = [];
      let totalHeadings = 0;

      for (const [bookName, chapters] of Object.entries(fixtures)) {
        for (const [chapterNum, fixture] of Object.entries(chapters)) {
          try {
            const chapter = parser.parse(fixture.content);
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

      console.log(`\n${name} - Total section headings checked: ${totalHeadings}`);

      if (headingIssues.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log(`${name} SECTION HEADING ISSUES`);
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
        // Check both "Psalm" and "Psalms" naming
        if (bookName !== 'Psalm' && bookName !== 'Psalms') continue;

        for (const [chapterNum, fixture] of Object.entries(chapters)) {
          try {
            const chapter = parser.parse(fixture.content);

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

      console.log(`\n${name} - Total psalm superscriptions checked: ${totalSuperscriptions}`);

      if (superscriptionIssues.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log(`${name} PSALM SUPERSCRIPTION ISSUES`);
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

    it('should render all speaker labels (Song of Solomon)', () => {
      if (!fixtures) return;

      const speakerIssues: { reference: string; verseNum: string; speaker: string; missing: string[] }[] = [];
      let totalSpeakerLabels = 0;

      for (const [bookName, chapters] of Object.entries(fixtures)) {
        // Only check Song of Solomon (only book with speaker labels)
        if (bookName !== 'Song of Solomon') continue;

        for (const [chapterNum, fixture] of Object.entries(chapters)) {
          try {
            const chapter = parser.parse(fixture.content);
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
          } catch (error) {
            // Skip chapters with parse errors
          }
        }
      }

      console.log(`\n${name} - Total speaker labels checked: ${totalSpeakerLabels}`);

      if (speakerIssues.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log(`${name} SPEAKER LABEL ISSUES`);
        console.log('='.repeat(60));
        for (const issue of speakerIssues) {
          console.log(`\n  ${issue.reference} verse ${issue.verseNum}:`);
          console.log(`    speaker: "${issue.speaker}"`);
          console.log(`    Missing words: [${issue.missing.join(', ')}]`);
        }
        console.log('\n' + '='.repeat(60) + '\n');
      }

      expect(speakerIssues).toHaveLength(0);
    }, 120000);
  });

  // Cross-translation summary test
  it('should provide cross-translation verification summary', () => {
    const summary: Record<string, {
      chapters: number;
      fields: number;
      words: number;
      issues: number;
    }> = {};

    for (const { name, fixtureName } of TRANSLATIONS) {
      const fixtures = loadFixtures(fixtureName);
      if (!fixtures) {
        summary[name] = { chapters: 0, fields: 0, words: 0, issues: 0 };
        continue;
      }

      const parser = new StandardBibleParser(name);
      let chapters = 0;
      let fields = 0;
      let words = 0;
      let issues = 0;

      for (const [bookName, bookChapters] of Object.entries(fixtures)) {
        for (const [chapterNum, fixture] of Object.entries(bookChapters)) {
          chapters++;

          try {
            const chapter = parser.parse(fixture.content);
            const expectedFields = extractExpectedContent(chapter);
            const renderedHTML = renderChapterToHTML(chapter);
            const renderedText = extractRenderedText(renderedHTML);

            for (const field of expectedFields) {
              fields++;
              const fieldWords = getWords(field.text);
              words += fieldWords.length;

              const result = verifyFieldRendered(field, renderedText);
              if (!result.found) {
                issues++;
              }
            }
          } catch (error) {
            issues++;
          }
        }
      }

      summary[name] = { chapters, fields, words, issues };
    }

    console.log('\n');
    console.log('='.repeat(70));
    console.log('CROSS-TRANSLATION CONTENT VERIFICATION SUMMARY');
    console.log('='.repeat(70));
    console.log('\n| Translation | Chapters | Fields | Words | Issues |');
    console.log('|-------------|----------|--------|-------|--------|');
    for (const [name, stats] of Object.entries(summary)) {
      console.log(`| ${name.padEnd(11)} | ${String(stats.chapters).padStart(8)} | ${String(stats.fields).padStart(6)} | ${String(stats.words).padStart(5)} | ${String(stats.issues).padStart(6)} |`);
    }
    console.log('\n' + '='.repeat(70) + '\n');

    // Verify all translations have expected chapter count (1,189 for full Bible)
    for (const { name } of TRANSLATIONS) {
      if (summary[name].chapters > 0) {
        expect(summary[name].chapters).toBe(1189);
      }
    }
  }, 300000); // 5 minute timeout for cross-translation summary
});
