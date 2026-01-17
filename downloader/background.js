const DEFAULT_SETTINGS = {
  minSize: 600,
  folder: "downloader"
};

const processedUrls = new Set();
let sequenceNumber = 1;

async function loadSequence() {
  const result = await chrome.storage.local.get(["sequenceNumber"]);
  if (Number.isInteger(result.sequenceNumber) && result.sequenceNumber > 0) {
    sequenceNumber = result.sequenceNumber;
  }
}

async function getSettings() {
  const result = await chrome.storage.sync.get(["minSize", "folder"]);
  return {
    minSize: Number.isFinite(result.minSize) ? result.minSize : DEFAULT_SETTINGS.minSize,
    folder: result.folder || DEFAULT_SETTINGS.folder
  };
}

async function nextSequenceNumber() {
  const current = sequenceNumber;
  sequenceNumber += 1;
  await chrome.storage.local.set({ sequenceNumber });
  return current;
}

function getExtensionFromBlob(blob, url) {
  if (blob.type) {
    const match = blob.type.match(/image\/(\w+)/);
    if (match) {
      return match[1].toLowerCase();
    }
  }

  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split(".").pop();
    if (extension && extension.length <= 5) {
      return extension.toLowerCase();
    }
  } catch (error) {
    // Ignore URL parsing errors.
  }

  return "png";
}

async function shouldDownloadImage(blob, minSize) {
  try {
    const bitmap = await createImageBitmap(blob);
    const isLargeEnough = Math.max(bitmap.width, bitmap.height) >= minSize;
    bitmap.close();
    return isLargeEnough;
  } catch (error) {
    return false;
  }
}

async function downloadImage(blob, url, folder) {
  const sequence = await nextSequenceNumber();
  const extension = getExtensionFromBlob(blob, url);
  const filename = `${folder.replace(/\/+$/, "")}/img-${sequence}.${extension}`;
  const objectUrl = URL.createObjectURL(blob);

  try {
    await chrome.downloads.download({
      url: objectUrl,
      filename,
      conflictAction: "overwrite",
      saveAs: false
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  }
}

async function handleImageRequest(url) {
  if (processedUrls.has(url)) {
    return;
  }

  processedUrls.add(url);

  try {
    const settings = await getSettings();
    const response = await fetch(url, { credentials: "include" });

    if (!response.ok) {
      return;
    }

    const blob = await response.blob();
    const isLargeEnough = await shouldDownloadImage(blob, settings.minSize);

    if (isLargeEnough) {
      await downloadImage(blob, url, settings.folder);
    }
  } catch (error) {
    // Swallow errors to keep listener alive.
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.get(null, (items) => {
    if (!Object.prototype.hasOwnProperty.call(items, "minSize")) {
      chrome.storage.sync.set({ minSize: DEFAULT_SETTINGS.minSize });
    }
    if (!Object.prototype.hasOwnProperty.call(items, "folder")) {
      chrome.storage.sync.set({ folder: DEFAULT_SETTINGS.folder });
    }
  });
  await loadSequence();
});

chrome.runtime.onStartup.addListener(async () => {
  await loadSequence();
});

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (!details.url) {
      return;
    }
    handleImageRequest(details.url);
  },
  { urls: ["<all_urls>"], types: ["image"] }
);
