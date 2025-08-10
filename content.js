// Content script for interacting with Lovable prompt textarea
// This script will be injected into web pages

console.log('=== Lovable Prompt Helper content script loaded ===');
console.log('Current URL:', window.location.href);
console.log('Document ready state:', document.readyState);

// Add a global function that can be called from the popup
window.lovableHelper = {
  readCode: function() {
    console.log('=== Starting code reading ===');
    
    try {
      // Try to find the file editor using the XPath
      const xpath = "/html/body/div/div/div[2]/main/div/div/div[3]/div/div/div[2]/div/div[2]/div[2]/div/div/div[2]/div[2]";
      console.log('Using XPath:', xpath);
      
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      const editorContainer = result.singleNodeValue;
      
      console.log('XPath evaluation result:', result);
      console.log('Editor container found:', editorContainer);
      
      if (editorContainer) {
        console.log('Found file editor container:', editorContainer);
        console.log('Container tag name:', editorContainer.tagName);
        console.log('Container classes:', editorContainer.className);
        console.log('Container innerHTML length:', editorContainer.innerHTML.length);
        
        // Find all line elements (div elements with class "cm-line")
        const lines = editorContainer.querySelectorAll('div.cm-line');
        console.log(`Found ${lines.length} lines in the editor`);
        
        if (lines.length === 0) {
          console.log('No cm-line elements found, trying alternative selectors...');
          
          // Try alternative selectors
          const allDivs = editorContainer.querySelectorAll('div');
          console.log('Total divs in container:', allDivs.length);
          
          allDivs.forEach((div, index) => {
            console.log(`Div ${index}:`, {
              className: div.className,
              textContent: div.textContent?.substring(0, 50) + '...',
              children: div.children.length
            });
          });
          
          // Try to find any elements that might contain code
          const codeElements = editorContainer.querySelectorAll('[class*="cm-"]');
          console.log('Elements with cm- classes:', codeElements.length);
          
          codeElements.forEach((el, index) => {
            console.log(`CM element ${index}:`, {
              className: el.className,
              textContent: el.textContent?.substring(0, 50) + '...'
            });
          });
        }
        
        let fullCode = '';
        
        // Iterate over each line
        lines.forEach((line, index) => {
          console.log(`Processing line ${index + 1}:`, line);
          
          // Get all span elements within this line
          const spans = line.querySelectorAll('span');
          console.log(`Line ${index + 1} has ${spans.length} spans`);
          
          let lineText = '';
          
          // Read text from all spans in this line
          spans.forEach((span, spanIndex) => {
            const spanText = span.textContent || '';
            lineText += spanText;
            console.log(`  Span ${spanIndex}: "${spanText}"`);
          });
          
          // Add line number and content to the full code
          fullCode += `${index + 1}: ${lineText}\n`;
          
          console.log(`Line ${index + 1}:`, lineText);
        });
        
        console.log('Full read code:');
        console.log(fullCode);
        
        return { success: true, code: fullCode, lineCount: lines.length };
      } else {
        console.log('Could not find file editor container with XPath');
        
        // Fallback: try to find any code editor
        console.log('Trying fallback methods...');
        
        const codeEditors = document.querySelectorAll('[data-language]');
        console.log(`Found ${codeEditors.length} potential code editors with data-language`);
        
        const cmEditors = document.querySelectorAll('[class*="cm-"]');
        console.log(`Found ${cmEditors.length} elements with cm- classes`);
        
        const allTextareas = document.querySelectorAll('textarea');
        console.log(`Found ${allTextareas.length} textareas`);
        
        // Try to find any element that might be a code editor
        for (const editor of codeEditors) {
          console.log('Checking code editor:', editor);
          const lines = editor.querySelectorAll('div.cm-line');
          if (lines.length > 0) {
            console.log('Found code editor with lines:', lines.length);
            
            let fullCode = '';
            lines.forEach((line, index) => {
              const spans = line.querySelectorAll('span');
              let lineText = '';
              spans.forEach(span => {
                lineText += span.textContent || '';
              });
              fullCode += `${index + 1}: ${lineText}\n`;
              console.log(`Line ${index + 1}:`, lineText);
            });
            
            console.log('Full read code:');
            console.log(fullCode);
            
            return { success: true, code: fullCode, lineCount: lines.length };
          }
        }
        
        // Try to find any element with CodeMirror classes
        const cmElements = document.querySelectorAll('.cm-content, .cm-editor, .cm-scroller');
        console.log(`Found ${cmElements.length} CodeMirror elements`);
        
        cmElements.forEach((element, index) => {
          console.log(`CodeMirror element ${index}:`, {
            className: element.className,
            children: element.children.length,
            textContent: element.textContent?.substring(0, 100) + '...'
          });
        });
        
        return { success: false, message: 'Could not find file editor' };
      }
    } catch (error) {
      console.error('Error reading code:', error);
      console.error('Error stack:', error.stack);
      return { success: false, message: 'Error: ' + error.message };
    }
  },
  
  appendText: function(textToAppend) {
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
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  
  if (request.action === 'appendText') {
    const result = window.lovableHelper.appendText(request.text);
    console.log('Append result:', result);
    sendResponse(result);
  } else if (request.action === 'readCode') {
    const result = window.lovableHelper.readCode();
    console.log('Read result:', result);
    sendResponse(result);
  }
});

console.log('Content script setup complete. Global helper available at window.lovableHelper');
