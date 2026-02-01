import { VerseData } from '../types';

export class ESVService {
  static readonly API_KEY = 'd74f42aa54c642a4cbfef2a93c5c67f460f13cdb';
  private static readonly BASE_URL = 'https://api.esv.org/v3';

  static async getVerse(reference: string): Promise<VerseData> {
    // Normalize reference by replacing various dash types with standard hyphen
    // This handles en dash (–), em dash (—), and other Unicode dashes
    const normalizedReference = reference
      .replace(/[\u2010-\u2015\u2212]/g, '-')  // Unicode dashes to ASCII hyphen
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();

    try {
      const url = `${this.BASE_URL}/passage/text/?q=${encodeURIComponent(normalizedReference)}&include-passage-references=false&include-footnotes=false&include-headings=false&include-verse-numbers=false`;
      
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
      
      // Use normalized reference for consistent parsing (API canonical is preferred but normalize fallback)
      return {
        text: text,
        reference: data.canonical || normalizedReference,
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
      const url = `${this.BASE_URL}/passage/html/?q=${encodeURIComponent(chapterReference)}&include-passage-references=false&include-footnotes=false&include-headings=true&include-verse-numbers=true&include-audio-link=false`;
      
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
      
      const items: any[] = [];
      let chapterNumber = '';
      
      // Process all paragraphs and headings in order
      const elements = doc.querySelectorAll('p, h3');
      
      elements.forEach((element) => {
        if (element.tagName === 'H3') {
          // Add heading
          items.push({
            type: 'tag',
            name: 'heading',
            attrs: { level: '3' },
            items: [{
              type: 'text',
              text: element.textContent?.trim() || ''
            }]
          });
        } else if (element.tagName === 'P') {
          // Skip the ESV copyright paragraph
          if (element.querySelector('a.copyright')) {
            return;
          }
          
          // Create a paragraph container
          const paragraphItems: any[] = [];
          
          // Process all nodes within the paragraph
          const processNode = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const text = node.textContent || '';
              if (text.trim()) {
                paragraphItems.push({
                  type: 'text',
                  text: text
                });
              }
            } else if (node instanceof Element) {
              if (node.classList.contains('chapter-num')) {
                // Extract chapter number for display
                const match = node.textContent?.match(/(\d+):/);
                if (match) {
                  chapterNumber = match[1];
                }
                // Add verse marker - extract just the verse number after the colon
                const verseNum = node.textContent?.split(':')[1]?.trim() || '1';
                if (verseNum) {
                  paragraphItems.push({
                    type: 'tag',
                    name: 'verse',
                    attrs: { number: verseNum }
                  });
                }
              } else if (node.classList.contains('verse-num')) {
                // Add verse marker
                const verseNum = node.textContent?.replace(/[^\d]/g, '') || '';
                if (verseNum) {
                  paragraphItems.push({
                    type: 'tag',
                    name: 'verse',
                    attrs: { number: verseNum }
                  });
                }
              } else if (node.classList.contains('woc')) {
                // Words of Christ
                paragraphItems.push({
                  type: 'tag',
                  name: 'char',
                  attrs: { style: 'wj' },
                  items: [{
                    type: 'text',
                    text: node.textContent || ''
                  }]
                });
              } else {
                // Process child nodes
                node.childNodes.forEach(child => processNode(child));
              }
            }
          };
          
          // Process all child nodes of the paragraph
          element.childNodes.forEach(node => processNode(node));
          
          // Add paragraph if it has content
          if (paragraphItems.length > 0) {
            items.push({
              type: 'tag',
              name: 'para',
              attrs: { style: 'p' },
              items: paragraphItems
            });
          }
        }
      });
      
      // Return in a format similar to scripture.api.bible
      return {
        id: chapterReference,
        reference: data.canonical,
        content: items,
        chapterNumber: chapterNumber,
        verseCount: doc.querySelectorAll('.verse-num, .chapter-num').length
      };
      
    } catch (error) {
      console.error('Error fetching ESV chapter with red letters:', error);
      throw error;
    }
  }
}