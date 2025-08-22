import { UserPreferences, FirebaseUser } from '../types';

/**
 * Service to handle Firestore operations via iframe
 * The iframe (auth-handler.js) has Firebase Auth context and can access Firestore directly
 * This service just sends messages to the iframe and receives responses
 */
class CloudFunctionsService {
  
  /**
   * Save user preferences to Firestore via iframe
   * @param preferences The user preferences to sync
   * @param user The authenticated Firebase user
   */
  static async syncPreferences(preferences: UserPreferences, user?: FirebaseUser | null): Promise<boolean> {
    console.log('CloudFunctionsService: Sending preferences to iframe for saving');
    
    if (!user) {
      console.error('CloudFunctionsService: No user provided');
      return false;
    }
    
    try {
      // Send message to iframe via background script
      const response = await chrome.runtime.sendMessage({
        action: 'savePreferencesToIframe',
        data: { 
          preferences,
          userId: user.uid 
        }
      });
      
      if (response && response.success) {
        console.log('CloudFunctionsService: ✅ Preferences saved successfully');
        return true;
      } else {
        console.error('CloudFunctionsService: ❌ Failed to save preferences:', response?.error);
        return false;
      }
      
    } catch (error: any) {
      console.error('CloudFunctionsService: Error saving preferences:', error);
      return false;
    }
  }
  
  /**
   * Load user preferences from Firestore via iframe
   * @param user The authenticated Firebase user
   */
  static async getPreferences(user?: FirebaseUser | null): Promise<UserPreferences | null> {
    console.log('CloudFunctionsService: Requesting preferences from iframe');
    
    try {
      // Send message to iframe via background script
      const response = await chrome.runtime.sendMessage({
        action: 'loadPreferencesFromIframe',
        data: {
          userId: user?.uid
        }
      });
      
      if (response && response.success) {
        if (response.exists && response.preferences) {
          console.log('CloudFunctionsService: ✅ Preferences loaded successfully');
          return response.preferences;
        } else {
          console.log('CloudFunctionsService: No preferences found in Firestore');
          return null;
        }
      } else {
        console.error('CloudFunctionsService: ❌ Failed to load preferences:', response?.error);
        return null;
      }
      
    } catch (error: any) {
      console.error('CloudFunctionsService: Error loading preferences:', error);
      return null;
    }
  }
}

export default CloudFunctionsService;