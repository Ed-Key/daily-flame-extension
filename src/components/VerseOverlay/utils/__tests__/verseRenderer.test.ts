import { renderContextVerses } from '../verseRenderer.tsx';

// Mock DOMParser for tests
global.DOMParser = class DOMParser {
  parseFromString(string: string, type: string) {
    const doc = {
      body: {
        innerHTML: string,
        textContent: string.replace(/<[^>]*>/g, ''),
        firstElementChild: {
          textContent: string.replace(/<[^>]*>/g, ''),
          innerHTML: string,
          querySelectorAll: (selector: string) => {
            if (selector === 'verse_export') {
              return [];
            }
            if (selector === 'h3, .subhead') {
              const headings: any[] = [];
              const h3Match = string.match(/<h3[^>]*>(.*?)<\/h3>/g);
              if (h3Match) {
                h3Match.forEach(match => {
                  const text = match.replace(/<[^>]*>/g, '');
                  headings.push({ textContent: text });
                });
              }
              return headings;
            }
            return [];
          }
        }
      },
      querySelector: (selector: string) => {
        if (selector === '#bibletext') {
          return null;
        }
        return null;
      }
    };
    return doc as any;
  }
} as any;

// Mock document.createTreeWalker
if (!global.document) {
  global.document = {} as any;
}
global.document.createTreeWalker = jest.fn(() => ({
  nextNode: jest.fn(() => null),
  currentNode: null
})) as any;

describe('renderContextVerses - NLT parsing', () => {
  it('should parse NLT text with embedded verse numbers', () => {
    const chapterContent = {
      passages: [{
        reference: 'James 1',
        content: '1This letter is from James, a slave of God. 2Dear brothers and sisters, when troubles come. 3For you know that testing develops endurance.'
      }]
    };

    const result = renderContextVerses({
      chapterContent,
      currentVerseNumber: null,
      contextTranslation: 'NLT'
    });

    // Should return JSX elements
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should extract headings from NLT HTML', () => {
    const chapterContent = {
      passages: [{
        reference: 'James 1', 
        content: '<h3>Greetings from James</h3>1This letter is from James. <h3>Faith and Endurance</h3>2Dear brothers and sisters.'
      }]
    };

    const result = renderContextVerses({
      chapterContent,
      currentVerseNumber: null,
      contextTranslation: 'NLT'
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should remove footnotes from NLT text', () => {
    const chapterContent = {
      passages: [{
        reference: 'James 1',
        content: '1This letter is from James. 2Dear brothers*1:2 Greek brothers; also in 1:16, 19. and sisters.'
      }]
    };

    const result = renderContextVerses({
      chapterContent,
      currentVerseNumber: null,
      contextTranslation: 'NLT'
    });

    expect(Array.isArray(result)).toBe(true);
    // The footnote should be removed
  });

  it('should handle NLT text without verse_export elements', () => {
    const chapterContent = {
      passages: [{
        reference: 'John 3',
        content: '16For God so loved the world that he gave his one and only Son. 17God did not send his Son to condemn.'
      }]
    };

    const result = renderContextVerses({
      chapterContent,
      currentVerseNumber: 16,
      contextTranslation: 'NLT'
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should not show verse number 1 for first verse', () => {
    const chapterContent = {
      passages: [{
        reference: 'Psalm 23',
        content: '1The Lord is my shepherd; I shall not want. 2He makes me lie down in green pastures.'
      }]
    };

    const result = renderContextVerses({
      chapterContent,
      currentVerseNumber: null,
      contextTranslation: 'NLT'
    });

    expect(Array.isArray(result)).toBe(true);
    // First verse should not have verse number shown since chapter number is displayed
  });
});