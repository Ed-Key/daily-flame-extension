import { UserPreferences, BibleTranslation, FirebaseUser } from '../types';
import { FirestoreService } from './firestore-service';
import CloudFunctionsService from './cloud-functions-service';
import { BIBLE_VERSIONS } from '../types';

export class UserPreferencesService {
  private static readonly PREFERENCES_KEY = 'userPreferences';
  private static readonly SYNC_TIMESTAMP_KEY = 'preferencesSyncTimestamp';
  private static readonly CACHE_DURATION = 30 * 1000; // 30 seconds cache (reduced for testing)
  
  // In-memory cache for current session
  private static cachedPreferences: UserPreferences | null = null;
  private static lastCacheTime: number = 0;

  /**
   * Get default preferences
   */
  private static getDefaultPreferences(): UserPreferences {
    return {
      bibleTranslation: 'ESV',
      theme: 'dark',
      lastModified: Date.now()
    };
  }

  /**
   * Load preferences (hybrid approach)
   * 1. Return cached if fresh
   * 2. Load from local storage
   * 3. If signed in, fetch from Firebase and merge
   */
  static async loadPreferences(user: FirebaseUser | null): Promise<UserPreferences> {
    // Check in-memory cache first
    if (this.cachedPreferences && (Date.now() - this.lastCacheTime) < this.CACHE_DURATION) {
      console.log('UserPreferences: Using cached preferences');
      return this.cachedPreferences;
    }

    try {
      // Load from local storage first (instant)
      const localPrefs = await this.getLocalPreferences();
      
      // If user is not signed in, use local preferences only
      if (!user) {
        console.log('UserPreferences: Using local preferences (not signed in)');
        this.cachedPreferences = localPrefs;
        this.lastCacheTime = Date.now();
        return localPrefs;
      }

      // User is signed in, try to fetch from Firebase via Cloud Function
      try {
        const cloudPrefs = await CloudFunctionsService.getPreferences(user);
        
        if (cloudPrefs) {
          // Cloud preferences exist
          
          // Check if local preferences are just defaults (fresh browser context)
          if ((localPrefs as any).isDefault) {
            // Local is just defaults, always use cloud preferences
            console.log('UserPreferences: Local is default, using cloud preferences');
            await this.saveLocalPreferences(cloudPrefs);
            this.cachedPreferences = cloudPrefs;
            this.lastCacheTime = Date.now();
            return cloudPrefs;
          }
          
          // Local preferences exist (not defaults), check which is newer
          const localModified = localPrefs.lastModified || 0;
          const cloudModified = cloudPrefs.lastModified || 0;
          
          if (cloudModified >= localModified) {
            // Cloud is newer or same, use cloud preferences
            console.log('UserPreferences: Using cloud preferences (newer or same)');
            await this.saveLocalPreferences(cloudPrefs);
            this.cachedPreferences = cloudPrefs;
            this.lastCacheTime = Date.now();
            return cloudPrefs;
          } else {
            // Local is newer (user made changes while offline), sync to cloud
            console.log('UserPreferences: Local is newer, syncing to cloud');
            await this.syncToFirebase(user.uid, localPrefs, user);
            this.cachedPreferences = localPrefs;
            this.lastCacheTime = Date.now();
            return localPrefs;
          }
        } else {
          // No cloud preferences yet
          
          // Only upload local if they're not just defaults
          if (!(localPrefs as any).isDefault) {
            console.log('UserPreferences: No cloud preferences, uploading local (user-modified)');
            await this.syncToFirebase(user.uid, localPrefs, user);
          } else {
            console.log('UserPreferences: No cloud preferences, using local defaults (not syncing)');
          }
          
          this.cachedPreferences = localPrefs;
          this.lastCacheTime = Date.now();
          return localPrefs;
        }
      } catch (error) {
        console.error('UserPreferences: Error fetching from Firebase, using local:', error);
        this.cachedPreferences = localPrefs;
        this.lastCacheTime = Date.now();
        return localPrefs;
      }
    } catch (error) {
      console.error('UserPreferences: Error loading preferences, using defaults:', error);
      const defaults = this.getDefaultPreferences();
      this.cachedPreferences = defaults;
      this.lastCacheTime = Date.now();
      return defaults;
    }
  }

  /**
   * Save a preference (hybrid approach)
   */
  static async savePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
    user: FirebaseUser | null
  ): Promise<void> {
    try {
      // Get current preferences
      const currentPrefs = await this.getLocalPreferences();
      
      // Update the specific preference
      const updatedPrefs: UserPreferences = {
        ...currentPrefs,
        [key]: value,
        lastModified: Date.now()
      };
      
      // Save to local storage immediately
      await this.saveLocalPreferences(updatedPrefs);
      
      // Update cache
      this.cachedPreferences = updatedPrefs;
      this.lastCacheTime = Date.now();
      
      // If user is signed in, sync to Firebase
      if (user) {
        // Don't await this - let it happen in background
        this.syncToFirebase(user.uid, updatedPrefs, user).catch(error => {
          console.error('UserPreferences: Background sync failed:', error);
        });
      }
      
      console.log(`UserPreferences: Saved ${key} = ${value}`);
    } catch (error) {
      console.error('UserPreferences: Error saving preference:', error);
      throw error;
    }
  }

  /**
   * Save Bible translation preference
   */
  static async saveBibleTranslation(
    translation: BibleTranslation,
    user: FirebaseUser | null
  ): Promise<void> {
    return this.savePreference('bibleTranslation', translation, user);
  }

  /**
   * Save theme preference
   */
  static async saveTheme(
    theme: 'light' | 'dark',
    user: FirebaseUser | null
  ): Promise<void> {
    return this.savePreference('theme', theme, user);
  }

  /**
   * Get Bible translation preference
   */
  static async getBibleTranslation(user: FirebaseUser | null): Promise<BibleTranslation> {
    const prefs = await this.loadPreferences(user);
    return prefs.bibleTranslation;
  }

  /**
   * Get theme preference
   */
  static async getTheme(user: FirebaseUser | null): Promise<'light' | 'dark'> {
    const prefs = await this.loadPreferences(user);
    return prefs.theme;
  }

  /**
   * Sync all preferences when user signs in
   */
  static async onSignIn(user: FirebaseUser): Promise<void> {
    console.log('UserPreferences: User signed in, clearing cache and syncing preferences');
    
    // Clear cache to force fresh load from cloud
    this.cachedPreferences = null;
    this.lastCacheTime = 0;
    
    try {
      // Load preferences from cloud (this will check cloud first due to cleared cache)
      const prefs = await this.loadPreferences(user);
      console.log('UserPreferences: Loaded preferences on sign-in:', prefs);
      
      // Also migrate old individual preference keys if they exist
      await this.migrateOldPreferences(user);
    } catch (error) {
      console.error('UserPreferences: Error during sign-in sync:', error);
    }
  }

  /**
   * Clear cache when user signs out
   */
  static async onSignOut(): Promise<void> {
    console.log('UserPreferences: User signed out, clearing cache and local storage');
    this.cachedPreferences = null;
    this.lastCacheTime = 0;
    
    // Clear local storage to ensure fresh load on next sign-in
    await chrome.storage.local.remove([this.PREFERENCES_KEY, this.SYNC_TIMESTAMP_KEY]);
    console.log('UserPreferences: Local storage cleared');
  }

  // Private helper methods

  private static async getLocalPreferences(): Promise<UserPreferences & { isDefault?: boolean }> {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.PREFERENCES_KEY], (result) => {
        if (result[this.PREFERENCES_KEY]) {
          // User has saved preferences locally
          resolve(result[this.PREFERENCES_KEY]);
        } else {
          // Check for old preference keys and migrate
          chrome.storage.local.get(['preferredTranslation', 'themePreference'], (oldResult) => {
            const prefs = this.getDefaultPreferences();
            let hasUserModifications = false;
            
            if (oldResult.preferredTranslation) {
              prefs.bibleTranslation = oldResult.preferredTranslation;
              hasUserModifications = true;
            }
            if (oldResult.themePreference) {
              prefs.theme = oldResult.themePreference;
              hasUserModifications = true;
            }
            
            // Mark as default if no user modifications were found
            if (!hasUserModifications) {
              (prefs as any).isDefault = true;
            }
            
            resolve(prefs);
          });
        }
      });
    });
  }

  private static async saveLocalPreferences(preferences: UserPreferences): Promise<void> {
    return new Promise((resolve, reject) => {
      // Remove the isDefault flag when saving (it's no longer default once saved)
      const prefsToSave = { ...preferences };
      delete (prefsToSave as any).isDefault;
      
      chrome.storage.local.set({ [this.PREFERENCES_KEY]: prefsToSave }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  private static async syncToFirebase(userId: string, preferences: UserPreferences, user?: FirebaseUser | null): Promise<void> {
    console.log('UserPreferences: Starting Cloud Function sync for user:', userId);
    
    try {
      // Use Cloud Function with user object
      const success = await CloudFunctionsService.syncPreferences(preferences, user);
      
      if (success) {
        console.log('UserPreferences: ✅ Preferences synced via Cloud Function');
        
        // Update sync timestamp in local storage
        await chrome.storage.local.set({
          [this.SYNC_TIMESTAMP_KEY]: Date.now()
        });
      } else {
        console.error('UserPreferences: ❌ Cloud Function sync failed');
        // Note: Local storage still has the preferences, so app continues to work
      }
    } catch (error) {
      console.error('UserPreferences: Failed to sync preferences:', error);
      // Silent fail - user can still use the extension with local storage
      // Don't throw - this is a background operation
    }
  }

  private static async migrateOldPreferences(user: FirebaseUser): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['preferredTranslation', 'themePreference'], async (result) => {
        let migrationNeeded = false;
        const currentPrefs = await this.loadPreferences(user);
        
        if (result.preferredTranslation && !currentPrefs.bibleTranslation) {
          currentPrefs.bibleTranslation = result.preferredTranslation;
          migrationNeeded = true;
        }
        
        if (result.themePreference && !currentPrefs.theme) {
          currentPrefs.theme = result.themePreference;
          migrationNeeded = true;
        }
        
        if (migrationNeeded) {
          console.log('UserPreferences: Migrating old preferences');
          await this.saveLocalPreferences(currentPrefs);
          await this.syncToFirebase(user.uid, currentPrefs, user);
          
          // Clean up old keys
          chrome.storage.local.remove(['preferredTranslation', 'themePreference']);
        }
        
        resolve();
      });
    });
  }

  /**
   * Load preferences from Cloud Function
   */
  static async loadFromCloud(userId: string, user?: FirebaseUser | null): Promise<UserPreferences | null> {
    try {
      console.log('UserPreferences: Loading from cloud for user:', userId);
      const cloudPrefs = await CloudFunctionsService.getPreferences(user);
      
      if (cloudPrefs) {
        // Save to local storage for offline access
        await this.saveLocalPreferences(cloudPrefs);
        console.log('UserPreferences: ✅ Loaded from cloud and cached locally');
        return cloudPrefs;
      }
      
      return null;
    } catch (error) {
      console.error('UserPreferences: Failed to load from cloud:', error);
      return null;
    }
  }

  /**
   * Force sync preferences (for testing)
   */
  static async forceSync(user: FirebaseUser | null): Promise<void> {
    if (!user) {
      console.log('UserPreferences: Cannot force sync without user');
      return;
    }
    
    const prefs = await this.getLocalPreferences();
    await this.syncToFirebase(user.uid, prefs, user);
    console.log('UserPreferences: Force sync completed');
  }

  /**
   * Clear all preferences (for testing)
   */
  static async clearAll(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove([this.PREFERENCES_KEY, this.SYNC_TIMESTAMP_KEY], () => {
        this.cachedPreferences = null;
        this.lastCacheTime = 0;
        console.log('UserPreferences: All preferences cleared');
        resolve();
      });
    });
  }
}