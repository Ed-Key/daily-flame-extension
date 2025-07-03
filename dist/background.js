/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/services/esv-service.ts":
/*!*************************************!*\
  !*** ./src/services/esv-service.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ESVService: () => (/* binding */ ESVService)
/* harmony export */ });
class ESVService {
    static async getVerse(reference) {
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
        }
        catch (error) {
            console.error('Error fetching ESV verse:', error);
            throw error;
        }
    }
    static async getChapter(chapterReference) {
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
            const verses = [];
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
        }
        catch (error) {
            console.error('Error fetching ESV chapter:', error);
            throw error;
        }
    }
    // Get chapter with HTML format for red letter support
    static async getChapterWithRedLetters(chapterReference) {
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
            const items = [];
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
                }
                else if (element.tagName === 'P') {
                    // Skip the ESV copyright paragraph
                    if (element.querySelector('a.copyright')) {
                        return;
                    }
                    // Create a paragraph container
                    const paragraphItems = [];
                    // Process all nodes within the paragraph
                    const processNode = (node) => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            const text = node.textContent || '';
                            if (text.trim()) {
                                paragraphItems.push({
                                    type: 'text',
                                    text: text
                                });
                            }
                        }
                        else if (node instanceof Element) {
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
                            }
                            else if (node.classList.contains('verse-num')) {
                                // Add verse marker
                                const verseNum = node.textContent?.replace(/[^\d]/g, '') || '';
                                if (verseNum) {
                                    paragraphItems.push({
                                        type: 'tag',
                                        name: 'verse',
                                        attrs: { number: verseNum }
                                    });
                                }
                            }
                            else if (node.classList.contains('woc')) {
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
                            }
                            else {
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
        }
        catch (error) {
            console.error('Error fetching ESV chapter with red letters:', error);
            throw error;
        }
    }
}
ESVService.API_KEY = 'd74f42aa54c642a4cbfef2a93c5c67f460f13cdb';
ESVService.BASE_URL = 'https://api.esv.org/v3';


/***/ }),

/***/ "./src/services/verse-service.ts":
/*!***************************************!*\
  !*** ./src/services/verse-service.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VerseService: () => (/* binding */ VerseService)
/* harmony export */ });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types */ "./src/types/index.ts");
/* harmony import */ var _esv_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./esv-service */ "./src/services/esv-service.ts");


class VerseService {
    static async getBibles() {
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
        }
        catch (error) {
            console.error('Error fetching Bibles:', error);
            throw error;
        }
    }
    static async getVerse(reference, bibleId = _types__WEBPACK_IMPORTED_MODULE_0__.BIBLE_VERSIONS.KJV) {
        // Route ESV requests to ESV service
        if (bibleId === 'ESV') {
            return _esv_service__WEBPACK_IMPORTED_MODULE_1__.ESVService.getVerse(reference);
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
        }
        catch (error) {
            console.error('Error fetching verse:', error);
            throw error;
        }
    }
    static async getChapter(chapterReference, bibleId = _types__WEBPACK_IMPORTED_MODULE_0__.BIBLE_VERSIONS.KJV) {
        // Route ESV requests to ESV service
        if (bibleId === 'ESV') {
            return _esv_service__WEBPACK_IMPORTED_MODULE_1__.ESVService.getChapterWithRedLetters(chapterReference);
        }
        try {
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
            console.log('Daily Flame Chapter API Call:', {
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
            return {
                id: data.data.id,
                reference: data.data.reference,
                bookId: data.data.bookId,
                content: data.data.content,
                copyright: data.data.copyright
            };
        }
        catch (error) {
            console.error('Error fetching chapter:', error);
            throw error;
        }
    }
    static async getRandomVerse(verseList) {
        try {
            const verses = verseList || await this.getStoredVerses();
            if (!verses || verses.length === 0) {
                throw new Error('No verses available');
            }
            const randomIndex = Math.floor(Math.random() * verses.length);
            const selectedVerse = verses[randomIndex];
            return await this.getVerse(selectedVerse.reference, selectedVerse.bibleId);
        }
        catch (error) {
            console.error('Error getting random verse:', error);
            throw error;
        }
    }
    static async getDailyVerse() {
        try {
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
        catch (error) {
            console.error('Error getting daily verse:', error);
            throw error;
        }
    }
    static async getStoredVerses() {
        return new Promise((resolve) => {
            chrome.storage.local.get('verseList', (result) => {
                resolve(result.verseList || this.getDefaultVerses());
            });
        });
    }
    static async saveVerses(verses) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ verseList: verses }, () => {
                resolve(true);
            });
        });
    }
    static getDefaultVerses() {
        const kjvId = _types__WEBPACK_IMPORTED_MODULE_0__.BIBLE_VERSIONS.KJV;
        return [
            { reference: 'John 3:16', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
            { reference: 'Jeremiah 29:11', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
            { reference: 'Philippians 4:13', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
            { reference: 'Romans 8:28', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
            { reference: 'Joshua 1:9', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
            { reference: 'Proverbs 3:5-6', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() },
            { reference: '1 Peter 5:7', bibleId: kjvId, translation: 'KJV', dateAdded: new Date().toISOString() }
        ];
    }
    static convertReferenceToApiFormat(reference) {
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
            }
            else {
                return `${bookCode}.${chapter}.${startVerse}`;
            }
        }
        catch (error) {
            console.error('Reference conversion error:', error);
            return reference.replace(/\s+/g, '');
        }
    }
    static isValidReference(reference) {
        const referencePattern = /^[1-3]?\s*[A-Za-z]+\s+\d+:\d+(-\d+)?$/;
        return referencePattern.test(reference.trim());
    }
}
VerseService.API_KEY = '58410e50f19ea158ea4902e05191db02';
VerseService.BASE_URL = 'https://api.scripture.api.bible/v1';


/***/ }),

/***/ "./src/types/index.ts":
/*!****************************!*\
  !*** ./src/types/index.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BIBLE_VERSIONS: () => (/* binding */ BIBLE_VERSIONS)
/* harmony export */ });
// Bible translation mappings
const BIBLE_VERSIONS = {
    'KJV': 'de4e12af7f28f599-02',
    'ASV': '06125adad2d5898a-01',
    'ESV': 'ESV', // Special case - uses different API
    'WEB': '9879dbb7cfe39e4d-04',
    'WEB_BRITISH': '7142879509583d59-04',
    'WEB_UPDATED': '72f4e6dc683324df-03'
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************************!*\
  !*** ./src/background/index.ts ***!
  \*********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _services_verse_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../services/verse-service */ "./src/services/verse-service.ts");

// Detect if running on Microsoft Edge
function isEdgeBrowser() {
    return navigator.userAgent.includes('Edg/');
}
// Google Sign-In handler using chrome.identity API
async function handleGoogleSignIn() {
    console.log('Background: Starting Google Sign-In process');
    // Check if we're on Edge, which doesn't support getAuthToken
    if (isEdgeBrowser()) {
        console.log('Background: Detected Microsoft Edge, using launchWebAuthFlow');
        return handleGoogleSignInWithWebAuthFlow();
    }
    return new Promise((resolve, reject) => {
        // Force account selection by using 'any' account parameter
        chrome.identity.getAuthToken({
            interactive: true,
            account: { id: 'any' } // Force account picker
        }, async (result) => {
            if (chrome.runtime.lastError || !result) {
                console.error('Background: Google Sign-In failed', chrome.runtime.lastError);
                reject(new Error(chrome.runtime.lastError?.message || 'Failed to get auth token'));
                return;
            }
            // Extract token from result (could be string or object depending on API version)
            const authToken = typeof result === 'string' ? result : result.token;
            if (!authToken) {
                reject(new Error('No auth token received'));
                return;
            }
            console.log('Background: Google Sign-In successful, token received');
            // Fetch user info from Google API to get profile photo and details
            try {
                const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authToken}`);
                if (!userInfoResponse.ok) {
                    console.warn('Background: Failed to fetch user info, proceeding with token only');
                    resolve({ token: authToken, userInfo: null });
                    return;
                }
                const userInfo = await userInfoResponse.json();
                console.log('Background: User info fetched successfully');
                resolve({ token: authToken, userInfo });
            }
            catch (error) {
                console.warn('Background: Error fetching user info:', error);
                resolve({ token: authToken, userInfo: null });
            }
        });
    });
}
// Alternative Google Sign-In for Edge using launchWebAuthFlow
async function handleGoogleSignInWithWebAuthFlow() {
    console.log('Background: Using launchWebAuthFlow for Edge compatibility');
    const manifest = chrome.runtime.getManifest();
    const clientId = manifest.oauth2?.client_id;
    if (!clientId) {
        throw new Error('OAuth2 client ID not found in manifest');
    }
    // Generate redirect URI for the extension
    const redirectUri = chrome.identity.getRedirectURL();
    console.log('Background: Redirect URI:', redirectUri);
    // Build the OAuth2 URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('prompt', 'select_account'); // Force account selection
    return new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow({
            url: authUrl.toString(),
            interactive: true
        }, async (responseUrl) => {
            if (chrome.runtime.lastError || !responseUrl) {
                console.error('Background: Web auth flow failed', chrome.runtime.lastError);
                reject(new Error(chrome.runtime.lastError?.message || 'Authentication failed'));
                return;
            }
            // Extract access token from the response URL
            const url = new URL(responseUrl);
            const params = new URLSearchParams(url.hash.substring(1)); // Remove the # character
            const accessToken = params.get('access_token');
            if (!accessToken) {
                reject(new Error('No access token in response'));
                return;
            }
            console.log('Background: Access token obtained via web auth flow');
            // Fetch user info
            try {
                const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
                if (!userInfoResponse.ok) {
                    console.warn('Background: Failed to fetch user info');
                    resolve({ token: accessToken, userInfo: null });
                    return;
                }
                const userInfo = await userInfoResponse.json();
                console.log('Background: User info fetched successfully');
                resolve({ token: accessToken, userInfo });
            }
            catch (error) {
                console.warn('Background: Error fetching user info:', error);
                resolve({ token: accessToken, userInfo: null });
            }
        });
    });
}
// Clear all cached auth tokens for testing different accounts
async function clearAuthTokens() {
    console.log('Background: Clearing all cached auth tokens');
    // Edge doesn't support these methods, so just resolve immediately
    if (isEdgeBrowser()) {
        console.log('Background: Edge browser detected, no cached tokens to clear');
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        // First, try to get current token to revoke it
        chrome.identity.getAuthToken({ interactive: false }, (result) => {
            const token = typeof result === 'string' ? result : result?.token;
            if (token) {
                // Revoke the token first
                chrome.identity.removeCachedAuthToken({ token }, () => {
                    console.log('Background: Removed cached token');
                });
            }
            // Then clear all cached tokens
            chrome.identity.clearAllCachedAuthTokens(() => {
                if (chrome.runtime.lastError) {
                    console.error('Background: Error clearing auth tokens', chrome.runtime.lastError);
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                console.log('Background: All auth tokens cleared successfully');
                resolve();
            });
        });
    });
}
// Handle messages from content script and other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'injectVerseApp') {
        // Inject the verse app script into the current tab
        if (!sender.tab?.id) {
            sendResponse({ success: false, error: 'No tab ID found' });
            return;
        }
        chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            files: ['verse-app.js']
        }).then(() => {
            console.log('Background: Verse app injected successfully');
            sendResponse({ success: true });
        }).catch(error => {
            console.error('Background: Failed to inject verse app:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
    }
    if (request.action === 'getVerseShownDate') {
        const today = new Date().toISOString().split("T")[0];
        chrome.storage.local.get("verseShownDate", ({ verseShownDate }) => {
            sendResponse({
                success: true,
                verseShownDate: verseShownDate,
                today: today,
                shouldShow: verseShownDate !== today
            });
        });
        return true; // Keep message channel open for async response
    }
    if (request.action === 'setVerseShownDate') {
        const today = new Date().toISOString().split("T")[0];
        chrome.storage.local.set({ verseShownDate: today }, () => {
            console.log('Daily Flame: Verse shown for', today);
            sendResponse({ success: true });
        });
        return true; // Keep message channel open for async response
    }
    if (request.action === 'clearStorage') {
        chrome.storage.local.clear(() => {
            console.log('Daily Flame: Storage cleared');
            sendResponse({ success: true });
        });
        return true;
    }
    if (request.action === 'getDailyVerse') {
        _services_verse_service__WEBPACK_IMPORTED_MODULE_0__.VerseService.getDailyVerse()
            .then(verse => {
            sendResponse({ success: true, verse: verse });
        })
            .catch(error => {
            console.error('Error fetching daily verse:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
    }
    if (request.action === 'getVerse') {
        _services_verse_service__WEBPACK_IMPORTED_MODULE_0__.VerseService.getVerse(request.reference, request.bibleId)
            .then(verse => {
            sendResponse({ success: true, verse: verse });
        })
            .catch(error => {
            console.error('Error fetching verse:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
    }
    if (request.action === 'saveVerses') {
        _services_verse_service__WEBPACK_IMPORTED_MODULE_0__.VerseService.saveVerses(request.verses)
            .then(() => {
            sendResponse({ success: true });
        })
            .catch(error => {
            console.error('Error saving verses:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
    }
    if (request.action === 'getStoredVerses') {
        _services_verse_service__WEBPACK_IMPORTED_MODULE_0__.VerseService.getStoredVerses()
            .then(verses => {
            sendResponse({ success: true, verses: verses });
        })
            .catch(error => {
            console.error('Error getting stored verses:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
    }
    if (request.action === 'googleSignIn') {
        handleGoogleSignIn()
            .then(result => {
            sendResponse({
                success: true,
                token: result.token,
                userInfo: result.userInfo
            });
        })
            .catch(error => {
            console.error('Background: Error with Google sign-in:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
    }
    if (request.action === 'clearAuthTokens') {
        clearAuthTokens()
            .then(() => {
            sendResponse({ success: true });
        })
            .catch(error => {
            console.error('Background: Error clearing auth tokens:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
    }
});
// Handle extension icon clicks - always show verse overlay first
chrome.action.onClicked.addListener((tab) => {
    if (!tab.id || !tab.url) {
        console.log('Background: No tab ID or URL available');
        return;
    }
    // For restricted URLs and OAuth pages, open a new tab with a regular website
    const skipSites = [
        "chrome://",
        "chrome-extension://",
        "moz-extension://",
        "extensions",
        "about:",
        "file://",
        // OAuth and authentication URLs
        "accounts.google.com",
        "oauth2.googleapis.com",
        "auth.firebase.com",
        "identitytoolkit.googleapis.com",
        "securetoken.googleapis.com",
        // Microsoft Edge identity redirect
        "login.microsoftonline.com",
        "login.live.com"
    ];
    if (skipSites.some(site => tab.url.includes(site))) {
        console.log('Background: Cannot inject into restricted/auth URL, opening new tab:', tab.url);
        chrome.tabs.create({ url: 'https://www.google.com' }, (newTab) => {
            if (newTab.id) {
                // Wait a moment for the tab to load, then inject verse app
                setTimeout(() => {
                    // Clear storage first
                    chrome.storage.local.remove(['verseShownDate'], () => {
                        // Then inject the verse app
                        chrome.scripting.executeScript({
                            target: { tabId: newTab.id },
                            files: ['verse-app.js']
                        }).then(() => {
                            console.log('Background: Verse app injected in new tab');
                        }).catch((error) => {
                            console.error('Background: Error injecting verse app in new tab:', error);
                        });
                    });
                }, 1500);
            }
        });
        return;
    }
    try {
        // First clear the storage to force show
        chrome.storage.local.remove(['verseShownDate'], () => {
            // Then inject the verse app directly
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['verse-app.js']
            }).then(() => {
                console.log('Background: Verse app injected via icon click');
            }).catch((error) => {
                console.error('Background: Error injecting verse app:', error);
            });
        });
    }
    catch (error) {
        console.error('Background: Failed to execute script on tab:', tab.url, error);
    }
});
chrome.runtime.onInstalled.addListener(() => {
    console.log('Daily Flame extension installed');
});

})();

/******/ })()
;
//# sourceMappingURL=background.js.map