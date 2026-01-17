# Installation Guide for Image Auto Downloader Chrome Extension

## Prerequisites
- Google Chrome browser (version 88 or higher)
- Access to Chrome's extension management page

## Step-by-Step Installation

### 1. Download the Extension Files
Ensure you have the `downloader` folder with all necessary files:
```
downloader/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── options.html
├── options.js
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### 2. Open Chrome Extensions Page
There are three ways to access the extensions page:

**Method 1:** Type in the address bar:
```
chrome://extensions/
```

**Method 2:** 
- Click the three-dot menu (⋮) in the top-right corner of Chrome
- Go to More Tools → Extensions

**Method 3:**
- Right-click the Chrome toolbar
- Select "Manage extensions"

### 3. Enable Developer Mode
- Look for the "Developer mode" toggle in the top-right corner of the extensions page
- Click the toggle to turn it ON
- You should now see additional buttons appear: "Load unpacked", "Pack extension", "Update"

### 4. Load the Extension
- Click the "Load unpacked" button
- A file browser dialog will open
- Navigate to and select the `downloader` folder (the folder that contains manifest.json)
- Click "Select Folder" (or "Open" on some systems)

### 5. Verify Installation
After loading, you should see:
- The extension card appear in your extensions list
- Extension name: "Image Auto Downloader"
- Version: 1.0.0
- A green/white icon representing the extension
- Toggle switch to enable/disable the extension

### 6. Pin the Extension (Optional but Recommended)
- Click the puzzle piece icon (🧩) in the Chrome toolbar
- Find "Image Auto Downloader" in the list
- Click the pin icon next to it
- The extension icon will now appear directly in your toolbar for easy access

## Post-Installation Setup

### First-Time Configuration
1. Click the extension icon in your toolbar
2. You'll see the popup interface with default settings:
   - Enable Auto Download: OFF (toggle to ON to activate)
   - Minimum Image Size: 600px
   - Destination Folder: "downloaded-images"
   - Next Image Number: 1

3. Configure your preferences:
   - Toggle "Enable Auto Download" to ON
   - Adjust the minimum size if needed (e.g., 800px, 1000px)
   - Change the destination folder name if desired
   - Click "Save Settings"

### Testing the Extension
1. Open the included `test.html` file in Chrome, or visit any website with images
2. Make sure the extension is enabled (toggle is ON)
3. Check your Downloads folder:
   - Look for the folder you specified (default: "downloaded-images")
   - Images larger than your threshold should be downloading automatically
   - Files should be named: img-1.png, img-2.jpg, etc.

## Permissions Explained

When you install the extension, Chrome may show permission warnings. Here's what each permission is used for:

- **Read and change all your data on all websites**: 
  - Allows the extension to monitor images on any website you visit
  - Required to detect and measure image sizes

- **Manage your downloads**:
  - Allows the extension to automatically download images
  - Required to save images to your specified folder

- **Access your data on all websites**:
  - Needed to inject the content script that monitors images
  - The extension does not send any data externally

## Troubleshooting

### Extension Not Appearing
- Make sure you selected the correct folder (the one containing manifest.json)
- Check that all required files are present in the folder
- Try clicking "Update" button on the extensions page

### Extension Shows Errors
- Check the "Errors" button on the extension card
- Common issues:
  - Missing files: Verify all files from the structure above are present
  - Invalid manifest: Make sure manifest.json is valid JSON

### Images Not Downloading
- Verify the extension is enabled (toggle should be ON)
- Check that the minimum size threshold is appropriate
- Ensure Chrome has permission to download files
- Check Chrome's download settings (chrome://settings/downloads)

### Can't Find Downloaded Images
- Check your Chrome download location: chrome://settings/downloads
- Look for a subfolder with the name you specified
- Default location: Downloads/downloaded-images/

## Updating the Extension

If you make changes to the extension code:
1. Go to chrome://extensions/
2. Find "Image Auto Downloader"
3. Click the circular arrow (🔄) icon on the extension card
4. The extension will reload with your changes

## Uninstalling

To remove the extension:
1. Go to chrome://extensions/
2. Find "Image Auto Downloader"
3. Click "Remove"
4. Confirm the removal

Note: This will not delete previously downloaded images.

## Support

For issues or questions:
- Check the README.md file for usage instructions
- Review the troubleshooting section above
- Check browser console for any error messages (F12 → Console)

## Privacy Note

This extension:
- ✓ Works entirely locally in your browser
- ✓ Does not send any data to external servers
- ✓ Does not track your browsing
- ✓ Only downloads images based on your settings
- ✓ All settings are stored locally using Chrome's storage API
