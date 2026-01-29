import { BaseBibleParser } from './base-parser';
import { UnifiedChapter, UnifiedVerse, PsalmMetadata, Footnote } from '../../types/bible-formats';
import { BibleTranslation } from '../../types';

/**
 * Parser for standard Bible API format (KJV, ASV, WEB, etc.)
 * Handles the JSON format returned by scripture.api.bible
 *
 * Supports extraction of:
 * - Red letters (style: "wj") - Words of Jesus
 * - Footnotes (note style: "f") - Hebrew/Greek notes
 * - Cross-references (note style: "x") - WEB only
 * - Divine names (style: "nd") - LORD in small caps
 * - Added words (style: "add") - Translator additions (italics)
 * - Section headings (style: "s1/s2") - Chapter subdivisions
 * - Speaker labels (style: "sp") - Song of Solomon
 */
export class StandardBibleParser extends BaseBibleParser {
  constructor(translation: BibleTranslation) {
    super(translation);
  }

  /**
   * Extract text content from a nested char tag within a note
   */
  private extractCharText(noteItem: any, style: string): string {
    if (!noteItem.items) return '';

    const charTag = noteItem.items.find(
      (i: any) => i.name === 'char' && i.attrs?.style === style
    );
    if (!charTag || !charTag.items) return '';

    return charTag.items
      .filter((t: any) => t.type === 'text')
      .map((t: any) => t.text || '')
      .join('');
  }

  /**
   * Classify footnote type based on its content
   */
  private classifyFootnoteType(content: string): Footnote['type'] {
    const lc = content.toLowerCase();
    if (lc.includes('heb.') || lc.includes('hebrew')) return 'hebrew';
    if (lc.includes('gr.') || lc.includes('greek')) return 'greek';
    if (lc.startsWith('or ') || lc.includes(' or ')) return 'alternative';
    if (lc.includes('manuscript')) return 'textualVariant';
    if (lc.includes('compare') || lc.includes('see ')) return 'cross-ref';
    return 'other';
  }

  /**
   * Extract footnote from a note tag
   */
  private extractFootnote(noteItem: any): Footnote | null {
    if (!noteItem.attrs) return null;

    const style = noteItem.attrs.style;

    // Handle footnotes (style: "f")
    if (style === 'f') {
      const reference = this.extractCharText(noteItem, 'fr').trim();
      const content = this.extractCharText(noteItem, 'ft').trim();

      if (!content) return null;

      return {
        marker: noteItem.attrs.caller || '*',
        reference,
        content,
        type: this.classifyFootnoteType(content)
      };
    }

    // Handle cross-references (style: "x") - WEB only
    if (style === 'x') {
      const reference = this.extractCharText(noteItem, 'xo').trim();
      const content = this.extractCharText(noteItem, 'xt').trim();

      if (!content) return null;

      return {
        marker: noteItem.attrs.caller || '†',
        reference,
        content,
        type: 'cross-ref'
      };
    }

    return null;
  }

  /**
   * Recursively extract text and formatting info from items array
   */
  private extractTextWithFormatting(items: any[]): {
    text: string;
    isRedLetter: boolean;
    footnotes: Footnote[];
  } {
    let text = '';
    let isRedLetter = false;
    const footnotes: Footnote[] = [];

    for (const item of items) {
      if (item.type === 'text' && item.text) {
        text += item.text;
      } else if (item.name === 'char' && item.items) {
        // Check for Words of Jesus (red letter)
        if (item.attrs?.style === 'wj') {
          isRedLetter = true;
        }

        // Recursively extract text from char tag
        const nested = this.extractTextWithFormatting(item.items);
        text += nested.text;
        if (nested.isRedLetter) isRedLetter = true;
        footnotes.push(...nested.footnotes);
      } else if (item.name === 'note') {
        // Extract footnote but don't add to text
        const footnote = this.extractFootnote(item);
        if (footnote) {
          footnotes.push(footnote);
        }
      }
    }

    return { text, isRedLetter, footnotes };
  }

  /**
   * Extract text from a paragraph (for headings, speaker labels)
   */
  private extractParagraphText(paragraph: any): string {
    if (!paragraph.items) return '';

    return paragraph.items
      .filter((item: any) => item.type === 'text')
      .map((item: any) => item.text || '')
      .join('')
      .trim();
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
    
    // Check if this is a Psalm
    const isPsalm = bookName.toLowerCase() === 'psalm' || bookName.toLowerCase() === 'psalms';
    
    // Extract Psalm metadata if applicable
    let psalmMetadata: PsalmMetadata | undefined;
    if (isPsalm) {
      psalmMetadata = this.extractPsalmMetadata(apiResponse, chapterNumber);
    }
    
    const verses: UnifiedVerse[] = [];

    // Track current heading and speaker label for assignment to verses
    let currentHeading: string | undefined;
    let currentSpeakerLabel: string | undefined;

    // Extract verses from content array - handle the actual API structure
    if (apiResponse.content && Array.isArray(apiResponse.content)) {
      apiResponse.content.forEach((paragraph: any) => {
        const paraStyle = paragraph.attrs?.style;

        // Check for section headings (s1, s2, s3) - extract for all chapters, not just Psalms
        if (['s1', 's2', 's3'].includes(paraStyle)) {
          const headingText = this.extractParagraphText(paragraph);
          if (headingText) {
            currentHeading = headingText;
          }
          return; // Don't process this paragraph further
        }

        // Check for speaker labels (sp) - Song of Solomon
        if (paraStyle === 'sp') {
          const speakerText = this.extractParagraphText(paragraph);
          if (speakerText) {
            currentSpeakerLabel = speakerText;
          }
          return; // Don't process this paragraph further
        }

        // Skip blank lines (b) and Psalm titles (d) - d is handled in extractPsalmMetadata
        if (paraStyle === 'b' || (paraStyle === 'd' && isPsalm)) {
          return;
        }

        // Each paragraph has items that contain verse tags and text
        if (paragraph.items && Array.isArray(paragraph.items)) {
          let currentVerseNumber = '';
          let currentVerseText = '';
          let currentVerseIsRedLetter = false;
          let currentVerseFootnotes: Footnote[] = [];

          paragraph.items.forEach((item: any) => {
            // Check if this is a verse tag
            if (item.type === 'tag' && item.name === 'verse' && item.attrs?.number) {
              // If we have a previous verse, save it
              if (currentVerseNumber && currentVerseText) {
                const verseOptions: any = {
                  isFirstVerse: verses.length === 0,
                  isRedLetter: currentVerseIsRedLetter,
                  footnotes: currentVerseFootnotes.length > 0 ? currentVerseFootnotes : undefined,
                  heading: currentHeading,
                  speakerLabels: currentSpeakerLabel ? [{ text: currentSpeakerLabel, beforeLineIndex: 0 }] : undefined
                };

                // Clear heading/speaker after assigning to first verse
                currentHeading = undefined;
                currentSpeakerLabel = undefined;

                // Add Psalm-specific attributes
                if (isPsalm) {
                  // Check for Selah
                  if (/\bSelah\b/i.test(currentVerseText)) {
                    verseOptions.isSelah = true;
                  }

                  // Check for poetry markers in the paragraph style
                  if (paraStyle === 'q1') {
                    verseOptions.poetryIndentLevel = 1;
                  } else if (paraStyle === 'q2') {
                    verseOptions.poetryIndentLevel = 2;
                  }
                }

                verses.push(this.createVerse(
                  currentVerseNumber,
                  currentVerseText.trim(),
                  verseOptions
                ));
              }

              // Start new verse
              currentVerseNumber = item.attrs.number;
              currentVerseText = '';
              currentVerseIsRedLetter = false;
              currentVerseFootnotes = [];
            }
            // Check if this is text content
            else if (item.type === 'text' && item.text) {
              // Add text to current verse
              currentVerseText += item.text;
            }
            // Check if this is a char tag (special formatting)
            else if (item.type === 'tag' && item.name === 'char' && item.items) {
              // Check for Words of Jesus (red letter)
              if (item.attrs?.style === 'wj') {
                currentVerseIsRedLetter = true;
              }

              // Extract text recursively, handling nested char tags
              const extracted = this.extractTextWithFormatting(item.items);
              currentVerseText += extracted.text;
              if (extracted.isRedLetter) currentVerseIsRedLetter = true;
              currentVerseFootnotes.push(...extracted.footnotes);
            }
            // Check if this is a note tag (footnotes, cross-references)
            else if (item.type === 'tag' && item.name === 'note') {
              const footnote = this.extractFootnote(item);
              if (footnote) {
                currentVerseFootnotes.push(footnote);
              }
            }
          });

          // Don't forget the last verse in the paragraph
          if (currentVerseNumber && currentVerseText) {
            const verseOptions: any = {
              isFirstVerse: verses.length === 0,
              isRedLetter: currentVerseIsRedLetter,
              footnotes: currentVerseFootnotes.length > 0 ? currentVerseFootnotes : undefined,
              heading: currentHeading,
              speakerLabels: currentSpeakerLabel ? [{ text: currentSpeakerLabel, beforeLineIndex: 0 }] : undefined
            };

            // Clear heading/speaker after assigning
            currentHeading = undefined;
            currentSpeakerLabel = undefined;

            // Add Psalm-specific attributes
            if (isPsalm) {
              // Check for Selah
              if (/\bSelah\b/i.test(currentVerseText)) {
                verseOptions.isSelah = true;
              }

              // Check for poetry markers in the paragraph style
              if (paraStyle === 'q1') {
                verseOptions.poetryIndentLevel = 1;
              } else if (paraStyle === 'q2') {
                verseOptions.poetryIndentLevel = 2;
              }
            }

            verses.push(this.createVerse(
              currentVerseNumber,
              currentVerseText.trim(),
              verseOptions
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
      psalmMetadata,
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

  /**
   * Extract Psalm-specific metadata from standard API response
   */
  private extractPsalmMetadata(apiResponse: any, chapterNumber: string): PsalmMetadata {
    const metadata: PsalmMetadata = {
      psalmNumber: chapterNumber,
      hasSelah: false
    };
    
    // Check all content for Selah
    if (apiResponse.content && Array.isArray(apiResponse.content)) {
      for (const paragraph of apiResponse.content) {
        if (paragraph.items && Array.isArray(paragraph.items)) {
          for (const item of paragraph.items) {
            if (item.type === 'text' && item.text && /\bSelah\b/i.test(item.text)) {
              metadata.hasSelah = true;
              break;
            }
          }
        }
        if (metadata.hasSelah) break;
      }
    }
    
    // Look for title/superscription
    // In scripture.api.bible, titles often come as the first paragraph with style="s1" or "d"
    if (apiResponse.content && apiResponse.content.length > 0) {
      const firstPara = apiResponse.content[0];
      if (firstPara.attrs?.style === 's1' || firstPara.attrs?.style === 'd') {
        // Extract title text
        let titleText = '';
        if (firstPara.items && Array.isArray(firstPara.items)) {
          firstPara.items.forEach((item: any) => {
            if (item.type === 'text' && item.text) {
              titleText += item.text;
            }
          });
        }
        
        if (titleText.trim()) {
          metadata.superscription = titleText.trim();
          
          // Check for musical notation
          const musicalMatch = titleText.match(/(To the (?:chief )?Musician[^.]*)/i);
          if (musicalMatch) {
            metadata.musicalNotation = musicalMatch[1];
          }
        }
      }
    }
    
    // Extract section headings
    const sectionHeadings: Array<{ afterVerse: string; heading: string }> = [];
    let lastVerseNumber = '0';
    
    if (apiResponse.content && Array.isArray(apiResponse.content)) {
      apiResponse.content.forEach((paragraph: any) => {
        // Check if this is a heading (style="s2" or similar)
        if (paragraph.attrs?.style === 's2' || paragraph.attrs?.style === 's3') {
          let headingText = '';
          if (paragraph.items && Array.isArray(paragraph.items)) {
            paragraph.items.forEach((item: any) => {
              if (item.type === 'text' && item.text) {
                headingText += item.text;
              }
            });
          }
          
          if (headingText.trim() && lastVerseNumber !== '0') {
            sectionHeadings.push({
              afterVerse: lastVerseNumber,
              heading: headingText.trim()
            });
          }
        }
        
        // Track last verse number
        if (paragraph.items && Array.isArray(paragraph.items)) {
          paragraph.items.forEach((item: any) => {
            if (item.type === 'tag' && item.name === 'verse' && item.attrs?.number) {
              lastVerseNumber = item.attrs.number;
            }
          });
        }
      });
    }
    
    if (sectionHeadings.length > 0) {
      metadata.sectionHeadings = sectionHeadings;
    }
    
    return metadata;
  }
}