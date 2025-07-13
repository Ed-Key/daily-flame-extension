import { BaseBibleParser } from './base-parser';
import { UnifiedChapter, UnifiedVerse, PsalmMetadata } from '../../types/bible-formats';

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
    
    // Check if this is a Psalm
    const isPsalm = bookName.toLowerCase() === 'psalm' || bookName.toLowerCase() === 'psalms';
    
    // Extract Psalm metadata if applicable
    let psalmMetadata: PsalmMetadata | undefined;
    if (isPsalm) {
      psalmMetadata = this.extractPsalmMetadata(passage.content, chapterNumber);
    }
    
    // Parse HTML content
    const verses = this.parseNLTHtml(passage.content, isPsalm);

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
      psalmMetadata,
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
   * - Poetry formatting with q1/q2 classes for Psalms
   */
  private parseNLTHtml(html: string, isPsalm: boolean = false): UnifiedVerse[] {
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
      
      // Check for Psalm-specific elements
      let isSelah = false;
      let poetryIndentLevel = 0;
      
      if (isPsalm) {
        // Check for Selah
        isSelah = /\bSelah\b/i.test(verseContent);
        
        // Check for poetry indentation (q1, q2 classes)
        if (/<[^>]*class=["']?q2["']?/.test(verseContent)) {
          poetryIndentLevel = 2;
        } else if (/<[^>]*class=["']?q1["']?/.test(verseContent)) {
          poetryIndentLevel = 1;
        }
      }
      
      // Extract plain text
      const plainText = this.stripHtmlTags(verseContent).trim();

      const verse = this.createVerse(
        verseNumber,
        plainText,
        {
          isFirstVerse: isFirstVerse || index === 0,
          isRedLetter: hasRedLetter,
          heading,
          rawHtml: match[0], // Preserve original for potential custom rendering
          isSelah: isSelah || undefined,
          poetryIndentLevel: poetryIndentLevel || undefined
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

  /**
   * Extract Psalm-specific metadata from NLT HTML
   */
  private extractPsalmMetadata(html: string, chapterNumber: string): PsalmMetadata {
    const metadata: PsalmMetadata = {
      psalmNumber: chapterNumber,
      hasSelah: /\bSelah\b/i.test(html)
    };
    
    // Look for superscription
    // NLT typically puts Psalm titles in <h3 class="psalm-title"> or similar
    const superscriptionMatch = html.match(/<h3[^>]*class=["']?psalm-title["']?[^>]*>(.*?)<\/h3>/i);
    if (!superscriptionMatch) {
      // Try alternative patterns
      const altMatch = html.match(/<p[^>]*class=["']?psalm-acrostic-title["']?[^>]*>(.*?)<\/p>/i);
      if (altMatch) {
        metadata.superscription = this.stripHtmlTags(altMatch[1]).trim();
      }
    } else {
      metadata.superscription = this.stripHtmlTags(superscriptionMatch[1]).trim();
    }
    
    // Extract section headings
    const sectionHeadings: Array<{ afterVerse: string; heading: string }> = [];
    const headingPattern = /<h3[^>]*class=["']?subhead["']?[^>]*>(.*?)<\/h3>/gs;
    const headings = Array.from(html.matchAll(headingPattern));
    
    headings.forEach(headingMatch => {
      const headingText = this.stripHtmlTags(headingMatch[1]).trim();
      
      // Skip if this is the superscription
      if (headingText === metadata.superscription) {
        return;
      }
      
      // Find which verse this heading appears after
      const headingPosition = html.indexOf(headingMatch[0]);
      const beforeHeading = html.substring(0, headingPosition);
      
      // Look for the last verse number before this heading
      const verseNumbers = Array.from(beforeHeading.matchAll(/vn="(\d+)"/g));
      if (verseNumbers.length > 0) {
        const lastVerseNumber = verseNumbers[verseNumbers.length - 1][1];
        sectionHeadings.push({
          afterVerse: lastVerseNumber,
          heading: headingText
        });
      }
    });
    
    if (sectionHeadings.length > 0) {
      metadata.sectionHeadings = sectionHeadings;
    }
    
    // Check for musical notation in superscription
    if (metadata.superscription) {
      const musicalMatch = metadata.superscription.match(/(For the (?:choir )?director[^.]*)/i);
      if (musicalMatch) {
        metadata.musicalNotation = musicalMatch[1];
      }
    }
    
    return metadata;
  }
}