const DEFAULT_SETTINGS = {
  minSize: 600,
  folder: "downloaded-images"
};

const minSizeInput = document.getElementById("minSize");
const folderInput = document.getElementById("folder");
const status = document.getElementById("status");
const saveButton = document.getElementById("save");

async function loadSettings() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  minSizeInput.value = settings.minSize;
  folderInput.value = settings.folder;
}

async function saveSettings() {
  const minSize = Number(minSizeInput.value) || DEFAULT_SETTINGS.minSize;
  const folder = folderInput.value.trim() || DEFAULT_SETTINGS.folder;

  await chrome.storage.sync.set({ minSize, folder });
  status.textContent = "Settings saved.";
  setTimeout(() => {
    status.textContent = "";
  }, 2000);
}

saveButton.addEventListener("click", () => {
  saveSettings();
});

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
});
