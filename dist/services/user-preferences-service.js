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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferencesService = void 0;
var cloud_functions_service_1 = __importDefault(require("./cloud-functions-service"));
var UserPreferencesService = /** @class */ (function () {
    function UserPreferencesService() {
    }
    /**
     * Get default preferences
     */
    UserPreferencesService.getDefaultPreferences = function () {
        return {
            bibleTranslation: 'ESV',
            theme: 'dark',
            lastModified: Date.now()
        };
    };
    /**
     * Load preferences (hybrid approach)
     * 1. Return cached if fresh
     * 2. Load from local storage
     * 3. If signed in, fetch from Firebase and merge
     */
    UserPreferencesService.loadPreferences = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var localPrefs, cloudPrefs, localModified, cloudModified, defaults, error_1, error_2, defaults;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check in-memory cache first
                        if (this.cachedPreferences && (Date.now() - this.lastCacheTime) < this.CACHE_DURATION) {
                            console.log('UserPreferences: Using cached preferences');
                            return [2 /*return*/, this.cachedPreferences];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 20, , 21]);
                        return [4 /*yield*/, this.getLocalPreferences()];
                    case 2:
                        localPrefs = _a.sent();
                        // If user is not signed in, use local preferences only
                        if (!user) {
                            console.log('UserPreferences: Using local preferences (not signed in)');
                            this.cachedPreferences = localPrefs;
                            this.lastCacheTime = Date.now();
                            return [2 /*return*/, localPrefs];
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 18, , 19]);
                        return [4 /*yield*/, cloud_functions_service_1.default.getPreferences(user)];
                    case 4:
                        cloudPrefs = _a.sent();
                        if (!cloudPrefs) return [3 /*break*/, 13];
                        if (!localPrefs.isDefault) return [3 /*break*/, 6];
                        // Local is just defaults, always use cloud preferences
                        console.log('UserPreferences: Local is default, using cloud preferences');
                        return [4 /*yield*/, this.saveLocalPreferences(cloudPrefs)];
                    case 5:
                        _a.sent();
                        this.cachedPreferences = cloudPrefs;
                        this.lastCacheTime = Date.now();
                        return [2 /*return*/, cloudPrefs];
                    case 6:
                        localModified = localPrefs.lastModified || 0;
                        cloudModified = cloudPrefs.lastModified || 0;
                        if (!(cloudModified >= localModified)) return [3 /*break*/, 8];
                        // Cloud is newer or same, use cloud preferences
                        console.log('UserPreferences: Using cloud preferences (newer or same)');
                        return [4 /*yield*/, this.saveLocalPreferences(cloudPrefs)];
                    case 7:
                        _a.sent();
                        this.cachedPreferences = cloudPrefs;
                        this.lastCacheTime = Date.now();
                        return [2 /*return*/, cloudPrefs];
                    case 8:
                        if (!!this.arePreferencesEqual(localPrefs, cloudPrefs)) return [3 /*break*/, 10];
                        // Content actually differs, sync to cloud
                        console.log('UserPreferences: Local is newer and different, syncing to cloud');
                        return [4 /*yield*/, this.syncToFirebase(user.uid, localPrefs, user)];
                    case 9:
                        _a.sent();
                        this.cachedPreferences = localPrefs;
                        this.lastCacheTime = Date.now();
                        return [2 /*return*/, localPrefs];
                    case 10:
                        // Content is the same, just use cloud version (don't sync)
                        console.log('UserPreferences: Local is newer but identical to cloud, using cloud');
                        // Update local with cloud to sync timestamps
                        return [4 /*yield*/, this.saveLocalPreferences(cloudPrefs)];
                    case 11:
                        // Update local with cloud to sync timestamps
                        _a.sent();
                        this.cachedPreferences = cloudPrefs;
                        this.lastCacheTime = Date.now();
                        return [2 /*return*/, cloudPrefs];
                    case 12: return [3 /*break*/, 17];
                    case 13:
                        defaults = this.getDefaultPreferences();
                        if (!!this.arePreferencesEqual(localPrefs, defaults)) return [3 /*break*/, 15];
                        console.log('UserPreferences: No cloud preferences, local differs from defaults, syncing');
                        return [4 /*yield*/, this.syncToFirebase(user.uid, localPrefs, user)];
                    case 14:
                        _a.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        console.log('UserPreferences: No cloud preferences, local matches defaults (not syncing)');
                        _a.label = 16;
                    case 16:
                        this.cachedPreferences = localPrefs;
                        this.lastCacheTime = Date.now();
                        return [2 /*return*/, localPrefs];
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        error_1 = _a.sent();
                        console.error('UserPreferences: Error fetching from Firebase, using local:', error_1);
                        this.cachedPreferences = localPrefs;
                        this.lastCacheTime = Date.now();
                        return [2 /*return*/, localPrefs];
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        error_2 = _a.sent();
                        console.error('UserPreferences: Error loading preferences, using defaults:', error_2);
                        defaults = this.getDefaultPreferences();
                        this.cachedPreferences = defaults;
                        this.lastCacheTime = Date.now();
                        return [2 /*return*/, defaults];
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save a preference (hybrid approach)
     */
    UserPreferencesService.savePreference = function (key, value, user) {
        return __awaiter(this, void 0, void 0, function () {
            var currentPrefs, updatedPrefs, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getLocalPreferences()];
                    case 1:
                        currentPrefs = _b.sent();
                        updatedPrefs = __assign(__assign({}, currentPrefs), (_a = {}, _a[key] = value, _a.lastModified = Date.now(), _a));
                        // Save to local storage immediately
                        return [4 /*yield*/, this.saveLocalPreferences(updatedPrefs)];
                    case 2:
                        // Save to local storage immediately
                        _b.sent();
                        // Update cache
                        this.cachedPreferences = updatedPrefs;
                        this.lastCacheTime = Date.now();
                        // If user is signed in, sync to Firebase
                        if (user) {
                            // Don't await this - let it happen in background
                            this.syncToFirebase(user.uid, updatedPrefs, user).catch(function (error) {
                                console.error('UserPreferences: Background sync failed:', error);
                            });
                        }
                        console.log("UserPreferences: Saved ".concat(key, " = ").concat(value));
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        console.error('UserPreferences: Error saving preference:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save Bible translation preference
     */
    UserPreferencesService.saveBibleTranslation = function (translation, user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.savePreference('bibleTranslation', translation, user)];
            });
        });
    };
    /**
     * Save theme preference
     */
    UserPreferencesService.saveTheme = function (theme, user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.savePreference('theme', theme, user)];
            });
        });
    };
    /**
     * Get Bible translation preference
     */
    UserPreferencesService.getBibleTranslation = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var prefs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadPreferences(user)];
                    case 1:
                        prefs = _a.sent();
                        return [2 /*return*/, prefs.bibleTranslation];
                }
            });
        });
    };
    /**
     * Get theme preference
     */
    UserPreferencesService.getTheme = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var prefs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadPreferences(user)];
                    case 1:
                        prefs = _a.sent();
                        return [2 /*return*/, prefs.theme];
                }
            });
        });
    };
    /**
     * Sync all preferences when user signs in
     */
    UserPreferencesService.onSignIn = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var prefs, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('UserPreferences: User signed in, clearing cache and syncing preferences');
                        // Clear cache to force fresh load from cloud
                        this.cachedPreferences = null;
                        this.lastCacheTime = 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.loadPreferences(user)];
                    case 2:
                        prefs = _a.sent();
                        console.log('UserPreferences: Loaded preferences on sign-in:', prefs);
                        // Also migrate old individual preference keys if they exist
                        return [4 /*yield*/, this.migrateOldPreferences(user)];
                    case 3:
                        // Also migrate old individual preference keys if they exist
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        console.error('UserPreferences: Error during sign-in sync:', error_4);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear cache when user signs out
     */
    UserPreferencesService.onSignOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('UserPreferences: User signed out, clearing cache and local storage');
                        this.cachedPreferences = null;
                        this.lastCacheTime = 0;
                        // Clear local storage to ensure fresh load on next sign-in
                        return [4 /*yield*/, chrome.storage.local.remove([this.PREFERENCES_KEY, this.SYNC_TIMESTAMP_KEY])];
                    case 1:
                        // Clear local storage to ensure fresh load on next sign-in
                        _a.sent();
                        console.log('UserPreferences: Local storage cleared');
                        return [2 /*return*/];
                }
            });
        });
    };
    // Private helper methods
    /**
     * Compare two preference objects for equality (ignoring timestamps)
     */
    UserPreferencesService.arePreferencesEqual = function (prefs1, prefs2) {
        // Compare actual preference values, not timestamps
        return prefs1.bibleTranslation === prefs2.bibleTranslation &&
            prefs1.theme === prefs2.theme;
    };
    UserPreferencesService.getLocalPreferences = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        chrome.storage.local.get([_this.PREFERENCES_KEY], function (result) {
                            if (result[_this.PREFERENCES_KEY]) {
                                // User has saved preferences locally
                                resolve(result[_this.PREFERENCES_KEY]);
                            }
                            else {
                                // Check for old preference keys and migrate
                                chrome.storage.local.get(['preferredTranslation', 'themePreference'], function (oldResult) {
                                    var prefs = _this.getDefaultPreferences();
                                    var hasUserModifications = false;
                                    if (oldResult.preferredTranslation) {
                                        prefs.bibleTranslation = oldResult.preferredTranslation;
                                        hasUserModifications = true;
                                    }
                                    if (oldResult.themePreference) {
                                        prefs.theme = oldResult.themePreference;
                                        hasUserModifications = true;
                                    }
                                    // Mark as default if no user modifications were found
                                    if (!hasUserModifications) {
                                        prefs.isDefault = true;
                                    }
                                    resolve(prefs);
                                });
                            }
                        });
                    })];
            });
        });
    };
    UserPreferencesService.saveLocalPreferences = function (preferences) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a;
                        // Remove the isDefault flag when saving (it's no longer default once saved)
                        var prefsToSave = __assign({}, preferences);
                        delete prefsToSave.isDefault;
                        chrome.storage.local.set((_a = {}, _a[_this.PREFERENCES_KEY] = prefsToSave, _a), function () {
                            if (chrome.runtime.lastError) {
                                reject(chrome.runtime.lastError);
                            }
                            else {
                                resolve();
                            }
                        });
                    })];
            });
        });
    };
    UserPreferencesService.syncToFirebase = function (userId, preferences, user) {
        return __awaiter(this, void 0, void 0, function () {
            var success, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('UserPreferences: Starting Cloud Function sync for user:', userId);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, cloud_functions_service_1.default.syncPreferences(preferences, user)];
                    case 2:
                        success = _b.sent();
                        if (!success) return [3 /*break*/, 4];
                        console.log('UserPreferences: ✅ Preferences synced via Cloud Function');
                        // Update sync timestamp in local storage
                        return [4 /*yield*/, chrome.storage.local.set((_a = {},
                                _a[this.SYNC_TIMESTAMP_KEY] = Date.now(),
                                _a))];
                    case 3:
                        // Update sync timestamp in local storage
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        console.error('UserPreferences: ❌ Cloud Function sync failed');
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_5 = _b.sent();
                        console.error('UserPreferences: Failed to sync preferences:', error_5);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    UserPreferencesService.migrateOldPreferences = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        chrome.storage.local.get(['preferredTranslation', 'themePreference'], function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var migrationNeeded, currentPrefs;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        migrationNeeded = false;
                                        return [4 /*yield*/, this.loadPreferences(user)];
                                    case 1:
                                        currentPrefs = _a.sent();
                                        if (result.preferredTranslation && !currentPrefs.bibleTranslation) {
                                            currentPrefs.bibleTranslation = result.preferredTranslation;
                                            migrationNeeded = true;
                                        }
                                        if (result.themePreference && !currentPrefs.theme) {
                                            currentPrefs.theme = result.themePreference;
                                            migrationNeeded = true;
                                        }
                                        if (!migrationNeeded) return [3 /*break*/, 4];
                                        console.log('UserPreferences: Migrating old preferences');
                                        return [4 /*yield*/, this.saveLocalPreferences(currentPrefs)];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, this.syncToFirebase(user.uid, currentPrefs, user)];
                                    case 3:
                                        _a.sent();
                                        // Clean up old keys
                                        chrome.storage.local.remove(['preferredTranslation', 'themePreference']);
                                        _a.label = 4;
                                    case 4:
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    })];
            });
        });
    };
    /**
     * Load preferences from Cloud Function
     */
    UserPreferencesService.loadFromCloud = function (userId, user) {
        return __awaiter(this, void 0, void 0, function () {
            var cloudPrefs, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        console.log('UserPreferences: Loading from cloud for user:', userId);
                        return [4 /*yield*/, cloud_functions_service_1.default.getPreferences(user)];
                    case 1:
                        cloudPrefs = _a.sent();
                        if (!cloudPrefs) return [3 /*break*/, 3];
                        // Save to local storage for offline access
                        return [4 /*yield*/, this.saveLocalPreferences(cloudPrefs)];
                    case 2:
                        // Save to local storage for offline access
                        _a.sent();
                        console.log('UserPreferences: ✅ Loaded from cloud and cached locally');
                        return [2 /*return*/, cloudPrefs];
                    case 3: return [2 /*return*/, null];
                    case 4:
                        error_6 = _a.sent();
                        console.error('UserPreferences: Failed to load from cloud:', error_6);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Force sync preferences (for testing)
     */
    UserPreferencesService.forceSync = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var prefs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user) {
                            console.log('UserPreferences: Cannot force sync without user');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getLocalPreferences()];
                    case 1:
                        prefs = _a.sent();
                        return [4 /*yield*/, this.syncToFirebase(user.uid, prefs, user)];
                    case 2:
                        _a.sent();
                        console.log('UserPreferences: Force sync completed');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear all preferences (for testing)
     */
    UserPreferencesService.clearAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        chrome.storage.local.remove([_this.PREFERENCES_KEY, _this.SYNC_TIMESTAMP_KEY], function () {
                            _this.cachedPreferences = null;
                            _this.lastCacheTime = 0;
                            console.log('UserPreferences: All preferences cleared');
                            resolve();
                        });
                    })];
            });
        });
    };
    UserPreferencesService.PREFERENCES_KEY = 'userPreferences';
    UserPreferencesService.SYNC_TIMESTAMP_KEY = 'preferencesSyncTimestamp';
    UserPreferencesService.CACHE_DURATION = 30 * 1000; // 30 seconds cache (reduced for testing)
    // In-memory cache for current session
    UserPreferencesService.cachedPreferences = null;
    UserPreferencesService.lastCacheTime = 0;
    return UserPreferencesService;
}());
exports.UserPreferencesService = UserPreferencesService;
