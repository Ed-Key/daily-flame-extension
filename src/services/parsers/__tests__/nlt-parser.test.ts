import { NLTBibleParser } from '../nlt-parser';

describe('NLTBibleParser', () => {
  let parser: NLTBibleParser;

  beforeEach(() => {
    parser = new NLTBibleParser();
  });

  describe('parse', () => {
    it('should parse NLT response with verse_export structure', () => {
      const apiResponse = {
        passages: [{
          reference: 'John 3',
          content: `
            <verse_export vn="1">
              <cn>3</cn>There was a man named Nicodemus, a member of the Jewish ruling council.
            </verse_export>
            <verse_export vn="2">
              He came to Jesus at night and said, <red>"Rabbi, we all know that God has sent you to teach us."</red>
            </verse_export>
          `
        }]
      };

      const result = parser.parse(apiResponse);

      expect(result.reference).toBe('John 3');
      expect(result.translation).toBe('NLT');
      expect(result.bookName).toBe('John');
      expect(result.chapterNumber).toBe('3');
      expect(result.verses).toHaveLength(2);

      // First verse with chapter number
      expect(result.verses[0]).toMatchObject({
        number: '1',
        text: 'There was a man named Nicodemus, a member of the Jewish ruling council.',
        isFirstVerse: true,
        isRedLetter: false
      });

      // Second verse with red letter
      expect(result.verses[1]).toMatchObject({
        number: '2',
        text: 'He came to Jesus at night and said, "Rabbi, we all know that God has sent you to teach us."',
        isFirstVerse: false,
        isRedLetter: true
      });
    });

    it('should mark only verses with <cn> tag as isFirstVerse', () => {
      const apiResponse = {
        passages: [{
          reference: 'James 1',
          content: `
            <verse_export vn="1">
              <cn>1</cn>This letter is from James.
            </verse_export>
            <verse_export vn="2">
              I am writing to the twelve tribes.
            </verse_export>
            <verse_export vn="3">
              <cn>3</cn>This should not happen in real data but tests edge case.
            </verse_export>
          `
        }]
      };

      const result = parser.parse(apiResponse);

      // Only verse 1 with <cn> tag should be marked as first verse
      expect(result.verses[0].isFirstVerse).toBe(true);
      expect(result.verses[1].isFirstVerse).toBe(false);
      // Even if another verse has <cn>, it should still be marked as first (edge case)
      expect(result.verses[2].isFirstVerse).toBe(true);
    });

    it('should correctly parse James 1 format from screenshot', () => {
      const apiResponse = {
        passages: [{
          reference: 'James 1',
          content: `
            <verse_export vn="1">
              <sn>Greetings from James</sn>
              <cn>1</cn>This letter is from James, a slave of God and of the Lord Jesus Christ.
              I am writing to the "twelve tribes"—Jewish believers scattered abroad.
              Greetings!
            </verse_export>
            <verse_export vn="2">
              <sn>Faith and Endurance</sn>
              Dear brothers and sisters, when troubles of any kind come your way,
              consider it an opportunity for great joy.
            </verse_export>
          `
        }]
      };

      const result = parser.parse(apiResponse);

      // First verse should have chapter number and be marked as first
      expect(result.verses[0].number).toBe('1');
      expect(result.verses[0].isFirstVerse).toBe(true);
      expect(result.verses[0].heading).toBe('Greetings from James');
      expect(result.verses[0].text).toContain('This letter is from James');
      
      // Second verse should have heading but not be first
      expect(result.verses[1].number).toBe('2');
      expect(result.verses[1].isFirstVerse).toBe(false);
      expect(result.verses[1].heading).toBe('Faith and Endurance');
    });

    it('should handle section headings', () => {
      const apiResponse = {
        passages: [{
          reference: 'Matthew 5',
          content: `
            <verse_export vn="1">
              <sn>The Sermon on the Mount</sn>
              <cn>5</cn>One day as he saw the crowds gathering, Jesus went up on the mountainside and sat down.
            </verse_export>
            <verse_export vn="3">
              <sn>The Beatitudes</sn>
              God blesses those who are poor and realize their need for him
            </verse_export>
          `
        }]
      };

      const result = parser.parse(apiResponse);

      expect(result.verses[0].heading).toBe('The Sermon on the Mount');
      expect(result.verses[1].heading).toBe('The Beatitudes');
    });

    it.skip('should parse alternative NLT format with span.vn', () => {
      const apiResponse = {
        passages: [{
          reference: 'Psalm 23',
          content: `
            <p>
              <span class="cn">23</span>The Lord is my shepherd; I have all that I need.
              <span class="vn">2</span>He lets me rest in green meadows.
            </p>
          `
        }]
      };

      const result = parser.parse(apiResponse);

      expect(result.verses).toHaveLength(2);
      expect(result.verses[0]).toMatchObject({
        number: '1',
        text: 'The Lord is my shepherd; I have all that I need.',
        isFirstVerse: true
      });
      expect(result.verses[1]).toMatchObject({
        number: '2',
        text: 'He lets me rest in green meadows.',
        isFirstVerse: false
      });
    });

    it('should detect red letter with class attribute', () => {
      const apiResponse = {
        passages: [{
          reference: 'John 14',
          content: `
            <verse_export vn="1">
              <cn>14</cn><span class="red">"Don't let your hearts be troubled. Trust in God, and trust also in me."</span>
            </verse_export>
          `
        }]
      };

      const result = parser.parse(apiResponse);

      expect(result.verses[0].isRedLetter).toBe(true);
    });

    it('should handle multiple verse_export elements without chapter numbers', () => {
      const apiResponse = {
        passages: [{
          reference: 'Romans 8',
          content: `
            <verse_export vn="28">
              And we know that God causes everything to work together for the good
            </verse_export>
            <verse_export vn="29">
              For God knew his people in advance
            </verse_export>
          `
        }]
      };

      const result = parser.parse(apiResponse);

      expect(result.verses).toHaveLength(2);
      expect(result.verses[0].number).toBe('28');
      expect(result.verses[0].isFirstVerse).toBe(true); // First in the response
      expect(result.verses[1].number).toBe('29');
    });

    it('should clean HTML entities and tags', () => {
      const apiResponse = {
        passages: [{
          reference: 'John 1',
          content: `
            <verse_export vn="1">
              <cn>1</cn>In the beginning the Word already existed&mdash;the <b>Word</b> was with God&nbsp;
            </verse_export>
          `
        }]
      };

      const result = parser.parse(apiResponse);

      expect(result.verses[0].text).toBe('In the beginning the Word already existed—the Word was with God');
    });

    it('should preserve raw HTML in verse objects', () => {
      const apiResponse = {
        passages: [{
          reference: 'Test 1',
          content: '<verse_export vn="1"><cn>1</cn>Test verse</verse_export>'
        }]
      };

      const result = parser.parse(apiResponse);

      expect(result.verses[0].rawHtml).toContain('verse_export');
      expect(result.verses[0].rawHtml).toContain('Test verse');
    });

    it('should include NLT copyright in metadata', () => {
      const apiResponse = {
        passages: [{
          reference: 'Test 1',
          content: '<verse_export vn="1">Test</verse_export>'
        }]
      };

      const result = parser.parse(apiResponse);

      expect(result.metadata?.copyright).toContain('Tyndale House Foundation');
      expect(result.metadata?.translationName).toBe('New Living Translation');
    });

    it('should throw error for invalid response', () => {
      expect(() => parser.parse(null)).toThrow('Invalid NLT API response');
      expect(() => parser.parse({})).toThrow('Invalid NLT API response');
      expect(() => parser.parse({ passages: [] })).toThrow('Invalid NLT API response');
    });

    it('should throw error when no verses can be parsed', () => {
      const apiResponse = {
        passages: [{
          reference: 'Test 1',
          content: '<div>Some content without any verse structure</div>'
        }]
      };

      expect(() => parser.parse(apiResponse)).toThrow('Unable to parse NLT content');
    });

    it('should preserve raw response', () => {
      const apiResponse = {
        passages: [{
          reference: 'Test 1',
          content: '<verse_export vn="1">Test</verse_export>'
        }],
        extraData: 'preserved'
      };

      const result = parser.parse(apiResponse);

      expect(result.rawResponse).toEqual(apiResponse);
    });
  });
});