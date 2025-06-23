import { VerseService } from '../services/verse-service';
import { ChromeMessage, ChromeResponse } from '../types';

// Google Sign-In handler using chrome.identity API
async function handleGoogleSignIn(): Promise<{ token: string; userInfo: any }> {
  console.log('Background: Starting Google Sign-In process');
  
  return new Promise((resolve, reject) => {
    // Force account selection by using 'any' account parameter
    chrome.identity.getAuthToken({ 
      interactive: true,
      account: { id: 'any' } as any // Force account picker
    }, async (result) => {
      if (chrome.runtime.lastError || !result) {
        console.error('Background: Google Sign-In failed', chrome.runtime.lastError);
        reject(new Error(chrome.runtime.lastError?.message || 'Failed to get auth token'));
        return;
      }
      
      // Extract token from result (could be string or object depending on API version)
      const authToken = typeof result === 'string' ? result : result.token;
      if (!authToken) {
        reject(new Error('No auth token received'));
        return;
      }
      
      console.log('Background: Google Sign-In successful, token received');
      
      // Fetch user info from Google API to get profile photo and details
      try {
        const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authToken}`);
        
        if (!userInfoResponse.ok) {
          console.warn('Background: Failed to fetch user info, proceeding with token only');
          resolve({ token: authToken, userInfo: null });
          return;
        }
        
        const userInfo = await userInfoResponse.json();
        console.log('Background: User info fetched successfully');
        resolve({ token: authToken, userInfo });
      } catch (error) {
        console.warn('Background: Error fetching user info:', error);
        resolve({ token: authToken, userInfo: null });
      }
    });
  });
}

// Clear all cached auth tokens for testing different accounts
async function clearAuthTokens(): Promise<void> {
  console.log('Background: Clearing all cached auth tokens');
  
  return new Promise((resolve, reject) => {
    // First, try to get current token to revoke it
    chrome.identity.getAuthToken({ interactive: false }, (result) => {
      const token = typeof result === 'string' ? result : result?.token;
      if (token) {
        // Revoke the token first
        chrome.identity.removeCachedAuthToken({ token }, () => {
          console.log('Background: Removed cached token');
        });
      }
      
      // Then clear all cached tokens
      chrome.identity.clearAllCachedAuthTokens(() => {
        if (chrome.runtime.lastError) {
          console.error('Background: Error clearing auth tokens', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        console.log('Background: All auth tokens cleared successfully');
        resolve();
      });
    });
  });
}


// Handle messages from content script and other parts of the extension
chrome.runtime.onMessage.addListener((request: ChromeMessage, sender, sendResponse) => {
    if (request.action === 'getVerseShownDate') {
        const today = new Date().toISOString().split("T")[0];
        chrome.storage.local.get("verseShownDate", ({ verseShownDate }) => {
            sendResponse({ 
                success: true,
                verseShownDate: verseShownDate, 
                today: today,
                shouldShow: verseShownDate !== today 
            } as ChromeResponse);
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'setVerseShownDate') {
        const today = new Date().toISOString().split("T")[0];
        chrome.storage.local.set({ verseShownDate: today }, () => {
            console.log('Daily Flame: Verse shown for', today);
            sendResponse({ success: true } as ChromeResponse);
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'clearStorage') {
        chrome.storage.local.clear(() => {
            console.log('Daily Flame: Storage cleared');
            sendResponse({ success: true } as ChromeResponse);
        });
        return true;
    }
    
    if (request.action === 'getDailyVerse') {
        VerseService.getDailyVerse()
            .then(verse => {
                sendResponse({ success: true, verse: verse } as ChromeResponse);
            })
            .catch(error => {
                console.error('Error fetching daily verse:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'getVerse') {
        VerseService.getVerse(request.reference, request.bibleId)
            .then(verse => {
                sendResponse({ success: true, verse: verse } as ChromeResponse);
            })
            .catch(error => {
                console.error('Error fetching verse:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'saveVerses') {
        VerseService.saveVerses(request.verses)
            .then(() => {
                sendResponse({ success: true } as ChromeResponse);
            })
            .catch(error => {
                console.error('Error saving verses:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'getStoredVerses') {
        VerseService.getStoredVerses()
            .then(verses => {
                sendResponse({ success: true, verses: verses } as ChromeResponse);
            })
            .catch(error => {
                console.error('Error getting stored verses:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'googleSignIn') {
        handleGoogleSignIn()
            .then(result => {
                sendResponse({ 
                    success: true, 
                    token: result.token, 
                    userInfo: result.userInfo 
                } as ChromeResponse);
            })
            .catch(error => {
                console.error('Background: Error with Google sign-in:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'clearAuthTokens') {
        clearAuthTokens()
            .then(() => {
                sendResponse({ success: true } as ChromeResponse);
            })
            .catch(error => {
                console.error('Background: Error clearing auth tokens:', error);
                sendResponse({ success: false, error: error.message } as ChromeResponse);
            });
        return true; // Keep message channel open for async response
    }

});

// Handle extension icon clicks - always show verse overlay first
chrome.action.onClicked.addListener((tab) => {
    if (!tab.id || !tab.url) {
        console.log('Background: No tab ID or URL available');
        return;
    }

    // For restricted URLs, open a new tab with a regular website
    const skipSites = ["chrome://", "chrome-extension://", "moz-extension://", "extensions", "about:", "file://"];
    if (skipSites.some(site => tab.url!.includes(site))) {
        console.log('Background: Cannot inject into restricted URL, opening new tab:', tab.url);
        chrome.tabs.create({ url: 'https://www.google.com' }, (newTab) => {
            if (newTab.id) {
                // Wait a moment for the tab to load, then show verse overlay
                setTimeout(() => {
                    chrome.scripting.executeScript({
                        target: { tabId: newTab.id! },
                        func: () => {
                            // Clear storage and show verse overlay
                            if (typeof (window as any).resetDailyFlame === 'function') {
                                (window as any).resetDailyFlame();
                            }
                        }
                    }).catch((error) => {
                        console.error('Background: Error injecting script in new tab:', error);
                    });
                }, 1500);
            }
        });
        return;
    }

    try {
        // For regular URLs, inject content script to show verse overlay
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Always show verse overlay first when icon is clicked (clear storage to force show)
                if (typeof (window as any).resetDailyFlame === 'function') {
                    (window as any).resetDailyFlame();
                }
            }
        }).catch((error) => {
            console.error('Background: Error injecting script:', error);
        });
    } catch (error) {
        console.error('Background: Failed to execute script on tab:', tab.url, error);
    }
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('Daily Flame extension installed');
});