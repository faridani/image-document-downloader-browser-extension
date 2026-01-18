// Default settings
const DEFAULT_SETTINGS = {
  minSize: 600,
  destinationFolder: 'downloaded-images',
  enabled: true
};

// Track image counter for sequential naming
let imageCounter = 1;

// Initialize settings on install
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(['settings', 'imageCounter']);
  if (!result.settings) {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
  }
  if (result.imageCounter) {
    imageCounter = result.imageCounter;
  }
});

// Load counter on startup
chrome.storage.local.get(['imageCounter'], (result) => {
  if (result.imageCounter) {
    imageCounter = result.imageCounter;
  }
});

// Set to track already downloaded images (by URL)
const downloadedImages = new Set();

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DOWNLOAD_IMAGE') {
    handleImageDownload(message.imageUrl, message.width, message.height);
    sendResponse({ success: true });
  } else if (message.type === 'GET_SETTINGS') {
    chrome.storage.local.get(['settings'], (result) => {
      sendResponse({ settings: result.settings || DEFAULT_SETTINGS });
    });
    return true; // Keep channel open for async response
  } else if (message.type === 'RESET_COUNTER') {
    imageCounter = 1;
    chrome.storage.local.set({ imageCounter: 1 });
    downloadedImages.clear();
    sendResponse({ success: true, counter: imageCounter });
  } else if (message.type === 'GET_COUNTER') {
    sendResponse({ counter: imageCounter });
  }
  return true;
});

async function handleImageDownload(imageUrl, width, height) {
  // Skip if already downloaded
  if (downloadedImages.has(imageUrl)) {
    return;
  }

  // Get current settings
  const result = await chrome.storage.local.get(['settings']);
  const settings = result.settings || DEFAULT_SETTINGS;

  // Check if enabled
  if (!settings.enabled) {
    return;
  }

  // Check if image meets minimum size requirement
  const maxDimension = Math.max(width, height);
  if (maxDimension < settings.minSize) {
    return;
  }

  // Mark as downloaded
  downloadedImages.add(imageUrl);

  // Determine file extension from URL
  let extension = getFileExtension(imageUrl);

  // Create filename with sequential number
  const filename = `${settings.destinationFolder}/img-${imageCounter}${extension}`;

  try {
    // Download the image
    await chrome.downloads.download({
      url: imageUrl,
      filename: filename,
      saveAs: false
    });

    // Increment counter and save
    imageCounter++;
    await chrome.storage.local.set({ imageCounter: imageCounter });

    console.log(`Downloaded: ${filename} (${width}x${height})`);
  } catch (error) {
    console.error('Download failed:', error);
    // Remove from set so it can be retried
    downloadedImages.delete(imageUrl);
  }
}

function getFileExtension(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const match = pathname.match(/\.(png|jpg|jpeg|gif|webp|bmp|svg)(\?|$)/i);
    if (match) {
      return '.' + match[1].toLowerCase();
    }
  } catch (e) {
    // URL parsing failed
  }
  // Default to .png if extension cannot be determined
  return '.png';
}
