import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { VerseOverlayProps, BIBLE_VERSIONS, BibleTranslation, VerseData } from '../types';
import { VerseService } from '../services/verse-service';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import PasswordInput from './PasswordInput';
import '../styles/globals.css';

const VerseOverlay: React.FC<VerseOverlayProps> = ({ 
  verse, 
  onDismiss,
  shadowRoot
}) => {
  const { user, isAdmin, signIn, signUp, signInWithGoogle, signOut, sendVerificationEmail, isEmailVerified } = useAuth();
  const { showToast } = useToast();
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  
  // GSAP animation refs
  const verseTextRef = useRef<HTMLParagraphElement>(null);
  const verseReferenceRef = useRef<HTMLParagraphElement>(null);
  const verseContentRef = useRef<HTMLDivElement>(null);
  
  // Debug logging
  useEffect(() => {
    console.log('VerseOverlay: Auth state changed', { user, isAdmin });
  }, [user, isAdmin]);
  
  // Admin verse controls state
  const [adminReference, setAdminReference] = useState('');
  const [adminTranslation, setAdminTranslation] = useState<BibleTranslation>('KJV');
  const [adminPreviewVerse, setAdminPreviewVerse] = useState<VerseData | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  
  // Authentication state
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form validation and state
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    // Focus the done button after a short delay
    const timer = setTimeout(() => {
      doneButtonRef.current?.focus();
    }, 100);

    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';

    // Get the event target (shadowRoot or document)
    const eventTarget = shadowRoot || document;

    // Click outside handler for profile dropdown
    const handleClickOutside = (event: Event) => {
      if (showProfileDropdown) {
        const target = event.target as Element;
        if (!target.closest('.profile-dropdown')) {
          setShowProfileDropdown(false);
        }
      }
    };

    // Keyboard shortcut for clearing auth tokens (Ctrl+Shift+C)
    const handleKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.ctrlKey && keyboardEvent.shiftKey && keyboardEvent.key === 'C') {
        keyboardEvent.preventDefault();
        handleClearAuthTokens();
      }
    };

    eventTarget.addEventListener('click', handleClickOutside);
    eventTarget.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
      eventTarget.removeEventListener('click', handleClickOutside);
      eventTarget.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfileDropdown, shadowRoot]);

  // GSAP Animation Setup
  useGSAP(() => {
    console.log('GSAP useGSAP hook running');
    
    // Split verse text into words for word-by-word animation
    if (verseTextRef.current && verseReferenceRef.current && doneButtonRef.current && verseContentRef.current) {
      console.log('All refs are available, setting up animation');
      
      // Ensure parent container is visible
      gsap.set(verseContentRef.current, {
        opacity: 1,
        visibility: 'visible'
      });
      
      // Set initial states for animation elements
      // Don't hide verseTextRef since we're animating the words inside it
      gsap.set([verseReferenceRef.current, doneButtonRef.current], {
        opacity: 0,
        y: 30,
        scale: 0.95,
        visibility: 'visible'
      });
      
      // Keep the verse text container hidden initially
      gsap.set(verseTextRef.current, {
        opacity: 0,
        visibility: 'visible'
      });
      
      const verseWords = verse.text.split(' ');
      const wordSpans = verseWords.map((word, index) => 
        `<span class="verse-word">${word}</span>`
      ).join(' ');
      
      verseTextRef.current.innerHTML = `<span class="verse-quote opening-quote">"</span>${wordSpans}<span class="verse-quote closing-quote">"</span>`;
    
      // Get all animated elements
      const wordElements = verseContentRef.current.querySelectorAll('.verse-word');
      const openingQuote = verseContentRef.current.querySelector('.opening-quote');
      const closingQuote = verseContentRef.current.querySelector('.closing-quote');
      console.log('Found elements:', {
        words: wordElements.length,
        openingQuote: !!openingQuote,
        closingQuote: !!closingQuote
      });
      
      if (wordElements.length > 0 && openingQuote && closingQuote) {
        // Set initial state for all animated elements
        gsap.set([wordElements, openingQuote, closingQuote], {
          opacity: 0,
          y: 20,
          display: 'inline-block'
        });
        
        // Now make the container visible after all elements are hidden
        gsap.set(verseTextRef.current, {
          opacity: 1
        });
        
        // Create timeline for smooth verse reveal
        const tl = gsap.timeline({ 
          delay: 0.3,
          onStart: () => {
            console.log('GSAP timeline started');
          },
          onComplete: () => {
            console.log('GSAP timeline completed');
          }
        });
        
        // Animate opening quote first
        tl.to(openingQuote, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "opacity,transform,y,display"
        })
        // Then animate words one by one with stagger
        .to(wordElements, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08, // 80ms delay between each word
          clearProps: "opacity,transform,y,display"
        }, "-=0.3") // Start slightly before opening quote finishes
        // Animate closing quote after last word
        .to(closingQuote, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "opacity,transform,y,display"
        }, "-=0.2") // Start just before last word finishes
        // Then animate verse reference
        .to(verseReferenceRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "opacity,transform,y,scale"
        }, "-=0.4") // Start before closing quote finishes
        // Finally animate done button
        .to(doneButtonRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          clearProps: "opacity,transform,y,scale"
        }, "-=0.2"); // Start before reference finishes
        
        // Force play the timeline
        tl.play();
      } else {
        console.error('No word elements found to animate');
      }
    } else {
      console.error('One or more refs are null:', {
        verseText: !!verseTextRef.current,
        verseReference: !!verseReferenceRef.current,
        doneButton: !!doneButtonRef.current
      });
    }

  }, { dependencies: [verse.text, verse.reference], scope: verseContentRef });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Disable keyboard dismissal to prevent accidental dismissal when testing admin features
    // Only the "Done" button should dismiss the overlay
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Disable click-to-dismiss to prevent accidental dismissal when testing admin features
    // Only the "Done" button should dismiss the overlay
  };

  const handleAdminPreview = async () => {
    if (!adminReference || !adminTranslation) {
      setAdminError('Please enter a Bible reference and select a translation');
      return;
    }

    setAdminLoading(true);
    setAdminError(null);
    setAdminPreviewVerse(null);

    try {
      const previewVerse = await VerseService.getVerse(adminReference, BIBLE_VERSIONS[adminTranslation]);
      setAdminPreviewVerse(previewVerse);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to load verse');
    } finally {
      setAdminLoading(false);
    }
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordError(validateConfirmPassword(password, confirmPassword));
  };

  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRememberMe(false);
    setAuthError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      await signIn(email, password);
      clearForm();
      setShowSignIn(false);
      showToast('Successfully signed in!', 'success');
    } catch (err: any) {
      // Check if this is a verification error
      if (err.isVerificationError) {
        setAuthError('VERIFICATION_REQUIRED');
      } else {
        setAuthError(err.message || 'Failed to sign in');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await signInWithGoogle();
      setAuthError(null);
      setShowSignIn(false);
      setShowSignUp(false);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in with Google');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setAuthError('Please fill in all fields');
      return;
    }

    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);

    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (confirmPasswordValidation) {
      setConfirmPasswordError(confirmPasswordValidation);
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    try {
      // TODO: Update signUp to accept first/last name
      await signUp(email, password, firstName, lastName);
      clearForm();
      setShowSignUp(false);
      setShowEmailVerification(true);
      showToast('Account created! Please check your email for verification.', 'success');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create account');
    } finally {
      setAuthLoading(false);
    }
  };

  const switchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
    setShowEmailVerification(false);
    clearForm();
  };

  const switchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
    setShowEmailVerification(false);
    clearForm();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowProfileDropdown(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleClearAuthTokens = async () => {
    try {
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ action: 'clearAuthTokens' }, resolve);
      });
      
      if (response && response.success) {
        console.log('Auth tokens cleared successfully');
        showToast('Auth tokens cleared! You can now test with different Google accounts.', 'success');
      } else {
        console.error('Failed to clear auth tokens:', response?.error);
        showToast('Failed to clear auth tokens. Try using Ctrl+Shift+C shortcut or sign out.', 'error');
      }
    } catch (error) {
      console.error('Error clearing auth tokens:', error);
      showToast('Error clearing auth tokens. Try the keyboard shortcut Ctrl+Shift+C.', 'error');
    }
  };

  const getUserInitials = (user: any) => {
    if (user.displayName) {
      return user.displayName.split(' ').map((name: string) => name[0]).join('').toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserAvatar = (user: any) => {
    // For Google users, we might have a photoURL
    if (user.photoURL) {
      return user.photoURL;
    }
    return null;
  };

  const handleResendVerification = async () => {
    try {
      setAuthLoading(true);
      
      // First, sign the user back in temporarily to send verification email
      await signIn(email, password);
      
      // Now send the verification email
      await sendVerificationEmail();
      
      // Sign them back out
      await signOut();
      
      showToast('Verification email sent! Please check your inbox and spam folder.', 'success');
      setAuthError(null);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      showToast('Failed to resend verification email. Please try again.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div 
      className="verse-overlay"
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
      tabIndex={0}
    >
      {/* Top-Right Controls */}
      <div className="absolute top-4 right-4">
        {!user ? (
          /* Sign In Button - Only visible when not authenticated */
          <button
            onClick={() => setShowSignIn(true)}
            className="df-glassmorphism-element px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors backdrop-blur-sm border border-white border-opacity-30"
          >
            Sign In
          </button>
        ) : (
          /* Profile Dropdown - Only visible when authenticated */
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="df-glassmorphism-element flex items-center gap-2 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors backdrop-blur-sm border border-white border-opacity-30"
            >
              {getUserAvatar(user) ? (
                <img
                  src={getUserAvatar(user)}
                  alt="Profile"
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {getUserInitials(user)}
                </div>
              )}
              <span className="text-sm">{user.displayName || user.email?.split('@')[0]}</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="df-glassmorphism-dropdown absolute top-12 right-0 w-64 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 p-2 z-20">
                <div className="px-3 py-2 border-b border-white border-opacity-20 mb-2">
                  <p className="text-white text-sm font-medium">{user.displayName || 'User'}</p>
                  <p className="text-white text-opacity-70 text-xs">{user.email}</p>
                  <div className="mt-1 flex gap-2">
                    {isAdmin && (
                      <span className="inline-block px-2 py-1 bg-green-600 bg-opacity-20 text-green-200 text-xs rounded border border-green-400 border-opacity-50">
                        Admin
                      </span>
                    )}
                    {!isEmailVerified && (
                      <span className="inline-block px-2 py-1 bg-yellow-600 bg-opacity-20 text-yellow-200 text-xs rounded border border-yellow-400 border-opacity-50">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Email Verification Section */}
                {!isEmailVerified && (
                  <button
                    onClick={async () => {
                      try {
                        await sendVerificationEmail();
                        showToast('Verification email sent! Please check your inbox.', 'success');
                      } catch (error) {
                        console.error('Error sending verification email:', error);
                        showToast('Failed to send verification email. Please try again.', 'error');
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-white text-sm hover:bg-white hover:bg-opacity-10 rounded transition-colors"
                  >
                    Resend Verification Email
                  </button>
                )}
                
                {/* Clear Auth Tokens */}
                <button
                  onClick={handleClearAuthTokens}
                  className="w-full text-left px-3 py-2 text-white text-sm hover:bg-white hover:bg-opacity-10 rounded transition-colors"
                  title="Clear auth tokens to test with different Google accounts"
                >
                  Clear Auth Tokens
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-white text-sm hover:bg-white hover:bg-opacity-10 rounded transition-colors border-t border-white border-opacity-20 mt-2 pt-2"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sign-In Modal */}
      {showSignIn && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="df-glassmorphism-modal bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg border border-white border-opacity-20 w-80 max-w-sm relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Sign In</h3>
              <button
                onClick={() => setShowSignIn(false)}
                className="modal-close-btn"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="df-glassmorphism-input w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                disabled={authLoading}
              />
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Password"
                disabled={authLoading}
              />
              
              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 rounded"
                  disabled={authLoading}
                />
                <label htmlFor="rememberMe" className="text-white text-sm">
                  Remember me
                </label>
              </div>
              
              {authError && (
                <div className="p-3 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded text-red-200 text-sm">
                  {authError === 'VERIFICATION_REQUIRED' ? (
                    <div>
                      <p className="mb-2 text-red-200 text-sm">
                        Please verify your email before signing in. Check your inbox for a verification link.
                      </p>
                      <p className="text-red-200 text-sm">
                        Didn't receive an email?{' '}
                        <button
                          onClick={handleResendVerification}
                          disabled={authLoading}
                          className={`text-blue-300 underline bg-transparent border-none text-inherit font-medium p-0 ${authLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {authLoading ? 'Sending...' : 'Resend verification link here'}
                        </button>
                      </p>
                      <p className="mt-2 text-red-200 text-opacity-75 text-xs">
                        Make sure to check your spam folder. Emails can take a few minutes to arrive.
                      </p>
                    </div>
                  ) : (
                    authError
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className={`w-full px-4 py-2 rounded text-sm font-medium border-none transition-colors outline-none bg-blue-600 text-white ${authLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'}`}
                >
                  {authLoading ? 'Signing in...' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className={`w-full px-4 py-2 rounded text-sm font-medium border-none transition-colors outline-none bg-white bg-opacity-20 text-white flex items-center justify-center gap-2 ${authLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-30 cursor-pointer'}`}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </form>
            
            {/* Sign-up link */}
            <div className="mt-4 text-center">
              <p className="text-white text-sm">
                Don't have an account?{' '}
                <button
                  onClick={switchToSignUp}
                  className="text-blue-300 hover:text-blue-200 underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sign-Up Modal */}
      {showSignUp && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="df-glassmorphism-modal bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg border border-white border-opacity-20 w-80 max-w-sm relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Create Account</h3>
              <button
                onClick={() => setShowSignUp(false)}
                className="modal-close-btn"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="df-glassmorphism-input w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  disabled={authLoading}
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="df-glassmorphism-input w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  disabled={authLoading}
                />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="df-glassmorphism-input w-full px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                disabled={authLoading}
              />
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Password"
                disabled={authLoading}
                error={passwordError}
                name="password"
              />
              <div onBlur={handleConfirmPasswordBlur}>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm Password"
                  disabled={authLoading}
                  error={confirmPasswordError}
                  name="confirmPassword"
                />
              </div>
              
              {authError && (
                <div className="p-2 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded text-red-200 text-sm">
                  {authError}
                </div>
              )}
              
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white py-2 px-4 rounded transition-colors"
                >
                  {authLoading ? 'Creating Account...' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:bg-gray-500 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </button>
              </div>
            </form>
            
            {/* Sign-in link */}
            <div className="mt-4 text-center">
              <p className="text-white text-sm">
                Already have an account?{' '}
                <button
                  onClick={switchToSignIn}
                  className="text-blue-300 hover:text-blue-200 underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showEmailVerification && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="df-glassmorphism-modal bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg border border-white border-opacity-20 w-80 max-w-sm relative">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Check Your Email</h3>
              <p className="text-white text-sm mb-4">
                We've sent a verification link to your email address. Please click the link to verify your account before signing in.
              </p>
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    try {
                      await sendVerificationEmail();
                      showToast('Verification email resent!', 'success');
                    } catch (error) {
                      showToast('Failed to resend email. Please try again.', 'error');
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Resend Email
                </button>
                <button
                  onClick={() => {
                    setShowEmailVerification(false);
                    switchToSignIn();
                  }}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={verseContentRef} className="verse-content">

        {/* Admin Controls - Only visible to authenticated admins */}
        {user && isAdmin && (
          <div className="df-glassmorphism-modal mb-8 p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg backdrop-blur-sm">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <span>⚙️</span>
              Admin: Set Daily Verse
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={adminReference}
                  onChange={(e) => setAdminReference(e.target.value)}
                  placeholder="e.g., John 3:16, Psalms 23:1-3"
                  className="df-glassmorphism-input flex-1 px-3 py-2 rounded bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
                <select
                  value={adminTranslation}
                  onChange={(e) => setAdminTranslation(e.target.value as BibleTranslation)}
                  className="df-glassmorphism-input px-3 py-2 rounded bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="KJV" className="text-black">KJV</option>
                  <option value="WEB" className="text-black">WEB</option>
                  <option value="WEB_BRITISH" className="text-black">WEB British</option>
                  <option value="WEB_UPDATED" className="text-black">WEB Updated</option>
                </select>
                <button
                  onClick={handleAdminPreview}
                  disabled={adminLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded transition-colors"
                >
                  {adminLoading ? 'Loading...' : 'Preview'}
                </button>
              </div>
              
              {adminError && (
                <div className="p-2 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded text-red-200 text-sm">
                  {adminError}
                </div>
              )}
              
              {adminPreviewVerse && (
                <div className="p-3 bg-yellow-500 bg-opacity-20 border border-yellow-400 border-opacity-50 rounded">
                  <p className="text-yellow-100 italic mb-2">
                    Preview: "{adminPreviewVerse.text}"
                  </p>
                  <p className="text-yellow-200 font-medium text-sm">
                    {adminPreviewVerse.reference} ({adminTranslation})
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-10">
          <p ref={verseTextRef} className="verse-text" style={{ opacity: 0 }}>
            "{verse.text}"
          </p>
          <p ref={verseReferenceRef} className="verse-reference" style={{ opacity: 0 }}>
            {verse.reference}
          </p>
        </div>
        <button
          ref={doneButtonRef}
          className="verse-done-btn"
          onClick={onDismiss}
          type="button"
          style={{ opacity: 0 }}
        >
          Done
        </button>
      </div>

    </div>
  );
};

export default VerseOverlay;
