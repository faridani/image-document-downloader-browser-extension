// DOM Elements
const enabledCheckbox = document.getElementById('enabled');
const minSizeInput = document.getElementById('minSize');
const destinationFolderInput = document.getElementById('destinationFolder');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const statusDiv = document.getElementById('status');
const counterDiv = document.getElementById('counter');

// Load settings on popup open
document.addEventListener('DOMContentLoaded', loadSettings);

async function loadSettings() {
  // Load settings from storage
  const result = await chrome.storage.local.get(['settings', 'imageCounter']);

  if (result.settings) {
    enabledCheckbox.checked = result.settings.enabled;
    minSizeInput.value = result.settings.minSize;
    destinationFolderInput.value = result.settings.destinationFolder;
  }

  // Update counter display
  const counter = result.imageCounter || 1;
  counterDiv.textContent = counter - 1; // Display downloaded count (counter is next image number)
}

// Save settings
saveBtn.addEventListener('click', async () => {
  const settings = {
    enabled: enabledCheckbox.checked,
    minSize: parseInt(minSizeInput.value, 10) || 600,
    destinationFolder: destinationFolderInput.value.trim() || 'downloaded-images'
  };

  // Validate minimum size
  if (settings.minSize < 1) {
    showStatus('Minimum size must be at least 1px', 'error');
    return;
  }

  // Validate folder name
  if (!settings.destinationFolder) {
    showStatus('Please enter a folder name', 'error');
    return;
  }

  // Remove invalid characters from folder name
  settings.destinationFolder = settings.destinationFolder.replace(/[<>:"|?*]/g, '');

  try {
    await chrome.storage.local.set({ settings: settings });
    showStatus('Settings saved!', 'success');
  } catch (error) {
    showStatus('Failed to save settings', 'error');
  }
});

// Reset counter
resetBtn.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ type: 'RESET_COUNTER' });
    counterDiv.textContent = '0';
    showStatus('Counter reset!', 'success');
  } catch (error) {
    showStatus('Failed to reset counter', 'error');
  }
});

function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;

  // Hide after 3 seconds
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 3000);
}
