import { BaseBibleParser } from './base-parser';
import { UnifiedChapter, UnifiedVerse } from '../../types/bible-formats';

/**
 * Parser for NLT (New Living Translation) Bible API
 * Handles custom verse_export XML-like format
 */
export class NLTBibleParser extends BaseBibleParser {
  constructor() {
    super('NLT');
  }

  /**
   * Parse NLT API HTML response into unified format
   * 
   * Expected input format:
   * {
   *   passages: [{
   *     reference: "John 3",
   *     content: "<html with verse_export elements>"
   *   }]
   * }
   */
  parse(apiResponse: any): UnifiedChapter {
    this.debug('Parsing NLT format');

    if (!apiResponse || !apiResponse.passages || !apiResponse.passages[0]) {
      throw new Error('Invalid NLT API response: missing passages');
    }

    const passage = apiResponse.passages[0];
    const { bookName, chapterNumber } = this.parseReference(passage.reference);
    
    // Parse HTML content
    const verses = this.parseNLTHtml(passage.content);

    const unifiedChapter: UnifiedChapter = {
      reference: passage.reference,
      translation: 'NLT',
      bookName,
      chapterNumber,
      verses,
      metadata: {
        copyright: '© 1996, 2004, 2015 by Tyndale House Foundation',
        translationName: 'New Living Translation'
      },
      rawResponse: apiResponse
    };

    this.debug('Parsed NLT chapter', {
      reference: unifiedChapter.reference,
      verseCount: verses.length
    });

    return unifiedChapter;
  }

  /**
   * Parse NLT HTML with verse_export structure
   * 
   * NLT Format:
   * <verse_export vn="1">
   *   <cn>3</cn>There was a man named Nicodemus...
   * </verse_export>
   * 
   * - <verse_export> wraps each verse
   * - vn attribute contains verse number
   * - <cn> contains chapter number (only in first verse)
   * - <sn> contains section headings
   * - <red> or class="red" for words of Jesus
   */
  private parseNLTHtml(html: string): UnifiedVerse[] {
    const verses: UnifiedVerse[] = [];
    
    // Extract all verse_export elements
    const verseExportPattern = /<verse_export[^>]*vn="(\d+)"[^>]*>(.*?)<\/verse_export>/gs;
    const matches = Array.from(html.matchAll(verseExportPattern));

    if (matches.length === 0) {
      this.debug('No verse_export elements found, trying alternative parsing');
      return this.parseNLTAlternative(html);
    }

    matches.forEach((match, index) => {
      const verseNumber = match[1];
      let verseContent = match[2];
      
      // Extract chapter number if present (first verse)
      // Look for <h2 class="chapter-number">...<span class="cw_ch">1</span></h2>
      let isFirstVerse = false;
      const chapterNumMatch = verseContent.match(/<h2[^>]*class="chapter-number"[^>]*>.*?<span[^>]*class="cw_ch"[^>]*>(\d+)<\/span>.*?<\/h2>/s);
      if (chapterNumMatch) {
        isFirstVerse = true;
        // Remove the entire chapter header from content
        verseContent = verseContent.replace(chapterNumMatch[0], '');
      }

      // Extract section heading if present
      // Look for <h3 class="subhead">...</h3>
      let heading: string | undefined;
      const headingMatch = verseContent.match(/<h3[^>]*class="subhead"[^>]*>(.*?)<\/h3>/s);
      if (headingMatch) {
        heading = this.stripHtmlTags(headingMatch[1]);
        // Remove heading from content
        verseContent = verseContent.replace(headingMatch[0], '');
      }

      // Remove verse number spans from content
      // <span class="vn">1</span>
      verseContent = verseContent.replace(/<span[^>]*class="vn"[^>]*>\d+<\/span>/g, '');
      
      // Remove footnote markers and content
      // <a class="a-tn">*</a><span class="tn">...</span>
      verseContent = verseContent.replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a>/g, '');
      verseContent = verseContent.replace(/<span[^>]*class="tn"[^>]*>.*?<\/span>/gs, '');
      
      // Check for red letter text
      const hasRedLetter = /<red>|class=["']?red["']?/.test(verseContent);
      
      // Extract plain text
      const plainText = this.stripHtmlTags(verseContent).trim();

      const verse = this.createVerse(
        verseNumber,
        plainText,
        {
          isFirstVerse: isFirstVerse || index === 0,
          isRedLetter: hasRedLetter,
          heading,
          rawHtml: match[0] // Preserve original for potential custom rendering
        }
      );

      verses.push(verse);
    });

    return verses;
  }

  /**
   * Alternative parsing for NLT when verse_export is not found
   * Some NLT responses might use different markup
   */
  private parseNLTAlternative(html: string): UnifiedVerse[] {
    const verses: UnifiedVerse[] = [];
    
    // Try to parse by looking for verse numbers in various formats
    // Pattern for verses with class="vn" for verse numbers
    const versePattern = /<span[^>]*class="vn"[^>]*>(\d+)<\/span>(.*?)(?=<span[^>]*class="vn"|$)/gs;
    const matches = Array.from(html.matchAll(versePattern));

    if (matches.length === 0) {
      // Try another pattern - verses in paragraphs
      const paragraphPattern = /<p[^>]*>(.*?)<\/p>/gs;
      const paragraphs = Array.from(html.matchAll(paragraphPattern));
      
      paragraphs.forEach((para) => {
        const content = para[1];
        // Split by verse numbers
        const verseSplits = content.split(/<span[^>]*class="vn"[^>]*>/);
        
        verseSplits.forEach((split, index) => {
          if (index === 0 && !split.trim()) return; // Skip empty first split
          
          const verseMatch = split.match(/^(\d+)<\/span>(.*)/s);
          if (verseMatch) {
            const verseNumber = verseMatch[1];
            const verseText = this.stripHtmlTags(verseMatch[2]);
            const hasRedLetter = /class=["']?red["']?/.test(verseMatch[2]);
            
            verses.push(this.createVerse(verseNumber, verseText, {
              isFirstVerse: verses.length === 0,
              isRedLetter: hasRedLetter
            }));
          } else if (index === 0 && split.includes('class="cn"')) {
            // First verse with chapter number
            const chapterMatch = split.match(/<span[^>]*class="cn"[^>]*>(\d+)<\/span>(.*)/s);
            if (chapterMatch) {
              const verseText = this.stripHtmlTags(chapterMatch[2]);
              const hasRedLetter = /class=["']?red["']?/.test(chapterMatch[2]);
              
              verses.push(this.createVerse('1', verseText, {
                isFirstVerse: true,
                isRedLetter: hasRedLetter
              }));
            }
          }
        });
      });
    } else {
      // Process matches from the first pattern
      matches.forEach((match, index) => {
        const verseNumber = match[1];
        const verseText = this.stripHtmlTags(match[2]);
        const hasRedLetter = /class=["']?red["']?/.test(match[2]);
        
        verses.push(this.createVerse(verseNumber, verseText, {
          isFirstVerse: index === 0,
          isRedLetter: hasRedLetter
        }));
      });
    }

    // If still no verses, throw error
    if (verses.length === 0) {
      throw new Error('Unable to parse NLT content - no recognizable verse structure found');
    }

    return verses;
  }
}