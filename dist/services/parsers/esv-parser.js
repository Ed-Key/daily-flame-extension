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
exports.ESVBibleParser = void 0;
var base_parser_1 = require("./base-parser");
/**
 * Parser for ESV (English Standard Version) Bible API
 * Handles HTML format with specific ESV styling and structure
 */
var ESVBibleParser = /** @class */ (function (_super) {
    __extends(ESVBibleParser, _super);
    function ESVBibleParser() {
        return _super.call(this, 'ESV') || this;
    }
    /**
     * Parse ESV API HTML response into unified format
     *
     * Expected input format:
     * {
     *   passages: [{
     *     reference: "John 3",
     *     content: "<html with chapter content>"
     *   }]
     * }
     */
    ESVBibleParser.prototype.parse = function (apiResponse) {
        this.debug('Parsing ESV format');
        if (!apiResponse || !apiResponse.passages || !apiResponse.passages[0]) {
            throw new Error('Invalid ESV API response: missing passages');
        }
        var passage = apiResponse.passages[0];
        var reference = apiResponse.canonical || apiResponse.query;
        var _a = this.parseReference(reference), bookName = _a.bookName, chapterNumber = _a.chapterNumber;
        // Check if this is a Psalm
        var isPsalm = bookName.toLowerCase() === 'psalm' || bookName.toLowerCase() === 'psalms';
        // Extract Psalm metadata if applicable
        var psalmMetadata;
        if (isPsalm) {
            psalmMetadata = this.extractPsalmMetadata(passage, chapterNumber);
        }
        // Parse HTML content using browser's DOMParser if available
        var verses = this.parseESVHtml(passage, chapterNumber, isPsalm);
        var unifiedChapter = {
            reference: reference,
            translation: 'ESV',
            bookName: bookName,
            chapterNumber: chapterNumber,
            verses: verses,
            metadata: {
                copyright: apiResponse.copyright,
                translationName: 'English Standard Version'
            },
            psalmMetadata: psalmMetadata,
            rawResponse: apiResponse
        };
        this.debug('Parsed ESV chapter', {
            reference: unifiedChapter.reference,
            verseCount: verses.length
        });
        return unifiedChapter;
    };
    /**
     * Parse ESV HTML content to extract verses
     * Handles ESV-specific HTML structure including:
     * - Chapter numbers in <b class="chapter-num"> with format "1:1"
     * - Verse numbers in <b class="verse-num">
     * - Section headings in <h3>
     * - Red letter text in <span class="woc">
     * - Psalm-specific elements like Selah markers
     */
    ESVBibleParser.prototype.parseESVHtml = function (html, chapterNumber, isPsalm) {
        var _this = this;
        if (isPsalm === void 0) { isPsalm = false; }
        var verses = [];
        // Debug: log first 500 chars of HTML
        this.debug('HTML content (first 500 chars):', html.substring(0, 500));
        // Try the new format first (paragraphs with <b> tags for verse numbers)
        var paragraphVerses = this.parseESVParagraphs(html, chapterNumber, isPsalm);
        if (paragraphVerses.length > 0) {
            return paragraphVerses;
        }
        // Fall back to old format (span.text) for backward compatibility
        var verseSpans = this.extractVerseSpans(html);
        this.debug('Verse spans found:', verseSpans.length);
        // Also find section headings
        var headingPattern = /<h3[^>]*id="([^"]*)"[^>]*>(.*?)<\/h3>/gs;
        var headings = Array.from(html.matchAll(headingPattern));
        // Pre-process headings to find which verses they belong to
        var headingsByVerse = new Map();
        headings.forEach(function (headingMatch) {
            var headingPosition = html.indexOf(headingMatch[0]);
            // Find the next verse after this heading
            for (var i = 0; i < verseSpans.length; i++) {
                if (verseSpans[i].position > headingPosition) {
                    headingsByVerse.set(i, {
                        heading: _this.stripHtmlTags(headingMatch[2]),
                        headingId: headingMatch[1]
                    });
                    break;
                }
            }
        });
        this.debug('Headings found:', headings.length);
        this.debug('Headings by verse:', Array.from(headingsByVerse.entries()));
        verseSpans.forEach(function (span, index) {
            var verseHtml = span.content;
            // Extract verse number
            var verseNumber = '';
            var verseText = verseHtml;
            // Check for chapter number (first verse)
            var chapterNumMatch = verseHtml.match(/<span[^>]*class="chapternum"[^>]*>(\d+)\s*<\/span>/);
            if (chapterNumMatch) {
                verseNumber = '1'; // First verse of chapter
                // Remove chapter number from text
                verseText = verseText.replace(chapterNumMatch[0], '');
            }
            else {
                // Look for verse number
                var verseNumMatch = verseHtml.match(/<span[^>]*class="versenum"[^>]*>(\d+)\s*<\/span>/);
                if (verseNumMatch) {
                    verseNumber = verseNumMatch[1];
                    // Remove verse number from text
                    verseText = verseText.replace(verseNumMatch[0], '');
                }
            }
            // Skip if no verse number found
            if (!verseNumber) {
                _this.debug('Skipping content without verse number', { html: verseHtml.substring(0, 100) });
                return;
            }
            // Check if verse text contains red letter (words of Christ)
            var hasRedLetter = /<span[^>]*class="woc"[^>]*>/.test(verseText);
            // Extract plain text
            var plainText = '';
            if (hasRedLetter) {
                // For red letter verses, extract and mark appropriately
                plainText = _this.stripHtmlTags(verseText);
            }
            else {
                plainText = _this.stripHtmlTags(verseText);
            }
            // Check for heading for this verse
            var headingInfo = headingsByVerse.get(index);
            var verse = _this.createVerse(verseNumber, plainText, {
                isFirstVerse: verseNumber === '1',
                isRedLetter: hasRedLetter,
                heading: headingInfo === null || headingInfo === void 0 ? void 0 : headingInfo.heading,
                headingId: headingInfo === null || headingInfo === void 0 ? void 0 : headingInfo.headingId,
                rawHtml: verseHtml // Preserve for potential custom rendering
            });
            verses.push(verse);
        });
        // If no verses found, log error
        if (verses.length === 0) {
            this.debug('ERROR: No verses found in ESV HTML');
            this.debug('Full HTML:', html);
        }
        return verses;
    };
    /**
     * Extract all span.text elements with their full content, handling nested spans
     */
    ESVBibleParser.prototype.extractVerseSpans = function (html) {
        var spans = [];
        var openTagPattern = /<span[^>]*class="text[^"]*"[^>]*>/g;
        var openTags = Array.from(html.matchAll(openTagPattern));
        openTags.forEach(function (openTag) {
            var startIndex = openTag.index;
            var contentStart = startIndex + openTag[0].length;
            var depth = 1;
            var currentIndex = contentStart;
            while (depth > 0 && currentIndex < html.length) {
                var nextOpen = html.indexOf('<span', currentIndex);
                var nextClose = html.indexOf('</span>', currentIndex);
                if (nextClose === -1)
                    break;
                if (nextOpen !== -1 && nextOpen < nextClose) {
                    depth++;
                    currentIndex = nextOpen + 1;
                }
                else {
                    depth--;
                    if (depth === 0) {
                        var content = html.substring(contentStart, nextClose);
                        spans.push({ content: content, position: startIndex });
                    }
                    currentIndex = nextClose + 1;
                }
            }
        });
        return spans;
    };
    /**
     * Parse ESV HTML that uses the new paragraph structure with <b> tags
     * New format: <p><b class="chapter-num">1:1&nbsp;</b>verse text...</p>
     */
    ESVBibleParser.prototype.parseESVParagraphs = function (html, chapterNumber, isPsalm) {
        var _this = this;
        if (isPsalm === void 0) { isPsalm = false; }
        var verses = [];
        this.debug('Trying paragraph parsing...');
        // First, get all section headings and their positions
        var headingPattern = /<h3[^>]*id="([^"]*)"[^>]*>(.*?)<\/h3>/gs;
        var headings = Array.from(html.matchAll(headingPattern));
        var headingPositions = headings.map(function (h) { return ({
            position: html.indexOf(h[0]),
            heading: _this.stripHtmlTags(h[2]),
            headingId: h[1]
        }); });
        // Match paragraphs - handle both regular and block-indent paragraphs
        var paragraphPattern = /<p[^>]*>(.*?)<\/p>/gs;
        var paragraphs = Array.from(html.matchAll(paragraphPattern));
        this.debug('Paragraphs found:', paragraphs.length);
        paragraphs.forEach(function (match) {
            var paragraphHtml = match[1];
            var paragraphPosition = html.indexOf(match[0]);
            // Skip ESV copyright paragraph
            if (paragraphHtml.includes('class="copyright"')) {
                return;
            }
            // Find the heading for this paragraph (if any)
            var currentHeading = null;
            for (var i = headingPositions.length - 1; i >= 0; i--) {
                if (headingPositions[i].position < paragraphPosition) {
                    currentHeading = headingPositions[i];
                    break;
                }
            }
            // For Psalms with line-based structure, we need to handle span.line elements
            if (isPsalm && paragraphHtml.includes('class="line"')) {
                // Parse line-based Psalm structure
                var linePattern = /<span[^>]*class="[^"]*line[^"]*"[^>]*>(.*?)<\/span>/gs;
                var lines_1 = Array.from(paragraphHtml.matchAll(linePattern));
                // Check for end-line-group markers to detect stanza breaks
                var endLineGroupPattern = /<span[^>]*class="end-line-group"[^>]*><\/span>/g;
                var stanzaBreakPositions_1 = new Set();
                var match_1;
                while ((match_1 = endLineGroupPattern.exec(paragraphHtml)) !== null) {
                    // Find which line precedes this end-line-group marker
                    for (var i = lines_1.length - 1; i >= 0; i--) {
                        var lineEnd = paragraphHtml.indexOf(lines_1[i][0]) + lines_1[i][0].length;
                        if (lineEnd < match_1.index) {
                            stanzaBreakPositions_1.add(i);
                            break;
                        }
                    }
                }
                var processedLines_1 = new Set();
                lines_1.forEach(function (lineMatch, lineIndex) {
                    var _a;
                    // Skip if we've already processed this line as part of a previous verse
                    if (processedLines_1.has(lineIndex)) {
                        return;
                    }
                    var lineHtml = lineMatch[1];
                    var isIndentLine = lineMatch[0].includes('indent line');
                    // Look for verse numbers in this line
                    var verseNumPattern = /<b[^>]*class="[^"]*(chapter-num|verse-num)[^"]*"[^>]*>([^<]+)<\/b>/g;
                    var verseNumMatch = verseNumPattern.exec(lineHtml);
                    if (verseNumMatch) {
                        var fullMatch = verseNumMatch[0], numClass = verseNumMatch[1], verseRef = verseNumMatch[2];
                        var verseNumber = '';
                        if (numClass.includes('chapter-num')) {
                            // Extract verse number from format like "105:1&nbsp;"
                            var chapterVerseMatch = verseRef.match(/\d+:(\d+)/);
                            verseNumber = chapterVerseMatch ? chapterVerseMatch[1] : '1';
                        }
                        else {
                            // Regular verse number
                            verseNumber = ((_a = verseRef.match(/\d+/)) === null || _a === void 0 ? void 0 : _a[0]) || '';
                        }
                        // Get text after verse number
                        var textAfterVerseNum = lineHtml.substring(lineHtml.indexOf(fullMatch) + fullMatch.length);
                        var verseText = _this.stripHtmlTags(textAfterVerseNum).trim();
                        // Only add initial text to verseLines if it's not empty
                        var verseLines = verseText ? [verseText] : [];
                        // If this is an indent line without a verse number, it's continuation of previous verse
                        // We need to append it to the previous verse
                        if (verses.length > 0 && !verseNumber && isIndentLine) {
                            var lastVerse = verses[verses.length - 1];
                            if (lastVerse.lines) {
                                lastVerse.lines.push(verseText);
                            }
                            else {
                                lastVerse.text += ' ' + verseText;
                            }
                            return;
                        }
                        // For verses with both regular and indent lines, we need to collect all lines
                        // Look ahead to collect all lines belonging to this verse
                        var nextLineIndex = lineIndex + 1;
                        while (nextLineIndex < lines_1.length) {
                            var nextLine = lines_1[nextLineIndex];
                            var nextLineHtml = nextLine[1];
                            var isNextLineIndented = nextLine[0].includes('indent line');
                            // Check if this line belongs to the current verse (no verse number)
                            if (!/<b[^>]*class="[^"]*verse-num/.test(nextLineHtml) &&
                                !/<b[^>]*class="[^"]*chapter-num/.test(nextLineHtml)) {
                                var lineText = _this.stripHtmlTags(nextLineHtml).trim();
                                if (lineText) {
                                    verseLines.push(lineText);
                                }
                                // Mark this line as processed
                                processedLines_1.add(nextLineIndex);
                                nextLineIndex++;
                            }
                            else {
                                // Found the start of next verse, stop collecting lines
                                break;
                            }
                        }
                        // Mark current line as processed
                        processedLines_1.add(lineIndex);
                        // Combine text for backward compatibility
                        verseText = verseLines.join(' ');
                        // Create verse if we have a verse number and any text (initial or collected)
                        if (verseNumber && (verseText || verseLines.length > 0)) {
                            var isFirstVerse = verseNumber === '1';
                            var poetryIndentLevel = isIndentLine ? 1 : 0;
                            // Check for Selah
                            var isSelah = /\bSelah\b/i.test(verseText);
                            // Add heading only to the first verse after a heading
                            var shouldAddHeading = currentHeading &&
                                !verses.some(function (v) { return v.heading === currentHeading.heading; });
                            verses.push(_this.createVerse(verseNumber, verseText, {
                                isFirstVerse: isFirstVerse,
                                isRedLetter: false, // ESV HTML doesn't include red letter in Psalms
                                heading: shouldAddHeading && currentHeading ? currentHeading.heading : undefined,
                                headingId: shouldAddHeading && currentHeading ? currentHeading.headingId : undefined,
                                isSelah: isSelah || undefined,
                                poetryIndentLevel: poetryIndentLevel || undefined,
                                // Check if this verse ends a stanza
                                stanzaBreakAfter: stanzaBreakPositions_1.has(lineIndex) ? true : undefined,
                                lines: verseLines.length > 0 ? verseLines : undefined
                            }));
                        }
                    }
                    else if (verses.length > 0) {
                        // This is a line without a verse number - append to previous verse
                        var lastVerse = verses[verses.length - 1];
                        var additionalText = _this.stripHtmlTags(lineHtml).trim();
                        if (additionalText) {
                            // If the verse has lines array, add to it; otherwise append to text
                            if (lastVerse.lines) {
                                lastVerse.lines.push(additionalText);
                                // Also update the combined text for backward compatibility
                                lastVerse.text = lastVerse.lines.join(' ');
                            }
                            else {
                                lastVerse.text += ' ' + additionalText;
                            }
                        }
                        // Check if this line ends a stanza
                        if (stanzaBreakPositions_1.has(lineIndex)) {
                            lastVerse.stanzaBreakAfter = true;
                        }
                    }
                });
            }
            else {
                // Original paragraph parsing for non-line-based content
                // Process verses in this paragraph
                var versePattern = /<b[^>]*class="[^"]*(chapter-num|verse-num)[^"]*"[^>]*>([^<]+)<\/b>/g;
                var verseMatches_1 = Array.from(paragraphHtml.matchAll(versePattern));
                if (verseMatches_1.length === 0) {
                    // No verse numbers found, skip this paragraph
                    return;
                }
                // Track if this is the first verse in the paragraph (for heading assignment)
                var isFirstInParagraph_1 = true;
                verseMatches_1.forEach(function (verseMatch, index) {
                    var _a;
                    var fullMatch = verseMatch[0], numClass = verseMatch[1], verseRef = verseMatch[2];
                    var verseNumber = '';
                    var verseText = '';
                    if (numClass.includes('chapter-num')) {
                        // Extract verse number from format like "1:1&nbsp;"
                        var chapterVerseMatch = verseRef.match(/\d+:(\d+)/);
                        verseNumber = chapterVerseMatch ? chapterVerseMatch[1] : '1';
                    }
                    else {
                        // Regular verse number
                        verseNumber = ((_a = verseRef.match(/\d+/)) === null || _a === void 0 ? void 0 : _a[0]) || '';
                    }
                    // Get the text after this verse number until the next verse number or end of paragraph
                    var currentIndex = paragraphHtml.indexOf(fullMatch) + fullMatch.length;
                    var endIndex = paragraphHtml.length;
                    // Find the next verse number if exists
                    if (index < verseMatches_1.length - 1) {
                        endIndex = paragraphHtml.indexOf(verseMatches_1[index + 1][0]);
                    }
                    // Extract text from current position to next verse
                    verseText = paragraphHtml.substring(currentIndex, endIndex);
                    // Check if text contains red letter before stripping tags
                    var hasRedLetter = /<span[^>]*class="woc"[^>]*>/.test(verseText);
                    // Check for Psalm-specific elements
                    var isSelah = false;
                    var cleanedVerseText = verseText;
                    if (isPsalm) {
                        // Check for Selah
                        isSelah = /\bSelah\b/i.test(verseText);
                    }
                    // Clean up the verse text
                    cleanedVerseText = _this.stripHtmlTags(cleanedVerseText).trim();
                    if (verseNumber && cleanedVerseText) {
                        var isFirstVerse = verseNumber === '1';
                        // Add heading only to the first verse in the paragraph after a heading
                        var shouldAddHeading = currentHeading && isFirstInParagraph_1 &&
                            !verses.some(function (v) { return v.heading === currentHeading.heading; });
                        verses.push(_this.createVerse(verseNumber, cleanedVerseText, {
                            isFirstVerse: isFirstVerse,
                            isRedLetter: hasRedLetter,
                            heading: shouldAddHeading && currentHeading ? currentHeading.heading : undefined,
                            headingId: shouldAddHeading && currentHeading ? currentHeading.headingId : undefined,
                            isSelah: isSelah || undefined,
                            // For ESV, paragraphs often indicate stanza breaks in Psalms
                            stanzaBreakAfter: isPsalm && index === verseMatches_1.length - 1 ? true : undefined
                        }));
                        isFirstInParagraph_1 = false;
                    }
                });
            }
        });
        return verses;
    };
    /**
     * Extract Psalm-specific metadata from ESV HTML
     */
    ESVBibleParser.prototype.extractPsalmMetadata = function (html, chapterNumber) {
        var metadata = {
            psalmNumber: chapterNumber,
            hasSelah: /\bSelah\b/i.test(html)
        };
        // Look for superscription in h3 tag at the beginning
        // ESV puts Psalm titles in h3 tags with specific formatting
        var superscriptionMatch = html.match(/<h3[^>]*>(.*?)<\/h3>/);
        if (superscriptionMatch) {
            var superscriptionText = this.stripHtmlTags(superscriptionMatch[1]).trim();
            // Check if this is actually a superscription (not a section heading)
            // Superscriptions typically mention "Psalm" or start with "To the" or "A" or "Of"
            if (/^(To the|A |Of |When |For |In |The )/i.test(superscriptionText) ||
                /Psalm/i.test(superscriptionText)) {
                metadata.superscription = superscriptionText;
                // Extract musical notation if present
                var musicalMatch = superscriptionText.match(/(To the choirmaster[^.]*)/i);
                if (musicalMatch) {
                    metadata.musicalNotation = musicalMatch[1];
                }
            }
        }
        // Extract section headings (h3 tags that aren't superscriptions)
        var sectionHeadings = [];
        var headingPattern = /<h3[^>]*>(.*?)<\/h3>/gs;
        var headings = Array.from(html.matchAll(headingPattern));
        // Skip the first h3 if it's the superscription
        var startIndex = metadata.superscription ? 1 : 0;
        for (var i = startIndex; i < headings.length; i++) {
            var headingText = this.stripHtmlTags(headings[i][1]).trim();
            // Find which verse this heading appears after
            var headingPosition = html.indexOf(headings[i][0]);
            var beforeHeading = html.substring(0, headingPosition);
            var verseMatches = beforeHeading.match(/<b[^>]*class="(chapter-num|verse-num)"[^>]*>([^<]+)<\/b>/g);
            if (verseMatches && verseMatches.length > 0) {
                var lastVerseMatch = verseMatches[verseMatches.length - 1];
                var verseNumber = this.extractVerseNumber(lastVerseMatch);
                sectionHeadings.push({
                    afterVerse: verseNumber,
                    heading: headingText
                });
            }
        }
        if (sectionHeadings.length > 0) {
            metadata.sectionHeadings = sectionHeadings;
        }
        return metadata;
    };
    /**
     * Helper to extract verse number from ESV verse markup
     */
    ESVBibleParser.prototype.extractVerseNumber = function (verseMarkup) {
        // Handle chapter-num format like "1:1"
        var chapterVerseMatch = verseMarkup.match(/\d+:(\d+)/);
        if (chapterVerseMatch) {
            return chapterVerseMatch[1];
        }
        // Handle regular verse-num format
        var verseMatch = verseMarkup.match(/>(\d+)/);
        return verseMatch ? verseMatch[1] : '1';
    };
    return ESVBibleParser;
}(base_parser_1.BaseBibleParser));
exports.ESVBibleParser = ESVBibleParser;
