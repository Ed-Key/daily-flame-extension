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
exports.NLTBibleParser = void 0;
var base_parser_1 = require("./base-parser");
/**
 * Parser for NLT (New Living Translation) Bible API
 * Handles custom verse_export XML-like format
 */
var NLTBibleParser = /** @class */ (function (_super) {
    __extends(NLTBibleParser, _super);
    function NLTBibleParser() {
        return _super.call(this, 'NLT') || this;
    }
    /**
     * Parse NLT API HTML response into unified format
     *
     * Expected input format:
     * {
     *   passages: [{
     *     reference: "John 3",
     *     content: "<html with verse_export elements>"
     *   }]
     * }
     */
    NLTBibleParser.prototype.parse = function (apiResponse) {
        this.debug('Parsing NLT format');
        if (!apiResponse || !apiResponse.passages || !apiResponse.passages[0]) {
            throw new Error('Invalid NLT API response: missing passages');
        }
        var passage = apiResponse.passages[0];
        var _a = this.parseReference(passage.reference), bookName = _a.bookName, chapterNumber = _a.chapterNumber;
        // Check if this is a Psalm
        var isPsalm = bookName.toLowerCase() === 'psalm' || bookName.toLowerCase() === 'psalms';
        // Extract Psalm metadata if applicable
        var psalmMetadata;
        if (isPsalm) {
            psalmMetadata = this.extractPsalmMetadata(passage.content, chapterNumber);
        }
        // Parse HTML content
        var verses = this.parseNLTHtml(passage.content, isPsalm);
        var unifiedChapter = {
            reference: passage.reference,
            translation: 'NLT',
            bookName: bookName,
            chapterNumber: chapterNumber,
            verses: verses,
            metadata: {
                copyright: '© 1996, 2004, 2015 by Tyndale House Foundation',
                translationName: 'New Living Translation'
            },
            psalmMetadata: psalmMetadata,
            rawResponse: apiResponse
        };
        this.debug('Parsed NLT chapter', {
            reference: unifiedChapter.reference,
            verseCount: verses.length
        });
        return unifiedChapter;
    };
    /**
     * Parse NLT HTML with verse_export structure
     *
     * NLT Format:
     * <verse_export vn="1">
     *   <cn>3</cn>There was a man named Nicodemus...
     * </verse_export>
     *
     * - <verse_export> wraps each verse
     * - vn attribute contains verse number
     * - <cn> contains chapter number (only in first verse)
     * - <sn> contains section headings
     * - <red> or class="red" for words of Jesus
     * - Poetry formatting with q1/q2 classes for Psalms
     */
    NLTBibleParser.prototype.parseNLTHtml = function (html, isPsalm) {
        var _this = this;
        if (isPsalm === void 0) { isPsalm = false; }
        var verses = [];
        // Extract all verse_export elements
        var verseExportPattern = /<verse_export[^>]*vn="(\d+)"[^>]*>(.*?)<\/verse_export>/gs;
        var matches = Array.from(html.matchAll(verseExportPattern));
        if (matches.length === 0) {
            this.debug('No verse_export elements found, trying alternative parsing');
            return this.parseNLTAlternative(html);
        }
        matches.forEach(function (match, index) {
            var verseNumber = match[1];
            var verseContent = match[2];
            // Extract chapter number if present (first verse)
            // Look for <h2 class="chapter-number">...<span class="cw_ch">1</span></h2>
            var isFirstVerse = false;
            var chapterNumMatch = verseContent.match(/<h2[^>]*class="chapter-number"[^>]*>.*?<span[^>]*class="cw_ch"[^>]*>(\d+)<\/span>.*?<\/h2>/s);
            if (chapterNumMatch) {
                isFirstVerse = true;
                // Remove the entire chapter header from content
                verseContent = verseContent.replace(chapterNumMatch[0], '');
            }
            // Extract section heading if present
            // Look for <h3 class="subhead">...</h3>
            var heading;
            var headingMatch = verseContent.match(/<h3[^>]*class="subhead"[^>]*>(.*?)<\/h3>/s);
            if (headingMatch) {
                heading = _this.stripHtmlTags(headingMatch[1]);
                // Remove heading from content
                verseContent = verseContent.replace(headingMatch[0], '');
            }
            // Remove verse number spans from content
            // <span class="vn">1</span>
            verseContent = verseContent.replace(/<span[^>]*class="vn"[^>]*>\d+<\/span>/g, '');
            // Remove footnote markers and content
            // <a class="a-tn">*</a><span class="tn">...</span>
            verseContent = verseContent.replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a>/g, '');
            verseContent = verseContent.replace(/<span[^>]*class="tn"[^>]*>.*?<\/span>/gs, '');
            // Check for red letter text
            var hasRedLetter = /<red>|class=["']?red["']?/.test(verseContent);
            // Check for Psalm-specific elements
            var isSelah = false;
            var poetryIndentLevel = 0;
            if (isPsalm) {
                // Check for Selah
                isSelah = /\bSelah\b/i.test(verseContent);
                // Check for poetry indentation (q1, q2 classes)
                if (/<[^>]*class=["']?q2["']?/.test(verseContent)) {
                    poetryIndentLevel = 2;
                }
                else if (/<[^>]*class=["']?q1["']?/.test(verseContent)) {
                    poetryIndentLevel = 1;
                }
            }
            // Extract plain text
            var plainText = _this.stripHtmlTags(verseContent).trim();
            var verse = _this.createVerse(verseNumber, plainText, {
                isFirstVerse: isFirstVerse || index === 0,
                isRedLetter: hasRedLetter,
                heading: heading,
                rawHtml: match[0], // Preserve original for potential custom rendering
                isSelah: isSelah || undefined,
                poetryIndentLevel: poetryIndentLevel || undefined
            });
            verses.push(verse);
        });
        return verses;
    };
    /**
     * Alternative parsing for NLT when verse_export is not found
     * Some NLT responses might use different markup
     */
    NLTBibleParser.prototype.parseNLTAlternative = function (html) {
        var _this = this;
        var verses = [];
        // Try to parse by looking for verse numbers in various formats
        // Pattern for verses with class="vn" for verse numbers
        var versePattern = /<span[^>]*class="vn"[^>]*>(\d+)<\/span>(.*?)(?=<span[^>]*class="vn"|$)/gs;
        var matches = Array.from(html.matchAll(versePattern));
        if (matches.length === 0) {
            // Try another pattern - verses in paragraphs
            var paragraphPattern = /<p[^>]*>(.*?)<\/p>/gs;
            var paragraphs = Array.from(html.matchAll(paragraphPattern));
            paragraphs.forEach(function (para) {
                var content = para[1];
                // Split by verse numbers
                var verseSplits = content.split(/<span[^>]*class="vn"[^>]*>/);
                verseSplits.forEach(function (split, index) {
                    if (index === 0 && !split.trim())
                        return; // Skip empty first split
                    var verseMatch = split.match(/^(\d+)<\/span>(.*)/s);
                    if (verseMatch) {
                        var verseNumber = verseMatch[1];
                        var verseText = _this.stripHtmlTags(verseMatch[2]);
                        var hasRedLetter = /class=["']?red["']?/.test(verseMatch[2]);
                        verses.push(_this.createVerse(verseNumber, verseText, {
                            isFirstVerse: verses.length === 0,
                            isRedLetter: hasRedLetter
                        }));
                    }
                    else if (index === 0 && split.includes('class="cn"')) {
                        // First verse with chapter number
                        var chapterMatch = split.match(/<span[^>]*class="cn"[^>]*>(\d+)<\/span>(.*)/s);
                        if (chapterMatch) {
                            var verseText = _this.stripHtmlTags(chapterMatch[2]);
                            var hasRedLetter = /class=["']?red["']?/.test(chapterMatch[2]);
                            verses.push(_this.createVerse('1', verseText, {
                                isFirstVerse: true,
                                isRedLetter: hasRedLetter
                            }));
                        }
                    }
                });
            });
        }
        else {
            // Process matches from the first pattern
            matches.forEach(function (match, index) {
                var verseNumber = match[1];
                var verseText = _this.stripHtmlTags(match[2]);
                var hasRedLetter = /class=["']?red["']?/.test(match[2]);
                verses.push(_this.createVerse(verseNumber, verseText, {
                    isFirstVerse: index === 0,
                    isRedLetter: hasRedLetter
                }));
            });
        }
        // If still no verses, throw error
        if (verses.length === 0) {
            throw new Error('Unable to parse NLT content - no recognizable verse structure found');
        }
        return verses;
    };
    /**
     * Extract Psalm-specific metadata from NLT HTML
     */
    NLTBibleParser.prototype.extractPsalmMetadata = function (html, chapterNumber) {
        var _this = this;
        var metadata = {
            psalmNumber: chapterNumber,
            hasSelah: /\bSelah\b/i.test(html)
        };
        // Look for superscription
        // NLT typically puts Psalm titles in <h3 class="psalm-title"> or similar
        var superscriptionMatch = html.match(/<h3[^>]*class=["']?psalm-title["']?[^>]*>(.*?)<\/h3>/i);
        if (!superscriptionMatch) {
            // Try alternative patterns
            var altMatch = html.match(/<p[^>]*class=["']?psalm-acrostic-title["']?[^>]*>(.*?)<\/p>/i);
            if (altMatch) {
                metadata.superscription = this.stripHtmlTags(altMatch[1]).trim();
            }
        }
        else {
            metadata.superscription = this.stripHtmlTags(superscriptionMatch[1]).trim();
        }
        // Extract section headings
        var sectionHeadings = [];
        var headingPattern = /<h3[^>]*class=["']?subhead["']?[^>]*>(.*?)<\/h3>/gs;
        var headings = Array.from(html.matchAll(headingPattern));
        headings.forEach(function (headingMatch) {
            var headingText = _this.stripHtmlTags(headingMatch[1]).trim();
            // Skip if this is the superscription
            if (headingText === metadata.superscription) {
                return;
            }
            // Find which verse this heading appears after
            var headingPosition = html.indexOf(headingMatch[0]);
            var beforeHeading = html.substring(0, headingPosition);
            // Look for the last verse number before this heading
            var verseNumbers = Array.from(beforeHeading.matchAll(/vn="(\d+)"/g));
            if (verseNumbers.length > 0) {
                var lastVerseNumber = verseNumbers[verseNumbers.length - 1][1];
                sectionHeadings.push({
                    afterVerse: lastVerseNumber,
                    heading: headingText
                });
            }
        });
        if (sectionHeadings.length > 0) {
            metadata.sectionHeadings = sectionHeadings;
        }
        // Check for musical notation in superscription
        if (metadata.superscription) {
            var musicalMatch = metadata.superscription.match(/(For the (?:choir )?director[^.]*)/i);
            if (musicalMatch) {
                metadata.musicalNotation = musicalMatch[1];
            }
        }
        return metadata;
    };
    return NLTBibleParser;
}(base_parser_1.BaseBibleParser));
exports.NLTBibleParser = NLTBibleParser;
