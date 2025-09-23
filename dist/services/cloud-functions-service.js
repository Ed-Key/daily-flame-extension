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
/**
 * Service to handle Firestore operations via iframe
 * The iframe (auth-handler.js) has Firebase Auth context and can access Firestore directly
 * This service just sends messages to the iframe and receives responses
 */
var CloudFunctionsService = /** @class */ (function () {
    function CloudFunctionsService() {
    }
    /**
     * Save user preferences to Firestore via iframe
     * @param preferences The user preferences to sync
     * @param user The authenticated Firebase user
     */
    CloudFunctionsService.syncPreferences = function (preferences, user) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('CloudFunctionsService: Sending preferences to iframe for saving');
                        if (!user) {
                            console.error('CloudFunctionsService: No user provided');
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, chrome.runtime.sendMessage({
                                action: 'savePreferencesToIframe',
                                data: {
                                    preferences: preferences,
                                    userId: user.uid
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        if (response && response.success) {
                            console.log('CloudFunctionsService: ✅ Preferences saved successfully');
                            return [2 /*return*/, true];
                        }
                        else {
                            console.error('CloudFunctionsService: ❌ Failed to save preferences:', response === null || response === void 0 ? void 0 : response.error);
                            return [2 /*return*/, false];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('CloudFunctionsService: Error saving preferences:', error_1);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load user preferences from Firestore via iframe
     * @param user The authenticated Firebase user
     */
    CloudFunctionsService.getPreferences = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('CloudFunctionsService: Requesting preferences from iframe');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, chrome.runtime.sendMessage({
                                action: 'loadPreferencesFromIframe',
                                data: {
                                    userId: user === null || user === void 0 ? void 0 : user.uid
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        if (response && response.success) {
                            if (response.exists && response.preferences) {
                                console.log('CloudFunctionsService: ✅ Preferences loaded successfully');
                                return [2 /*return*/, response.preferences];
                            }
                            else {
                                console.log('CloudFunctionsService: No preferences found in Firestore');
                                return [2 /*return*/, null];
                            }
                        }
                        else {
                            console.error('CloudFunctionsService: ❌ Failed to load preferences:', response === null || response === void 0 ? void 0 : response.error);
                            return [2 /*return*/, null];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('CloudFunctionsService: Error loading preferences:', error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CloudFunctionsService;
}());
exports.default = CloudFunctionsService;
