// Constants
const CONFIG = {
  INITIALIZATION_DELAY: 2000,
  BUTTON_ID: 'gsd-ab-button',
  BUTTON_CONTAINER_XPATH: "/html/body/div[2]/div",
  PROJECT_NAME_SELECTOR: 'p.hidden.min-w-0.truncate.text-sm.font-medium.leading-none.md\\:block',
  UUID_REGEX: /\/projects\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  API_ENDPOINT: 'https://us-central1-convertable-eu.cloudfunctions.net/initialize_project'
};

const TEXTAREA_PLACEHOLDER_KEYWORDS = ['ask', 'prompt', 'lovable'];

// Utility functions
function findProjectName() {
  const projectNameElement = document.querySelector(CONFIG.PROJECT_NAME_SELECTOR);
  
  if (projectNameElement) {
    const projectName = projectNameElement.textContent.trim();
    if (projectName) {
      return `https://${projectName}.lovable.app/`;
    }
  }
  
  // Fallback: try to find lovable app link
  const links = Array.from(document.querySelectorAll('a'));
  const lovableAppLink = links.find(a => 
    a.hostname.endsWith('.lovable.app') && !a.href.includes('preview')
  );
  
  if (lovableAppLink) {
    return lovableAppLink.href;
  }
  
  return null;
}

function extractProjectId(uri) {
  const match = uri.match(CONFIG.UUID_REGEX);
  return match && match[1] ? match[1] : null;
}

function findLovableTextarea() {
  const textareas = document.querySelectorAll('textarea');
  
  for (const textarea of textareas) {
    if (textarea.placeholder && 
        TEXTAREA_PLACEHOLDER_KEYWORDS.some(keyword => 
          textarea.placeholder.toLowerCase().includes(keyword)
        )) {
      return textarea;
    }
  }
  
  return null;
}

function appendTextToTextarea(textarea, textToAppend) {
  if (!textarea) return false;
  
  const currentValue = textarea.value;
  textarea.value = currentValue + (currentValue ? '\n' : '') + textToAppend;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
  return true;
}

// Project initialization
async function initializeProject(projectId, projectUrl) {
  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_id: projectId,
        project_url: projectUrl
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
    }

    const data = await response.json();
    console.log('GSD-HELPER: Project initialization successful.', data);
    
    const textarea = findLovableTextarea();
    if (textarea && data.prompt) {
      appendTextToTextarea(textarea, data.prompt);
    }
    
    return data;
  } catch (error) {
    console.error('GSD-HELPER: Project initialization failed.', error);
    alert('GSD-HELPER: Project initialization failed: ' + error.message);
    throw error;
  }
}

// A/B Button functionality
function createAbButton() {
  const svgIcon = `<svg xmlns:xlink="http://www.w3.org/1999/xlink" fill="currentColor" width="100%" height="100%" viewBox="-2 -2 28 28" xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-5 w-5"><path d="M14.5,16 C14.2238576,16 14,15.7761424 14,15.5 L14,9.5 C14,9.22385763 14.2238576,9 14.5,9 L16,9 C17.1045695,9 18,9.8954305 18,11 C18,11.4116588 17.8756286,11.7942691 17.6624114,12.1123052 C18.4414283,12.3856578 19,13.1275982 19,14 C19,15.1045695 18.1045695,16 17,16 L14.5,16 Z M15,15 L17,15 C17.5522847,15 18,14.5522847 18,14 C18,13.4477153 17.5522847,13 17,13 L15,13 L15,15 Z M15,12 L16,12 C16.5522847,12 17,11.5522847 17,11 C17,10.4477153 16.5522847,10 16,10 L15,10 L15,12 Z M12.9499909,4 L19.5,4 C20.8807119,4 22,5.11928813 22,6.5 L22,19.5 C22,20.8807119 20.8807119,22 19.5,22 L13.5,22 C12.2700325,22 11.2475211,21.1117749 11.0389093,19.9417682 C10.8653433,19.9799013 10.6850188,20 10.5,20 L4.5,20 C3.11928813,20 2,18.8807119 2,17.5 L2,4.5 C2,3.11928813 3.11928813,2 4.5,2 L10.5,2 C11.709479,2 12.7183558,2.85887984 12.9499909,4 Z M13,5 L13,17.5 C13,18.3179089 12.6072234,19.0440799 12,19.5001831 C12.0000989,20.3285261 12.6716339,21 13.5,21 L19.5,21 C20.3284271,21 21,20.3284271 21,19.5 L21,6.5 C21,5.67157288 20.3284271,5 19.5,5 L13,5 Z M8.56005566,11.4964303 C8.54036595,11.4987873 8.52032459,11.5 8.5,11.5 L6.5,11.5 C6.47967541,11.5 6.45963405,11.4987873 6.43994434,11.4964303 L5.96423835,12.6856953 C5.86168164,12.9420871 5.57069642,13.066795 5.31430466,12.9642383 C5.0579129,12.8616816 4.93320495,12.5706964 5.03576165,12.3143047 L7.03576165,7.31430466 C7.20339081,6.89523178 7.79660919,6.89523178 7.96423835,7.31430466 L9.96423835,12.3143047 C10.066795,12.5706964 9.9420871,12.8616816 9.68569534,12.9642383 C9.42930358,13.066795 9.13831836,12.9420871 9.03576165,12.6856953 L8.56005566,11.4964303 L8.56005566,11.4964303 Z M8.16148352,10.5 L7.5,8.8462912 L6.83851648,10.5 L8.16148352,10.5 Z M10.5,3 L4.5,3 C3.67157288,3 3,3.67157288 3,4.5 L3,17.5 C3,18.3284271 3.67157288,19 4.5,19 L10.5,19 C11.3284271,19 12,18.3284271 12,17.5 L12,4.5 C12,3.67157288 11.3284271,3 10.5,3 Z M6.5,18 C6.22385763,18 6,17.7761424 6,17.5 C6,17.2238576 6.22385763,17 6.5,17 L8.5,17 C8.77614237,17 9,17.2238576 9,17.5 C9,17.7761424 8.77614237,18 8.5,18 L6.5,18 Z M15.5,20 C15.2238576,20 15,19.7761424 15,19.5 C15,19.2238576 15.2238576,19 15.5,19 L17.5,19 C17.7761424,19 18,19.2238576 18,19.5 C18,19.7761424 17.7761424,20 17.5,20 L15.5,20 Z"/></svg>`;

  const abButton = document.createElement('button');
  abButton.id = CONFIG.BUTTON_ID;
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

  return abButton;
}

function addAbButton() {
  if (document.getElementById(CONFIG.BUTTON_ID)) {
    return; // Button already exists
  }

  const containerResult = document.evaluate(
    CONFIG.BUTTON_CONTAINER_XPATH, 
    document, 
    null, 
    XPathResult.FIRST_ORDERED_NODE_TYPE, 
    null
  );
  const buttonContainer = containerResult.singleNodeValue;

  if (buttonContainer) {
    console.log('GSD-HELPER: Creating the A/B button.');
    const abButton = createAbButton();
    buttonContainer.appendChild(abButton);
    console.log('GSD-HELPER: A/B button appended.');
  } else {
    console.log('GSD-HELPER: Button container not found for A/B button.');
  }
}

// Global helper function for popup communication
window.lovableHelper = {
  appendText: function(textToAppend) {
    try {
      // Try to find the textarea using the XPath first
      const xpath = "/html/body/div/div/div[2]/div[1]/div/form/div/div/textarea";
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      const textarea = result.singleNodeValue;
      
      if (textarea) {
        return {
          success: appendTextToTextarea(textarea, textToAppend),
          message: 'Text appended successfully'
        };
      }
      
      // Fallback: try to find any textarea that might be the Lovable prompt
      const fallbackTextarea = findLovableTextarea();
      if (fallbackTextarea) {
        return {
          success: appendTextToTextarea(fallbackTextarea, textToAppend),
          message: 'Text appended to likely Lovable textarea'
        };
      }
      
      return { success: false, message: 'Could not find Lovable textarea' };
    } catch (error) {
      return { success: false, message: 'Error: ' + error.message };
    }
  }
};

// Main initialization
function initializeContentScript() {
  console.log('=== Lovable Prompt Helper content script loaded ===');
  
  window.addEventListener('load', () => {
    setTimeout(async () => {
      try {
        const uri = window.location.href;
        
        // Find project URL and ID
        let projectUrl = findProjectName();
        const projectId = extractProjectId(uri);

        // Handle cases where we can't find project info
        if (!projectUrl && !projectId) {
          if (window.location.hostname.endsWith('.lovable.app')) {
            projectUrl = window.location.origin + '/';
          } else {
            alert('GSD-HELPER: Could not find a valid project UUID in the URL or a .lovable.app link.');
            return;
          }
        }

        const finalProjectId = projectId || 'not-found-on-this-page';
        const finalProjectUrl = projectUrl || 'Not found';
        
        // Initialize project
        await initializeProject(finalProjectId, finalProjectUrl);
        
      } catch (error) {
        console.error('GSD-HELPER error:', error);
        alert('GSD-HELPER error: ' + error.message);
      }
    }, CONFIG.INITIALIZATION_DELAY);
  });
}

// A/B Button observer setup
function setupAbButtonObserver() {
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
}

// Initialize everything
initializeContentScript();
setupAbButtonObserver();

console.log('Content script setup complete. Global helper available at window.lovableHelper');
