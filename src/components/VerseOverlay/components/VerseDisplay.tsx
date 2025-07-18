import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { VerseDisplayProps } from '../types';
import { BIBLE_VERSIONS, BibleTranslation } from '../../../types';

export interface VerseDisplayRefs {
  verseTextRef: React.RefObject<HTMLParagraphElement | null>;
  verseReferenceRef: React.RefObject<HTMLParagraphElement | null>;
  doneButtonRef: React.RefObject<HTMLButtonElement | null>;
  moreButtonRef: React.RefObject<HTMLButtonElement | null>;
}

// Full translation names mapping
const TRANSLATION_NAMES: Record<BibleTranslation, string> = {
  'KJV': 'King James Version',
  'ASV': 'American Standard Version',
  'ESV': 'English Standard Version',
  'NLT': 'New Living Translation',
  'WEB': 'World English Bible',
  'WEB_BRITISH': 'World English Bible (British)',
  'WEB_UPDATED': 'World English Bible (Updated)'
};

const VerseDisplay = forwardRef<VerseDisplayRefs, VerseDisplayProps>(({ 
  verse, 
  onDone, 
  onMore,
  onTranslationChange,
  isAdmin = false 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const verseTextRef = useRef<HTMLParagraphElement>(null);
  const verseReferenceRef = useRef<HTMLParagraphElement>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  // Expose refs to parent
  useImperativeHandle(ref, () => ({
    verseTextRef,
    verseReferenceRef,
    doneButtonRef,
    moreButtonRef
  }));

  // Get translation name from bibleId
  const getTranslationName = (bibleId: string): BibleTranslation => {
    const entry = Object.entries(BIBLE_VERSIONS).find(([_, id]) => id === bibleId);
    return (entry ? entry[0] : 'KJV') as BibleTranslation;
  };

  const currentTranslation = getTranslationName(verse.bibleId);

  // Handle click outside to close dropdown - matching ProfileDropdown implementation
  useEffect(() => {
    // Click outside handler
    const handleClickOutside = (event: Event) => {
      if (isOpen) {
        const target = event.target as Element;
        if (!target.closest('.translation-dropdown')) {
          setIsOpen(false);
        }
      }
    };

    // Listen for other dropdowns opening
    const handleCloseDropdown = (event: CustomEvent) => {
      if (event.detail.source !== 'translation') {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('dropdown-open', handleCloseDropdown as EventListener);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('dropdown-open', handleCloseDropdown as EventListener);
    };
  }, [isOpen]);

  const handleTranslationSelect = (translation: BibleTranslation) => {
    if (onTranslationChange) {
      onTranslationChange(translation);
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className="mb-10">
        <div className="verse-reference-container">
          <p ref={verseReferenceRef} className="verse-reference">
            <span>{verse.reference}</span>
            <span className="translation-dropdown">
              <button 
                className={`translation-button ${isOpen ? 'translation-button--open' : ''}`}
                onClick={() => {
                  const newState = !isOpen;
                  setIsOpen(newState);
                  if (newState) {
                    // Notify other dropdowns to close
                    document.dispatchEvent(new CustomEvent('dropdown-open', { 
                      detail: { source: 'translation' } 
                    }));
                  }
                }}
                type="button"
              >
                <span className="translation-button__text">{currentTranslation}</span>
                <svg
                  className="translation-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="currentColor"
                >
                  <path
                    d="M7 10L12 15"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M17 10L12 15"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isOpen && (
                <div className="translation-dropdown-menu">
                  {Object.entries(TRANSLATION_NAMES).map(([key, name]) => (
                    <button
                      key={key}
                      className={`translation-option ${
                        currentTranslation === key ? 'translation-option--active' : ''
                      }`}
                      onClick={() => handleTranslationSelect(key as BibleTranslation)}
                      type="button"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </span>
          </p>
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