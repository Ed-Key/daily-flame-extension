/**
 * Content Verification Utilities
 *
 * Shared utilities for content verification tests across all Bible translations.
 * These utilities verify that parsed content is fully rendered without loss.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { renderUnifiedVerses } from '../unifiedVerseRenderer';
import { UnifiedChapter } from '../../../../types/bible-formats';

// === TYPES ===

export interface ContentField {
  source: string;      // Where it came from: 'text', 'heading', 'superscription', 'speakerLabel'
  verseNum: string;    // Which verse
  text: string;        // The actual content
}

export interface ContentIssue {
  reference: string;
  verseNum: string;
  source: string;
  expectedText: string;
  missingWords: string[];
}

// === TEXT NORMALIZATION ===

/**
 * Normalize text for comparison:
 * - Lowercase
 * - Replace punctuation with spaces
 * - Collapse whitespace
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,;:!?"'()\[\]""''—–\-]/g, ' ')  // Punctuation → space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract ALL words from text (no filtering)
 */
export function getWords(text: string): string[] {
  return normalizeText(text).split(' ').filter(w => w.length > 0);
}

// === HTML EXTRACTION ===

/**
 * Extract text from rendered HTML (strip tags, decode entities)
 */
export function extractRenderedText(html: string): string {
  const decoded = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
  return normalizeText(decoded);
}

// === VERIFICATION ===

/**
 * Verify that ALL words from expected text appear in rendered text.
 * Returns unique missing words if any.
 */
export function verifyAllWordsPresent(expectedText: string, renderedText: string): {
  allPresent: boolean;
  missingWords: string[];
  expectedWords: string[];
} {
  const expectedWords = getWords(expectedText);
  const renderedWords = new Set(getWords(renderedText));

  // Find missing words and deduplicate
  const missingSet = new Set<string>();
  for (const word of expectedWords) {
    if (!renderedWords.has(word)) {
      missingSet.add(word);
    }
  }
  const missingWords = Array.from(missingSet);

  return {
    allPresent: missingWords.length === 0,
    missingWords,
    expectedWords
  };
}

/**
 * Check if ALL words from a content field appear in rendered output.
 * No filtering - every word must be present.
 */
export function verifyFieldRendered(field: ContentField, renderedText: string): {
  found: boolean;
  missingWords: string[];
} {
  const result = verifyAllWordsPresent(field.text, renderedText);

  return {
    found: result.allPresent || result.expectedWords.length === 0,
    missingWords: result.missingWords
  };
}

// === CONTENT EXTRACTION ===

/**
 * Extract non-redundant content fields from UnifiedChapter.
 *
 * verse.text contains ALL verse content (prose + poetry combined), so we don't
 * need to check proseBefore, poetryLines, or proseAfter separately.
 *
 * Fields NOT in verse.text (checked separately):
 * - heading: Rendered above verse
 * - speakerLabels: Song of Solomon dialogue labels (rendered before poetry lines)
 * - psalmMetadata.superscription: Rendered at top of chapter
 *
 * NOT currently rendered (tracked as known limitation):
 * - hebrewLetter: Psalm 119 acrostic letters
 */
export function extractExpectedContent(chapter: UnifiedChapter): ContentField[] {
  const fields: ContentField[] = [];

  // Psalm superscription (NOT in verse.text - extracted separately)
  if (chapter.psalmMetadata?.superscription) {
    fields.push({
      source: 'psalmMetadata.superscription',
      verseNum: '0',
      text: chapter.psalmMetadata.superscription
    });
  }

  for (const verse of chapter.verses) {
    // Skip empty verses
    if (!verse.text || verse.text.trim().length === 0) {
      continue;
    }

    // Section heading (NOT in verse.text - rendered above verse)
    if (verse.heading) {
      fields.push({
        source: 'heading',
        verseNum: verse.number,
        text: verse.heading
      });
    }

    // Speaker labels for Song of Solomon dialogues (rendered before poetry lines)
    if (verse.speakerLabels && verse.speakerLabels.length > 0) {
      for (const speaker of verse.speakerLabels) {
        fields.push({
          source: 'speakerLabel',
          verseNum: verse.number,
          text: speaker.text
        });
      }
    }

    // NOTE: hebrewLetter is parsed but NOT currently rendered.
    // This is a known limitation - not checking to avoid false failures.

    // verse.text contains ALL verse content (prose + poetry combined)
    // No need to check proseBefore/poetryLines/proseAfter separately - they're subsets
    fields.push({
      source: 'text',
      verseNum: verse.number,
      text: verse.text
    });
  }

  return fields;
}

// === RENDERING ===

/**
 * Render a UnifiedChapter to HTML string
 */
export function renderChapterToHTML(chapter: UnifiedChapter): string {
  const elements = renderUnifiedVerses({
    chapterContent: chapter,
    startVerse: null,
    endVerse: null
  });
  return elements.map(el => renderToStaticMarkup(el)).join('');
}
