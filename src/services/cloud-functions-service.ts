import { UserPreferences, FirebaseUser } from '../types';

/**
 * Service to handle all Cloud Function calls
 * This replaces direct Firestore access
 * Uses direct HTTP calls with Authorization headers instead of httpsCallable
 * to work around Firebase Auth context isolation in Chrome extensions
 */
class CloudFunctionsService {
  
  /**
   * Get ID token from offscreen document
   */
  private static async getIdToken(): Promise<string | null> {
    try {
      // Send message to offscreen document to get ID token
      const response = await chrome.runtime.sendMessage({
        action: 'getIdToken'
      });
      
      if (response && response.success && response.idToken) {
        return response.idToken;
      }
      
      console.error('CloudFunctionsService: Failed to get ID token:', response?.error);
      return null;
    } catch (error) {
      console.error('CloudFunctionsService: Error getting ID token:', error);
      return null;
    }
  }
  
  /**
   * Sync user preferences to Firestore via Cloud Function
   * @param preferences The user preferences to sync
   * @param user The authenticated Firebase user (used for context, token fetched separately)
   */
  static async syncPreferences(preferences: UserPreferences, user?: FirebaseUser | null): Promise<boolean> {
    console.log('CloudFunctionsService: Starting preference sync');
    
    if (!user) {
      console.error('CloudFunctionsService: No user provided');
      return false;
    }
    
    try {
      // Get ID token from offscreen document
      const idToken = await this.getIdToken();
      
      if (!idToken) {
        console.error('CloudFunctionsService: Failed to get ID token');
        return false;
      }
      
      console.log('CloudFunctionsService: Got ID token for user:', user.uid);
      
      // Make direct HTTP request with Authorization header
      // This bypasses the httpsCallable authentication issues
      const response = await fetch(
        'https://us-central1-daily-flame.cloudfunctions.net/syncUserPreferences',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            data: { preferences }
          })
        }
      );
      
      console.log('CloudFunctionsService: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('CloudFunctionsService: HTTP error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('CloudFunctionsService: Response data:', responseData);
      
      // Handle the response - it might be wrapped in a result object
      const result = responseData.result || responseData;
      
      if (result.success) {
        console.log('CloudFunctionsService: ✅ Sync successful');
        return true;
      } else {
        console.error('CloudFunctionsService: ❌ Sync failed:', result.message);
        return false;
      }
      
    } catch (error: any) {
      console.error('CloudFunctionsService: Error during sync:', error);
      
      // Handle specific error codes
      if (error.message?.includes('unauthenticated')) {
        console.error('CloudFunctionsService: User is not authenticated');
      } else if (error.message?.includes('invalid-argument')) {
        console.error('CloudFunctionsService: Invalid preferences data');
      } else if (error.message?.includes('internal')) {
        console.error('CloudFunctionsService: Server error');
      }
      
      return false;
    }
  }
  
  /**
   * Get user preferences from Firestore via Cloud Function
   * @param user The authenticated Firebase user (used for context, token fetched separately)
   */
  static async getPreferences(user?: FirebaseUser | null): Promise<UserPreferences | null> {
    console.log('CloudFunctionsService: Fetching preferences');
    
    try {
      // Get ID token from offscreen document  
      const idToken = await this.getIdToken();
      
      if (!idToken) {
        console.error('CloudFunctionsService: Failed to get ID token for fetching preferences');
        return null;
      }
      
      console.log('CloudFunctionsService: Got ID token for fetching preferences');
      
      // Make direct HTTP request with Authorization header
      const response = await fetch(
        'https://us-central1-daily-flame.cloudfunctions.net/getUserPreferences',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            data: {}
          })
        }
      );
      
      console.log('CloudFunctionsService: Get response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('CloudFunctionsService: HTTP error:', response.status, errorText);
        return null;
      }
      
      const responseData = await response.json();
      console.log('CloudFunctionsService: Get response data:', responseData);
      
      // Handle the response - it might be wrapped in a result object
      const result = responseData.result || responseData;
      
      if (result.exists && result.preferences) {
        console.log('CloudFunctionsService: ✅ Preferences retrieved');
        return result.preferences;
      } else {
        console.log('CloudFunctionsService: No preferences found');
        return null;
      }
      
    } catch (error: any) {
      console.error('CloudFunctionsService: Failed to get preferences:', error);
      return null;
    }
  }
}

export default CloudFunctionsService;