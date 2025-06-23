import React from 'react';
import { createRoot } from 'react-dom/client';
import VerseOverlay from '../components/VerseOverlay';
import { AuthProvider } from '../components/AuthContext';
import { ToastProvider } from '../components/ToastContext';
import { VerseData, ChromeMessage, ChromeResponse } from '../types';

(function() {
    'use strict';
    
    // Add global function to reset verse (for testing)
    (window as any).resetDailyFlame = function() {
        // If overlay already exists, just clear storage and return
        const existingOverlay = document.getElementById('daily-flame-extension-root');
        if (existingOverlay) {
            console.log('Daily Flame: Overlay already exists, not recreating');
            // Just clear storage to allow showing again
            chrome.runtime.sendMessage({ action: 'clearStorage' }, (response: ChromeResponse) => {
                console.log('Daily Flame: Storage cleared, overlay already visible');
            });
            return;
        }
        
        // Clear storage and show verse overlay immediately
        chrome.runtime.sendMessage({ action: 'clearStorage' }, (response: ChromeResponse) => {
            console.log('Daily Flame: Storage cleared, showing verse overlay');
            // Show verse overlay immediately without page reload
            createVerseOverlay();
        });
    };

    
    const skipSites = [
        "chrome://", 
        "chrome-extension://", 
        "moz-extension://", 
        "extensions",
        "accounts.google.com",
        "accounts.googleapis.com",
        "www.google.com/accounts",
        "oauth.google.com"
    ];
    
    if (skipSites.some(site => window.location.href.includes(site))) {
        console.log('Daily Flame: Skipping restricted site:', window.location.href);
        return;
    }
    
    // Initialize with proper timing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Add small delay to ensure page is fully ready
            setTimeout(initDailyFlame, 100);
        });
    } else {
        // Add small delay for already loaded pages
        setTimeout(initDailyFlame, 100);
    }
    
    let isInitialized = false;
    
    function initDailyFlame() {
        // Prevent multiple initializations
        if (isInitialized) {
            console.log('Daily Flame: Already initialized, skipping');
            return;
        }
        
        console.log('Daily Flame: Initializing on:', window.location.href);
        isInitialized = true;
        
        try {
            chrome.runtime.sendMessage({ action: 'getVerseShownDate' }, (response: ChromeResponse) => {
                if (chrome.runtime.lastError) {
                    console.error('Daily Flame: Runtime error:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.shouldShow) {
                    console.log('Daily Flame: Should show verse, creating overlay');
                    createVerseOverlay();
                } else {
                    console.log('Daily Flame: Verse already shown today or not needed');
                }
            });
        } catch (error) {
            console.error('Daily Flame: Error during initialization:', error);
        }
    }
    
    async function createVerseOverlay() {
        if (document.getElementById('daily-flame-extension-root')) {
            return;
        }
        
        try {
            // Get today's verse from the background script
            const verseResponse = await sendMessage({ action: 'getDailyVerse' });
            
            if (!verseResponse.success) {
                // Fallback to hardcoded verse if API fails
                const fallbackVerse: VerseData = {
                    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
                    reference: "Jeremiah 29:11",
                    bibleId: "de4e12af7f28f599-02"
                };
                renderOverlay(fallbackVerse);
                return;
            }
            
            renderOverlay(verseResponse.verse);
            
        } catch (error) {
            console.error('Daily Flame: Error creating overlay:', error);
            // Still show overlay with fallback verse
            const fallbackVerse: VerseData = {
                text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
                reference: "Proverbs 3:5-6",
                bibleId: "de4e12af7f28f599-02"
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
        
        // Create inner container for React app
        const reactContainer = document.createElement('div');
        reactContainer.id = 'daily-flame-overlay';
        overlayContainer.appendChild(reactContainer);
        
        // Add the overlay container to the page
        document.body.appendChild(overlayContainer);
        
        // Prevent scrolling on the body
        document.body.style.overflow = 'hidden';
        
        // Create React root
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
            const handleDismiss = () => {
                dismissOverlay();
            };
            
            return React.createElement(ErrorBoundary, { 
                children: React.createElement(ToastProvider, { 
                    children: React.createElement(AuthProvider, { 
                        children: React.createElement(VerseOverlay, {
                            verse,
                            onDismiss: handleDismiss
                        })
                    })
                })
            });
        };
        
        root.render(React.createElement(OverlayApp));
    }
    
    function dismissOverlay() {
        try {
            const overlay = document.getElementById('daily-flame-extension-root');
            if (overlay) {
                console.log('Daily Flame: Dismissing verse overlay');
                
                // Clean up styles first
                document.body.style.overflow = '';
                
                // Remove overlay with a small delay to allow React cleanup
                setTimeout(() => {
                    overlay.remove();
                }, 100);
                
                // Save to storage that verse was shown today
                chrome.runtime.sendMessage({ action: 'setVerseShownDate' }, (response: ChromeResponse) => {
                    if (chrome.runtime.lastError) {
                        console.error('Daily Flame: Error setting verse shown date:', chrome.runtime.lastError);
                    } else if (response && response.success) {
                        console.log('Daily Flame: Verse dismissed for today');
                    }
                });
            }
        } catch (error) {
            console.error('Daily Flame: Error dismissing overlay:', error);
        }
    }
    

    function sendMessage(message: ChromeMessage): Promise<ChromeResponse> {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, resolve);
        });
    }
})();