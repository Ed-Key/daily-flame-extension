import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { VerseDisplayProps } from '../types';
import { BIBLE_VERSIONS, BibleTranslation } from '../../../types';

export interface VerseDisplayRefs {
  verseTextRef: React.RefObject<HTMLParagraphElement | null>;
  verseReferenceRef: React.RefObject<HTMLParagraphElement | null>;
  leftLineRef: React.RefObject<HTMLDivElement | null>;
  rightLineRef: React.RefObject<HTMLDivElement | null>;
  doneButtonRef: React.RefObject<HTMLButtonElement | null>;
  moreButtonRef: React.RefObject<HTMLButtonElement | null>;
}

const VerseDisplay = forwardRef<VerseDisplayRefs, VerseDisplayProps>(({ 
  verse, 
  onDone, 
  onMore,
  isAdmin = false 
}, ref) => {
  const verseTextRef = useRef<HTMLParagraphElement>(null);
  const verseReferenceRef = useRef<HTMLParagraphElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);
  const rightLineRef = useRef<HTMLDivElement>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  // Expose refs to parent
  useImperativeHandle(ref, () => ({
    verseTextRef,
    verseReferenceRef,
    leftLineRef,
    rightLineRef,
    doneButtonRef,
    moreButtonRef
  }));

  // Get translation name from bibleId
  const getTranslationName = (bibleId: string): BibleTranslation => {
    const entry = Object.entries(BIBLE_VERSIONS).find(([_, id]) => id === bibleId);
    return (entry ? entry[0] : 'KJV') as BibleTranslation;
  };

  const currentTranslation = getTranslationName(verse.bibleId);

  return (
    <>
      <div className="mb-10">
        <div className="verse-reference-container">
          <div ref={leftLineRef} className="verse-reference-line left"></div>
          <p ref={verseReferenceRef} className="verse-reference">
            {verse.reference} {currentTranslation}
          </p>
          <div ref={rightLineRef} className="verse-reference-line right"></div>
        </div>
        <p ref={verseTextRef} className="verse-text">
          "{verse.text}"
        </p>
      </div>
      <div className="verse-button-container">
        <button
          ref={doneButtonRef}
          className="verse-btn"
          onClick={onDone}
          type="button"
        >
          Done
        </button>
        <button
          ref={moreButtonRef}
          className="verse-btn verse-more-btn"
          onClick={onMore}
          type="button"
        >
          More
        </button>
      </div>
    </>
  );
});

VerseDisplay.displayName = 'VerseDisplay';

export default VerseDisplay;