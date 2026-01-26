// Unified Bible data format interfaces
// This standardizes how all Bible translations are represented internally

import { BibleTranslation } from './index';

/**
 * Represents a single verse in the unified format
 */
export interface UnifiedVerse {
  /** Verse number (e.g., "1", "2", "16") */
  number: string;
  
  /** The verse text content */
  text: string;
  
  /** For poetry structure - array of lines within the verse */
  lines?: string[];
  
  /** Whether this verse contains words of Jesus (red letter) */
  isRedLetter?: boolean;
  
  /** Whether this is the first verse of the chapter */
  isFirstVerse?: boolean;
  
  /** Section heading that appears before this verse */
  heading?: string;
  
  /** ID for the section heading (for ESV compatibility) */
  headingId?: string;
  
  /** Raw HTML content if needed for specific rendering (ESV/NLT) */
  rawHtml?: string;
  
  // Psalm-specific fields
  /** Whether this verse contains a Selah marker */
  isSelah?: boolean;
  
  /** Poetry indentation level (0=normal, 1=q1 indent, 2=q2 indent) */
  poetryIndentLevel?: number;
  
  /** Whether there should be a stanza break after this verse */
  stanzaBreakAfter?: boolean;

  /** Whether there should be a stanza break before this verse */
  stanzaBreakBefore?: boolean;

  /** Hebrew letter for acrostic Psalms (e.g., "Aleph" for Psalm 119 in NLT) */
  acrosticLetter?: string;

  /** Alias for acrosticLetter - Hebrew letter heading (e.g., "Aleph", "Beth") */
  hebrewLetter?: string;

  /** Speaker label for dialogue (e.g., "Young Woman" in Song of Solomon) */
  speakerLabel?: string;
}

/**
 * Metadata specific to Psalms
 */
export interface PsalmMetadata {
  /** Psalm number (e.g., "105" or "119:1-8" for partial Psalms) */
  psalmNumber: string;
  
  /** Superscription/title (e.g., "A Psalm of David") */
  superscription?: string;
  
  /** Musical notation (e.g., "To the choirmaster: with stringed instruments") */
  musicalNotation?: string;
  
  /** Historical context note */
  historicalContext?: string;
  
  /** Quick check if Psalm contains any Selah markers */
  hasSelah: boolean;
  
  /** Section headings within the Psalm */
  sectionHeadings?: Array<{
    afterVerse: string;
    heading: string;
  }>;
  
  /** Stanza pattern (e.g., [8, 7, 6, 8] = verses per stanza) */
  stanzaPattern?: number[];
  
  /** Type of Psalm for specialized formatting */
  psalmType?: 'individual' | 'communal' | 'royal' | 'wisdom' | 'thanksgiving' | 'lament' | 'acrostic';
  
  /** For acrostic Psalms, the pattern of Hebrew letters */
  acrosticPattern?: Array<{
    letter: string;
    verses: string[];
  }>;

  /** Hebrew acrostic letters with their positions (NLT Psalm 119) */
  acrosticLetters?: Array<{
    letter: string;
    afterVerse: string;
  }>;

  /** Psalter book division (e.g., "Book One (Psalms 1-41)") */
  bookDivision?: string;
}

/**
 * Represents a full chapter in the unified format
 */
export interface UnifiedChapter {
  /** Full chapter reference (e.g., "John 3") */
  reference: string;
  
  /** Translation identifier (e.g., "ESV", "NLT", "KJV") */
  translation: BibleTranslation;
  
  /** Book name (e.g., "John") */
  bookName: string;
  
  /** Chapter number (e.g., "3") */
  chapterNumber: string;
  
  /** Array of verses in order */
  verses: UnifiedVerse[];
  
  /** Optional metadata */
  metadata?: {
    /** Copyright information */
    copyright?: string;
    
    /** Full book title (e.g., "The Gospel According to John") */
    bookTitle?: string;
    
    /** Translation full name (e.g., "English Standard Version") */
    translationName?: string;
  };
  
  /** Psalm-specific metadata (only present for Psalms) */
  psalmMetadata?: PsalmMetadata;
  
  /** Raw API response for debugging/fallback */
  rawResponse?: any;
}

/**
 * Parser interface that all translation parsers must implement
 */
export interface BibleParser {
  /**
   * Parse API response into unified format
   * @param apiResponse Raw response from the Bible API
   * @returns Unified chapter format
   */
  parse(apiResponse: any): UnifiedChapter;
  
  /**
   * Get parser name for debugging
   */
  getName(): string;
}