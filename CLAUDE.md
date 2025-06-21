# 🔥 CLAUDE.md — Daily Flame Chrome Extension

## 🛐 Purpose  
Display a daily Bible verse as a fullscreen overlay when a user first visits any website each day (Canvas, Google, Gmail, etc.). Prevent interaction until they click a "Done" button. This spiritual checkpoint replaces the need to visit a devotional homepage.

---

## 🧩 Core Functionality (Implemented)

- ✅ Inject fullscreen overlay on any page (`<all_urls>`)
- ✅ Display dynamic Bible verses from API.Bible (2,500+ versions)
- ✅ Block interaction until "Done" is clicked
- ✅ Show only **once per calendar day**
- ✅ Store daily state in `chrome.storage.local`
- ✅ Custom new tab page with verse overlay
- ✅ Extension icon click for manual verse access
- ✅ Admin interface for verse management
- ✅ Support for NIV, ESV, KJV, NLT translations

---

## 📁 File Structure

```
daily-flame-extension/
├── manifest.json         # Chrome extension config
├── content.js            # Injects overlay on websites
├── style.css             # Overlay styling
├── background.js         # Service worker + API calls
├── verse-service.js      # API.Bible integration
├── newtab.html          # Custom new tab page
├── newtab.js            # New tab verse logic
├── admin.html           # Admin interface
└── admin.js             # Verse management
```

---

## 🛠️ Setup Instructions

1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load Unpacked**
4. Select `daily-flame-extension/` folder

---

## ⚙️ manifest.json (for Claude to generate)

**Request to Claude**:
> Generate a Manifest V3 config file for a Chrome extension that:
> - Injects `content.js` and `style.css` into all pages (`<all_urls>`)
> - Uses `chrome.storage.local` and `chrome.scripting`
> - Optionally includes a background service worker `background.js`
> - Does not auto-run on Chrome internal pages (e.g., chrome://)

---

## 🎯 content.js Instructions

**Request to Claude**:
> Write `content.js` that:
> - Checks `chrome.storage.local` for a key `verseShownDate`
> - If today’s date ≠ stored date, create a fullscreen overlay:
>   - Black background
>   - Bible verse in white text
>   - "Done" button that removes overlay and stores today’s date
> - Ignore if current tab URL contains "chrome://", "extensions", or other restricted/internal pages

**Example logic**:
```js
const today = new Date().toISOString().split("T")[0];
const skipSites = ["chrome://", "extensions", "newtab"];

if (!skipSites.some(site => window.location.href.includes(site))) {
  chrome.storage.local.get("verseShownDate", ({ verseShownDate }) => {
    if (verseShownDate !== today) {
      // Insert overlay logic here
    }
  });
}
```

---

## 🎨 style.css Instructions

**Request to Claude**:
> Create `style.css` that styles the overlay as:
> - `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: black; z-index: 999999;`
> - Centered white text and a large "Done" button
> - Prevent scrolling and user interaction with underlying content

---

## 🧠 Background.js (Optional Enhancer)

**Optional request to Claude**:
> Write `background.js` that listens for newly opened tabs. If `verseShownDate !== today`, inject `content.js` using `chrome.scripting.executeScript`.

This ensures the verse shows even if the user never refreshes a page or types in the address bar.

---

## 🔧 New Features

### 📊 Admin Interface
Access the admin panel to manage verses:
1. Click the 🔥 extension icon → Admin interface appears
2. **Add verses**: Enter Bible references (e.g., "John 3:16", "Psalms 23:1-3")
3. **Choose translations**: NIV, ESV, KJV, NLT
4. **Preview verses**: Test before adding to collection
5. **Manage collection**: View, preview, and remove verses

### 🌐 API Integration
- **Dynamic verses**: 2,500+ Bible versions via API.Bible
- **No hardcoded content**: All verses fetched from API
- **Error handling**: Alert if API fails (no fallback verses)
- **Loading states**: Smooth loading indicators

### 🎯 Smart Verse Display
- **Daily rotation**: Consistent verse per day across all devices
- **Custom new tab**: Shows verse on new tab opening
- **Manual access**: Click extension icon anytime for verse
- **Automatic**: Appears on first browsing activity each day

---

## 🧪 Test Commands

```bash
# Reset daily check (in service worker console)
chrome.storage.local.clear()

# Test today's verse (in admin interface)
Click "Test Today's Verse" button

# Access admin interface
Click 🔥 extension icon → Opens admin panel

# View extension logs
Right-click on page → Inspect → Console
```

---

## 🔒 Permissions Required

```json
"permissions": ["storage", "activeTab", "scripting"],
"host_permissions": ["<all_urls>", "https://api.scripture.api.bible/*"]
```

---

## ✅ Behavior Notes

- Overlay must **only appear once per day**
- Should work on sites like:
  - `canvas.tufts.edu`
  - `google.com`
  - `mail.google.com`
  - `outlook.office.com`
  - (but not chrome:// pages)
- Avoid persistent UI or icons for now

---

## 📌 Future Features (for roadmap)

| Feature             | Description |
|---------------------|-------------|
| 🎞️ Verse animation  | Animate verse coming from Bible image |
| 📆 Verse history    | Calendar of past verses |
| 🔁 Replay button    | Rerun the verse animation on demand |
| 📝 Notepad sharing  | Users leave notes for others on their home screen |
| 🔐 Admin CMS        | Pull verse from Firebase, JSON, or Sheets |

---

## 🧪 Test Cases to Try

- Open Google.com → verse should appear
- Open Canvas directly → verse should still appear (if first time today)
- Click "Done" → verse should not appear again until tomorrow
- Run `chrome.storage.local.clear()` → triggers verse again

---

## 🧠 Claude Prompt Examples

```md
# Write content.js that:
# - Checks if verseShownDate is today
# - Injects overlay if not, with a dismiss button
# - Saves today’s date when dismissed
```

```md
# Write style.css to make overlay visually full-screen and accessible
```

```md
# Write manifest.json for content script and permissions on <all_urls>
```

---

Let me know if you want to build out the `background.js` or animated entry next!
