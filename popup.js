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
    }, 5000);
  }

  // Append text to Lovable prompt
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

      showStatus('Appending text to Lovable prompt...');

      // Use direct script injection instead of content script messaging
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: appendTextDirectly,
        args: [textToAppend]
      });
      
      if (results && results[0] && results[0].result) {
        const response = results[0].result;
        console.log('Append result:', response);
        
        if (response.success) {
          showStatus(response.message || 'Text appended successfully!');
          promptText.value = ''; // Clear the input
        } else {
          showStatus(response.message || 'Failed to append text', true);
        }
      } else {
        throw new Error('Script execution failed');
      }
      
    } catch (error) {
      console.error('Error:', error);
      showStatus('Error: ' + error.message, true);
    }
  });
});


// Function that will be executed directly in the page context for appending text
function appendTextDirectly(textToAppend) {
  console.log('=== Direct text appending ===');
  console.log('Text to append:', textToAppend);
  
  try {
    // Try to find the textarea using the XPath
    const xpath = "/html/body/div/div/div[2]/div[1]/div/form/div/div/textarea";
    console.log('Using XPath for textarea:', xpath);
    
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const textarea = result.singleNodeValue;
    
    console.log('Textarea found:', textarea);
    
    if (textarea) {
      const currentValue = textarea.value;
      console.log('Current textarea value:', currentValue);
      
      textarea.value = currentValue + (currentValue ? '\n' : '') + textToAppend;
      console.log('New textarea value:', textarea.value);
      
      // Trigger input event to notify the page that the value has changed
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Focus the textarea
      textarea.focus();
      
      return { success: true, message: 'Text appended successfully' };
    } else {
      console.log('Could not find textarea with XPath, trying fallback...');
      
      // Fallback: try to find any textarea that might be the Lovable prompt
      const textareas = document.querySelectorAll('textarea');
      console.log(`Found ${textareas.length} textareas on page`);
      
      for (const ta of textareas) {
        console.log('Checking textarea:', ta);
        console.log('Placeholder:', ta.placeholder);
        
        if (ta.placeholder && (ta.placeholder.toLowerCase().includes('ask') || 
            ta.placeholder.toLowerCase().includes('prompt') ||
            ta.placeholder.toLowerCase().includes('lovable'))) {
          
          const currentValue = ta.value;
          console.log('Found likely Lovable textarea, current value:', currentValue);
          
          ta.value = currentValue + (currentValue ? '\n' : '') + textToAppend;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.focus();
          
          return { success: true, message: 'Text appended to likely Lovable textarea' };
        }
      }
      
      return { success: false, message: 'Could not find Lovable textarea' };
    }
  } catch (error) {
    console.error('Error appending text:', error);
    return { success: false, message: 'Error: ' + error.message };
  }
}
