import { VerseData } from '../types';

export class NLTService {
  private static readonly API_KEY = 'd74333ee-8951-45dc-9925-5074a8ad2f07';
  private static readonly BASE_URL = 'https://api.nlt.to/api';

  static async getVerse(reference: string): Promise<VerseData> {
    try {
      // Convert reference format from "John 3:16" to "John.3.16"
      const nltReference = this.convertToNLTFormat(reference);
      const url = `${this.BASE_URL}/passages?ref=${encodeURIComponent(nltReference)}&version=NLT&key=${this.API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NLT API request failed: ${response.status} - ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Extract text from verse_export tags which contain the verse content
      const verseExportMatch = html.match(/<verse_export[^>]*>(.*?)<\/verse_export>/s);
      
      if (!verseExportMatch || !verseExportMatch[1]) {
        throw new Error('No verse content found');
      }
      
      // Extract all paragraph content within verse_export
      // Handles both prose (class="body") and poetry (class="poet1", "poet2", etc.)
      // Also handles cases where </p> might be missing (malformed HTML)
      const paragraphs = verseExportMatch[1].matchAll(/<p[^>]*class="(?:body|poet\d*(?:-vn)?)[^"]*"[^>]*>(.*?)(?:<\/p>|$)/gs);
      const textParts = [];
      
      for (const paragraph of paragraphs) {
        if (paragraph[1]) {
          // Clean footnotes and other tags from paragraph content before adding
          // Handle footnotes: remove from <a class="a-tn"> through the entire footnote span
          // This pattern handles nested spans within footnotes (like <span class="tn-ref">)
          let cleanedParagraph = paragraph[1]
            .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<span[^>]*class="tn-ref"[^>]*>.*?<\/span>.*?<\/span>/g, '') // Remove complete footnote with nested ref span
            .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<\/span>/g, ''); // Remove simpler footnotes
          textParts.push(cleanedParagraph);
        }
      }
      
      if (textParts.length === 0) {
        // Fallback: Some verses (like John 3:17) have content directly in verse_export
        // without paragraph tags, just span elements
        const directContent = verseExportMatch[1]
          .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<span[^>]*class="tn-ref"[^>]*>.*?<\/span>.*?<\/span>/g, '') // Remove complete footnote with nested ref span
          .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<\/span>/g, '') // Remove simpler footnotes
          .replace(/<span[^>]*class="vn"[^>]*>\d+<\/span>/g, '') // Remove verse numbers
          .replace(/<span[^>]*class="red"[^>]*>(.*?)<\/span>/g, '$1') // Keep red letter content
          .replace(/<[^>]+>/g, ' ') // Replace other tags with spaces
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (directContent) {
          textParts.push(directContent);
        } else {
          throw new Error('No verse content found in paragraphs');
        }
      }
      
      // Join all paragraph parts with spaces
      let text = textParts.join(' ')
        .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<span[^>]*class="tn-ref"[^>]*>.*?<\/span>.*?<\/span>/g, '') // Remove complete footnote with nested ref span
        .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<\/span>/g, '') // Remove simpler footnotes
        .replace(/<span[^>]*class="vn"[^>]*>(\d+)<\/span>/g, '') // Remove verse numbers
        .replace(/<span[^>]*class="red"[^>]*>(.*?)<\/span>/g, '$1') // Keep red letter text
        .replace(/<[^>]+>/g, '') // Remove all other HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      return {
        text: text,
        reference: reference,
        bibleId: 'NLT'
      };
      
    } catch (error) {
      console.error('Error fetching NLT verse:', error);
      throw error;
    }
  }

  static async getChapterWithRedLetters(chapterReference: string): Promise<any> {
    try {
      // Convert chapter reference (e.g., "John 3") to NLT format "John.3"
      const nltReference = this.convertToNLTFormat(chapterReference);
      const url = `${this.BASE_URL}/passages?ref=${encodeURIComponent(nltReference)}&version=NLT&key=${this.API_KEY}`;
      
      console.log('NLT Chapter API Call:', {
        chapterReference,
        nltReference,
        url
      });
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NLT API request failed: ${response.status} - ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Return the raw HTML content - it will be parsed in the component
      return {
        passages: [{
          reference: chapterReference,
          content: html
        }]
      };
      
    } catch (error) {
      console.error('Error fetching NLT chapter:', error);
      throw error;
    }
  }

  private static convertToNLTFormat(reference: string): string {
    // Convert "John 3:16" to "John.3.16" or "John 3:16-17" to "John.3.16-17"
    // Convert "John 3" to "John.3"
    return reference.replace(/\s+/g, '.').replace(/:/, '.');
  }

}