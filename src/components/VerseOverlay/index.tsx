import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { VerseOverlayProps, BIBLE_VERSIONS, BibleTranslation, VerseData } from '../../types';
import { VerseService } from '../../services/verse-service';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { SignInForm, SignUpForm, VerificationReminder } from '../forms';

// Import modularized components
import ProfileDropdown from './components/ProfileDropdown';
import AuthButtons from './components/AuthButtons';
import AdminControls from './components/AdminControls';
import VerseDisplay, { VerseDisplayRefs } from './components/VerseDisplay';
import ContextView from './components/ContextView';

const VerseOverlay: React.FC<VerseOverlayProps> = ({ 
  verse, 
  onDismiss,
  shadowRoot
}) => {
  const { user, isAdmin, signIn, signUp, signInWithGoogle, signOut, sendVerificationEmail, isEmailVerified } = useAuth();
  const { showToast } = useToast();
  
  // Modal refs
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const verseContentRef = useRef<HTMLDivElement>(null);
  const verseDisplayRef = useRef<VerseDisplayRefs>(null);
  const entranceDirectionRef = useRef<'left' | 'right'>('left');
  
  // Context view state
  const [showContext, setShowContext] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [chapterContent, setChapterContent] = useState<any>(null);
  const [contextTranslation, setContextTranslation] = useState<BibleTranslation>('KJV');
  const [shouldAnimateLines, setShouldAnimateLines] = useState(false);
  
  // Authentication state
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  
  // Debug logging
  useEffect(() => {
    console.log('VerseOverlay: Auth state changed', { user, isAdmin });
  }, [user, isAdmin]);
  
  // Custom dismiss handler with exit animation (marks as done for the day)
  const handleAnimatedDismiss = () => {
    if (modalRef.current && overlayRef.current) {
      // Create exit animation timeline
      const tl = gsap.timeline({
        onComplete: () => {
          onDismiss(true); // Pass true for permanent dismissal (Done button)
        }
      });
      
      // Remove backdrop blur
      tl.to(overlayRef.current, {
        className: 'verse-overlay', // Remove backdrop-blur class
        duration: 0.2,
        ease: "power2.in"
      })
      
      // Stage 1: Scale down modal to small size
      .to(modalRef.current, {
        scale: 0.85,  // Match the entrance scale
        duration: 0.4,
        ease: "power2.in"
      }, "-=0.1")
      
      // Stage 2: Slide modal out in opposite direction while staying small
      .to(modalRef.current, {
        xPercent: entranceDirectionRef.current === 'left' ? 100 : -100,  // Exit opposite to entrance
        opacity: 0,
        duration: 0.5,
        ease: "power3.in"
      }, "-=0.1");  // Start slightly before scale completes
    } else {
      onDismiss(true); // Fallback if ref not available - treat as permanent
    }
  };

  // Handle More button click
  const handleMoreClick = async () => {
    // Animate modal expansion
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        maxHeight: '90vh',
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          modalRef.current?.classList.add('verse-modal-expanded');
        }
      });
    }
    
    setShowContext(true);
    setContextLoading(true);
    
    // Set initial translation based on current verse
    const translationKey = Object.entries(BIBLE_VERSIONS).find(([_, id]) => id === verse.bibleId)?.[0] as BibleTranslation || 'ESV';
    setContextTranslation(translationKey);
    
    try {
      // Extract book and chapter from verse reference (e.g., "John 3:16" -> "John 3")
      const chapterMatch = verse.reference.match(/^(.+?)\s+(\d+):/);
      if (chapterMatch) {
        const book = chapterMatch[1];
        const chapter = chapterMatch[2];
        const chapterRef = `${book} ${chapter}`;
        
        // Fetch full chapter
        const fullChapter = await VerseService.getChapter(chapterRef, verse.bibleId);
        setChapterContent(fullChapter);
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Failed to load chapter: ${errorMessage}`, 'error');
    } finally {
      setContextLoading(false);
    }
  };

  useEffect(() => {
    // Focus the done button after a short delay
    const timer = setTimeout(() => {
      verseDisplayRef.current?.doneButtonRef.current?.focus();
    }, 100);

    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';

    // Cleanup function
    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, []);

  // Re-animate lines when returning from context view
  useEffect(() => {
    if (shouldAnimateLines && verseDisplayRef.current) {
      const refs = verseDisplayRef.current;
      if (refs.leftLineRef.current && refs.rightLineRef.current) {
        // Remove the animate class first
        refs.leftLineRef.current.classList.remove('animate');
        refs.rightLineRef.current.classList.remove('animate');
        
        // Force a reflow to ensure the removal takes effect
        void refs.leftLineRef.current.offsetWidth;
        void refs.rightLineRef.current.offsetWidth;
        
        // Set initial state with GSAP
        gsap.set([refs.leftLineRef.current, refs.rightLineRef.current], {
          width: '0%'
        });
        
        // Animate lines expanding from center
        gsap.to(refs.leftLineRef.current, {
          width: '40%',
          maxWidth: '200px',
          duration: 0.8,
          ease: "power2.out",
          delay: 0.5,
          onComplete: () => {
            // Add the animate class to maintain the state
            if (refs.leftLineRef.current) {
              refs.leftLineRef.current.classList.add('animate');
              // Clear inline styles since the class will handle the width
              gsap.set(refs.leftLineRef.current, { clearProps: 'width' });
            }
          }
        });
        
        gsap.to(refs.rightLineRef.current, {
          width: '40%',
          maxWidth: '200px',
          duration: 0.8,
          ease: "power2.out",
          delay: 0.5,
          onComplete: () => {
            // Add the animate class to maintain the state
            if (refs.rightLineRef.current) {
              refs.rightLineRef.current.classList.add('animate');
              // Clear inline styles since the class will handle the width
              gsap.set(refs.rightLineRef.current, { clearProps: 'width' });
            }
          }
        });
        
        // Reset the flag
        setShouldAnimateLines(false);
      }
    }
  }, [shouldAnimateLines, verseDisplayRef.current]);

  // GSAP Modal Entrance Animation with Backdrop Blur
  useGSAP(() => {
    if (overlayRef.current && modalRef.current) {
      // Randomly choose direction and store it for exit animation
      const direction = Math.random() > 0.5 ? 'left' : 'right';
      entranceDirectionRef.current = direction;
      
      // Set initial states - backdrop visible but no blur
      gsap.set(overlayRef.current, {
        opacity: 1,
        className: 'verse-overlay' // No backdrop-blur class initially
      });
      
      // Set modal initial state - start small and off-screen
      gsap.set(modalRef.current, {
        xPercent: direction === 'left' ? -100 : 100,
        scale: 0.85,  // Start at 85% scale
        opacity: 0
      });
      
      // Create animation timeline
      const tl = gsap.timeline({
        onComplete: () => {
          console.log('Modal entrance animation completed');
        }
      });
      
      // Stage 1: Slide modal in from side while staying small
      tl.to(modalRef.current, {
        xPercent: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      })
      
      // Stage 2: Add backdrop blur effect (fast)
      .to(overlayRef.current, {
        className: 'verse-overlay backdrop-blur',
        duration: 0.3,
        ease: "power2.out"
      }, "-=0.2") // Start slightly before modal finishes sliding
      
      // Stage 3: Scale modal up to full size
      .to(modalRef.current, {
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.2)"  // Slight overshoot for dramatic effect
      }, "-=0.2");  // Overlap with blur animation
    }
  }, []);

  // GSAP Verse Animation Setup
  useGSAP(() => {
    console.log('GSAP useGSAP hook running for verse animation');
    
    // Get refs from VerseDisplay component
    const refs = verseDisplayRef.current;
    if (!refs || !verseContentRef.current) return;

    const { verseTextRef, verseReferenceRef, doneButtonRef, moreButtonRef, leftLineRef, rightLineRef } = refs;
    
    // Split verse text into letters for letter-by-letter animation
    if (verseTextRef.current && verseReferenceRef.current && doneButtonRef.current && moreButtonRef.current && verseContentRef.current) {
      console.log('All refs are available, setting up animation');
      
      // Ensure parent container is visible
      gsap.set(verseContentRef.current, {
        opacity: 1,
        visibility: 'visible'
      });
      
      // Set initial states for animation elements
      gsap.set([verseReferenceRef.current, doneButtonRef.current, moreButtonRef.current], {
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
      
      // Split text into words first, then letters within each word
      const words = verse.text.split(' ');
      const wordSpans = words.map((word, wordIndex) => {
        const letters = word.split('').map((letter, letterIndex) => 
          `<span class="verse-letter">${letter}</span>`
        ).join('');
        return `<span class="verse-word">${letters}</span>`;
      }).join(' '); // Join words with regular spaces
      
      verseTextRef.current.innerHTML = `<span class="verse-quote opening-quote">"</span>${wordSpans}<span class="verse-quote closing-quote">"</span>`;
    
      // Get all animated elements
      const letterElements = verseContentRef.current.querySelectorAll('.verse-letter');
      const openingQuote = verseContentRef.current.querySelector('.opening-quote');
      const closingQuote = verseContentRef.current.querySelector('.closing-quote');
      console.log('Found elements:', {
        letters: letterElements.length,
        openingQuote: !!openingQuote,
        closingQuote: !!closingQuote
      });
      
      if (letterElements.length > 0 && openingQuote && closingQuote) {
        // Set initial state for quotes
        gsap.set([openingQuote, closingQuote], {
          opacity: 0,
          display: 'inline-block'
        });
        
        // Set initial state for letters with minimal glow
        gsap.set(letterElements, {
          opacity: 0,
          display: 'inline-block',
          textShadow: "0px 0px 1px rgba(255,255,255,0.1)"
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
        
        // Animate opening quote first with glow
        tl.fromTo(openingQuote, {
          opacity: 0,
          textShadow: "0px 0px 1px rgba(255,255,255,0.1)"
        }, {
          opacity: 1,
          textShadow: "0px 0px 20px rgba(255,255,255,0.9)",
          duration: 0.5,
          ease: "power2.out"
        })
        .to(openingQuote, {
          textShadow: "0px 0px 0px rgba(255,255,255,0)",
          duration: 0.3,
          ease: "power2.out"
        }, "-=0.1");
        
        // Animate letters with staggered parallel execution matching CodePen
        tl.to(letterElements, {
          keyframes: [
            { opacity: 0, textShadow: "0px 0px 1px rgba(255,255,255,0.1)", duration: 0 },
            { opacity: 1, textShadow: "0px 0px 20px rgba(255,255,255,0.9)", duration: 0.462 }, // 66% of 0.7
            { opacity: 1, textShadow: "0px 0px 20px rgba(255,255,255,0.9)", duration: 0.077 }, // 77% - 66% = 11%
            { opacity: 0.7, textShadow: "0px 0px 20px rgba(255,255,255,0.0)", duration: 0.161 } // 100% - 77% = 23%
          ],
          duration: 0.7,
          ease: "none", // Linear to match CSS animation
          stagger: 0.05 // 50ms delay between each letter start
        }, "-=0.3");
        
        // Animate closing quote with glow
        tl.fromTo(closingQuote, {
          opacity: 0,
          textShadow: "0px 0px 1px rgba(255,255,255,0.1)"
        }, {
          opacity: 1,
          textShadow: "0px 0px 20px rgba(255,255,255,0.9)",
          duration: 0.5,
          ease: "power2.out"
        }, "-=0.2")
        .to(closingQuote, {
          textShadow: "0px 0px 0px rgba(255,255,255,0)",
          duration: 0.3,
          ease: "power2.out"
        }, "-=0.1")
        
        // Then animate verse reference with lines
        .to(verseReferenceRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "opacity,transform,y,scale,display",
          onComplete: () => {
            // Animate the decorative lines after reference appears
            if (leftLineRef.current && rightLineRef.current) {
              leftLineRef.current.classList.add('animate');
              rightLineRef.current.classList.add('animate');
            }
          }
        }, "-=0.4")
        
        // Add final whole sentence glow effect - gradual build-up
        .to([letterElements, openingQuote, closingQuote], {
          opacity: 1,
          textShadow: "0px 0px 15px rgba(255,255,255,0.8)",
          duration: 1.2,  // Slower, more gradual glow build-up
          ease: "power2.inOut"
        }, "+=0.3") // Wait after reference settles before starting glow
        
        // Finally animate buttons
        .to([doneButtonRef.current, moreButtonRef.current], {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          clearProps: "opacity,transform,y,scale,display",
          stagger: 0.1
        }, "-=0.4");
        
        // Force play the timeline
        tl.play();
      } else {
        console.error('No letter elements found to animate');
      }
    } else {
      console.error('One or more refs are null');
    }

  }, { dependencies: [verse.text, verse.reference], scope: verseContentRef });

  // Custom shrink dismissal for backdrop click (temporary dismiss)
  const handleShrinkDismiss = () => {
    if (modalRef.current && overlayRef.current) {
      // Create shrink animation timeline
      const tl = gsap.timeline({
        onComplete: () => {
          onDismiss(false); // Temporary dismissal
        }
      });
      
      // Shrink and fade out the modal
      tl.to(modalRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
      })
      // Also fade out the backdrop
      .to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      }, "-=0.3"); // Start slightly after modal starts shrinking
    } else {
      onDismiss(false); // Fallback if refs not available
    }
  };
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Check if click was on the backdrop (not the modal)
    if (e.target === e.currentTarget) {
      // Use shrink animation for temporary dismissal
      handleShrinkDismiss();
    }
  };
  
  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent clicks inside modal from bubbling to backdrop
    e.stopPropagation();
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


  // Handle context translation change
  const handleContextTranslationChange = async (newTranslation: string) => {
    // Store the current chapter reference before clearing content
    const currentChapterRef = chapterContent?.reference;
    
    // Clear the chapter content immediately to prevent rendering mismatch
    setChapterContent(null);
    setContextTranslation(newTranslation as BibleTranslation);
    setContextLoading(true);
    
    try {
      // Use the stored reference
      if (currentChapterRef) {
        const bibleId = BIBLE_VERSIONS[newTranslation as BibleTranslation];
        
        // Fetch chapter in new translation
        const fullChapter = await VerseService.getChapter(currentChapterRef, bibleId);
        setChapterContent(fullChapter);
      }
    } catch (error) {
      console.error('Error fetching chapter in new translation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Failed to load chapter: ${errorMessage}`, 'error');
    } finally {
      setContextLoading(false);
    }
  };

  // Handle back from context view
  const handleBackFromContext = () => {
    // Animate modal back to original size
    if (modalRef.current) {
      modalRef.current.classList.remove('verse-modal-expanded');
      gsap.to(modalRef.current, {
        maxHeight: '85vh',
        duration: 0.4,
        ease: "power2.out"
      });
    }
    
    setShowContext(false);
    
    // Use requestAnimationFrame to wait for the next paint
    requestAnimationFrame(() => {
      // Wait one more frame to ensure React has rendered
      requestAnimationFrame(() => {
        setShouldAnimateLines(true);
      });
    });
  };

  return (
    <>
      <div 
        ref={overlayRef}
        className="verse-overlay"
        onClick={handleOverlayClick}
        tabIndex={0}
      >
        {/* Modal Container */}
        <div ref={modalRef} className="verse-modal" onClick={handleModalClick}>

          {/* Top-Right Controls */}
          <div className="absolute top-4 right-4">
            {!user ? (
              <AuthButtons onSignInClick={() => setShowSignIn(true)} />
            ) : (
              <ProfileDropdown
                user={user}
                isAdmin={isAdmin}
                isEmailVerified={isEmailVerified}
                onSignOut={signOut}
                shadowRoot={shadowRoot}
              />
            )}
          </div>

          <div ref={verseContentRef} className="verse-content">
            {/* Admin Controls - Only visible to authenticated admins */}
            {user && isAdmin && !showContext && (
              <AdminControls />
            )}

            {/* Main verse view */}
            {!showContext ? (
              <VerseDisplay
                ref={verseDisplayRef}
                verse={verse}
                onDone={handleAnimatedDismiss}
                onMore={handleMoreClick}
                shadowRoot={shadowRoot}
                isAdmin={isAdmin}
              />
            ) : (
              /* Context view */
              <ContextView
                verse={verse}
                chapterContent={chapterContent}
                contextLoading={contextLoading}
                contextTranslation={contextTranslation}
                onBack={handleBackFromContext}
                onDone={handleAnimatedDismiss}
                onTranslationChange={handleContextTranslationChange}
              />
            )}
          </div>

        </div>
      </div>
      
      {/* Auth Modals - Rendered outside verse overlay for proper layering */}
      {showSignIn && (
        <SignInForm
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={switchToSignUp}
          onVerificationRequired={handleVerificationRequired}
        />
      )}

      {showSignUp && (
        <SignUpForm
          onClose={() => setShowSignUp(false)}
          onSwitchToSignIn={switchToSignIn}
          onSuccess={handleSignUpSuccess}
        />
      )}

      {showEmailVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000001]">
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
    </>
  );
};

export default VerseOverlay;