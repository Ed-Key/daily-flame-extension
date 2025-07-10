import React from 'react';
import { UnifiedChapter, UnifiedVerse } from '../../../types/bible-formats';

export interface RenderUnifiedVersesProps {
  chapterContent: UnifiedChapter;
  currentVerseNumber: number | null;
}

/**
 * Renders verses from unified chapter format
 * Maintains translation-specific styling while using standardized data
 */
export const renderUnifiedVerses = ({ 
  chapterContent, 
  currentVerseNumber 
}: RenderUnifiedVersesProps): React.JSX.Element[] => {
  if (!chapterContent || !chapterContent.verses || chapterContent.verses.length === 0) {
    return [];
  }

  const { translation, verses, chapterNumber } = chapterContent;
  
  // Determine rendering style based on translation
  const useKJVFormatting = translation === 'KJV' || translation === 'ASV';
  const useESVFormatting = translation === 'ESV';
  const useNLTFormatting = translation === 'NLT';

  // For ESV and NLT, use special formatting with floating chapter numbers
  if (useESVFormatting || useNLTFormatting) {
    return renderESVStyle(verses, chapterNumber, currentVerseNumber, translation);
  }
  
  // For KJV/ASV, each verse is its own paragraph
  if (useKJVFormatting) {
    return renderKJVStyle(verses, currentVerseNumber);
  }
  
  // For other translations, group verses by natural paragraphs
  return renderStandardStyle(verses, currentVerseNumber);
};

/**
 * Render ESV/NLT style with floating chapter number and grouped paragraphs
 */
function renderESVStyle(
  verses: UnifiedVerse[], 
  chapterNumber: string, 
  currentVerseNumber: number | null,
  translation: string
): React.JSX.Element[] {
  const content: React.JSX.Element[] = [];
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
    
    // Create verse element
    const verseElement = (
      <span key={`verse-${verse.number}`} className={isHighlighted ? 'highlighted-verse' : ''}>
        {shouldShowVerseNumber && <sup className="context-verse-number">{verse.number}</sup>}
        <span className="verse-text-content">
          {verse.isRedLetter ? (
            <span className="words-of-jesus">{verse.text}</span>
          ) : (
            verse.text
          )}
          {' '}
        </span>
      </span>
    );
    
    currentParagraph.push(verseElement);
    
    // For ESV/NLT, we'll group verses into paragraphs
    // This is a simplified approach - in reality, we'd need paragraph boundaries from the API
    // For now, let's create a new paragraph after every 3-4 verses or at headings
    if ((index + 1) % 3 === 0 || index === verses.length - 1) {
      finishParagraph();
    }
  });
  
  // Make sure to finish any remaining paragraph
  if (currentParagraph.length > 0) {
    finishParagraph();
  }
  
  function finishParagraph() {
    if (currentParagraph.length === 0) return;
    
    if (isFirstParagraph) {
      // First paragraph includes the floating chapter number
      content.push(
        <div key={`para-with-chapter-${paragraphKey++}`} className="esv-chapter-container">
          <div className="esv-chapter-number">{chapterNumber}</div>
          <p className="context-paragraph esv-format esv-first-paragraph">
            {currentParagraph}
          </p>
        </div>
      );
      isFirstParagraph = false;
    } else {
      content.push(
        <p key={`para-${paragraphKey++}`} className="context-paragraph esv-format">
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
function renderKJVStyle(verses: UnifiedVerse[], currentVerseNumber: number | null): React.JSX.Element[] {
  return verses.map(verse => {
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
    
    elements.push(
      <p key={`verse-${verse.number}`} className={`context-paragraph kjv-verse ${isHighlighted ? 'highlighted-verse' : ''}`}>
        <strong className="context-verse-number">{verse.number}</strong>
        <span className="verse-text-content">
          {verse.isRedLetter ? (
            <span className="words-of-jesus">{verse.text}</span>
          ) : (
            verse.text
          )}
        </span>
      </p>
    );
    
    return elements;
  }).flat();
}

/**
 * Render standard style with verses grouped in paragraphs
 */
function renderStandardStyle(verses: UnifiedVerse[], currentVerseNumber: number | null): React.JSX.Element[] {
  const paragraphs: React.JSX.Element[] = [];
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
    
    // Add verse to current paragraph
    currentParagraph.push(
      <span key={`verse-${verse.number}`} className={isHighlighted ? 'highlighted-verse' : ''}>
        <sup className="context-verse-number">{verse.number}</sup>
        <span className="verse-text-content">
          {verse.isRedLetter ? (
            <span className="words-of-jesus">{verse.text}</span>
          ) : (
            verse.text
          )}
          {' '}
        </span>
      </span>
    );
    
    // Create new paragraph every few verses
    if ((index + 1) % 4 === 0 && index < verses.length - 1) {
      paragraphs.push(
        <p key={`para-${paragraphKey++}`} className="context-paragraph">
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