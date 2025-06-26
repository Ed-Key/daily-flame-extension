import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from '../services/firebase-config';
import { AuthContextType, FirebaseUser } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin users list (in a real app, this would be in Firestore or a database)
  const adminEmails = [
    'admin@dailyflame.com',
    'e.kibomaseeds@gmail.com', // Your admin email
    // Add more admin emails as needed
  ];

  const isAdmin = user ? adminEmails.includes(user.email || '') : false;
  
  // Special handling for admin@dailyflame.com - treat as verified
  const isEmailVerifiedCheck = user ? (
    user.emailVerified || user.email === 'admin@dailyflame.com'
  ) : false;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      console.log('🔄 [DEBUG] Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      
      if (firebaseUser) {
        console.log('👤 [DEBUG] User details:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          providerData: firebaseUser.providerData.map(p => ({
            providerId: p.providerId,
            email: p.email
          }))
        });
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        console.log('🚪 [DEBUG] No user signed in');
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check email verification (except for admin)
      if (email !== 'admin@dailyflame.com' && !userCredential.user.emailVerified) {
        console.log('🚨 [DEBUG] User email not verified, signing them out');
        console.log('📧 [DEBUG] User email that needs verification:', userCredential.user.email);
        
        // Sign them out immediately if not verified
        await firebaseSignOut(auth);
        
        // Create a special error that includes email verification context
        const verificationError = new Error('VERIFICATION_REQUIRED') as any;
        verificationError.isVerificationError = true;
        verificationError.userEmail = userCredential.user.email;
        throw verificationError;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Map Firebase error codes to user-friendly messages
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            throw new Error('No account found with this email address.');
          case 'auth/wrong-password':
            throw new Error('Incorrect password. Please try again.');
          case 'auth/invalid-email':
            throw new Error('Please enter a valid email address.');
          case 'auth/user-disabled':
            throw new Error('This account has been disabled. Please contact support.');
          case 'auth/too-many-requests':
            throw new Error('Too many failed attempts. Please try again later.');
          case 'auth/invalid-credential':
            throw new Error('Invalid email or password. Please check your credentials.');
          default:
            throw error;
        }
      }
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name if provided
      if (firstName && lastName) {
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`
        });
      }
      
      // Send email verification (except for admin email)
      if (email !== 'admin@dailyflame.com') {
        console.log('🔍 [DEBUG] Sign up successful, attempting to send verification email...');
        console.log('👤 [DEBUG] New user created:', {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified,
          displayName: userCredential.user.displayName
        });
        
        try {
          await sendEmailVerification(userCredential.user);
          console.log('✅ [DEBUG] Verification email sent during sign up to:', userCredential.user.email);
        } catch (emailError: any) {
          console.error('❌ [DEBUG] Failed to send verification email during sign up:', emailError);
          // Don't throw here - let the user know they can resend later
          console.warn('⚠️ [DEBUG] Continuing with sign up despite email verification failure');
        }
        
        // Sign the user out immediately so they can't use the account until verified
        console.log('🔐 [DEBUG] Signing user out to enforce email verification');
        await firebaseSignOut(auth);
        console.log('✅ [DEBUG] User signed out successfully after account creation');
      } else {
        console.log('👑 [DEBUG] Admin account created - auto-verified, no email verification needed');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Map Firebase error codes to user-friendly messages
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            throw new Error('An account with this email address already exists.');
          case 'auth/invalid-email':
            throw new Error('Please enter a valid email address.');
          case 'auth/operation-not-allowed':
            throw new Error('Email/password accounts are not enabled. Please contact support.');
          case 'auth/weak-password':
            throw new Error('Password is too weak. Please choose a stronger password.');
          default:
            throw error;
        }
      }
      
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      console.log('AuthContext: Starting Google Sign-In via background script');
      
      // Send message to background script to handle Google authentication
      const response = await new Promise<any>((resolve, reject) => {
        // Set a timeout to prevent hanging if user cancels OAuth
        const timeout = setTimeout(() => {
          reject(new Error('Google sign-in timed out. Please try again.'));
        }, 30000); // 30 second timeout
        
        chrome.runtime.sendMessage({ action: 'googleSignIn' }, (response) => {
          clearTimeout(timeout);
          
          // Check for Chrome runtime errors (e.g., extension context invalidated)
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message || 'Failed to communicate with extension'));
            return;
          }
          
          resolve(response);
        });
      });
      
      if (!response || !response.success) {
        throw new Error(response?.error || 'Google sign-in failed');
      }
      
      const token = response.token;
      const userInfo = response.userInfo;
      
      if (!token) {
        throw new Error('No auth token received from background script');
      }
      
      console.log('AuthContext: Received token from background, creating Firebase credential');

      // Create Firebase credential with the Google token
      const credential = GoogleAuthProvider.credential(null, token);

      // Sign in to Firebase with the credential
      const userCredential = await signInWithCredential(auth, credential);
      
      // Update user profile with photo URL if available from Google
      if (userInfo && userInfo.picture && userCredential.user) {
        try {
          await updateProfile(userCredential.user, {
            photoURL: userInfo.picture,
            displayName: userCredential.user.displayName || userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim()
          });
          console.log('AuthContext: Updated user profile with Google photo and name');
        } catch (profileError) {
          console.warn('AuthContext: Failed to update profile with Google info:', profileError);
        }
      }
      
      console.log('AuthContext: Google sign-in successful');
    } catch (error) {
      console.error('AuthContext: Google sign-in error:', error);
      throw error;
    }
  };


  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    console.log('🔍 [DEBUG] sendVerificationEmail called');
    
    if (!auth.currentUser) {
      console.error('🚨 [DEBUG] No current user found when trying to send verification email');
      throw new Error('No user signed in');
    }
    
    const currentUser = auth.currentUser;
    console.log('👤 [DEBUG] Current user state:', {
      uid: currentUser.uid,
      email: currentUser.email,
      emailVerified: currentUser.emailVerified,
      displayName: currentUser.displayName,
      isAnonymous: currentUser.isAnonymous,
      providerData: currentUser.providerData
    });
    
    try {
      console.log('📧 [DEBUG] Attempting to send verification email to:', currentUser.email);
      await sendEmailVerification(currentUser);
      console.log('✅ [DEBUG] sendEmailVerification() completed successfully');
      console.log('📬 [DEBUG] Verification email should have been sent to:', currentUser.email);
    } catch (error: any) {
      console.error('❌ [DEBUG] Error sending verification email:', error);
      console.error('🔍 [DEBUG] Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Map Firebase email verification errors to user-friendly messages
      if (error.code) {
        switch (error.code) {
          case 'auth/too-many-requests':
            throw new Error('Too many email verification requests. Please wait a few minutes before trying again.');
          case 'auth/user-token-expired':
            throw new Error('Your session has expired. Please sign out and sign back in.');
          case 'auth/network-request-failed':
            throw new Error('Network error. Please check your internet connection and try again.');
          case 'auth/quota-exceeded':
            throw new Error('Email quota exceeded. Please try again later.');
          default:
            throw new Error(`Failed to send verification email: ${error.message}`);
        }
      }
      
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    sendVerificationEmail,
    isAdmin,
    isEmailVerified: isEmailVerifiedCheck,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};