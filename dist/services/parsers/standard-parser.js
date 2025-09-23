"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardBibleParser = void 0;
var base_parser_1 = require("./base-parser");
/**
 * Parser for standard Bible API format (KJV, ASV, WEB, etc.)
 * Handles the JSON format returned by scripture.api.bible
 */
var StandardBibleParser = /** @class */ (function (_super) {
    __extends(StandardBibleParser, _super);
    function StandardBibleParser(translation) {
        return _super.call(this, translation) || this;
    }
    /**
     * Parse standard API JSON response into unified format
     *
     * Expected input format:
     * {
     *   reference: "John 3",
     *   content: [
     *     {
     *       items: [
     *         { name: "1", text: "verse text" },
     *         { name: "2", text: "verse text" }
     *       ]
     *     }
     *   ]
     * }
     */
    StandardBibleParser.prototype.parse = function (apiResponse) {
        var _this = this;
        var _a, _b;
        this.debug('Parsing standard format', { translation: this.translation });
        if (!apiResponse || !apiResponse.reference) {
            throw new Error('Invalid API response: missing reference');
        }
        var _c = this.parseReference(apiResponse.reference), bookName = _c.bookName, chapterNumber = _c.chapterNumber;
        // Check if this is a Psalm
        var isPsalm = bookName.toLowerCase() === 'psalm' || bookName.toLowerCase() === 'psalms';
        // Extract Psalm metadata if applicable
        var psalmMetadata;
        if (isPsalm) {
            psalmMetadata = this.extractPsalmMetadata(apiResponse, chapterNumber);
        }
        var verses = [];
        // Extract verses from content array - handle the actual API structure
        if (apiResponse.content && Array.isArray(apiResponse.content)) {
            apiResponse.content.forEach(function (paragraph) {
                var _a, _b;
                // Each paragraph has items that contain verse tags and text
                if (paragraph.items && Array.isArray(paragraph.items)) {
                    var currentVerseNumber_1 = '';
                    var currentVerseText_1 = '';
                    paragraph.items.forEach(function (item) {
                        var _a, _b, _c;
                        // Check if this is a verse tag
                        if (item.type === 'tag' && item.name === 'verse' && ((_a = item.attrs) === null || _a === void 0 ? void 0 : _a.number)) {
                            // If we have a previous verse, save it
                            if (currentVerseNumber_1 && currentVerseText_1) {
                                var verseOptions = {
                                    isFirstVerse: verses.length === 0,
                                    isRedLetter: false
                                };
                                // Add Psalm-specific attributes
                                if (isPsalm) {
                                    // Check for Selah
                                    if (/\bSelah\b/i.test(currentVerseText_1)) {
                                        verseOptions.isSelah = true;
                                    }
                                    // Check for poetry markers in the paragraph style
                                    if (((_b = paragraph.attrs) === null || _b === void 0 ? void 0 : _b.style) === 'q1') {
                                        verseOptions.poetryIndentLevel = 1;
                                    }
                                    else if (((_c = paragraph.attrs) === null || _c === void 0 ? void 0 : _c.style) === 'q2') {
                                        verseOptions.poetryIndentLevel = 2;
                                    }
                                }
                                verses.push(_this.createVerse(currentVerseNumber_1, currentVerseText_1.trim(), verseOptions));
                            }
                            // Start new verse
                            currentVerseNumber_1 = item.attrs.number;
                            currentVerseText_1 = '';
                        }
                        // Check if this is text content
                        else if (item.type === 'text' && item.text) {
                            // Add text to current verse
                            currentVerseText_1 += item.text;
                        }
                        // Check if this is a char tag (special formatting)
                        else if (item.type === 'tag' && item.name === 'char' && item.items) {
                            // Extract text from char tag
                            item.items.forEach(function (charItem) {
                                if (charItem.type === 'text' && charItem.text) {
                                    currentVerseText_1 += charItem.text;
                                }
                            });
                        }
                    });
                    // Don't forget the last verse in the paragraph
                    if (currentVerseNumber_1 && currentVerseText_1) {
                        var verseOptions = {
                            isFirstVerse: verses.length === 0,
                            isRedLetter: false
                        };
                        // Add Psalm-specific attributes
                        if (isPsalm) {
                            // Check for Selah
                            if (/\bSelah\b/i.test(currentVerseText_1)) {
                                verseOptions.isSelah = true;
                            }
                            // Check for poetry markers in the paragraph style
                            if (((_a = paragraph.attrs) === null || _a === void 0 ? void 0 : _a.style) === 'q1') {
                                verseOptions.poetryIndentLevel = 1;
                            }
                            else if (((_b = paragraph.attrs) === null || _b === void 0 ? void 0 : _b.style) === 'q2') {
                                verseOptions.poetryIndentLevel = 2;
                            }
                        }
                        verses.push(_this.createVerse(currentVerseNumber_1, currentVerseText_1.trim(), verseOptions));
                    }
                }
            });
        }
        // Also check the old format for backward compatibility
        if (verses.length === 0 && apiResponse.content && Array.isArray(apiResponse.content)) {
            // Try the simpler format that tests use
            apiResponse.content.forEach(function (section) {
                if (section.items && Array.isArray(section.items)) {
                    section.items.forEach(function (item, index) {
                        if (item.name && item.text && /^\d+$/.test(item.name.trim())) {
                            var verse = _this.createVerse(item.name.trim(), item.text, {
                                isFirstVerse: index === 0 && verses.length === 0,
                                isRedLetter: false
                            });
                            verses.push(verse);
                        }
                    });
                }
            });
        }
        // Handle the case where items are directly at root level
        if (verses.length === 0 && apiResponse.items && Array.isArray(apiResponse.items)) {
            apiResponse.items.forEach(function (item, index) {
                if (item.name && item.text && /^\d+$/.test(item.name.trim())) {
                    var verse = _this.createVerse(item.name.trim(), item.text, {
                        isFirstVerse: index === 0,
                        isRedLetter: false
                    });
                    verses.push(verse);
                }
            });
        }
        if (verses.length === 0) {
            console.error('[StandardParser] No verses found. API response structure:', {
                hasContent: !!apiResponse.content,
                contentLength: Array.isArray(apiResponse.content) ? apiResponse.content.length : 'N/A',
                hasItems: !!apiResponse.items,
                itemsLength: Array.isArray(apiResponse.items) ? apiResponse.items.length : 'N/A',
                sampleContent: (_a = apiResponse.content) === null || _a === void 0 ? void 0 : _a[0]
            });
            throw new Error("No verses found in API response for ".concat(this.translation));
        }
        var unifiedChapter = {
            reference: apiResponse.reference,
            translation: this.translation,
            bookName: bookName,
            chapterNumber: chapterNumber,
            verses: verses,
            metadata: {
                copyright: apiResponse.copyright,
                translationName: this.getTranslationFullName()
            },
            psalmMetadata: psalmMetadata,
            rawResponse: apiResponse
        };
        this.debug('Parsed chapter', {
            reference: unifiedChapter.reference,
            verseCount: verses.length,
            firstVerse: ((_b = verses[0]) === null || _b === void 0 ? void 0 : _b.text.substring(0, 50)) + '...'
        });
        return unifiedChapter;
    };
    /**
     * Get full translation name for metadata
     */
    StandardBibleParser.prototype.getTranslationFullName = function () {
        var names = {
            'KJV': 'King James Version',
            'ASV': 'American Standard Version',
            'WEB': 'World English Bible',
            'WEB_BRITISH': 'World English Bible British Edition',
            'WEB_UPDATED': 'World English Bible Updated'
        };
        return names[this.translation] || this.translation;
    };
    /**
     * Extract Psalm-specific metadata from standard API response
     */
    StandardBibleParser.prototype.extractPsalmMetadata = function (apiResponse, chapterNumber) {
        var _a, _b;
        var metadata = {
            psalmNumber: chapterNumber,
            hasSelah: false
        };
        // Check all content for Selah
        if (apiResponse.content && Array.isArray(apiResponse.content)) {
            for (var _i = 0, _c = apiResponse.content; _i < _c.length; _i++) {
                var paragraph = _c[_i];
                if (paragraph.items && Array.isArray(paragraph.items)) {
                    for (var _d = 0, _e = paragraph.items; _d < _e.length; _d++) {
                        var item = _e[_d];
                        if (item.type === 'text' && item.text && /\bSelah\b/i.test(item.text)) {
                            metadata.hasSelah = true;
                            break;
                        }
                    }
                }
                if (metadata.hasSelah)
                    break;
            }
        }
        // Look for title/superscription
        // In scripture.api.bible, titles often come as the first paragraph with style="s1" or "d"
        if (apiResponse.content && apiResponse.content.length > 0) {
            var firstPara = apiResponse.content[0];
            if (((_a = firstPara.attrs) === null || _a === void 0 ? void 0 : _a.style) === 's1' || ((_b = firstPara.attrs) === null || _b === void 0 ? void 0 : _b.style) === 'd') {
                // Extract title text
                var titleText_1 = '';
                if (firstPara.items && Array.isArray(firstPara.items)) {
                    firstPara.items.forEach(function (item) {
                        if (item.type === 'text' && item.text) {
                            titleText_1 += item.text;
                        }
                    });
                }
                if (titleText_1.trim()) {
                    metadata.superscription = titleText_1.trim();
                    // Check for musical notation
                    var musicalMatch = titleText_1.match(/(To the (?:chief )?Musician[^.]*)/i);
                    if (musicalMatch) {
                        metadata.musicalNotation = musicalMatch[1];
                    }
                }
            }
        }
        // Extract section headings
        var sectionHeadings = [];
        var lastVerseNumber = '0';
        if (apiResponse.content && Array.isArray(apiResponse.content)) {
            apiResponse.content.forEach(function (paragraph) {
                var _a, _b;
                // Check if this is a heading (style="s2" or similar)
                if (((_a = paragraph.attrs) === null || _a === void 0 ? void 0 : _a.style) === 's2' || ((_b = paragraph.attrs) === null || _b === void 0 ? void 0 : _b.style) === 's3') {
                    var headingText_1 = '';
                    if (paragraph.items && Array.isArray(paragraph.items)) {
                        paragraph.items.forEach(function (item) {
                            if (item.type === 'text' && item.text) {
                                headingText_1 += item.text;
                            }
                        });
                    }
                    if (headingText_1.trim() && lastVerseNumber !== '0') {
                        sectionHeadings.push({
                            afterVerse: lastVerseNumber,
                            heading: headingText_1.trim()
                        });
                    }
                }
                // Track last verse number
                if (paragraph.items && Array.isArray(paragraph.items)) {
                    paragraph.items.forEach(function (item) {
                        var _a;
                        if (item.type === 'tag' && item.name === 'verse' && ((_a = item.attrs) === null || _a === void 0 ? void 0 : _a.number)) {
                            lastVerseNumber = item.attrs.number;
                        }
                    });
                }
            });
        }
        if (sectionHeadings.length > 0) {
            metadata.sectionHeadings = sectionHeadings;
        }
        return metadata;
    };
    return StandardBibleParser;
}(base_parser_1.BaseBibleParser));
exports.StandardBibleParser = StandardBibleParser;
