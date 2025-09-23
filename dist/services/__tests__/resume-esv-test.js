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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var verse_service_1 = require("../verse-service");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
// List of verses that failed ESV API calls due to rate limiting
var failedESVVerses = [
    "Galatians 2:20",
    "Jeremiah 29:13",
    "Psalm 56:3",
    "Matthew 6:19",
    "1 John 2:6",
    "Proverbs 16:9",
    "Jeremiah 29:11",
    "2 Timothy 4:7",
    "1 Peter 2:24",
    "Psalm 139:23",
    "Isaiah 40:3",
    "1 Corinthians 13:6",
    "1 Thessalonians 5:11",
    "Philippians 4:4",
    "Isaiah 25:1",
    "John 3:16",
    "Luke 1:37",
    "Hebrews 4:12",
    "Mark 10:14",
    "2 Timothy 1:7",
    "Matthew 19:26",
    "Isaiah 43:2",
    "Colossians 4:2",
    "Psalm 23:4",
    "Matthew 10:20",
    "Luke 6:38",
    "Psalm 68:19",
    "Psalm 9:1",
    "John 8:32",
    "Isaiah 12:2"
];
function testFailedESVVerses() {
    return __awaiter(this, void 0, void 0, function () {
        var results, successCount, failureCount, currentIndex, _i, failedESVVerses_1, verse, startTime, result, duration, error_1, reportPath, timestamp, filename;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n🔄 Resuming ESV API testing for 30 failed verses');
                    console.log('⏳ Using 2-second delay between calls to avoid rate limiting...\n');
                    results = [];
                    successCount = 0;
                    failureCount = 0;
                    currentIndex = 0;
                    _i = 0, failedESVVerses_1 = failedESVVerses;
                    _a.label = 1;
                case 1:
                    if (!(_i < failedESVVerses_1.length)) return [3 /*break*/, 10];
                    verse = failedESVVerses_1[_i];
                    currentIndex++;
                    console.log("[".concat(currentIndex, "/").concat(failedESVVerses.length, "] Testing: ").concat(verse));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 9]);
                    if (!(currentIndex > 1)) return [3 /*break*/, 4];
                    console.log('  ⏳ Waiting 2 seconds...');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    console.log('  🔄 Calling ESV API...');
                    startTime = Date.now();
                    return [4 /*yield*/, verse_service_1.VerseService.getVerse(verse, 'ESV')];
                case 5:
                    result = _a.sent();
                    duration = Date.now() - startTime;
                    console.log("  \u2705 SUCCESS (".concat(duration, "ms)"));
                    console.log("  Preview: \"".concat(result.text.substring(0, 60), "...\""));
                    results.push({
                        verse: verse,
                        success: true,
                        duration: duration,
                        textLength: result.text.length
                    });
                    successCount++;
                    return [3 /*break*/, 9];
                case 6:
                    error_1 = _a.sent();
                    console.log("  \u274C FAILED: ".concat(error_1.message));
                    results.push({
                        verse: verse,
                        success: false,
                        error: error_1.message
                    });
                    failureCount++;
                    if (!error_1.message.includes('429')) return [3 /*break*/, 8];
                    console.log('  ⚠️ Rate limit hit! Waiting 5 seconds before continuing...');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10:
                    // Summary
                    console.log('\n========================================');
                    console.log('📊 ESV RETRY RESULTS:');
                    console.log("\u2705 Successful: ".concat(successCount, "/").concat(failedESVVerses.length));
                    console.log("\u274C Failed: ".concat(failureCount, "/").concat(failedESVVerses.length));
                    console.log("\uD83D\uDCC8 Success Rate: ".concat(Math.round((successCount / failedESVVerses.length) * 100), "%"));
                    reportPath = path.join(__dirname, '../../../test-reports');
                    timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    filename = path.join(reportPath, "esv-retry-results-".concat(timestamp, ".json"));
                    fs.writeFileSync(filename, JSON.stringify({
                        timestamp: new Date().toISOString(),
                        summary: {
                            total: failedESVVerses.length,
                            successful: successCount,
                            failed: failureCount,
                            successRate: Math.round((successCount / failedESVVerses.length) * 100)
                        },
                        results: results
                    }, null, 2));
                    console.log("\n\uD83D\uDCC1 Results saved to: ".concat(filename));
                    return [2 /*return*/];
            }
        });
    });
}
// Run the test
testFailedESVVerses().catch(console.error);
