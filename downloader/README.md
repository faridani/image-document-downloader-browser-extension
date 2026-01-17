# Image Auto Downloader - Chrome Extension

A Chrome extension that automatically monitors and downloads images from websites based on configurable size thresholds.

## Features

- **Automatic Image Detection**: Monitors all images loaded on web pages as you browse
- **Configurable Size Threshold**: Set a minimum size (in pixels) for images to be downloaded
- **Sequential Naming**: Images are saved with sequential names (img-1.png, img-2.jpg, etc.)
- **Custom Destination Folder**: Specify a folder name where images will be saved
- **Easy Enable/Disable**: Toggle the auto-download feature on/off with a simple switch
- **Persistent Counter**: Image numbering persists across browser sessions
- **Reset Counter**: Reset the image counter back to 1 when needed

## Installation

### Installing from Source

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top-right corner
4. Click "Load unpacked" button
5. Navigate to and select the `downloader` folder from this repository
6. The extension will now be installed and visible in your extensions list

## Usage

### Quick Start

1. Click the extension icon in your Chrome toolbar
2. Toggle "Enable Auto Download" to ON
3. (Optional) Adjust the minimum image size (default: 600px)
4. (Optional) Change the destination folder name (default: downloaded-images)
5. Click "Save Settings"
6. Browse any website - images larger than the threshold will be automatically downloaded

### Configuration

#### Popup Interface
- **Enable Toggle**: Quickly enable or disable auto-downloading
- **Minimum Image Size**: Set the size threshold (images with width OR height >= this value will be downloaded)
- **Destination Folder**: Specify where images should be saved
- **Counter Display**: Shows the next image number
- **Reset Counter**: Reset the numbering back to img-1

#### Options Page
Access the full options page by:
- Right-clicking the extension icon and selecting "Options"
- Or going to `chrome://extensions/` and clicking "Details" > "Extension options"

The options page provides:
- More detailed configuration
- Information about how the extension works
- Current counter status

### How It Works

1. When enabled, the extension monitors all images loaded on web pages
2. For each image, it checks the natural dimensions (width and height)
3. If either dimension is greater than or equal to the configured minimum size, the image is automatically downloaded
4. Images are saved with sequential names: `img-1.png`, `img-2.jpg`, `img-3.webp`, etc.
5. The file extension matches the original image format
6. Images are saved to: `Downloads/{destination-folder}/img-{number}.{extension}`

### Permissions Explained

The extension requires the following permissions:
- **storage**: To save your settings (size threshold, folder name, counter)
- **downloads**: To automatically download images
- **webRequest**: To monitor network requests for images
- **host_permissions (<all_urls>)**: To work on all websites you visit

## Tips

- Start with a higher minimum size (e.g., 1000px) to avoid downloading too many small images
- Create a specific destination folder for each browsing session to organize downloads
- Use the "Reset Counter" button before starting a new download session
- Disable the extension when not actively collecting images to avoid unwanted downloads

## Troubleshooting

### Images aren't being downloaded
- Make sure the extension is enabled (toggle is ON)
- Check that the image size meets or exceeds the minimum threshold
- Verify download permissions are granted in Chrome settings
- Check Chrome's download settings (chrome://settings/downloads) to ensure downloads aren't blocked

### Downloads go to wrong location
- The extension saves to `Downloads/{your-folder-name}/`
- Check your Chrome download location in chrome://settings/downloads
- Make sure the folder name doesn't contain invalid characters

### Counter keeps incrementing
- The counter is designed to persist across sessions
- Use the "Reset Counter" button to start from 1 again

## Development

### File Structure
```
downloader/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for download logic
├── content.js            # Script that monitors images on pages
├── popup.html            # Popup interface HTML
├── popup.js              # Popup interface logic
├── options.html          # Options page HTML
├── options.js            # Options page logic
└── icons/                # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## License

See the LICENSE file in the root of the repository.

## Version

1.0.0
