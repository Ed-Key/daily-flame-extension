// Simplified background script for Daily Flame Chrome Extension
// Handles message routing and extension functionality

// Offscreen document management
const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

// Track if offscreen document is created
let offscreenDocumentCreated = false;

// Check if offscreen document already exists
async function hasOffscreenDocument(): Promise<boolean> {
  // For simplicity, we'll track it with a flag
  // In production, you might want to use chrome.runtime.getContexts if available
  return offscreenDocumentCreated;
}

// Create offscreen document if it doesn't exist
async function setupOffscreenDocument(): Promise<void> {
  if (await hasOffscreenDocument()) {
    return;
  }
  
  try {
    // @ts-ignore - chrome.offscreen is available with offscreen permission
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH),
      // @ts-ignore
      reasons: ['DOM_SCRAPING'],
      justification: 'Firebase authentication requires DOM access'
    });
    offscreenDocumentCreated = true;
  } catch (error) {
    console.error('Error creating offscreen document:', error);
  }
}

// Close offscreen document
async function closeOffscreenDocument(): Promise<void> {
  if (!(await hasOffscreenDocument())) {
    return;
  }
  
  try {
    // @ts-ignore
    await chrome.offscreen.closeDocument();
    offscreenDocumentCreated = false;
  } catch (error) {
    console.error('Error closing offscreen document:', error);
  }
}

// Store auth state
let currentUser: any = null;

// Handle messages from content script and other parts of the extension
chrome.runtime.onMessage.addListener((request: any, sender, sendResponse) => {
  console.log('Background: Received message:', request.action);
  
  if (request.action === 'injectVerseApp') {
    // Inject the verse app script into the current tab
    if (!sender.tab?.id) {
      sendResponse({ success: false, error: 'No tab ID found' });
      return;
    }
    
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: ['verse-app.js']
    }).then(() => {
      console.log('Background: Verse app injected successfully');
      sendResponse({ success: true });
    }).catch(error => {
      console.error('Background: Failed to inject verse app:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Keep message channel open for async response
  }
  
  // Forward verse-related messages to the content script/verse app
  if (request.action === 'getDailyVerse' || 
      request.action === 'getVerse' || 
      request.action === 'getStoredVerses' ||
      request.action === 'saveVerses') {
    
    // Forward the message to the active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response);
          }
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    
    return true; // Keep message channel open
  }
  
  if (request.action === 'getVerseShownDate') {
    const today = new Date().toISOString().split("T")[0];
    chrome.storage.local.get("verseShownDate", ({ verseShownDate }) => {
      sendResponse({ 
        success: true,
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
  
  if (request.action === 'openAuthTab') {
    // Handle opening authentication tab with offscreen document
    console.log('Background: Opening auth tab with offscreen document');
    
    handleAuthAction(request.authAction, request.authData)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error('Background: Auth error:', error);
        sendResponse({ 
          success: false, 
          error: error.message || 'Authentication failed'
        });
      });
    
    return true; // Keep message channel open for async response
  }
  
  // Handle auth state changes from offscreen document
  if (request.action === 'authStateChanged') {
    currentUser = request.user;
    console.log('Background: Auth state changed:', currentUser ? 'User signed in' : 'User signed out');
    
    // Notify all tabs about auth state change
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'authStateChanged',
            user: currentUser
          }).catch(() => {
            // Ignore errors for tabs that don't have our content script
          });
        }
      });
    });
    
    return false; // No response needed
  }
  
  // Handle direct auth requests
  if (request.action === 'auth') {
    handleAuthAction(request.authAction, request.authData)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error('Background: Auth error:', error);
        sendResponse({ 
          success: false, 
          error: error.message || 'Authentication failed'
        });
      });
    
    return true; // Keep message channel open for async response
  }
  
});

// Handle authentication actions via offscreen document
async function handleAuthAction(action: string, data?: any): Promise<any> {
  await setupOffscreenDocument();
  
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      target: 'offscreen-auth',
      action: action,
      ...data
    }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (!response.success) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
}

// Handle extension icon clicks - always show verse overlay first
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id || !tab.url) {
    console.log('Background: No tab ID or URL available');
    return;
  }

  // For restricted URLs and OAuth pages, open a new tab with a regular website
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
  if (skipSites.some(site => tab.url!.includes(site))) {
    console.log('Background: Cannot inject into restricted/auth URL, opening new tab:', tab.url);
    chrome.tabs.create({ url: 'https://www.google.com' }, (newTab) => {
      if (newTab.id) {
        // Wait a moment for the tab to load, then inject verse app
        setTimeout(() => {
          // Clear storage first
          chrome.storage.local.remove(['verseShownDate'], () => {
            // Then inject the verse app
            chrome.scripting.executeScript({
              target: { tabId: newTab.id! },
              files: ['verse-app.js']
            }).then(() => {
              console.log('Background: Verse app injected in new tab');
            }).catch((error) => {
              console.error('Background: Error injecting verse app in new tab:', error);
            });
          });
        }, 1500);
      }
    });
    return;
  }

  try {
    // First clear the storage to force show
    chrome.storage.local.remove(['verseShownDate'], () => {
      // Then inject the verse app directly
      chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        files: ['verse-app.js']
      }).then(() => {
        console.log('Background: Verse app injected via icon click');
      }).catch((error) => {
        console.error('Background: Error injecting verse app:', error);
      });
    });
  } catch (error) {
    console.error('Background: Failed to execute script on tab:', tab.url, error);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Daily Flame extension installed');
});

console.log('Background script loaded successfully');