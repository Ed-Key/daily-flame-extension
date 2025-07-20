import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

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
    const initializeAuth = async () => {
      console.log('🔍 [DEBUG] Initializing auth from Chrome storage...');
      
      try {
        // Get auth state from Chrome storage
        const result = await chrome.storage.local.get(['authUser', 'authTimestamp']);
        
        if (result.authUser && result.authTimestamp) {
          // Auth state persists indefinitely until user signs out
          console.log('✅ [DEBUG] Restored auth state from storage:', result.authUser);
          // Log how long user has been signed in (for debugging)
          const hoursSignedIn = Math.floor((Date.now() - result.authTimestamp) / (1000 * 60 * 60));
          console.log(`⏱️ [DEBUG] User has been signed in for ${hoursSignedIn} hours`);
          setUser(result.authUser);
        } else {
          console.log('🚪 [DEBUG] No stored auth state found');
        }
      } catch (error) {
        console.error('❌ [DEBUG] Error restoring auth state:', error);
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
    
    // Listen for auth state changes from background script
    const handleMessage = (request: any) => {
      if (request.action === 'authStateChanged') {
        console.log('📡 [DEBUG] Received auth state change from background:', request.user);
        setUser(request.user);
      }
    };
    
    // Listen for storage changes
    const handleStorageChange = (changes: any, namespace: string) => {
      if (namespace === 'local' && changes.authUser) {
        if (changes.authUser.newValue) {
          console.log('💾 [DEBUG] Auth state updated in storage:', changes.authUser.newValue);
          setUser(changes.authUser.newValue);
        } else {
          console.log('🗑️ [DEBUG] Auth state removed from storage');
          setUser(null);
        }
      }
    };
    
    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    if (isSigningIn) {
      console.log('AuthContext: Sign-in already in progress');
      return;
    }
    
    setIsSigningIn(true);
    let storageListener: ((changes: any, namespace: string) => void) | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      console.log('AuthContext: Requesting sign-in via offscreen document');
      
      // Set up storage listener as fallback
      const authCompletePromise = new Promise<FirebaseUser>((resolve, reject) => {
        storageListener = (changes: any, namespace: string) => {
          if (namespace === 'local' && changes.authUser?.newValue) {
            console.log('AuthContext: Detected auth state via storage listener during sign-in');
            resolve(changes.authUser.newValue);
          }
        };
        chrome.storage.onChanged.addListener(storageListener);
        
        timeoutId = setTimeout(() => {
          reject(new Error('Sign-in timeout - please try again'));
        }, 30000);
      });
      
      // Send auth request to background script
      const messagePromise = new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { 
            action: 'auth',
            authAction: 'signInWithEmail',
            authData: { email, password }
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.warn('AuthContext: Message channel error:', chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // Process message response if available
      const response = await Promise.race([
        messagePromise,
        authCompletePromise.then(user => ({ success: true, user }))
      ]);
      
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
    } finally {
      setIsSigningIn(false);
      if (timeoutId) clearTimeout(timeoutId);
      if (storageListener) {
        chrome.storage.onChanged.removeListener(storageListener);
      }
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
    if (isSigningIn) {
      console.log('AuthContext: Sign-in already in progress');
      return;
    }
    
    setIsSigningIn(true);
    let storageListener: ((changes: any, namespace: string) => void) | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      console.log('AuthContext: Requesting Google sign-in via offscreen document');
      
      // Set up storage listener as fallback for lost message channels
      const authCompletePromise = new Promise<FirebaseUser>((resolve, reject) => {
        storageListener = (changes: any, namespace: string) => {
          if (namespace === 'local' && changes.authUser?.newValue) {
            console.log('AuthContext: Detected auth state via storage listener during sign-in');
            resolve(changes.authUser.newValue);
          }
        };
        chrome.storage.onChanged.addListener(storageListener);
        
        // Set timeout to prevent infinite waiting
        timeoutId = setTimeout(() => {
          reject(new Error('Sign-in timeout - please try again'));
        }, 30000); // 30 second timeout
      });
      
      // Send auth request to background script
      const messagePromise = new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { 
            action: 'auth',
            authAction: 'signInWithGoogle',
            authData: {}
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.warn('AuthContext: Message channel error:', chrome.runtime.lastError);
              // Don't reject here, let storage listener handle it
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // Race between message response and storage update
      const result = await Promise.race([
        messagePromise.then(response => {
          if (response?.success && response?.user) {
            return response.user;
          } else if (!response?.success) {
            throw new Error(response?.error?.message || response?.error || 'Sign-in failed');
          }
          return null;
        }),
        authCompletePromise
      ]);
      
      if (result) {
        setUser(result);
        console.log('AuthContext: Google sign-in successful');
      }
    } catch (error) {
      console.error('AuthContext: Error during sign-in:', error);
      throw error;
    } finally {
      setIsSigningIn(false);
      if (timeoutId) clearTimeout(timeoutId);
      if (storageListener) {
        chrome.storage.onChanged.removeListener(storageListener);
      }
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
    
    if (!user) {
      console.error('🚨 [DEBUG] No current user found when trying to send verification email');
      throw new Error('No user signed in');
    }
    
    try {
      console.log('📧 [DEBUG] Requesting verification email via background script');
      
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { 
            action: 'auth',
            authAction: 'sendVerificationEmail',
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
        throw new Error((response as any)?.error?.message || (response as any)?.error || 'Failed to send verification email');
      }
      
      console.log('✅ [DEBUG] Verification email sent successfully');
    } catch (error: any) {
      console.error('❌ [DEBUG] Error sending verification email:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isSigningIn,
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