// URL of the hosted authentication handler
const AUTH_HANDLER_URL = 'https://daily-flame.web.app/auth-handler.html';

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

// Initialize the authentication iframe
function initializeAuthFrame() {
  if (iframe) return;
  
  console.log('Offscreen: Creating auth iframe');
  iframe = document.createElement('iframe');
  iframe.src = AUTH_HANDLER_URL;
  iframe.style.display = 'none';
  
  // Set ready state when iframe loads
  iframe.onload = () => {
    console.log('Offscreen: Auth iframe loaded');
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
  window.addEventListener('message', (event) => {
    if (event.origin === new URL(AUTH_HANDLER_URL).origin && event.data.ready) {
      console.log('Offscreen: Auth iframe signaled ready');
      isIframeReady = true;
      processQueuedRequests();
    }
  });
  
  // Force ready state after timeout as final fallback
  setTimeout(() => {
    if (!isIframeReady) {
      console.log('Offscreen: Force setting iframe ready after timeout');
      isIframeReady = true;
      processQueuedRequests();
    }
  }, 3000);
  
  document.body.appendChild(iframe);
}

// Initialize iframe when offscreen document loads
initializeAuthFrame();

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

async function handleAuthRequest(request: any, sendResponse: (response: any) => void) {
  console.log('Offscreen: Handling auth request:', request.action);
  
  let attempts = 0;
  const maxAttempts = 3;
  let responseReceived = false;
  let responseHandler: ((event: MessageEvent) => void) | null = null;
  
  function attemptAuth() {
    attempts++;
    console.log(`Offscreen: Auth attempt ${attempts} of ${maxAttempts}`);
    
    // Set up message listener for the response
    responseHandler = (event: MessageEvent) => {
      if (event.origin !== new URL(AUTH_HANDLER_URL).origin) {
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
      
      // Remove listener after receiving response
      window.removeEventListener('message', responseHandler!);
      
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
      iframe.contentWindow.postMessage(message, AUTH_HANDLER_URL);
      
      // Set timeout for retry
      setTimeout(() => {
        if (!responseReceived) {
          window.removeEventListener('message', responseHandler!);
          
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
      }, 5000); // 5 second timeout per attempt
    } else {
      if (responseHandler) {
        window.removeEventListener('message', responseHandler);
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

// Listen for auth state changes from the iframe and forward to background
window.addEventListener('message', (event) => {
  if (event.origin !== new URL(AUTH_HANDLER_URL).origin) {
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
  }
});