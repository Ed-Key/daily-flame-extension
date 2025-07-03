import React from 'react';

export interface RenderContextVersesProps {
  chapterContent: any;
  currentVerseNumber: number | null;
  contextTranslation: string;
}

export const renderContextVerses = ({ 
  chapterContent, 
  currentVerseNumber, 
  contextTranslation 
}: RenderContextVersesProps): React.JSX.Element[] => {
  if (!chapterContent || !chapterContent.content) return [];

  // Check if we should use KJV formatting (each verse as separate paragraph)
  const useKJVFormatting = contextTranslation === 'KJV' || contextTranslation === 'ASV';
  const useESVFormatting = contextTranslation === 'ESV';

  // Parse content and render verses with paragraph support
  const paragraphs: React.JSX.Element[] = [];
  let currentParagraph: React.JSX.Element[] = [];
  let currentVerseContent: React.ReactNode[] = [];
  let currentVerseNum = '';
  let paragraphKey = 0;
  let currentParagraphStyle = '';
  
  const addVerseToParagraph = (verseNum: string, verseContent: React.ReactNode[]) => {
    if (verseNum) {
      const verseNumber = parseInt(verseNum);
      const isHighlighted = verseNumber === currentVerseNumber;
      
      if (useKJVFormatting) {
        // For KJV/ASV: Each verse is its own paragraph with style
        let verseClasses = `context-paragraph kjv-verse ${isHighlighted ? 'highlighted-verse' : ''}`;
        
        // Apply poetry styles to KJV verses too
        if (currentParagraphStyle === 'q1') {
          verseClasses += ' poetry-q1';
        } else if (currentParagraphStyle === 'q2') {
          verseClasses += ' poetry-q2';
        } else if (currentParagraphStyle === 'd') {
          // For descriptors, use special styling
          paragraphs.push(
            <p key={`verse-${verseNum}`} className="psalm-descriptor">
              {verseContent}
            </p>
          );
          return;
        }
        
        paragraphs.push(
          <p key={`verse-${verseNum}`} className={verseClasses}>
            <strong className="context-verse-number">{verseNum}</strong>
            {verseContent.length > 0 && <span className="verse-text-content">{verseContent}</span>}
          </p>
        );
      } else {
        // For other translations: Group verses by paragraphs
        currentParagraph.push(
          <span key={`verse-${verseNum}`} className={isHighlighted ? 'highlighted-verse' : ''}>
            <sup className="context-verse-number">{verseNum}</sup>
            {verseContent.length > 0 && <span className="verse-text-content">{verseContent} </span>}
          </span>
        );
      }
    }
  };

  const finishParagraph = () => {
    if (currentParagraph.length > 0) {
      // Determine CSS classes based on paragraph style
      let paragraphClasses = "context-paragraph";
      if (currentParagraphStyle === 'q1') {
        paragraphClasses += " poetry-q1";
      } else if (currentParagraphStyle === 'q2') {
        paragraphClasses += " poetry-q2";
      } else if (currentParagraphStyle === 'd') {
        paragraphClasses = "psalm-descriptor"; // Replace default class for descriptors
      } else if (currentParagraphStyle === 'b') {
        paragraphClasses += " poetry-break";
      }
      
      paragraphs.push(
        <p key={`para-${paragraphKey++}`} className={paragraphClasses}>
          {currentParagraph}
        </p>
      );
      currentParagraph = [];
    }
  };
  
  // Helper function to recursively extract text from nested items
  const extractTextFromItems = (items: any[], isWordsOfJesus: boolean = false, isTranslatorAddition: boolean = false, isDivineName: boolean = false): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    
    items.forEach((item: any, index: number) => {
      if (item.type === 'text') {
        const text = item.text || '';
        if (text.trim()) {
          // Apply appropriate classes based on parent styles
          if (isDivineName) {
            // Divine name (LORD) - takes precedence
            elements.push(
              <span key={`nd-${index}`} className="divine-name">{text}</span>
            );
          } else if (isWordsOfJesus && isTranslatorAddition) {
            // Both styles apply
            elements.push(
              <span key={`woj-add-${index}`} className="words-of-jesus translator-addition">{text}</span>
            );
          } else if (isWordsOfJesus) {
            // Only words of Jesus
            elements.push(
              <span key={`woj-${index}`} className="words-of-jesus">{text}</span>
            );
          } else if (isTranslatorAddition) {
            // Only translator addition
            elements.push(
              <span key={`add-${index}`} className="translator-addition">{text}</span>
            );
          } else {
            // Plain text
            elements.push(text);
          }
        } else if (text) {
          // Keep whitespace even if not trimmed
          elements.push(text);
        }
      } else if (item.type === 'tag' && item.items) {
        // Check style types
        const isWoj = item.name === 'char' && item.attrs?.style === 'wj';
        const isAdd = item.name === 'char' && item.attrs?.style === 'add';
        const isNd = item.name === 'char' && item.attrs?.style === 'nd';
        // Recursively get text from nested tags, preserving parent styles
        elements.push(...extractTextFromItems(
          item.items, 
          isWoj || isWordsOfJesus, 
          isAdd || isTranslatorAddition,
          isNd || isDivineName
        ));
      }
    });
    
    return elements;
  };
  
  // Debug logging
  console.log('Chapter content structure:', chapterContent);
  
  // For ESV, wrap content in a container with chapter number
  if (useESVFormatting && chapterContent.chapterNumber) {
    const esvContent: React.JSX.Element[] = [];
    
    chapterContent.content.forEach((section: any, sectionIndex: number) => {
      // Handle headings
      if (section.type === 'tag' && section.name === 'heading') {
        const headingText = section.items?.[0]?.text || '';
        if (headingText) {
          esvContent.push(
            <h3 key={`heading-${sectionIndex}`} className="esv-heading">
              {headingText}
            </h3>
          );
        }
      }
      // Handle paragraphs
      else if (section.type === 'tag' && section.name === 'para') {
        const paragraphElements: React.JSX.Element[] = [];
        let currentVerseContent: React.ReactNode[] = [];
        let currentVerseNum = '';
        
        section.items?.forEach((item: any, itemIndex: number) => {
          if (item.type === 'tag' && item.name === 'verse') {
            // Add previous verse content if any
            if (currentVerseNum && currentVerseContent.length > 0) {
              const verseNumber = parseInt(currentVerseNum);
              const isHighlighted = verseNumber === currentVerseNumber;
              
              paragraphElements.push(
                <span key={`verse-${currentVerseNum}`} className={isHighlighted ? 'highlighted-verse' : ''}>
                  <sup className="context-verse-number">{currentVerseNum}</sup>
                  <span className="verse-text-content">{currentVerseContent}</span>
                </span>
              );
            }
            
            // Start new verse
            currentVerseNum = item.attrs?.number || '';
            currentVerseContent = [];
          } else if (item.type === 'text') {
            currentVerseContent.push(item.text);
          } else if (item.type === 'tag' && item.name === 'char') {
            // Handle special character styles (words of Jesus, etc.)
            const style = item.attrs?.style;
            const text = item.items?.[0]?.text || '';
            
            if (style === 'wj') {
              currentVerseContent.push(
                <span key={`wj-${itemIndex}`} className="words-of-jesus">{text}</span>
              );
            } else if (style === 'add') {
              currentVerseContent.push(
                <span key={`add-${itemIndex}`} className="translator-addition">{text}</span>
              );
            } else if (style === 'nd') {
              currentVerseContent.push(
                <span key={`nd-${itemIndex}`} className="divine-name">{text}</span>
              );
            } else {
              currentVerseContent.push(text);
            }
          }
        });
        
        // Add the last verse
        if (currentVerseNum && currentVerseContent.length > 0) {
          const verseNumber = parseInt(currentVerseNum);
          const isHighlighted = verseNumber === currentVerseNumber;
          
          paragraphElements.push(
            <span key={`verse-${currentVerseNum}`} className={isHighlighted ? 'highlighted-verse' : ''}>
              <sup className="context-verse-number">{currentVerseNum}</sup>
              <span className="verse-text-content">{currentVerseContent}</span>
            </span>
          );
        }
        
        if (paragraphElements.length > 0) {
          esvContent.push(
            <p key={`para-${sectionIndex}`} className="context-paragraph esv-format">
              {paragraphElements}
            </p>
          );
        }
      }
    });
    
    // Wrap in ESV container with chapter number floated
    return [
      <div key="esv-chapter" className="esv-chapter-container">
        <div className="esv-content">
          <div className="esv-chapter-number">{chapterContent.chapterNumber}</div>
          {esvContent}
        </div>
      </div>
    ];
  }
  
  // Original code for non-ESV translations
  chapterContent.content.forEach((section: any) => {
    // Each section is a paragraph with a style
    if (section.type === 'tag' && section.name === 'para') {
      // Get the paragraph style
      currentParagraphStyle = section.attrs?.style || 'p';
      
      // Process items within this paragraph
      if (section.items) {
        let i = 0;
        while (i < section.items.length) {
          const item = section.items[i];
          
          if (item.type === 'tag' && item.name === 'verse') {
          // Add previous verse to current paragraph (even if empty)
          if (currentVerseNum) {
            addVerseToParagraph(currentVerseNum, currentVerseContent);
          }
          
          // Start new verse
          currentVerseNum = item.attrs?.number || '';
          currentVerseContent = [];
          i++;
          
          // Collect all content until the next verse or para tag
          while (i < section.items.length) {
            const nextItem = section.items[i];
            if (nextItem.type === 'tag' && (nextItem.name === 'verse' || nextItem.name === 'para')) {
              break;
            }
            
            if (nextItem.type === 'text') {
              currentVerseContent.push(nextItem.text || '');
            } else if (nextItem.type === 'tag' && nextItem.items) {
              // Check if this is a words of Jesus tag, translator addition, or divine name before extracting content
              const isWoj = nextItem.name === 'char' && nextItem.attrs?.style === 'wj';
              const isAdd = nextItem.name === 'char' && nextItem.attrs?.style === 'add';
              const isNd = nextItem.name === 'char' && nextItem.attrs?.style === 'nd';
              if (isWoj) {
                console.log('Found words of Jesus tag in verse', currentVerseNum, nextItem);
              }
              if (isAdd) {
                console.log('Found translator addition tag in verse', currentVerseNum, nextItem);
              }
              if (isNd) {
                console.log('Found divine name tag in verse', currentVerseNum, nextItem);
              }
              // Extract content from nested tags (like char)
              currentVerseContent.push(...extractTextFromItems(nextItem.items, isWoj, isAdd, isNd));
            }
            i++;
          }
        } else {
          i++;
        }
      }
      
      // Finish processing this paragraph section
      if (currentVerseNum) {
        addVerseToParagraph(currentVerseNum, currentVerseContent);
        currentVerseContent = [];
        currentVerseNum = '';
      }
      
      // For non-KJV, finish the paragraph after processing all its verses
      if (!useKJVFormatting) {
        finishParagraph();
      }
    }
    }
  });

  // Add the last verse (even if empty)
  if (currentVerseNum) {
    addVerseToParagraph(currentVerseNum, currentVerseContent);
  }
  
  // Finish the last paragraph
  if (!useKJVFormatting) {
    finishParagraph();

    // If no paragraph tags were found, put all verses in one paragraph
    if (paragraphs.length === 0 && currentParagraph.length > 0) {
      paragraphs.push(
        <p key="para-single" className="context-paragraph">
          {currentParagraph}
        </p>
      );
    }
  }

  return paragraphs;
};