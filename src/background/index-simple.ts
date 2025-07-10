// Simplified background script without Firebase imports
// Only handles message routing and chrome.identity operations

// Detect if running on Microsoft Edge
function isEdgeBrowser(): boolean {
  return navigator.userAgent.includes('Edg/');
}

// Google Sign-In handler using chrome.identity API
async function handleGoogleSignIn(): Promise<{ token: string; userInfo: any }> {
  console.log('Background: Starting Google Sign-In process');
  
  // Check if we're on Edge, which doesn't support getAuthToken
  if (isEdgeBrowser()) {
    console.log('Background: Detected Microsoft Edge, using launchWebAuthFlow');
    return handleGoogleSignInWithWebAuthFlow();
  }
  
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

// Alternative Google Sign-In for Edge using launchWebAuthFlow
async function handleGoogleSignInWithWebAuthFlow(): Promise<{ token: string; userInfo: any }> {
  console.log('Background: Using launchWebAuthFlow for Edge compatibility');
  
  const manifest = chrome.runtime.getManifest();
  const clientId = manifest.oauth2?.client_id;
  
  if (!clientId) {
    throw new Error('OAuth2 client ID not found in manifest');
  }
  
  // Generate redirect URI for the extension
  const redirectUri = chrome.identity.getRedirectURL();
  console.log('Background: Redirect URI:', redirectUri);
  
  // Build the OAuth2 URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('prompt', 'select_account'); // Force account selection
  
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive: true
      },
      async (responseUrl) => {
        if (chrome.runtime.lastError || !responseUrl) {
          console.error('Background: Web auth flow failed', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError?.message || 'Authentication failed'));
          return;
        }
        
        // Extract access token from the response URL
        const url = new URL(responseUrl);
        const params = new URLSearchParams(url.hash.substring(1)); // Remove the # character
        const accessToken = params.get('access_token');
        
        if (!accessToken) {
          reject(new Error('No access token in response'));
          return;
        }
        
        console.log('Background: Access token obtained via web auth flow');
        
        // Fetch user info
        try {
          const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
          
          if (!userInfoResponse.ok) {
            console.warn('Background: Failed to fetch user info');
            resolve({ token: accessToken, userInfo: null });
            return;
          }
          
          const userInfo = await userInfoResponse.json();
          console.log('Background: User info fetched successfully');
          resolve({ token: accessToken, userInfo });
        } catch (error) {
          console.warn('Background: Error fetching user info:', error);
          resolve({ token: accessToken, userInfo: null });
        }
      }
    );
  });
}

// Clear all cached auth tokens for testing different accounts
async function clearAuthTokens(): Promise<void> {
  console.log('Background: Clearing all cached auth tokens');
  
  // Edge doesn't support these methods, so just resolve immediately
  if (isEdgeBrowser()) {
    console.log('Background: Edge browser detected, no cached tokens to clear');
    return Promise.resolve();
  }
  
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
  
  if (request.action === 'googleSignIn') {
    handleGoogleSignIn()
      .then(result => {
        sendResponse({ 
          success: true, 
          token: result.token, 
          userInfo: result.userInfo 
        });
      })
      .catch(error => {
        console.error('Background: Error with Google sign-in:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'clearAuthTokens') {
    clearAuthTokens()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('Background: Error clearing auth tokens:', error);
        sendResponse({ success: false, error: error.message });
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