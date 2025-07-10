import { StandardBibleParser } from '../standard-parser';

describe('StandardBibleParser - Integration Tests', () => {
  describe('parse with actual API responses', () => {
    it('should parse KJV response from scripture.api.bible', () => {
      const parser = new StandardBibleParser('KJV');
      
      // Actual response format from scripture.api.bible
      const actualApiResponse = {
        id: "JHN.3",
        reference: "John 3",
        bookId: "JHN",
        content: [
          {
            name: "chapter",
            type: "tag",
            attrs: { number: "3" },
            items: [
              {
                name: "1",
                type: "verse",
                text: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:"
              },
              {
                name: "2", 
                type: "verse",
                text: "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these signs that thou doest, except God be with him."
              }
            ]
          }
        ],
        copyright: "Public Domain"
      };

      const result = parser.parse(actualApiResponse);

      expect(result.reference).toBe('John 3');
      expect(result.translation).toBe('KJV');
      expect(result.bookName).toBe('John');
      expect(result.chapterNumber).toBe('3');
      expect(result.verses).toHaveLength(2);

      expect(result.verses[0]).toMatchObject({
        number: '1',
        text: 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:',
        isFirstVerse: true
      });

      expect(result.verses[1]).toMatchObject({
        number: '2',
        text: 'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these signs that thou doest, except God be with him.',
        isFirstVerse: false
      });
    });

    it('should handle ASV translation', () => {
      const parser = new StandardBibleParser('ASV');
      
      const apiResponse = {
        reference: "Psalm 23",
        content: [{
          items: [
            { name: "1", text: "Jehovah is my shepherd; I shall not want." },
            { name: "2", text: "He maketh me to lie down in green pastures" }
          ]
        }]
      };

      const result = parser.parse(apiResponse);

      expect(result.translation).toBe('ASV');
      expect(result.metadata?.translationName).toBe('American Standard Version');
    });
  });
});