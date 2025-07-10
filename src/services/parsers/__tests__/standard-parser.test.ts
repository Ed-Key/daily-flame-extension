import { StandardBibleParser } from '../standard-parser';
import { UnifiedChapter } from '../../../types/bible-formats';

describe('StandardBibleParser', () => {
  let parser: StandardBibleParser;

  beforeEach(() => {
    parser = new StandardBibleParser('KJV');
  });

  describe('parse', () => {
    it('should parse standard API response with content array', () => {
      const apiResponse = {
        reference: 'John 3',
        content: [
          {
            items: [
              { name: '1', text: 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:' },
              { name: '2', text: 'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God' }
            ]
          }
        ],
        copyright: '© Public Domain'
      };

      const result = parser.parse(apiResponse);

      expect(result.reference).toBe('John 3');
      expect(result.translation).toBe('KJV');
      expect(result.bookName).toBe('John');
      expect(result.chapterNumber).toBe('3');
      expect(result.verses).toHaveLength(2);
      
      expect(result.verses[0]).toEqual({
        number: '1',
        text: 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:',
        isRedLetter: false,
        isFirstVerse: true
      });

      expect(result.verses[1]).toEqual({
        number: '2',
        text: 'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God',
        isRedLetter: false,
        isFirstVerse: false
      });

      expect(result.metadata?.copyright).toBe('© Public Domain');
      expect(result.metadata?.translationName).toBe('King James Version');
    });

    it('should parse response with items at root level', () => {
      const apiResponse = {
        reference: 'Psalm 23',
        items: [
          { name: '1', text: 'The LORD is my shepherd; I shall not want.' },
          { name: '2', text: 'He maketh me to lie down in green pastures' }
        ]
      };

      const result = parser.parse(apiResponse);

      expect(result.verses).toHaveLength(2);
      expect(result.bookName).toBe('Psalm');
      expect(result.chapterNumber).toBe('23');
    });

    it('should skip non-verse items', () => {
      const apiResponse = {
        reference: 'Matthew 5',
        content: [
          {
            items: [
              { name: 'title', text: 'The Sermon on the Mount' }, // Should be skipped
              { name: '1', text: 'And seeing the multitudes, he went up into a mountain' },
              { name: 'heading', text: 'The Beatitudes' }, // Should be skipped  
              { name: '2', text: 'And he opened his mouth, and taught them, saying' }
            ]
          }
        ]
      };

      const result = parser.parse(apiResponse);

      expect(result.verses).toHaveLength(2);
      expect(result.verses[0].number).toBe('1');
      expect(result.verses[1].number).toBe('2');
    });

    it('should handle multiple content sections', () => {
      const apiResponse = {
        reference: 'Genesis 1',
        content: [
          {
            items: [
              { name: '1', text: 'In the beginning God created the heaven and the earth.' }
            ]
          },
          {
            items: [
              { name: '2', text: 'And the earth was without form, and void' }
            ]
          }
        ]
      };

      const result = parser.parse(apiResponse);

      expect(result.verses).toHaveLength(2);
      expect(result.verses[0].isFirstVerse).toBe(true);
      expect(result.verses[1].isFirstVerse).toBe(false);
    });

    it('should clean verse text', () => {
      const apiResponse = {
        reference: 'John 1',
        content: [
          {
            items: [
              { name: '1', text: '  In the   beginning   was   the Word  ' }
            ]
          }
        ]
      };

      const result = parser.parse(apiResponse);

      expect(result.verses[0].text).toBe('In the beginning was the Word');
    });

    it('should throw error for missing reference', () => {
      const apiResponse = {
        content: [{ items: [{ name: '1', text: 'test' }] }]
      };

      expect(() => parser.parse(apiResponse)).toThrow('Invalid API response: missing reference');
    });

    it('should throw error for invalid reference format', () => {
      const apiResponse = {
        reference: 'InvalidReference',
        content: []
      };

      expect(() => parser.parse(apiResponse)).toThrow('Invalid chapter reference');
    });

    it('should throw error when no verses found', () => {
      const apiResponse = {
        reference: 'John 3',
        content: []
      };

      expect(() => parser.parse(apiResponse)).toThrow('No verses found in API response');
    });

    it('should handle different translations', () => {
      const asvParser = new StandardBibleParser('ASV');
      const apiResponse = {
        reference: 'John 3',
        content: [{
          items: [{ name: '1', text: 'Now there was a man of the Pharisees' }]
        }]
      };

      const result = asvParser.parse(apiResponse);

      expect(result.translation).toBe('ASV');
      expect(result.metadata?.translationName).toBe('American Standard Version');
    });

    it('should preserve raw response for debugging', () => {
      const apiResponse = {
        reference: 'John 3',
        content: [{
          items: [{ name: '1', text: 'test' }]
        }],
        extraData: 'preserved'
      };

      const result = parser.parse(apiResponse);

      expect(result.rawResponse).toEqual(apiResponse);
      expect(result.rawResponse.extraData).toBe('preserved');
    });
  });

  describe('getTranslationFullName', () => {
    it('should return correct full names for all translations', () => {
      const translations = [
        { code: 'KJV', name: 'King James Version' },
        { code: 'ASV', name: 'American Standard Version' },
        { code: 'WEB', name: 'World English Bible' },
        { code: 'WEB_BRITISH', name: 'World English Bible British Edition' },
        { code: 'WEB_UPDATED', name: 'World English Bible Updated' }
      ];

      translations.forEach(({ code, name }) => {
        const testParser = new StandardBibleParser(code as any);
        const result = testParser.parse({
          reference: 'Test 1',
          content: [{ items: [{ name: '1', text: 'test' }] }]
        });
        expect(result.metadata?.translationName).toBe(name);
      });
    });
  });
});