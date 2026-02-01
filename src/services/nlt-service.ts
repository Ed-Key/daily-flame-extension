import { VerseData } from '../types';

export class NLTService {
  private static readonly API_KEY = 'd74333ee-8951-45dc-9925-5074a8ad2f07';
  private static readonly BASE_URL = 'https://api.nlt.to/api';

  static async getVerse(reference: string): Promise<VerseData> {
    try {
      // Normalize reference by replacing various dash types with standard hyphen
      const normalizedReference = reference
        .replace(/[\u2010-\u2015\u2212]/g, '-')  // Unicode dashes to ASCII hyphen
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .trim();

      // Convert reference format from "John 3:16" to "John.3.16"
      const nltReference = this.convertToNLTFormat(normalizedReference);
      const url = `${this.BASE_URL}/passages?ref=${encodeURIComponent(nltReference)}&version=NLT&key=${this.API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`NLT API request failed: ${response.status} - ${response.statusText}`);
      }

      const html = await response.text();

      // Extract ALL verse_export tags (for multi-verse passages)
      // Using matchAll with global flag to capture all verse exports
      const verseExportPattern = /<verse_export[^>]*>(.*?)<\/verse_export>/gs;
      const verseExports = Array.from(html.matchAll(verseExportPattern));

      if (!verseExports || verseExports.length === 0) {
        throw new Error('No verse content found');
      }

      // Process each verse_export and collect all text
      const allVerseTexts = [];

      for (const exportMatch of verseExports) {
        const verseContent = exportMatch[1];

        // Extract all paragraph content within this verse_export
        // Handles both prose (class="body") and poetry (class="poet1", "poet2", etc.)
        const paragraphs = verseContent.matchAll(/<p[^>]*class="(?:body|poet\d*(?:-vn)?)[^"]*"[^>]*>(.*?)(?:<\/p>|$)/gs);
        const textParts = [];

        for (const paragraph of paragraphs) {
          if (paragraph[1]) {
            // Clean footnotes and other tags from paragraph content
            let cleanedParagraph = paragraph[1]
              .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<span[^>]*class="tn-ref"[^>]*>.*?<\/span>.*?<\/span>/g, '') // Remove complete footnote with nested ref span
              .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<\/span>/g, ''); // Remove simpler footnotes
            textParts.push(cleanedParagraph);
          }
        }

        if (textParts.length === 0) {
          // Fallback: Some verses have content directly in verse_export without paragraph tags
          const directContent = verseContent
            .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<span[^>]*class="tn-ref"[^>]*>.*?<\/span>.*?<\/span>/g, '') // Remove complete footnote
            .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<\/span>/g, '') // Remove simpler footnotes
            .replace(/<span[^>]*class="vn"[^>]*>\d+<\/span>/g, '') // Remove verse numbers
            .replace(/<span[^>]*class="red"[^>]*>(.*?)<\/span>/g, '$1') // Keep red letter content
            .replace(/<[^>]+>/g, ' ') // Replace other tags with spaces
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

          if (directContent) {
            textParts.push(directContent);
          }
        }

        // Join text parts for this verse and clean up
        if (textParts.length > 0) {
          const verseText = textParts.join(' ')
            .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<span[^>]*class="tn-ref"[^>]*>.*?<\/span>.*?<\/span>/g, '')
            .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<\/span>/g, '')
            .replace(/<span[^>]*class="vn"[^>]*>(\d+)<\/span>/g, '') // Remove verse numbers
            .replace(/<span[^>]*class="red"[^>]*>(.*?)<\/span>/g, '$1') // Keep red letter text
            .replace(/<[^>]+>/g, '') // Remove all other HTML tags
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

          if (verseText) {
            allVerseTexts.push(verseText);
          }
        }
      }

      if (allVerseTexts.length === 0) {
        throw new Error('No verse content found after processing');
      }

      // Join all verses with a space
      const fullText = allVerseTexts.join(' ').trim();

      // Use normalized reference so verse range parsing works correctly
      return {
        text: fullText,
        reference: normalizedReference,
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
    // NLT API format discovered through testing:
    // - Books with spaces in names keep the space: "2 Chronicles 7:14" -> "2 Chronicles.7.14"
    // - Single-word books have no spaces: "John 3:16" -> "John.3.16"
    // - Colons become dots: ":" -> "."
    // - Verse ranges keep their dash: "16-17" stays "16-17"

    // First, replace colons with dots
    let formatted = reference.replace(/:/g, '.');

    // For numbered books (1, 2, 3, I, II, III), keep the space after the number
    // This matches patterns like "1 Kings", "2 Chronicles", "3 John", etc.
    if (/^[123I]\s+/.test(formatted)) {
      // Keep the first space after the number, replace others with dots
      const parts = formatted.split(/\s+/);
      if (parts.length >= 2) {
        // Keep space between number and book name
        const bookName = parts[0] + ' ' + parts[1];
        // Add chapter/verse with dots
        const rest = parts.slice(2).join('.');
        formatted = rest ? bookName + '.' + rest : bookName;
      }
    }
    // Handle "Song of Solomon" - NLT API uses abbreviation "Song"
    else if (formatted.startsWith('Song of Solomon')) {
      formatted = formatted.replace('Song of Solomon', 'Song');
    }
    // For other books, replace all spaces with dots
    else {
      formatted = formatted.replace(/\s+/g, '.');
    }

    return formatted;
  }

}