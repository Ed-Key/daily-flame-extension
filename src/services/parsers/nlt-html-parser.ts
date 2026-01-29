/**
 * NLT HTML Parser - DOM-Based Implementation
 *
 * Uses DOMParser for reliable HTML parsing instead of regex.
 * This correctly handles nested elements, extracts footnotes as data,
 * and properly tracks poetry spacing with -sp classes.
 *
 * Based on analysis of all 66 books, the NLT API returns consistent HTML:
 * - All responses have <verse_export vn="X"> tags
 * - Standard classes: vn (verse number), red (Words of Jesus), poet1/poet2 (poetry)
 * - Footnotes: <a class="a-tn">*</a> + <span class="tn">...</span>
 *
 * Special elements:
 * - <p class="psa-title"> - Psalm superscriptions
 * - <p class="selah"> - Selah markers (displays "Interlude")
 * - <h5 class="psa-hebrew"> - Psalm 119 acrostic letters
 * - <h3 class="sos-speaker"> - Song of Solomon speaker labels
 * - <h2 class="psa-book"> - Psalter book divisions
 */

import {
  UnifiedChapter,
  UnifiedVerse,
  Footnote,
  PoetryLine,
  PsalmMetadata,
  BibleTable,
  BibleTableRow,
  SpeakerLabel
} from '../../types/bible-formats';

export interface ParsedVerse {
  verseNumber: string;
  text: string;
  heading?: string;
  isRedLetter: boolean;
  isFirstVerse: boolean;
  poetryIndentLevel?: number;
  stanzaBreakBefore?: boolean;
  hasSpaceBefore?: boolean;
  speakerLabels?: SpeakerLabel[];
  hebrewLetter?: string;
  footnotes?: Footnote[];
  poetryLines?: PoetryLine[];
  hasSelah?: boolean;
  rawHtml?: string;
  startsParagraph?: boolean;
  /** Prose text that appears before poetry in the same verse (e.g., "Then Hannah prayed:") */
  proseBefore?: string;
  /** Prose text that appears after poetry in the same verse (e.g., "(For the choir director...)") */
  proseAfter?: string;
}

/**
 * Preprocess NLT HTML to fix malformed tags
 *
 * The NLT API returns HTML with unclosed <p> tags before </verse_export>,
 * which causes the DOMParser to incorrectly nest subsequent verse_export
 * elements, merging verse content together.
 *
 * This function closes any unclosed <p> tags before each </verse_export>.
 */
function preprocessHTML(html: string): string {
  // Close unclosed <p> tags before </verse_export>
  // Pattern: find </verse_export> that has an unclosed <p> before it
  // We need to insert </p> before </verse_export> when there's an unmatched <p>

  // Split by </verse_export> and process each segment
  const segments = html.split('</verse_export>');

  return segments.map((segment, index) => {
    if (index === segments.length - 1) {
      // Last segment (after final </verse_export>), return as-is
      return segment;
    }

    // Count <p> and </p> tags in this segment
    const openPCount = (segment.match(/<p[\s>]/g) || []).length;
    const closePCount = (segment.match(/<\/p>/g) || []).length;

    // If there are more opens than closes, add closing tags
    const unclosedCount = openPCount - closePCount;
    if (unclosedCount > 0) {
      return segment + '</p>'.repeat(unclosedCount) + '</verse_export>';
    }

    return segment + '</verse_export>';
  }).join('');
}

/**
 * Parse HTML string to DOM Document
 * Works in both browser (native DOMParser) and Jest jsdom environment
 */
function parseHTML(html: string): Document {
  // DOMParser is available in:
  // 1. Chrome extension content scripts (native browser API)
  // 2. Jest with testEnvironment: 'jsdom' (provided by jest-environment-jsdom)

  // Preprocess to fix unclosed tags
  const fixedHtml = preprocessHTML(html);

  return new DOMParser().parseFromString(fixedHtml, 'text/html');
}

export class NLTHTMLParser {
  private debug = false;

  enableDebug(enable: boolean = true): void {
    this.debug = enable;
  }

  /**
   * Main entry point for parsing NLT HTML content
   */
  parseToUnified(htmlContent: string, reference: string): UnifiedChapter {
    if (this.debug) console.log('[NLT HTML Parser] Starting parse for:', reference);

    const doc = parseHTML(htmlContent);
    const verses = this.parseVerseExports(doc, htmlContent);

    if (verses.length === 0) {
      throw new Error('Unable to parse NLT content');
    }

    // Extract book name and chapter from reference
    const bookName = reference.replace(/\s+\d+.*$/, '').trim();
    const chapterMatch = reference.match(/\d+$/);
    const chapterNumber = chapterMatch ? chapterMatch[0] : '1';

    // Check if this is a Psalm and extract metadata
    const isPsalm = bookName.toLowerCase() === 'psalm' || bookName.toLowerCase() === 'psalms';
    let psalmMetadata: PsalmMetadata | undefined;

    if (isPsalm) {
      psalmMetadata = this.extractPsalmMetadata(doc, htmlContent);
    }

    // Extract tables (genealogies, census lists, etc.)
    const tables = this.extractTables(doc);

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
      hasSpaceBefore: verse.hasSpaceBefore,
      speakerLabels: verse.speakerLabels,
      hebrewLetter: verse.hebrewLetter,
      footnotes: verse.footnotes,
      poetryLines: verse.poetryLines,
      hasSelah: verse.hasSelah,
      isSelah: verse.hasSelah, // Keep backwards compatibility
      rawHtml: verse.rawHtml,
      startsParagraph: verse.startsParagraph,
      proseBefore: verse.proseBefore,
      proseAfter: verse.proseAfter,
    }));

    return {
      reference,
      translation: 'NLT',
      bookName,
      chapterNumber,
      verses: unifiedVerses,
      psalmMetadata,
      tables: tables.length > 0 ? tables : undefined
    };
  }

  /**
   * Parse all verse_export elements from NLT HTML using DOM
   */
  private parseVerseExports(doc: Document, htmlContent: string): ParsedVerse[] {
    const verses: ParsedVerse[] = [];

    // Use querySelectorAll to get all verse_export elements
    const verseElements = doc.querySelectorAll('verse_export');

    if (this.debug) console.log('[NLT Parser] Found verse_export elements:', verseElements.length);

    if (verseElements.length === 0) {
      // Fallback: try regex if DOM didn't find elements (malformed HTML)
      return this.parseVerseExportsRegex(htmlContent);
    }

    verseElements.forEach((element, index) => {
      const verseNumber = element.getAttribute('vn') || String(index + 1);
      const verse = this.parseVerseElement(element as HTMLElement, verseNumber, index === 0);
      verses.push(verse);
    });

    return verses;
  }

  /**
   * Fallback regex parser for malformed HTML
   */
  private parseVerseExportsRegex(htmlContent: string): ParsedVerse[] {
    const verses: ParsedVerse[] = [];
    const versePattern = /<verse_export[^>]*vn="(\d+)"[^>]*>([\s\S]*?)<\/verse_export>/g;
    const matches = [...htmlContent.matchAll(versePattern)];

    if (this.debug) console.log('[NLT Parser] Fallback regex found:', matches.length);

    matches.forEach((match, index) => {
      const verseNumber = match[1];
      const verseHtml = match[2];

      // Create a temporary document for this verse
      const doc = parseHTML(`<div>${verseHtml}</div>`);
      const container = doc.body.firstChild as HTMLElement;

      if (container) {
        const verse = this.parseVerseElement(container, verseNumber, index === 0);
        verses.push(verse);
      }
    });

    return verses;
  }

  /**
   * Parse a single verse_export element using DOM methods
   */
  private parseVerseElement(element: HTMLElement, verseNumber: string, isFirst: boolean): ParsedVerse {
    // Capture raw HTML before modification
    const rawHtml = element.outerHTML || element.innerHTML;

    // Clone the element so we don't modify the original
    const el = element.cloneNode(true) as HTMLElement;

    let heading: string | undefined;
    let isRedLetter = false;
    let poetryIndentLevel: number | undefined;
    let stanzaBreakBefore = false;
    let hasSpaceBefore = false;
    const speakerLabels: SpeakerLabel[] = [];
    let hebrewLetter: string | undefined;
    let isFirstVerse = isFirst;
    const footnotes: Footnote[] = [];
    const poetryLines: PoetryLine[] = [];
    let hasSelah = false;
    let startsParagraph = false;

    // Detect if verse starts a new paragraph via <p class="body*"> wrapper
    // NLT uses body, body-hd, body-ch-hd, body-sp classes for paragraph starts
    const bodyParagraph = el.querySelector('p.body, p.body-hd, p.body-ch-hd, p.body-sp');
    if (bodyParagraph) {
      // Check if this paragraph contains the verse number (indicating verse starts the paragraph)
      const vnInP = bodyParagraph.querySelector('span.vn');
      if (vnInP) startsParagraph = true;
    }
    // First verse always starts a paragraph
    if (isFirst) startsParagraph = true;

    // Check for chapter number (marks first verse)
    // NLT uses various formats:
    // - <h2 class="chapter-number"><span class="cw">Book</span> <span class="cw_ch">1</span></h2>
    // - <h3 class="chapter-number">...</h3>
    // - <span class="cw_ch">1</span> (standalone)
    // - <cn>1</cn> (simple format in some responses)
    const chapterHeader = el.querySelector('h2.chapter-number, h3.chapter-number');
    if (chapterHeader) {
      isFirstVerse = true;
      chapterHeader.remove();
    }

    // Check for <cn> tag (simpler chapter number format)
    const cnTag = el.querySelector('cn');
    if (cnTag) {
      isFirstVerse = true;
      cnTag.remove();
    }

    // Also remove standalone chapter number spans (cw = chapter word, cw_ch = chapter number)
    el.querySelectorAll('span.cw, span.cw_ch').forEach(n => n.remove());

    // Extract section heading
    // NLT uses various formats:
    // - <h3 class="subhead">...</h3> or <h4 class="subhead">
    // - <sn>...</sn> (simpler format in some responses)
    const subhead = el.querySelector('h3.subhead, h4.subhead');
    if (subhead) {
      heading = this.getCleanText(subhead);
      subhead.remove();
    }

    // Check for <sn> tag (simpler section name format)
    const snTag = el.querySelector('sn');
    if (snTag) {
      heading = this.getCleanText(snTag);
      snTag.remove();
    }

    // Extract Song of Solomon speaker labels with position info
    // We need to track which poetry line each speaker appears before
    // Walk DOM elements in order to capture positions
    const allSpeakersAndPoetry = el.querySelectorAll('h3.sos-speaker, [class*="poet1"], [class*="poet2"], [class*="poet3"]');
    let poetryLineIndex = 0;

    allSpeakersAndPoetry.forEach(element => {
      if (element.classList.contains('sos-speaker')) {
        // This is a speaker label - record its position
        const clone = element.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('a.a-tn, span.tn').forEach(n => n.remove());
        const speakerText = this.getCleanText(clone);

        if (speakerText) {
          speakerLabels.push({
            text: speakerText,
            beforeLineIndex: poetryLineIndex
          });
        }
      } else {
        // This is a poetry line - increment counter
        poetryLineIndex++;
      }
    });

    // Remove ALL speaker labels from DOM to prevent leakage into verse.text
    el.querySelectorAll('h3.sos-speaker').forEach(s => s.remove());

    // Extract Hebrew acrostic letter (Psalm 119)
    const hebrewEl = el.querySelector('h5.psa-hebrew');
    if (hebrewEl) {
      hebrewLetter = this.getCleanText(hebrewEl);
      hebrewEl.remove();
    }

    // Check for red letter text (Words of Jesus)
    // NLT uses: <span class="red">, <span class="red-sc">, or just <red>
    isRedLetter = el.querySelector('span.red, span.red-sc, red') !== null;

    // Extract footnotes BEFORE removing them
    this.extractFootnotes(el, verseNumber, footnotes);

    // Remove footnote markers and content (now that we've captured them)
    el.querySelectorAll('a.a-tn').forEach(n => n.remove());
    el.querySelectorAll('span.tn').forEach(n => n.remove());

    // Check for and remove Psalm-specific elements that are handled at chapter level
    const psaBook = el.querySelector('h2.psa-book');
    if (psaBook) psaBook.remove();

    const psaTitle = el.querySelector('p.psa-title');
    if (psaTitle) psaTitle.remove();

    // Check for Selah marker
    const selahEl = el.querySelector('p.selah');
    if (selahEl) {
      hasSelah = true;
      selahEl.remove();
    }

    // Remove verse number spans
    el.querySelectorAll('span.vn').forEach(n => n.remove());

    // Extract poetry structure with proper spacing
    const poetryResult = this.extractPoetryStructure(el);
    if (poetryResult.hasPoetry) {
      poetryIndentLevel = poetryResult.maxIndentLevel;
      poetryLines.push(...poetryResult.lines);
      hasSpaceBefore = poetryResult.hasSpaceBeforeFirst;
    }

    // Extract prose that appears BEFORE poetry (e.g., "Then Hannah prayed:" in 1 Samuel 2:1)
    let proseBefore: string | undefined;
    if (poetryResult.hasPoetry && poetryResult.lines.length > 0) {
      // Find prose paragraphs that come BEFORE the first poetry element
      const allParagraphs = Array.from(el.querySelectorAll('p'));
      const firstPoetryEl = el.querySelector('[class*="poet1"], [class*="poet2"], [class*="poet3"]');

      const proseTexts: string[] = [];
      for (const p of allParagraphs) {
        // Stop when we reach poetry
        if (p === firstPoetryEl || p.className.includes('poet')) break;

        // Skip headings/chapter markers (already handled separately)
        if (p.className.includes('subhead') || p.className.includes('chapter')) continue;
        // Skip Psalm title (handled at chapter level)
        if (p.className.includes('psa-title')) continue;
        // Skip Selah markers
        if (p.className.includes('selah')) continue;

        // Clone to safely extract text without modifying original
        const pClone = p.cloneNode(true) as HTMLElement;
        // Remove verse number spans from the clone
        pClone.querySelectorAll('span.vn').forEach(n => n.remove());
        // Remove footnote content from clone
        pClone.querySelectorAll('a.a-tn, span.tn').forEach(n => n.remove());

        const pText = this.getCleanText(pClone).trim();
        if (pText) proseTexts.push(pText);
      }

      if (proseTexts.length > 0) {
        proseBefore = proseTexts.join(' ');
      }

      // Fallback: extract bare text (not in <p> tags) before poetry
      // This handles cases like Numbers 21:27 where prose is a text node
      if (!proseBefore && firstPoetryEl) {
        const bareText = this.extractBareTextBeforePoetry(el, firstPoetryEl);
        if (bareText) {
          proseBefore = bareText;
        }
      }
    }

    // Extract prose that appears AFTER poetry (e.g., "(For the choir director...)" in Habakkuk 3:19)
    let proseAfter: string | undefined;
    if (poetryResult.hasPoetry && poetryResult.lines.length > 0) {
      const afterText = this.extractProseAfterPoetry(el);
      if (afterText) {
        proseAfter = afterText;
      }
    }

    // Check for -sp class on any element (space before)
    if (!hasSpaceBefore) {
      const spElements = el.querySelectorAll('[class*="-sp"]');
      hasSpaceBefore = spElements.length > 0;
    }

    // Check for stanza break before (-sp indicates this in NLT)
    stanzaBreakBefore = hasSpaceBefore;

    // Get the final clean text
    const plainText = this.getCleanText(el);

    return {
      verseNumber,
      text: plainText,
      heading,
      isRedLetter,
      isFirstVerse,
      poetryIndentLevel,
      stanzaBreakBefore: stanzaBreakBefore || undefined,
      hasSpaceBefore: hasSpaceBefore || undefined,
      speakerLabels: speakerLabels.length > 0 ? speakerLabels : undefined,
      hebrewLetter,
      footnotes: footnotes.length > 0 ? footnotes : undefined,
      poetryLines: poetryLines.length > 0 ? poetryLines : undefined,
      hasSelah: hasSelah || undefined,
      rawHtml,
      startsParagraph: startsParagraph || undefined,
      proseBefore: proseBefore || undefined,
      proseAfter: proseAfter || undefined
    };
  }

  /**
   * Extract footnotes from an element before removing them
   */
  private extractFootnotes(el: HTMLElement, verseNumber: string, footnotes: Footnote[]): void {
    const footnoteSpans = el.querySelectorAll('span.tn');

    footnoteSpans.forEach(span => {
      const refEl = span.querySelector('span.tn-ref');
      const reference = refEl ? this.getCleanText(refEl) : verseNumber;

      // Clone and remove the reference span to get just the content
      const contentClone = span.cloneNode(true) as HTMLElement;
      contentClone.querySelectorAll('span.tn-ref').forEach(n => n.remove());
      const content = this.getCleanText(contentClone);

      if (content) {
        // Determine footnote type
        let type: Footnote['type'] = 'other';
        const lowerContent = content.toLowerCase();

        if (lowerContent.includes('hebrew')) {
          type = 'hebrew';
        } else if (lowerContent.includes('greek')) {
          type = 'greek';
        } else if (lowerContent.includes('manuscripts')) {
          type = 'textualVariant';
        } else if (lowerContent.startsWith('or ') || lowerContent.includes('or ')) {
          type = 'alternative';
        } else if (lowerContent.includes('compare') || lowerContent.includes('see ')) {
          type = 'cross-ref';
        }

        footnotes.push({
          marker: '*',
          reference,
          content,
          type
        });
      }
    });
  }

  /**
   * Extract poetry structure from verse element
   */
  private extractPoetryStructure(el: HTMLElement): {
    hasPoetry: boolean;
    lines: PoetryLine[];
    maxIndentLevel: number;
    hasSpaceBeforeFirst: boolean;
  } {
    const lines: PoetryLine[] = [];
    let maxIndentLevel = 0;
    let hasSpaceBeforeFirst = false;

    // Look for poetry paragraphs (poet1, poet2, poet3)
    const poetryElements = el.querySelectorAll('[class*="poet1"], [class*="poet2"], [class*="poet3"]');

    poetryElements.forEach((poetEl, index) => {
      const className = poetEl.className;

      // Determine indent level
      let indentLevel: 1 | 2 | 3 = 1;
      if (className.includes('poet3')) {
        indentLevel = 3;
      } else if (className.includes('poet2')) {
        indentLevel = 2;
      }
      maxIndentLevel = Math.max(maxIndentLevel, indentLevel);

      // Check for -sp suffix (space before this element)
      const hasSpaceBefore = className.includes('-sp');
      if (index === 0 && hasSpaceBefore) {
        hasSpaceBeforeFirst = true;
      }

      // Check for red letter
      const isRedLetter = poetEl.querySelector('span.red, span.red-sc') !== null;

      // Get text content
      const text = this.getCleanText(poetEl);

      if (text) {
        lines.push({
          text,
          indentLevel,
          hasSpaceBefore: hasSpaceBefore || undefined,
          isRedLetter: isRedLetter || undefined
        });
      }
    });

    return {
      hasPoetry: lines.length > 0,
      lines,
      maxIndentLevel,
      hasSpaceBeforeFirst
    };
  }

  /**
   * Get clean text content from an element
   */
  private getCleanText(el: Element): string {
    return (el.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract bare text that appears before poetry (not wrapped in <p> tags)
   *
   * This handles cases like Numbers 21:27 where prose intro is a text node
   * or in inline elements rather than wrapped in a paragraph:
   *   <span class="vn">27</span>Therefore, the ancient poets wrote this about him:<p>
   *   <p class="poet1">Poetry...</p>
   *
   * @param el The verse element to search
   * @param firstPoetryEl The first poetry element found
   * @returns The bare text prose, or null if none found
   */
  private extractBareTextBeforePoetry(el: HTMLElement, firstPoetryEl: Element): string | null {
    const textParts: string[] = [];

    for (const node of Array.from(el.childNodes)) {
      // Stop when we reach the poetry element
      if (node === firstPoetryEl) break;

      // Check if this is an element containing the poetry
      if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as Element;
        if (elem.contains(firstPoetryEl)) break;
        if (elem.className?.includes('poet')) break;
      }

      // Collect text from text nodes
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.textContent || '').trim();
        if (text) textParts.push(text);
      }

      // Collect text from inline elements (skip verse numbers, footnotes, headings)
      if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as Element;
        const tagName = elem.tagName.toLowerCase();

        // Skip verse numbers
        if (elem.classList?.contains('vn')) continue;
        // Skip footnotes
        if (elem.classList?.contains('a-tn') || elem.classList?.contains('tn')) continue;
        // Skip headings (already handled separately)
        if (['h2', 'h3', 'h4', 'h5'].includes(tagName)) continue;
        // Skip poetry elements
        if (elem.className?.includes('poet')) continue;
        // Skip chapter number elements
        if (elem.classList?.contains('cw') || elem.classList?.contains('cw_ch')) continue;
        if (tagName === 'cn') continue;

        // Orphan <p> (empty or no class) often signals poetry section start
        if (tagName === 'p' && (!elem.className || elem.className.trim() === '')) break;

        const elemText = (elem.textContent || '').trim();
        if (elemText) textParts.push(elemText);
      }
    }

    if (textParts.length === 0) return null;
    return textParts.join(' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Extract prose that appears AFTER poetry
   *
   * Handles cases like Habakkuk 3:19: "(For the choir director...)"
   * These are trailing prose explanations in parentheses after poetry sections.
   *
   * @param el The verse element to search
   * @returns The prose text after poetry, or null if none found
   */
  private extractProseAfterPoetry(el: HTMLElement): string | null {
    // Find all poetry elements
    const poetryElements = Array.from(el.querySelectorAll('[class*="poet1"], [class*="poet2"], [class*="poet3"]'));
    if (poetryElements.length === 0) return null;

    const lastPoetryEl = poetryElements[poetryElements.length - 1];

    // Find paragraphs that come AFTER the last poetry element
    const allParagraphs = Array.from(el.querySelectorAll('p'));
    const proseTexts: string[] = [];
    let foundLastPoetry = false;

    for (const p of allParagraphs) {
      // Skip until we pass the last poetry element
      if (p === lastPoetryEl || p.className?.includes('poet')) {
        foundLastPoetry = true;
        continue;
      }

      if (!foundLastPoetry) continue;

      // Skip headings and special elements
      if (p.className?.includes('subhead') || p.className?.includes('chapter')) continue;
      if (p.className?.includes('psa-title') || p.className?.includes('selah')) continue;

      // Extract text from body paragraphs after poetry
      // Classes: body-fl-sp, body-sp, body-fl, body
      if (p.className?.includes('body')) {
        const pClone = p.cloneNode(true) as HTMLElement;
        pClone.querySelectorAll('span.vn, a.a-tn, span.tn').forEach(n => n.remove());
        const pText = this.getCleanText(pClone).trim();
        if (pText) proseTexts.push(pText);
      }
    }

    if (proseTexts.length === 0) return null;
    return proseTexts.join(' ');
  }

  /**
   * Extract Psalm-specific metadata from NLT HTML
   */
  extractPsalmMetadata(doc: Document, htmlContent: string): PsalmMetadata {
    const metadata: PsalmMetadata = {
      psalmNumber: '',
      hasSelah: false
    };

    // Extract Psalm number from reference header
    const header = doc.querySelector('h2.bk_ch_vs_header');
    if (header) {
      const headerText = header.textContent || '';
      const psalmMatch = headerText.match(/Psalm\s+(\d+)/i);
      if (psalmMatch) {
        metadata.psalmNumber = psalmMatch[1];
      }
    }

    // Extract superscription (<p class="psa-title">)
    const titleEl = doc.querySelector('p.psa-title');
    if (titleEl) {
      // Clone and remove footnotes
      const clone = titleEl.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('a.a-tn, span.tn').forEach(n => n.remove());
      metadata.superscription = this.getCleanText(clone);
    }

    // Find Selah markers
    const selahElements = doc.querySelectorAll('p.selah');
    if (selahElements.length > 0) {
      metadata.hasSelah = true;
    }

    // Find Hebrew acrostic letters
    const hebrewLetters: Array<{ letter: string; afterVerse: string }> = [];
    const hebrewElements = doc.querySelectorAll('h5.psa-hebrew');

    hebrewElements.forEach(hebrewEl => {
      const letter = this.getCleanText(hebrewEl);

      // Find the preceding verse number
      // Look at previous sibling verse_export elements
      let prevEl = hebrewEl.previousElementSibling;
      let afterVerse = '0';

      while (prevEl) {
        if (prevEl.tagName.toLowerCase() === 'verse_export') {
          afterVerse = prevEl.getAttribute('vn') || '0';
          break;
        }
        prevEl = prevEl.previousElementSibling;
      }

      hebrewLetters.push({ letter, afterVerse });
    });

    if (hebrewLetters.length > 0) {
      metadata.acrosticLetters = hebrewLetters;
      metadata.psalmType = 'acrostic';
    }

    // Extract book division (<h2 class="psa-book">)
    const bookEl = doc.querySelector('h2.psa-book');
    if (bookEl) {
      metadata.bookDivision = this.getCleanText(bookEl);
    }

    return metadata;
  }

  /**
   * Extract tables from NLT HTML (genealogies, census lists, etc.)
   *
   * NLT tables use:
   * - <table class="col2a"> or similar class
   * - <td class="table-head"> for headers
   * - <td class="table-col"> for data cells
   * - <span class="vn"> for embedded verse numbers
   */
  extractTables(doc: Document): BibleTable[] {
    const tables: BibleTable[] = [];
    const tableElements = doc.querySelectorAll('table');

    tableElements.forEach(tableEl => {
      const table: BibleTable = {
        rows: []
      };

      // Find the preceding verse number to know where this table belongs
      let prevEl = tableEl.previousElementSibling;
      let afterVerse: string | undefined;

      while (prevEl) {
        if (prevEl.tagName.toLowerCase() === 'verse_export') {
          afterVerse = prevEl.getAttribute('vn') || undefined;
          break;
        }
        prevEl = prevEl.previousElementSibling;
      }

      if (afterVerse) {
        table.afterVerse = afterVerse;
      }

      // Process rows
      const rowElements = tableEl.querySelectorAll('tr');

      rowElements.forEach((rowEl, rowIndex) => {
        const cells: string[] = [];
        let verseNumber: string | undefined;

        // Check if this is a header row (first row with table-head cells)
        const headerCells = rowEl.querySelectorAll('td.table-head, th');
        if (headerCells.length > 0 && rowIndex === 0) {
          // This is a header row
          const headers: string[] = [];
          headerCells.forEach(cell => {
            headers.push(this.getCleanText(cell));
          });
          table.headers = headers;
          return; // Skip to next row
        }

        // Process data cells
        const dataCells = rowEl.querySelectorAll('td');
        dataCells.forEach(cell => {
          // Check for embedded verse number
          const vnSpan = cell.querySelector('span.vn');
          if (vnSpan) {
            verseNumber = this.getCleanText(vnSpan);
            vnSpan.remove();
          }

          cells.push(this.getCleanText(cell));
        });

        if (cells.length > 0) {
          const row: BibleTableRow = { cells };
          if (verseNumber) {
            row.verseNumber = verseNumber;
          }
          table.rows.push(row);
        }
      });

      if (table.rows.length > 0) {
        tables.push(table);
      }
    });

    return tables;
  }
}
