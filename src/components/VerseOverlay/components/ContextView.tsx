import React, { useRef, useEffect } from 'react';
import { BibleTranslation, UnifiedChapter } from '../../../types';
import { ContextViewProps } from '../types';
import { renderContextVerses } from '../utils/verseRenderer';
import { renderUnifiedVerses } from '../utils/unifiedVerseRenderer';
import { useContextScroll } from '../hooks/useContextScroll';

// Helper to check if chapter content is in unified format
const isUnifiedFormat = (chapterContent: any): chapterContent is UnifiedChapter => {
  return chapterContent && 
    'verses' in chapterContent && 
    Array.isArray(chapterContent.verses) &&
    'translation' in chapterContent;
};

const ContextView: React.FC<ContextViewProps> = ({
  verse,
  chapterContent,
  contextLoading,
  contextTranslation,
  onBack,
  onDone,
  onTranslationChange
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { contextContainerRef, fadeOverlayRef, setupScrollListener } = useContextScroll({ showContext: true });

  // Extract current verse number from reference
  const currentVerseMatch = verse.reference.match(/:(\d+)/);
  const currentVerseNumber = currentVerseMatch ? parseInt(currentVerseMatch[1]) : null;

  useEffect(() => {
    // Setup scroll listener when content loads
    if (!contextLoading && chapterContent) {
      setupScrollListener();
      
      // Animate the title underline
      const underline = modalRef.current?.querySelector('.context-title-underline');
      if (underline) {
        setTimeout(() => {
          underline.classList.add('animate');
        }, 200);
      }
    }
  }, [contextLoading, chapterContent, setupScrollListener]);

  const handleBackClick = () => {
    onBack();
  };

  return (
    <div className="context-view-container" ref={modalRef}>
      <button 
        className="context-back-btn"
        onClick={handleBackClick}
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Back
      </button>

      {contextLoading ? (
        <div className="context-loading-container">
          <div className="context-spinner"></div>
          <div className="context-loading">Loading chapter...</div>
        </div>
      ) : chapterContent ? (
        <>
          <div className="context-header">
            <div className="context-title-row">
              <h2 className="context-title">{chapterContent.reference}</h2>
              <select
                value={contextTranslation}
                onChange={(e) => onTranslationChange(e.target.value as BibleTranslation)}
                className="context-translation-select"
                disabled={contextLoading}
              >
                <option value="KJV">King James Version</option>
                <option value="ASV">American Standard Version</option>
                <option value="ESV">English Standard Version</option>
                <option value="NLT">New Living Translation</option>
                <option value="WEB">World English Bible</option>
                <option value="WEB_BRITISH">WEB British Edition</option>
                <option value="WEB_UPDATED">WEB Updated</option>
              </select>
            </div>
            <div className="context-title-underline"></div>
            {contextTranslation !== 'ESV' && contextTranslation !== 'NLT' && chapterContent.content && chapterContent.content.length > 0 && chapterContent.content[0].items && chapterContent.content[0].items[0]?.text && (
              <p className="context-subtitle">{chapterContent.content[0].items[0].text}</p>
            )}
          </div>

          <div className="context-scroll-container">
            <div className="context-content" ref={contextContainerRef}>
              <div className="context-verses">
                {isUnifiedFormat(chapterContent) ? 
                  renderUnifiedVerses({ 
                    chapterContent: chapterContent as UnifiedChapter, 
                    currentVerseNumber 
                  }) :
                  renderContextVerses({ 
                    chapterContent, 
                    currentVerseNumber, 
                    contextTranslation 
                  })
                }
              </div>
            </div>
            <div className="context-fade" ref={fadeOverlayRef}></div>
          </div>

          <div className="context-button-fixed">
            <button
              className="verse-btn"
              onClick={onDone}
              type="button"
            >
              Done
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ContextView;