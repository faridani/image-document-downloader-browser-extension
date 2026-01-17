const DEFAULT_SETTINGS = {
  minSize: 600,
  folder: "downloader"
};

const minSizeInput = document.getElementById("minSize");
const folderInput = document.getElementById("folder");
const saveButton = document.getElementById("save");
const status = document.getElementById("status");

function showStatus(message) {
  status.textContent = message;
  setTimeout(() => {
    status.textContent = "";
  }, 2000);
}

function loadSettings() {
  chrome.storage.sync.get(["minSize", "folder"], (result) => {
    minSizeInput.value = result.minSize ?? DEFAULT_SETTINGS.minSize;
    folderInput.value = result.folder ?? DEFAULT_SETTINGS.folder;
  });
}

saveButton.addEventListener("click", () => {
  const minSize = Number(minSizeInput.value) || DEFAULT_SETTINGS.minSize;
  const folder = folderInput.value.trim() || DEFAULT_SETTINGS.folder;

  chrome.storage.sync.set({ minSize, folder }, () => {
    showStatus("Settings saved.");
  });
});

loadSettings();
