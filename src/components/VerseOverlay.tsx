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
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);
  const rightLineRef = useRef<HTMLDivElement>(null);
  
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
  
  // Handle scroll for context fade effect
  const handleContextScroll = () => {
    if (contextContainerRef.current && fadeOverlayRef.current) {
      const scrollHeight = contextContainerRef.current.scrollHeight;
      const scrollTop = contextContainerRef.current.scrollTop;
      const clientHeight = contextContainerRef.current.clientHeight;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;
      
      console.log('Scroll debug:', {
        scrollHeight,
        scrollTop,
        clientHeight,
        scrollBottom,
        shouldHide: scrollBottom <= 5
      });
      
      // If we're within 5 pixels of the bottom, hide the fade
      if (scrollBottom <= 5) {
        fadeOverlayRef.current.classList.add('hidden');
      } else {
        fadeOverlayRef.current.classList.remove('hidden');
      }
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
    const translationKey = Object.entries(BIBLE_VERSIONS).find(([_, id]) => id === verse.bibleId)?.[0] as BibleTranslation || 'KJV';
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
        
        // Set up scroll listener after content loads
        setTimeout(() => {
          if (contextContainerRef.current) {
            contextContainerRef.current.addEventListener('scroll', handleContextScroll);
            // Initial check
            handleContextScroll();
          }
          
          // Animate the title underline
          const underline = modalRef.current?.querySelector('.context-title-underline');
          if (underline) {
            setTimeout(() => {
              underline.classList.add('animate');
            }, 200);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
      showToast('Failed to load chapter context', 'error');
    } finally {
      setContextLoading(false);
    }
  };
  
  // Admin verse controls state
  const [adminReference, setAdminReference] = useState('');
  const [adminTranslation, setAdminTranslation] = useState<BibleTranslation>('KJV');
  const [adminPreviewVerse, setAdminPreviewVerse] = useState<VerseData | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  
  // Context view state
  const [showContext, setShowContext] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [chapterContent, setChapterContent] = useState<any>(null);
  const [contextTranslation, setContextTranslation] = useState<BibleTranslation>('KJV');
  const contextContainerRef = useRef<HTMLDivElement>(null);
  const fadeOverlayRef = useRef<HTMLDivElement>(null);
  
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
    console.log('GSAP useGSAP hook running');
    
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
        // .to([letterElements, openingQuote, closingQuote], {
        //   opacity: 0.7,
        //   textShadow: "0px 0px 0px rgba(255,255,255,0)",
        //   duration: 0.3,
        //   ease: "power2.out"
        // }, "+=1") // Hold the glow for 0.4 seconds before fading
        
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
      console.error('One or more refs are null:', {
        verseText: !!verseTextRef.current,
        verseReference: !!verseReferenceRef.current,
        doneButton: !!doneButtonRef.current,
        moreButton: !!moreButtonRef.current,
        verseContent: !!verseContentRef.current
      });
    }

  }, { dependencies: [verse.text, verse.reference], scope: verseContentRef });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Disable keyboard dismissal to prevent accidental dismissal when testing admin features
    // Only the "Done" button should dismiss the overlay
  };

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

  // Get translation name from bibleId
  const getTranslationName = (bibleId: string): string => {
    const entry = Object.entries(BIBLE_VERSIONS).find(([_, id]) => id === bibleId);
    return entry ? entry[0] : 'KJV';
  };

  // Handle context translation change
  const handleContextTranslationChange = async (newTranslation: BibleTranslation) => {
    setContextTranslation(newTranslation);
    setContextLoading(true);
    
    try {
      // Extract book and chapter from current chapter reference
      const chapterMatch = chapterContent?.reference?.match(/^(.+?)\s+(\d+)$/);
      if (chapterMatch) {
        const chapterRef = chapterContent.reference;
        const bibleId = BIBLE_VERSIONS[newTranslation];
        
        // Fetch chapter in new translation
        const fullChapter = await VerseService.getChapter(chapterRef, bibleId);
        setChapterContent(fullChapter);
        
        // Set up scroll listener after content loads
        setTimeout(() => {
          if (contextContainerRef.current) {
            contextContainerRef.current.addEventListener('scroll', handleContextScroll);
            // Initial check
            handleContextScroll();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching chapter in new translation:', error);
      showToast('Failed to load chapter in selected translation', 'error');
    } finally {
      setContextLoading(false);
    }
  };

  // Handle back from context view
  const handleBackFromContext = () => {
    // Remove scroll listener
    if (contextContainerRef.current) {
      contextContainerRef.current.removeEventListener('scroll', handleContextScroll);
    }
    
    // Animate modal back to original size
    if (modalRef.current) {
      modalRef.current.classList.remove('verse-modal-expanded');
      gsap.to(modalRef.current, {
        maxHeight: '85vh',
        duration: 0.4,
        ease: "power2.out"
      });
    }
    
    // Re-animate the verse reference lines using GSAP
    if (leftLineRef.current && rightLineRef.current) {
      // Remove the animate class first
      leftLineRef.current.classList.remove('animate');
      rightLineRef.current.classList.remove('animate');
      
      // Set initial state with GSAP
      gsap.set([leftLineRef.current, rightLineRef.current], {
        width: '0%'
      });
      
      // Animate lines expanding from center after a delay
      gsap.to(leftLineRef.current, {
        width: '40%',
        maxWidth: '200px',
        duration: 0.8,
        ease: "power2.out",
        delay: 0.5,
        onComplete: () => {
          // Add the animate class to maintain the state
          if (leftLineRef.current) {
            leftLineRef.current.classList.add('animate');
            // Clear inline styles since the class will handle the width
            gsap.set(leftLineRef.current, { clearProps: 'width' });
          }
        }
      });
      
      gsap.to(rightLineRef.current, {
        width: '40%',
        maxWidth: '200px',
        duration: 0.8,
        ease: "power2.out",
        delay: 0.5,
        onComplete: () => {
          // Add the animate class to maintain the state
          if (rightLineRef.current) {
            rightLineRef.current.classList.add('animate');
            // Clear inline styles since the class will handle the width
            gsap.set(rightLineRef.current, { clearProps: 'width' });
          }
        }
      });
    }
    
    setShowContext(false);
  };

  // Parse and render context verses
  const renderContextVerses = () => {
    if (!chapterContent || !chapterContent.content) return null;

    // Extract current verse number from reference
    const currentVerseMatch = verse.reference.match(/:(\d+)/);
    const currentVerseNumber = currentVerseMatch ? parseInt(currentVerseMatch[1]) : null;

    // Check if we should use KJV formatting (each verse as separate paragraph)
    const useKJVFormatting = contextTranslation === 'KJV' || contextTranslation === 'ASV';

    // Parse content and render verses with paragraph support
    const paragraphs: React.JSX.Element[] = [];
    let currentParagraph: React.JSX.Element[] = [];
    let currentVerseContent: React.ReactNode[] = [];
    let currentVerseNum = '';
    let paragraphKey = 0;
    let currentParagraphStyle = '';
    
    const addVerseToParagraph = (verseNum: string, verseContent: React.ReactNode[]) => {
      if (verseNum) {
        const verseNumber = parseInt(verseNum);
        const isHighlighted = verseNumber === currentVerseNumber;
        
        if (useKJVFormatting) {
          // For KJV/ASV: Each verse is its own paragraph with style
          let verseClasses = `context-paragraph kjv-verse ${isHighlighted ? 'highlighted-verse' : ''}`;
          
          // Apply poetry styles to KJV verses too
          if (currentParagraphStyle === 'q1') {
            verseClasses += ' poetry-q1';
          } else if (currentParagraphStyle === 'q2') {
            verseClasses += ' poetry-q2';
          } else if (currentParagraphStyle === 'd') {
            // For descriptors, use special styling
            paragraphs.push(
              <p key={`verse-${verseNum}`} className="psalm-descriptor">
                {verseContent}
              </p>
            );
            return;
          }
          
          paragraphs.push(
            <p key={`verse-${verseNum}`} className={verseClasses}>
              <strong className="context-verse-number">{verseNum}</strong>
              {verseContent.length > 0 && <span className="verse-text-content">{verseContent}</span>}
            </p>
          );
        } else {
          // For other translations: Group verses by paragraphs
          currentParagraph.push(
            <span key={`verse-${verseNum}`} className={isHighlighted ? 'highlighted-verse' : ''}>
              <sup className="context-verse-number">{verseNum}</sup>
              {verseContent.length > 0 && <span className="verse-text-content">{verseContent} </span>}
            </span>
          );
        }
      }
    };

    const finishParagraph = () => {
      if (currentParagraph.length > 0) {
        // Determine CSS classes based on paragraph style
        let paragraphClasses = "context-paragraph";
        if (currentParagraphStyle === 'q1') {
          paragraphClasses += " poetry-q1";
        } else if (currentParagraphStyle === 'q2') {
          paragraphClasses += " poetry-q2";
        } else if (currentParagraphStyle === 'd') {
          paragraphClasses = "psalm-descriptor"; // Replace default class for descriptors
        } else if (currentParagraphStyle === 'b') {
          paragraphClasses += " poetry-break";
        }
        
        paragraphs.push(
          <p key={`para-${paragraphKey++}`} className={paragraphClasses}>
            {currentParagraph}
          </p>
        );
        currentParagraph = [];
      }
    };
    
    // Helper function to recursively extract text from nested items
    const extractTextFromItems = (items: any[], isWordsOfJesus: boolean = false, isTranslatorAddition: boolean = false, isDivineName: boolean = false): React.ReactNode[] => {
      const elements: React.ReactNode[] = [];
      
      items.forEach((item: any, index: number) => {
        if (item.type === 'text') {
          const text = item.text || '';
          if (text.trim()) {
            // Apply appropriate classes based on parent styles
            if (isDivineName) {
              // Divine name (LORD) - takes precedence
              elements.push(
                <span key={`nd-${index}`} className="divine-name">{text}</span>
              );
            } else if (isWordsOfJesus && isTranslatorAddition) {
              // Both styles apply
              elements.push(
                <span key={`woj-add-${index}`} className="words-of-jesus translator-addition">{text}</span>
              );
            } else if (isWordsOfJesus) {
              // Only words of Jesus
              elements.push(
                <span key={`woj-${index}`} className="words-of-jesus">{text}</span>
              );
            } else if (isTranslatorAddition) {
              // Only translator addition
              elements.push(
                <span key={`add-${index}`} className="translator-addition">{text}</span>
              );
            } else {
              // Plain text
              elements.push(text);
            }
          } else if (text) {
            // Keep whitespace even if not trimmed
            elements.push(text);
          }
        } else if (item.type === 'tag' && item.items) {
          // Check style types
          const isWoj = item.name === 'char' && item.attrs?.style === 'wj';
          const isAdd = item.name === 'char' && item.attrs?.style === 'add';
          const isNd = item.name === 'char' && item.attrs?.style === 'nd';
          // Recursively get text from nested tags, preserving parent styles
          elements.push(...extractTextFromItems(
            item.items, 
            isWoj || isWordsOfJesus, 
            isAdd || isTranslatorAddition,
            isNd || isDivineName
          ));
        }
      });
      
      return elements;
    };
    
    // Debug logging
    console.log('Chapter content structure:', chapterContent);
    
    chapterContent.content.forEach((section: any) => {
      // Each section is a paragraph with a style
      if (section.type === 'tag' && section.name === 'para') {
        // Get the paragraph style
        currentParagraphStyle = section.attrs?.style || 'p';
        
        // Process items within this paragraph
        if (section.items) {
          let i = 0;
          while (i < section.items.length) {
            const item = section.items[i];
            
            if (item.type === 'tag' && item.name === 'verse') {
            // Add previous verse to current paragraph (even if empty)
            if (currentVerseNum) {
              addVerseToParagraph(currentVerseNum, currentVerseContent);
            }
            
            // Start new verse
            currentVerseNum = item.attrs?.number || '';
            currentVerseContent = [];
            i++;
            
            // Collect all content until the next verse or para tag
            while (i < section.items.length) {
              const nextItem = section.items[i];
              if (nextItem.type === 'tag' && (nextItem.name === 'verse' || nextItem.name === 'para')) {
                break;
              }
              
              if (nextItem.type === 'text') {
                currentVerseContent.push(nextItem.text || '');
              } else if (nextItem.type === 'tag' && nextItem.items) {
                // Check if this is a words of Jesus tag, translator addition, or divine name before extracting content
                const isWoj = nextItem.name === 'char' && nextItem.attrs?.style === 'wj';
                const isAdd = nextItem.name === 'char' && nextItem.attrs?.style === 'add';
                const isNd = nextItem.name === 'char' && nextItem.attrs?.style === 'nd';
                if (isWoj) {
                  console.log('Found words of Jesus tag in verse', currentVerseNum, nextItem);
                }
                if (isAdd) {
                  console.log('Found translator addition tag in verse', currentVerseNum, nextItem);
                }
                if (isNd) {
                  console.log('Found divine name tag in verse', currentVerseNum, nextItem);
                }
                // Extract content from nested tags (like char)
                currentVerseContent.push(...extractTextFromItems(nextItem.items, isWoj, isAdd, isNd));
              }
              i++;
            }
          } else {
            i++;
          }
        }
        
        // Finish processing this paragraph section
        if (currentVerseNum) {
          addVerseToParagraph(currentVerseNum, currentVerseContent);
          currentVerseContent = [];
          currentVerseNum = '';
        }
        
        // For non-KJV, finish the paragraph after processing all its verses
        if (!useKJVFormatting) {
          finishParagraph();
        }
      }
      }
    });

    // Add the last verse (even if empty)
    if (currentVerseNum) {
      addVerseToParagraph(currentVerseNum, currentVerseContent);
    }
    
    // Finish the last paragraph
    if (!useKJVFormatting) {
      finishParagraph();

      // If no paragraph tags were found, put all verses in one paragraph
      if (paragraphs.length === 0 && currentParagraph.length > 0) {
        paragraphs.push(
          <p key="para-single" className="context-paragraph">
            {currentParagraph}
          </p>
        );
      }
    }

    return paragraphs;
  };

  return (
    <>
      <div 
        ref={overlayRef}
        className="verse-overlay"
        onKeyDown={handleKeyDown}
        onClick={handleOverlayClick}
        tabIndex={0}
      >
        {/* Modal Container */}
        <div ref={modalRef} className="verse-modal" onClick={handleModalClick}>

      {/* Top-Right Controls */}
      <div className="absolute top-4 right-4">
        {!user ? (
          /* Sign In Button - Only visible when not authenticated */
          <button
            onClick={() => setShowSignIn(true)}
            className="df-glassmorphism-element px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            Sign In
          </button>
        ) : (
          /* Profile Dropdown - Only visible when authenticated */
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="df-glassmorphism-element flex items-center gap-2 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors backdrop-blur-sm"
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


      <div ref={verseContentRef} className="verse-content">

        {/* Admin Controls - Only visible to authenticated admins */}
        {user && isAdmin && !showContext && (
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
                  <option value="ASV" className="text-black">ASV</option>
                  <option value="ESV" className="text-black">ESV</option>
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

        {/* Main verse view */}
        {!showContext ? (
          <>
            <div className="mb-10">
              <p ref={verseTextRef} className="verse-text">
                "{verse.text}"
              </p>
              <div className="verse-reference-container">
                <div ref={leftLineRef} className="verse-reference-line left"></div>
                <p ref={verseReferenceRef} className="verse-reference">
                  {verse.reference} {getTranslationName(verse.bibleId)}
                </p>
                <div ref={rightLineRef} className="verse-reference-line right"></div>
              </div>
            </div>
            <div className="verse-button-container">
              <button
                ref={doneButtonRef}
                className="verse-btn"
                onClick={handleAnimatedDismiss}
                type="button"
              >
                Done
              </button>
              <button
                ref={moreButtonRef}
                className="verse-btn verse-more-btn"
                onClick={handleMoreClick}
                type="button"
              >
                More
              </button>
            </div>
          </>
        ) : (
          /* Context view */
          <div className="context-view-container">
            <button 
              className="context-back-btn"
              onClick={handleBackFromContext}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back
            </button>

            {contextLoading ? (
              <div className="context-loading">Loading chapter...</div>
            ) : chapterContent ? (
              <>
                <div className="context-header">
                  <div className="context-title-row">
                    <h2 className="context-title">{chapterContent.reference}</h2>
                    <select
                      value={contextTranslation}
                      onChange={(e) => handleContextTranslationChange(e.target.value as BibleTranslation)}
                      className="context-translation-select"
                      disabled={contextLoading}
                    >
                      <option value="KJV">King James Version</option>
                      <option value="ASV">American Standard Version</option>
                      <option value="ESV">English Standard Version</option>
                      <option value="WEB">World English Bible</option>
                      <option value="WEB_BRITISH">WEB British Edition</option>
                      <option value="WEB_UPDATED">WEB Updated</option>
                    </select>
                  </div>
                  <div className="context-title-underline"></div>
                  {chapterContent.content && chapterContent.content.length > 0 && chapterContent.content[0].items && chapterContent.content[0].items[0]?.text && (
                    <p className="context-subtitle">{chapterContent.content[0].items[0].text}</p>
                  )}
                </div>

                <div className="context-scroll-container">
                  <div className="context-content" ref={contextContainerRef}>
                    <div className="context-verses">
                      {renderContextVerses()}
                    </div>
                  </div>
                  <div className="context-fade" ref={fadeOverlayRef}></div>
                </div>

                <div className="context-button-fixed">
                  <button
                    className="verse-btn"
                    onClick={handleAnimatedDismiss}
                    type="button"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : null}
          </div>
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
