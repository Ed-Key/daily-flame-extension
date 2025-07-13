import { BibleParser, UnifiedChapter, UnifiedVerse } from '../../types/bible-formats';
import { BibleTranslation } from '../../types';

/**
 * Base class for all Bible translation parsers
 * Provides common utilities for parsing Bible text
 */
export abstract class BaseBibleParser implements BibleParser {
  protected translation: BibleTranslation;

  constructor(translation: BibleTranslation) {
    this.translation = translation;
  }

  /**
   * Parse API response into unified format
   * Must be implemented by each translation parser
   */
  abstract parse(apiResponse: any): UnifiedChapter;

  /**
   * Get parser name for debugging
   */
  getName(): string {
    return `${this.translation}Parser`;
  }

  /**
   * Extract book name and chapter number from reference
   * @param reference e.g., "John 3", "1 Corinthians 13"
   * @returns { bookName, chapterNumber }
   */
  protected parseReference(reference: string): { bookName: string; chapterNumber: string } {
    const match = reference.match(/^(.+?)\s+(\d+)$/);
    if (!match) {
      throw new Error(`Invalid chapter reference: ${reference}`);
    }
    return {
      bookName: match[1].trim(),
      chapterNumber: match[2]
    };
  }

  /**
   * Clean verse text by removing extra whitespace and normalizing
   * @param text Raw verse text
   * @returns Cleaned text
   */
  protected cleanVerseText(text: string): string {
    return text
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/^\s+|\s+$/g, '')      // Trim
      .replace(/\u00A0/g, ' ')        // Replace non-breaking spaces
      .replace(/[\r\n]+/g, ' ');      // Remove line breaks
  }

  /**
   * Extract text content from HTML, preserving red letter spans
   * @param html HTML string
   * @returns Plain text with red letter markers
   */
  protected extractTextFromHtml(html: string): { text: string; isRedLetter: boolean } {
    // Check if the entire content is wrapped in red letter tags
    const redLetterMatch = html.match(/<span[^>]*class=["']?(woc|red|words-of-jesus)["']?[^>]*>(.*?)<\/span>/is);
    if (redLetterMatch) {
      return {
        text: this.stripHtmlTags(redLetterMatch[2]),
        isRedLetter: true
      };
    }

    // Otherwise, extract plain text
    return {
      text: this.stripHtmlTags(html),
      isRedLetter: false
    };
  }

  /**
   * Strip HTML tags from text while preserving content
   * @param html HTML string
   * @returns Plain text
   */
  protected stripHtmlTags(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, ' ')                    // Replace br with space
      .replace(/<\/?(p|div|span)[^>]*>/gi, '')        // Remove common tags
      .replace(/<[^>]+>/g, '')                         // Remove all other tags
      .replace(/&nbsp;/gi, ' ')                        // Replace HTML entities
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&mdash;/gi, '—')
      .replace(/&[^;]+;/g, '');                        // Remove other entities
  }

  /**
   * Create a UnifiedVerse object with defaults
   * @param number Verse number
   * @param text Verse text
   * @param options Additional options
   */
  protected createVerse(
    number: string,
    text: string,
    options: Partial<UnifiedVerse> = {}
  ): UnifiedVerse {
    // Don't clean text if lines are provided (preserve line breaks for poetry)
    const processedText = options.lines ? text : this.cleanVerseText(text);
    
    return {
      number,
      text: processedText,
      isRedLetter: false,
      isFirstVerse: false,
      ...options
    };
  }

  /**
   * Debug helper to log parsing steps
   * @param step Description of current step
   * @param data Data being processed
   */
  protected debug(step: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.getName()}] ${step}`, data);
    }
  }
}