/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utils/date-utils.ts":
/*!*********************************!*\
  !*** ./src/utils/date-utils.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getDayOfYear: () => (/* binding */ getDayOfYear),
/* harmony export */   getLocalDateString: () => (/* binding */ getLocalDateString),
/* harmony export */   parseLocalDateString: () => (/* binding */ parseLocalDateString)
/* harmony export */ });
/**
 * Date utility functions for DailyFlame
 * Ensures consistent date handling across the application
 */
/**
 * Get the current date in the user's local timezone as YYYY-MM-DD string
 * This ensures verse changes happen at midnight in the user's timezone,
 * not at midnight UTC
 */
function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * Parse a YYYY-MM-DD string into a Date object in local timezone
 * Useful for comparing dates or calculating date differences
 */
function parseLocalDateString(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}
/**
 * Get the day of year (1-365/366) for a given date
 * Used for deterministic verse selection based on date
 */
function getDayOfYear(date = new Date()) {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!********************************!*\
  !*** ./src/content/monitor.ts ***!
  \********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_date_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/date-utils */ "./src/utils/date-utils.ts");
// Minimal monitor script - only checks if verse should be shown
// No heavy imports - just Chrome API calls

console.log('Daily Flame: Monitor initialized');
async function checkAndLoadVerse() {
    try {
        // Check if verse was already shown today
        const result = await chrome.storage.local.get(['verseShownDate']);
        const today = (0,_utils_date_utils__WEBPACK_IMPORTED_MODULE_0__.getLocalDateString)();
        if (result.verseShownDate === today) {
            console.log('Daily Flame: Verse already shown today');
            return; // Exit early - no need to load anything
        }
        // Check if we're on a restricted URL or OAuth page
        const skipSites = [
            "chrome://",
            "chrome-extension://",
            "moz-extension://",
            "extensions",
            "about:",
            "file://",
            // OAuth and authentication URLs
            "accounts.google.com",
            "oauth2.googleapis.com",
            "auth.firebase.com",
            "identitytoolkit.googleapis.com",
            "securetoken.googleapis.com",
            // Microsoft Edge identity redirect
            "login.microsoftonline.com",
            "login.live.com"
        ];
        if (skipSites.some(site => window.location.href.includes(site))) {
            console.log('Daily Flame: Skipping restricted/auth URL:', window.location.href);
            return;
        }
        console.log('Daily Flame: Loading verse module...');
        // Send message to background script to inject verse app
        chrome.runtime.sendMessage({ action: 'injectVerseApp' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Daily Flame: Failed to inject verse app:', chrome.runtime.lastError);
                return;
            }
            if (response && response.success) {
                console.log('Daily Flame: Verse app injected successfully');
                // The injected script will handle initialization
            }
            else {
                console.error('Daily Flame: Failed to inject verse app:', response?.error || 'Unknown error');
            }
        });
    }
    catch (error) {
        console.error('Daily Flame: Error in monitor script:', error);
    }
}
// Check on page load
checkAndLoadVerse();
// Global function to reset and show verse (for extension icon clicks)
window.resetDailyFlame = async function () {
    console.log('Daily Flame: Manual reset triggered');
    try {
        // Clear the storage to force showing verse
        await chrome.storage.local.remove(['verseShownDate']);
        // Send message to background script to inject verse app
        chrome.runtime.sendMessage({ action: 'injectVerseApp' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Daily Flame: Failed to inject verse app:', chrome.runtime.lastError);
                return;
            }
            if (response && response.success) {
                console.log('Daily Flame: Verse app injected after reset');
            }
            else {
                console.error('Daily Flame: Failed to inject verse app:', response?.error || 'Unknown error');
            }
        });
    }
    catch (error) {
        console.error('Daily Flame: Error during reset:', error);
    }
};

})();

/******/ })()
;
//# sourceMappingURL=content.js.map