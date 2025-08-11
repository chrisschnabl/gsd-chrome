(function () {
  
})();

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
  },

  insertFunnyAnalytics: function() {
    try {
      console.log('=== Inserting funny analytics div ===');
      
      // Find the target element using XPath
      const xpath1 = "/html/body/div[3]/div/div[2]/div[4]/div[1]";
      
      const result1 = document.evaluate(xpath1, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      
      const element1 = result1.singleNodeValue;
        
      console.log('Element 1 found:', element1);
    
      
      if (!element1) {
        return { success: false, message: 'Could not find target element' };
      }
      
      // Create the funny analytics div
      const funnyAnalyticsDiv = document.createElement('div');
      funnyAnalyticsDiv.className = 'funny-analytics-container';
      funnyAnalyticsDiv.style.cssText = 'margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);';
      
      // Funny headings for the analytics
      const funnyHeadings = [
        'Caffeine Intake',
        'Cat Videos Watched',
        'Procrastination Level',
        'Snack Breaks',
        'Existential Crises'
      ];
      
      const funnyValues = [
        '∞ cups',
        '42 videos',
        'Maximum',
        'Every 5 min',
        '3 today'
      ];
      
      // Create the grid content
      const gridContent = `
        <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          ${funnyHeadings.map((heading, index) => `
            <div class="group flex cursor-pointer flex-col gap-2 rounded-xl border bg-white/10 backdrop-blur-sm p-4 border-white/20 hover:bg-white/20 transition-all duration-300" data-state="closed">
              <p class="text-sm font-medium group-hover:text-yellow-300 text-white">${heading}</p>
              <div class="flex items-center justify-between gap-2">
                <p class="h-5 font-medium text-white">${funnyValues[index]}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Add a funny title
      const titleDiv = document.createElement('h3');
      titleDiv.textContent = '🤪 Your Totally Scientific Analytics Dashboard';
      titleDiv.style.cssText = 'color: white; font-size: 1.5rem; font-weight: bold; margin-bottom: 16px; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);';
      
      funnyAnalyticsDiv.appendChild(titleDiv);
      funnyAnalyticsDiv.innerHTML += gridContent;
      
      // Insert the new div after the first element
      element1.parentNode.insertBefore(funnyAnalyticsDiv, element1.nextSibling);
      
      console.log('Funny analytics div inserted successfully');
      
      return { success: true, message: 'Funny analytics div inserted successfully' };
    } catch (error) {
      console.error('Error inserting funny analytics:', error);
      return { success: false, message: 'Error: ' + error.message };
    }
  }
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "ANALYTICS_SETTINGS_VIEW") {
    window.lovableHelper.insertFunnyAnalytics();
  } else if (request.action === 'appendText') {
    const result = window.lovableHelper.appendText(request.text);
    console.log('Append result:', result);
    sendResponse(result);
  } else if (request.action === 'readCode') {
    const result = window.lovableHelper.readCode();
    console.log('Read result:', result);
    sendResponse(result);
  } else if (request.action === 'insertFunnyAnalytics') {
    const result = window.lovableHelper.insertFunnyAnalytics();
    console.log('Insert funny analytics result:', result);
    sendResponse(result);
  }
  return true; // Keep the message channel open for sendResponse
});

console.log('Content script setup complete. Global helper available at window.lovableHelper');

(function() {
    // This selector is designed to find elements with dynamically generated class names
    // from Radix UI, like "radix-123-content-analytics".
    const targetSelector = '[class*="-content-analytics"]';
    const headerClassName = 'hello-chris-header';

    function findAndInsert() {
        const potentialTargets = document.querySelectorAll(targetSelector);

        potentialTargets.forEach(target => {
            // Confirm it's the right kind of element by checking for the 'radix-' prefix.
            const isMatchingElement = Array.from(target.classList).some(
                cls => cls.startsWith('radix-') && cls.endsWith('-content-analytics')
            );

            if (isMatchingElement) {
                // Check if the header has already been added for this specific element.
                const nextEl = target.nextElementSibling;
                if (!nextEl || !nextEl.classList.contains(headerClassName)) {
                    console.log('GSD-HELPER: Found analytics element:', target);
                    const header = document.createElement('h1');
                    header.textContent = 'Hello Chris';
                    header.className = headerClassName;
                    target.parentNode.insertBefore(header, target.nextSibling);
                    console.log('GSD-HELPER: Inserted H1 tag below the target element.');
                }
            }
        });
    }

    // Set up a MutationObserver to watch for future changes to the DOM
    const observer = new MutationObserver(findAndInsert);
    
    function startObserver() {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            console.log('GSD-HELPER: Monitoring for analytics elements to appear.');
        } else {
            // If body doesn't exist yet, wait for it.
            window.addEventListener('DOMContentLoaded', startObserver, { once: true });
        }
    }
    
    // Run the check once on script load and start observing
    findAndInsert();
    startObserver();
})();

(function() {
    const codeViewerSelector = 'button[aria-label="Code viewer"]';
    // This selector is a guess, but it targets a button with an aria-label containing "A/B"
    const abButtonSelector = 'button[aria-label*="A/B"]'; 
    const gsdButtonId = 'gsd-ab-button';

    function modifyPageButtons() {
        // 1. Find or create the A/B button
        let abButton = document.getElementById(gsdButtonId);
        if (!abButton) {
            const codeViewerButton = document.querySelector(codeViewerSelector);
            if (codeViewerButton && codeViewerButton.parentNode) {
                console.log('GSD-HELPER: Creating the A/B button.');
                abButton = document.createElement('button');
                abButton.id = gsdButtonId;
                abButton.setAttribute('aria-label', 'A/B Test Helper');
                abButton.innerHTML = `<img src="${chrome.runtime.getURL('button.svg')}" alt="A/B">`;
                abButton.className = codeViewerButton.className; // Copy styling from a similar button
                abButton.style.marginRight = '8px';
                abButton.style.backgroundColor = '#764ba2'; // A pinkish color from the analytics dashboard gradient

                codeViewerButton.parentNode.insertBefore(abButton, codeViewerButton);

                abButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log('GSD-HELPER: A/B button clicked, sending message to open popup.');
                    chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
                }, true);
            }
        }
        
        // The original code viewer button hijacking is no longer needed
        // if the A/B button is what should open the popup.
        // I'll leave it here but commented out in case it's desired.
        /*
        // 2. Find and hijack the Code Viewer button
        const codeViewerButton = document.querySelector(codeViewerSelector);
        if (codeViewerButton && !codeViewerButton.dataset.gsdHandled) {
            console.log('GSD-HELPER: Found code viewer button to hijack', codeViewerButton);
            // Prevent its original action and open our popup instead
            codeViewerButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
            }, true); // Use capture: true to ensure this listener runs first
            codeViewerButton.dataset.gsdHandled = true;
        }
        */
    }

    const observer = new MutationObserver(modifyPageButtons);
    
    function startObserver() {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            console.log('GSD-HELPER: Monitoring for A/B and Code Viewer buttons.');
        } else {
            // If body doesn't exist yet, wait for it.
            window.addEventListener('DOMContentLoaded', startObserver, { once: true });
        }
    }

    modifyPageButtons();
    startObserver();
})();
