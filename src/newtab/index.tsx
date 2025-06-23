import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import VerseOverlay from '../components/VerseOverlay';
import { AuthProvider } from '../components/AuthContext';
import { ToastProvider } from '../components/ToastContext';
import { VerseData, ChromeMessage, ChromeResponse } from '../types';
import '../styles/globals.css';

const NewTabPage: React.FC = () => {
  const [showVerseOverlay, setShowVerseOverlay] = useState(false);
  const [verse, setVerse] = useState<VerseData | null>(null);

  useEffect(() => {
    // Check if we should show the verse overlay
    checkAndShowVerse();
  }, []);

  const checkAndShowVerse = async () => {
    try {
      // Check if verse should be shown today
      const response = await sendMessage({ action: 'getVerseShownDate' });
      
      if (response && response.shouldShow) {
        console.log('New Tab: Should show verse overlay');
        
        // Get today's verse
        const verseResponse = await sendMessage({ action: 'getDailyVerse' });
        
        if (verseResponse.success) {
          setVerse(verseResponse.verse);
          setShowVerseOverlay(true);
        } else {
          // Fallback verse if API fails
          const fallbackVerse: VerseData = {
            text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
            reference: "Jeremiah 29:11",
            bibleId: "de4e12af7f28f599-02"
          };
          setVerse(fallbackVerse);
          setShowVerseOverlay(true);
        }
      } else {
        console.log('New Tab: Verse already shown today or not needed');
        // If no verse needed, redirect to default new tab immediately
        redirectToDefaultNewTab();
      }
    } catch (error) {
      console.error('New Tab: Error checking verse status:', error);
      // On error, just redirect to default new tab
      redirectToDefaultNewTab();
    }
  };

  const handleDismissVerse = async () => {
    try {
      // Mark verse as shown for today
      await sendMessage({ action: 'setVerseShownDate' });
      console.log('New Tab: Verse dismissed for today');
      
      // Redirect back to default new tab page
      redirectToDefaultNewTab();
    } catch (error) {
      console.error('New Tab: Error dismissing verse:', error);
      // Still redirect even if there's an error
      redirectToDefaultNewTab();
    }
  };

  const redirectToDefaultNewTab = () => {
    // Navigate to chrome's default new tab page
    window.location.href = 'chrome://newtab/';
  };

  const sendMessage = (message: ChromeMessage): Promise<ChromeResponse> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  };

  // If no verse overlay is needed, show loading state while redirecting
  if (!showVerseOverlay && !verse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4">🔥</div>
          <h1 className="text-2xl font-light text-gray-600 mb-2">Daily Flame</h1>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Verse Overlay */}
      {showVerseOverlay && verse && (
        <ToastProvider>
          <AuthProvider>
            <VerseOverlay 
              verse={verse} 
              onDismiss={handleDismissVerse}
            />
          </AuthProvider>
        </ToastProvider>
      )}
    </>
  );
};

// Initialize the React app
const container = document.getElementById('newtab-root');
if (container) {
  const root = createRoot(container);
  root.render(<NewTabPage />);
}