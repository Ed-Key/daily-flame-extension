import { BaseBibleParser } from './base-parser';
import { UnifiedChapter, UnifiedVerse, PsalmMetadata } from '../../types/bible-formats';

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
    
    // Check if this is a Psalm
    const isPsalm = bookName.toLowerCase() === 'psalm' || bookName.toLowerCase() === 'psalms';
    
    // Extract Psalm metadata if applicable
    let psalmMetadata: PsalmMetadata | undefined;
    if (isPsalm) {
      psalmMetadata = this.extractPsalmMetadata(passage, chapterNumber);
    }
    
    // Parse HTML content using browser's DOMParser if available
    const verses = this.parseESVHtml(passage, chapterNumber, isPsalm);

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
      psalmMetadata,
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
   * - Psalm-specific elements like Selah markers
   */
  private parseESVHtml(html: string, chapterNumber: string, isPsalm: boolean = false): UnifiedVerse[] {
    const verses: UnifiedVerse[] = [];
    
    // Debug: log first 500 chars of HTML
    this.debug('HTML content (first 500 chars):', html.substring(0, 500));
    
    // Try the new format first (paragraphs with <b> tags for verse numbers)
    const paragraphVerses = this.parseESVParagraphs(html, chapterNumber, isPsalm);
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
  private parseESVParagraphs(html: string, chapterNumber: string, isPsalm: boolean = false): UnifiedVerse[] {
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
    
    // Match paragraphs - handle both regular and block-indent paragraphs
    const paragraphPattern = /<p[^>]*>(.*?)<\/p>/gs;
    const paragraphs = Array.from(html.matchAll(paragraphPattern));
    
    this.debug('Paragraphs found:', paragraphs.length);

    paragraphs.forEach((match) => {
      const paragraphHtml = match[1];
      const paragraphPosition = html.indexOf(match[0]);
      
      // Skip ESV copyright paragraph
      if (paragraphHtml.includes('class="copyright"')) {
        return;
      }
      
      // Find the heading for this paragraph (if any)
      let currentHeading = null;
      for (let i = headingPositions.length - 1; i >= 0; i--) {
        if (headingPositions[i].position < paragraphPosition) {
          currentHeading = headingPositions[i];
          break;
        }
      }
      
      // For Psalms with line-based structure, we need to handle span.line elements
      if (isPsalm && paragraphHtml.includes('class="line"')) {
        // Parse line-based Psalm structure
        const linePattern = /<span[^>]*class="[^"]*line[^"]*"[^>]*>(.*?)<\/span>/gs;
        const lines = Array.from(paragraphHtml.matchAll(linePattern));
        
        // Check for end-line-group markers to detect stanza breaks
        const endLineGroupPattern = /<span[^>]*class="end-line-group"[^>]*><\/span>/g;
        const stanzaBreakPositions = new Set<number>();
        let match;
        while ((match = endLineGroupPattern.exec(paragraphHtml)) !== null) {
          // Find which line precedes this end-line-group marker
          for (let i = lines.length - 1; i >= 0; i--) {
            const lineEnd = paragraphHtml.indexOf(lines[i][0]) + lines[i][0].length;
            if (lineEnd < match.index!) {
              stanzaBreakPositions.add(i);
              break;
            }
          }
        }
        
        const processedLines = new Set<number>();
        
        lines.forEach((lineMatch, lineIndex) => {
          // Skip if we've already processed this line as part of a previous verse
          if (processedLines.has(lineIndex)) {
            return;
          }
          
          const lineHtml = lineMatch[1];
          const isIndentLine = lineMatch[0].includes('indent line');
          
          // Look for verse numbers in this line
          const verseNumPattern = /<b[^>]*class="[^"]*(chapter-num|verse-num)[^"]*"[^>]*>([^<]+)<\/b>/g;
          const verseNumMatch = verseNumPattern.exec(lineHtml);
          
          if (verseNumMatch) {
            const [fullMatch, numClass, verseRef] = verseNumMatch;
            let verseNumber = '';
            
            if (numClass.includes('chapter-num')) {
              // Extract verse number from format like "105:1&nbsp;"
              const chapterVerseMatch = verseRef.match(/\d+:(\d+)/);
              verseNumber = chapterVerseMatch ? chapterVerseMatch[1] : '1';
            } else {
              // Regular verse number
              verseNumber = verseRef.match(/\d+/)?.[0] || '';
            }
            
            // Get text after verse number
            const textAfterVerseNum = lineHtml.substring(lineHtml.indexOf(fullMatch) + fullMatch.length);
            let verseText = this.stripHtmlTags(textAfterVerseNum).trim();
            // Only add initial text to verseLines if it's not empty
            const verseLines: string[] = verseText ? [verseText] : [];
            
            // If this is an indent line without a verse number, it's continuation of previous verse
            // We need to append it to the previous verse
            if (verses.length > 0 && !verseNumber && isIndentLine) {
              const lastVerse = verses[verses.length - 1];
              if (lastVerse.lines) {
                lastVerse.lines.push(verseText);
              } else {
                lastVerse.text += ' ' + verseText;
              }
              return;
            }
            
            // For verses with both regular and indent lines, we need to collect all lines
            // Look ahead to collect all lines belonging to this verse
            let nextLineIndex = lineIndex + 1;
            while (nextLineIndex < lines.length) {
              const nextLine = lines[nextLineIndex];
              const nextLineHtml = nextLine[1];
              const isNextLineIndented = nextLine[0].includes('indent line');
              
              // Check if this line belongs to the current verse (no verse number)
              if (!/<b[^>]*class="[^"]*verse-num/.test(nextLineHtml) && 
                  !/<b[^>]*class="[^"]*chapter-num/.test(nextLineHtml)) {
                const lineText = this.stripHtmlTags(nextLineHtml).trim();
                if (lineText) {
                  verseLines.push(lineText);
                }
                // Mark this line as processed
                processedLines.add(nextLineIndex);
                nextLineIndex++;
              } else {
                // Found the start of next verse, stop collecting lines
                break;
              }
            }
            
            // Mark current line as processed
            processedLines.add(lineIndex);
            
            // Combine text for backward compatibility
            verseText = verseLines.join(' ');
            
            // Create verse if we have a verse number and any text (initial or collected)
            if (verseNumber && (verseText || verseLines.length > 0)) {
              const isFirstVerse = verseNumber === '1';
              const poetryIndentLevel = isIndentLine ? 1 : 0;
              
              // Check for Selah
              const isSelah = /\bSelah\b/i.test(verseText);
              
              // Add heading only to the first verse after a heading
              const shouldAddHeading = currentHeading && 
                !verses.some(v => v.heading === currentHeading.heading);
              
              verses.push(this.createVerse(verseNumber, verseText, {
                isFirstVerse,
                isRedLetter: false, // ESV HTML doesn't include red letter in Psalms
                heading: shouldAddHeading && currentHeading ? currentHeading.heading : undefined,
                headingId: shouldAddHeading && currentHeading ? currentHeading.headingId : undefined,
                isSelah: isSelah || undefined,
                poetryIndentLevel: poetryIndentLevel || undefined,
                // Check if this verse ends a stanza
                stanzaBreakAfter: stanzaBreakPositions.has(lineIndex) ? true : undefined,
                lines: verseLines.length > 0 ? verseLines : undefined
              }));
            }
          } else if (verses.length > 0) {
            // This is a line without a verse number - append to previous verse
            const lastVerse = verses[verses.length - 1];
            const additionalText = this.stripHtmlTags(lineHtml).trim();
            if (additionalText) {
              // If the verse has lines array, add to it; otherwise append to text
              if (lastVerse.lines) {
                lastVerse.lines.push(additionalText);
                // Also update the combined text for backward compatibility
                lastVerse.text = lastVerse.lines.join(' ');
              } else {
                lastVerse.text += ' ' + additionalText;
              }
            }
            // Check if this line ends a stanza
            if (stanzaBreakPositions.has(lineIndex)) {
              lastVerse.stanzaBreakAfter = true;
            }
          }
        });
      } else {
        // Original paragraph parsing for non-line-based content
        // Process verses in this paragraph
        const versePattern = /<b[^>]*class="[^"]*(chapter-num|verse-num)[^"]*"[^>]*>([^<]+)<\/b>/g;
        const verseMatches = Array.from(paragraphHtml.matchAll(versePattern));
        
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
          
          if (numClass.includes('chapter-num')) {
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
          
          // Check for Psalm-specific elements
          let isSelah = false;
          let cleanedVerseText = verseText;
          
          if (isPsalm) {
            // Check for Selah
            isSelah = /\bSelah\b/i.test(verseText);
          }
          
          // Clean up the verse text
          cleanedVerseText = this.stripHtmlTags(cleanedVerseText).trim();
          
          if (verseNumber && cleanedVerseText) {
            const isFirstVerse = verseNumber === '1';
            
            // Add heading only to the first verse in the paragraph after a heading
            const shouldAddHeading = currentHeading && isFirstInParagraph && 
              !verses.some(v => v.heading === currentHeading.heading);
            
            verses.push(this.createVerse(verseNumber, cleanedVerseText, {
              isFirstVerse,
              isRedLetter: hasRedLetter,
              heading: shouldAddHeading && currentHeading ? currentHeading.heading : undefined,
              headingId: shouldAddHeading && currentHeading ? currentHeading.headingId : undefined,
              isSelah: isSelah || undefined,
              // For ESV, paragraphs often indicate stanza breaks in Psalms
              stanzaBreakAfter: isPsalm && index === verseMatches.length - 1 ? true : undefined
            }));
            
            isFirstInParagraph = false;
          }
        });
      }
    });

    return verses;
  }

  /**
   * Extract Psalm-specific metadata from ESV HTML
   */
  private extractPsalmMetadata(html: string, chapterNumber: string): PsalmMetadata {
    const metadata: PsalmMetadata = {
      psalmNumber: chapterNumber,
      hasSelah: /\bSelah\b/i.test(html)
    };
    
    // Look for superscription in h3 tag at the beginning
    // ESV puts Psalm titles in h3 tags with specific formatting
    const superscriptionMatch = html.match(/<h3[^>]*>(.*?)<\/h3>/);
    if (superscriptionMatch) {
      const superscriptionText = this.stripHtmlTags(superscriptionMatch[1]).trim();
      
      // Check if this is actually a superscription (not a section heading)
      // Superscriptions typically mention "Psalm" or start with "To the" or "A" or "Of"
      if (/^(To the|A |Of |When |For |In |The )/i.test(superscriptionText) ||
          /Psalm/i.test(superscriptionText)) {
        metadata.superscription = superscriptionText;
        
        // Extract musical notation if present
        const musicalMatch = superscriptionText.match(/(To the choirmaster[^.]*)/i);
        if (musicalMatch) {
          metadata.musicalNotation = musicalMatch[1];
        }
      }
    }
    
    // Extract section headings (h3 tags that aren't superscriptions)
    const sectionHeadings: Array<{ afterVerse: string; heading: string }> = [];
    const headingPattern = /<h3[^>]*>(.*?)<\/h3>/gs;
    const headings = Array.from(html.matchAll(headingPattern));
    
    // Skip the first h3 if it's the superscription
    const startIndex = metadata.superscription ? 1 : 0;
    
    for (let i = startIndex; i < headings.length; i++) {
      const headingText = this.stripHtmlTags(headings[i][1]).trim();
      
      // Find which verse this heading appears after
      const headingPosition = html.indexOf(headings[i][0]);
      const beforeHeading = html.substring(0, headingPosition);
      const verseMatches = beforeHeading.match(/<b[^>]*class="(chapter-num|verse-num)"[^>]*>([^<]+)<\/b>/g);
      
      if (verseMatches && verseMatches.length > 0) {
        const lastVerseMatch = verseMatches[verseMatches.length - 1];
        const verseNumber = this.extractVerseNumber(lastVerseMatch);
        
        sectionHeadings.push({
          afterVerse: verseNumber,
          heading: headingText
        });
      }
    }
    
    if (sectionHeadings.length > 0) {
      metadata.sectionHeadings = sectionHeadings;
    }
    
    return metadata;
  }
  
  /**
   * Helper to extract verse number from ESV verse markup
   */
  private extractVerseNumber(verseMarkup: string): string {
    // Handle chapter-num format like "1:1"
    const chapterVerseMatch = verseMarkup.match(/\d+:(\d+)/);
    if (chapterVerseMatch) {
      return chapterVerseMatch[1];
    }
    
    // Handle regular verse-num format
    const verseMatch = verseMarkup.match(/>(\d+)/);
    return verseMatch ? verseMatch[1] : '1';
  }
}