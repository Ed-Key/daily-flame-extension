// Test script to verify Firebase sync with improved message passing
// Run this in the Chrome DevTools console with DailyFlame context selected

console.log('🔧 Starting Firebase Sync Test...\n');

// Test 1: Check local preferences
console.log('📋 Test 1: Checking local preferences...');
chrome.storage.local.get(['userPreferences', 'authUser'], (result) => {
  if (result.userPreferences) {
    console.log('✅ Local preferences found:', result.userPreferences);
  } else {
    console.log('⚠️ No local preferences found');
  }
  
  if (result.authUser) {
    console.log('✅ Auth user found:', result.authUser.email);
    
    // Test 2: Send a test sync request
    console.log('\n📤 Test 2: Sending sync request to Firebase...');
    chrome.runtime.sendMessage({
      action: 'syncPreferences',
      data: {
        userId: result.authUser.uid,
        preferences: {
          bibleTranslation: 'TEST_SYNC',
          theme: 'dark',
          lastModified: Date.now()
        }
      }
    }, (response) => {
      console.log('\n📥 Test 2 Result:');
      if (response && response.success) {
        console.log('✅ Sync successful! Response:', response);
        console.log('🎉 The message passing is now working correctly!');
        console.log('\n📝 Next steps:');
        console.log('1. Check Firebase Console for the updated preferences');
        console.log('2. Look for "TEST_SYNC" in the bibleTranslation field');
        console.log('3. Check the offscreen console for detailed logs');
      } else if (response && !response.success) {
        console.log('❌ Sync failed. Error:', response.error);
        console.log('\n🔍 Debugging tips:');
        console.log('1. Check offscreen console: chrome://extensions/ → offscreen.html');
        console.log('2. Check background console: chrome://extensions/ → service worker');
      } else {
        console.log('⚠️ No response received (response is null/undefined)');
        console.log('This might mean the message channel is still not working properly');
      }
    });
  } else {
    console.log('❌ No auth user found. Please sign in first.');
  }
});

// Test 3: Monitor console logs
console.log('\n📊 Test 3: Monitoring logs...');
console.log('Check the following consoles for detailed logs:');
console.log('1. Background script: chrome://extensions/ → service worker');
console.log('2. Offscreen document: chrome://extensions/ → offscreen.html');
console.log('3. Look for these key messages:');
console.log('   - "Background: Handling preference sync request"');
console.log('   - "Background: Received sync response from offscreen"');
console.log('   - "Offscreen: ✅ Preferences synced to Firestore successfully"');