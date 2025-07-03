import { VerseData } from '../types';

export class ESVService {
  private static readonly API_KEY = 'd74f42aa54c642a4cbfef2a93c5c67f460f13cdb';
  private static readonly BASE_URL = 'https://api.esv.org/v3';

  static async getVerse(reference: string): Promise<VerseData> {
    try {
      const url = `${this.BASE_URL}/passage/text/?q=${encodeURIComponent(reference)}&include-passage-references=false&include-footnotes=false&include-headings=false&include-verse-numbers=false`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${this.API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`ESV API request failed: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.passages || data.passages.length === 0) {
        throw new Error('No verse content found');
      }
      
      // Extract text from the passages array
      let text = data.passages[0];
      
      // Remove the verse reference from the beginning if present
      const referencePattern = new RegExp(`^${data.canonical}\\s*`);
      text = text.replace(referencePattern, '');
      
      // Remove the (ESV) suffix
      text = text.replace(/\s*\(ESV\)\s*$/, '');
      
      // Clean up extra whitespace
      text = text.trim();
      
      return {
        text: text,
        reference: data.canonical || reference,
        bibleId: 'ESV'
      };
      
    } catch (error) {
      console.error('Error fetching ESV verse:', error);
      throw error;
    }
  }

  static async getChapter(chapterReference: string): Promise<any> {
    try {
      const url = `${this.BASE_URL}/passage/text/?q=${encodeURIComponent(chapterReference)}&include-passage-references=false&include-footnotes=false&include-headings=false&include-verse-numbers=true`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${this.API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`ESV API request failed: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.passages || data.passages.length === 0) {
        throw new Error('No chapter content found');
      }
      
      // Parse the text format to extract verses
      const passageText = data.passages[0];
      const verses: any[] = [];
      
      // ESV returns text with verse numbers in brackets like [1], [2], etc.
      // We need to parse this into a format similar to scripture.api.bible
      const verseMatches = passageText.matchAll(/\[(\d+)\]\s*([^[]*?)(?=\[|$)/g);
      
      for (const match of verseMatches) {
        const verseNum = match[1];
        const verseText = match[2].trim();
        
        // Check if this verse contains words of Jesus
        // In ESV text format, we don't have markup, so we'll need to use the HTML endpoint for red letters
        verses.push({
          number: verseNum,
          text: verseText
        });
      }
      
      // Return in a format similar to scripture.api.bible
      return {
        id: chapterReference,
        reference: data.canonical,
        content: [{
          items: verses.map(v => ({
            type: 'verse',
            number: v.number,
            text: v.text
          }))
        }],
        verseCount: verses.length
      };
      
    } catch (error) {
      console.error('Error fetching ESV chapter:', error);
      throw error;
    }
  }

  // Get chapter with HTML format for red letter support
  static async getChapterWithRedLetters(chapterReference: string): Promise<any> {
    try {
      const url = `${this.BASE_URL}/passage/html/?q=${encodeURIComponent(chapterReference)}&include-passage-references=false&include-footnotes=false&include-headings=false&include-verse-numbers=true&include-audio-link=false`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${this.API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`ESV API request failed: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.passages || data.passages.length === 0) {
        throw new Error('No chapter content found');
      }
      
      // Parse HTML to extract verses with red letter support
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.passages[0], 'text/html');
      
      const verses: any[] = [];
      
      // Find all verse numbers
      const verseNums = doc.querySelectorAll('.verse-num');
      
      verseNums.forEach((verseNumElement) => {
        const verseNum = verseNumElement.textContent?.replace(/\s/g, '') || '';
        
        // Get all text nodes and elements until the next verse number
        const content: any[] = [];
        let node = verseNumElement.nextSibling;
        
        while (node && !(node instanceof Element && node.classList?.contains('verse-num'))) {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
              content.push({
                type: 'text',
                text: text
              });
            }
          } else if (node instanceof Element && node.classList?.contains('woc')) {
            // Words of Christ
            content.push({
              type: 'tag',
              name: 'char',
              attrs: { style: 'wj' },
              items: [{
                type: 'text',
                text: node.textContent || ''
              }]
            });
          }
          
          node = node.nextSibling;
        }
        
        if (verseNum && content.length > 0) {
          verses.push({
            type: 'tag',
            name: 'verse',
            attrs: { number: verseNum.replace(/[^\d]/g, '') },
            items: []
          });
          
          // Add content items
          content.forEach(item => {
            if (item.type === 'text' || item.type === 'tag') {
              verses.push(item);
            }
          });
        }
      });
      
      // Return in a format similar to scripture.api.bible
      return {
        id: chapterReference,
        reference: data.canonical,
        content: [{
          type: 'tag',
          name: 'para',
          items: verses
        }],
        verseCount: verseNums.length
      };
      
    } catch (error) {
      console.error('Error fetching ESV chapter with red letters:', error);
      throw error;
    }
  }
}