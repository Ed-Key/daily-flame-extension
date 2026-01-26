/**
 * NLT HTML Parser
 *
 * Dedicated parser for handling NLT API HTML responses.
 *
 * Based on analysis of all 66 books, the NLT API returns 100% consistent HTML:
 * - All responses have <verse_export vn="X"> tags
 * - Consistent outer structure: DOCTYPE > html > body > div#bibletext > section
 * - Standard classes: vn (verse number), red (Words of Jesus), poet1/poet2 (poetry)
 *
 * Special elements:
 * - <p class="psa-title"> - Psalm superscriptions
 * - <p class="selah"> - Selah markers (displays "Interlude")
 * - <h5 class="psa-hebrew"> - Psalm 119 acrostic letters
 * - <h3 class="sos-speaker"> - Song of Solomon speaker labels
 * - <h2 class="psa-book"> - Psalter book divisions
 */

import { UnifiedChapter, UnifiedVerse } from '../../types/bible-formats';

export interface ParsedVerse {
  verseNumber: string;
  text: string;
  heading?: string;
  isRedLetter: boolean;
  isFirstVerse: boolean;
  poetryIndentLevel?: number;
  stanzaBreakBefore?: boolean;
  speakerLabel?: string;
  hebrewLetter?: string;
}

export class NLTHTMLParser {
  private debug = false;

  /**
   * Main entry point for parsing NLT HTML content
   */
  parseToUnified(htmlContent: string, reference: string): UnifiedChapter {
    if (this.debug) console.log('[NLT HTML Parser] Starting parse for:', reference);

    const verses = this.parseVerseExports(htmlContent);

    if (verses.length === 0) {
      throw new Error('Failed to parse NLT HTML content - no verses found');
    }

    // Extract book name and chapter from reference
    const bookName = reference.replace(/\s+\d+.*$/, '').trim();
    const chapterMatch = reference.match(/\d+$/);
    const chapterNumber = chapterMatch ? chapterMatch[0] : '1';

    // Convert to unified format
    const unifiedVerses: UnifiedVerse[] = verses.map(verse => ({
      number: verse.verseNumber,
      text: verse.text,
      heading: verse.heading,
      headingId: verse.heading ? `heading-${verse.verseNumber}` : undefined,
      isRedLetter: verse.isRedLetter,
      isFirstVerse: verse.isFirstVerse,
      poetryIndentLevel: verse.poetryIndentLevel,
      stanzaBreakBefore: verse.stanzaBreakBefore,
      // Store special elements in rawHtml for potential custom rendering
      speakerLabel: verse.speakerLabel,
      hebrewLetter: verse.hebrewLetter,
    }));

    return {
      reference,
      translation: 'NLT',
      bookName,
      chapterNumber,
      verses: unifiedVerses
    };
  }

  /**
   * Parse all verse_export elements from NLT HTML
   * This is the primary (and only needed) parsing strategy since
   * 100% of NLT API responses use this structure.
   */
  private parseVerseExports(htmlContent: string): ParsedVerse[] {
    const verses: ParsedVerse[] = [];

    // Match all verse_export elements with their content
    const versePattern = /<verse_export[^>]*vn="(\d+)"[^>]*>([\s\S]*?)<\/verse_export>/g;
    const matches = [...htmlContent.matchAll(versePattern)];

    if (this.debug) console.log('[NLT Parser] Found verse_export elements:', matches.length);

    if (matches.length === 0) {
      // This should never happen based on our analysis, but log it
      console.warn('[NLT Parser] No verse_export elements found - unexpected API response');
      return [];
    }

    matches.forEach((match, index) => {
      const verseNumber = match[1];
      const verseContent = match[2];

      const verse = this.parseVerseContent(verseNumber, verseContent, index === 0);
      verses.push(verse);
    });

    return verses;
  }

  /**
   * Parse the content within a single verse_export element
   */
  private parseVerseContent(verseNumber: string, content: string, isFirst: boolean): ParsedVerse {
    let text = content;
    let heading: string | undefined;
    let isRedLetter = false;
    let poetryIndentLevel: number | undefined;
    let stanzaBreakBefore = false;
    let speakerLabel: string | undefined;
    let hebrewLetter: string | undefined;
    let isFirstVerse = isFirst;

    // Check for chapter number (marks first verse)
    if (/<h[23][^>]*class="chapter-number"/.test(text)) {
      isFirstVerse = true;
      // Remove chapter header
      text = text.replace(/<h[23][^>]*class="chapter-number"[^>]*>[\s\S]*?<\/h[23]>/g, '');
    }

    // Extract section heading (<h3 class="subhead"> or <h4 class="subhead">)
    const headingMatch = text.match(/<h[34][^>]*class="subhead"[^>]*>([\s\S]*?)<\/h[34]>/);
    if (headingMatch) {
      heading = this.stripHtml(headingMatch[1]);
      text = text.replace(headingMatch[0], '');
    }

    // Extract Song of Solomon speaker label
    const speakerMatch = text.match(/<h3[^>]*class="sos-speaker"[^>]*>([\s\S]*?)<\/h3>/g);
    if (speakerMatch) {
      // Get the first speaker (there may be multiple in one verse)
      const firstSpeaker = speakerMatch[0].match(/<h3[^>]*class="sos-speaker"[^>]*>([\s\S]*?)<\/h3>/);
      if (firstSpeaker) {
        // Get just the text before any footnote markers
        // Footnotes start with <a class="a-tn"> - take everything before that
        let speakerContent = firstSpeaker[1];
        const footnoteStart = speakerContent.indexOf('<a');
        if (footnoteStart > 0) {
          speakerContent = speakerContent.substring(0, footnoteStart);
        }
        speakerLabel = this.stripHtml(speakerContent);
      }
      // Remove all speaker labels from text
      speakerMatch.forEach(s => {
        text = text.replace(s, ' ');
      });
    }

    // Extract Hebrew acrostic letter (Psalm 119)
    const hebrewMatch = text.match(/<h5[^>]*class="psa-hebrew"[^>]*>([\s\S]*?)<\/h5>/);
    if (hebrewMatch) {
      hebrewLetter = this.stripHtml(hebrewMatch[1]);
      text = text.replace(hebrewMatch[0], '');
    }

    // Check for red letter text (Words of Jesus)
    // NLT uses <span class="red"> and <span class="red-sc"> (for LORD in red)
    isRedLetter = /class=["']red["']|class=["']red-sc["']/.test(content);

    // Check for poetry indentation
    // NLT uses poet1, poet2, etc. with various suffixes (-vn, -sp, -hd)
    if (/class=["'][^"']*poet2/.test(content)) {
      poetryIndentLevel = 2;
    } else if (/class=["'][^"']*poet1/.test(content)) {
      poetryIndentLevel = 1;
    }

    // Check for stanza break (indicated by -sp suffix in class)
    stanzaBreakBefore = /class=["'][^"']*-sp["']/.test(content);

    // Remove verse number spans
    text = text.replace(/<span[^>]*class=["']vn["'][^>]*>\d+<\/span>/g, '');

    // Remove footnote markers and content
    text = text.replace(/<a[^>]*class=["']a-tn["'][^>]*>[\s\S]*?<\/a>/g, '');
    text = text.replace(/<span[^>]*class=["']tn["'][^>]*>[\s\S]*?<\/span>/g, '');

    // Remove Psalm book division headers (appears in Psalm 1)
    text = text.replace(/<h2[^>]*class="psa-book"[^>]*>[\s\S]*?<\/h2>/g, '');

    // Remove Psalm title/superscription (handled separately in metadata)
    text = text.replace(/<p[^>]*class=["']psa-title["'][^>]*>[\s\S]*?<\/p>/g, '');

    // Remove Selah markers (handled separately)
    text = text.replace(/<p[^>]*class=["']selah["'][^>]*>[\s\S]*?<\/p>/g, '');

    // Extract plain text
    const plainText = this.stripHtml(text).trim();

    return {
      verseNumber,
      text: plainText,
      heading,
      isRedLetter,
      isFirstVerse,
      poetryIndentLevel,
      stanzaBreakBefore: stanzaBreakBefore || undefined,
      speakerLabel,
      hebrewLetter
    };
  }

  /**
   * Strip HTML tags and normalize whitespace
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract Psalm-specific metadata from NLT HTML
   */
  extractPsalmMetadata(htmlContent: string): {
    superscription?: string;
    hasSelah: boolean;
    selahPositions: string[];
    hebrewLetters: Array<{ letter: string; afterVerse: string }>;
    bookDivision?: string;
  } {
    const metadata = {
      superscription: undefined as string | undefined,
      hasSelah: false,
      selahPositions: [] as string[],
      hebrewLetters: [] as Array<{ letter: string; afterVerse: string }>,
      bookDivision: undefined as string | undefined
    };

    // Extract superscription (<p class="psa-title">)
    const titleMatch = htmlContent.match(/<p[^>]*class=["']psa-title["'][^>]*>([\s\S]*?)<\/p>/);
    if (titleMatch) {
      // Get the text before any footnote markers
      let titleContent = titleMatch[1];
      const footnoteStart = titleContent.indexOf('<a');
      if (footnoteStart > 0) {
        titleContent = titleContent.substring(0, footnoteStart);
      }
      metadata.superscription = this.stripHtml(titleContent);
    }

    // Find Selah markers (<p class="selah">Interlude</p>)
    const selahPattern = /<p[^>]*class=["']selah["'][^>]*>[\s\S]*?<\/p>/g;
    const selahMatches = [...htmlContent.matchAll(selahPattern)];

    if (selahMatches.length > 0) {
      metadata.hasSelah = true;

      // Find which verse each Selah appears after using match indices
      selahMatches.forEach(selahMatch => {
        // matchAll with 'g' flag provides index property
        const selahPosition = selahMatch.index ?? 0;
        const beforeSelah = htmlContent.substring(0, selahPosition);

        // Find the last verse number before this Selah
        const verseNumbers = [...beforeSelah.matchAll(/vn="(\d+)"/g)];
        if (verseNumbers.length > 0) {
          const lastVerse = verseNumbers[verseNumbers.length - 1][1];
          metadata.selahPositions.push(lastVerse);
        }
      });
    }

    // Find Hebrew acrostic letters (<h5 class="psa-hebrew">)
    const hebrewPattern = /<h5[^>]*class=["']psa-hebrew["'][^>]*>([\s\S]*?)<\/h5>/g;
    const hebrewMatches = [...htmlContent.matchAll(hebrewPattern)];

    hebrewMatches.forEach(hebrewMatch => {
      const letter = this.stripHtml(hebrewMatch[1]);
      const position = htmlContent.indexOf(hebrewMatch[0]);
      const beforeLetter = htmlContent.substring(0, position);

      // Find the last verse number before this letter (or "0" if before first verse)
      const verseNumbers = [...beforeLetter.matchAll(/vn="(\d+)"/g)];
      const afterVerse = verseNumbers.length > 0
        ? verseNumbers[verseNumbers.length - 1][1]
        : '0';

      metadata.hebrewLetters.push({ letter, afterVerse });
    });

    // Extract book division (<h2 class="psa-book">)
    const bookMatch = htmlContent.match(/<h2[^>]*class=["']psa-book["'][^>]*>([\s\S]*?)<\/h2>/);
    if (bookMatch) {
      metadata.bookDivision = this.stripHtml(bookMatch[1]);
    }

    return metadata;
  }
}
