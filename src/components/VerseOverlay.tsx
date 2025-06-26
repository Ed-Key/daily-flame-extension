import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { VerseOverlayProps, BIBLE_VERSIONS, BibleTranslation, VerseData } from '../types';
import { VerseService } from '../services/verse-service';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import PasswordInput from './PasswordInput';
import { SignInForm, SignUpForm, VerificationReminder } from './forms';

const VerseOverlay: React.FC<VerseOverlayProps> = ({ 
  verse, 
  onDismiss,
  shadowRoot
}) => {
  const { user, isAdmin, signIn, signUp, signInWithGoogle, signOut, sendVerificationEmail, isEmailVerified } = useAuth();
  const { showToast } = useToast();
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  
  // GSAP animation refs
  const overlayRef = useRef<HTMLDivElement>(null);
  const verseTextRef = useRef<HTMLParagraphElement>(null);
  const verseReferenceRef = useRef<HTMLParagraphElement>(null);
  const verseContentRef = useRef<HTMLDivElement>(null);
  const entranceDirectionRef = useRef<'left' | 'right'>('left');
  
  // Debug logging
  useEffect(() => {
    console.log('VerseOverlay: Auth state changed', { user, isAdmin });
  }, [user, isAdmin]);
  
  // Custom dismiss handler with exit animation
  const handleAnimatedDismiss = () => {
    if (overlayRef.current) {
      // Create exit animation timeline
      const tl = gsap.timeline({
        onComplete: () => {
          onDismiss(); // Call the original dismiss function after animation
        }
      });
      
      // Stage 1: Scale down to small size
      tl.to(overlayRef.current, {
        scale: 0.85,  // Match the entrance scale
        duration: 0.4,
        ease: "power2.in"
      })
      
      // Stage 2: Slide out in opposite direction while staying small
      .to(overlayRef.current, {
        xPercent: entranceDirectionRef.current === 'left' ? 100 : -100,  // Exit opposite to entrance
        opacity: 0,
        duration: 0.5,
        ease: "power3.in"
      }, "-=0.1");  // Start slightly before scale completes
    } else {
      onDismiss(); // Fallback if ref not available
    }
  };
  
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
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  
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

  // GSAP Overlay Entrance Animation
  useGSAP(() => {
    if (overlayRef.current) {
      // Randomly choose direction and store it for exit animation
      const direction = Math.random() > 0.5 ? 'left' : 'right';
      entranceDirectionRef.current = direction;
      
      // Set initial states - start small and off-screen
      gsap.set(overlayRef.current, {
        xPercent: direction === 'left' ? -100 : 100,
        scale: 0.85,  // Start at 70% scale
        opacity: 0
      });
      
      // Create animation timeline
      const tl = gsap.timeline({
        onComplete: () => {
          console.log('Overlay entrance animation completed');
        }
      });
      
      // Stage 1: Slide in from side while staying small
      tl.to(overlayRef.current, {
        xPercent: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      })
      
      // Stage 2: Scale up to full size once centered
      .to(overlayRef.current, {
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.2)"  // Slight overshoot for dramatic effect
      }, "-=0.1");  // Start slightly before slide completes
    }
  }, []);

  // GSAP Verse Animation Setup
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
        visibility: 'visible',
        display: 'block'
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
          delay: 0.9, // Delayed to start after overlay entrance animation
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
          clearProps: "opacity,transform,y,scale,display"
        }, "-=0.4") // Start before closing quote finishes
        // Finally animate done button
        .to(doneButtonRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          clearProps: "opacity,transform,y,scale,display"
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

  const switchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
    setShowEmailVerification(false);
  };

  const switchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
    setShowEmailVerification(false);
  };

  const handleVerificationRequired = (email: string) => {
    setVerificationEmail(email);
    setShowSignIn(false);
    setShowEmailVerification(true);
  };

  const handleSignUpSuccess = () => {
    setShowSignUp(false);
    setShowEmailVerification(true);
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

  return (
    <div 
      ref={overlayRef}
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
        <SignInForm
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={switchToSignUp}
          onVerificationRequired={handleVerificationRequired}
        />
      )}

      {/* Sign-Up Modal */}
      {showSignUp && (
        <SignUpForm
          onClose={() => setShowSignUp(false)}
          onSwitchToSignIn={switchToSignIn}
          onSuccess={handleSignUpSuccess}
        />
      )}

      {/* Email Verification Modal */}
      {showEmailVerification && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="df-glassmorphism-modal bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg border border-white border-opacity-20 w-80 max-w-sm relative">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Check Your Email</h3>
              <p className="text-white text-sm mb-4">
                We've sent a verification link to {verificationEmail || 'your email address'}. Please click the link to verify your account before signing in.
              </p>
              {verificationEmail && (
                <VerificationReminder
                  userEmail={verificationEmail}
                  onClose={() => {}}
                />
              )}
              <div className="space-y-2 mt-4">
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
          <p ref={verseTextRef} className="verse-text">
            "{verse.text}"
          </p>
          <p ref={verseReferenceRef} className="verse-reference">
            {verse.reference}
          </p>
        </div>
        <button
          ref={doneButtonRef}
          className="verse-done-btn"
          onClick={handleAnimatedDismiss}
          type="button"
        >
          Done
        </button>
      </div>

    </div>
  );
};

export default VerseOverlay;
