"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerseService = void 0;
var types_1 = require("../types");
var esv_service_1 = require("./esv-service");
var nlt_service_1 = require("./nlt-service");
var firestore_service_1 = require("./firestore-service");
var user_preferences_service_1 = require("./user-preferences-service");
var date_utils_1 = require("../utils/date-utils");
// Import parsers
var standard_parser_1 = require("./parsers/standard-parser");
var esv_parser_1 = require("./parsers/esv-parser");
var nlt_parser_1 = require("./parsers/nlt-parser");
var VerseService = /** @class */ (function () {
    function VerseService() {
    }
    VerseService.getBibles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("".concat(this.BASE_URL, "/bibles"), {
                                headers: {
                                    'api-key': this.API_KEY
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("API request failed: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data.data || []];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error fetching Bibles:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VerseService.getVerse = function (reference_1) {
        return __awaiter(this, arguments, void 0, function (reference, bibleId) {
            var apiReference, url, response, data, text, error_2;
            if (bibleId === void 0) { bibleId = types_1.BIBLE_VERSIONS.ESV; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Route ESV requests to ESV service
                        if (bibleId === 'ESV') {
                            return [2 /*return*/, esv_service_1.ESVService.getVerse(reference)];
                        }
                        // Route NLT requests to NLT service
                        if (bibleId === 'NLT') {
                            return [2 /*return*/, nlt_service_1.NLTService.getVerse(reference)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        apiReference = this.convertReferenceToApiFormat(reference);
                        url = "".concat(this.BASE_URL, "/bibles/").concat(bibleId, "/passages/").concat(apiReference, "?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false");
                        console.log('Daily Bread API Call:', {
                            reference: reference,
                            apiReference: apiReference,
                            bibleId: bibleId,
                            url: url
                        });
                        return [4 /*yield*/, fetch(url, {
                                headers: {
                                    'api-key': this.API_KEY
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("API request failed: ".concat(response.status, " - ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        if (!data.data || !data.data.content) {
                            throw new Error('No verse content found');
                        }
                        text = data.data.content;
                        text = text.replace(/[\r\n]+/g, ' ').trim();
                        text = text.replace(/\s+/g, ' ');
                        // For verse requests, always use the original reference
                        // The API sometimes returns incomplete references (e.g., "2 Chronicles" instead of "2 Chronicles 7:14")
                        return [2 /*return*/, {
                                text: text,
                                reference: reference, // Always use the original reference for verses
                                bibleId: bibleId
                            }];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Error fetching verse:', error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    VerseService.getChapter = function (chapterReference_1) {
        return __awaiter(this, arguments, void 0, function (chapterReference, bibleId) {
            var translationKey, parser, rawData, url, response, unifiedChapter, error_3;
            var _a;
            if (bibleId === void 0) { bibleId = types_1.BIBLE_VERSIONS.ESV; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        translationKey = (_a = Object.entries(types_1.BIBLE_VERSIONS).find(function (_a) {
                            var _ = _a[0], id = _a[1];
                            return id === bibleId;
                        })) === null || _a === void 0 ? void 0 : _a[0];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        if (!translationKey) {
                            throw new Error("Unknown bible ID: ".concat(bibleId));
                        }
                        parser = this.parsers.get(translationKey);
                        if (!parser) {
                            throw new Error("No parser available for translation: ".concat(translationKey));
                        }
                        rawData = void 0;
                        if (!(bibleId === 'ESV')) return [3 /*break*/, 4];
                        url = "https://api.esv.org/v3/passage/html/?q=".concat(encodeURIComponent(chapterReference), "&include-passage-references=false&include-footnotes=false&include-headings=true&include-verse-numbers=true&include-audio-link=false");
                        return [4 /*yield*/, fetch(url, {
                                headers: {
                                    'Authorization': "Token ".concat(esv_service_1.ESVService.API_KEY)
                                }
                            })];
                    case 2:
                        response = _b.sent();
                        if (!response.ok) {
                            throw new Error("ESV API request failed: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        rawData = _b.sent();
                        console.log('ESV API raw response:', rawData);
                        return [3 /*break*/, 8];
                    case 4:
                        if (!(bibleId === 'NLT')) return [3 /*break*/, 6];
                        return [4 /*yield*/, nlt_service_1.NLTService.getChapterWithRedLetters(chapterReference)];
                    case 5:
                        rawData = _b.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.fetchStandardChapter(chapterReference, bibleId)];
                    case 7:
                        // Standard API format
                        rawData = _b.sent();
                        _b.label = 8;
                    case 8:
                        unifiedChapter = parser.parse(rawData);
                        console.log('Parsed unified chapter:', {
                            reference: unifiedChapter.reference,
                            translation: unifiedChapter.translation,
                            verseCount: unifiedChapter.verses.length
                        });
                        return [2 /*return*/, unifiedChapter];
                    case 9:
                        error_3 = _b.sent();
                        console.error('Error fetching chapter:', {
                            chapterReference: chapterReference,
                            bibleId: bibleId,
                            translation: translationKey,
                            error: error_3 instanceof Error ? error_3.message : String(error_3)
                        });
                        // Provide more helpful error messages
                        if (error_3 instanceof Error) {
                            if (error_3.message.includes('No verses found')) {
                                throw new Error("Unable to load ".concat(chapterReference, " in ").concat(translationKey, ". The API may have returned an empty response."));
                            }
                            else if (error_3.message.includes('API request failed')) {
                                throw new Error("Failed to connect to Bible API for ".concat(translationKey, ". Please check your internet connection."));
                            }
                        }
                        throw error_3;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch chapter data from standard Bible API
     */
    VerseService.fetchStandardChapter = function (chapterReference, bibleId) {
        return __awaiter(this, void 0, void 0, function () {
            var match, bookName, chapter, apiReference, bookCode, chapterApiRef, url, response, data, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        match = chapterReference.match(/^([123]?\s*[a-zA-Z]+)\s+(\d+)$/);
                        if (!match) {
                            throw new Error("Invalid chapter reference: ".concat(chapterReference));
                        }
                        bookName = match[1], chapter = match[2];
                        apiReference = this.convertReferenceToApiFormat("".concat(bookName, " ").concat(chapter, ":1"));
                        bookCode = apiReference.split('.')[0];
                        chapterApiRef = "".concat(bookCode, ".").concat(chapter);
                        url = "".concat(this.BASE_URL, "/bibles/").concat(bibleId, "/chapters/").concat(chapterApiRef, "?content-type=json&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false");
                        console.log('Standard API Chapter Call:', {
                            chapterReference: chapterReference,
                            chapterApiRef: chapterApiRef,
                            url: url
                        });
                        return [4 /*yield*/, fetch(url, {
                                headers: {
                                    'api-key': this.API_KEY
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("API request failed: ".concat(response.status, " - ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (!data.data) {
                            throw new Error('No chapter content found');
                        }
                        result = {
                            id: data.data.id,
                            reference: data.data.reference || chapterReference,
                            bookId: data.data.bookId,
                            content: data.data.content,
                            copyright: data.data.copyright
                        };
                        console.log('Standard API response:', result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    VerseService.getRandomVerse = function (verseList) {
        return __awaiter(this, void 0, void 0, function () {
            var verses, _a, randomIndex, selectedVerse, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        _a = verseList;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getStoredVerses()];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        verses = _a;
                        if (!verses || verses.length === 0) {
                            throw new Error('No verses available');
                        }
                        randomIndex = Math.floor(Math.random() * verses.length);
                        selectedVerse = verses[randomIndex];
                        return [4 /*yield*/, this.getVerse(selectedVerse.reference, selectedVerse.bibleId)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        error_4 = _b.sent();
                        console.error('Error getting random verse:', error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    VerseService.getDailyVerse = function () {
        return __awaiter(this, arguments, void 0, function (user) {
            var preferredTranslation, bibleId, todaysVerse, allVerses, today, dayOfYear, verseIndex, selectedVerse, error_5;
            if (user === void 0) { user = null; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, user_preferences_service_1.UserPreferencesService.getBibleTranslation(user)];
                    case 1:
                        preferredTranslation = _a.sent();
                        bibleId = types_1.BIBLE_VERSIONS[preferredTranslation];
                        return [4 /*yield*/, firestore_service_1.FirestoreService.getTodaysVerse()];
                    case 2:
                        todaysVerse = _a.sent();
                        if (!todaysVerse) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getVerse(todaysVerse.reference, bibleId)];
                    case 3: 
                    // Use the verse for today's date from Firestore with preferred translation
                    return [2 /*return*/, _a.sent()];
                    case 4: return [4 /*yield*/, firestore_service_1.FirestoreService.getAllVerses()];
                    case 5:
                        allVerses = _a.sent();
                        if (!(allVerses && allVerses.length > 0)) return [3 /*break*/, 7];
                        today = new Date();
                        dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
                        verseIndex = dayOfYear % allVerses.length;
                        selectedVerse = allVerses[verseIndex];
                        return [4 /*yield*/, this.getVerse(selectedVerse.reference, bibleId)];
                    case 6: return [2 /*return*/, _a.sent()];
                    case 7:
                        // Final fallback to stored verses
                        console.warn('Firestore unavailable, falling back to default verses');
                        return [2 /*return*/, this.getDailyVerseFromStored(user)];
                    case 8:
                        error_5 = _a.sent();
                        console.error('Error getting daily verse:', error_5);
                        // Fallback to stored verses on any error
                        return [2 /*return*/, this.getDailyVerseFromStored(user)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    VerseService.getDailyVerseFromStored = function () {
        return __awaiter(this, arguments, void 0, function (user) {
            var verses, preferredTranslation, bibleId, today, dayOfYear, verseIndex, selectedVerse;
            if (user === void 0) { user = null; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getStoredVerses()];
                    case 1:
                        verses = _a.sent();
                        if (!verses || verses.length === 0) {
                            throw new Error('No verses configured');
                        }
                        return [4 /*yield*/, user_preferences_service_1.UserPreferencesService.getBibleTranslation(user)];
                    case 2:
                        preferredTranslation = _a.sent();
                        bibleId = types_1.BIBLE_VERSIONS[preferredTranslation];
                        today = new Date();
                        dayOfYear = (0, date_utils_1.getDayOfYear)(today);
                        verseIndex = dayOfYear % verses.length;
                        selectedVerse = verses[verseIndex];
                        return [4 /*yield*/, this.getVerse(selectedVerse.reference, bibleId)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VerseService.getStoredVerses = function () {
        return __awaiter(this, void 0, void 0, function () {
            var firestoreVerses, error_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, firestore_service_1.FirestoreService.getAllVerses()];
                    case 1:
                        firestoreVerses = _a.sent();
                        if (firestoreVerses && firestoreVerses.length > 0) {
                            // Convert Firestore verses to StoredVerse format
                            return [2 /*return*/, firestoreVerses.map(function (v) { return ({
                                    reference: v.reference,
                                    bibleId: v.bibleId || 'ESV',
                                    translation: 'ESV',
                                    dateAdded: v.date || new Date().toISOString()
                                }); })];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error fetching from Firestore:', error_6);
                        return [3 /*break*/, 3];
                    case 3: 
                    // Fallback to Chrome storage with default verses
                    return [2 /*return*/, new Promise(function (resolve) {
                            chrome.storage.local.get('verseList', function (result) {
                                resolve(result.verseList || _this.getDefaultVerses());
                            });
                        })];
                }
            });
        });
    };
    VerseService.saveVerses = function (verses) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        chrome.storage.local.set({ verseList: verses }, function () {
                            resolve(true);
                        });
                    })];
            });
        });
    };
    // Translation preference methods (now delegates to UserPreferencesService)
    VerseService.saveTranslationPreference = function (translation_1) {
        return __awaiter(this, arguments, void 0, function (translation, user) {
            if (user === void 0) { user = null; }
            return __generator(this, function (_a) {
                return [2 /*return*/, user_preferences_service_1.UserPreferencesService.saveBibleTranslation(translation, user)];
            });
        });
    };
    VerseService.getTranslationPreference = function () {
        return __awaiter(this, arguments, void 0, function (user) {
            if (user === void 0) { user = null; }
            return __generator(this, function (_a) {
                return [2 /*return*/, user_preferences_service_1.UserPreferencesService.getBibleTranslation(user)];
            });
        });
    };
    VerseService.getDefaultVerses = function () {
        var esvId = types_1.BIBLE_VERSIONS.ESV;
        return [
            { reference: 'John 3:16', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
            { reference: 'Jeremiah 29:11', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
            { reference: 'Philippians 4:13', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
            { reference: 'Romans 8:28', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
            { reference: 'Joshua 1:9', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
            { reference: 'Proverbs 3:5-6', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() },
            { reference: '1 Peter 5:7', bibleId: esvId, translation: 'ESV', dateAdded: new Date().toISOString() }
        ];
    };
    VerseService.convertReferenceToApiFormat = function (reference) {
        var bookMappings = {
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
            '1 chronicles': '1CH', '1chronicles': '1CH', '1ch': '1CH', '1 chr': '1CH', '1chr': '1CH',
            '2 chronicles': '2CH', '2chronicles': '2CH', '2ch': '2CH', '2 chr': '2CH', '2chr': '2CH',
            'ezra': 'EZR', 'ezr': 'EZR',
            'nehemiah': 'NEH', 'neh': 'NEH',
            'esther': 'EST', 'est': 'EST',
            'job': 'JOB',
            'psalms': 'PSA', 'psalm': 'PSA', 'psa': 'PSA', 'ps': 'PSA',
            'proverbs': 'PRO', 'prov': 'PRO', 'pro': 'PRO',
            'ecclesiastes': 'ECC', 'eccl': 'ECC', 'ecc': 'ECC',
            'song of solomon': 'SNG', 'song of songs': 'SNG', 'songs': 'SNG', 'sng': 'SNG', 'sos': 'SNG',
            'isaiah': 'ISA', 'isa': 'ISA',
            'jeremiah': 'JER', 'jer': 'JER',
            'lamentations': 'LAM', 'lam': 'LAM',
            'ezekiel': 'EZK', 'ezek': 'EZK', 'ezk': 'EZK',
            'daniel': 'DAN', 'dan': 'DAN',
            'hosea': 'HOS', 'hos': 'HOS',
            'joel': 'JOL', 'jol': 'JOL',
            'amos': 'AMO', 'amo': 'AMO',
            'obadiah': 'OBA', 'oba': 'OBA',
            'jonah': 'JON', 'jon': 'JON',
            'micah': 'MIC', 'mic': 'MIC',
            'nahum': 'NAM', 'nam': 'NAM',
            'habakkuk': 'HAB', 'hab': 'HAB',
            'zephaniah': 'ZEP', 'zep': 'ZEP',
            'haggai': 'HAG', 'hag': 'HAG',
            'zechariah': 'ZEC', 'zec': 'ZEC',
            'malachi': 'MAL', 'mal': 'MAL',
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
            var match = reference.match(/^([123]?\s*[a-zA-Z]+)\s+(\d+):(\d+)(?:-(\d+))?$/i);
            if (!match) {
                throw new Error("Invalid reference format: ".concat(reference));
            }
            var bookName = match[1], chapter = match[2], startVerse = match[3], endVerse = match[4];
            var bookKey = bookName.toLowerCase().trim();
            var bookCode = bookMappings[bookKey];
            if (!bookCode) {
                throw new Error("Unknown book: ".concat(bookName));
            }
            if (endVerse) {
                return "".concat(bookCode, ".").concat(chapter, ".").concat(startVerse, "-").concat(bookCode, ".").concat(chapter, ".").concat(endVerse);
            }
            else {
                return "".concat(bookCode, ".").concat(chapter, ".").concat(startVerse);
            }
        }
        catch (error) {
            console.error('Reference conversion error:', error);
            return reference.replace(/\s+/g, '');
        }
    };
    VerseService.isValidReference = function (reference) {
        var referencePattern = /^[1-3]?\s*[A-Za-z]+\s+\d+:\d+(-\d+)?$/;
        return referencePattern.test(reference.trim());
    };
    VerseService.API_KEY = '58410e50f19ea158ea4902e05191db02';
    VerseService.BASE_URL = 'https://api.scripture.api.bible/v1';
    // Parser registry
    VerseService.parsers = new Map([
        ['ESV', new esv_parser_1.ESVBibleParser()],
        ['NLT', new nlt_parser_1.NLTBibleParser()],
        ['KJV', new standard_parser_1.StandardBibleParser('KJV')],
        ['ASV', new standard_parser_1.StandardBibleParser('ASV')],
        ['WEB', new standard_parser_1.StandardBibleParser('WEB')],
        ['WEB_BRITISH', new standard_parser_1.StandardBibleParser('WEB_BRITISH')],
        ['WEB_UPDATED', new standard_parser_1.StandardBibleParser('WEB_UPDATED')]
    ]);
    return VerseService;
}());
exports.VerseService = VerseService;
