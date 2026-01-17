// Options page script

document.addEventListener('DOMContentLoaded', function() {
  const enableToggle = document.getElementById('enableToggle');
  const minSizeInput = document.getElementById('minSize');
  const destinationFolderInput = document.getElementById('destinationFolder');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const statusDiv = document.getElementById('status');
  const counterDisplay = document.getElementById('counterDisplay');
  const nextCounter = document.getElementById('nextCounter');
  
  // Load current settings
  loadSettings();
  
  function loadSettings() {
    chrome.storage.sync.get(['minSize', 'destinationFolder', 'isEnabled', 'imageCounter'], (data) => {
      minSizeInput.value = data.minSize || 600;
      destinationFolderInput.value = data.destinationFolder || 'downloaded-images';
      enableToggle.checked = data.isEnabled || false;
      const counter = data.imageCounter || 1;
      counterDisplay.textContent = counter;
      nextCounter.textContent = counter;
    });
  }
  
  // Handle enable/disable toggle
  enableToggle.addEventListener('change', function() {
    const enabled = this.checked;
    chrome.storage.sync.set({ isEnabled: enabled }, () => {
      chrome.runtime.sendMessage({ 
        action: 'toggleEnabled', 
        enabled: enabled 
      });
      showStatus('Auto-download ' + (enabled ? 'enabled' : 'disabled'));
    });
  });
  
  // Handle save button
  saveBtn.addEventListener('click', function() {
    const minSize = parseInt(minSizeInput.value);
    const destinationFolder = destinationFolderInput.value.trim();
    
    if (!validateMinSize(minSize)) {
      showStatus('Please enter a valid minimum size (must be at least 1)');
      return;
    }
    
    chrome.storage.sync.set({
      minSize: minSize,
      destinationFolder: destinationFolder
    }, () => {
      showStatus('Settings saved successfully!');
    });
  });
  
  // Validation helper
  function validateMinSize(size) {
    return !isNaN(size) && size >= 1;
  }
  
  // Handle reset counter button
  resetBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset the image counter to 1?')) {
      chrome.storage.sync.set({ imageCounter: 1 }, () => {
        chrome.runtime.sendMessage({ action: 'resetCounter' });
        counterDisplay.textContent = '1';
        nextCounter.textContent = '1';
        showStatus('Counter reset to 1');
      });
    }
  });
  
  // Update counter display when it changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.imageCounter) {
      const newCounter = changes.imageCounter.newValue;
      counterDisplay.textContent = newCounter;
      nextCounter.textContent = newCounter;
    }
  });
  
  function showStatus(message) {
    statusDiv.textContent = message;
    statusDiv.className = 'status success';
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});
