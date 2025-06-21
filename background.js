// Import verse service
importScripts('verse-service.js');

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getVerseShownDate') {
        const today = new Date().toISOString().split("T")[0];
        chrome.storage.local.get("verseShownDate", ({ verseShownDate }) => {
            sendResponse({ 
                verseShownDate: verseShownDate, 
                today: today,
                shouldShow: verseShownDate !== today 
            });
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'setVerseShownDate') {
        const today = new Date().toISOString().split("T")[0];
        chrome.storage.local.set({ verseShownDate: today }, () => {
            console.log('Daily Flame: Verse shown for', today);
            sendResponse({ success: true });
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'clearStorage') {
        chrome.storage.local.clear(() => {
            console.log('Daily Flame: Storage cleared');
            sendResponse({ success: true });
        });
        return true;
    }
    
    if (request.action === 'getDailyVerse') {
        VerseService.getDailyVerse()
            .then(verse => {
                sendResponse({ success: true, verse: verse });
            })
            .catch(error => {
                console.error('Error fetching daily verse:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'getVerse') {
        VerseService.getVerse(request.reference, request.bibleId)
            .then(verse => {
                sendResponse({ success: true, verse: verse });
            })
            .catch(error => {
                console.error('Error fetching verse:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'saveVerses') {
        VerseService.saveVerses(request.verses)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch(error => {
                console.error('Error saving verses:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'getStoredVerses') {
        VerseService.getStoredVerses()
            .then(verses => {
                sendResponse({ success: true, verses: verses });
            })
            .catch(error => {
                console.error('Error getting stored verses:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }
});

// Handle extension icon clicks
chrome.action.onClicked.addListener((tab) => {
    // Create a new tab with the admin interface
    chrome.tabs.create({
        url: chrome.runtime.getURL('admin.html')
    });
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('Daily Flame extension installed');
});