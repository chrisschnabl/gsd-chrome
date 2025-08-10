document.addEventListener('DOMContentLoaded', function() {
  const appendButton = document.getElementById('appendButton');
  const readButton = document.getElementById('readButton');
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

  // Read code from file editor
  readButton.addEventListener('click', async function() {
    console.log('Read button clicked');
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Active tab:', tab);
      
      if (!tab.id) {
        showStatus('Could not access current tab', true);
        return;
      }

      showStatus('Reading code from file editor...');

      // Use the fallback method directly since content script isn't working
      console.log('Using direct script injection method...');
      
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: readCodeDirectly
      });
      
      if (results && results[0] && results[0].result) {
        const response = results[0].result;
        console.log('Read result:', response);
        
        if (response.success) {
          showStatus(`Successfully read ${response.lineCount} lines of code. Check console for details.`);
          console.log('Read code:', response.code);
        } else {
          showStatus(response.message || 'Failed to read code', true);
        }
      } else {
        throw new Error('Script execution failed');
      }
      
    } catch (error) {
      console.error('Error in popup:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      showStatus('Error: ' + error.message, true);
    }
  });

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

// Function that will be executed directly in the page context
function readCodeDirectly() {
  console.log('=== Direct code reading ===');
  
  try {
    // Use the new XPath provided by the user
    const xpath = '//*[@id="preview-panel"]/div/div/div[2]/div/div[2]/div[2]/div/div/div[2]/div[2]';
    console.log('Using XPath:', xpath);
    
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const editorContainer = result.singleNodeValue;
    
    console.log('XPath evaluation result:', result);
    console.log('Editor container found:', editorContainer);
    
    if (editorContainer) {
      console.log('Found file editor container:', editorContainer);
      console.log('Container tag name:', editorContainer.tagName);
      console.log('Container classes:', editorContainer.className);
      
      // Find all div elements (each div represents a line)
      const lineDivs = editorContainer.querySelectorAll('div');
      console.log(`Found ${lineDivs.length} div elements (potential lines)`);
      
      if (lineDivs.length > 0) {
        let fullCode = '';
        let readLines = [];
        
        // Process each line div (up to a reasonable limit to avoid overwhelming output)
        const maxLines = Math.min(lineDivs.length, 50); // Limit to first 50 lines
        
        for (let i = 0; i < maxLines; i++) {
          const lineDiv = lineDivs[i];
          console.log(`Processing line ${i + 1}:`, lineDiv);
          console.log(`Line ${i + 1} classes:`, lineDiv.className);
          
          // Get all spans within this line
          const spans = lineDiv.querySelectorAll('span');
          console.log(`Line ${i + 1} has ${spans.length} spans`);
          
          let lineText = '';
          
          // Read text from all spans in this line
          spans.forEach((span, spanIndex) => {
            const spanText = span.textContent || '';
            lineText += spanText;
            console.log(`  Line ${i + 1}, Span ${spanIndex}: "${spanText}"`);
          });
          
          // Add line number and content to the full code
          fullCode += `${i + 1}: ${lineText}\n`;
          readLines.push(lineText);
          
          console.log(`Line ${i + 1} read: "${lineText}"`);
        }
        
        console.log('Full read code:');
        console.log(fullCode);
        
        return { 
          success: true, 
          code: fullCode,
          lineCount: maxLines,
          totalDivs: lineDivs.length,
          readLines: readLines
        };
      } else {
        console.log('No div elements found in container');
        return { success: false, message: 'No line divs found in editor container' };
      }
    } else {
      console.log('Could not find file editor container with XPath');
      
      // Fallback: try to find any code editor
      console.log('Trying fallback methods...');
      
      const codeEditors = document.querySelectorAll('[data-language]');
      console.log(`Found ${codeEditors.length} potential code editors with data-language`);
      
      const cmEditors = document.querySelectorAll('[class*="cm-"]');
      console.log(`Found ${cmEditors.length} elements with cm- classes`);
      
      return { success: false, message: 'Could not find file editor' };
    }
  } catch (error) {
    console.error('Error reading code:', error);
    console.error('Error stack:', error.stack);
    return { success: false, message: 'Error: ' + error.message };
  }
}
