import React from 'react';
import { UnifiedChapter, UnifiedVerse, PsalmMetadata } from '../../../types/bible-formats';

/**
 * Renders verses from unified chapter format
 * Maintains translation-specific styling while using standardized data
 */
export const renderUnifiedVerses = ({ 
  chapterContent, 
  currentVerseNumber 
}: {
  chapterContent: UnifiedChapter;
  currentVerseNumber: number | null;
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
    return renderESVStyle(verses, chapterNumber, currentVerseNumber, translation, psalmMetadata);
  }
  
  // For KJV/ASV, each verse is its own paragraph
  if (useKJVFormatting) {
    return renderKJVStyle(verses, currentVerseNumber, psalmMetadata);
  }
  
  // For other translations, group verses by natural paragraphs
  return renderStandardStyle(verses, currentVerseNumber, psalmMetadata);
};

/**
 * Render ESV/NLT style with floating chapter number and grouped paragraphs
 */
function renderESVStyle(
  verses: UnifiedVerse[], 
  chapterNumber: string, 
  currentVerseNumber: number | null,
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
    const isHighlighted = parseInt(verse.number) === currentVerseNumber;
    
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
    
    // For the first verse of a chapter (verse 1), don't show the verse number
    // as it's already shown in the chapter number
    const shouldShowVerseNumber = verse.number !== '1' || index > 0;
    
    // Apply poetry indentation if specified
    const verseClasses = [
      isHighlighted ? 'highlighted-verse' : '',
      verse.poetryIndentLevel === 1 ? 'poetry-indent-1' : '',
      verse.poetryIndentLevel === 2 ? 'poetry-indent-2' : '',
      verse.isSelah ? 'verse-with-selah' : ''
    ].filter(Boolean).join(' ');
    
    // Create verse element
    const verseElement = verse.lines && verse.lines.length > 0 ? (
      // For verses with line breaks (poetry), render each line separately
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
    ) : (
      // Regular verse rendering (no line breaks)
      <span key={`verse-${verse.number}`} className={verseClasses}>
        {shouldShowVerseNumber && <sup className="context-verse-number">{verse.number}</sup>}
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
    
    currentParagraph.push(verseElement);
    
    // For ESV/NLT, we'll group verses into paragraphs
    // Check for stanza breaks in Psalms or natural paragraph boundaries
    const shouldBreakParagraph = verse.stanzaBreakAfter || 
                                 (index + 1) % 3 === 0 || 
                                 index === verses.length - 1;
    
    if (shouldBreakParagraph) {
      finishParagraph(verse.stanzaBreakAfter);
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
function renderKJVStyle(verses: UnifiedVerse[], currentVerseNumber: number | null, psalmMetadata?: PsalmMetadata): React.JSX.Element[] {
  const elements: React.JSX.Element[] = [];
  
  // Add Psalm superscription if present
  if (psalmMetadata?.superscription) {
    elements.push(
      <div key="psalm-superscription" className="psalm-superscription">
        {psalmMetadata.superscription}
      </div>
    );
  }
  
  const verseElements = verses.map(verse => {
    const verseNum = parseInt(verse.number);
    const isHighlighted = verseNum === currentVerseNumber;
    
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
function renderStandardStyle(verses: UnifiedVerse[], currentVerseNumber: number | null, psalmMetadata?: PsalmMetadata): React.JSX.Element[] {
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
    const verseNum = parseInt(verse.number);
    const isHighlighted = verseNum === currentVerseNumber;
    
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
    
    // Check for stanza breaks in Psalms or natural paragraph boundaries
    const shouldBreakParagraph = verse.stanzaBreakAfter || 
                                 ((index + 1) % 4 === 0 && index < verses.length - 1);
    
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