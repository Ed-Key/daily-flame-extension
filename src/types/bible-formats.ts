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

/**
 * Options for verse rendering
 */
export interface VerseRenderOptions {
  /** Whether to highlight a specific verse */
  highlightVerse?: string;
  
  /** Whether to show verse numbers */
  showVerseNumbers?: boolean;
  
  /** Whether to show section headings */
  showHeadings?: boolean;
  
  /** Custom CSS class prefix */
  cssPrefix?: string;
}