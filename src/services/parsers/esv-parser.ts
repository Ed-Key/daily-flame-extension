import { BaseBibleParser } from './base-parser';
import { UnifiedChapter, UnifiedVerse } from '../../types/bible-formats';

/**
 * Parser for ESV (English Standard Version) Bible API
 * Handles HTML format with specific ESV styling and structure
 */
export class ESVBibleParser extends BaseBibleParser {
  constructor() {
    super('ESV');
  }

  /**
   * Parse ESV API HTML response into unified format
   * 
   * Expected input format:
   * {
   *   passages: [{
   *     reference: "John 3",
   *     content: "<html with chapter content>"
   *   }]
   * }
   */
  parse(apiResponse: any): UnifiedChapter {
    this.debug('Parsing ESV format');

    if (!apiResponse || !apiResponse.passages || !apiResponse.passages[0]) {
      throw new Error('Invalid ESV API response: missing passages');
    }

    const passage = apiResponse.passages[0];
    const reference = apiResponse.canonical || apiResponse.query;
    const { bookName, chapterNumber } = this.parseReference(reference);
    
    // Parse HTML content using browser's DOMParser if available
    const verses = this.parseESVHtml(passage, chapterNumber);

    const unifiedChapter: UnifiedChapter = {
      reference: reference,
      translation: 'ESV',
      bookName,
      chapterNumber,
      verses,
      metadata: {
        copyright: apiResponse.copyright,
        translationName: 'English Standard Version'
      },
      rawResponse: apiResponse
    };

    this.debug('Parsed ESV chapter', {
      reference: unifiedChapter.reference,
      verseCount: verses.length
    });

    return unifiedChapter;
  }

  /**
   * Parse ESV HTML content to extract verses
   * Handles ESV-specific HTML structure including:
   * - Chapter numbers in <b class="chapter-num"> with format "1:1"
   * - Verse numbers in <b class="verse-num">
   * - Section headings in <h3>
   * - Red letter text in <span class="woc">
   */
  private parseESVHtml(html: string, chapterNumber: string): UnifiedVerse[] {
    const verses: UnifiedVerse[] = [];
    
    // Debug: log first 500 chars of HTML
    this.debug('HTML content (first 500 chars):', html.substring(0, 500));
    
    // Try the new format first (paragraphs with <b> tags for verse numbers)
    const paragraphVerses = this.parseESVParagraphs(html, chapterNumber);
    if (paragraphVerses.length > 0) {
      return paragraphVerses;
    }
    
    // Fall back to old format (span.text) for backward compatibility
    const verseSpans = this.extractVerseSpans(html);
    
    this.debug('Verse spans found:', verseSpans.length);

    // Also find section headings
    const headingPattern = /<h3[^>]*id="([^"]*)"[^>]*>(.*?)<\/h3>/gs;
    const headings = Array.from(html.matchAll(headingPattern));
    
    // Pre-process headings to find which verses they belong to
    const headingsByVerse = new Map<number, { heading: string; headingId: string }>();
    headings.forEach(headingMatch => {
      const headingPosition = html.indexOf(headingMatch[0]);
      // Find the next verse after this heading
      for (let i = 0; i < verseSpans.length; i++) {
        if (verseSpans[i].position > headingPosition) {
          headingsByVerse.set(i, {
            heading: this.stripHtmlTags(headingMatch[2]),
            headingId: headingMatch[1]
          });
          break;
        }
      }
    });
    
    this.debug('Headings found:', headings.length);
    this.debug('Headings by verse:', Array.from(headingsByVerse.entries()));

    verseSpans.forEach((span, index) => {
      const verseHtml = span.content;
      
      // Extract verse number
      let verseNumber = '';
      let verseText = verseHtml;
      
      // Check for chapter number (first verse)
      const chapterNumMatch = verseHtml.match(/<span[^>]*class="chapternum"[^>]*>(\d+)\s*<\/span>/);
      if (chapterNumMatch) {
        verseNumber = '1'; // First verse of chapter
        // Remove chapter number from text
        verseText = verseText.replace(chapterNumMatch[0], '');
      } else {
        // Look for verse number
        const verseNumMatch = verseHtml.match(/<span[^>]*class="versenum"[^>]*>(\d+)\s*<\/span>/);
        if (verseNumMatch) {
          verseNumber = verseNumMatch[1];
          // Remove verse number from text
          verseText = verseText.replace(verseNumMatch[0], '');
        }
      }

      // Skip if no verse number found
      if (!verseNumber) {
        this.debug('Skipping content without verse number', { html: verseHtml.substring(0, 100) });
        return;
      }

      // Check if verse text contains red letter (words of Christ)
      const hasRedLetter = /<span[^>]*class="woc"[^>]*>/.test(verseText);
      
      // Extract plain text
      let plainText = '';
      if (hasRedLetter) {
        // For red letter verses, extract and mark appropriately
        plainText = this.stripHtmlTags(verseText);
      } else {
        plainText = this.stripHtmlTags(verseText);
      }

      // Check for heading for this verse
      const headingInfo = headingsByVerse.get(index);

      const verse = this.createVerse(
        verseNumber,
        plainText,
        {
          isFirstVerse: verseNumber === '1',
          isRedLetter: hasRedLetter,
          heading: headingInfo?.heading,
          headingId: headingInfo?.headingId,
          rawHtml: verseHtml // Preserve for potential custom rendering
        }
      );

      verses.push(verse);
    });

    // If no verses found, log error
    if (verses.length === 0) {
      this.debug('ERROR: No verses found in ESV HTML');
      this.debug('Full HTML:', html);
    }

    return verses;
  }

  /**
   * Extract all span.text elements with their full content, handling nested spans
   */
  private extractVerseSpans(html: string): { content: string; position: number }[] {
    const spans: { content: string; position: number }[] = [];
    const openTagPattern = /<span[^>]*class="text[^"]*"[^>]*>/g;
    const openTags = Array.from(html.matchAll(openTagPattern));
    
    openTags.forEach(openTag => {
      const startIndex = openTag.index!;
      const contentStart = startIndex + openTag[0].length;
      let depth = 1;
      let currentIndex = contentStart;
      
      while (depth > 0 && currentIndex < html.length) {
        const nextOpen = html.indexOf('<span', currentIndex);
        const nextClose = html.indexOf('</span>', currentIndex);
        
        if (nextClose === -1) break;
        
        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          currentIndex = nextOpen + 1;
        } else {
          depth--;
          if (depth === 0) {
            const content = html.substring(contentStart, nextClose);
            spans.push({ content, position: startIndex });
          }
          currentIndex = nextClose + 1;
        }
      }
    });
    
    return spans;
  }

  /**
   * Parse ESV HTML that uses the new paragraph structure with <b> tags
   * New format: <p><b class="chapter-num">1:1&nbsp;</b>verse text...</p>
   */
  private parseESVParagraphs(html: string, chapterNumber: string): UnifiedVerse[] {
    const verses: UnifiedVerse[] = [];
    
    this.debug('Trying paragraph parsing...');
    
    // First, get all section headings and their positions
    const headingPattern = /<h3[^>]*id="([^"]*)"[^>]*>(.*?)<\/h3>/gs;
    const headings = Array.from(html.matchAll(headingPattern));
    const headingPositions = headings.map(h => ({ 
      position: html.indexOf(h[0]), 
      heading: this.stripHtmlTags(h[2]),
      headingId: h[1]
    }));
    
    // Match paragraphs
    const paragraphPattern = /<p[^>]*>(.*?)<\/p>/gs;
    const paragraphs = Array.from(html.matchAll(paragraphPattern));
    
    this.debug('Paragraphs found:', paragraphs.length);

    paragraphs.forEach((match) => {
      const paragraphHtml = match[1];
      const paragraphPosition = html.indexOf(match[0]);
      
      // Find the heading for this paragraph (if any)
      let currentHeading = null;
      for (let i = headingPositions.length - 1; i >= 0; i--) {
        if (headingPositions[i].position < paragraphPosition) {
          currentHeading = headingPositions[i];
          break;
        }
      }
      
      // Process verses in this paragraph
      // New format: <b class="chapter-num">1:1&nbsp;</b> or <b class="verse-num">2&nbsp;</b>
      const versePattern = /<b[^>]*class="(chapter-num|verse-num)"[^>]*>([^<]+)<\/b>/g;
      const verseMatches = Array.from(paragraphHtml.matchAll(versePattern));
      
      // Debug logging removed for production
      
      if (verseMatches.length === 0) {
        // No verse numbers found, skip this paragraph
        return;
      }
      
      // Track if this is the first verse in the paragraph (for heading assignment)
      let isFirstInParagraph = true;
      
      verseMatches.forEach((verseMatch, index) => {
        const [fullMatch, numClass, verseRef] = verseMatch;
        let verseNumber = '';
        let verseText = '';
        
        if (numClass === 'chapter-num') {
          // Extract verse number from format like "1:1&nbsp;"
          const chapterVerseMatch = verseRef.match(/\d+:(\d+)/);
          verseNumber = chapterVerseMatch ? chapterVerseMatch[1] : '1';
        } else {
          // Regular verse number
          verseNumber = verseRef.match(/\d+/)?.[0] || '';
        }
        
        // Get the text after this verse number until the next verse number or end of paragraph
        const currentIndex = paragraphHtml.indexOf(fullMatch) + fullMatch.length;
        let endIndex = paragraphHtml.length;
        
        // Find the next verse number if exists
        if (index < verseMatches.length - 1) {
          endIndex = paragraphHtml.indexOf(verseMatches[index + 1][0]);
        }
        
        // Extract text from current position to next verse
        verseText = paragraphHtml.substring(currentIndex, endIndex);
        
        // Check if text contains red letter before stripping tags
        const hasRedLetter = /<span[^>]*class="woc"[^>]*>/.test(verseText);
        
        // Clean up the verse text
        verseText = this.stripHtmlTags(verseText).trim();
        
        if (verseNumber && verseText) {
          const isFirstVerse = verseNumber === '1';
          
          // Add heading only to the first verse in the paragraph after a heading
          const shouldAddHeading = currentHeading && isFirstInParagraph && 
            !verses.some(v => v.heading === currentHeading.heading);
          
          verses.push(this.createVerse(verseNumber, verseText, {
            isFirstVerse,
            isRedLetter: hasRedLetter,
            heading: shouldAddHeading && currentHeading ? currentHeading.heading : undefined,
            headingId: shouldAddHeading && currentHeading ? currentHeading.headingId : undefined
          }));
          
          isFirstInParagraph = false;
        }
      });
    });

    return verses;
  }
}