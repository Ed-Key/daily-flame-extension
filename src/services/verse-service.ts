import {
  VerseData,
  StoredVerse,
  ApiResponse,
  PassageResponse,
  BIBLE_VERSIONS,
  BibleTranslation,
  BibleVersion,
  UnifiedChapter,
  BibleParser
} from '../types';
import { ESVService } from './esv-service';
import { NLTService } from './nlt-service';
import { FirestoreService, FirestoreVerse } from './firestore-service';

// Import parsers
import { StandardBibleParser } from './parsers/standard-parser';
import { ESVBibleParser } from './parsers/esv-parser';
import { NLTBibleParser } from './parsers/nlt-parser';

export class VerseService {
  private static readonly API_KEY = '58410e50f19ea158ea4902e05191db02';
  private static readonly BASE_URL = 'https://api.scripture.api.bible/v1';
  
  // Parser registry
  private static parsers: Map<string, BibleParser> = new Map<string, BibleParser>([
    ['ESV', new ESVBibleParser()],
    ['NLT', new NLTBibleParser()],
    ['KJV', new StandardBibleParser('KJV')],
    ['ASV', new StandardBibleParser('ASV')],
    ['WEB', new StandardBibleParser('WEB')],
    ['WEB_BRITISH', new StandardBibleParser('WEB_BRITISH')],
    ['WEB_UPDATED', new StandardBibleParser('WEB_UPDATED')]
  ]);

  static async getBibles(): Promise<BibleVersion[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/bibles`, {
        headers: {
          'api-key': this.API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data: ApiResponse<BibleVersion[]> = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Bibles:', error);
      throw error;
    }
  }

  static async getVerse(reference: string, bibleId: string = BIBLE_VERSIONS.ESV): Promise<VerseData> {
    // Route ESV requests to ESV service
    if (bibleId === 'ESV') {
      return ESVService.getVerse(reference);
    }
    
    // Route NLT requests to NLT service
    if (bibleId === 'NLT') {
      return NLTService.getVerse(reference);
    }
    
    try {
      const apiReference = this.convertReferenceToApiFormat(reference);
      const url = `${this.BASE_URL}/bibles/${bibleId}/passages/${apiReference}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false`;
      
      console.log('Daily Flame API Call:', {
        reference: reference,
        apiReference: apiReference,
        bibleId: bibleId,
        url: url
      });
      
      const response = await fetch(url, {
        headers: {
          'api-key': this.API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
      }
      
      const data: ApiResponse<PassageResponse> = await response.json();
      
      if (!data.data || !data.data.content) {
        throw new Error('No verse content found');
      }
      
      // Clean up the text content
      let text = data.data.content;
      text = text.replace(/[\r\n]+/g, ' ').trim();
      text = text.replace(/\s+/g, ' ');
      
      return {
        text: text,
        reference: data.data.reference || reference,
        bibleId: bibleId
      };
      
    } catch (error) {
      console.error('Error fetching verse:', error);
      throw error;
    }
  }

  static async getChapter(chapterReference: string, bibleId: string = BIBLE_VERSIONS.ESV): Promise<UnifiedChapter> {
    // Find the translation key from bibleId (moved outside try for catch block access)
    const translationKey = Object.entries(BIBLE_VERSIONS).find(([_, id]) => id === bibleId)?.[0] as BibleTranslation;
    
    try {
      if (!translationKey) {
        throw new Error(`Unknown bible ID: ${bibleId}`);
      }

      // Get the appropriate parser
      const parser = this.parsers.get(translationKey);
      if (!parser) {
        throw new Error(`No parser available for translation: ${translationKey}`);
      }

      // Fetch raw data based on translation type
      let rawData: any;
      
      if (bibleId === 'ESV') {
        // Get raw HTML from ESV API for parser
        const url = `https://api.esv.org/v3/passage/html/?q=${encodeURIComponent(chapterReference)}&include-passage-references=false&include-footnotes=false&include-headings=true&include-verse-numbers=true&include-audio-link=false`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Token ${ESVService.API_KEY}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`ESV API request failed: ${response.status}`);
        }
        
        rawData = await response.json();
        console.log('ESV API raw response:', rawData);
      } else if (bibleId === 'NLT') {
        rawData = await NLTService.getChapterWithRedLetters(chapterReference);
      } else {
        // Standard API format
        rawData = await this.fetchStandardChapter(chapterReference, bibleId);
      }

      // Parse to unified format
      const unifiedChapter = parser.parse(rawData);
      
      console.log('Parsed unified chapter:', {
        reference: unifiedChapter.reference,
        translation: unifiedChapter.translation,
        verseCount: unifiedChapter.verses.length
      });
      
      return unifiedChapter;
      
    } catch (error) {
      console.error('Error fetching chapter:', {
        chapterReference,
        bibleId,
        translation: translationKey,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Provide more helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('No verses found')) {
          throw new Error(`Unable to load ${chapterReference} in ${translationKey}. The API may have returned an empty response.`);
        } else if (error.message.includes('API request failed')) {
          throw new Error(`Failed to connect to Bible API for ${translationKey}. Please check your internet connection.`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Fetch chapter data from standard Bible API
   */
  private static async fetchStandardChapter(chapterReference: string, bibleId: string): Promise<any> {
    // Convert chapter reference (e.g., "John 3") to API format
    const match = chapterReference.match(/^([123]?\s*[a-zA-Z]+)\s+(\d+)$/);
    if (!match) {
      throw new Error(`Invalid chapter reference: ${chapterReference}`);
    }
    
    const [, bookName, chapter] = match;
    const apiReference = this.convertReferenceToApiFormat(`${bookName} ${chapter}:1`);
    const bookCode = apiReference.split('.')[0];
    const chapterApiRef = `${bookCode}.${chapter}`;
    
    const url = `${this.BASE_URL}/bibles/${bibleId}/chapters/${chapterApiRef}?content-type=json&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`;
    
    console.log('Standard API Chapter Call:', {
      chapterReference,
      chapterApiRef,
      url
    });
    
    const response = await fetch(url, {
      headers: {
        'api-key': this.API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data) {
      throw new Error('No chapter content found');
    }
    
    // Debug logging removed for production
    
    const result = {
      id: data.data.id,
      reference: data.data.reference || chapterReference,
      bookId: data.data.bookId,
      content: data.data.content,
      copyright: data.data.copyright
    };
    
    console.log('Standard API response:', result);
    return result;
  }

  static async getRandomVerse(verseList?: StoredVerse[]): Promise<VerseData> {
    try {
      const verses = verseList || await this.getStoredVerses();
      
      if (!verses || verses.length === 0) {
        throw new Error('No verses available');
      }
      
      const randomIndex = Math.floor(Math.random() * verses.length);
      const selectedVerse = verses[randomIndex];
      
      return await this.getVerse(selectedVerse.reference, selectedVerse.bibleId);
      
    } catch (error) {
      console.error('Error getting random verse:', error);
      throw error;
    }
  }

  static async getDailyVerse(): Promise<VerseData> {
    try {
      // First try to get today's verse from Firestore
      const todaysVerse = await FirestoreService.getTodaysVerse();
      
      if (todaysVerse) {
        // Use the verse for today's date from Firestore
        return await this.getVerse(todaysVerse.reference, 'ESV');
      }
      
      // If no verse for today, try to get all verses and use modulo
      const allVerses = await FirestoreService.getAllVerses();
      
      if (allVerses && allVerses.length > 0) {
        // Use date as seed for consistent daily verse
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const verseIndex = dayOfYear % allVerses.length;
        const selectedVerse = allVerses[verseIndex];
        
        return await this.getVerse(selectedVerse.reference, 'ESV');
      }
      
      // Final fallback to stored verses
      console.warn('Firestore unavailable, falling back to default verses');
      return this.getDailyVerseFromStored();
      
    } catch (error) {
      console.error('Error getting daily verse:', error);
      // Fallback to stored verses on any error
      return this.getDailyVerseFromStored();
    }
  }

  private static async getDailyVerseFromStored(): Promise<VerseData> {
    const verses = await this.getStoredVerses();
    
    if (!verses || verses.length === 0) {
      throw new Error('No verses configured');
    }
    
    // Use date as seed for consistent daily verse
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const verseIndex = dayOfYear % verses.length;
    
    const selectedVerse = verses[verseIndex];
    return await this.getVerse(selectedVerse.reference, selectedVerse.bibleId);
  }


  static async getStoredVerses(): Promise<StoredVerse[]> {
    // First try to get verses from Firestore
    try {
      const firestoreVerses = await FirestoreService.getAllVerses();
      
      if (firestoreVerses && firestoreVerses.length > 0) {
        // Convert Firestore verses to StoredVerse format
        return firestoreVerses.map((v: FirestoreVerse & { date?: string }) => ({
          reference: v.reference,
          bibleId: v.bibleId || 'ESV',
          translation: 'ESV',
          dateAdded: v.date || new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error fetching from Firestore:', error);
    }
    
    // Fallback to Chrome storage with default verses
    return new Promise((resolve) => {
      chrome.storage.local.get('verseList', (result) => {
        resolve(result.verseList || this.getDefaultVerses());
      });
    });
  }

  static async saveVerses(verses: StoredVerse[]): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ verseList: verses }, () => {
        resolve(true);
      });
    });
  }

  static getDefaultVerses(): StoredVerse[] {
    const esvId = BIBLE_VERSIONS.ESV;
    return [
      { reference: 'John 3:16', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
      { reference: 'Jeremiah 29:11', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
      { reference: 'Philippians 4:13', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
      { reference: 'Romans 8:28', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
      { reference: 'Joshua 1:9', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
      { reference: 'Proverbs 3:5-6', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
      { reference: '1 Peter 5:7', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() }
    ];
  }

  private static convertReferenceToApiFormat(reference: string): string {
    const bookMappings: Record<string, string> = {
      // Old Testament
      'genesis': 'GEN', 'gen': 'GEN',
      'exodus': 'EXO', 'exo': 'EXO', 'ex': 'EXO',
      'leviticus': 'LEV', 'lev': 'LEV',
      'numbers': 'NUM', 'num': 'NUM',
      'deuteronomy': 'DEU', 'deut': 'DEU', 'deu': 'DEU',
      'joshua': 'JOS', 'josh': 'JOS', 'jos': 'JOS',
      'judges': 'JDG', 'judg': 'JDG', 'jdg': 'JDG',
      'ruth': 'RUT', 'rut': 'RUT',
      '1 samuel': '1SA', '1samuel': '1SA', '1sa': '1SA', '1 sam': '1SA', '1sam': '1SA',
      '2 samuel': '2SA', '2samuel': '2SA', '2sa': '2SA', '2 sam': '2SA', '2sam': '2SA',
      '1 kings': '1KI', '1kings': '1KI', '1ki': '1KI', '1 kgs': '1KI', '1kgs': '1KI',
      '2 kings': '2KI', '2kings': '2KI', '2ki': '2KI', '2 kgs': '2KI', '2kgs': '2KI',
      'psalms': 'PSA', 'psalm': 'PSA', 'psa': 'PSA', 'ps': 'PSA',
      'proverbs': 'PRO', 'prov': 'PRO', 'pro': 'PRO',
      'ecclesiastes': 'ECC', 'eccl': 'ECC', 'ecc': 'ECC',
      'isaiah': 'ISA', 'isa': 'ISA',
      'jeremiah': 'JER', 'jer': 'JER',
      'ezekiel': 'EZK', 'ezek': 'EZK', 'ezk': 'EZK',
      'daniel': 'DAN', 'dan': 'DAN',
      // New Testament
      'matthew': 'MAT', 'matt': 'MAT', 'mat': 'MAT', 'mt': 'MAT',
      'mark': 'MRK', 'mrk': 'MRK', 'mk': 'MRK',
      'luke': 'LUK', 'luk': 'LUK', 'lk': 'LUK',
      'john': 'JHN', 'jhn': 'JHN', 'jn': 'JHN',
      'acts': 'ACT', 'act': 'ACT',
      'romans': 'ROM', 'rom': 'ROM',
      '1 corinthians': '1CO', '1corinthians': '1CO', '1co': '1CO', '1 cor': '1CO', '1cor': '1CO',
      '2 corinthians': '2CO', '2corinthians': '2CO', '2co': '2CO', '2 cor': '2CO', '2cor': '2CO',
      'galatians': 'GAL', 'gal': 'GAL',
      'ephesians': 'EPH', 'eph': 'EPH',
      'philippians': 'PHP', 'phil': 'PHP', 'php': 'PHP',
      'colossians': 'COL', 'col': 'COL',
      '1 thessalonians': '1TH', '1thessalonians': '1TH', '1th': '1TH', '1 thess': '1TH', '1thess': '1TH',
      '2 thessalonians': '2TH', '2thessalonians': '2TH', '2th': '2TH', '2 thess': '2TH', '2thess': '2TH',
      '1 timothy': '1TI', '1timothy': '1TI', '1ti': '1TI', '1 tim': '1TI', '1tim': '1TI',
      '2 timothy': '2TI', '2timothy': '2TI', '2ti': '2TI', '2 tim': '2TI', '2tim': '2TI',
      'titus': 'TIT', 'tit': 'TIT',
      'philemon': 'PHM', 'phlm': 'PHM', 'phm': 'PHM',
      'hebrews': 'HEB', 'heb': 'HEB',
      'james': 'JAS', 'jas': 'JAS',
      '1 peter': '1PE', '1peter': '1PE', '1pe': '1PE', '1 pet': '1PE', '1pet': '1PE',
      '2 peter': '2PE', '2peter': '2PE', '2pe': '2PE', '2 pet': '2PE', '2pet': '2PE',
      '1 john': '1JN', '1john': '1JN', '1jn': '1JN', '1 jn': '1JN',
      '2 john': '2JN', '2john': '2JN', '2jn': '2JN', '2 jn': '2JN',
      '3 john': '3JN', '3john': '3JN', '3jn': '3JN', '3 jn': '3JN',
      'jude': 'JUD', 'jud': 'JUD',
      'revelation': 'REV', 'rev': 'REV'
    };
    
    try {
      const match = reference.match(/^([123]?\s*[a-zA-Z]+)\s+(\d+):(\d+)(?:-(\d+))?$/i);
      if (!match) {
        throw new Error(`Invalid reference format: ${reference}`);
      }
      
      const [, bookName, chapter, startVerse, endVerse] = match;
      const bookKey = bookName.toLowerCase().trim();
      const bookCode = bookMappings[bookKey];
      
      if (!bookCode) {
        throw new Error(`Unknown book: ${bookName}`);
      }
      
      if (endVerse) {
        return `${bookCode}.${chapter}.${startVerse}-${bookCode}.${chapter}.${endVerse}`;
      } else {
        return `${bookCode}.${chapter}.${startVerse}`;
      }
      
    } catch (error) {
      console.error('Reference conversion error:', error);
      return reference.replace(/\s+/g, '');
    }
  }

  static isValidReference(reference: string): boolean {
    const referencePattern = /^[1-3]?\s*[A-Za-z]+\s+\d+:\d+(-\d+)?$/;
    return referencePattern.test(reference.trim());
  }
}