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
exports.ESVService = void 0;
var ESVService = /** @class */ (function () {
    function ESVService() {
    }
    ESVService.getVerse = function (reference) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, data, text, referencePattern, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        url = "".concat(this.BASE_URL, "/passage/text/?q=").concat(encodeURIComponent(reference), "&include-passage-references=false&include-footnotes=false&include-headings=false&include-verse-numbers=false");
                        return [4 /*yield*/, fetch(url, {
                                headers: {
                                    'Authorization': "Token ".concat(this.API_KEY)
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("ESV API request failed: ".concat(response.status, " - ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (!data.passages || data.passages.length === 0) {
                            throw new Error('No verse content found');
                        }
                        text = data.passages[0];
                        referencePattern = new RegExp("^".concat(data.canonical, "\\s*"));
                        text = text.replace(referencePattern, '');
                        // Remove the (ESV) suffix
                        text = text.replace(/\s*\(ESV\)\s*$/, '');
                        // Clean up extra whitespace
                        text = text.trim();
                        return [2 /*return*/, {
                                text: text,
                                reference: data.canonical || reference,
                                bibleId: 'ESV'
                            }];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error fetching ESV verse:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ESVService.getChapter = function (chapterReference) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, data, passageText, verses, verseMatches, _i, verseMatches_1, match, verseNum, verseText, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        url = "".concat(this.BASE_URL, "/passage/text/?q=").concat(encodeURIComponent(chapterReference), "&include-passage-references=false&include-footnotes=false&include-headings=false&include-verse-numbers=true");
                        return [4 /*yield*/, fetch(url, {
                                headers: {
                                    'Authorization': "Token ".concat(this.API_KEY)
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("ESV API request failed: ".concat(response.status, " - ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (!data.passages || data.passages.length === 0) {
                            throw new Error('No chapter content found');
                        }
                        passageText = data.passages[0];
                        verses = [];
                        verseMatches = passageText.matchAll(/\[(\d+)\]\s*([^[]*?)(?=\[|$)/g);
                        for (_i = 0, verseMatches_1 = verseMatches; _i < verseMatches_1.length; _i++) {
                            match = verseMatches_1[_i];
                            verseNum = match[1];
                            verseText = match[2].trim();
                            // Check if this verse contains words of Jesus
                            // In ESV text format, we don't have markup, so we'll need to use the HTML endpoint for red letters
                            verses.push({
                                number: verseNum,
                                text: verseText
                            });
                        }
                        // Return in a format similar to scripture.api.bible
                        return [2 /*return*/, {
                                id: chapterReference,
                                reference: data.canonical,
                                content: [{
                                        items: verses.map(function (v) { return ({
                                            type: 'verse',
                                            number: v.number,
                                            text: v.text
                                        }); })
                                    }],
                                verseCount: verses.length
                            }];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error fetching ESV chapter:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Get chapter with HTML format for red letter support
    ESVService.getChapterWithRedLetters = function (chapterReference) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, data, parser, doc, items_1, chapterNumber_1, elements, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        url = "".concat(this.BASE_URL, "/passage/html/?q=").concat(encodeURIComponent(chapterReference), "&include-passage-references=false&include-footnotes=false&include-headings=true&include-verse-numbers=true&include-audio-link=false");
                        return [4 /*yield*/, fetch(url, {
                                headers: {
                                    'Authorization': "Token ".concat(this.API_KEY)
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("ESV API request failed: ".concat(response.status, " - ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (!data.passages || data.passages.length === 0) {
                            throw new Error('No chapter content found');
                        }
                        parser = new DOMParser();
                        doc = parser.parseFromString(data.passages[0], 'text/html');
                        items_1 = [];
                        chapterNumber_1 = '';
                        elements = doc.querySelectorAll('p, h3');
                        elements.forEach(function (element) {
                            var _a;
                            if (element.tagName === 'H3') {
                                // Add heading
                                items_1.push({
                                    type: 'tag',
                                    name: 'heading',
                                    attrs: { level: '3' },
                                    items: [{
                                            type: 'text',
                                            text: ((_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ''
                                        }]
                                });
                            }
                            else if (element.tagName === 'P') {
                                // Skip the ESV copyright paragraph
                                if (element.querySelector('a.copyright')) {
                                    return;
                                }
                                // Create a paragraph container
                                var paragraphItems_1 = [];
                                // Process all nodes within the paragraph
                                var processNode_1 = function (node) {
                                    var _a, _b, _c, _d;
                                    if (node.nodeType === Node.TEXT_NODE) {
                                        var text = node.textContent || '';
                                        if (text.trim()) {
                                            paragraphItems_1.push({
                                                type: 'text',
                                                text: text
                                            });
                                        }
                                    }
                                    else if (node instanceof Element) {
                                        if (node.classList.contains('chapter-num')) {
                                            // Extract chapter number for display
                                            var match = (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.match(/(\d+):/);
                                            if (match) {
                                                chapterNumber_1 = match[1];
                                            }
                                            // Add verse marker - extract just the verse number after the colon
                                            var verseNum = ((_c = (_b = node.textContent) === null || _b === void 0 ? void 0 : _b.split(':')[1]) === null || _c === void 0 ? void 0 : _c.trim()) || '1';
                                            if (verseNum) {
                                                paragraphItems_1.push({
                                                    type: 'tag',
                                                    name: 'verse',
                                                    attrs: { number: verseNum }
                                                });
                                            }
                                        }
                                        else if (node.classList.contains('verse-num')) {
                                            // Add verse marker
                                            var verseNum = ((_d = node.textContent) === null || _d === void 0 ? void 0 : _d.replace(/[^\d]/g, '')) || '';
                                            if (verseNum) {
                                                paragraphItems_1.push({
                                                    type: 'tag',
                                                    name: 'verse',
                                                    attrs: { number: verseNum }
                                                });
                                            }
                                        }
                                        else if (node.classList.contains('woc')) {
                                            // Words of Christ
                                            paragraphItems_1.push({
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
                                            node.childNodes.forEach(function (child) { return processNode_1(child); });
                                        }
                                    }
                                };
                                // Process all child nodes of the paragraph
                                element.childNodes.forEach(function (node) { return processNode_1(node); });
                                // Add paragraph if it has content
                                if (paragraphItems_1.length > 0) {
                                    items_1.push({
                                        type: 'tag',
                                        name: 'para',
                                        attrs: { style: 'p' },
                                        items: paragraphItems_1
                                    });
                                }
                            }
                        });
                        // Return in a format similar to scripture.api.bible
                        return [2 /*return*/, {
                                id: chapterReference,
                                reference: data.canonical,
                                content: items_1,
                                chapterNumber: chapterNumber_1,
                                verseCount: doc.querySelectorAll('.verse-num, .chapter-num').length
                            }];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error fetching ESV chapter with red letters:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ESVService.API_KEY = 'd74f42aa54c642a4cbfef2a93c5c67f460f13cdb';
    ESVService.BASE_URL = 'https://api.esv.org/v3';
    return ESVService;
}());
exports.ESVService = ESVService;
