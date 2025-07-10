import { BaseBibleParser } from '../base-parser';
import { UnifiedChapter } from '../../../types/bible-formats';
import { BibleTranslation } from '../../../types';

// Create a concrete implementation for testing
class TestParser extends BaseBibleParser {
  constructor() {
    super('KJV');
  }

  parse(apiResponse: any): UnifiedChapter {
    // Simple implementation for testing
    return {
      reference: 'Test 1',
      translation: 'KJV',
      bookName: 'Test',
      chapterNumber: '1',
      verses: []
    };
  }

  // Expose protected methods for testing
  public testParseReference(reference: string) {
    return this.parseReference(reference);
  }

  public testCleanVerseText(text: string) {
    return this.cleanVerseText(text);
  }

  public testExtractTextFromHtml(html: string) {
    return this.extractTextFromHtml(html);
  }

  public testStripHtmlTags(html: string) {
    return this.stripHtmlTags(html);
  }

  public testCreateVerse(number: string, text: string, options?: any) {
    return this.createVerse(number, text, options);
  }
}

describe('BaseBibleParser', () => {
  let parser: TestParser;

  beforeEach(() => {
    parser = new TestParser();
  });

  describe('parseReference', () => {
    it('should parse simple book references', () => {
      const result = parser.testParseReference('John 3');
      expect(result).toEqual({
        bookName: 'John',
        chapterNumber: '3'
      });
    });

    it('should parse numbered book references', () => {
      const result = parser.testParseReference('1 Corinthians 13');
      expect(result).toEqual({
        bookName: '1 Corinthians',
        chapterNumber: '13'
      });
    });

    it('should parse multi-word book names', () => {
      const result = parser.testParseReference('Song of Solomon 2');
      expect(result).toEqual({
        bookName: 'Song of Solomon',
        chapterNumber: '2'
      });
    });

    it('should throw error for invalid references', () => {
      expect(() => parser.testParseReference('Invalid')).toThrow('Invalid chapter reference');
      expect(() => parser.testParseReference('John')).toThrow('Invalid chapter reference');
      expect(() => parser.testParseReference('')).toThrow('Invalid chapter reference');
    });
  });

  describe('cleanVerseText', () => {
    it('should normalize whitespace', () => {
      expect(parser.testCleanVerseText('  Multiple   spaces   ')).toBe('Multiple spaces');
      expect(parser.testCleanVerseText('\n\nNew\nlines\n')).toBe('New lines');
      expect(parser.testCleanVerseText('\tTabs\t\there\t')).toBe('Tabs here');
    });

    it('should handle non-breaking spaces', () => {
      expect(parser.testCleanVerseText('Non\u00A0breaking\u00A0space')).toBe('Non breaking space');
    });

    it('should handle mixed whitespace', () => {
      const text = '  \n\t Mixed \u00A0 whitespace \r\n test  ';
      expect(parser.testCleanVerseText(text)).toBe('Mixed whitespace test');
    });
  });

  describe('extractTextFromHtml', () => {
    it('should extract plain text', () => {
      const result = parser.testExtractTextFromHtml('<p>Simple text</p>');
      expect(result).toEqual({
        text: 'Simple text',
        isRedLetter: false
      });
    });

    it('should detect red letter text with woc class', () => {
      const result = parser.testExtractTextFromHtml('<span class="woc">Words of Christ</span>');
      expect(result).toEqual({
        text: 'Words of Christ',
        isRedLetter: true
      });
    });

    it('should detect red letter text with red class', () => {
      const result = parser.testExtractTextFromHtml('<span class="red">Words of Christ</span>');
      expect(result).toEqual({
        text: 'Words of Christ',
        isRedLetter: true
      });
    });

    it('should detect red letter text with words-of-jesus class', () => {
      const result = parser.testExtractTextFromHtml('<span class="words-of-jesus">Words of Christ</span>');
      expect(result).toEqual({
        text: 'Words of Christ',
        isRedLetter: true
      });
    });

    it('should handle nested HTML in red letter text', () => {
      const html = '<span class="woc"><b>Verily</b> I say unto you</span>';
      const result = parser.testExtractTextFromHtml(html);
      expect(result).toEqual({
        text: 'Verily I say unto you',
        isRedLetter: true
      });
    });
  });

  describe('stripHtmlTags', () => {
    it('should remove common HTML tags', () => {
      expect(parser.testStripHtmlTags('<p>Paragraph</p>')).toBe('Paragraph');
      expect(parser.testStripHtmlTags('<div>Division</div>')).toBe('Division');
      expect(parser.testStripHtmlTags('<span>Span text</span>')).toBe('Span text');
    });

    it('should replace br tags with spaces', () => {
      expect(parser.testStripHtmlTags('Line 1<br>Line 2')).toBe('Line 1 Line 2');
      expect(parser.testStripHtmlTags('Line 1<br/>Line 2')).toBe('Line 1 Line 2');
      expect(parser.testStripHtmlTags('Line 1<br />Line 2')).toBe('Line 1 Line 2');
    });

    it('should decode HTML entities', () => {
      expect(parser.testStripHtmlTags('&amp; &lt; &gt; &quot; &#39;')).toBe('& < > " \'');
      expect(parser.testStripHtmlTags('&nbsp;space')).toBe(' space');
    });

    it('should handle complex nested HTML', () => {
      const html = '<div class="verse"><span class="num">1</span> <span class="text">In the <b>beginning</b></span></div>';
      expect(parser.testStripHtmlTags(html)).toBe('1 In the beginning');
    });
  });

  describe('createVerse', () => {
    it('should create basic verse', () => {
      const verse = parser.testCreateVerse('1', 'In the beginning God created');
      expect(verse).toEqual({
        number: '1',
        text: 'In the beginning God created',
        isRedLetter: false,
        isFirstVerse: false
      });
    });

    it('should apply options override', () => {
      const verse = parser.testCreateVerse('1', 'Text', {
        isRedLetter: true,
        isFirstVerse: true,
        heading: 'Creation'
      });
      expect(verse).toEqual({
        number: '1',
        text: 'Text',
        isRedLetter: true,
        isFirstVerse: true,
        heading: 'Creation'
      });
    });

    it('should clean verse text', () => {
      const verse = parser.testCreateVerse('1', '  Multiple   spaces  ');
      expect(verse.text).toBe('Multiple spaces');
    });
  });

  describe('getName', () => {
    it('should return parser name', () => {
      expect(parser.getName()).toBe('KJVParser');
    });
  });
});