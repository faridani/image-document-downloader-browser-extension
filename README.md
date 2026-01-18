# Image Downloader - Chrome Extension

A powerful Chrome extension that automatically downloads images larger than a specified size while you browse the web. Perfect for collecting reference images, wallpapers, or building image datasets.

## Features

- **Automatic Image Detection**: Detects images as they load on any webpage, including dynamically loaded content
- **Size Filtering**: Only downloads images above your specified minimum dimension (width OR height)
- **CSS Background Images**: Also captures images set as CSS background-image properties
- **Sequential Naming**: Downloads are named `img-1.png`, `img-2.jpg`, etc., for easy organization
- **Custom Destination**: Save images to any folder within your Downloads directory
- **Enable/Disable Toggle**: Quickly pause and resume downloading without changing settings
- **Download Counter**: Track how many images have been downloaded
- **Duplicate Prevention**: Won't download the same image URL twice in a session
- **MutationObserver**: Detects images added dynamically via JavaScript (infinite scroll, lazy loading, etc.)

## Installation

### Quick Install (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the repository folder
6. The extension icon should appear in your toolbar

For detailed installation instructions, see [INSTALLATION.md](INSTALLATION.md).

## Usage Guide

### Basic Usage

1. Click the extension icon in your Chrome toolbar to open the popup
2. Ensure **Enable Downloads** is toggled ON
3. Browse any website - images meeting your criteria will download automatically
4. Check your Downloads folder for the saved images

### Configuration Options

#### Minimum Image Size (pixels)
- **Default**: 600px
- **Description**: Images must have a width OR height greater than or equal to this value
- **Recommended Settings**:
  - `600px` - Good balance, captures most content images
  - `1000px` - High-resolution images only
  - `100px` - Almost all images (use with caution)

#### Destination Folder
- **Default**: `downloaded-images`
- **Description**: Subfolder within your Downloads directory
- **Example**: Setting `my-images` saves to `Downloads/my-images/`
- **Note**: Invalid characters (`< > : " | ? *`) are automatically removed

#### Enable/Disable Toggle
- Quickly pause downloading without losing your settings
- Useful when browsing sites where you don't want to collect images

#### Reset Counter
- Resets the download counter back to 0
- Next downloaded image will be named `img-1.xxx`

### Options Page

Access the full-page options interface by:
- Right-clicking the extension icon → **Options**
- Or navigating to `chrome://extensions/` → Image Downloader → **Details** → **Extension options**

The options page provides the same controls as the popup with additional descriptions and tips.

## How Sequential Naming Works

Images are downloaded with sequential filenames to maintain order:

```
Downloads/
└── downloaded-images/
    ├── img-1.png
    ├── img-2.jpg
    ├── img-3.webp
    ├── img-4.gif
    └── img-5.jpeg
```

**Important behaviors:**
- The counter persists across browser sessions
- Each image gets the next number regardless of file extension
- The counter continues from where it left off when you reopen Chrome
- Use **Reset Counter** to start fresh from `img-1`

## Supported Image Formats

The extension supports the following formats:
- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- GIF (`.gif`)
- WebP (`.webp`)
- BMP (`.bmp`)
- SVG (`.svg`)

If an image URL doesn't have a recognizable extension, `.png` is used as the default.

## Troubleshooting

### Images aren't downloading

1. **Check if enabled**: Ensure the toggle is ON in the popup
2. **Check minimum size**: The image might be smaller than your threshold
   - Right-click the image → Inspect → check natural width/height in the console with `$0.naturalWidth`
3. **Check the URL**: Data URLs (`data:image/...`) are skipped
4. **Reload the page**: The content script may not have loaded; try refreshing

### Duplicate images downloading

- The extension tracks URLs per session
- Reloading the extension or browser clears this memory
- Same image served from different URLs will download separately

### Downloads going to wrong folder

1. Open the popup or options page
2. Check your Destination Folder setting
3. Ensure there are no invalid characters
4. Save settings and refresh the page you're on

### Counter seems wrong

- The counter shows images downloaded (successful downloads only)
- Failed downloads don't increment the counter
- If uncertain, click **Reset Counter** to start fresh

### Extension not appearing

1. Check `chrome://extensions/` for errors
2. Ensure Developer mode is enabled
3. Try removing and re-loading the extension
4. Check that all required files are present in the folder

### Images download but are corrupted

- The extension downloads images as-is from the source URL
- If images are corrupted, the source server may have issues
- Some sites use hotlink protection that may affect downloads

## Privacy & Permissions

This extension requires the following permissions:

| Permission | Purpose |
|------------|---------|
| `storage` | Save your settings and download counter |
| `downloads` | Download images to your computer |
| `activeTab` | Access the current tab to detect images |
| `scripting` | Run the content script that detects images |
| `<all_urls>` | Work on any website you visit |

**The extension does NOT:**
- Collect or transmit any personal data
- Track your browsing history
- Send information to external servers
- Modify webpage content (only reads image data)

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Architecture**: Service Worker + Content Script
- **Image Detection**: MutationObserver for dynamic content
- **Storage**: chrome.storage.local (device-specific)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open source. See the [LICENSE](../LICENSE) file for details.
