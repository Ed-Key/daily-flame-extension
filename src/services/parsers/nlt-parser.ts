import { BaseBibleParser } from './base-parser';
import { UnifiedChapter } from '../../types/bible-formats';
import { NLTHTMLParser } from './nlt-html-parser';

/**
 * Parser for NLT (New Living Translation) Bible API
 *
 * Based on analysis of all 66 books, the NLT API returns 100% consistent HTML
 * with <verse_export> tags. This parser delegates to NLTHTMLParser for the
 * actual parsing work.
 *
 * API Response Format:
 * {
 *   passages: [{
 *     reference: "John 3",
 *     content: "<html>...<verse_export vn='1'>...</verse_export>...</html>"
 *   }]
 * }
 */
export class NLTBibleParser extends BaseBibleParser {
  private htmlParser: NLTHTMLParser;

  constructor() {
    super('NLT');
    this.htmlParser = new NLTHTMLParser();
  }

  /**
   * Parse NLT API response into unified format
   */
  parse(apiResponse: any): UnifiedChapter {
    this.debug('Parsing NLT format');

    if (!apiResponse || !apiResponse.passages || !apiResponse.passages[0]) {
      throw new Error('Invalid NLT API response: missing passages');
    }

    const passage = apiResponse.passages[0];

    // Parse the HTML content - NLTHTMLParser now handles Psalm metadata extraction internally
    const unifiedChapter = this.htmlParser.parseToUnified(passage.content, passage.reference);

    // Add metadata
    unifiedChapter.metadata = {
      copyright: '© 1996, 2004, 2015 by Tyndale House Foundation',
      translationName: 'New Living Translation'
    };

    // Extract musical notation from superscription if present
    if (unifiedChapter.psalmMetadata?.superscription) {
      const musicalMatch = unifiedChapter.psalmMetadata.superscription.match(
        /(For the (?:choir )?director[^.]*)/i
      );
      if (musicalMatch) {
        unifiedChapter.psalmMetadata.musicalNotation = musicalMatch[1];
      }
    }

    unifiedChapter.rawResponse = apiResponse;

    this.debug('Parsed NLT chapter', {
      reference: unifiedChapter.reference,
      verseCount: unifiedChapter.verses.length,
      isPsalm: !!unifiedChapter.psalmMetadata,
      hasSelah: unifiedChapter.psalmMetadata?.hasSelah
    });

    return unifiedChapter;
  }
}
