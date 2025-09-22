/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!**************************!*\
  !*** ./src/auth/auth.ts ***!
  \**************************/

// Auth page communicates with background script for Firebase authentication
// DOM elements
const authContent = document.getElementById('auth-content');
const loadingContent = document.getElementById('loading-content');
const successContent = document.getElementById('success-content');
const errorContent = document.getElementById('error-content');
const errorMessage = document.getElementById('error-message');
const googleSignInBtn = document.getElementById('google-signin-btn');
const emailForm = document.getElementById('email-signin-form');
const showSignupLink = document.getElementById('show-signup');
const retryBtn = document.getElementById('retry-btn');
// State
let isSignUpMode = false;
// Show/hide content sections
function showSection(section) {
    authContent?.classList.toggle('hidden', section !== 'auth');
    loadingContent?.classList.toggle('hidden', section !== 'loading');
    successContent?.classList.toggle('hidden', section !== 'success');
    errorContent?.classList.toggle('hidden', section !== 'error');
}
// Handle successful sign-in
function handleSuccess() {
    showSection('success');
    // Close tab after 2 seconds
    setTimeout(() => {
        window.close();
    }, 2000);
}
// Handle sign-in error
function handleError(error) {
    console.error('Auth error:', error);
    let message = 'An error occurred during sign-in. Please try again.';
    // Map Firebase error codes to user-friendly messages
    switch (error.code) {
        case 'auth/popup-closed-by-user':
            message = 'Sign-in cancelled. Please try again.';
            break;
        case 'auth/popup-blocked':
            message = 'Sign-in popup was blocked. Please enable popups and try again.';
            break;
        case 'auth/user-cancelled':
            message = 'Sign-in was cancelled. Please try again.';
            break;
        case 'auth/redirect-cancelled-by-user':
            message = 'Sign-in was cancelled. Please try again.';
            break;
        case 'auth/redirect-operation-pending':
            message = 'Another sign-in attempt is in progress. Please wait.';
            break;
        case 'auth/user-not-found':
            message = 'No account found with this email address.';
            break;
        case 'auth/wrong-password':
            message = 'Incorrect password. Please try again.';
            break;
        case 'auth/invalid-email':
            message = 'Please enter a valid email address.';
            break;
        case 'auth/email-already-in-use':
            message = 'An account with this email already exists.';
            break;
        case 'auth/weak-password':
            message = 'Password should be at least 6 characters.';
            break;
        case 'auth/invalid-credential':
            message = 'Invalid email or password.';
            break;
        case 'auth/account-exists-with-different-credential':
            message = 'An account already exists with the same email address but different sign-in credentials.';
            break;
    }
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    showSection('error');
}
// Google Sign-In
async function signInWithGoogle() {
    try {
        showSection('loading');
        // Send auth request to background script
        chrome.runtime.sendMessage({
            action: 'openAuthTab',
            authAction: 'signInWithGoogle',
            authData: {}
        }, (response) => {
            if (chrome.runtime.lastError) {
                handleError({ message: chrome.runtime.lastError.message });
            }
            else if (response.success) {
                handleSuccess();
            }
            else {
                handleError(response.error);
            }
        });
    }
    catch (error) {
        handleError(error);
    }
}
// Email Sign-In/Sign-Up
async function handleEmailAuth(email, password) {
    try {
        showSection('loading');
        const authAction = isSignUpMode ? 'signUpWithEmail' : 'signInWithEmail';
        // Send auth request to background script
        chrome.runtime.sendMessage({
            action: 'openAuthTab',
            authAction: authAction,
            authData: { email, password }
        }, (response) => {
            if (chrome.runtime.lastError) {
                handleError({ message: chrome.runtime.lastError.message });
            }
            else if (response.success) {
                if (isSignUpMode && response.needsVerification) {
                    // Show custom success message for sign-up
                    if (successContent) {
                        const successText = successContent.querySelector('p');
                        if (successText) {
                            successText.textContent = 'Account created! Please check your email to verify your account.';
                        }
                    }
                }
                handleSuccess();
            }
            else {
                // Special handling for email verification required
                if (response.error && response.error.code === 'auth/email-not-verified') {
                    if (errorMessage) {
                        errorMessage.textContent = response.error.message;
                    }
                    showSection('error');
                }
                else {
                    handleError(response.error);
                }
            }
        });
    }
    catch (error) {
        handleError(error);
    }
}
// Event listeners
googleSignInBtn?.addEventListener('click', signInWithGoogle);
emailForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    handleEmailAuth(email, password);
});
// Toggle between sign-in and sign-up modes
function toggleAuthMode(e) {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    // Update UI for sign-up mode
    const h2 = authContent?.querySelector('h2');
    const submitBtn = emailForm?.querySelector('button[type="submit"]');
    if (isSignUpMode) {
        if (h2)
            h2.textContent = 'Create an Account';
        if (submitBtn)
            submitBtn.textContent = 'Sign up with Email';
        if (showSignupLink && showSignupLink.parentElement) {
            showSignupLink.parentElement.innerHTML = 'Already have an account? <a href="#" id="show-signup">Sign in</a>';
            // Re-attach event listener
            document.getElementById('show-signup')?.addEventListener('click', toggleAuthMode);
        }
    }
    else {
        if (h2)
            h2.textContent = 'Sign in to Daily Bread';
        if (submitBtn)
            submitBtn.textContent = 'Sign in with Email';
        if (showSignupLink && showSignupLink.parentElement) {
            showSignupLink.parentElement.innerHTML = 'Don\'t have an account? <a href="#" id="show-signup">Sign up</a>';
            // Re-attach event listener
            document.getElementById('show-signup')?.addEventListener('click', toggleAuthMode);
        }
    }
}
showSignupLink?.addEventListener('click', toggleAuthMode);
retryBtn?.addEventListener('click', () => {
    showSection('auth');
});
// Check if already signed in when page loads
chrome.runtime.sendMessage({
    action: 'auth',
    authAction: 'getCurrentUser',
    authData: {}
}, (response) => {
    if (response && response.success && response.user) {
        // Already signed in, close the tab
        handleSuccess();
    }
});

/******/ })()
;
//# sourceMappingURL=auth.js.map