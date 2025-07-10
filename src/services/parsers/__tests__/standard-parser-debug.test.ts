import { StandardBibleParser } from '../standard-parser';

// This test is to help debug the KJV API response format issue
describe('StandardBibleParser - Debug KJV API Response', () => {
  let parser: StandardBibleParser;

  beforeEach(() => {
    parser = new StandardBibleParser('KJV');
  });

  // Test with actual KJV API response structure
  it('should parse actual KJV API response format', () => {
    // Based on the error "No verses found in API response", 
    // the API might be returning a different structure
    
    // Possibility 1: Nested data structure
    const nestedResponse = {
      reference: 'James 1',
      data: {
        content: [
          {
            items: [
              { name: '1', text: 'James, a servant of God and of the Lord Jesus Christ' }
            ]
          }
        ]
      }
    };
    
    // This will likely fail, helping us understand the issue
    try {
      const result = parser.parse(nestedResponse);
      console.log('Nested structure worked:', result.verses.length);
    } catch (error) {
      console.log('Nested structure failed:', error.message);
    }
    
    // Possibility 2: Different content structure
    const differentContentStructure = {
      reference: 'James 1',
      content: {
        verses: [
          { number: '1', text: 'James, a servant of God' }
        ]
      }
    };
    
    try {
      const result = parser.parse(differentContentStructure);
      console.log('Different content structure worked:', result.verses.length);
    } catch (error) {
      console.log('Different content structure failed:', error.message);
    }
    
    // Possibility 3: Content as string (HTML)
    const htmlContent = {
      reference: 'James 1',
      content: '<p><b>1</b> James, a servant of God</p>'
    };
    
    try {
      const result = parser.parse(htmlContent);
      console.log('HTML content worked:', result.verses.length);
    } catch (error) {
      console.log('HTML content failed:', error.message);
    }
  });

  // Test to understand what fetchStandardChapter returns
  it('should handle the actual format from fetchStandardChapter', () => {
    // The fetchStandardChapter method returns:
    // {
    //   id: data.data.id,
    //   reference: data.data.reference || chapterReference,
    //   bookId: data.data.bookId,
    //   content: data.data.content,
    //   copyright: data.data.copyright
    // }
    
    // So the parser receives this structure, not data.data directly
    const actualFormat = {
      id: 'JHN.3',
      reference: 'John 3',
      bookId: 'JHN',
      content: [
        {
          items: [
            { name: '1', text: 'There was a man of the Pharisees' }
          ]
        }
      ],
      copyright: 'Public Domain'
    };
    
    const result = parser.parse(actualFormat);
    
    expect(result.verses).toHaveLength(1);
    expect(result.verses[0].number).toBe('1');
    expect(result.verses[0].text).toContain('There was a man');
  });
});