import { ESVBibleParser } from '../esv-parser';

describe('ESVBibleParser - Integration Tests', () => {
  let parser: ESVBibleParser;

  beforeEach(() => {
    parser = new ESVBibleParser();
  });

  describe('parse with actual ESV API response format', () => {
    it('should parse ESV API response correctly', () => {
      // This is the actual format returned by ESV API
      const actualApiResponse = {
        query: "John 3",
        canonical: "John 3",
        parsed: [[43003001, 43003021]],
        passage_meta: [{
          canonical: "John 3",
          chapter_start: [43003001],
          chapter_end: [43003036],
          prev_verse: 43002025,
          next_verse: 43004001,
          prev_chapter: [43002001],
          next_chapter: [43004001]
        }],
        passages: [
          `<h2 class="extra_text">John 3 <span class="small-caps">English Standard Version</span></h2>
<h3 id="p43003001_01-1">You Must Be Born Again</h3>
<p id="p43003001_06-1" class="chapter-first"><span class="text John-3-1"><span class="chapternum">3 </span>Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews. </span> <span class="text John-3-2"><span class="versenum">2 </span>This man came to Jesus by night and said to him, <span class="woc">"Rabbi, we know that you are a teacher come from God, for no one can do these signs that you do unless God is with him."</span> </span></p>`
        ]
      };

      const result = parser.parse(actualApiResponse);
      
      // Debug output
      console.log('Parsed verses:', JSON.stringify(result.verses, null, 2));

      // Verify structure
      expect(result.reference).toBe('John 3');
      expect(result.translation).toBe('ESV');
      expect(result.bookName).toBe('John');
      expect(result.chapterNumber).toBe('3');
      expect(result.verses).toHaveLength(2);

      // Verify first verse
      expect(result.verses[0]).toMatchObject({
        number: '1',
        text: 'Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.',
        isFirstVerse: true,
        isRedLetter: false
      });
      
      // For now, headings are not parsed in the paragraph fallback
      // TODO: Add heading support to paragraph parser

      // Verify second verse with red letters
      expect(result.verses[1]).toMatchObject({
        number: '2',
        text: 'This man came to Jesus by night and said to him, "Rabbi, we know that you are a teacher come from God, for no one can do these signs that you do unless God is with him."',
        isFirstVerse: false,
        isRedLetter: true
      });
    });

    it('should handle ESV response without passages array', () => {
      const invalidResponse = {
        query: "John 3",
        canonical: "John 3"
        // Missing passages array
      };

      expect(() => parser.parse(invalidResponse)).toThrow('Invalid ESV API response: missing passages');
    });

    it('should handle empty passages array', () => {
      const emptyResponse = {
        passages: []
      };

      expect(() => parser.parse(emptyResponse)).toThrow('Invalid ESV API response: missing passages');
    });

    it('should handle null response', () => {
      expect(() => parser.parse(null)).toThrow('Invalid ESV API response: missing passages');
    });
  });
});