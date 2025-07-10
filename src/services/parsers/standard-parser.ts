import { BaseBibleParser } from './base-parser';
import { UnifiedChapter, UnifiedVerse } from '../../types/bible-formats';
import { BibleTranslation } from '../../types';

/**
 * Parser for standard Bible API format (KJV, ASV, WEB, etc.)
 * Handles the JSON format returned by scripture.api.bible
 */
export class StandardBibleParser extends BaseBibleParser {
  constructor(translation: BibleTranslation) {
    super(translation);
  }

  /**
   * Parse standard API JSON response into unified format
   * 
   * Expected input format:
   * {
   *   reference: "John 3",
   *   content: [
   *     {
   *       items: [
   *         { name: "1", text: "verse text" },
   *         { name: "2", text: "verse text" }
   *       ]
   *     }
   *   ]
   * }
   */
  parse(apiResponse: any): UnifiedChapter {
    this.debug('Parsing standard format', { translation: this.translation });

    if (!apiResponse || !apiResponse.reference) {
      throw new Error('Invalid API response: missing reference');
    }

    const { bookName, chapterNumber } = this.parseReference(apiResponse.reference);
    const verses: UnifiedVerse[] = [];

    // Extract verses from content array - handle the actual API structure
    if (apiResponse.content && Array.isArray(apiResponse.content)) {
      apiResponse.content.forEach((paragraph: any) => {
        // Each paragraph has items that contain verse tags and text
        if (paragraph.items && Array.isArray(paragraph.items)) {
          let currentVerseNumber = '';
          let currentVerseText = '';
          
          paragraph.items.forEach((item: any) => {
            // Check if this is a verse tag
            if (item.type === 'tag' && item.name === 'verse' && item.attrs?.number) {
              // If we have a previous verse, save it
              if (currentVerseNumber && currentVerseText) {
                verses.push(this.createVerse(
                  currentVerseNumber,
                  currentVerseText.trim(),
                  {
                    isFirstVerse: verses.length === 0,
                    isRedLetter: false
                  }
                ));
              }
              
              // Start new verse
              currentVerseNumber = item.attrs.number;
              currentVerseText = '';
            }
            // Check if this is text content
            else if (item.type === 'text' && item.text) {
              // Add text to current verse
              currentVerseText += item.text;
            }
            // Check if this is a char tag (special formatting)
            else if (item.type === 'tag' && item.name === 'char' && item.items) {
              // Extract text from char tag
              item.items.forEach((charItem: any) => {
                if (charItem.type === 'text' && charItem.text) {
                  currentVerseText += charItem.text;
                }
              });
            }
          });
          
          // Don't forget the last verse in the paragraph
          if (currentVerseNumber && currentVerseText) {
            verses.push(this.createVerse(
              currentVerseNumber,
              currentVerseText.trim(),
              {
                isFirstVerse: verses.length === 0,
                isRedLetter: false
              }
            ));
          }
        }
      });
    }

    // Also check the old format for backward compatibility
    if (verses.length === 0 && apiResponse.content && Array.isArray(apiResponse.content)) {
      // Try the simpler format that tests use
      apiResponse.content.forEach((section: any) => {
        if (section.items && Array.isArray(section.items)) {
          section.items.forEach((item: any, index: number) => {
            if (item.name && item.text && /^\d+$/.test(item.name.trim())) {
              const verse = this.createVerse(
                item.name.trim(),
                item.text,
                {
                  isFirstVerse: index === 0 && verses.length === 0,
                  isRedLetter: false
                }
              );
              verses.push(verse);
            }
          });
        }
      });
    }
    
    // Handle the case where items are directly at root level
    if (verses.length === 0 && apiResponse.items && Array.isArray(apiResponse.items)) {
      apiResponse.items.forEach((item: any, index: number) => {
        if (item.name && item.text && /^\d+$/.test(item.name.trim())) {
          const verse = this.createVerse(
            item.name.trim(),
            item.text,
            {
              isFirstVerse: index === 0,
              isRedLetter: false
            }
          );
          verses.push(verse);
        }
      });
    }

    if (verses.length === 0) {
      console.error('[StandardParser] No verses found. API response structure:', {
        hasContent: !!apiResponse.content,
        contentLength: Array.isArray(apiResponse.content) ? apiResponse.content.length : 'N/A',
        hasItems: !!apiResponse.items,
        itemsLength: Array.isArray(apiResponse.items) ? apiResponse.items.length : 'N/A',
        sampleContent: apiResponse.content?.[0]
      });
      throw new Error(`No verses found in API response for ${this.translation}`);
    }

    const unifiedChapter: UnifiedChapter = {
      reference: apiResponse.reference,
      translation: this.translation,
      bookName,
      chapterNumber,
      verses,
      metadata: {
        copyright: apiResponse.copyright,
        translationName: this.getTranslationFullName()
      },
      rawResponse: apiResponse
    };

    this.debug('Parsed chapter', {
      reference: unifiedChapter.reference,
      verseCount: verses.length,
      firstVerse: verses[0]?.text.substring(0, 50) + '...'
    });

    return unifiedChapter;
  }

  /**
   * Get full translation name for metadata
   */
  private getTranslationFullName(): string {
    const names: Record<string, string> = {
      'KJV': 'King James Version',
      'ASV': 'American Standard Version',
      'WEB': 'World English Bible',
      'WEB_BRITISH': 'World English Bible British Edition',
      'WEB_UPDATED': 'World English Bible Updated'
    };
    return names[this.translation] || this.translation;
  }
}