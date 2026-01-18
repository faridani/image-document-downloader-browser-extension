# Image Downloader - Detailed Installation Guide

This guide walks you through installing the Image Downloader Chrome extension step by step.

## Prerequisites

- Google Chrome browser (version 88 or later recommended)
- The extension files downloaded to your computer

## Installation Steps

### 1. Download the Extension

If you haven't already, download the extension files:

**Option A - Clone with Git:**
```bash
git clone https://github.com/your-username/image-document-downloader-browser-extension.git
```

**Option B - Download ZIP:**
1. Download the repository as a ZIP file
2. Extract it to a location you'll remember (e.g., `Documents/Extensions/`)

### 2. Open Chrome Extensions Page

Open Google Chrome and navigate to the extensions page using one of these methods:

**Method A - URL Bar:**
1. Type `chrome://extensions/` in the address bar
2. Press Enter

**Method B - Menu:**
1. Click the three-dot menu (⋮) in the top-right corner
2. Go to **More tools** → **Extensions**

**Method C - Keyboard Shortcut:**
- Windows/Linux: No default shortcut, use URL method
- Mac: No default shortcut, use URL method

### 3. Enable Developer Mode

Developer mode is required to load unpacked (local) extensions:

1. Look for the **Developer mode** toggle in the top-right corner of the extensions page
2. Click the toggle to turn it **ON**
3. You should see additional buttons appear: "Load unpacked", "Pack extension", and "Update"

![Developer mode toggle location](https://via.placeholder.com/600x100/f0f0f0/333?text=Developer+Mode+Toggle+→+Top+Right+Corner)

### 4. Load the Extension

1. Click the **Load unpacked** button
2. A file browser dialog will open
3. Navigate to where you extracted/cloned the extension
4. Select the **`downloader`** folder (the folder containing `manifest.json`)
5. Click **Select Folder** (Windows) or **Open** (Mac)

**Important:** Select the `downloader` folder specifically, not the parent repository folder!

```
image-document-downloader-browser-extension/
├── downloader/          ← Select THIS folder
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   ├── options.html
│   ├── options.js
│   └── icons/
├── LICENSE
└── README.md
```

### 5. Verify Installation

After loading, you should see:

1. **Extension card** on the `chrome://extensions/` page showing:
   - Name: "Image Downloader"
   - Version: 1.0
   - A toggle to enable/disable
   - An "Errors" link (should be empty)

2. **Extension icon** in your Chrome toolbar:
   - If you don't see it, click the puzzle piece icon (Extensions menu)
   - Click the pin icon next to "Image Downloader" to keep it visible

### 6. Pin the Extension (Recommended)

For easy access:

1. Click the puzzle piece icon in the Chrome toolbar
2. Find "Image Downloader" in the list
3. Click the pin icon to pin it to the toolbar
4. The extension icon will now always be visible

## Post-Installation Setup

### Initial Configuration

1. Click the extension icon in the toolbar
2. The popup will open with default settings:
   - Enable Downloads: ON
   - Minimum Size: 600px
   - Destination Folder: downloaded-images
3. Adjust settings as needed and click **Save Settings**

### Verify It's Working

1. Visit a website with large images (e.g., Unsplash, Pexels)
2. Check your Downloads folder for a new `downloaded-images` subfolder
3. Images larger than 600px should appear automatically

## Troubleshooting Installation

### "Manifest file is missing or unreadable"

- You selected the wrong folder
- Make sure you select the `downloader` folder that contains `manifest.json`

### "Could not load manifest"

- The `manifest.json` file might be corrupted
- Re-download the extension files
- Ensure the JSON is valid (no syntax errors)

### Extension doesn't appear after loading

1. Check for any red error badges on the extension card
2. Click "Errors" to see what went wrong
3. Common issues:
   - Missing files (ensure all JS files are present)
   - Syntax errors in JavaScript files
   - Invalid manifest.json format

### "Service worker registration failed"

1. Check that `background.js` exists in the `downloader` folder
2. Look for JavaScript syntax errors in the file
3. Try removing and re-loading the extension

### Extension icon is grayed out

- The extension is disabled
- Go to `chrome://extensions/` and toggle it ON

## Updating the Extension

When you make changes to the extension files:

1. Go to `chrome://extensions/`
2. Find the Image Downloader card
3. Click the **refresh icon** (circular arrow) on the card
4. Or click the **Update** button at the top of the page

For content script changes, you may also need to reload the webpage you're testing.

## Uninstalling

To remove the extension:

1. Go to `chrome://extensions/`
2. Find the Image Downloader card
3. Click **Remove**
4. Confirm when prompted

Your downloaded images will remain in your Downloads folder.

## Installing on Other Chromium Browsers

This extension should also work on:
- **Microsoft Edge**: Use `edge://extensions/`
- **Brave**: Use `brave://extensions/`
- **Opera**: Use `opera://extensions/` (may require enabling developer mode)
- **Vivaldi**: Use `vivaldi://extensions/`

The process is identical - just use the respective extensions URL.

---

## Need Help?

If you encounter issues not covered here:
1. Check the [README.md](README.md) for usage troubleshooting
2. Open an issue on the GitHub repository
3. Include any error messages from the Chrome console (F12 → Console tab)
