const DEFAULT_SETTINGS = {
  minSizePx: 600,
  destinationFolder: "image-downloads"
};

const form = document.getElementById("settings-form");
const minSizeInput = document.getElementById("min-size");
const destinationInput = document.getElementById("destination-folder");
const status = document.getElementById("status");

function showStatus(message) {
  status.textContent = message;
  status.classList.add("visible");
  window.setTimeout(() => {
    status.textContent = "";
    status.classList.remove("visible");
  }, 2000);
}

function restoreSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    minSizeInput.value = settings.minSizePx;
    destinationInput.value = settings.destinationFolder;
  });
}

function sanitizeFolderName(folder) {
  if (!folder) {
    return DEFAULT_SETTINGS.destinationFolder;
  }
  return folder.replace(/^\/+/, "").replace(/\.+/g, ".").trim() || DEFAULT_SETTINGS.destinationFolder;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const minSize = Number(minSizeInput.value);
  const destinationFolder = sanitizeFolderName(destinationInput.value);

  chrome.storage.sync.set(
    {
      minSizePx: Number.isFinite(minSize) && minSize > 0 ? minSize : DEFAULT_SETTINGS.minSizePx,
      destinationFolder
    },
    () => {
      showStatus("Settings saved.");
    }
  );
});

restoreSettings();
