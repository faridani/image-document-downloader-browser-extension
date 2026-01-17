const DEFAULT_SETTINGS = {
  minSizePx: 600,
  destinationFolder: "downloaded-images"
};

const sanitizeFolder = (folder) => {
  const trimmed = folder.trim().replace(/^\/+|\/+$/g, "");
  return trimmed || DEFAULT_SETTINGS.destinationFolder;
};

const loadSettings = async () => {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  document.getElementById("minSize").value = stored.minSizePx;
  document.getElementById("destinationFolder").value = stored.destinationFolder;
};

const saveSettings = async () => {
  const minSizeValue = Number(document.getElementById("minSize").value);
  const destinationValue = sanitizeFolder(
    document.getElementById("destinationFolder").value
  );

  const minSizePx = Number.isFinite(minSizeValue) && minSizeValue > 0
    ? minSizeValue
    : DEFAULT_SETTINGS.minSizePx;

  await chrome.storage.sync.set({
    minSizePx,
    destinationFolder: destinationValue
  });

  const status = document.getElementById("status");
  status.textContent = "Settings saved.";
  setTimeout(() => {
    status.textContent = "";
  }, 2000);
};

document.getElementById("save").addEventListener("click", saveSettings);

loadSettings();
