// DOM Elements
const enabledCheckbox = document.getElementById('enabled');
const minSizeInput = document.getElementById('minSize');
const destinationFolderInput = document.getElementById('destinationFolder');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const statusDiv = document.getElementById('status');
const counterDiv = document.getElementById('counter');

// Load settings when options page opens
document.addEventListener('DOMContentLoaded', loadSettings);

async function loadSettings() {
  try {
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
  } catch (error) {
    console.error('Failed to load settings:', error);
    showStatus('Failed to load settings', 'error');
  }
}

// Listen for storage changes to keep UI in sync with popup
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;

  if (changes.settings) {
    const newSettings = changes.settings.newValue;
    if (newSettings) {
      enabledCheckbox.checked = newSettings.enabled;
      minSizeInput.value = newSettings.minSize;
      destinationFolderInput.value = newSettings.destinationFolder;
    }
  }

  if (changes.imageCounter) {
    const newCounter = changes.imageCounter.newValue || 1;
    counterDiv.textContent = newCounter - 1;
  }
});

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

  if (settings.minSize > 10000) {
    showStatus('Minimum size cannot exceed 10,000px', 'error');
    return;
  }

  // Validate folder name
  if (!settings.destinationFolder) {
    showStatus('Please enter a folder name', 'error');
    return;
  }

  // Remove invalid characters from folder name
  const originalFolder = settings.destinationFolder;
  settings.destinationFolder = settings.destinationFolder.replace(/[<>:"|?*\\\/]/g, '');

  if (settings.destinationFolder !== originalFolder) {
    destinationFolderInput.value = settings.destinationFolder;
  }

  if (!settings.destinationFolder) {
    showStatus('Folder name contains only invalid characters', 'error');
    return;
  }

  try {
    await chrome.storage.local.set({ settings: settings });
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus('Failed to save settings', 'error');
  }
});

// Reset counter
resetBtn.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ type: 'RESET_COUNTER' });
    counterDiv.textContent = '0';
    showStatus('Counter reset to zero!', 'success');
  } catch (error) {
    console.error('Failed to reset counter:', error);
    showStatus('Failed to reset counter', 'error');
  }
});

// Show status message
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;

  // Hide after 3 seconds
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 3000);
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveBtn.click();
  }
});
