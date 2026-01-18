// Set to track processed images
const processedImages = new Set();

// Process an image element
function processImage(img) {
  // Skip if no src
  if (!img.src || img.src.startsWith('data:')) {
    return;
  }

  // Skip if already processed
  if (processedImages.has(img.src)) {
    return;
  }

  // Get natural dimensions (actual image size, not display size)
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  // Skip if dimensions not loaded yet
  if (width === 0 || height === 0) {
    return;
  }

  // Mark as processed
  processedImages.add(img.src);

  // Send to background script for download
  chrome.runtime.sendMessage({
    type: 'DOWNLOAD_IMAGE',
    imageUrl: img.src,
    width: width,
    height: height
  });
}

// Process all existing images on the page
function processExistingImages() {
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      processImage(img);
    } else {
      img.addEventListener('load', () => processImage(img), { once: true });
    }
  });
}

// Observe for new images added to the DOM
function observeNewImages() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check added nodes
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'IMG') {
          if (node.complete && node.naturalWidth > 0) {
            processImage(node);
          } else {
            node.addEventListener('load', () => processImage(node), { once: true });
          }
        }
        // Check for images inside added nodes
        if (node.querySelectorAll) {
          const images = node.querySelectorAll('img');
          images.forEach((img) => {
            if (img.complete && img.naturalWidth > 0) {
              processImage(img);
            } else {
              img.addEventListener('load', () => processImage(img), { once: true });
            }
          });
        }
      });

      // Check for src attribute changes on img elements
      if (mutation.type === 'attributes' &&
          mutation.attributeName === 'src' &&
          mutation.target.nodeName === 'IMG') {
        const img = mutation.target;
        if (img.complete && img.naturalWidth > 0) {
          processImage(img);
        } else {
          img.addEventListener('load', () => processImage(img), { once: true });
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  });
}

// Also monitor background images in CSS
function processBackgroundImages() {
  const elements = document.querySelectorAll('*');
  elements.forEach((el) => {
    const style = window.getComputedStyle(el);
    const backgroundImage = style.backgroundImage;

    if (backgroundImage && backgroundImage !== 'none') {
      const urlMatch = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:')) {
        const imageUrl = urlMatch[1];

        if (!processedImages.has(imageUrl)) {
          // Load the image to get dimensions
          const img = new Image();
          img.onload = () => {
            processedImages.add(imageUrl);
            chrome.runtime.sendMessage({
              type: 'DOWNLOAD_IMAGE',
              imageUrl: imageUrl,
              width: img.naturalWidth,
              height: img.naturalHeight
            });
          };
          img.src = imageUrl;
        }
      }
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  processExistingImages();
  observeNewImages();
  // Process background images after a short delay
  setTimeout(processBackgroundImages, 1000);
}
