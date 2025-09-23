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
exports.NLTService = void 0;
var NLTService = /** @class */ (function () {
    function NLTService() {
    }
    NLTService.getVerse = function (reference) {
        return __awaiter(this, void 0, void 0, function () {
            var nltReference, url, response, html, verseExportMatch, paragraphs, textParts, _i, paragraphs_1, paragraph, cleanedParagraph, directContent, text, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        nltReference = this.convertToNLTFormat(reference);
                        url = "".concat(this.BASE_URL, "/passages?ref=").concat(encodeURIComponent(nltReference), "&version=NLT&key=").concat(this.API_KEY);
                        return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("NLT API request failed: ".concat(response.status, " - ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.text()];
                    case 2:
                        html = _a.sent();
                        verseExportMatch = html.match(/<verse_export[^>]*>(.*?)<\/verse_export>/s);
                        if (!verseExportMatch || !verseExportMatch[1]) {
                            throw new Error('No verse content found');
                        }
                        paragraphs = verseExportMatch[1].matchAll(/<p[^>]*class="(?:body|poet\d*(?:-vn)?)[^"]*"[^>]*>(.*?)(?:<\/p>|$)/gs);
                        textParts = [];
                        for (_i = 0, paragraphs_1 = paragraphs; _i < paragraphs_1.length; _i++) {
                            paragraph = paragraphs_1[_i];
                            if (paragraph[1]) {
                                cleanedParagraph = paragraph[1]
                                    .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<span[^>]*class="tn-ref"[^>]*>.*?<\/span>.*?<\/span>/g, '') // Remove complete footnote with nested ref span
                                    .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<\/span>/g, '');
                                textParts.push(cleanedParagraph);
                            }
                        }
                        if (textParts.length === 0) {
                            directContent = verseExportMatch[1]
                                .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<span[^>]*class="tn-ref"[^>]*>.*?<\/span>.*?<\/span>/g, '') // Remove complete footnote with nested ref span
                                .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<\/span>/g, '') // Remove simpler footnotes
                                .replace(/<span[^>]*class="vn"[^>]*>\d+<\/span>/g, '') // Remove verse numbers
                                .replace(/<span[^>]*class="red"[^>]*>(.*?)<\/span>/g, '$1') // Keep red letter content
                                .replace(/<[^>]+>/g, ' ') // Replace other tags with spaces
                                .replace(/\s+/g, ' ') // Normalize whitespace
                                .trim();
                            if (directContent) {
                                textParts.push(directContent);
                            }
                            else {
                                throw new Error('No verse content found in paragraphs');
                            }
                        }
                        text = textParts.join(' ')
                            .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<span[^>]*class="tn-ref"[^>]*>.*?<\/span>.*?<\/span>/g, '') // Remove complete footnote with nested ref span
                            .replace(/<a[^>]*class="a-tn"[^>]*>.*?<\/a><span[^>]*class="tn"[^>]*>.*?<\/span>/g, '') // Remove simpler footnotes
                            .replace(/<span[^>]*class="vn"[^>]*>(\d+)<\/span>/g, '') // Remove verse numbers
                            .replace(/<span[^>]*class="red"[^>]*>(.*?)<\/span>/g, '$1') // Keep red letter text
                            .replace(/<[^>]+>/g, '') // Remove all other HTML tags
                            .replace(/\s+/g, ' ') // Normalize whitespace
                            .trim();
                        return [2 /*return*/, {
                                text: text,
                                reference: reference,
                                bibleId: 'NLT'
                            }];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error fetching NLT verse:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    NLTService.getChapterWithRedLetters = function (chapterReference) {
        return __awaiter(this, void 0, void 0, function () {
            var nltReference, url, response, html, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        nltReference = this.convertToNLTFormat(chapterReference);
                        url = "".concat(this.BASE_URL, "/passages?ref=").concat(encodeURIComponent(nltReference), "&version=NLT&key=").concat(this.API_KEY);
                        console.log('NLT Chapter API Call:', {
                            chapterReference: chapterReference,
                            nltReference: nltReference,
                            url: url
                        });
                        return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("NLT API request failed: ".concat(response.status, " - ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.text()];
                    case 2:
                        html = _a.sent();
                        // Return the raw HTML content - it will be parsed in the component
                        return [2 /*return*/, {
                                passages: [{
                                        reference: chapterReference,
                                        content: html
                                    }]
                            }];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error fetching NLT chapter:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    NLTService.convertToNLTFormat = function (reference) {
        // NLT API format discovered through testing:
        // - Books with spaces in names keep the space: "2 Chronicles 7:14" -> "2 Chronicles.7.14"
        // - Single-word books have no spaces: "John 3:16" -> "John.3.16"
        // - Colons become dots: ":" -> "."
        // - Verse ranges keep their dash: "16-17" stays "16-17"
        // First, replace colons with dots
        var formatted = reference.replace(/:/g, '.');
        // For numbered books (1, 2, 3, I, II, III), keep the space after the number
        // This matches patterns like "1 Kings", "2 Chronicles", "3 John", etc.
        if (/^[123I]\s+/.test(formatted)) {
            // Keep the first space after the number, replace others with dots
            var parts = formatted.split(/\s+/);
            if (parts.length >= 2) {
                // Keep space between number and book name
                var bookName = parts[0] + ' ' + parts[1];
                // Add chapter/verse with dots
                var rest = parts.slice(2).join('.');
                formatted = rest ? bookName + '.' + rest : bookName;
            }
        }
        else {
            // For other books, replace all spaces with dots
            formatted = formatted.replace(/\s+/g, '.');
        }
        return formatted;
    };
    NLTService.API_KEY = 'd74333ee-8951-45dc-9925-5074a8ad2f07';
    NLTService.BASE_URL = 'https://api.nlt.to/api';
    return NLTService;
}());
exports.NLTService = NLTService;
