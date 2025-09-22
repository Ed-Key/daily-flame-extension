// Minimal monitor script - only checks if verse should be shown
// No heavy imports - just Chrome API calls

import { getLocalDateString } from '../utils/date-utils';

console.log('Daily Bread: Monitor initialized');

async function checkAndLoadVerse() {
  try {
    // Check if verse was already shown today
    const result = await chrome.storage.local.get(['verseShownDate']);
    const today = getLocalDateString();
    
    if (result.verseShownDate === today) {
      console.log('Daily Bread: Verse already shown today');
      return; // Exit early - no need to load anything
    }
    
    // Check if we're on a restricted URL or OAuth page
    const skipSites = [
      "chrome://", 
      "chrome-extension://", 
      "moz-extension://", 
      "extensions", 
      "about:", 
      "file://",
      // OAuth and authentication URLs
      "accounts.google.com",
      "oauth2.googleapis.com", 
      "auth.firebase.com",
      "identitytoolkit.googleapis.com",
      "securetoken.googleapis.com",
      // Microsoft Edge identity redirect
      "login.microsoftonline.com",
      "login.live.com"
    ];
    
    if (skipSites.some(site => window.location.href.includes(site))) {
      console.log('Daily Bread: Skipping restricted/auth URL:', window.location.href);
      return;
    }
    
    console.log('Daily Bread: Loading verse module...');
    
    // Send message to background script to inject verse app
    chrome.runtime.sendMessage({ action: 'injectVerseApp' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Daily Bread: Failed to inject verse app:', chrome.runtime.lastError);
        return;
      }
      
      if (response && response.success) {
        console.log('Daily Bread: Verse app injected successfully');
        // The injected script will handle initialization
      } else {
        console.error('Daily Bread: Failed to inject verse app:', response?.error || 'Unknown error');
      }
    });
    
  } catch (error) {
    console.error('Daily Bread: Error in monitor script:', error);
  }
}

// Check on page load
checkAndLoadVerse();

// Global function to reset and show verse (for extension icon clicks)
(window as any).resetDailyBread = async function() {
  console.log('Daily Bread: Manual reset triggered');
  
  try {
    // Clear the storage to force showing verse
    await chrome.storage.local.remove(['verseShownDate']);
    
    // Send message to background script to inject verse app
    chrome.runtime.sendMessage({ action: 'injectVerseApp' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Daily Bread: Failed to inject verse app:', chrome.runtime.lastError);
        return;
      }
      
      if (response && response.success) {
        console.log('Daily Bread: Verse app injected after reset');
      } else {
        console.error('Daily Bread: Failed to inject verse app:', response?.error || 'Unknown error');
      }
    });
  } catch (error) {
    console.error('Daily Bread: Error during reset:', error);
  }
};