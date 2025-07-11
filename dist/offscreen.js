/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!**************************!*\
  !*** ./src/offscreen.ts ***!
  \**************************/

// URL of the hosted authentication handler
const AUTH_HANDLER_URL = 'https://daily-flame.web.app/auth-handler.html';
// Create iframe for authentication
let iframe = null;
let isIframeReady = false;
// Initialize the authentication iframe
function initializeAuthFrame() {
    if (iframe)
        return;
    iframe = document.createElement('iframe');
    iframe.src = AUTH_HANDLER_URL;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    // Wait for iframe to signal it's ready
    window.addEventListener('message', (event) => {
        if (event.origin === new URL(AUTH_HANDLER_URL).origin && event.data.ready) {
            isIframeReady = true;
            console.log('Offscreen: Auth iframe is ready');
        }
    });
}
// Initialize iframe when offscreen document loads
initializeAuthFrame();
// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.target !== 'offscreen-auth') {
        return false;
    }
    handleAuthRequest(request, sendResponse);
    return true; // Will respond asynchronously
});
async function handleAuthRequest(request, sendResponse) {
    console.log('Offscreen: Handling auth request:', request.action);
    // Wait for iframe to be ready
    if (!isIframeReady) {
        console.log('Offscreen: Waiting for iframe to be ready...');
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        const waitForReady = setInterval(() => {
            attempts++;
            if (isIframeReady) {
                clearInterval(waitForReady);
                proceedWithAuth();
            }
            else if (attempts >= maxAttempts) {
                clearInterval(waitForReady);
                sendResponse({
                    success: false,
                    error: {
                        code: 'timeout',
                        message: 'Authentication iframe failed to load'
                    }
                });
            }
        }, 100);
    }
    else {
        proceedWithAuth();
    }
    function proceedWithAuth() {
        // Set up one-time message listener for the response
        const responseHandler = (event) => {
            if (event.origin !== new URL(AUTH_HANDLER_URL).origin) {
                return;
            }
            // Remove listener after receiving response
            window.removeEventListener('message', responseHandler);
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
        }
        else {
            window.removeEventListener('message', responseHandler);
            sendResponse({
                success: false,
                error: {
                    code: 'iframe-not-found',
                    message: 'Authentication iframe not initialized'
                }
            });
        }
    }
}

/******/ })()
;
//# sourceMappingURL=offscreen.js.map