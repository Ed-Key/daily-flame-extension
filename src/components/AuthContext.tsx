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
      console.log('AuthContext: Requesting sign-in via offscreen document');
      
      // Send auth request to background script which will use offscreen document
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { 
            action: 'auth',
            authAction: 'signInWithEmail',
            authData: { email, password }
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      });
      
      if (!(response as any)?.success) {
        const error = (response as any)?.error;
        
        // Handle email verification error specially
        if (error?.code === 'auth/email-not-verified') {
          const verificationError = new Error('VERIFICATION_REQUIRED') as any;
          verificationError.isVerificationError = true;
          verificationError.userEmail = email;
          throw verificationError;
        }
        
        throw new Error(error?.message || error || 'Sign-in failed');
      }
      
      // Update local auth state with the user from response
      const userData = (response as any).user;
      if (userData) {
        setUser(userData);
        console.log('AuthContext: Email sign-in successful');
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
      console.log('AuthContext: Requesting sign-up via offscreen document');
      
      // Send auth request to background script which will use offscreen document
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { 
            action: 'auth',
            authAction: 'signUpWithEmail',
            authData: { email, password }
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      });
      
      if (!(response as any)?.success) {
        throw new Error((response as any)?.error?.message || (response as any)?.error || 'Sign-up failed');
      }
      
      // Update local auth state with the user from response
      const userData = (response as any).user;
      if (userData) {
        setUser(userData);
        
        // If first and last name provided, we'll need to update profile separately
        // Note: This would require additional implementation in offscreen document
        if (firstName && lastName) {
          console.log('AuthContext: Display name update requested but not implemented in offscreen flow');
        }
        
        console.log('AuthContext: Sign-up successful');
        console.log('👤 [DEBUG] New user created:', {
          uid: userData.uid,
          email: userData.email,
          emailVerified: userData.emailVerified,
          displayName: userData.displayName
        });
        
        if ((response as any).needsVerification) {
          console.log('✅ [DEBUG] Verification email sent during sign up to:', userData.email);
          console.log('🔐 [DEBUG] User needs to verify email before signing in');
        }
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
      console.log('AuthContext: Requesting Google sign-in via offscreen document');
      
      // Send auth request to background script which will use offscreen document
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { 
            action: 'auth',
            authAction: 'signInWithGoogle',
            authData: {}
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      });
      
      if (!(response as any)?.success) {
        throw new Error((response as any)?.error?.message || (response as any)?.error || 'Sign-in failed');
      }
      
      // Update local auth state with the user from response
      const userData = (response as any).user;
      if (userData) {
        setUser(userData);
        console.log('AuthContext: Google sign-in successful');
      }
    } catch (error) {
      console.error('AuthContext: Error opening auth tab:', error);
      throw new Error('Failed to open authentication page. Please try again.');
    }
  };


  const signOut = async (): Promise<void> => {
    try {
      console.log('AuthContext: Requesting sign-out via offscreen document');
      
      // Send auth request to background script which will use offscreen document
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { 
            action: 'auth',
            authAction: 'signOut',
            authData: {}
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      });
      
      if (!(response as any)?.success) {
        throw new Error((response as any)?.error?.message || (response as any)?.error || 'Sign-out failed');
      }
      
      // Clear local auth state
      setUser(null);
      console.log('AuthContext: Sign-out successful');
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