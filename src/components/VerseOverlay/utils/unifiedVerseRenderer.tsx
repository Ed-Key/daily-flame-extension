import React from 'react';
import { UnifiedChapter, UnifiedVerse, PsalmMetadata, PoetryLine } from '../../../types/bible-formats';

/**
 * Render poetry lines with proper indentation and spacing
 * Uses the new PoetryLine structure from the NLT parser
 */
function renderPoetryLines(
  poetryLines: PoetryLine[],
  verseNumber: string,
  shouldShowVerseNumber: boolean,
  isHighlighted: boolean,
  hasSelah?: boolean
): React.JSX.Element {
  return (
    <div
      key={`verse-${verseNumber}`}
      className={`verse-with-poetry ${isHighlighted ? 'highlighted-verse' : ''}`}
    >
      {poetryLines.map((line, lineIndex) => {
        const lineClasses = [
          'poetry-line',
          `poetry-indent-${line.indentLevel}`,
          line.hasSpaceBefore ? 'stanza-space-before' : '',
        ].filter(Boolean).join(' ');

        return (
          <div key={`${verseNumber}-line-${lineIndex}`} className={lineClasses}>
            {lineIndex === 0 && shouldShowVerseNumber && (
              <sup className="context-verse-number">{verseNumber}</sup>
            )}
            <span className="poetry-line-text">
              {line.isRedLetter ? (
                <span className="words-of-jesus">{line.text}</span>
              ) : (
                line.text
              )}
            </span>
          </div>
        );
      })}
      {hasSelah && <span className="selah-marker">Selah</span>}
    </div>
  );
}

/**
 * Check if a verse number falls within the highlighted range
 */
function isVerseInRange(verseNum: number, startVerse: number | null, endVerse: number | null): boolean {
  if (startVerse === null || endVerse === null) return false;
  return verseNum >= startVerse && verseNum <= endVerse;
}

/**
 * Check if a verse should be skipped (empty text)
 * This handles NLT textual variants and list sections where verse content is empty
 * The footnote on the previous verse typically explains why
 */
function shouldSkipVerse(verse: UnifiedVerse): boolean {
  // Skip verses with no text content
  // These are typically:
  // 1. Textual variants (verses in later manuscripts not included in NLT)
  // 2. List/table sections where content is formatted differently
  return !verse.text || verse.text.trim().length === 0;
}

/**
 * Renders verses from unified chapter format
 * Maintains translation-specific styling while using standardized data
 */
export const renderUnifiedVerses = ({
  chapterContent,
  startVerse,
  endVerse
}: {
  chapterContent: UnifiedChapter;
  startVerse: number | null;
  endVerse: number | null;
}): React.JSX.Element[] => {
  if (!chapterContent || !chapterContent.verses || chapterContent.verses.length === 0) {
    return [];
  }

  const { translation, verses, chapterNumber, psalmMetadata } = chapterContent;
  
  // Determine rendering style based on translation
  const useKJVFormatting = translation === 'KJV' || translation === 'ASV';
  const useESVFormatting = translation === 'ESV';
  const useNLTFormatting = translation === 'NLT';

  // For ESV and NLT, use special formatting with floating chapter numbers
  if (useESVFormatting || useNLTFormatting) {
    return renderESVStyle(verses, chapterNumber, startVerse, endVerse, translation, psalmMetadata);
  }

  // For KJV/ASV, each verse is its own paragraph
  if (useKJVFormatting) {
    return renderKJVStyle(verses, startVerse, endVerse, psalmMetadata);
  }

  // For other translations, group verses by natural paragraphs
  return renderStandardStyle(verses, startVerse, endVerse, psalmMetadata);
};

/**
 * Render ESV/NLT style with floating chapter number and grouped paragraphs
 */
function renderESVStyle(
  verses: UnifiedVerse[],
  chapterNumber: string,
  startVerse: number | null,
  endVerse: number | null,
  translation: string,
  psalmMetadata?: PsalmMetadata
): React.JSX.Element[] {
  const content: React.JSX.Element[] = [];
  
  // Add Psalm superscription if present
  if (psalmMetadata?.superscription) {
    content.push(
      <div key="psalm-superscription" className="psalm-superscription">
        {psalmMetadata.superscription}
      </div>
    );
  }
  
  let currentParagraph: React.JSX.Element[] = [];
  let paragraphKey = 0;
  let isFirstParagraph = true;
  let lastHeading: string | undefined;

  verses.forEach((verse, index) => {
    // Skip empty verses (textual variants, list sections)
    if (shouldSkipVerse(verse)) {
      return;
    }

    const verseNum = parseInt(verse.number);
    const isHighlighted = isVerseInRange(verseNum, startVerse, endVerse);

    // Handle section headings
    if (verse.heading && verse.heading !== lastHeading) {
      // Finish current paragraph if any
      if (currentParagraph.length > 0) {
        finishParagraph();
      }
      
      content.push(
        <h3 key={`heading-${verse.headingId || index}`} className="esv-heading">
          {verse.heading}
        </h3>
      );
      lastHeading = verse.heading;
    }
    
    // Determine if this verse is block-level (poetry) - needed for verse number logic
    const isBlockLevel = Boolean(
      (verse.poetryLines && verse.poetryLines.length > 0) ||
      (verse.lines && verse.lines.length > 0)
    );

    // For verse 1: show number only if poetry (no chapter number shown)
    // For other verses: always show number
    const shouldShowVerseNumber = verse.number !== '1' || index > 0 || isBlockLevel;
    
    // Apply poetry indentation if specified
    const verseClasses = [
      isHighlighted ? 'highlighted-verse' : '',
      verse.poetryIndentLevel === 1 ? 'poetry-indent-1' : '',
      verse.poetryIndentLevel === 2 ? 'poetry-indent-2' : '',
      verse.isSelah ? 'verse-with-selah' : ''
    ].filter(Boolean).join(' ');
    
    // Create verse element - prioritize new poetryLines structure, fall back to old lines format
    let verseElement: React.JSX.Element;

    if (verse.poetryLines && verse.poetryLines.length > 0) {
      // New poetry format with proper spacing info (from NLT parser)
      verseElement = renderPoetryLines(
        verse.poetryLines,
        verse.number,
        shouldShowVerseNumber,
        isHighlighted,
        verse.hasSelah || verse.isSelah
      );
    } else if (verse.lines && verse.lines.length > 0) {
      // Legacy format: verse.lines is string[] (for ESV compatibility)
      verseElement = (
        <div key={`verse-${verse.number}`} className={`verse-with-lines ${verseClasses}`}>
          {verse.lines.map((line, lineIndex) => (
            <div key={`${verse.number}-line-${lineIndex}`} className="verse-line-wrapper">
              {lineIndex === 0 && shouldShowVerseNumber && (
                <sup className="context-verse-number">{verse.number}</sup>
              )}
              <span className={`verse-line ${lineIndex === 1 ? 'continuation-line' : ''}`}>
                {verse.isRedLetter ? (
                  <span className="words-of-jesus">{line}</span>
                ) : (
                  line
                )}
                {verse.lines && lineIndex === verse.lines.length - 1 && verse.isSelah && (
                  <span className="selah-marker">Selah</span>
                )}
              </span>
            </div>
          ))}
        </div>
      );
    } else {
      // Regular verse rendering (prose, no line breaks)
      const spaceBeforeClass = verse.hasSpaceBefore ? 'verse-space-before' : '';
      verseElement = (
        <span key={`verse-${verse.number}`} className={`${verseClasses} ${spaceBeforeClass}`.trim()}>
          {shouldShowVerseNumber && <sup className="context-verse-number">{verse.number}</sup>}
          <span className="verse-text-content">
            {verse.isRedLetter ? (
              <span className="words-of-jesus">{verse.text}</span>
            ) : (
              verse.text
            )}
            {(verse.isSelah || verse.hasSelah) && <span className="selah-marker">Selah</span>}
            {' '}
          </span>
        </span>
      );
    }
    
    // isBlockLevel already calculated above for verse number logic
    if (isBlockLevel) {
      // Flush any accumulated prose first
      if (currentParagraph.length > 0) {
        finishParagraph();
      }

      // Handle first verse being poetry - still need to show chapter number
      if (isFirstParagraph) {
        content.push(
          <div key={`para-with-chapter-${paragraphKey++}`} className="esv-chapter-container">
            {!isBlockLevel && <div className="esv-chapter-number">{chapterNumber}</div>}
            <div className="context-paragraph esv-format esv-first-paragraph poetry-block">
              {verseElement}
            </div>
          </div>
        );
        isFirstParagraph = false;
      } else {
        // Add block element directly to content (not wrapped in <p>)
        content.push(verseElement);
      }

      // Handle stanza breaks after block content
      if (verse.stanzaBreakAfter) {
        content.push(
          <div key={`stanza-break-${verse.number}`} className="stanza-break-spacer" />
        );
      }
    } else {
      // Inline element - add to current paragraph
      currentParagraph.push(verseElement);

      // For ESV/NLT, we'll group verses into paragraphs
      // Use semantic paragraph breaks from API (next verse starts a new paragraph)
      // or stanza breaks for poetry sections
      const nextVerse = verses[index + 1];
      const shouldBreakParagraph = verse.stanzaBreakAfter ||
                                   (nextVerse && nextVerse.startsParagraph) ||
                                   index === verses.length - 1;

      if (shouldBreakParagraph) {
        finishParagraph(verse.stanzaBreakAfter);
      }
    }
  });
  
  // Make sure to finish any remaining paragraph
  if (currentParagraph.length > 0) {
    finishParagraph();
  }
  
  function finishParagraph(hasStanzaBreak?: boolean) {
    if (currentParagraph.length === 0) return;
    
    const paragraphClasses = [
      'context-paragraph',
      'esv-format',
      hasStanzaBreak ? 'stanza-break' : ''
    ].filter(Boolean).join(' ');
    
    if (isFirstParagraph) {
      // First paragraph includes the floating chapter number
      content.push(
        <div key={`para-with-chapter-${paragraphKey++}`} className="esv-chapter-container">
          <div className="esv-chapter-number">{chapterNumber}</div>
          <p className={`${paragraphClasses} esv-first-paragraph`}>
            {currentParagraph}
          </p>
        </div>
      );
      isFirstParagraph = false;
    } else {
      content.push(
        <p key={`para-${paragraphKey++}`} className={paragraphClasses}>
          {currentParagraph}
        </p>
      );
    }
    currentParagraph = [];
  }
  
  return [
    <div key={`${translation.toLowerCase()}-chapter`} className="esv-content">
      {content}
    </div>
  ];
}

/**
 * Render KJV/ASV style where each verse is its own paragraph
 */
function renderKJVStyle(verses: UnifiedVerse[], startVerse: number | null, endVerse: number | null, psalmMetadata?: PsalmMetadata): React.JSX.Element[] {
  const elements: React.JSX.Element[] = [];
  
  // Add Psalm superscription if present
  if (psalmMetadata?.superscription) {
    elements.push(
      <div key="psalm-superscription" className="psalm-superscription">
        {psalmMetadata.superscription}
      </div>
    );
  }
  
  // Filter out empty verses (textual variants, list sections)
  const filteredVerses = verses.filter(verse => !shouldSkipVerse(verse));

  const verseElements = filteredVerses.map(verse => {
    const verseNum = parseInt(verse.number);
    const isHighlighted = isVerseInRange(verseNum, startVerse, endVerse);

    // Handle section headings
    const elements: React.JSX.Element[] = [];
    if (verse.heading) {
      elements.push(
        <h3 key={`heading-${verse.number}`} className="esv-heading">
          {verse.heading}
        </h3>
      );
    }
    
    // Apply poetry indentation and other Psalm-specific classes
    const verseClasses = [
      'context-paragraph',
      'kjv-verse',
      isHighlighted ? 'highlighted-verse' : '',
      verse.poetryIndentLevel === 1 ? 'poetry-indent-1' : '',
      verse.poetryIndentLevel === 2 ? 'poetry-indent-2' : '',
      verse.isSelah ? 'verse-with-selah' : '',
      verse.stanzaBreakAfter ? 'stanza-break' : ''
    ].filter(Boolean).join(' ');
    
    elements.push(
      <p key={`verse-${verse.number}`} className={verseClasses}>
        <strong className="context-verse-number">{verse.number}</strong>
        <span className="verse-text-content">
          {verse.isRedLetter ? (
            <span className="words-of-jesus">{verse.text}</span>
          ) : (
            verse.text
          )}
          {verse.isSelah && <span className="selah-marker">Selah</span>}
        </span>
      </p>
    );
    
    return elements;
  }).flat();
  
  return elements.concat(verseElements);
}

/**
 * Render standard style with verses grouped in paragraphs
 */
function renderStandardStyle(verses: UnifiedVerse[], startVerse: number | null, endVerse: number | null, psalmMetadata?: PsalmMetadata): React.JSX.Element[] {
  const paragraphs: React.JSX.Element[] = [];
  
  // Add Psalm superscription if present
  if (psalmMetadata?.superscription) {
    paragraphs.push(
      <div key="psalm-superscription" className="psalm-superscription">
        {psalmMetadata.superscription}
      </div>
    );
  }
  
  let currentParagraph: React.JSX.Element[] = [];
  let paragraphKey = 0;

  verses.forEach((verse, index) => {
    // Skip empty verses (textual variants, list sections)
    if (shouldSkipVerse(verse)) {
      return;
    }

    const verseNum = parseInt(verse.number);
    const isHighlighted = isVerseInRange(verseNum, startVerse, endVerse);

    // Handle section headings
    if (verse.heading) {
      // Finish current paragraph
      if (currentParagraph.length > 0) {
        paragraphs.push(
          <p key={`para-${paragraphKey++}`} className="context-paragraph">
            {currentParagraph}
          </p>
        );
        currentParagraph = [];
      }
      
      paragraphs.push(
        <h3 key={`heading-${verse.number}`} className="esv-heading">
          {verse.heading}
        </h3>
      );
    }
    
    // Apply poetry indentation and other Psalm-specific classes
    const verseClasses = [
      isHighlighted ? 'highlighted-verse' : '',
      verse.poetryIndentLevel === 1 ? 'poetry-indent-1' : '',
      verse.poetryIndentLevel === 2 ? 'poetry-indent-2' : '',
      verse.isSelah ? 'verse-with-selah' : ''
    ].filter(Boolean).join(' ');
    
    // Add verse to current paragraph
    currentParagraph.push(
      <span key={`verse-${verse.number}`} className={verseClasses}>
        <sup className="context-verse-number">{verse.number}</sup>
        <span className="verse-text-content">
          {verse.isRedLetter ? (
            <span className="words-of-jesus">{verse.text}</span>
          ) : (
            verse.text
          )}
          {verse.isSelah && <span className="selah-marker">Selah</span>}
          {' '}
        </span>
      </span>
    );
    
    // Use semantic paragraph breaks from API (next verse starts a new paragraph)
    // or stanza breaks for poetry sections
    const nextVerse = verses[index + 1];
    const shouldBreakParagraph = verse.stanzaBreakAfter ||
                                 (nextVerse && nextVerse.startsParagraph);
    
    if (shouldBreakParagraph) {
      const paragraphClasses = [
        'context-paragraph',
        verse.stanzaBreakAfter ? 'stanza-break' : ''
      ].filter(Boolean).join(' ');
      
      paragraphs.push(
        <p key={`para-${paragraphKey++}`} className={paragraphClasses}>
          {currentParagraph}
        </p>
      );
      currentParagraph = [];
    }
  });
  
  // Add remaining verses
  if (currentParagraph.length > 0) {
    paragraphs.push(
      <p key={`para-${paragraphKey++}`} className="context-paragraph">
        {currentParagraph}
      </p>
    );
  }
  
  return paragraphs;
}