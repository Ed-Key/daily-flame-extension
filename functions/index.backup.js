const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Initialize admin SDK - this gives us full database access
admin.initializeApp();

/**
 * Cloud Function: syncUserPreferences
 * Purpose: Securely sync user preferences to Firestore
 * Called by: Chrome Extension when user changes settings
 */
exports.syncUserPreferences = functions.https.onCall(async (data, context) => {
  // SECURITY CHECK #1: Verify user is authenticated
  if (!context.auth) {
    console.error("Unauthenticated request attempted");
    throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in to sync preferences",
    );
  }

  // Extract user info from verified auth token
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email || "No email";

  console.log(
      `[SYNC] Starting preference sync for user: ${userId} (${userEmail})`,
  );

  // VALIDATION: Check if preferences exist and are valid
  const {preferences} = data;

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
exports.getUserPreferences = functions.https.onCall(async (data, context) => {
  // SECURITY CHECK: Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in to get preferences",
    );
  }

  const userId = context.auth.uid;
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

/**
 * Cloud Function: getESVPassage
 * Purpose: Proxy for ESV API to hide API key
 * Called by: Chrome Extension when fetching ESV translations
 */
exports.getESVPassage = functions.https.onCall(async (data, context) => {
  const {reference, includeFootnotes = true,
    includeHeadings = true} = data;

  if (!reference) {
    throw new Error("Reference is required");
  }

  console.log(`[ESV] Fetching passage: ${reference}`);

  try {
    // Get the API key from environment variable
    const ESV_API_KEY = process.env.ESV_API_KEY ||
      process.env.ESV_KEY || // Fallback for different naming
      "d74f42aa54c642a4cbfef2a93c5c67f460f13cdb"; // Hardcoded fallback

    if (!ESV_API_KEY) {
      console.error("[ESV] API key not configured");
      throw new Error("ESV API key not configured");
    }
    // Make the actual API call from the server side
    const params = new URLSearchParams({
      "q": reference,
      "include-footnotes": includeFootnotes.toString(),
      "include-headings": includeHeadings.toString(),
      "include-verse-numbers": "true",
      "include-first-verse-numbers": "true",
      "include-chapter-numbers": "true",
    });

    const response = await fetch(
        `https://api.esv.org/v3/passage/text/?${params}`,
        {
          headers: {
            "Authorization": `Token ${ESV_API_KEY}`,
          },
        },
    );

    if (!response.ok) {
      throw new Error(
          `ESV API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[ESV] ✅ Successfully fetched passage: ${reference}`);

    return {
      success: true,
      data,
      reference,
    };
  } catch (error) {
    console.error(`[ESV] ❌ Error fetching passage:`, error);
    throw new Error(`Failed to fetch ESV passage: ${error.message}`);
  }
});

/**
 * Cloud Function: getNLTPassage
 * Purpose: Proxy for NLT API to hide API key
 * Called by: Chrome Extension when fetching NLT translations
 */
exports.getNLTPassage = functions.https.onCall(async (data, context) => {
  const {reference} = data;

  if (!reference) {
    throw new Error("Reference is required");
  }

  console.log(`[NLT] Fetching passage: ${reference}`);

  try {
    // Get the API key from environment variable
    const NLT_API_KEY = process.env.NLT_API_KEY ||
      process.env.NLT_KEY || // Fallback for different naming
      "d74333ee-8951-45dc-9925-5074a8ad2f07"; // Hardcoded fallback

    if (!NLT_API_KEY) {
      console.error("[NLT] API key not configured");
      throw new Error("NLT API key not configured");
    }
    const nltUrl = "https://api.nlt.to/api/passages?" +
      `ref=${encodeURIComponent(reference)}&version=NLT&key=${NLT_API_KEY}`;
    const response = await fetch(nltUrl);

    if (!response.ok) {
      throw new Error(
          `NLT API returned ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`[NLT] ✅ Successfully fetched passage: ${reference}`);

    return {
      success: true,
      html,
      reference,
    };
  } catch (error) {
    console.error(`[NLT] ❌ Error fetching passage:`, error);
    throw new Error(`Failed to fetch NLT passage: ${error.message}`);
  }
});

/**
 * Cloud Function: getScripturePassage
 * Purpose: Proxy for Scripture.api.bible to hide API key
 * Called by: Chrome Extension when fetching KJV/ASV/WEB translations
 */
exports.getScripturePassage = functions.https.onCall(async (data, context) => {
  const {bibleId, passageId, verseId, searchText} = data;

  // Support different endpoint types
  let url;
  if (searchText) {
    // Search endpoint
    url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/search?query=${encodeURIComponent(searchText)}`;
  } else if (verseId) {
    // Single verse endpoint
    url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verseId}?content-type=html&include-notes=false`;
  } else if (passageId) {
    // Passage endpoint
    url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/passages/${passageId}?content-type=html&include-notes=false`;
  } else {
    throw new Error("Either passageId, verseId, or searchText is required");
  }

  console.log(`[SCRIPTURE] Fetching from: ${url}`);

  try {
    // Get the API key from environment variable
    const SCRIPTURE_API_KEY = process.env.SCRIPTURE_API_KEY ||
      process.env.SCRIPTURE_KEY || // Fallback for different naming
      "58410e50f19ea158ea4902e05191db02"; // Hardcoded fallback

    if (!SCRIPTURE_API_KEY) {
      console.error("[SCRIPTURE] API key not configured");
      throw new Error("Scripture API key not configured");
    }
    const response = await fetch(url, {
      headers: {
        "api-key": SCRIPTURE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SCRIPTURE] API error response:`, errorText);
      throw new Error(
          `Scripture API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[SCRIPTURE] ✅ Successfully fetched passage`);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`[SCRIPTURE] ❌ Error fetching passage:`, error);
    throw new Error(`Failed to fetch Scripture passage: ${error.message}`);
  }
});
