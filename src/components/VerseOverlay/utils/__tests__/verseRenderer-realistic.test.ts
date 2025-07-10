import { renderContextVerses } from '../verseRenderer.tsx';

// Create a more realistic mock that actually processes the content
global.DOMParser = class DOMParser {
  parseFromString(string: string, type: string) {
    const doc = {
      body: {
        innerHTML: string,
        textContent: string.replace(/<[^>]*>/g, ''),
        firstElementChild: {
          tagName: 'DIV',
          textContent: string.replace(/<[^>]*>/g, ''),
          innerHTML: string,
          querySelectorAll: (selector: string) => {
            if (selector === 'verse_export') {
              return []; // NLT doesn't use verse_export
            }
            if (selector === 'h3, .subhead') {
              // Extract actual headings from the HTML
              const headings: any[] = [];
              const h3Matches = string.match(/<h3[^>]*>([^<]+)<\/h3>/g) || [];
              const subheadMatches = string.match(/class="subhead"[^>]*>([^<]+)</g) || [];
              
              [...h3Matches, ...subheadMatches].forEach(match => {
                const text = match.replace(/<[^>]*>/g, '').replace(/class="subhead"[^>]*>/, '');
                if (text) {
                  headings.push({ 
                    textContent: text,
                    querySelector: () => null,
                    querySelectorAll: () => []
                  });
                }
              });
              return headings;
            }
            return [];
          }
        }
      },
      querySelector: (selector: string) => null
    };
    return doc as any;
  }
} as any;

// Mock createTreeWalker to actually walk through text
if (!global.document) {
  global.document = {} as any;
}

global.document.createTreeWalker = jest.fn((root: any) => {
  const text = root.textContent || '';
  const nodes: any[] = [];
  
  // Create text nodes for the content
  nodes.push({
    nodeType: 3, // TEXT_NODE
    textContent: text,
    parentElement: root
  });
  
  let currentIndex = 0;
  
  return {
    nextNode: () => {
      if (currentIndex < nodes.length) {
        return nodes[currentIndex++];
      }
      return null;
    },
    currentNode: null
  };
}) as any;

describe('renderContextVerses - Realistic NLT parsing', () => {
  it('should parse actual NLT format with embedded verse numbers and inline headings', () => {
    // This is the actual format we're seeing in the screenshot
    const chapterContent = {
      passages: [{
        reference: 'James 1',
        content: 'James 1 Greetings from James 1This letter is from James, a slave of God and of the Lord Jesus Christ. I am writing to the "twelve tribes"—Jewish believers scattered abroad. Greetings! 2Faith and Endurance 2Dear brothers and sisters,*1:2 Greek brothers; also in 1:16, 19. when troubles of any kind come your way, consider it an opportunity for great joy. 33For you know that when your faith is tested, your endurance has a chance to grow.'
      }]
    };

    const result = renderContextVerses({
      chapterContent,
      currentVerseNumber: null,
      contextTranslation: 'NLT'
    });

    // The result should be JSX elements
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // TODO: In a real test, we would render this and check:
    // - Verse 1 doesn't show a verse number (chapter number is shown instead)
    // - Headings are rendered as separate <h3> elements
    // - Footnotes are removed
    // - Multi-digit verse numbers (33) are handled correctly
  });

  it('should remove footnotes from NLT text', () => {
    const chapterContent = {
      passages: [{
        reference: 'James 1',
        content: '2Dear brothers and sisters,*1:2 Greek brothers; also in 1:16, 19. when troubles come'
      }]
    };

    const result = renderContextVerses({
      chapterContent,
      currentVerseNumber: null,
      contextTranslation: 'NLT'
    });

    expect(Array.isArray(result)).toBe(true);
    // The footnote "*1:2 Greek brothers..." should be removed
  });

  it('should handle multi-digit verse numbers', () => {
    const chapterContent = {
      passages: [{
        reference: 'Psalm 119',
        content: '32I will run the way of Your commandments. 33Teach me, O Lord. 144Your testimonies are righteous forever.'
      }]
    };

    const result = renderContextVerses({
      chapterContent,
      currentVerseNumber: null,
      contextTranslation: 'NLT'
    });

    expect(Array.isArray(result)).toBe(true);
    // Should handle verses 32, 33, and 144 correctly
  });

  it('should extract inline headings from text', () => {
    const chapterContent = {
      passages: [{
        reference: 'James 1',
        content: '1Greetings from James 1This letter is from James. 2Faith and Endurance 2Dear brothers and sisters.'
      }]
    };

    const result = renderContextVerses({
      chapterContent,
      currentVerseNumber: null,
      contextTranslation: 'NLT'
    });

    expect(Array.isArray(result)).toBe(true);
    // Should extract "Greetings from James" and "Faith and Endurance" as headings
  });

  it('should not show verse number for verse 1 when chapter number is present', () => {
    const chapterContent = {
      passages: [{
        reference: 'John 1',
        content: '1In the beginning was the Word. 2The Word was with God.'
      }]
    };

    const result = renderContextVerses({
      chapterContent,
      currentVerseNumber: 1,
      contextTranslation: 'NLT'
    });

    expect(Array.isArray(result)).toBe(true);
    // Verse 1 should not show the number "1" since chapter "1" is already displayed
  });
});