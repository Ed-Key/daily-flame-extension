// URL of the hosted authentication handler
const AUTH_HANDLER_BASE_URL = 'https://daily-flame.web.app/auth-handler.html';

// Import Firebase functions for preference sync
import { doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { db } from './services/firebase-config';

// Get auth instance
const auth = getAuth();

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Offscreen: Firebase Auth state changed - user signed in:', user.uid);
  } else {
    console.log('Offscreen: Firebase Auth state changed - user signed out');
  }
});

// Create iframe for authentication
let iframe: HTMLIFrameElement | null = null;
let isIframeReady = false;

// Queue for auth requests that arrive before iframe is ready
const authRequestQueue: Array<{
  request: any;
  sendResponse: (response: any) => void;
}> = [];

// Process queued auth requests
function processQueuedRequests() {
  while (authRequestQueue.length > 0) {
    const { request, sendResponse } = authRequestQueue.shift()!;
    handleAuthRequest(request, sendResponse);
  }
}

// Initialize the authentication iframe with fresh cache busting
function initializeAuthFrame(forceRecreate: boolean = false) {
  // Remove existing iframe if force recreate is requested
  if (forceRecreate && iframe) {
    console.log('Offscreen: Removing existing iframe for fresh load');
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    iframe = null;
    isIframeReady = false;
  }
  
  if (iframe) {
    console.log('Offscreen: Iframe already exists');
    return;
  }
  
  console.log('Offscreen: Creating auth iframe with cache buster');
  iframe = document.createElement('iframe');
  
  // Generate unique session ID for this auth attempt
  const sessionId = Math.random().toString(36).substring(2) + Date.now();
  const cacheBuster = Math.random().toString(36).substring(7) + Date.now();
  const iframeSrc = `${AUTH_HANDLER_BASE_URL}?session=${sessionId}&cb=${cacheBuster}&t=${Date.now()}`;
  
  // Set iframe attributes to prevent caching
  iframe.style.display = 'none';
  iframe.setAttribute('data-timestamp', Date.now().toString());
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
  iframe.setAttribute('referrerpolicy', 'no-referrer');
  iframe.setAttribute('importance', 'high');
  
  console.log('Offscreen: Iframe URL:', iframeSrc);
  console.log('Offscreen: Session ID:', sessionId);
  
  // Don't set src yet - we'll set it after appending to force fresh load
  document.body.appendChild(iframe);
  
  // Force hard reload by setting src after iframe is in DOM
  iframe.src = iframeSrc;
  
  // Set ready state when iframe loads
  iframe.onload = () => {
    console.log('Offscreen: Auth iframe loaded');
    
    // Try to force reload if we can access the content
    try {
      if (iframe && iframe.contentWindow) {
        // Force a hard reload of the iframe content
        iframe.contentWindow.location.reload();
        console.log('Offscreen: Forced iframe content reload');
      }
    } catch (e) {
      console.log('Offscreen: Could not force reload iframe content');
    }
    
    // Give it a moment for any initialization
    setTimeout(() => {
      if (!isIframeReady) {
        console.log('Offscreen: Setting iframe ready after load');
        isIframeReady = true;
        processQueuedRequests();
      }
    }, 500);
  };
  
  // Also listen for explicit ready message as backup
  const readyHandler = (event: MessageEvent) => {
    const origin = new URL(AUTH_HANDLER_BASE_URL).origin;
    if (event.origin === origin && event.data?.ready) {
      console.log('Offscreen: Auth iframe signaled ready via postMessage, version:', event.data.version || 'unknown');
      if (event.data.version) {
        console.log('Offscreen: Auth handler version confirmed:', event.data.version);
      }
      isIframeReady = true;
      processQueuedRequests();
    }
  };
  window.addEventListener('message', readyHandler);
  
  // Listen for BroadcastChannel ready signal
  try {
    const readyChannel = new BroadcastChannel('dailyflame-auth');
    readyChannel.addEventListener('message', (event) => {
      if (event.data?.ready) {
        console.log('Offscreen: Auth iframe signaled ready via BroadcastChannel, version:', event.data.version || 'unknown');
        if (event.data.version) {
          console.log('Offscreen: Auth handler version confirmed:', event.data.version);
        }
        isIframeReady = true;
        processQueuedRequests();
        readyChannel.close();
      }
    });
  } catch (error) {
    console.log('Offscreen: BroadcastChannel not available for ready signal');
  }
  
  // Force ready state after timeout as final fallback
  setTimeout(() => {
    if (!isIframeReady) {
      console.log('Offscreen: Force setting iframe ready after timeout');
      isIframeReady = true;
      processQueuedRequests();
    }
  }, 1000);
  
  document.body.appendChild(iframe);
}

// Initialize iframe when offscreen document loads
initializeAuthFrame();

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle ID token requests
  if (request.action === 'getIdToken') {
    handleGetIdToken(sendResponse);
    return true; // Will respond asynchronously
  }
  
  // Handle preference sync requests
  if (request.action === 'syncPreferences') {
    handlePreferenceSync(request, sendResponse);
    return true; // Will respond asynchronously
  }
  
  // Handle save preferences to iframe
  if (request.action === 'savePreferencesToIframe') {
    handleSavePreferencesToIframe(request, sendResponse);
    return true; // Will respond asynchronously
  }
  
  // Handle load preferences from iframe
  if (request.action === 'loadPreferencesFromIframe') {
    handleLoadPreferencesFromIframe(request, sendResponse);
    return true; // Will respond asynchronously
  }
  
  // Handle auth requests
  if (request.target !== 'offscreen-auth') {
    return false;
  }

  // If iframe is not ready, queue the request
  if (!isIframeReady) {
    console.log('Offscreen: Iframe not ready, queuing auth request');
    authRequestQueue.push({ request, sendResponse });
  } else {
    handleAuthRequest(request, sendResponse);
  }
  
  return true; // Will respond asynchronously
});

// Handle ID token requests
async function handleGetIdToken(sendResponse: (response: any) => void) {
  console.log('Offscreen: Getting ID token from iframe auth handler');
  
  // Ensure iframe is initialized
  if (!iframe) {
    console.log('Offscreen: Initializing iframe for ID token request');
    initializeAuthFrame();
  }
  
  // Wait for iframe to be ready
  if (!isIframeReady) {
    console.log('Offscreen: Waiting for iframe to be ready...');
    await new Promise(resolve => {
      const checkReady = setInterval(() => {
        if (isIframeReady) {
          clearInterval(checkReady);
          resolve(true);
        }
      }, 100);
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        resolve(false);
      }, 5000);
    });
  }
  
  if (!isIframeReady || !iframe || !iframe.contentWindow) {
    console.error('Offscreen: Iframe not ready for ID token request');
    sendResponse({
      success: false,
      error: 'Authentication iframe not ready'
    });
    return;
  }
  
  let responseReceived = false;
  let responseHandler: ((event: MessageEvent) => void) | null = null;
  let broadcastChannel: BroadcastChannel | null = null;
  let broadcastHandler: ((event: MessageEvent) => void) | null = null;
  
  // Set up BroadcastChannel listener
  try {
    broadcastChannel = new BroadcastChannel('dailyflame-auth');
    broadcastHandler = (event: MessageEvent) => {
      console.log('Offscreen: Received ID token response via BroadcastChannel');
      
      // Check if this is the ID token response
      if (event.data && event.data.idToken) {
        responseReceived = true;
        
        // Clean up listeners
        if (broadcastChannel) {
          broadcastChannel.removeEventListener('message', broadcastHandler!);
          broadcastChannel.close();
        }
        if (responseHandler) {
          window.removeEventListener('message', responseHandler);
        }
        
        console.log('Offscreen: ID token received for user:', event.data.userId);
        sendResponse(event.data);
      }
    };
    broadcastChannel.addEventListener('message', broadcastHandler);
  } catch (error) {
    console.warn('Offscreen: BroadcastChannel not available:', error);
  }
  
  // Set up message listener for the response
  responseHandler = (event: MessageEvent) => {
    if (event.origin !== new URL(AUTH_HANDLER_BASE_URL).origin) {
      return;
    }
    
    // Check if this is the ID token response
    if (event.data && event.data.idToken) {
      responseReceived = true;
      
      // Clean up listeners
      window.removeEventListener('message', responseHandler!);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', broadcastHandler!);
        broadcastChannel.close();
      }
      
      console.log('Offscreen: ID token received via postMessage for user:', event.data.userId);
      sendResponse(event.data);
    }
  };
  
  window.addEventListener('message', responseHandler);
  
  // Send request to iframe
  const message = {
    action: 'getIdToken'
  };
  
  console.log('Offscreen: Sending getIdToken request to iframe');
  iframe.contentWindow.postMessage(message, new URL(AUTH_HANDLER_BASE_URL).origin);
  
  // Set timeout for response
  setTimeout(() => {
    if (!responseReceived) {
      // Clean up listeners
      if (responseHandler) {
        window.removeEventListener('message', responseHandler);
      }
      if (broadcastChannel && broadcastHandler) {
        broadcastChannel.removeEventListener('message', broadcastHandler);
        broadcastChannel.close();
      }
      
      console.error('Offscreen: No response from iframe for ID token request');
      sendResponse({
        success: false,
        error: 'Failed to get ID token from authentication iframe'
      });
    }
  }, 5000); // 5 second timeout
}

// Temporary workaround: Sign in the user in offscreen document when needed
async function ensureAuthenticatedForUser(userId: string, request: any): Promise<boolean> {
  const currentUser = auth.currentUser;
  
  // If already authenticated as the right user, we're good
  if (currentUser && currentUser.uid === userId) {
    console.log('Offscreen: Already authenticated as user:', userId);
    return true;
  }
  
  console.log('Offscreen: Need to authenticate for user:', userId);
  
  // Check if we have auth credentials in the request (temporary solution)
  if (request.authCredentials) {
    const { email, password } = request.authCredentials;
    try {
      console.log('Offscreen: Attempting to sign in with provided credentials');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Offscreen: ✅ Successfully authenticated:', userCredential.user.uid);
      return userCredential.user.uid === userId;
    } catch (error) {
      console.error('Offscreen: Failed to authenticate:', error);
    }
  }
  
  // As a last resort, check if we have a recent auth from the iframe
  // This won't help with Firestore but at least we can log the situation
  const stored = await chrome.storage.local.get(['authUser']);
  if (stored.authUser && stored.authUser.uid === userId) {
    console.log('Offscreen: User is authenticated elsewhere but not in this context');
    console.log('Offscreen: Firestore write will likely fail due to missing auth');
  }
  
  return false;
}

// Handle preference sync to Firestore
async function handlePreferenceSync(request: any, sendResponse: (response: any) => void) {
  console.log('Offscreen: Handling preference sync request for user:', request.data?.userId);
  console.log('Offscreen: Preferences to sync:', request.data?.preferences);
  
  const { userId, preferences } = request.data;
  
  try {
    // Check if Firebase is initialized
    if (!db) {
      throw new Error('Firestore database not initialized');
    }
    
    // Check auth state for this user
    const isAuthenticated = await ensureAuthenticatedForUser(userId, request.data);
    
    // Check current auth state after initialization attempt
    const currentUser = auth.currentUser;
    console.log('Offscreen: Current auth user after init:', currentUser?.uid || 'none');
    
    if (!currentUser || currentUser.uid !== userId) {
      console.warn('Offscreen: Auth mismatch - requested userId:', userId, 'current user:', currentUser?.uid);
      console.warn('Offscreen: Proceeding anyway - Firestore rules should handle authorization');
    }
    
    // Create reference to user document
    const userDocRef = doc(db, 'users', userId);
    console.log('Offscreen: Writing to Firestore path: users/' + userId);
    
    // Add timestamps
    const preferencesWithTimestamp = {
      ...preferences,
      lastModified: preferences.lastModified || Date.now(),
      lastSynced: Date.now()
    };
    
    // Save to Firestore with merge to not overwrite other fields
    await setDoc(userDocRef, {
      preferences: preferencesWithTimestamp,
      updatedAt: Date.now() // Add document-level timestamp
    }, { merge: true });
    
    console.log('Offscreen: ✅ Preferences synced to Firestore successfully');
    console.log('Offscreen: Synced data:', preferencesWithTimestamp);
    sendResponse({ success: true, syncedAt: Date.now() });
  } catch (error) {
    console.error('Offscreen: ❌ Error syncing preferences to Firestore:', error);
    sendResponse({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function handleAuthRequest(request: any, sendResponse: (response: any) => void) {
  console.log('Offscreen: Handling auth request:', request.action);
  
  // Force recreate iframe for each auth request to ensure fresh code
  initializeAuthFrame(true);
  
  // Wait for iframe to be ready
  if (!isIframeReady) {
    console.log('Offscreen: Waiting for iframe to be ready after recreation...');
    await new Promise(resolve => {
      const checkReady = setInterval(() => {
        if (isIframeReady) {
          clearInterval(checkReady);
          resolve(true);
        }
      }, 100);
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        resolve(false);
      }, 5000);
    });
  }
  
  let attempts = 0;
  const maxAttempts = 3;
  let responseReceived = false;
  let responseHandler: ((event: MessageEvent) => void) | null = null;
  let broadcastChannel: BroadcastChannel | null = null;
  let broadcastHandler: ((event: MessageEvent) => void) | null = null;
  
  function attemptAuth() {
    attempts++;
    console.log(`Offscreen: Auth attempt ${attempts} of ${maxAttempts}`);
    
    // Set up BroadcastChannel listener
    try {
      broadcastChannel = new BroadcastChannel('dailyflame-auth');
      broadcastHandler = (event: MessageEvent) => {
        console.log('Offscreen: Received via BroadcastChannel:', event.data);
        
        // Only accept messages with expected auth response format
        if (!event.data || typeof event.data !== 'object' || !('success' in event.data)) {
          console.log('Offscreen: Ignoring malformed broadcast message:', event.data);
          return;
        }
        
        // Mark response as received
        responseReceived = true;
        
        // Clean up listeners
        if (broadcastChannel) {
          broadcastChannel.removeEventListener('message', broadcastHandler!);
          broadcastChannel.close();
        }
        if (responseHandler) {
          window.removeEventListener('message', responseHandler);
        }
        
        console.log('Offscreen: Processing broadcast response:', event.data);
        sendResponse(event.data);
      };
      broadcastChannel.addEventListener('message', broadcastHandler);
    } catch (error) {
      console.warn('Offscreen: BroadcastChannel not available:', error);
    }
    
    // Set up message listener for the response
    responseHandler = (event: MessageEvent) => {
      if (event.origin !== new URL(AUTH_HANDLER_BASE_URL).origin) {
        return;
      }
      
      // Filter out Google's internal iframe messages
      if (typeof event.data === 'string' && event.data.startsWith('!_')) {
        console.log('Offscreen: Ignoring Google internal message');
        return;
      }
      
      // Only accept messages with expected auth response format
      if (!event.data || typeof event.data !== 'object' || !('success' in event.data)) {
        console.log('Offscreen: Ignoring malformed message:', event.data);
        return;
      }
      
      // Mark response as received
      responseReceived = true;
      
      // Clean up listeners
      window.removeEventListener('message', responseHandler!);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', broadcastHandler!);
        broadcastChannel.close();
      }
      
      console.log('Offscreen: Received response from iframe:', event.data);
      sendResponse(event.data);
    };
    
    window.addEventListener('message', responseHandler);
    
    // Send request to iframe
    if (iframe && iframe.contentWindow) {
      const message = {
        action: request.action,
        email: request.email,
        password: request.password
      };
      
      console.log('Offscreen: Sending message to iframe:', message);
      iframe.contentWindow.postMessage(message, new URL(AUTH_HANDLER_BASE_URL).origin);
      
      // Set timeout for retry
      setTimeout(() => {
        if (!responseReceived) {
          // Clean up listeners
          if (responseHandler) {
            window.removeEventListener('message', responseHandler);
          }
          if (broadcastChannel && broadcastHandler) {
            broadcastChannel.removeEventListener('message', broadcastHandler);
            broadcastChannel.close();
          }
          
          if (attempts < maxAttempts) {
            console.log('Offscreen: No response from iframe, retrying...');
            attemptAuth();
          } else {
            console.error('Offscreen: Failed to get response from iframe after', maxAttempts, 'attempts');
            sendResponse({
              success: false,
              error: {
                code: 'iframe-timeout',
                message: 'Authentication iframe not responding'
              }
            });
          }
        }
      }, 15000); // 15 second timeout per attempt
    } else {
      if (responseHandler) {
        window.removeEventListener('message', responseHandler);
      }
      if (broadcastChannel && broadcastHandler) {
        broadcastChannel.removeEventListener('message', broadcastHandler);
        broadcastChannel.close();
      }
      sendResponse({
        success: false,
        error: {
          code: 'iframe-not-found',
          message: 'Authentication iframe not initialized'
        }
      });
    }
  }
  
  attemptAuth();
}

// Handle save preferences to iframe
async function handleSavePreferencesToIframe(request: any, sendResponse: (response: any) => void) {
  console.log('Offscreen: Forwarding save preferences to iframe');
  
  // Ensure iframe is initialized
  if (!iframe) {
    console.log('Offscreen: Initializing iframe for save preferences');
    initializeAuthFrame();
  }
  
  // Wait for iframe to be ready
  if (!isIframeReady) {
    console.log('Offscreen: Waiting for iframe to be ready...');
    await new Promise(resolve => {
      const checkReady = setInterval(() => {
        if (isIframeReady) {
          clearInterval(checkReady);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkReady);
        resolve(false);
      }, 5000);
    });
  }
  
  if (!isIframeReady || !iframe || !iframe.contentWindow) {
    console.error('Offscreen: Iframe not ready for save preferences');
    sendResponse({
      success: false,
      error: 'Authentication iframe not ready'
    });
    return;
  }
  
  let responseReceived = false;
  let responseHandler: ((event: MessageEvent) => void) | null = null;
  let broadcastChannel: BroadcastChannel | null = null;
  let broadcastHandler: ((event: MessageEvent) => void) | null = null;
  
  // Set up BroadcastChannel listener
  try {
    broadcastChannel = new BroadcastChannel('dailyflame-auth');
    broadcastHandler = (event: MessageEvent) => {
      if (event.data && event.data.success && event.data.message === 'Preferences saved successfully') {
        responseReceived = true;
        
        // Clean up listeners
        if (broadcastChannel) {
          broadcastChannel.removeEventListener('message', broadcastHandler!);
          broadcastChannel.close();
        }
        if (responseHandler) {
          window.removeEventListener('message', responseHandler);
        }
        
        console.log('Offscreen: Preferences saved via BroadcastChannel');
        sendResponse(event.data);
      }
    };
    broadcastChannel.addEventListener('message', broadcastHandler);
  } catch (error) {
    console.warn('Offscreen: BroadcastChannel not available:', error);
  }
  
  // Set up message listener for the response
  responseHandler = (event: MessageEvent) => {
    if (event.origin !== new URL(AUTH_HANDLER_BASE_URL).origin) {
      return;
    }
    
    if (event.data && event.data.success && event.data.message === 'Preferences saved successfully') {
      responseReceived = true;
      
      // Clean up listeners
      window.removeEventListener('message', responseHandler!);
      if (broadcastChannel && broadcastHandler) {
        broadcastChannel.removeEventListener('message', broadcastHandler);
        broadcastChannel.close();
      }
      
      console.log('Offscreen: Preferences saved via postMessage');
      sendResponse(event.data);
    }
  };
  
  window.addEventListener('message', responseHandler);
  
  // Send request to iframe
  const message = {
    action: 'savePreferences',
    preferences: request.data.preferences
  };
  
  console.log('Offscreen: Sending savePreferences to iframe');
  iframe.contentWindow.postMessage(message, new URL(AUTH_HANDLER_BASE_URL).origin);
  
  // Set timeout for response
  setTimeout(() => {
    if (!responseReceived) {
      // Clean up listeners
      if (responseHandler) {
        window.removeEventListener('message', responseHandler);
      }
      if (broadcastChannel && broadcastHandler) {
        broadcastChannel.removeEventListener('message', broadcastHandler);
        broadcastChannel.close();
      }
      
      console.error('Offscreen: No response from iframe for save preferences');
      sendResponse({
        success: false,
        error: 'Failed to save preferences - no response from iframe'
      });
    }
  }, 5000);
}

// Handle load preferences from iframe
async function handleLoadPreferencesFromIframe(request: any, sendResponse: (response: any) => void) {
  console.log('Offscreen: Forwarding load preferences to iframe');
  
  // Ensure iframe is initialized
  if (!iframe) {
    console.log('Offscreen: Initializing iframe for load preferences');
    initializeAuthFrame();
  }
  
  // Wait for iframe to be ready
  if (!isIframeReady) {
    console.log('Offscreen: Waiting for iframe to be ready...');
    await new Promise(resolve => {
      const checkReady = setInterval(() => {
        if (isIframeReady) {
          clearInterval(checkReady);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkReady);
        resolve(false);
      }, 5000);
    });
  }
  
  if (!isIframeReady || !iframe || !iframe.contentWindow) {
    console.error('Offscreen: Iframe not ready for load preferences');
    sendResponse({
      success: false,
      error: 'Authentication iframe not ready'
    });
    return;
  }
  
  let responseReceived = false;
  let responseHandler: ((event: MessageEvent) => void) | null = null;
  let broadcastChannel: BroadcastChannel | null = null;
  let broadcastHandler: ((event: MessageEvent) => void) | null = null;
  
  // Set up BroadcastChannel listener
  try {
    broadcastChannel = new BroadcastChannel('dailyflame-auth');
    broadcastHandler = (event: MessageEvent) => {
      if (event.data && event.data.success !== undefined && (event.data.preferences || event.data.exists === false)) {
        responseReceived = true;
        
        // Clean up listeners
        if (broadcastChannel) {
          broadcastChannel.removeEventListener('message', broadcastHandler!);
          broadcastChannel.close();
        }
        if (responseHandler) {
          window.removeEventListener('message', responseHandler);
        }
        
        console.log('Offscreen: Preferences loaded via BroadcastChannel');
        sendResponse(event.data);
      }
    };
    broadcastChannel.addEventListener('message', broadcastHandler);
  } catch (error) {
    console.warn('Offscreen: BroadcastChannel not available:', error);
  }
  
  // Set up message listener for the response
  responseHandler = (event: MessageEvent) => {
    if (event.origin !== new URL(AUTH_HANDLER_BASE_URL).origin) {
      return;
    }
    
    if (event.data && event.data.success !== undefined && (event.data.preferences || event.data.exists === false)) {
      responseReceived = true;
      
      // Clean up listeners
      window.removeEventListener('message', responseHandler!);
      if (broadcastChannel && broadcastHandler) {
        broadcastChannel.removeEventListener('message', broadcastHandler);
        broadcastChannel.close();
      }
      
      console.log('Offscreen: Preferences loaded via postMessage');
      sendResponse(event.data);
    }
  };
  
  window.addEventListener('message', responseHandler);
  
  // Send request to iframe
  const message = {
    action: 'loadPreferences'
  };
  
  console.log('Offscreen: Sending loadPreferences to iframe');
  iframe.contentWindow.postMessage(message, new URL(AUTH_HANDLER_BASE_URL).origin);
  
  // Set timeout for response
  setTimeout(() => {
    if (!responseReceived) {
      // Clean up listeners
      if (responseHandler) {
        window.removeEventListener('message', responseHandler);
      }
      if (broadcastChannel && broadcastHandler) {
        broadcastChannel.removeEventListener('message', broadcastHandler);
        broadcastChannel.close();
      }
      
      console.error('Offscreen: No response from iframe for load preferences');
      sendResponse({
        success: false,
        error: 'Failed to load preferences - no response from iframe'
      });
    }
  }, 5000);
}

// Listen for auth state changes from the iframe and forward to background
window.addEventListener('message', (event) => {
  if (event.origin !== new URL(AUTH_HANDLER_BASE_URL).origin) {
    return;
  }
  
  // Filter out Google's internal iframe messages
  if (typeof event.data === 'string' && event.data.startsWith('!_')) {
    return;
  }
  
  // Handle auth state change notifications
  if (event.data && typeof event.data === 'object' && event.data.type === 'authStateChanged') {
    console.log('Offscreen: Forwarding auth state change to background');
    chrome.runtime.sendMessage({
      action: 'authStateChanged',
      user: event.data.user
    });
    
    // Store the auth result for later use if needed
    if (event.data.user) {
      console.log('Offscreen: User authenticated via iframe:', event.data.user.uid);
    }
  }
});