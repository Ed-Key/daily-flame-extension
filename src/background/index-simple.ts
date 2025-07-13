// Simplified background script for Daily Flame Chrome Extension
// Handles message routing and extension functionality

import { getLocalDateString } from '../utils/date-utils';

// Offscreen document management
const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

// Track if offscreen document is created
let offscreenDocumentCreated = false;

// Check if offscreen document already exists
async function hasOffscreenDocument(): Promise<boolean> {
  // Check using Chrome API if available (Chrome 114+)
  if ('getContexts' in chrome.runtime) {
    try {
      // @ts-ignore - getContexts is available in newer Chrome versions
      const contexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT' as any]
      });
      return (contexts as any).length > 0;
    } catch (error) {
      console.log('getContexts not available, falling back to flag');
    }
  }
  
  // Fallback to flag tracking
  return offscreenDocumentCreated;
}

// Create offscreen document if it doesn't exist
async function setupOffscreenDocument(): Promise<void> {
  if (await hasOffscreenDocument()) {
    console.log('Offscreen document already exists');
    return;
  }
  
  try {
    console.log('Creating new offscreen document...');
    // @ts-ignore - chrome.offscreen is available with offscreen permission
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH),
      // @ts-ignore
      reasons: ['DOM_SCRAPING'],
      justification: 'Firebase authentication requires DOM access'
    });
    offscreenDocumentCreated = true;
    console.log('Offscreen document created successfully');
    
    // Wait a bit for the document to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error: any) {
    // Handle specific error cases
    if (error?.message?.includes('Only a single offscreen document may be created')) {
      console.log('Offscreen document already exists (caught via error)');
      offscreenDocumentCreated = true;
      return;
    }
    
    console.error('Error creating offscreen document:', error);
    throw error;
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

// Helper function to store auth state in Chrome storage
async function storeAuthState(user: any) {
  if (user) {
    await chrome.storage.local.set({ 
      authUser: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL
      },
      authTimestamp: Date.now()
    });
    console.log('Background: Auth state stored in Chrome storage');
  } else {
    await chrome.storage.local.remove(['authUser', 'authTimestamp']);
    console.log('Background: Auth state cleared from Chrome storage');
  }
}

// Helper function to retrieve auth state from Chrome storage
async function getStoredAuthState() {
  const result = await chrome.storage.local.get(['authUser', 'authTimestamp']);
  if (result.authUser && result.authTimestamp) {
    // Check if auth state is still valid (24 hours)
    const isExpired = Date.now() - result.authTimestamp > 24 * 60 * 60 * 1000;
    if (!isExpired) {
      console.log('Background: Retrieved valid auth state from Chrome storage');
      return result.authUser;
    } else {
      console.log('Background: Stored auth state expired');
      await chrome.storage.local.remove(['authUser', 'authTimestamp']);
    }
  }
  return null;
}

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
  
  
  if (request.action === 'getVerseShownDate') {
    const today = getLocalDateString();
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
    const today = getLocalDateString();
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
        const errorMessage = error instanceof Error ? error.message : 
                           (typeof error === 'string' ? error : 'Authentication failed');
        sendResponse({ 
          success: false, 
          error: errorMessage
        });
      });
    
    return true; // Keep message channel open for async response
  }
  
  // Handle auth state changes from offscreen document
  if (request.action === 'authStateChanged') {
    currentUser = request.user;
    console.log('Background: Auth state changed:', currentUser ? 'User signed in' : 'User signed out');
    
    // Store auth state in Chrome storage
    storeAuthState(currentUser).then(() => {
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
    });
    
    return false; // No response needed
  }
  
  // Handle direct auth requests
  if (request.action === 'auth') {
    // Special handling for getCurrentUser to check stored auth state
    if (request.authAction === 'getCurrentUser') {
      getStoredAuthState().then(storedUser => {
        if (storedUser) {
          currentUser = storedUser;
          sendResponse({ success: true, user: storedUser });
        } else {
          sendResponse({ success: true, user: null });
        }
      }).catch(error => {
        console.error('Background: Error getting stored auth state:', error);
        sendResponse({ success: true, user: null });
      });
      return true;
    }
    
    // Handle sendVerificationEmail
    if (request.authAction === 'sendVerificationEmail') {
      if (!currentUser) {
        sendResponse({ success: false, error: 'No user signed in' });
        return true;
      }
      
      handleAuthAction('sendVerificationEmail', request.authData)
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          console.error('Background: Error sending verification email:', error);
          sendResponse({ 
            success: false, 
            error: error.message || 'Failed to send verification email'
          });
        });
      return true;
    }
    
    handleAuthAction(request.authAction, request.authData)
      .then(result => {
        // If sign-in was successful, store the user
        if (result.success && result.user) {
          currentUser = result.user;
          storeAuthState(result.user);
        }
        
        // If sign-out was successful, clear the stored auth state
        if (result.success && request.authAction === 'signOut') {
          console.log('Background: Clearing auth state after sign-out');
          currentUser = null;
          storeAuthState(null).then(() => {
            // Notify all tabs about sign-out
            chrome.tabs.query({}, (tabs) => {
              tabs.forEach(tab => {
                if (tab.id) {
                  chrome.tabs.sendMessage(tab.id, {
                    action: 'authStateChanged',
                    user: null
                  }).catch(() => {});
                }
              });
            });
          });
        }
        
        sendResponse(result);
      })
      .catch(error => {
        console.error('Background: Auth error:', error);
        const errorMessage = error instanceof Error ? error.message : 
                           (typeof error === 'string' ? error : 'Authentication failed');
        sendResponse({ 
          success: false, 
          error: errorMessage
        });
      });
    
    return true; // Keep message channel open for async response
  }
  
});

// Handle authentication actions via offscreen document
async function handleAuthAction(action: string, data?: any): Promise<any> {
  // Retry logic for offscreen document setup
  let setupAttempts = 0;
  const maxSetupAttempts = 3;
  
  while (setupAttempts < maxSetupAttempts) {
    try {
      await setupOffscreenDocument();
      break;
    } catch (error) {
      setupAttempts++;
      if (setupAttempts >= maxSetupAttempts) {
        throw new Error('Failed to setup offscreen document after multiple attempts');
      }
      console.log(`Retrying offscreen document setup (attempt ${setupAttempts + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * setupAttempts));
    }
  }
  
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      target: 'offscreen-auth',
      action: action,
      ...data
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else if (!response || typeof response !== 'object') {
        console.error('Invalid response from offscreen document:', response);
        reject(new Error('Invalid response from offscreen document'));
      } else if (!response.success) {
        // Enhanced error handling for specific auth errors
        const error = response.error || {};
        const errorCode = error.code || 'unknown';
        let errorMessage = error.message || 'Authentication failed';
        
        // Provide user-friendly error messages
        switch (errorCode) {
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address. Please sign up first.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please sign in instead.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use at least 6 characters.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Pop-up was blocked. Please allow pop-ups for this extension.';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Sign-in was cancelled. Please try again.';
            break;
          case 'iframe-timeout':
            errorMessage = 'Authentication timed out. Please try again.';
            break;
          case 'iframe-not-found':
            errorMessage = 'Authentication system not ready. Please try again in a moment.';
            break;
        }
        
        reject({ code: errorCode, message: errorMessage });
      } else {
        resolve(response);
      }
    });
  });
}

// Periodically verify auth state is still valid
async function verifyAuthState() {
  if (!currentUser) return;
  
  try {
    console.log('Background: Verifying auth state...');
    const result = await handleAuthAction('verifyAuthState', {});
    
    if (!result.isValid) {
      console.log('Background: Auth state is no longer valid, clearing...');
      currentUser = null;
      await chrome.storage.local.remove(['authUser', 'authTimestamp']);
      
      // Notify all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'authStateChanged',
              user: null
            }).catch(() => {});
          }
        });
      });
    }
  } catch (error) {
    console.error('Background: Error verifying auth state:', error);
  }
}

// Set up periodic auth verification (every 5 minutes)
setInterval(verifyAuthState, 5 * 60 * 1000);

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
  
  // Check for stored auth state on extension startup
  getStoredAuthState().then(storedUser => {
    if (storedUser) {
      currentUser = storedUser;
      console.log('Background: Restored auth state from storage');
    }
  });
  
  // Pre-warm offscreen document for faster first sign-in
  console.log('Background: Pre-warming offscreen document');
  setupOffscreenDocument().then(() => {
    console.log('Background: Offscreen document ready');
  }).catch(error => {
    console.error('Background: Failed to pre-warm offscreen document:', error);
  });
});

// Also check auth state when extension starts
getStoredAuthState().then(storedUser => {
  if (storedUser) {
    currentUser = storedUser;
    console.log('Background: Restored auth state on startup');
  }
});

// Pre-warm offscreen document on startup (not just install)
setupOffscreenDocument().catch(() => {
  // Ignore errors on startup pre-warm
});

console.log('Background script loaded successfully');