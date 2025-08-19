const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// Initialize admin SDK - this gives us full database access
admin.initializeApp();

/**
 * Cloud Function: syncUserPreferences
 * Purpose: Securely sync user preferences to Firestore
 * Called by: Chrome Extension when user changes settings
 */
exports.syncUserPreferences = onCall(async (request) => {
  // SECURITY CHECK #1: Verify user is authenticated
  if (!request.auth) {
    console.error("Unauthenticated request attempted");
    throw new Error("You must be signed in to sync preferences");
  }

  // Extract user info from verified auth token
  const userId = request.auth.uid;
  const userEmail = request.auth.token.email || "No email";

  console.log(
      `[SYNC] Starting preference sync for user: ${userId} (${userEmail})`,
  );

  // VALIDATION: Check if preferences exist and are valid
  const {preferences} = request.data;

  if (!preferences) {
    throw new Error("No preferences provided");
  }

  // Validate required fields
  if (!preferences.bibleTranslation) {
    throw new Error("Bible translation is required");
  }

  try {
    // FIRESTORE WRITE: Using admin SDK (bypasses all permission checks)
    const db = admin.firestore();
    const userDocRef = db.collection("users").doc(userId);

    // Prepare data to save
    const dataToSave = {
      // User info
      email: userEmail,
      lastActive: admin.firestore.FieldValue.serverTimestamp(),

      // Preferences with server timestamp
      preferences: {
        bibleTranslation: preferences.bibleTranslation,
        theme: preferences.theme || "dark",
        autoDisplay: preferences.autoDisplay !== undefined ?
          preferences.autoDisplay : true,
        lastModified: preferences.lastModified || Date.now(),
        lastSynced: admin.firestore.FieldValue.serverTimestamp(),
      },

      // Metadata
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: "cloud-function",
    };

    // Write to Firestore (merge: true means don't overwrite other fields)
    await userDocRef.set(dataToSave, {merge: true});

    console.log(`[SYNC] ✅ Successfully synced preferences for user: ${userId}`);

    // Return success response
    return {
      success: true,
      message: "Preferences synced successfully",
      syncedAt: new Date().toISOString(),
      userId: userId,
    };
  } catch (error) {
    console.error(`[SYNC] ❌ Error for user ${userId}:`, error);
    throw new Error(`Failed to sync preferences: ${error.message}`);
  }
});

/**
 * Cloud Function: getUserPreferences
 * Purpose: Retrieve user preferences from Firestore
 * Called by: Chrome Extension when user signs in
 */
exports.getUserPreferences = onCall(async (request) => {
  // SECURITY CHECK: Verify user is authenticated
  if (!request.auth) {
    throw new Error("You must be signed in to get preferences");
  }

  const userId = request.auth.uid;
  console.log(`[GET] Fetching preferences for user: ${userId}`);

  try {
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      console.log(`[GET] No preferences found for user: ${userId}`);
      return {
        exists: false,
        preferences: null,
        message: "No saved preferences",
      };
    }

    const userData = userDoc.data();
    console.log(`[GET] ✅ Found preferences for user: ${userId}`);

    return {
      exists: true,
      preferences: userData.preferences,
      lastSynced: userData.updatedAt,
      message: "Preferences retrieved successfully",
    };
  } catch (error) {
    console.error(`[GET] ❌ Error for user ${userId}:`, error);
    throw new Error(`Failed to get preferences: ${error.message}`);
  }
});
