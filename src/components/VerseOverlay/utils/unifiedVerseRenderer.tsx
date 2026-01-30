import React from 'react';
import { UnifiedChapter, UnifiedVerse, PsalmMetadata, PoetryLine, ProseLine, SpeakerLabel } from '../../../types/bible-formats';

/**
 * Render poetry lines with proper indentation and spacing
 * Uses the new PoetryLine structure from the NLT parser
 */
function renderPoetryLines(
  poetryLines: PoetryLine[],
  verseNumber: string,
  shouldShowVerseNumber: boolean,
  isHighlighted: boolean,
  hasSelah?: boolean,
  speakerLabels?: SpeakerLabel[]
): React.JSX.Element {
  // Build map of lineIndex -> speakers that appear before it
  const speakersByLineIndex = new Map<number, SpeakerLabel[]>();
  if (speakerLabels) {
    for (const speaker of speakerLabels) {
      const existing = speakersByLineIndex.get(speaker.beforeLineIndex) || [];
      existing.push(speaker);
      speakersByLineIndex.set(speaker.beforeLineIndex, existing);
    }
  }

  return (
    <div
      key={`verse-${verseNumber}`}
      className={`verse-with-poetry ${isHighlighted ? 'highlighted-verse' : ''}`}
    >
      {poetryLines.map((line, lineIndex) => {
        const speakersBeforeThisLine = speakersByLineIndex.get(lineIndex) || [];
        const lineClasses = [
          'poetry-line',
          `poetry-indent-${line.indentLevel}`,
          line.hasSpaceBefore ? 'stanza-space-before' : '',
        ].filter(Boolean).join(' ');

        return (
          <React.Fragment key={`${verseNumber}-line-${lineIndex}`}>
            {/* Render speaker labels before this line */}
            {speakersBeforeThisLine.map((speaker, idx) => (
              <div key={`speaker-${verseNumber}-${lineIndex}-${idx}`} className="speaker-label">
                {speaker.text}
              </div>
            ))}
            <div className={lineClasses}>
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
          </React.Fragment>
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
  // All known translations now use rich formatting with poetry lines and stanza breaks
  const useRichFormatting = ['ESV', 'NLT', 'KJV', 'ASV', 'WEB'].includes(translation);

  // For all supported translations, use unified rendering with paragraph grouping
  if (useRichFormatting) {
    return renderUnifiedStyle(verses, chapterNumber, startVerse, endVerse, translation, psalmMetadata);
  }

  // Fallback for unknown translations - basic paragraph grouping
  return renderStandardStyle(verses, startVerse, endVerse, psalmMetadata);
};

/**
 * Render unified style with floating chapter number and grouped paragraphs
 * Used by all translations (ESV, NLT, KJV, ASV, WEB)
 */
function renderUnifiedStyle(
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
        <h3 key={`heading-${verse.headingId || index}`} className="unified-heading">
          {verse.heading}
        </h3>
      );
      lastHeading = verse.heading;
    }
    
    // Determine if this verse is block-level (poetry, prose lines, etc.) - needed for verse number logic
    // Block-level elements include: poetry, multi-line verses, multi-paragraph prose, and verses with speaker labels
    const isBlockLevel = Boolean(
      (verse.poetryLines && verse.poetryLines.length > 0) ||
      (verse.proseLines && verse.proseLines.length > 1) ||
      (verse.lines && verse.lines.length > 0) ||
      (verse.speakerLabels && verse.speakerLabels.length > 0)
    );

    // Always show verse number (including verse 1)
    const shouldShowVerseNumber = true;
    
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
      // Check if there's prose before or after the poetry
      if (verse.proseBefore || verse.proseAfter) {
        // Build map of lineIndex -> speakers that appear before it
        const speakersByLineIndex = new Map<number, SpeakerLabel[]>();
        if (verse.speakerLabels) {
          for (const speaker of verse.speakerLabels) {
            const existing = speakersByLineIndex.get(speaker.beforeLineIndex) || [];
            existing.push(speaker);
            speakersByLineIndex.set(speaker.beforeLineIndex, existing);
          }
        }

        verseElement = (
          <div key={`verse-${verse.number}`} className={`verse-with-poetry ${isHighlighted ? 'highlighted-verse' : ''}`}>
            {/* Render prose introduction with verse number (if exists) */}
            {verse.proseBefore && (
              <div className="verse-prose-intro">
                {shouldShowVerseNumber && <sup className="context-verse-number">{verse.number}</sup>}
                <span className="verse-text-content">{verse.proseBefore}</span>
              </div>
            )}
            {/* Render poetry lines */}
            {verse.poetryLines.map((line, lineIndex) => {
              const speakersBeforeThisLine = speakersByLineIndex.get(lineIndex) || [];
              const lineClasses = [
                'poetry-line',
                `poetry-indent-${line.indentLevel}`,
                line.hasSpaceBefore ? 'stanza-space-before' : '',
              ].filter(Boolean).join(' ');

              return (
                <React.Fragment key={`${verse.number}-line-${lineIndex}`}>
                  {/* Render speaker labels before this line */}
                  {speakersBeforeThisLine.map((speaker, idx) => (
                    <div key={`speaker-${verse.number}-${lineIndex}-${idx}`} className="speaker-label">
                      {speaker.text}
                    </div>
                  ))}
                  <div className={lineClasses}>
                    {/* Show verse number on first poetry line only if no proseBefore */}
                    {lineIndex === 0 && !verse.proseBefore && shouldShowVerseNumber && (
                      <sup className="context-verse-number">{verse.number}</sup>
                    )}
                    <span className="poetry-line-text">
                      {line.isRedLetter ? (
                        <span className="words-of-jesus">{line.text}</span>
                      ) : (
                        line.text
                      )}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
            {/* Render prose after poetry (e.g., "(For the choir director...)" in Habakkuk 3:19) */}
            {verse.proseAfter && (
              <div className="verse-prose-after">
                <span className="verse-text-content">{verse.proseAfter}</span>
              </div>
            )}
            {(verse.hasSelah || verse.isSelah) && <span className="selah-marker">Selah</span>}
          </div>
        );
      } else {
        verseElement = renderPoetryLines(
          verse.poetryLines,
          verse.number,
          shouldShowVerseNumber,
          isHighlighted,
          verse.hasSelah || verse.isSelah,
          verse.speakerLabels
        );
      }
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
    } else if (verse.proseLines && verse.proseLines.length > 1) {
      // Multi-paragraph prose format (e.g., James 1:1 NLT has 3 separate paragraphs)
      verseElement = (
        <div key={`verse-${verse.number}`} className={`verse-with-prose-lines ${isHighlighted ? 'highlighted-verse' : ''}`}>
          {verse.proseLines.map((line, idx) => (
            <div key={`${verse.number}-prose-${idx}`} className={`prose-line ${idx > 0 ? 'continuation-line' : ''}`}>
              {idx === 0 && shouldShowVerseNumber && (
                <sup className="context-verse-number">{verse.number}</sup>
              )}
              <span className="prose-line-text">
                {line.isRedLetter ? <span className="words-of-jesus">{line.text}</span> : line.text}
              </span>
            </div>
          ))}
        </div>
      );
    } else {
      // Regular verse rendering (prose, no line breaks)
      const spaceBeforeClass = verse.hasSpaceBefore ? 'verse-space-before' : '';

      // Check if this verse has speaker labels (Song of Solomon prose sections)
      if (verse.speakerLabels && verse.speakerLabels.length > 0) {
        // For prose verses with speaker labels, render as block with speaker label above
        verseElement = (
          <div key={`verse-${verse.number}`} className={`verse-with-speaker ${isHighlighted ? 'highlighted-verse' : ''}`}>
            {verse.speakerLabels.map((speaker, idx) => (
              <div key={`speaker-${verse.number}-${idx}`} className="speaker-label">
                {speaker.text}
              </div>
            ))}
            <span className={`${verseClasses} ${spaceBeforeClass}`.trim()}>
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
          </div>
        );
      } else {
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
    }
    
    // isBlockLevel already calculated above for verse number logic
    if (isBlockLevel) {
      // Flush any accumulated prose first
      if (currentParagraph.length > 0) {
        finishParagraph();
      }

      // Handle first verse being poetry
      if (isFirstParagraph) {
        content.push(
          <div key={`poetry-block-${paragraphKey++}`} className="context-paragraph unified-format poetry-block">
            {verseElement}
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
      'unified-format',
      hasStanzaBreak ? 'stanza-break' : ''
    ].filter(Boolean).join(' ');
    
    if (isFirstParagraph) {
      content.push(
        <p key={`para-${paragraphKey++}`} className={`${paragraphClasses} unified-first-paragraph`}>
          {currentParagraph}
        </p>
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
    <div key={`${translation.toLowerCase()}-chapter`} className="unified-content">
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
        <h3 key={`heading-${verse.number}`} className="unified-heading">
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
        <h3 key={`heading-${verse.number}`} className="unified-heading">
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
    
    // Render speaker labels before the verse (Song of Solomon dialogues)
    if (verse.speakerLabels && verse.speakerLabels.length > 0) {
      // Finish current paragraph before speaker labels
      if (currentParagraph.length > 0) {
        paragraphs.push(
          <p key={`para-${paragraphKey++}`} className="context-paragraph">
            {currentParagraph}
          </p>
        );
        currentParagraph = [];
      }

      // Render each speaker label
      for (const speaker of verse.speakerLabels) {
        paragraphs.push(
          <div key={`speaker-${verse.number}-${speaker.beforeLineIndex}`} className="speaker-label">
            {speaker.text}
          </div>
        );
      }
    }

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