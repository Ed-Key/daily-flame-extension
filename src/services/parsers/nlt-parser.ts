import { BaseBibleParser } from './base-parser';
import { UnifiedChapter, PsalmMetadata } from '../../types/bible-formats';
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

    // Parse the HTML content
    const unifiedChapter = this.htmlParser.parseToUnified(passage.content, passage.reference);

    // Add metadata
    unifiedChapter.metadata = {
      copyright: '© 1996, 2004, 2015 by Tyndale House Foundation',
      translationName: 'New Living Translation'
    };

    // Check if this is a Psalm and extract Psalm-specific metadata
    const { bookName } = this.parseReference(passage.reference);
    const isPsalm = bookName.toLowerCase() === 'psalm' || bookName.toLowerCase() === 'psalms';

    if (isPsalm) {
      unifiedChapter.psalmMetadata = this.extractPsalmMetadata(passage.content, unifiedChapter.chapterNumber);
    }

    unifiedChapter.rawResponse = apiResponse;

    this.debug('Parsed NLT chapter', {
      reference: unifiedChapter.reference,
      verseCount: unifiedChapter.verses.length,
      isPsalm,
      hasSelah: unifiedChapter.psalmMetadata?.hasSelah
    });

    return unifiedChapter;
  }

  /**
   * Extract Psalm-specific metadata from NLT HTML
   */
  private extractPsalmMetadata(html: string, chapterNumber: string): PsalmMetadata {
    const parsedMetadata = this.htmlParser.extractPsalmMetadata(html);

    const metadata: PsalmMetadata = {
      psalmNumber: chapterNumber,
      hasSelah: parsedMetadata.hasSelah
    };

    if (parsedMetadata.superscription) {
      metadata.superscription = parsedMetadata.superscription;

      // Extract musical notation from superscription
      const musicalMatch = parsedMetadata.superscription.match(/(For the (?:choir )?director[^.]*)/i);
      if (musicalMatch) {
        metadata.musicalNotation = musicalMatch[1];
      }
    }

    // Convert Selah positions to section headings format for compatibility
    if (parsedMetadata.selahPositions.length > 0) {
      // Mark which verses have Selah after them
      // This information is also available in the verse data itself
    }

    // Store Hebrew letters if present (Psalm 119)
    if (parsedMetadata.hebrewLetters.length > 0) {
      metadata.acrosticLetters = parsedMetadata.hebrewLetters;
    }

    // Store book division if present (Psalm 1, 42, 73, 89, 107)
    if (parsedMetadata.bookDivision) {
      metadata.bookDivision = parsedMetadata.bookDivision;
    }

    return metadata;
  }
}
