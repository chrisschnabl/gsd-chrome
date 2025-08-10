// Content script for interacting with Lovable prompt textarea
// This script will be injected into web pages

console.log('Lovable Prompt Helper content script loaded');

// Function to append text to Lovable prompt textarea
function appendToLovablePrompt(textToAppend) {
  try {
    // Try to find the textarea using the XPath
    const xpath = "/html/body/div/div/div[2]/div[1]/div/form/div/div/textarea";
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const textarea = result.singleNodeValue;
    
    if (textarea) {
      const currentValue = textarea.value;
      textarea.value = currentValue + (currentValue ? '\n' : '') + textToAppend;
      
      // Trigger input event to notify the page that the value has changed
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Focus the textarea
      textarea.focus();
      
      return { success: true, message: 'Text appended successfully' };
    } else {
      // Fallback: try to find any textarea that might be the Lovable prompt
      const textareas = document.querySelectorAll('textarea');
      for (const ta of textareas) {
        if (ta.placeholder && (ta.placeholder.toLowerCase().includes('ask') || 
            ta.placeholder.toLowerCase().includes('prompt') ||
            ta.placeholder.toLowerCase().includes('lovable'))) {
          const currentValue = ta.value;
          ta.value = currentValue + (currentValue ? '\n' : '') + textToAppend;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.focus();
          return { success: true, message: 'Text appended to likely Lovable textarea' };
        }
      }
      
      return { success: false, message: 'Could not find Lovable textarea' };
    }
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'appendText') {
    const result = appendToLovablePrompt(request.text);
    sendResponse(result);
  }
});
