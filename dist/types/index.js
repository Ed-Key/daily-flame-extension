"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIBLE_VERSIONS = void 0;
// Bible translation mappings
exports.BIBLE_VERSIONS = {
    'KJV': 'de4e12af7f28f599-02',
    'ASV': '06125adad2d5898a-01',
    'ESV': 'ESV', // Special case - uses different API
    'NLT': 'NLT', // Special case - uses different API
    'WEB': '9879dbb7cfe39e4d-04',
    'WEB_BRITISH': '7142879509583d59-04',
    'WEB_UPDATED': '72f4e6dc683324df-03'
};
// Export unified Bible format types
__exportStar(require("./bible-formats"), exports);
