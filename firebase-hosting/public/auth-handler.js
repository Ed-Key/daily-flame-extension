// Immediate log to verify fresh script load
console.log(`[${new Date().toISOString()}] 🚀 AUTH HANDLER LOADED - Fresh script execution`);

// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  setPersistence,
  browserSessionPersistence
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANFOOgSGPLhyzri5jaPOYmAv-CeGIv4zs",
  authDomain: "daily-flame.firebaseapp.com",
  projectId: "daily-flame",
  storageBucket: "daily-flame.firebasestorage.app",
  messagingSenderId: "129859451154",
  appId: "1:129859451154:web:583759894f1ce471b35bcb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log(`[${new Date().toISOString()}] Auth handler initialized`);

// Track auth readiness and current popup operation
let authReady = false;
let currentPopupOperation = null;

// Set persistence to session only to avoid stale auth states
setPersistence(auth, browserSessionPersistence).then(() => {
  console.log(`[${new Date().toISOString()}] Auth persistence set to session only`);
}).catch((error) => {
  console.error(`[${new Date().toISOString()}] Error setting persistence:`, error);
});

auth.onAuthStateChanged((user) => {
  authReady = true;
  console.log(`[${new Date().toISOString()}] Firebase Auth state changed, ready: true, user:`, user?.email || 'none');
});

// Listen for messages from the Chrome extension
window.addEventListener('message', async (event) => {
  // Filter out Google's internal iframe messages
  if (typeof event.data === 'string' && event.data.startsWith('!_')) {
    // Silently ignore Google's internal messages
    return;
  }
  
  console.log('Received message:', event.data, 'from:', event.origin);
  
  // Accept messages from Chrome extensions and Firebase auth domains
  const allowedOrigins = [
    'chrome-extension://',
    'https://daily-flame.firebaseapp.com',
    'https://daily-flame.web.app'
  ];

  const isAllowedOrigin = allowedOrigins.some(origin => 
    event.origin.startsWith(origin) || event.origin === origin
  );

  if (!isAllowedOrigin) {
    console.warn('Ignoring message from non-allowed origin:', event.origin);
    return;
  }
  
  // Check if this is a valid auth message
  if (!event.data || typeof event.data !== 'object' || !event.data.action) {
    console.warn('Ignoring malformed message:', event.data);
    return;
  }
  
  const { action, email, password } = event.data;
  
  try {
    let result;
    
    switch (action) {
      case 'signInWithGoogle':
        console.log(`[${new Date().toISOString()}] Attempting Google sign-in...`);
        
        // Clear any existing auth state first
        if (auth.currentUser) {
          console.log(`[${new Date().toISOString()}] Clearing existing auth state before sign-in`);
          try {
            await signOut(auth);
            console.log(`[${new Date().toISOString()}] Auth state cleared`);
          } catch (e) {
            console.log(`[${new Date().toISOString()}] Error clearing auth state:`, e);
          }
        }
        
        // Cancel any existing popup operation
        if (currentPopupOperation) {
          console.log(`[${new Date().toISOString()}] Cancelling existing popup operation`);
          try {
            currentPopupOperation.cancel();
          } catch (e) {
            console.log(`[${new Date().toISOString()}] Error cancelling popup:`, e);
          }
          currentPopupOperation = null;
        }
        
        // Add a small delay to ensure clean state
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Wait for auth to be ready
        if (!authReady) {
          console.log(`[${new Date().toISOString()}] Waiting for Firebase Auth to initialize...`);
          await new Promise(resolve => {
            const checkReady = setInterval(() => {
              if (authReady) {
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
        
        console.log(`[${new Date().toISOString()}] Auth ready status: ${authReady}`);
        
        // Add a delay to ensure clean state
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ 
          prompt: 'select_account'
        });
        
        console.log(`[${new Date().toISOString()}] Attempting signInWithPopup...`);
        
        try {
          // First attempt with popup
          result = await signInWithPopup(auth, provider);
          console.log(`[${new Date().toISOString()}] Google sign-in successful via popup`);
        } catch (popupError) {
          console.error(`[${new Date().toISOString()}] Popup error:`, popupError.code, popupError.message);
          
          // If popup fails, try redirect as fallback
          if (popupError.code === 'auth/cancelled-popup-request' || 
              popupError.code === 'auth/popup-blocked' ||
              popupError.code === 'auth/popup-closed-by-user') {
            
            console.log(`[${new Date().toISOString()}] Popup failed, trying redirect flow...`);
            
            // Store that we're expecting a redirect
            sessionStorage.setItem('dailyflame-auth-redirect', 'pending');
            
            // Use redirect flow
            await signInWithRedirect(auth, provider);
            
            // This won't execute as page will redirect
            return;
          } else {
            throw popupError;
          }
        }
        break;
        
      case 'signInWithEmail':
        console.log('Attempting email sign-in...');
        result = await signInWithEmailAndPassword(auth, email, password);
        
        // Check email verification
        if (email !== 'admin@dailyflame.com' && !result.user.emailVerified) {
          throw {
            code: 'auth/email-not-verified',
            message: 'Please verify your email before signing in. Check your inbox for the verification link.'
          };
        }
        console.log('Email sign-in successful');
        break;
        
      case 'signUpWithEmail':
        console.log('Attempting email sign-up...');
        result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Send verification email
        if (email !== 'admin@dailyflame.com' && result.user) {
          await sendEmailVerification(result.user);
          console.log('Verification email sent');
        }
        console.log('Email sign-up successful');
        break;
        
      case 'signOut':
        console.log('Attempting sign-out...');
        await signOut(auth);
        result = { success: true };
        console.log('Sign-out successful');
        break;
        
      case 'verifyAuthState':
        console.log('Verifying auth state...');
        const currentUser = auth.currentUser;
        const isValid = currentUser !== null;
        result = { 
          success: true, 
          isValid,
          user: isValid ? {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            emailVerified: currentUser.emailVerified
          } : null
        };
        console.log('Auth state verification:', isValid ? 'Valid' : 'Invalid');
        break;
        
      case 'sendVerificationEmail':
        console.log('Sending verification email...');
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
          result = { success: true };
          console.log('Verification email sent successfully');
        } else {
          throw new Error('No user signed in');
        }
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // Prepare user data
    const userData = result.user ? {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      emailVerified: result.user.emailVerified
    } : null;
    
    // Send success response back to extension
    const response = {
      success: true,
      user: userData,
      needsVerification: action === 'signUpWithEmail' && email !== 'admin@dailyflame.com',
      // Include isValid for verifyAuthState action
      ...(action === 'verifyAuthState' && { isValid: result.isValid })
    };
    
    console.log('Sending success response:', response);
    
    // Send response via most reliable communication methods
    try {
      // Method 1: BroadcastChannel (most reliable for same-origin)
      const channel = new BroadcastChannel('dailyflame-auth');
      channel.postMessage(response);
      console.log('Sent via BroadcastChannel');
      
      // Method 2: Direct parent postMessage (for iframe to offscreen communication)
      if (window.parent !== window) {
        window.parent.postMessage(response, '*');
        console.log('Sent via parent.postMessage');
      }
    } catch (error) {
      console.error('Error sending response:', error);
    }
    
  } catch (error) {
    console.error('Auth error:', error);
    
    // Send error response back to extension
    const errorResponse = {
      success: false,
      error: {
        code: error.code || 'unknown',
        message: error.message || 'An error occurred during authentication'
      }
    };
    
    console.log('Sending error response:', errorResponse);
    
    // Send error response via most reliable communication methods
    try {
      // Method 1: BroadcastChannel (most reliable for same-origin)
      const channel = new BroadcastChannel('dailyflame-auth');
      channel.postMessage(errorResponse);
      console.log('Sent error via BroadcastChannel');
      
      // Method 2: Direct parent postMessage (for iframe to offscreen communication)
      if (window.parent !== window) {
        window.parent.postMessage(errorResponse, '*');
        console.log('Sent error via parent.postMessage');
      }
    } catch (sendError) {
      console.error('Error sending error response:', sendError);
    }
  }
});

// Check for redirect result when page loads
(async () => {
  if (sessionStorage.getItem('dailyflame-auth-redirect') === 'pending') {
    console.log(`[${new Date().toISOString()}] Checking for redirect result...`);
    sessionStorage.removeItem('dailyflame-auth-redirect');
    
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log(`[${new Date().toISOString()}] Redirect sign-in successful`);
        
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          emailVerified: result.user.emailVerified
        };
        
        const response = {
          success: true,
          user: userData
        };
        
        // Send response via all channels
        try {
          const channel = new BroadcastChannel('dailyflame-auth');
          channel.postMessage(response);
          console.log('Sent redirect result via BroadcastChannel');
        } catch (error) {
          console.log('BroadcastChannel not available');
        }
        
        if (window.parent !== window) {
          window.parent.postMessage(response, '*');
        }
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Redirect error:`, error);
    }
  }
})();

// Let the parent window know we're ready after auth is initialized
auth.onAuthStateChanged((user) => {
  if (window.parent !== window && !window.authHandlerReady) {
    window.authHandlerReady = true;
    console.log(`[${new Date().toISOString()}] Notifying parent window that auth handler is ready`);
    
    const readyMessage = { 
      ready: true, 
      version: '1.0',
      timestamp: new Date().toISOString()
    };
    
    window.parent.postMessage(readyMessage, '*');
    
    // Also send via BroadcastChannel
    try {
      const channel = new BroadcastChannel('dailyflame-auth');
      channel.postMessage(readyMessage);
      console.log(`[${new Date().toISOString()}] Sent ready signal via BroadcastChannel`);
    } catch (error) {
      console.log('BroadcastChannel not available for ready signal');
    }
  }
});