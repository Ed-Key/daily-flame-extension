// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
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

console.log('Auth handler initialized');

// Listen for messages from the Chrome extension
window.addEventListener('message', async (event) => {
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
  
  const { action, email, password } = event.data;
  
  try {
    let result;
    
    switch (action) {
      case 'signInWithGoogle':
        console.log('Attempting Google sign-in...');
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        result = await signInWithPopup(auth, provider);
        console.log('Google sign-in successful');
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
    event.source.postMessage(response, event.origin);
    
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
    event.source.postMessage(errorResponse, event.origin);
  }
});

// Let the parent window know we're ready
if (window.parent !== window) {
  console.log('Notifying parent window that auth handler is ready');
  window.parent.postMessage({ ready: true }, '*');
}