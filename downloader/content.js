// Content script to monitor images on web pages

let settings = {
  minSize: 600,
  destinationFolder: 'downloaded-images',
  isEnabled: false
};

let processedImages = new Set();

// Load settings
chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('Error loading settings:', chrome.runtime.lastError);
    return;
  }
  if (response) {
    settings = response;
    if (settings.isEnabled) {
      startMonitoring();
    }
  }
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.minSize) {
    settings.minSize = changes.minSize.newValue;
  }
  if (changes.destinationFolder) {
    settings.destinationFolder = changes.destinationFolder.newValue;
  }
  if (changes.isEnabled) {
    settings.isEnabled = changes.isEnabled.newValue;
    if (settings.isEnabled) {
      startMonitoring();
    }
  }
});

function startMonitoring() {
  // Check if document.body is available
  if (!document.body) {
    console.warn('Document body not available, waiting...');
    document.addEventListener('DOMContentLoaded', startMonitoring, { once: true });
    return;
  }
  
  // Monitor existing images
  checkExistingImages();
  
  // Monitor new images using MutationObserver
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'IMG') {
          checkImage(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('img').forEach(checkImage);
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function checkExistingImages() {
  document.querySelectorAll('img').forEach(checkImage);
}

function checkImage(img) {
  if (!settings.isEnabled) return;
  
  // Skip if already processed
  if (processedImages.has(img.src)) return;
  
  // Wait for image to load if not already loaded
  if (img.complete && img.naturalWidth > 0) {
    processImageIfLargeEnough(img);
  } else {
    img.addEventListener('load', () => processImageIfLargeEnough(img), { once: true });
  }
}

function processImageIfLargeEnough(img) {
  if (!settings.isEnabled) return;
  if (processedImages.has(img.src)) return;
  
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  const minSize = settings.minSize || 600;
  
  if (width >= minSize || height >= minSize) {
    processedImages.add(img.src);
    
    // Send to background script for download
    chrome.runtime.sendMessage({
      action: 'downloadImage',
      imageUrl: img.src,
      imageSize: { width, height }
    });
  }
}
