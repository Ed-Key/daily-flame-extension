import { NLTBibleParser } from '../nlt-parser';

describe('NLTBibleParser - Integration Tests', () => {
  let parser: NLTBibleParser;

  beforeEach(() => {
    parser = new NLTBibleParser();
  });

  describe('parse with actual NLT API response format', () => {
    it('should parse NLT API response correctly', () => {
      // This is the actual format returned by NLT API wrapped by our service
      const actualApiResponse = {
        passages: [{
          reference: "John 3",
          content: `<div id="bibletext">
            <verse_export vn="1">
              <cn>3</cn>There was a man named Nicodemus, a member of the Jewish ruling council.
            </verse_export>
            <verse_export vn="2">
              He came to Jesus at night and said, <span class="red">"Rabbi, we all know that God has sent you to teach us. Your miraculous signs are evidence that God is with you."</span>
            </verse_export>
          </div>`
        }]
      };

      const result = parser.parse(actualApiResponse);

      // Verify structure
      expect(result.reference).toBe('John 3');
      expect(result.translation).toBe('NLT');
      expect(result.bookName).toBe('John');
      expect(result.chapterNumber).toBe('3');
      expect(result.verses).toHaveLength(2);

      // Verify first verse with chapter number
      expect(result.verses[0]).toMatchObject({
        number: '1',
        text: 'There was a man named Nicodemus, a member of the Jewish ruling council.',
        isFirstVerse: true,
        isRedLetter: false
      });

      // Verify second verse with red letters
      expect(result.verses[1]).toMatchObject({
        number: '2',
        text: 'He came to Jesus at night and said, "Rabbi, we all know that God has sent you to teach us. Your miraculous signs are evidence that God is with you."',
        isFirstVerse: false,
        isRedLetter: true
      });
    });

    it('should handle section headings', () => {
      const apiResponse = {
        passages: [{
          reference: 'Matthew 5',
          content: `
            <verse_export vn="1">
              <sn>The Sermon on the Mount</sn>
              <cn>5</cn>One day as he saw the crowds gathering, Jesus went up on the mountainside.
            </verse_export>
            <verse_export vn="3">
              <sn>The Beatitudes</sn>
              God blesses those who are poor
            </verse_export>
          `
        }]
      };

      const result = parser.parse(apiResponse);

      expect(result.verses[0].heading).toBe('The Sermon on the Mount');
      expect(result.verses[1].heading).toBe('The Beatitudes');
    });

    it('should handle invalid response', () => {
      expect(() => parser.parse(null)).toThrow('Invalid NLT API response');
      expect(() => parser.parse({})).toThrow('Invalid NLT API response');
      expect(() => parser.parse({ passages: [] })).toThrow('Invalid NLT API response');
    });
  });
});