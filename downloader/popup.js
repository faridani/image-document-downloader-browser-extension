// Popup script for managing extension settings

document.addEventListener('DOMContentLoaded', function() {
  const enableToggle = document.getElementById('enableToggle');
  const minSizeInput = document.getElementById('minSize');
  const destinationFolderInput = document.getElementById('destinationFolder');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const statusDiv = document.getElementById('status');
  const counterDisplay = document.getElementById('counterDisplay');
  
  // Load current settings
  chrome.storage.sync.get(['minSize', 'destinationFolder', 'isEnabled', 'imageCounter'], (data) => {
    minSizeInput.value = data.minSize || 600;
    destinationFolderInput.value = data.destinationFolder || 'downloaded-images';
    enableToggle.checked = data.isEnabled || false;
    counterDisplay.textContent = data.imageCounter || 1;
  });
  
  // Handle enable/disable toggle
  enableToggle.addEventListener('change', function() {
    const enabled = this.checked;
    chrome.runtime.sendMessage({ 
      action: 'toggleEnabled', 
      enabled: enabled 
    }, (response) => {
      showStatus('Auto-download ' + (enabled ? 'enabled' : 'disabled'));
    });
  });
  
  // Handle save button
  saveBtn.addEventListener('click', function() {
    const minSize = parseInt(minSizeInput.value);
    const destinationFolder = destinationFolderInput.value.trim();
    
    if (isNaN(minSize) || minSize < 1) {
      showStatus('Please enter a valid minimum size', false);
      return;
    }
    
    chrome.storage.sync.set({
      minSize: minSize,
      destinationFolder: destinationFolder
    }, () => {
      showStatus('Settings saved successfully!');
    });
  });
  
  // Handle reset counter button
  resetBtn.addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: 'resetCounter' }, (response) => {
      counterDisplay.textContent = '1';
      showStatus('Counter reset to 1');
    });
  });
  
  // Update counter display when it changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.imageCounter) {
      counterDisplay.textContent = changes.imageCounter.newValue;
    }
  });
  
  function showStatus(message, isSuccess = true) {
    statusDiv.textContent = message;
    statusDiv.className = 'status' + (isSuccess ? ' success' : '');
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});
