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
      
      // Extract text using regex instead of DOMParser (which isn't available in background script)
      // Match the verse content between <p> tags, excluding footnotes
      const verseMatch = html.match(/<p[^>]*class="body[^"]*"[^>]*>(.*?)<\/p>/s);
      
      if (!verseMatch || !verseMatch[1]) {
        throw new Error('No verse content found');
      }
      
      // Clean up the text: remove HTML tags, footnotes, etc.
      let text = verseMatch[1]
        .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a>/g, '') // Remove footnote markers
        .replace(/<span[^>]*class="tn"[^>]*>.*?<\/span>/g, '') // Remove footnote content
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
    return reference.replace(/\s+(\d+):?/g, '.$1').replace(/\s+/g, '.');
  }

}