/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!********************************!*\
  !*** ./src/content/monitor.ts ***!
  \********************************/

// Minimal monitor script - only checks if verse should be shown
// No heavy imports - just Chrome API calls
console.log('Daily Flame: Monitor initialized');
async function checkAndLoadVerse() {
    try {
        // Check if verse was already shown today
        const result = await chrome.storage.local.get(['verseShownDate']);
        const today = new Date().toISOString().split("T")[0];
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

/******/ })()
;
//# sourceMappingURL=content.js.map