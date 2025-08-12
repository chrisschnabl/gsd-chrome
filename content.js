(function () {
  
})();

console.log('=== Lovable Prompt Helper content script loaded ===');

window.addEventListener('load', () => {
  setTimeout(() => {
    try {
      const uri = window.location.href;
      
      // Find the element containing the project name
      const projectNameElement = document.querySelector('p.hidden.min-w-0.truncate.text-sm.font-medium.leading-none.md\\:block');
      
      let projectUrl = "Not found";
      if (projectNameElement) {
          const projectName = projectNameElement.textContent.trim();
          if (projectName) {
              projectUrl = `https://${projectName}.lovable.app/`;
          }
      }
      
      // Fallback: try to find lovable app link if element not found
      if (projectUrl === "Not found") {
          const links = Array.from(document.querySelectorAll('a'));
          const lovableAppLink = links.find(a => a.hostname.endsWith('.lovable.app') && !a.href.includes('preview'));
          if (lovableAppLink) {
              projectUrl = lovableAppLink.href;
          }
      }

      const uuidRegex = /\/projects\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
      const match = uri.match(uuidRegex);

      if (!match || !match[1]) {
          // If no UUID in URL, maybe we are on the lovable.app page itself.
          if (projectUrl === "Not found" && window.location.hostname.endsWith('.lovable.app')) {
              projectUrl = window.location.origin + '/';
          } else if (projectUrl === "Not found") {
              alert('GSD-HELPER: Could not find a valid project UUID in the URL or a .lovable.app link.');
              return;
          }
      }


      const projectId = match && match[1] ? match[1] : 'not-found-on-this-page';

      
      // INSERT_YOUR_CODE
      // Load mock data from mock.json
      // This will fetch mock.json from the extension's root directory
      fetch('https://us-central1-convertable-eu.cloudfunctions.net/initialize_project', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              project_id: projectId,
              project_url: projectUrl
          })
      })
      .then(response => {
          if (!response.ok) {
              return response.text().then(text => {
                  throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
              });
          }
          return response.json();
      })
      .then(data => {
          console.log('GSD-HELPER: Project initialization successful.', data);
          
          //alert('GSD-HELPER: Project initialization successful: ' + JSON.stringify(data));
          const textareas = document.querySelectorAll('textarea');
          for (const ta of textareas) {
            if (ta.placeholder && (ta.placeholder.toLowerCase().includes('ask') || 
                ta.placeholder.toLowerCase().includes('prompt') ||
                ta.placeholder.toLowerCase().includes('lovable'))) {
              const currentValue = ta.value;
              ta.value = currentValue + (currentValue ? '\n' : '') + data.prompt;
              ta.dispatchEvent(new Event('input', { bubbles: true }));
              ta.focus();
              break;
            }
          }
          
     
      })
      .catch(error => {
          console.error('GSD-HELPER: Project initialization failed.', error);
          alert('GSD-HELPER: Project initialization failed: ' + error.message);
      });

    } catch(e) {
      alert('GSD-HELPER error evaluating XPath: ' + e.message);
    }
  }, 2000); // Wait 2 seconds
});

console.log('Current URL:', window.location.href);
console.log('Document ready state:', document.readyState);

// Add a global function that can be called from the popup
window.lovableHelper = {
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
            ta.value = currentValue + (currentValue ? '\n' : '') + data.prompt;
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
  } else if (request.action === 'insertFunnyAnalytics') {
    const result = window.lovableHelper.insertFunnyAnalytics();
    console.log('Insert funny analytics result:', result);
    sendResponse(result);
  }
  return true; // Keep the message channel open for sendResponse
});

console.log('Content script setup complete. Global helper available at window.lovableHelper');

/*
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
*/

(function() {
    const gsdButtonId = 'gsd-ab-button';
    const svgIcon = `<svg xmlns:xlink="http://www.w3.org/1999/xlink" fill="currentColor" width="100%" height="100%" viewBox="-2 -2 28 28" xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5"><path d="M14.5,16 C14.2238576,16 14,15.7761424 14,15.5 L14,9.5 C14,9.22385763 14.2238576,9 14.5,9 L16,9 C17.1045695,9 18,9.8954305 18,11 C18,11.4116588 17.8756286,11.7942691 17.6624114,12.1123052 C18.4414283,12.3856578 19,13.1275982 19,14 C19,15.1045695 18.1045695,16 17,16 L14.5,16 Z M15,15 L17,15 C17.5522847,15 18,14.5522847 18,14 C18,13.4477153 17.5522847,13 17,13 L15,13 L15,15 Z M15,12 L16,12 C16.5522847,12 17,11.5522847 17,11 C17,10.4477153 16.5522847,10 16,10 L15,10 L15,12 Z M12.9499909,4 L19.5,4 C20.8807119,4 22,5.11928813 22,6.5 L22,19.5 C22,20.8807119 20.8807119,22 19.5,22 L13.5,22 C12.2700325,22 11.2475211,21.1117749 11.0389093,19.9417682 C10.8653433,19.9799013 10.6850188,20 10.5,20 L4.5,20 C3.11928813,20 2,18.8807119 2,17.5 L2,4.5 C2,3.11928813 3.11928813,2 4.5,2 L10.5,2 C11.709479,2 12.7183558,2.85887984 12.9499909,4 Z M13,5 L13,17.5 C13,18.3179089 12.6072234,19.0440799 12,19.5001831 C12.0000989,20.3285261 12.6716339,21 13.5,21 L19.5,21 C20.3284271,21 21,20.3284271 21,19.5 L21,6.5 C21,5.67157288 20.3284271,5 19.5,5 L13,5 Z M8.56005566,11.4964303 C8.54036595,11.4987873 8.52032459,11.5 8.5,11.5 L6.5,11.5 C6.47967541,11.5 6.45963405,11.4987873 6.43994434,11.4964303 L5.96423835,12.6856953 C5.86168164,12.9420871 5.57069642,13.066795 5.31430466,12.9642383 C5.0579129,12.8616816 4.93320495,12.5706964 5.03576165,12.3143047 L7.03576165,7.31430466 C7.20339081,6.89523178 7.79660919,6.89523178 7.96423835,7.31430466 L9.96423835,12.3143047 C10.066795,12.5706964 9.9420871,12.8616816 9.68569534,12.9642383 C9.42930358,13.066795 9.13831836,12.9420871 9.03576165,12.6856953 L8.56005566,11.4964303 L8.56005566,11.4964303 Z M8.16148352,10.5 L7.5,8.8462912 L6.83851648,10.5 L8.16148352,10.5 Z M10.5,3 L4.5,3 C3.67157288,3 3,3.67157288 3,4.5 L3,17.5 C3,18.3284271 3.67157288,19 4.5,19 L10.5,19 C11.3284271,19 12,18.3284271 12,17.5 L12,4.5 C12,3.67157288 11.3284271,3 10.5,3 Z M6.5,18 C6.22385763,18 6,17.7761424 6,17.5 C6,17.2238576 6.22385763,17 6.5,17 L8.5,17 C8.77614237,17 9,17.2238576 9,17.5 C9,17.7761424 8.77614237,18 8.5,18 L6.5,18 Z M15.5,20 C15.2238576,20 15,19.7761424 15,19.5 C15,19.2238576 15.2238576,19 15.5,19 L17.5,19 C17.7761424,19 18,19.2238576 18,19.5 C18,19.7761424 17.7761424,20 17.5,20 L15.5,20 Z"/></svg>`;

    function addAbButton() {
        if (document.getElementById(gsdButtonId)) {
            return; // Button already exists
        }

        const buttonContainerXPath = "/html/body/div[2]/div";
        const containerResult = document.evaluate(buttonContainerXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const buttonContainer = containerResult.singleNodeValue;

        if (buttonContainer) {
            console.log('GSD-HELPER: Creating the A/B button.');
            
            const abButton = document.createElement('button');
            abButton.id = gsdButtonId;
            abButton.className = "flex flex-col items-center gap-2 rounded-[10px] px-3 py-3 text-sm font-medium hover:bg-muted [&>svg]:size-5";
            abButton.style.cssText = "transition: background-color 0.2s ease;";
            abButton.addEventListener('mouseenter', () => {
                abButton.style.backgroundColor = '#c8a2c8'; // lilac color
            });
            abButton.addEventListener('mouseleave', () => {
                abButton.style.backgroundColor = '';
            });
            abButton.innerHTML = `${svgIcon}<span>A/B</span>`;
            
            abButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('GSD-HELPER: A/B button clicked, sending message to open popup.');
                chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
            }, true);

            buttonContainer.appendChild(abButton);

            console.log('GSD-HELPER: A/B button appended.');
        } else {
             console.log('GSD-HELPER: Button container not found for A/B button.');
        }
    }

    const observer = new MutationObserver(addAbButton);
    
    function startObserver() {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            console.log('GSD-HELPER: Monitoring to add A/B button.');
        } else {
            window.addEventListener('DOMContentLoaded', startObserver, { once: true });
        }
    }

    addAbButton();
    startObserver();
})();
