const DEFAULT_SETTINGS = {
  minSize: 600,
  folder: "downloaded-images"
};

const processedUrls = new Map();
const MAX_PROCESSED = 500;

let sequenceLock = Promise.resolve();

async function getSettings() {
  return chrome.storage.sync.get(DEFAULT_SETTINGS);
}

function normalizeFolder(folder) {
  if (!folder) {
    return "";
  }
  return folder.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

async function getNextSequence() {
  let release;
  const lock = new Promise((resolve) => {
    release = resolve;
  });
  const previous = sequenceLock;
  sequenceLock = lock;
  await previous;

  const { imageSequence } = await chrome.storage.local.get({ imageSequence: 0 });
  const next = imageSequence + 1;
  await chrome.storage.local.set({ imageSequence: next });
  release();
  return next;
}

function rememberUrl(url) {
  processedUrls.set(url, Date.now());
  if (processedUrls.size > MAX_PROCESSED) {
    const oldest = processedUrls.keys().next().value;
    if (oldest) {
      processedUrls.delete(oldest);
    }
  }
}

function hasProcessed(url) {
  if (processedUrls.has(url)) {
    return true;
  }
  return false;
}

function extensionFromType(type) {
  switch (type) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "image/bmp":
      return "bmp";
    case "image/svg+xml":
      return "svg";
    case "image/avif":
      return "avif";
    default:
      return "";
  }
}

function extensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : "";
  } catch {
    return "";
  }
}

async function processImage(url) {
  if (!url || hasProcessed(url)) {
    return;
  }
  rememberUrl(url);

  const settings = await getSettings();
  const minSize = Number(settings.minSize) || DEFAULT_SETTINGS.minSize;
  const folder = normalizeFolder(settings.folder);

  let response;
  try {
    response = await fetch(url, { credentials: "include" });
  } catch {
    return;
  }

  if (!response.ok) {
    return;
  }

  let blob;
  try {
    blob = await response.blob();
  } catch {
    return;
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return;
  }

  const maxDimension = Math.max(bitmap.width, bitmap.height);
  bitmap.close();

  if (maxDimension < minSize) {
    return;
  }

  const typeExtension = extensionFromType(blob.type);
  const urlExtension = extensionFromUrl(url);
  const extension = typeExtension || urlExtension || "png";

  const sequence = await getNextSequence();
  const baseName = `img-${sequence}.${extension}`;
  const filename = folder ? `${folder}/${baseName}` : baseName;

  const objectUrl = URL.createObjectURL(blob);
  try {
    await chrome.downloads.download({
      url: objectUrl,
      filename,
      conflictAction: "uniquify",
      saveAs: false
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.type !== "image") {
      return;
    }
    if (!details.url.startsWith("http")) {
      return;
    }
    processImage(details.url);
  },
  { urls: ["<all_urls>"] }
);
