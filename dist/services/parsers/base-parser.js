"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBibleParser = void 0;
/**
 * Base class for all Bible translation parsers
 * Provides common utilities for parsing Bible text
 */
var BaseBibleParser = /** @class */ (function () {
    function BaseBibleParser(translation) {
        this.translation = translation;
    }
    /**
     * Get parser name for debugging
     */
    BaseBibleParser.prototype.getName = function () {
        return "".concat(this.translation, "Parser");
    };
    /**
     * Extract book name and chapter number from reference
     * @param reference e.g., "John 3", "1 Corinthians 13"
     * @returns { bookName, chapterNumber }
     */
    BaseBibleParser.prototype.parseReference = function (reference) {
        var match = reference.match(/^(.+?)\s+(\d+)$/);
        if (!match) {
            throw new Error("Invalid chapter reference: ".concat(reference));
        }
        return {
            bookName: match[1].trim(),
            chapterNumber: match[2]
        };
    };
    /**
     * Clean verse text by removing extra whitespace and normalizing
     * @param text Raw verse text
     * @returns Cleaned text
     */
    BaseBibleParser.prototype.cleanVerseText = function (text) {
        return text
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/^\s+|\s+$/g, '') // Trim
            .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
            .replace(/[\r\n]+/g, ' '); // Remove line breaks
    };
    /**
     * Extract text content from HTML, preserving red letter spans
     * @param html HTML string
     * @returns Plain text with red letter markers
     */
    BaseBibleParser.prototype.extractTextFromHtml = function (html) {
        // Check if the entire content is wrapped in red letter tags
        var redLetterMatch = html.match(/<span[^>]*class=["']?(woc|red|words-of-jesus)["']?[^>]*>(.*?)<\/span>/is);
        if (redLetterMatch) {
            return {
                text: this.stripHtmlTags(redLetterMatch[2]),
                isRedLetter: true
            };
        }
        // Otherwise, extract plain text
        return {
            text: this.stripHtmlTags(html),
            isRedLetter: false
        };
    };
    /**
     * Strip HTML tags from text while preserving content
     * @param html HTML string
     * @returns Plain text
     */
    BaseBibleParser.prototype.stripHtmlTags = function (html) {
        return html
            .replace(/<br\s*\/?>/gi, ' ') // Replace br with space
            .replace(/<\/?(p|div|span)[^>]*>/gi, '') // Remove common tags
            .replace(/<[^>]+>/g, '') // Remove all other tags
            .replace(/&nbsp;/gi, ' ') // Replace HTML entities
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/&mdash;/gi, '—')
            .replace(/&[^;]+;/g, ''); // Remove other entities
    };
    /**
     * Create a UnifiedVerse object with defaults
     * @param number Verse number
     * @param text Verse text
     * @param options Additional options
     */
    BaseBibleParser.prototype.createVerse = function (number, text, options) {
        if (options === void 0) { options = {}; }
        // Don't clean text if lines are provided (preserve line breaks for poetry)
        var processedText = options.lines ? text : this.cleanVerseText(text);
        return __assign({ number: number, text: processedText, isRedLetter: false, isFirstVerse: false }, options);
    };
    /**
     * Debug helper to log parsing steps
     * @param step Description of current step
     * @param data Data being processed
     */
    BaseBibleParser.prototype.debug = function (step, data) {
        if (process.env.NODE_ENV === 'development') {
            console.log("[".concat(this.getName(), "] ").concat(step), data);
        }
    };
    return BaseBibleParser;
}());
exports.BaseBibleParser = BaseBibleParser;
