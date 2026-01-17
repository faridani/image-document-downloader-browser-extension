const DEFAULT_SETTINGS = {
  minSizePx: 600,
  destinationFolder: "image-downloads"
};

const IMG_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".tiff", ".avif"];

const inFlightExtensionDownloads = new Set();

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    chrome.storage.sync.set(settings);
  });
});

function isImageDownload(item) {
  if (item.mime && item.mime.startsWith("image/")) {
    return true;
  }
  const url = item.url || "";
  return IMG_EXTENSIONS.some((ext) => url.toLowerCase().includes(ext));
}

function sanitizeFolderName(folder) {
  if (!folder || typeof folder !== "string") {
    return DEFAULT_SETTINGS.destinationFolder;
  }
  return folder.replace(/^\/+/, "").replace(/\.+/g, ".").trim() || DEFAULT_SETTINGS.destinationFolder;
}

async function getImageDimensions(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  return { width: bitmap.width, height: bitmap.height };
}

function getNextSequenceNumber() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ sequence: 1 }, (data) => {
      const next = data.sequence || 1;
      chrome.storage.local.set({ sequence: next + 1 }, () => resolve(next));
    });
  });
}

function inferExtensionFromUrl(url, mime) {
  if (mime && mime.startsWith("image/")) {
    const subtype = mime.split("/")[1];
    if (subtype) {
      return `.${subtype.replace("jpeg", "jpg")}`;
    }
  }
  const match = IMG_EXTENSIONS.find((ext) => url.toLowerCase().includes(ext));
  return match || ".png";
}

chrome.downloads.onCreated.addListener(async (item) => {
  if (!item || !item.url) {
    return;
  }

  if (item.byExtensionId === chrome.runtime.id) {
    return;
  }

  if (!isImageDownload(item)) {
    return;
  }

  try {
    const settings = await new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULT_SETTINGS, resolve);
    });

    const { width, height } = await getImageDimensions(item.url);
    const minSize = Number(settings.minSizePx) || DEFAULT_SETTINGS.minSizePx;

    if (Math.max(width, height) < minSize) {
      return;
    }

    const sequence = await getNextSequenceNumber();
    const folder = sanitizeFolderName(settings.destinationFolder);
    const extension = inferExtensionFromUrl(item.url, item.mime);
    const filename = `${folder}/img-${sequence}${extension}`;

    const downloadId = await chrome.downloads.download({
      url: item.url,
      filename,
      conflictAction: "uniquify",
      saveAs: false
    });

    if (downloadId) {
      inFlightExtensionDownloads.add(downloadId);
    }
  } catch (error) {
    console.warn("Failed to process image download", error);
  }
});

chrome.downloads.onChanged.addListener((delta) => {
  if (delta && delta.id && inFlightExtensionDownloads.has(delta.id) && delta.state) {
    if (delta.state.current === "complete" || delta.state.current === "interrupted") {
      inFlightExtensionDownloads.delete(delta.id);
    }
  }
});
