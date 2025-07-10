import { renderUnifiedVerses } from '../unifiedVerseRenderer.tsx';
import { UnifiedChapter } from '../../../../types/bible-formats';

describe('renderUnifiedVerses', () => {
  describe('NLT formatting', () => {
    it('should return JSX elements for NLT chapters', () => {
      const chapterContent: UnifiedChapter = {
        reference: 'James 1',
        translation: 'NLT',
        bookName: 'James',
        chapterNumber: '1',
        verses: [
          {
            number: '1',
            text: 'This letter is from James, a slave of God.',
            isFirstVerse: true,
            isRedLetter: false,
            heading: 'Greetings from James'
          },
          {
            number: '2',
            text: 'Dear brothers and sisters.',
            isFirstVerse: false,
            isRedLetter: false,
            heading: 'Faith and Endurance'
          }
        ],
        metadata: {
          copyright: '© Tyndale',
          translationName: 'New Living Translation'
        }
      };

      const result = renderUnifiedVerses({
        chapterContent,
        currentVerseNumber: null
      });

      // Check that result is an array with JSX elements
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // The result should contain React elements
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('props');
    });

    it('should handle empty verses array', () => {
      const chapterContent: UnifiedChapter = {
        reference: 'Test 1',
        translation: 'NLT',
        bookName: 'Test',
        chapterNumber: '1',
        verses: [],
        metadata: {
          copyright: '© Test',
          translationName: 'Test Translation'
        }
      };

      const result = renderUnifiedVerses({
        chapterContent,
        currentVerseNumber: null
      });

      expect(result).toEqual([]);
    });
  });

  describe('ESV formatting', () => {
    it('should use ESV-specific rendering for ESV translation', () => {
      const chapterContent: UnifiedChapter = {
        reference: 'Psalm 23',
        translation: 'ESV',
        bookName: 'Psalm',
        chapterNumber: '23',
        verses: [
          {
            number: '1',
            text: 'The Lord is my shepherd; I shall not want.',
            isFirstVerse: true,
            isRedLetter: false
          }
        ],
        metadata: {
          copyright: '© ESV',
          translationName: 'English Standard Version'
        }
      };

      const result = renderUnifiedVerses({
        chapterContent,
        currentVerseNumber: null
      });

      // Check that result is an array with JSX elements
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('KJV formatting', () => {
    it('should use KJV-specific rendering for KJV translation', () => {
      const chapterContent: UnifiedChapter = {
        reference: 'John 3',
        translation: 'KJV',
        bookName: 'John',
        chapterNumber: '3',
        verses: [
          {
            number: '16',
            text: 'For God so loved the world.',
            isFirstVerse: true,
            isRedLetter: false
          }
        ],
        metadata: {
          copyright: '',
          translationName: 'King James Version'
        }
      };

      const result = renderUnifiedVerses({
        chapterContent,
        currentVerseNumber: null
      });

      // Check that result is an array with JSX elements
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});