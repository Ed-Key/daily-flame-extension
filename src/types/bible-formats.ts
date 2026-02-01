// Unified Bible data format interfaces
// This standardizes how all Bible translations are represented internally

import { BibleTranslation } from './index';

/**
 * Represents a footnote extracted from the text
 */
export interface Footnote {
  /** The marker character (e.g., "*") */
  marker: string;
  /** The reference this footnote applies to (e.g., "7:8") */
  reference: string;
  /** The footnote content text */
  content: string;
  /** Type of footnote for categorization */
  type?: 'hebrew' | 'greek' | 'alternative' | 'cross-ref' | 'textualVariant' | 'other';
}

/**
 * Represents a row in a Bible table (genealogies, census lists, etc.)
 */
export interface BibleTableRow {
  /** Cell contents in order */
  cells: string[];
  /** Verse number if embedded in the row */
  verseNumber?: string;
}

/**
 * Represents a table structure in Bible text (genealogies, census lists, etc.)
 */
export interface BibleTable {
  /** Optional header row */
  headers?: string[];
  /** Data rows */
  rows: BibleTableRow[];
  /** Which verse this table follows */
  afterVerse?: string;
}

/**
 * Represents a single line in poetry formatting
 */
export interface PoetryLine {
  /** The text content of the line */
  text: string;
  /** Indentation level (1 = poet1, 2 = poet2, 3 = poet3) */
  indentLevel: 1 | 2 | 3;
  /** Whether there should be extra space before this line (-sp class) */
  hasSpaceBefore?: boolean;
  /** Whether this line contains words of Jesus */
  isRedLetter?: boolean;
}

/**
 * Represents a single prose paragraph line for multi-paragraph verses
 * (e.g., James 1:1 NLT has 3 separate paragraphs in one verse)
 */
export interface ProseLine {
  /** The text content of the prose paragraph */
  text: string;
  /** Whether this line contains words of Jesus */
  isRedLetter?: boolean;
}

/**
 * Represents a content block that can be either prose or poetry.
 * Used for verses with interspersed prose and poetry (e.g., Hebrews 1:5 NLT).
 * Preserves DOM order so content renders correctly.
 */
export interface MixedContentBlock {
  /** Type of content block */
  type: 'prose' | 'poetry';
  /** The text content */
  text: string;
  /** Indentation level (only for poetry: 1 = poet1, 2 = poet2, 3 = poet3) */
  indentLevel?: 1 | 2 | 3;
  /** Whether there should be extra space before this block (-sp class) */
  hasSpaceBefore?: boolean;
  /** Whether this block contains words of Jesus */
  isRedLetter?: boolean;
}

/**
 * Speaker label with position for Song of Solomon dialogues
 * Stores which poetry line index the speaker appears before
 */
export interface SpeakerLabel {
  /** The speaker text (e.g., "Young Woman", "Young Women of Jerusalem") */
  text: string;
  /** Index into poetryLines array - this speaker appears before the line at this index */
  beforeLineIndex: number;
}

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

  /** Speaker labels with positions for dialogue (e.g., Song of Solomon) */
  speakerLabels?: SpeakerLabel[];

  /** Footnotes extracted from this verse */
  footnotes?: Footnote[];

  /** Poetry lines with proper indent levels and spacing (replaces lines[] for NLT) */
  poetryLines?: PoetryLine[];

  /** Whether there should be extra space before this verse (-sp class in NLT) */
  hasSpaceBefore?: boolean;

  /** Whether this verse contains a Selah/Interlude marker */
  hasSelah?: boolean;

  /** Whether this verse starts a new paragraph (from source API) */
  startsParagraph?: boolean;

  /** Prose text that appears before poetry in the same verse (e.g., "Then Hannah prayed:") */
  proseBefore?: string;

  /** Prose text that appears after poetry in the same verse (e.g., "(For the choir director...)") */
  proseAfter?: string;

  /** Multi-paragraph prose lines for verses with multiple separate paragraphs (e.g., James 1:1 NLT) */
  proseLines?: ProseLine[];

  /** Mixed prose/poetry content in DOM order for verses with interspersed content (e.g., Hebrews 1:5) */
  mixedContent?: MixedContentBlock[];
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

  /** Tables extracted from chapter (genealogies, census lists, etc.) */
  tables?: BibleTable[];

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