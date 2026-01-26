import { BibleTranslation } from '../../types';

// Mock data generators for different API formats

/**
 * Generate mock ESV API response
 */
export function generateESVMockResponse(reference: string): any {
  const [book, rest] = reference.split(' ');
  const [chapter, verse] = rest ? rest.split(':') : ['1', '1'];

  // Handle multi-verse references
  const verses = verse.includes('-')
    ? expandVerseRange(verse)
    : [verse];

  // Generate mock passage content
  const passages = verses.map((v, index) => {
    const isFirstVerse = v === '1' || index === 0;
    const verseText = `This is the mock text for ${book} ${chapter}:${v}. `;

    if (isFirstVerse && chapter === '1') {
      return `<h2>${book}</h2><p><span class="text"><span class="chapternum">${chapter} </span>${verseText}</span></p>`;
    } else if (isFirstVerse) {
      return `<h3>Chapter ${chapter}</h3><p class="top-1"><span class="text">${verseText}</span></p>`;
    } else {
      return `<p><span class="text"><span class="versenum">${v} </span>${verseText}</span></p>`;
    }
  }).join('');

  return {
    query: reference,
    canonical: reference,
    passages: [passages],
    parsed: [[verses.map(v => parseInt(v))]]
  };
}

/**
 * Generate mock NLT API response
 */
export function generateNLTMockResponse(reference: string): any {
  const [book, rest] = reference.split(' ');
  const [chapter, verseRange] = rest ? rest.split(':') : ['1', '1'];

  const verses = verseRange ? expandVerseRange(verseRange) : ['1'];

  const content = verses.map(v => {
    const isFirstVerse = v === '1';
    const text = `This is the NLT mock text for ${book} ${chapter}:${v}.`;

    if (isFirstVerse) {
      return `<verse_export vn="${v}"><cn>${chapter}</cn>${text}</verse_export>`;
    } else {
      return `<verse_export vn="${v}"><vn>${v}</vn>${text}</verse_export>`;
    }
  }).join('');

  return {
    passages: [{
      reference: reference,
      content: content,
      copyright: '© Mock NLT Copyright'
    }]
  };
}

/**
 * Generate mock Standard Bible API response (KJV, ASV, WEB)
 */
export function generateStandardMockResponse(reference: string, translation: BibleTranslation): any {
  const [book, rest] = reference.split(' ');
  const [chapter, verseRange] = rest ? rest.split(':') : ['1', '1'];

  // For chapter requests (no verse specified)
  if (!verseRange) {
    return generateStandardChapterResponse(book, chapter, translation);
  }

  // For verse requests
  const verses = expandVerseRange(verseRange);
  const verseItems = verses.map(v => ({
    type: 'verse',
    attrs: {
      verseId: `${book.toUpperCase()}.${chapter}.${v}`,
      verseOrgId: `${book.toUpperCase()}.${chapter}.${v}`
    },
    items: [{
      type: 'text',
      text: `This is the ${translation} mock text for ${book} ${chapter}:${v}.`,
      attrs: {
        verseId: `${book.toUpperCase()}.${chapter}.${v}`,
        verseOrgId: `${book.toUpperCase()}.${chapter}.${v}`
      }
    }]
  }));

  return {
    data: {
      id: `${book.toUpperCase()}.${chapter}`,
      orgId: `${book.toUpperCase()}.${chapter}`,
      bookId: book.toUpperCase(),
      chapterId: `${book.toUpperCase()}.${chapter}`,
      bibleId: getMockBibleId(translation),
      reference: reference,
      content: JSON.stringify([{
        type: 'chapter',
        attrs: {
          chapterId: `${book.toUpperCase()}.${chapter}`,
          chapterOrgId: `${book.toUpperCase()}.${chapter}`
        },
        items: verseItems
      }]),
      copyright: `© Mock ${translation} Copyright`
    }
  };
}

/**
 * Generate mock chapter response for standard API
 */
function generateStandardChapterResponse(book: string, chapter: string, translation: BibleTranslation): any {
  // Generate a full chapter with multiple verses
  const verseCount = 10; // Mock chapter with 10 verses
  const items: any[] = [];

  // Add chapter heading
  items.push({
    type: 'heading',
    attrs: {},
    items: [{
      type: 'text',
      text: `${book} Chapter ${chapter}`
    }]
  });

  // Add verses
  for (let v = 1; v <= verseCount; v++) {
    items.push({
      type: 'verse',
      attrs: {
        verseId: `${book.toUpperCase()}.${chapter}.${v}`,
        verseOrgId: `${book.toUpperCase()}.${chapter}.${v}`
      },
      items: [{
        type: 'text',
        text: `This is verse ${v} of ${book} chapter ${chapter} in ${translation}.`,
        attrs: {
          verseId: `${book.toUpperCase()}.${chapter}.${v}`,
          verseOrgId: `${book.toUpperCase()}.${chapter}.${v}`
        }
      }]
    });
  }

  return {
    data: {
      id: `${book.toUpperCase()}.${chapter}`,
      orgId: `${book.toUpperCase()}.${chapter}`,
      bookId: book.toUpperCase(),
      chapterId: `${book.toUpperCase()}.${chapter}`,
      bibleId: getMockBibleId(translation),
      reference: `${book} ${chapter}`,
      content: JSON.stringify([{
        type: 'chapter',
        attrs: {
          chapterId: `${book.toUpperCase()}.${chapter}`,
          chapterOrgId: `${book.toUpperCase()}.${chapter}`
        },
        items: items
      }]),
      copyright: `© Mock ${translation} Copyright`
    }
  };
}

/**
 * Helper to expand verse ranges (e.g., "5-7" to ["5", "6", "7"])
 */
function expandVerseRange(verseRange: string): string[] {
  if (!verseRange.includes('-')) {
    return [verseRange];
  }

  const [start, end] = verseRange.split('-').map(v => parseInt(v.trim()));
  const verses: string[] = [];

  for (let v = start; v <= end; v++) {
    verses.push(v.toString());
  }

  return verses;
}

/**
 * Get mock Bible ID for translation
 */
function getMockBibleId(translation: BibleTranslation): string {
  const ids: Record<string, string> = {
    'KJV': 'de4e12af7f28f599-02',
    'ASV': '06125adad2d5898a-01',
    'ESV': 'ESV',
    'NLT': 'NLT',
    'WEB': '9879dbb7cfe39e4d-04',
    'WEB_BRITISH': '7142879509583d59-04',
    'WEB_UPDATED': '72f4e6dc683324df-03'
  };
  return ids[translation] || translation;
}

/**
 * Generate mock API response based on translation
 */
export function generateMockResponse(reference: string, translation: BibleTranslation): any {
  switch (translation) {
    case 'ESV':
      return generateESVMockResponse(reference);
    case 'NLT':
      return generateNLTMockResponse(reference);
    default:
      return generateStandardMockResponse(reference, translation);
  }
}

/**
 * Mock fetch implementation for testing
 */
export function createMockFetch(config: {
  shouldFail?: boolean;
  failureRate?: number;
  customResponse?: any;
} = {}) {
  return jest.fn().mockImplementation(async (url: string, options?: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 10));

    // Simulate random failures if configured
    if (config.shouldFail || (config.failureRate && Math.random() < config.failureRate)) {
      throw new Error('Mock network error');
    }

    // Parse the URL to determine what's being requested
    let reference = '';
    let translation: BibleTranslation = 'KJV';

    if (url.includes('api.esv.org')) {
      translation = 'ESV';
      const match = url.match(/passages\?q=([^&]+)/);
      if (match) {
        reference = decodeURIComponent(match[1]);
      }
    } else if (url.includes('api.nlt.to')) {
      translation = 'NLT';
      const match = url.match(/text\?ref=([^&]+)/);
      if (match) {
        reference = decodeURIComponent(match[1]);
      }
    } else if (url.includes('scripture.api.bible')) {
      // Determine translation from bibleId in URL
      if (url.includes('de4e12af7f28f599-02')) translation = 'KJV';
      else if (url.includes('06125adad2d5898a-01')) translation = 'ASV';
      else if (url.includes('9879dbb7cfe39e4d-04')) translation = 'WEB';

      // Extract reference from URL
      const passageMatch = url.match(/passages\/([^?]+)/);
      const chapterMatch = url.match(/chapters\/([^?]+)/);

      if (passageMatch) {
        reference = convertApiReferenceToHuman(passageMatch[1]);
      } else if (chapterMatch) {
        reference = convertApiReferenceToHuman(chapterMatch[1]);
      }
    }

    // Generate appropriate mock response
    const responseData = config.customResponse || generateMockResponse(reference, translation);

    return {
      ok: true,
      status: 200,
      json: async () => responseData,
      text: async () => JSON.stringify(responseData)
    };
  });
}

/**
 * Convert API reference format to human-readable format
 * e.g., "JHN.3.16" to "John 3:16"
 */
function convertApiReferenceToHuman(apiRef: string): string {
  const bookMap: Record<string, string> = {
    'GEN': 'Genesis',
    'EXO': 'Exodus',
    'LEV': 'Leviticus',
    'NUM': 'Numbers',
    'DEU': 'Deuteronomy',
    'JOS': 'Joshua',
    'JDG': 'Judges',
    'RUT': 'Ruth',
    '1SA': '1 Samuel',
    '2SA': '2 Samuel',
    '1KI': '1 Kings',
    '2KI': '2 Kings',
    '1CH': '1 Chronicles',
    '2CH': '2 Chronicles',
    'EZR': 'Ezra',
    'NEH': 'Nehemiah',
    'EST': 'Esther',
    'JOB': 'Job',
    'PSA': 'Psalm',
    'PRO': 'Proverbs',
    'ECC': 'Ecclesiastes',
    'SNG': 'Song of Solomon',
    'ISA': 'Isaiah',
    'JER': 'Jeremiah',
    'LAM': 'Lamentations',
    'EZK': 'Ezekiel',
    'DAN': 'Daniel',
    'HOS': 'Hosea',
    'JOL': 'Joel',
    'AMO': 'Amos',
    'OBA': 'Obadiah',
    'JON': 'Jonah',
    'MIC': 'Micah',
    'NAM': 'Nahum',
    'HAB': 'Habakkuk',
    'ZEP': 'Zephaniah',
    'HAG': 'Haggai',
    'ZEC': 'Zechariah',
    'MAL': 'Malachi',
    'MAT': 'Matthew',
    'MRK': 'Mark',
    'LUK': 'Luke',
    'JHN': 'John',
    'ACT': 'Acts',
    'ROM': 'Romans',
    '1CO': '1 Corinthians',
    '2CO': '2 Corinthians',
    'GAL': 'Galatians',
    'EPH': 'Ephesians',
    'PHP': 'Philippians',
    'COL': 'Colossians',
    '1TH': '1 Thessalonians',
    '2TH': '2 Thessalonians',
    '1TI': '1 Timothy',
    '2TI': '2 Timothy',
    'TIT': 'Titus',
    'PHM': 'Philemon',
    'HEB': 'Hebrews',
    'JAS': 'James',
    '1PE': '1 Peter',
    '2PE': '2 Peter',
    '1JN': '1 John',
    '2JN': '2 John',
    '3JN': '3 John',
    'JUD': 'Jude',
    'REV': 'Revelation'
  };

  const parts = apiRef.split('.');
  const bookCode = parts[0];
  const chapter = parts[1];
  const verse = parts[2];

  const bookName = bookMap[bookCode] || bookCode;

  if (verse) {
    return `${bookName} ${chapter}:${verse}`;
  } else {
    return `${bookName} ${chapter}`;
  }
}