import React from 'react';

// Parse NLT HTML and convert to structured format
const parseNLTHTML = (htmlContent: string): any => {
  console.log('[NLT Parser] Starting parseNLTHTML with content:', {
    length: htmlContent.length,
    first500Chars: htmlContent.substring(0, 500),
    hasVerseExport: htmlContent.includes('verse_export'),
    hasBibletext: htmlContent.includes('id="bibletext"')
  });
  
  // Create a parser in the browser context (where DOMParser is available)
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Extract the bibletext content
  const bibleText = doc.querySelector('#bibletext');
  if (!bibleText) {
    console.log('[NLT Parser] No #bibletext found, using body content');
    // If no bibletext div, assume the content is already inner HTML
    const tempDoc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
    return parseNLTContent(tempDoc.body.firstElementChild);
  }
  
  console.log('[NLT Parser] Found #bibletext element');
  return parseNLTContent(bibleText);
};

// Parse NLT HTML using regex when DOM methods don't work with custom tags
const parseNLTWithRegex = (htmlContent: string): any => {
  console.log('[NLT parseNLTWithRegex] Parsing with regex');
  const nltVerses: any[] = [];
  let chapterNumber = '';
  
  // Extract chapter number from <span class="cw_ch">
  const chapterMatch = htmlContent.match(/<span[^>]*class="cw_ch"[^>]*>(\d+)<\/span>/);
  if (chapterMatch) {
    chapterNumber = chapterMatch[1];
  }
  
  // Match all verse_export elements with their content
  const versePattern = /<verse_export[^>]*vn="(\d+)"[^>]*>(.*?)<\/verse_export>/gs;
  const matches = [...htmlContent.matchAll(versePattern)];
  
  console.log('[NLT parseNLTWithRegex] Found verses:', matches.length);
  
  matches.forEach((match, index) => {
    const verseNum = match[1];
    let verseContent = match[2];
    
    // Extract heading if present
    let heading: string | undefined;
    const headingMatch = verseContent.match(/<h3[^>]*class="subhead"[^>]*>(.*?)<\/h3>/);
    if (headingMatch) {
      heading = headingMatch[1].replace(/<[^>]+>/g, '').trim();
      verseContent = verseContent.replace(headingMatch[0], '');
    }
    
    // Remove chapter header
    verseContent = verseContent.replace(/<h2[^>]*class="chapter-number"[^>]*>.*?<\/h2>/gs, '');
    
    // Remove verse numbers
    verseContent = verseContent.replace(/<span[^>]*class="vn"[^>]*>\d+<\/span>/g, '');
    
    // Remove footnotes
    verseContent = verseContent.replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a>/g, '');
    verseContent = verseContent.replace(/<span[^>]*class="tn"[^>]*>.*?<\/span>/gs, '');
    
    // Extract text content
    const plainText = verseContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Check for red letter text
    const hasRedLetter = /class=["']?red["']?/.test(match[2]);
    
    const verseData = {
      verseNumber: verseNum,
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: plainText }]
      }],
      isFirstVerse: verseNum === '1',
      hasChapterNumber: verseNum === '1',
      heading
    };
    
    if (hasRedLetter) {
      verseData.content[0].content[0].type = 'woj';
    }
    
    nltVerses.push(verseData);
  });
  
  return {
    nltVerses,
    chapterNumber,
    isNLT: true
  };
};

// Parse NLT HTML when it doesn't have verse_export elements
const parseNLTFallback = (container: Element): any => {
  console.log('[NLT Fallback] Starting fallback parser');
  const nltVerses: any[] = [];
  let chapterNumber = '';
  
  // Get the full text content and split by verse numbers
  const fullText = container.textContent || '';
  console.log('[NLT Fallback] Full text:', fullText.substring(0, 200) + '...');
  
  // Extract chapter number from the beginning if present
  const chapterMatch = fullText.match(/^(\d+)/);
  if (chapterMatch) {
    chapterNumber = chapterMatch[1];
  }
  
  // More robust verse pattern - match:
  // - Digits at the start of text
  // - Digits followed by uppercase letter (1This)
  // - Digits after space/newline followed by uppercase (verse 2Dear)
  // - Multi-digit verses (33For, 44So)
  const verseMatches = [...fullText.matchAll(/(?:^|\s|)(\d{1,3})(?=[A-Z])/g)];
  console.log('[NLT Fallback] Found verse matches:', verseMatches.map(m => m[1]));
  
  // If no matches with that pattern, try a different approach
  if (verseMatches.length === 0) {
    console.log('[NLT Fallback] No verse matches found with primary pattern, trying alternate');
    // Just look for any numbers that could be verse numbers
    const altMatches = [...fullText.matchAll(/(?:^|\s)(\d{1,3})(?=\S)/g)];
    console.log('[NLT Fallback] Alternate matches:', altMatches.map(m => m[1]));
  }
  
  // Split the text based on verse numbers
  const parts: string[] = [];
  let lastIndex = 0;
  
  verseMatches.forEach((match, index) => {
    const matchIndex = match.index || 0;
    // Add any text before this verse number
    if (matchIndex > lastIndex) {
      parts.push(fullText.substring(lastIndex, matchIndex));
    }
    // Add the verse number
    parts.push(match[1]);
    lastIndex = matchIndex + match[0].length;
  });
  
  // Add any remaining text
  if (lastIndex < fullText.length) {
    parts.push(fullText.substring(lastIndex));
  }
  
  console.log('[NLT Fallback] Split into parts:', parts.length, 'parts');
  
  // Process parts - they alternate between verse numbers and verse text
  let currentHeading = '';
  
  // Look for headings in the HTML
  const headings = container.querySelectorAll('h3, .subhead');
  const headingTexts = Array.from(headings).map(h => h.textContent?.trim() || '');
  
  // If no HTML headings found, try to extract them from the text
  // Common headings in James 1: "Greetings from James", "Faith and Endurance"
  if (headingTexts.length === 0) {
    // Look for common heading patterns - text between verse numbers
    const headingPattern = /(?:^|\d)\s*([A-Z][a-z]+(?:\s+[a-z]+)*(?:\s+[A-Z][a-z]+)+)\s*\d/g;
    const headingMatches = [...fullText.matchAll(headingPattern)];
    headingTexts.push(...headingMatches.map(m => m[1].trim()));
  }
  
  console.log('[NLT Fallback] Found headings:', headingTexts);
  
  // If we have verse matches, process them
  if (verseMatches.length > 0) {
    verseMatches.forEach((match, index) => {
      const verseNum = match[1];
      const matchIndex = match.index || 0;
      
      // Find the text for this verse (from this match to the next, or to end)
      const nextMatch = verseMatches[index + 1];
      const endIndex = nextMatch ? nextMatch.index : fullText.length;
      let verseText = fullText.substring(matchIndex + match[0].length, endIndex).trim();
      
      console.log(`[NLT Fallback] Processing verse ${verseNum}:`, verseText.substring(0, 50) + '...');
      
      // Remove footnotes - match * followed by verse reference and text until period or end
      verseText = verseText.replace(/\*\d+:\d+[^.]*\.?/g, '');
    
      // Check if this verse text starts with a heading
      for (const heading of headingTexts) {
        if (verseText.startsWith(heading)) {
          currentHeading = heading;
          verseText = verseText.substring(heading.length).trim();
          break;
        }
      }
      
      const verseData: any = {
        verseNumber: verseNum,
        content: [],
        isFirstVerse: verseNum === '1',
        hasChapterNumber: verseNum === '1'
      };
      
      // Add heading if we found one
      if (currentHeading) {
        verseData.heading = currentHeading;
        currentHeading = ''; // Reset so we don't repeat it
      }
      
      // Add verse text
      if (verseText.trim()) {
        verseData.content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: verseText.trim() }]
        });
      }
      
      nltVerses.push(verseData);
    });
  }
  
  // If no verses were parsed, return empty
  if (nltVerses.length === 0) {
    console.log('[NLT Fallback] WARNING: No verses parsed!');
  }
  
  const result = {
    nltVerses,
    chapterNumber,
    isNLT: true
  };
  
  console.log('[NLT Fallback] Final result:', {
    verseCount: nltVerses.length,
    chapterNumber,
    firstVerse: nltVerses[0],
    lastVerse: nltVerses[nltVerses.length - 1]
  });
  
  return result;
};

const parseNLTContent = (container: Element | null): any => {
  if (!container) {
    console.log('[NLT parseNLTContent] No container provided');
    return { content: [], nltVerses: [] };
  }
  
  console.log('[NLT parseNLTContent] Starting with container:', {
    tagName: container.tagName,
    innerHTML: container.innerHTML?.substring(0, 200) + '...'
  });
  
  // NLT-specific structure that preserves the verse_export organization
  const nltVerses: any[] = [];
  let chapterNumber = '';
  let currentHeading = '';
  
  // Get all verse_export elements - use getElementsByTagName for custom tags
  // querySelectorAll might not work with custom HTML tags in some browsers
  let verseExports = container.getElementsByTagName('verse_export');
  
  // If that doesn't work, try a different approach
  if (!verseExports || verseExports.length === 0) {
    // Try to find them by searching in innerHTML
    const htmlContent = container.innerHTML || '';
    const hasVerseExport = htmlContent.includes('<verse_export');
    console.log('[NLT parseNLTContent] getElementsByTagName found:', verseExports?.length || 0, 'hasVerseExport in HTML:', hasVerseExport);
    
    if (hasVerseExport) {
      // Parse manually using regex since DOM methods aren't working
      return parseNLTWithRegex(htmlContent);
    }
  }
  
  console.log('[NLT parseNLTContent] Found verse_export elements:', verseExports.length);
  
  // If no verse_export elements found, try to parse the raw HTML differently
  if (verseExports.length === 0) {
    console.log('[NLT parseNLTContent] No verse_export elements, using fallback parser');
    return parseNLTFallback(container);
  }
  
  Array.from(verseExports).forEach((verseExport, index) => {
    const verseNum = verseExport.getAttribute('vn') || '';
    const verseData: any = {
      verseNumber: verseNum,
      content: [],
      isFirstVerse: index === 0
    };
    
    // Process each child element in order
    verseExport.childNodes.forEach((node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        // Extract chapter number from first verse
        if (element.classList.contains('chapter-number')) {
          const chNum = element.querySelector('.cw_ch');
          if (chNum) {
            chapterNumber = chNum.textContent || '';
            verseData.hasChapterNumber = true;
          }
        }
        // Handle section headings
        else if (element.tagName === 'H3' && element.classList.contains('subhead')) {
          currentHeading = element.textContent?.trim() || '';
          if (currentHeading) {
            verseData.heading = currentHeading;
          }
        }
        // Handle paragraphs
        else if (element.tagName === 'P') {
          const paraContent: any[] = [];
          
          element.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent?.trim();
              if (text) {
                paraContent.push({ type: 'text', text });
              }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const childElem = child as Element;
              
              // Skip verse number spans inside paragraphs
              if (childElem.classList.contains('vn')) {
                return;
              }
              
              // Handle red letters
              if (childElem.classList.contains('red')) {
                paraContent.push({
                  type: 'woj',
                  text: childElem.textContent || ''
                });
              }
              // Skip footnotes
              else if (!childElem.classList.contains('a-tn') && !childElem.classList.contains('tn')) {
                const text = childElem.textContent?.trim();
                if (text) {
                  paraContent.push({ type: 'text', text });
                }
              }
            }
          });
          
          if (paraContent.length > 0) {
            verseData.content.push({
              type: 'paragraph',
              content: paraContent
            });
          }
        }
        // Handle standalone verse number spans
        else if (element.classList.contains('vn')) {
          // Already captured from vn attribute
        }
        // Handle standalone red text
        else if (element.classList.contains('red')) {
          verseData.content.push({
            type: 'text',
            content: [{
              type: 'woj',
              text: element.textContent || ''
            }]
          });
        }
      }
      // Handle direct text nodes (not in paragraphs)
      else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          verseData.content.push({
            type: 'text',
            content: [{ type: 'text', text }]
          });
        }
      }
    });
    
    nltVerses.push(verseData);
  });
  
  return {
    nltVerses,
    chapterNumber,
    isNLT: true
  };
};

// Helper function to render NLT verse content
const renderNLTVerseContent = (contentArray: any[]): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  
  contentArray.forEach((item, index) => {
    if (item.type === 'paragraph' || item.type === 'text') {
      item.content.forEach((content: any, contentIndex: number) => {
        if (content.type === 'text') {
          elements.push(content.text);
        } else if (content.type === 'woj') {
          elements.push(
            <span key={`woj-${index}-${contentIndex}`} className="words-of-jesus">
              {content.text}
            </span>
          );
        }
      });
    }
  });
  
  return elements;
};

export const renderContextVerses = ({ 
  chapterContent, 
  currentVerseNumber, 
  contextTranslation 
}: {
  chapterContent: any;
  currentVerseNumber: number | null;
  contextTranslation: string;
}): React.JSX.Element[] => {
  if (!chapterContent || (!chapterContent.content && !chapterContent.passages)) return [];

  // Check if we should use KJV formatting (each verse as separate paragraph)
  const useKJVFormatting = contextTranslation === 'KJV' || contextTranslation === 'ASV';
  const useESVFormatting = contextTranslation === 'ESV';
  const useNLTFormatting = contextTranslation === 'NLT';

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
  // console.log('Chapter content structure:', chapterContent);
  
  // For ESV, wrap content in a container with chapter number
  if (useESVFormatting && chapterContent.chapterNumber) {
    const esvContent: React.JSX.Element[] = [];
    let isFirstParagraph = true;
    let chapterNumberAdded = false;
    
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
          // Add chapter number to the first paragraph with verse content
          if (isFirstParagraph && !chapterNumberAdded) {
            esvContent.push(
              <div key={`para-with-chapter-${sectionIndex}`} className="esv-chapter-container">
                <div className="esv-chapter-number">{chapterContent.chapterNumber}</div>
                <p className="context-paragraph esv-format esv-first-paragraph">
                  {paragraphElements}
                </p>
              </div>
            );
            chapterNumberAdded = true;
            isFirstParagraph = false;
          } else {
            esvContent.push(
              <p key={`para-${sectionIndex}`} className="context-paragraph esv-format">
                {paragraphElements}
              </p>
            );
          }
        }
      }
    });
    
    // Return the content without wrapping in additional containers
    return [
      <div key="esv-chapter" className="esv-content">
        {esvContent}
      </div>
    ];
  }
  
  // For NLT, use custom rendering
  if (useNLTFormatting && chapterContent.passages) {
    console.log('[NLT Rendering] Starting NLT rendering');
    // NLT returns HTML content in passages array
    const htmlContent = chapterContent.passages[0]?.content || '';
    
    if (htmlContent) {
      // Parse NLT HTML to structured format
      const parsedContent = parseNLTHTML(htmlContent);
      console.log('[NLT Rendering] Parsed content:', {
        isNLT: parsedContent.isNLT,
        verseCount: parsedContent.nltVerses?.length,
        hasVerses: !!parsedContent.nltVerses
      });
      
      if (parsedContent.isNLT && parsedContent.nltVerses) {
        // Render NLT with its custom structure
        const nltContent: React.JSX.Element[] = [];
        
        parsedContent.nltVerses.forEach((verse: any, index: number) => {
          const verseNumber = parseInt(verse.verseNumber);
          const isHighlighted = verseNumber === currentVerseNumber;
          
          // Add chapter number for first verse
          if (verse.isFirstVerse && verse.hasChapterNumber && parsedContent.chapterNumber) {
            nltContent.push(
              <div key="nlt-chapter-container" className="esv-chapter-container">
                <div className="esv-chapter-number">{parsedContent.chapterNumber}</div>
                <div className="nlt-first-verse-content">
                  {verse.heading && (
                    <h3 className="esv-heading">{verse.heading}</h3>
                  )}
                  <p className="context-paragraph esv-format esv-first-paragraph">
                    <span className={isHighlighted ? 'highlighted-verse' : ''}>
                      {/* Don't show verse number 1 for first verse as chapter number is already shown */}
                      {renderNLTVerseContent(verse.content)}
                    </span>
                  </p>
                </div>
              </div>
            );
          } else {
            // Add heading if present
            if (verse.heading) {
              nltContent.push(
                <h3 key={`heading-${index}`} className="esv-heading">
                  {verse.heading}
                </h3>
              );
            }
            
            // Add verse content
            if (verse.content.length > 0) {
              nltContent.push(
                <p key={`verse-${verse.verseNumber}`} className="context-paragraph">
                  <span className={isHighlighted ? 'highlighted-verse' : ''}>
                    <sup className="context-verse-number">{verse.verseNumber}</sup>
                    {renderNLTVerseContent(verse.content)}
                  </span>
                </p>
              );
            }
          }
        });
        
        return [
          <div key="nlt-chapter" className="esv-content">
            {nltContent}
          </div>
        ];
      }
    }
  }
  
  // Original code for non-ESV translations
  if (chapterContent.content) {
    chapterContent.content.forEach((section: any) => {
    // Handle headings
    if (section.type === 'tag' && section.name === 'heading') {
      const headingText = section.items?.[0]?.text || '';
      if (headingText) {
        paragraphs.push(
          <h3 key={`heading-${paragraphs.length}`} className="esv-heading">
            {headingText}
          </h3>
        );
      }
    }
    // Each section is a paragraph with a style
    else if (section.type === 'tag' && section.name === 'para') {
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
                // console.log('Found words of Jesus tag in verse', currentVerseNum, nextItem);
              }
              if (isAdd) {
                // console.log('Found translator addition tag in verse', currentVerseNum, nextItem);
              }
              if (isNd) {
                // console.log('Found divine name tag in verse', currentVerseNum, nextItem);
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
  } // End if (chapterContent.content)

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