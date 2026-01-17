const DEFAULT_SETTINGS = {
  minSizePx: 600,
  destinationFolder: "downloaded-images"
};

const recentUrls = new Map();
const RECENT_URL_TTL_MS = 60_000;

const extensionByMime = new Map([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
  ["image/bmp", "bmp"],
  ["image/svg+xml", "svg"]
]);

const loadSettings = async () => {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return {
    minSizePx: Number(stored.minSizePx) || DEFAULT_SETTINGS.minSizePx,
    destinationFolder: sanitizeFolder(String(stored.destinationFolder || ""))
  };
};

const sanitizeFolder = (folder) => {
  const trimmed = folder.trim().replace(/^\/+|\/+$/g, "");
  return trimmed || DEFAULT_SETTINGS.destinationFolder;
};

const isRecentlyProcessed = (url) => {
  const now = Date.now();
  for (const [entryUrl, expiresAt] of recentUrls.entries()) {
    if (expiresAt <= now) {
      recentUrls.delete(entryUrl);
    }
  }
  if (recentUrls.has(url)) {
    return true;
  }
  recentUrls.set(url, now + RECENT_URL_TTL_MS);
  return false;
};

const nextSequenceNumber = async () => {
  const { sequence = 0 } = await chrome.storage.local.get("sequence");
  const next = sequence + 1;
  await chrome.storage.local.set({ sequence: next });
  return next;
};

const getFileExtension = (url, mimeType) => {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    const extension = path.split(".").pop();
    if (extension && extension !== path) {
      return extension.split(/[^a-z0-9]/i)[0] || null;
    }
  } catch (error) {
    // Ignore malformed URLs and fall back to mime type.
  }
  return extensionByMime.get(mimeType) || "png";
};

const handleImage = async (url) => {
  if (isRecentlyProcessed(url)) {
    return;
  }

  let response;
  try {
    response = await fetch(url, { credentials: "omit" });
  } catch (error) {
    return;
  }

  if (!response.ok) {
    return;
  }

  const mimeType = response.headers.get("content-type") || "";
  if (!mimeType.startsWith("image/")) {
    return;
  }

  let blob;
  try {
    blob = await response.blob();
  } catch (error) {
    return;
  }

  let image;
  try {
    image = await createImageBitmap(blob);
  } catch (error) {
    return;
  }

  const { minSizePx, destinationFolder } = await loadSettings();
  if (image.width < minSizePx && image.height < minSizePx) {
    return;
  }

  const sequence = await nextSequenceNumber();
  const extension = getFileExtension(url, mimeType);
  const filename = `${destinationFolder}/img-${sequence}.${extension}`;

  await chrome.downloads.download({
    url,
    filename,
    conflictAction: "uniquify",
    saveAs: false
  });
};

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.type !== "image") {
      return;
    }

    if (!details.url || details.url.startsWith("data:")) {
      return;
    }

    handleImage(details.url);
  },
  { urls: ["<all_urls>"] }
);
