document.addEventListener('DOMContentLoaded', function() {
  const appendButton = document.getElementById('appendButton');
  const promptText = document.getElementById('promptText');
  const status = document.getElementById('status');

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = `status ${isError ? 'error' : 'success'}`;
    status.style.display = 'block';
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }

  appendButton.addEventListener('click', async function() {
    const textToAppend = promptText.value.trim();
    
    if (!textToAppend) {
      showStatus('Please enter some text to append', true);
      return;
    }

    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        showStatus('Could not access current tab', true);
        return;
      }

      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'appendText',
        text: textToAppend
      });

      if (response && response.success) {
        showStatus(response.message || 'Text appended successfully!');
        promptText.value = ''; // Clear the input
      } else {
        showStatus(response?.message || 'Failed to append text', true);
      }
      
    } catch (error) {
      console.error('Error:', error);
      showStatus('Error: ' + error.message, true);
    }
  });
});
