# Chrome Extension Cache Clear Instructions

If you're experiencing authentication issues or the extension is using outdated code, follow these steps to completely clear the cache:

## Method 1: Clear Extension Data (Recommended)

1. Open Chrome and go to: `chrome://settings/content/all`
2. Search for "daily-flame" or your extension ID
3. Click on the site entry
4. Click "Clear data" or the trash icon
5. Reload the extension from `chrome://extensions`

## Method 2: Complete Extension Reinstall

1. Go to `chrome://extensions`
2. Find "Daily Flame" extension
3. Click "Remove" to uninstall completely
4. Close all Chrome windows
5. Reopen Chrome
6. Go to `chrome://extensions`
7. Click "Load unpacked" and select the `dist` folder again

## Method 3: Developer Cache Clear

1. Open Chrome DevTools (F12) on any page
2. Go to Application tab
3. Find "Storage" in the left sidebar
4. Click "Clear site data"
5. Make sure all checkboxes are selected
6. Click "Clear site data" button

## Verify Fresh Code is Loading

After clearing cache, you should see these logs in the console:
- `🚀 AUTH HANDLER V2.0 LOADED - Fresh script execution`
- Timestamps in the format `[2024-01-13T...] Message`
- "Clearing existing auth state before sign-in" messages

## Additional Tips

- Use Incognito mode to test with a fresh environment
- Hold Ctrl+F5 (Windows) or Cmd+Shift+R (Mac) for hard reload
- Check the Network tab in DevTools to ensure fresh files are loaded