/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!**************************!*\
  !*** ./src/offscreen.ts ***!
  \**************************/

// URL of the hosted authentication handler
const AUTH_HANDLER_BASE_URL = 'https://daily-flame.web.app/auth-handler.html';
// Create iframe for authentication
let iframe = null;
let isIframeReady = false;
// Queue for auth requests that arrive before iframe is ready
const authRequestQueue = [];
// Process queued auth requests
function processQueuedRequests() {
    while (authRequestQueue.length > 0) {
        const { request, sendResponse } = authRequestQueue.shift();
        handleAuthRequest(request, sendResponse);
    }
}
// Initialize the authentication iframe with fresh cache busting
function initializeAuthFrame(forceRecreate = false) {
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
        }
        catch (e) {
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
    const readyHandler = (event) => {
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
    }
    catch (error) {
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
    if (request.target !== 'offscreen-auth') {
        return false;
    }
    // If iframe is not ready, queue the request
    if (!isIframeReady) {
        console.log('Offscreen: Iframe not ready, queuing auth request');
        authRequestQueue.push({ request, sendResponse });
    }
    else {
        handleAuthRequest(request, sendResponse);
    }
    return true; // Will respond asynchronously
});
async function handleAuthRequest(request, sendResponse) {
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
    let responseHandler = null;
    let broadcastChannel = null;
    let broadcastHandler = null;
    function attemptAuth() {
        attempts++;
        console.log(`Offscreen: Auth attempt ${attempts} of ${maxAttempts}`);
        // Set up BroadcastChannel listener
        try {
            broadcastChannel = new BroadcastChannel('dailyflame-auth');
            broadcastHandler = (event) => {
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
                    broadcastChannel.removeEventListener('message', broadcastHandler);
                    broadcastChannel.close();
                }
                if (responseHandler) {
                    window.removeEventListener('message', responseHandler);
                }
                console.log('Offscreen: Processing broadcast response:', event.data);
                sendResponse(event.data);
            };
            broadcastChannel.addEventListener('message', broadcastHandler);
        }
        catch (error) {
            console.warn('Offscreen: BroadcastChannel not available:', error);
        }
        // Set up message listener for the response
        responseHandler = (event) => {
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
            window.removeEventListener('message', responseHandler);
            if (broadcastChannel) {
                broadcastChannel.removeEventListener('message', broadcastHandler);
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
                    }
                    else {
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
        }
        else {
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
    }
});

/******/ })()
;
//# sourceMappingURL=offscreen.js.map