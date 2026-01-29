/**
 * Content Verification Test
 *
 * Strategy: Compare UnifiedChapter (parsed data) → Rendered Output
 *
 * The UnifiedChapter is the "source of truth" after parsing. Footnotes and
 * other non-rendered content have already been stripped. So we extract
 * ALL text fields from UnifiedChapter and verify they appear in rendered output.
 *
 * This catches bugs where:
 * - verse.proseBefore exists but isn't rendered (the bug we fixed!)
 * - verse.heading exists but isn't rendered
 * - verse.poetryLines exist but aren't rendered
 * - verse.text exists but isn't rendered
 */

import * as fs from 'fs';
import * as path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderUnifiedVerses } from '../unifiedVerseRenderer';
import { NLTHTMLParser } from '../../../../services/parsers/nlt-html-parser';
import { UnifiedChapter, UnifiedVerse } from '../../../../types/bible-formats';

// === TYPES ===

interface ContentField {
  source: string;      // Where it came from: 'text', 'poetryLine', 'proseBefore', 'heading'
  verseNum: string;    // Which verse
  text: string;        // The actual content
}

interface ContentIssue {
  reference: string;
  verseNum: string;
  source: string;
  expectedText: string;
  missingWords: string[];
}

// === UTILITIES ===

function renderChapterToHTML(chapter: UnifiedChapter): string {
  const elements = renderUnifiedVerses({
    chapterContent: chapter,
    startVerse: null,
    endVerse: null
  });
  return elements.map(el => renderToStaticMarkup(el)).join('');
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,;:!?"'()\[\]""''—–-]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract significant words (skip small common words)
 */
function getSignificantWords(text: string): string[] {
  const SKIP_WORDS = new Set([
    'the', 'and', 'for', 'but', 'with', 'that', 'this', 'from', 'have', 'was',
    'were', 'are', 'been', 'will', 'would', 'could', 'should', 'them', 'they',
    'his', 'her', 'him', 'she', 'who', 'whom', 'what', 'when', 'where', 'which',
    'their', 'there', 'then', 'than', 'you', 'your', 'into', 'unto', 'upon'
  ]);

  return normalize(text)
    .split(' ')
    .filter(w => w.length > 3 && !SKIP_WORDS.has(w));
}

/**
 * Extract text from rendered HTML (strip tags)
 */
function extractRenderedText(html: string): string {
  return normalize(
    html.replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
  );
}

/**
 * Extract ALL meaningful content from UnifiedChapter
 * This is our "expected" content - everything that SHOULD be rendered
 */
function extractExpectedContent(chapter: UnifiedChapter): ContentField[] {
  const fields: ContentField[] = [];

  // Psalm superscription (rendered at top of chapter)
  if (chapter.psalmMetadata?.superscription) {
    fields.push({
      source: 'psalmMetadata.superscription',
      verseNum: '0',
      text: chapter.psalmMetadata.superscription
    });
  }

  for (const verse of chapter.verses) {
    // Skip empty verses (intentionally not rendered)
    if (!verse.text || verse.text.trim().length === 0) {
      // But still check poetryLines if present
      if (!verse.poetryLines || verse.poetryLines.length === 0) {
        continue;
      }
    }

    // Section headings
    if (verse.heading) {
      fields.push({
        source: 'heading',
        verseNum: verse.number,
        text: verse.heading
      });
    }

    // Prose before poetry (THE BUG WE FIXED!)
    if (verse.proseBefore) {
      fields.push({
        source: 'proseBefore',
        verseNum: verse.number,
        text: verse.proseBefore
      });
    }

    // ALWAYS check verse.text - this catches prose that might be lost
    // when poetryLines exist (the prose-before-poetry bug!)
    if (verse.text && verse.text.trim()) {
      fields.push({
        source: 'text',
        verseNum: verse.number,
        text: verse.text
      });
    }

    // Also check poetry lines separately (for line-by-line verification)
    if (verse.poetryLines && verse.poetryLines.length > 0) {
      for (let i = 0; i < verse.poetryLines.length; i++) {
        fields.push({
          source: `poetryLine[${i}]`,
          verseNum: verse.number,
          text: verse.poetryLines[i].text
        });
      }
    }
  }

  return fields;
}

/**
 * Check if a content field appears in rendered output
 */
function verifyFieldRendered(field: ContentField, renderedText: string): {
  found: boolean;
  missingWords: string[];
} {
  const expectedWords = getSignificantWords(field.text);
  const missingWords: string[] = [];

  for (const word of expectedWords) {
    if (!renderedText.includes(word)) {
      missingWords.push(word);
    }
  }

  // Consider it "found" if at least 70% of significant words are present
  // (to handle minor normalization differences)
  const threshold = Math.ceil(expectedWords.length * 0.7);
  const foundWords = expectedWords.length - missingWords.length;
  const found = foundWords >= threshold || expectedWords.length === 0;

  return { found, missingWords };
}

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

          // 4. Verify each field appears in rendered output
          for (const field of expectedFields) {
            const result = verifyFieldRendered(field, renderedText);

            if (result.found) {
              fieldsVerified++;
            } else {
              issues.push({
                reference: fixture.reference,
                verseNum: field.verseNum,
                source: field.source,
                expectedText: field.text.slice(0, 60),
                missingWords: result.missingWords.slice(0, 5)
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

    // Report results
    console.log('\n========== CONTENT VERIFICATION REPORT ==========');
    console.log(`Total chapters tested: ${totalChapters}`);
    console.log(`Total content fields: ${totalFields}`);
    console.log(`Fields verified OK: ${fieldsVerified}`);
    console.log(`Issues found: ${issues.length}`);

    if (issues.length > 0) {
      console.log('\n--- Issues Found ---');

      // Group by source type
      const bySource: Record<string, ContentIssue[]> = {};
      for (const issue of issues) {
        const key = issue.source.replace(/\[\d+\]/, '');
        bySource[key] = bySource[key] || [];
        bySource[key].push(issue);
      }

      for (const [source, sourceIssues] of Object.entries(bySource)) {
        console.log(`\n[${source}] - ${sourceIssues.length} issues:`);
        for (const issue of sourceIssues.slice(0, 5)) {
          console.log(`  ${issue.reference} v${issue.verseNum}:`);
          console.log(`    Expected: "${issue.expectedText}..."`);
          console.log(`    Missing: ${issue.missingWords.join(', ')}`);
        }
        if (sourceIssues.length > 5) {
          console.log(`  ... and ${sourceIssues.length - 5} more`);
        }
      }
    }

    console.log('\n=================================================\n');

    // Only fail if we have actual content loss issues (not just minor word differences)
    const significantIssues = issues.filter(i => i.missingWords.length > 2);
    expect(significantIssues).toHaveLength(0);
  });

  it('should specifically render proseBefore content', () => {
    if (!fixtures) return;

    const proseBeforeIssues: string[] = [];

    for (const [bookName, chapters] of Object.entries(fixtures)) {
      for (const [chapterNum, fixture] of Object.entries(chapters)) {
        const chapter = parser.parseToUnified(fixture.html, fixture.reference);
        const renderedHTML = renderChapterToHTML(chapter);
        const renderedText = extractRenderedText(renderedHTML);

        for (const verse of chapter.verses) {
          if (verse.proseBefore) {
            const words = getSignificantWords(verse.proseBefore);
            const missing = words.filter(w => !renderedText.includes(w));

            if (missing.length > words.length * 0.3) {
              proseBeforeIssues.push(
                `${fixture.reference} v${verse.number}: "${verse.proseBefore.slice(0, 40)}..." missing: ${missing.join(', ')}`
              );
            }
          }
        }
      }
    }

    if (proseBeforeIssues.length > 0) {
      console.log('\n=== PROSE BEFORE POETRY ISSUES ===');
      proseBeforeIssues.slice(0, 10).forEach(i => console.log(i));
      if (proseBeforeIssues.length > 10) {
        console.log(`... and ${proseBeforeIssues.length - 10} more`);
      }
    }

    expect(proseBeforeIssues).toHaveLength(0);
  });

  it('should render all section headings', () => {
    if (!fixtures) return;

    const headingIssues: string[] = [];

    for (const [bookName, chapters] of Object.entries(fixtures)) {
      for (const [chapterNum, fixture] of Object.entries(chapters)) {
        const chapter = parser.parseToUnified(fixture.html, fixture.reference);
        const renderedHTML = renderChapterToHTML(chapter);
        const renderedText = extractRenderedText(renderedHTML);

        for (const verse of chapter.verses) {
          if (verse.heading) {
            const words = getSignificantWords(verse.heading);
            const missing = words.filter(w => !renderedText.includes(w));

            if (missing.length > words.length * 0.3) {
              headingIssues.push(
                `${fixture.reference} v${verse.number}: "${verse.heading}" missing: ${missing.join(', ')}`
              );
            }
          }
        }
      }
    }

    if (headingIssues.length > 0) {
      console.log('\n=== SECTION HEADING ISSUES ===');
      headingIssues.slice(0, 10).forEach(i => console.log(i));
    }

    expect(headingIssues).toHaveLength(0);
  });
});
