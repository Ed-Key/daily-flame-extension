import React from 'react';
import { createRoot } from 'react-dom/client';
import VerseOverlay from '../components/VerseOverlay';
import { AuthProvider } from '../components/AuthContext';
import { ToastProvider } from '../components/ToastContext';
import { VerseData, ChromeMessage, ChromeResponse } from '../types';
import { getShadowDomStyles } from '../styles/shadow-dom-styles';
import { VerseService } from '../services/verse-service';
import { getLocalDateString } from '../utils/date-utils';

// Initialize the verse overlay when this script is injected
async function initVerseOverlay() {
    console.log('Daily Flame: Verse app module loaded');
    
    // Check if overlay already exists
    if (document.getElementById('daily-flame-extension-root')) {
        console.log('Daily Flame: Overlay already exists');
        return;
    }
    
    try {
        // Get today's verse directly from VerseService
        console.log('Daily Flame: Fetching daily verse...');
        const verse = await VerseService.getDailyVerse();
        
        if (verse) {
            renderOverlay(verse);
        } else {
            // Fallback to hardcoded verse if API fails
            const fallbackVerse: VerseData = {
                text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
                reference: "Jeremiah 29:11",
                bibleId: "ESV"
            };
            renderOverlay(fallbackVerse);
        }
        
    } catch (error) {
        console.error('Daily Flame: Error creating overlay:', error);
        // Still show overlay with fallback verse
        const fallbackVerse: VerseData = {
            text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
            reference: "Proverbs 3:5-6",
            bibleId: "ESV"
        };
        renderOverlay(fallbackVerse);
    }
}

function renderOverlay(verse: VerseData) {
    // Create high-specificity container for CSS isolation
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'daily-flame-extension-root';
    
    // Apply initial styles to ensure proper isolation
    overlayContainer.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 999999 !important;
        pointer-events: auto !important;
    `;
    
    // Add the overlay container to the page first
    document.body.appendChild(overlayContainer);
    
    // Create Shadow DOM for true style encapsulation
    const shadowRoot = overlayContainer.attachShadow({ mode: 'open' });
    
    // Create a style element for Shadow DOM styles
    const shadowStyles = document.createElement('style');
    shadowStyles.textContent = getShadowDomStyles();
    shadowRoot.appendChild(shadowStyles);
    
    // Create inner container for React app inside Shadow DOM
    const reactContainer = document.createElement('div');
    reactContainer.id = 'daily-flame-overlay';
    shadowRoot.appendChild(reactContainer);
    
    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';
    
    // Create React root inside Shadow DOM
    const root = createRoot(reactContainer);
    
    // Error boundary component
    class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
        constructor(props: {children: React.ReactNode}) {
            super(props);
            this.state = { hasError: false };
        }
        
        static getDerivedStateFromError() {
            return { hasError: true };
        }
        
        componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
            console.error('Daily Flame: React error caught:', error, errorInfo);
        }
        
        render() {
            if (this.state.hasError) {
                return React.createElement('div', {
                    style: { 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        zIndex: 999999
                    }
                }, 'Daily Flame encountered an error. Please refresh the page.');
            }
            
            return this.props.children;
        }
    }
    
    const OverlayApp = () => {
        const handleDismiss = (permanent: boolean = false) => {
            dismissOverlay(permanent);
        };
        
        return React.createElement(ErrorBoundary, { 
            children: React.createElement(ToastProvider, { 
                children: React.createElement(AuthProvider, { 
                    children: React.createElement(VerseOverlay, {
                        verse,
                        onDismiss: handleDismiss,
                        shadowRoot
                    })
                })
            })
        });
    };
    
    root.render(React.createElement(OverlayApp));
}

function dismissOverlay(permanent: boolean = false) {
    try {
        const overlay = document.getElementById('daily-flame-extension-root');
        if (overlay) {
            console.log(`Daily Flame: Dismissing verse overlay (permanent: ${permanent})`);
            
            // Clean up styles first
            document.body.style.overflow = '';
            
            // Remove overlay with a small delay to allow React cleanup
            setTimeout(() => {
                overlay.remove();
            }, 100);
            
            // Only save to storage if it's a permanent dismissal (Done button clicked)
            if (permanent) {
                const today = getLocalDateString();
                chrome.storage.local.set({ verseShownDate: today }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Daily Flame: Error setting verse shown date:', chrome.runtime.lastError);
                    } else {
                        console.log('Daily Flame: Verse marked as done for today');
                    }
                });
            } else {
                console.log('Daily Flame: Temporary dismissal - verse will show again on next tab/reload');
            }
        }
    } catch (error) {
        console.error('Daily Flame: Error dismissing overlay:', error);
    }
}

// Initialize the verse overlay when this script is injected
initVerseOverlay();