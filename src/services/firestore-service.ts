import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase-config';

export interface FirestoreVerse {
  reference: string;
  book: string;
  chapter: number;
  verse: string;
  bibleId: string;
  url?: string;
  addedAt?: Timestamp;
  order?: number;
}

export class FirestoreService {
  private static readonly VERSES_COLLECTION = 'dailyVerses';
  private static cachedVerses: Map<string, { data: FirestoreVerse; timestamp: number }> = new Map();
  private static readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

  /**
   * Get verse for a specific date
   */
  static async getVerseByDate(date: string): Promise<FirestoreVerse | null> {
    try {
      // Check cache first
      const cached = this.cachedVerses.get(date);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      // Fetch from Firestore
      const verseDoc = await getDoc(doc(db, this.VERSES_COLLECTION, date));
      
      if (!verseDoc.exists()) {
        console.log(`No verse found for date: ${date}`);
        return null;
      }

      const verseData = verseDoc.data() as FirestoreVerse;
      
      // Update cache
      this.cachedVerses.set(date, {
        data: verseData,
        timestamp: Date.now()
      });

      return verseData;
    } catch (error) {
      console.error('Error fetching verse from Firestore:', error);
      return null;
    }
  }

  /**
   * Get today's verse
   */
  static async getTodaysVerse(): Promise<FirestoreVerse | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.getVerseByDate(today);
  }

  /**
   * Get all verses (for fallback or admin purposes)
   */
  static async getAllVerses(): Promise<FirestoreVerse[]> {
    try {
      const versesQuery = query(
        collection(db, this.VERSES_COLLECTION),
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(versesQuery);
      const verses: FirestoreVerse[] = [];
      
      snapshot.forEach((doc) => {
        verses.push({
          ...doc.data() as FirestoreVerse,
          // Ensure the date is included if it's the document ID
          date: doc.id
        } as FirestoreVerse & { date: string });
      });
      
      return verses;
    } catch (error) {
      console.error('Error fetching all verses from Firestore:', error);
      return [];
    }
  }

  /**
   * Get verses for a date range
   */
  static async getVersesInRange(startDate: string, endDate: string): Promise<FirestoreVerse[]> {
    try {
      const versesQuery = query(
        collection(db, this.VERSES_COLLECTION),
        where('__name__', '>=', startDate),
        where('__name__', '<=', endDate),
        orderBy('__name__')
      );
      
      const snapshot = await getDocs(versesQuery);
      const verses: FirestoreVerse[] = [];
      
      snapshot.forEach((doc) => {
        verses.push(doc.data() as FirestoreVerse);
      });
      
      return verses;
    } catch (error) {
      console.error('Error fetching verses in range:', error);
      return [];
    }
  }

  /**
   * Clear cache (useful for testing or forcing refresh)
   */
  static clearCache(): void {
    this.cachedVerses.clear();
  }

  /**
   * Check if Firestore is available (for offline handling)
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Try to fetch a single document to test connectivity
      const testQuery = query(
        collection(db, this.VERSES_COLLECTION),
        limit(1)
      );
      await getDocs(testQuery);
      return true;
    } catch (error) {
      console.error('Firestore not available:', error);
      return false;
    }
  }
}