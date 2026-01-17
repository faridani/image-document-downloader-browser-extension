// Background service worker for monitoring and downloading images

let imageCounter = 1;
let isEnabled = false;

// Initialize extension settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    minSize: 600,
    destinationFolder: 'downloaded-images',
    isEnabled: false,
    imageCounter: 1
  });
});

// Load settings and counter on startup
chrome.storage.sync.get(['isEnabled', 'imageCounter'], (data) => {
  isEnabled = data.isEnabled || false;
  imageCounter = data.imageCounter || 1;
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadImage') {
    handleImageDownload(request.imageUrl, request.imageSize);
    sendResponse({ success: true });
  } else if (request.action === 'getSettings') {
    chrome.storage.sync.get(['minSize', 'destinationFolder', 'isEnabled'], (data) => {
      sendResponse(data);
    });
    return true; // Will respond asynchronously
  } else if (request.action === 'toggleEnabled') {
    isEnabled = request.enabled;
    chrome.storage.sync.set({ isEnabled: isEnabled });
    sendResponse({ success: true });
  } else if (request.action === 'resetCounter') {
    imageCounter = 1;
    chrome.storage.sync.set({ imageCounter: 1 });
    sendResponse({ success: true });
  }
});

// Handle image download
async function handleImageDownload(imageUrl, imageSize) {
  try {
    const settings = await chrome.storage.sync.get(['minSize', 'destinationFolder', 'isEnabled']);
    
    if (!settings.isEnabled) {
      return;
    }

    const minSize = settings.minSize || 600;
    
    // Check if image is large enough
    if (imageSize.width >= minSize || imageSize.height >= minSize) {
      // Extract file extension from URL
      let extension = 'png';
      const urlMatch = imageUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i);
      if (urlMatch) {
        extension = urlMatch[1].toLowerCase();
        if (extension === 'jpeg') extension = 'jpg';
      }
      
      const filename = `img-${imageCounter}.${extension}`;
      const downloadPath = settings.destinationFolder ? 
        `${settings.destinationFolder}/${filename}` : 
        filename;
      
      // Download the image
      chrome.downloads.download({
        url: imageUrl,
        filename: downloadPath,
        conflictAction: 'uniquify'
      }, (downloadId) => {
        if (downloadId) {
          imageCounter++;
          chrome.storage.sync.set({ imageCounter: imageCounter });
        }
      });
    }
  } catch (error) {
    console.error('Error downloading image:', error);
  }
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.isEnabled) {
    isEnabled = changes.isEnabled.newValue;
  }
  if (changes.imageCounter) {
    imageCounter = changes.imageCounter.newValue;
  }
});
