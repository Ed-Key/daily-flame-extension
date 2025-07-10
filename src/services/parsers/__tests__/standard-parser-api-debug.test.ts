import { StandardBibleParser } from '../standard-parser';

// This test will make an actual API call to understand the response format
describe('StandardBibleParser - Debug Actual API Response', () => {
  const API_KEY = '58410e50f19ea158ea4902e05191db02';
  const BASE_URL = 'https://api.scripture.api.bible/v1';

  it('should fetch and log actual KJV API response', async () => {
    // Make the same API call that verse-service makes
    const bibleId = 'de4e12af7f28f599-02'; // KJV
    const chapterApiRef = 'JAS.1'; // James 1
    const url = `${BASE_URL}/bibles/${bibleId}/chapters/${chapterApiRef}?content-type=json&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`;
    
    console.log('Fetching from:', url);
    
    const response = await fetch(url, {
      headers: {
        'api-key': API_KEY
      }
    });
    
    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('Full API response structure:', JSON.stringify(data, null, 2));
    
    // Log specific parts
    if (data.data) {
      console.log('data.data keys:', Object.keys(data.data));
      
      if (data.data.content) {
        console.log('Content is array?', Array.isArray(data.data.content));
        console.log('Content length:', data.data.content.length);
        
        if (data.data.content[0]) {
          console.log('First content item:', JSON.stringify(data.data.content[0], null, 2));
          
          if (data.data.content[0].items) {
            console.log('First verse item:', JSON.stringify(data.data.content[0].items[0], null, 2));
          }
        }
      }
    }
    
    // Now test the parser with the actual response
    const parser = new StandardBibleParser('KJV');
    
    // Transform to match what verse-service passes to the parser
    const parserInput = {
      id: data.data.id,
      reference: data.data.reference || 'James 1',
      bookId: data.data.bookId,
      content: data.data.content,
      copyright: data.data.copyright
    };
    
    console.log('Parser input:', JSON.stringify(parserInput, null, 2));
    
    try {
      const result = parser.parse(parserInput);
      console.log('Parser succeeded! Found verses:', result.verses.length);
      console.log('First verse:', result.verses[0]);
    } catch (error) {
      console.error('Parser failed:', error.message);
      
      // Try to understand why
      if (parserInput.content && parserInput.content[0]) {
        console.log('Content[0] structure:', {
          hasItems: 'items' in parserInput.content[0],
          keys: Object.keys(parserInput.content[0]),
          type: parserInput.content[0].type
        });
      }
    }
  });

  it('should test with WEB_BRITISH', async () => {
    // WEB British Edition
    const bibleId = 'f72b840c855f362c-04';
    const chapterApiRef = 'JAS.1';
    const url = `${BASE_URL}/bibles/${bibleId}/chapters/${chapterApiRef}?content-type=json&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`;
    
    const response = await fetch(url, {
      headers: {
        'api-key': API_KEY
      }
    });
    
    if (!response.ok) {
      console.error('WEB_BRITISH API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('WEB_BRITISH first content item:', JSON.stringify(data.data?.content?.[0], null, 2));
  });
});