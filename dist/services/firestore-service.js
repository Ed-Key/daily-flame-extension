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
exports.FirestoreService = void 0;
var firestore_1 = require("firebase/firestore");
var firebase_config_1 = require("./firebase-config");
var date_utils_1 = require("../utils/date-utils");
var FirestoreService = /** @class */ (function () {
    function FirestoreService() {
    }
    /**
     * Get verse for a specific date
     */
    FirestoreService.getVerseByDate = function (date) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, verseDoc, verseData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        cached = this.cachedVerses.get(date);
                        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
                            return [2 /*return*/, cached.data];
                        }
                        return [4 /*yield*/, (0, firestore_1.getDoc)((0, firestore_1.doc)(firebase_config_1.db, this.VERSES_COLLECTION, date))];
                    case 1:
                        verseDoc = _a.sent();
                        if (!verseDoc.exists()) {
                            console.log("No verse found for date: ".concat(date));
                            return [2 /*return*/, null];
                        }
                        verseData = verseDoc.data();
                        // Update cache
                        this.cachedVerses.set(date, {
                            data: verseData,
                            timestamp: Date.now()
                        });
                        return [2 /*return*/, verseData];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error fetching verse from Firestore:', error_1);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get today's verse using local timezone
     */
    FirestoreService.getTodaysVerse = function () {
        return __awaiter(this, void 0, void 0, function () {
            var today;
            return __generator(this, function (_a) {
                today = (0, date_utils_1.getLocalDateString)();
                return [2 /*return*/, this.getVerseByDate(today)];
            });
        });
    };
    /**
     * Get all verses (for fallback or admin purposes)
     */
    FirestoreService.getAllVerses = function () {
        return __awaiter(this, void 0, void 0, function () {
            var versesQuery, snapshot, verses_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        versesQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, this.VERSES_COLLECTION), (0, firestore_1.orderBy)('order', 'asc'));
                        return [4 /*yield*/, (0, firestore_1.getDocs)(versesQuery)];
                    case 1:
                        snapshot = _a.sent();
                        verses_1 = [];
                        snapshot.forEach(function (doc) {
                            verses_1.push(__assign(__assign({}, doc.data()), { 
                                // Ensure the date is included if it's the document ID
                                date: doc.id }));
                        });
                        return [2 /*return*/, verses_1];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error fetching all verses from Firestore:', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get verses for a date range
     */
    FirestoreService.getVersesInRange = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var versesQuery, snapshot, verses_2, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        versesQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, this.VERSES_COLLECTION), (0, firestore_1.where)('__name__', '>=', startDate), (0, firestore_1.where)('__name__', '<=', endDate), (0, firestore_1.orderBy)('__name__'));
                        return [4 /*yield*/, (0, firestore_1.getDocs)(versesQuery)];
                    case 1:
                        snapshot = _a.sent();
                        verses_2 = [];
                        snapshot.forEach(function (doc) {
                            verses_2.push(doc.data());
                        });
                        return [2 /*return*/, verses_2];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error fetching verses in range:', error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear cache (useful for testing or forcing refresh)
     */
    FirestoreService.clearCache = function () {
        this.cachedVerses.clear();
    };
    /**
     * Check if Firestore is available (for offline handling)
     */
    FirestoreService.isAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testQuery, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        testQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, this.VERSES_COLLECTION), (0, firestore_1.limit)(1));
                        return [4 /*yield*/, (0, firestore_1.getDocs)(testQuery)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Firestore not available:', error_4);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save user preferences to Firestore
     */
    FirestoreService.saveUserPreferences = function (userId, preferences) {
        return __awaiter(this, void 0, void 0, function () {
            var userDocRef, preferencesWithTimestamp, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userDocRef = (0, firestore_1.doc)(firebase_config_1.db, 'users', userId);
                        preferencesWithTimestamp = __assign(__assign({}, preferences), { lastModified: Date.now(), lastSynced: Date.now() });
                        // Use merge to only update specified fields
                        return [4 /*yield*/, (0, firestore_1.setDoc)(userDocRef, {
                                preferences: preferencesWithTimestamp
                            }, { merge: true })];
                    case 1:
                        // Use merge to only update specified fields
                        _a.sent();
                        console.log('Preferences saved to Firestore:', preferencesWithTimestamp);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error saving preferences to Firestore:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get user preferences from Firestore
     */
    FirestoreService.getUserPreferences = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userDocRef, userDoc, data, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userDocRef = (0, firestore_1.doc)(firebase_config_1.db, 'users', userId);
                        return [4 /*yield*/, (0, firestore_1.getDoc)(userDocRef)];
                    case 1:
                        userDoc = _a.sent();
                        if (!userDoc.exists()) {
                            console.log('No user preferences found in Firestore');
                            return [2 /*return*/, null];
                        }
                        data = userDoc.data();
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.preferences) || null];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error fetching user preferences from Firestore:', error_6);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FirestoreService.VERSES_COLLECTION = 'dailyVerses';
    FirestoreService.cachedVerses = new Map();
    FirestoreService.CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
    return FirestoreService;
}());
exports.FirestoreService = FirestoreService;
