const VerseService = {
    API_KEY: '58410e50f19ea158ea4902e05191db02',
    BASE_URL: 'https://api.scripture.api.bible/v1',
    
    // Available Bible versions for this API key (public domain only)
    BIBLE_VERSIONS: {
        'KJV': 'de4e12af7f28f599-02', // King James Version
        'WEB': '9879dbb7cfe39e4d-04', // World English Bible  
        'WEB_BRITISH': '7142879509583d59-04', // World English Bible British Edition
        'WEB_UPDATED': '72f4e6dc683324df-03' // World English Bible Updated
    },
    
    // Get list of available Bibles
    async getBibles() {
        try {
            const response = await fetch(`${this.BASE_URL}/bibles`, {
                headers: {
                    'api-key': this.API_KEY
                }
            });
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching Bibles:', error);
            throw error;
        }
    },
    
    // Get a specific verse by reference
    async getVerse(reference, bibleId = this.BIBLE_VERSIONS.KJV) {
        try {
            // Convert reference to API format (e.g., "John 3:16" -> "JHN.3.16")
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
            
            const data = await response.json();
            
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
    },
    
    // Get random verse from a predefined list
    async getRandomVerse(verseList = null) {
        try {
            // Get stored verse list or use default
            const verses = verseList || await this.getStoredVerses();
            
            if (!verses || verses.length === 0) {
                throw new Error('No verses available');
            }
            
            // Select random verse
            const randomIndex = Math.floor(Math.random() * verses.length);
            const selectedVerse = verses[randomIndex];
            
            // Fetch the verse content from API
            return await this.getVerse(selectedVerse.reference, selectedVerse.bibleId);
            
        } catch (error) {
            console.error('Error getting random verse:', error);
            throw error;
        }
    },
    
    // Get daily verse (same verse for the whole day)
    async getDailyVerse() {
        try {
            const verses = await this.getStoredVerses();
            
            if (!verses || verses.length === 0) {
                throw new Error('No verses configured');
            }
            
            // Use date as seed for consistent daily verse
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
            const verseIndex = dayOfYear % verses.length;
            
            const selectedVerse = verses[verseIndex];
            return await this.getVerse(selectedVerse.reference, selectedVerse.bibleId);
            
        } catch (error) {
            console.error('Error getting daily verse:', error);
            throw error;
        }
    },
    
    // Get stored verse list from chrome storage
    async getStoredVerses() {
        return new Promise((resolve) => {
            chrome.storage.local.get('verseList', (result) => {
                resolve(result.verseList || this.getDefaultVerses());
            });
        });
    },
    
    // Save verse list to chrome storage
    async saveVerses(verses) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ verseList: verses }, () => {
                resolve(true);
            });
        });
    },
    
    // Default verses if none are configured (using KJV for reliability)
    getDefaultVerses() {
        const kjvId = 'de4e12af7f28f599-02';
        return [
            { reference: 'John 3:16', bibleId: kjvId },
            { reference: 'Jeremiah 29:11', bibleId: kjvId },
            { reference: 'Philippians 4:13', bibleId: kjvId },
            { reference: 'Romans 8:28', bibleId: kjvId },
            { reference: 'Joshua 1:9', bibleId: kjvId },
            { reference: 'Proverbs 3:5-6', bibleId: kjvId },
            { reference: '1 Peter 5:7', bibleId: kjvId }
        ];
    },
    
    // Convert human-readable reference to API format
    convertReferenceToApiFormat(reference) {
        // Book name mappings to API abbreviations
        const bookMappings = {
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
            'james': 'JAS', 'jas': 'JAS', 'jas': 'JAS',
            '1 peter': '1PE', '1peter': '1PE', '1pe': '1PE', '1 pet': '1PE', '1pet': '1PE',
            '2 peter': '2PE', '2peter': '2PE', '2pe': '2PE', '2 pet': '2PE', '2pet': '2PE',
            '1 john': '1JN', '1john': '1JN', '1jn': '1JN', '1 jn': '1JN',
            '2 john': '2JN', '2john': '2JN', '2jn': '2JN', '2 jn': '2JN',
            '3 john': '3JN', '3john': '3JN', '3jn': '3JN', '3 jn': '3JN',
            'jude': 'JUD', 'jud': 'JUD',
            'revelation': 'REV', 'rev': 'REV'
        };
        
        try {
            // Parse reference like "John 3:16" or "1 Peter 5:7" or "Psalms 23:1-3"
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
            
            // Format: BOOK.CHAPTER.VERSE or BOOK.CHAPTER.VERSE-VERSE
            if (endVerse) {
                return `${bookCode}.${chapter}.${startVerse}-${bookCode}.${chapter}.${endVerse}`;
            } else {
                return `${bookCode}.${chapter}.${startVerse}`;
            }
            
        } catch (error) {
            console.error('Reference conversion error:', error);
            // Fallback to original format
            return reference.replace(/\s+/g, '');
        }
    },
    
    // Validate Bible reference format
    isValidReference(reference) {
        const referencePattern = /^[1-3]?\s*[A-Za-z]+\s+\d+:\d+(-\d+)?$/;
        return referencePattern.test(reference.trim());
    }
};