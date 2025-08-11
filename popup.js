document.addEventListener('DOMContentLoaded', function() {
  const appendButton = document.getElementById('appendButton');
  const readButton = document.getElementById('readButton');
  const createExperimentButton = document.getElementById('createExperimentButton');
  const insertFunnyAnalyticsButton = document.getElementById('insertFunnyAnalyticsButton');
  const checkSettingsButton = document.getElementById('checkSettingsButton');
  const setupAnalyticsButton = document.getElementById('setupAnalyticsButton');
  const promptText = document.getElementById('promptText');
  const projectName = document.getElementById('projectName');
  const status = document.getElementById('status');
  const experimentResult = document.getElementById('experimentResult');
  const ideasContainer = document.getElementById('ideasContainer');
  const ideasList = document.getElementById('ideasList');

  // Environment variable for API URL
  const API_BASE_URL = 'https://api.example.com';

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = `status ${isError ? 'error' : 'success'}`;
    status.style.display = 'block';
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 5000);
  }

  function showExperimentResult(data) {
    experimentResult.textContent = JSON.stringify(data, null, 2);
    experimentResult.style.display = 'block';
  }

  function displayIdeas(ideas) {
    ideasContainer.style.display = 'block';
    ideasList.innerHTML = '';

    // Parse ideas from the prompt text
    let ideaItems = [];
    if (ideas.prompt) {
      // Split by numbered lines and filter out empty ones
      const lines = ideas.prompt.split('\n').filter(line => line.trim());
      ideaItems = lines.map(line => {
        const match = line.match(/^\d+\.\s*(.+)/);
        return match ? match[1].trim() : line.trim();
      }).filter(item => item.length > 0);
    }

    if (ideaItems.length === 0) {
      ideasList.innerHTML = '<div class="loading">No A/B testing ideas available</div>';
      return;
    }

    ideaItems.forEach((idea, index) => {
      const ideaCard = document.createElement('div');
      ideaCard.className = 'idea-card';
      ideaCard.innerHTML = `
        <div class="idea-title">💡 Idea ${index + 1}</div>
        <div class="idea-description">${idea}</div>
        <div class="idea-actions">
          <button class="button select js-select-idea">
            ✅ Select This Idea
          </button>
          <button class="button select js-append-idea">
            📝 Add to Prompt
          </button>
        </div>
      `;
      
      ideaCard.querySelector('.js-select-idea').addEventListener('click', () => {
        document.querySelectorAll('.idea-card').forEach(card => card.classList.remove('selected-idea'));
        ideaCard.classList.add('selected-idea');
        showStatus(`Selected: ${idea}`);
        promptText.value = `A/B Test Idea: ${idea}`;
      });

      ideaCard.querySelector('.js-append-idea').addEventListener('click', () => {
        const currentValue = promptText.value;
        promptText.value = currentValue + (currentValue ? '\n\n' : '') + `A/B Test Idea: ${idea}`;
        showStatus('Idea added to prompt!');
      });

      ideasList.appendChild(ideaCard);
    });
  }



  // Check settings page
  checkSettingsButton.addEventListener('click', async function() {
    console.log('Check settings button clicked');
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Active tab:', tab);
      
      if (!tab.id) {
        showStatus('Could not access current tab', true);
        return;
      }

      showStatus('Checking for settings page...');

      // Use direct script injection to check settings
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: checkSettingsPageDirectly
      });
      
      if (results && results[0] && results[0].result) {
        const response = results[0].result;
        console.log('Check settings result:', response);
        
        if (response.success) {
          showStatus('Funny analytics inserted successfully! 🎉');
        } else {
          showStatus(response.message || 'Not on analytics settings page.');
        }
      } else {
        throw new Error('Script execution failed');
      }
      
    } catch (error) {
      console.error('Error checking settings page:', error);
      showStatus('Error: ' + error.message, true);
    }
  });

  // Setup analytics click listener
  setupAnalyticsButton.addEventListener('click', async function() {
    console.log('Setup analytics button clicked');
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Active tab:', tab);
      
      if (!tab.id) {
        showStatus('Could not access current tab', true);
        return;
      }

      showStatus('Setting up analytics click listener...');

      // Use direct script injection to setup analytics click listener
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: setupAnalyticsClickListenerDirectly
      });
      
      if (results && results[0] && results[0].result) {
        const response = results[0].result;
        console.log('Setup analytics result:', response);
        
        if (response.success) {
          showStatus('Analytics click listener setup complete! 🎯');
        } else {
          showStatus(response.message || 'Failed to setup analytics click listener', true);
        }
      } else {
        throw new Error('Script execution failed');
      }
      
    } catch (error) {
      console.error('Error setting up analytics click listener:', error);
      showStatus('Error: ' + error.message, true);
    }
  });

  // Insert funny analytics
  insertFunnyAnalyticsButton.addEventListener('click', async function() {
    console.log('Insert funny analytics button clicked');
    
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Active tab:', tab);
      
      if (!tab.id) {
        showStatus('Could not access current tab', true);
        return;
      }

      showStatus('Inserting funny analytics...');

      // Use direct script injection to insert the funny analytics
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: insertFunnyAnalyticsDirectly
      });
      
      if (results && results[0] && results[0].result) {
        const response = results[0].result;
        console.log('Insert funny analytics result:', response);
        
        if (response.success) {
          showStatus('Funny analytics inserted successfully! 🎉');
        } else {
          showStatus(response.message || 'Failed to insert funny analytics', true);
        }
      } else {
        throw new Error('Script execution failed');
      }
      
    } catch (error) {
      console.error('Error inserting funny analytics:', error);
      showStatus('Error: ' + error.message, true);
    }
  });



  // Get A/B ideas from API
  async function getABIdeas(experimentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/get_ab_ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experiment_id: experimentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('A/B ideas received:', data);
      return data;
      
    } catch (error) {
      console.error('Error getting A/B ideas:', error);
      throw error;
    }
  }

  // Create experiment
  createExperimentButton.addEventListener('click', async function() {
    const projectNameValue = projectName.value.trim();
    
    if (!projectNameValue) {
      showStatus('Please enter a project name', true);
      return;
    }

    try {
      showStatus('Creating experiment...');

      // Query external API to create experiment
      const response = await fetch(`${API_BASE_URL}/experiments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: projectNameValue,
          description: `A/B test experiment for ${projectNameValue}`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Experiment created:', data);
      
      // Get A/B ideas using the experiment ID
      if (data.id) {
        showStatus('Getting A/B ideas...');
        try {
          const abIdeas = await getABIdeas(data.id);
          data.ab_ideas = abIdeas;
          console.log('Experiment with A/B ideas:', data);
          
          // Display ideas beautifully
          displayIdeas(abIdeas);
        } catch (abError) {
          console.error('Failed to get A/B ideas:', abError);
          data.ab_ideas = { error: 'Failed to get A/B ideas' };
        }
      }
      
      showStatus('Experiment created successfully!');
      showExperimentResult(data);
      
      // Clear the input
      projectName.value = '';
      
    } catch (error) {
      console.error('Error creating experiment:', error);
      showStatus('Error: ' + error.message, true);
      
      // For demo purposes, show mock data if API fails
      const mockData = {
        id: "exp_" + Math.random().toString(36).substr(2, 9),
        feature_flag_key: "lovable_ab_test_" + projectNameValue.toLowerCase().replace(/\s+/g, '_'),
        project_name: projectNameValue,
        status: "active",
        created_at: new Date().toISOString(),
        ab_ideas: {
          prompt: "Here are some A/B testing ideas for your project:\n\n1. Test different headline variations\n2. Try different call-to-action buttons\n3. Experiment with different color schemes\n4. Test various layout arrangements\n5. Try different value propositions"
        }
      };
      
      showExperimentResult(mockData);
      displayIdeas(mockData.ab_ideas);
      showStatus('Mock experiment created (API unavailable)');
    }
  });

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

// Function that will be executed directly in the page context for reading code
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



// Function that will be executed directly in the page context for checking settings page
function checkSettingsPageDirectly() {
  console.log('=== Direct settings page check ===');
  
  try {
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('settings=analytics')) {
      console.log('🚨 Analytics settings page detected! Inserting funny analytics...');
      
      // Instead of alerting, call the function to insert the analytics div
      return insertFunnyAnalyticsDirectly();
    } else {
      console.log('❌ Not on analytics settings page');
      return { 
        success: false, 
        message: 'Not on analytics settings page'
      };
    }
  } catch (error) {
    console.error('Error checking settings page:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Function that will be executed directly in the page context for setting up analytics click listener
function setupAnalyticsClickListenerDirectly() {
  console.log('=== Direct analytics click listener setup ===');
  
  try {
    // Function to add the HTML
    function addHtmlContent() {
      console.log('🚀 Analytics trigger clicked! Adding HTML content...');
      
      // Create the HTML content to add
      const htmlContent = `
        <div class="analytics-helper-content" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          margin: 20px 0;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        ">
          <h3 style="margin: 0 0 16px 0; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
            🎉 Analytics Helper Activated!
          </h3>
          <p style="margin: 0 0 12px 0; line-height: 1.4;">
            Your analytics dashboard is now enhanced with additional features and insights.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px;">
            <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
              <div style="font-weight: bold;">Enhanced Metrics</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
              <div style="font-weight: bold;">Smart Insights</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
              <div style="font-weight: bold;">Real-time Data</div>
            </div>
          </div>
        </div>
      `;
      
      // Find the analytics trigger element
      const analyticsTrigger = document.querySelector("#radix-\\:r0\\:-trigger-analytics");
      
      if (analyticsTrigger) {
        console.log('✅ Found analytics trigger element:', analyticsTrigger);
        
        // Create a container for the HTML content
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.className = 'analytics-helper-container';
        
        // Insert the HTML after the analytics trigger element
        analyticsTrigger.parentNode.insertBefore(container, analyticsTrigger.nextSibling);
        
        console.log('✅ HTML content added successfully after analytics trigger');
        
        // Remove the click listener since we've already added the content
        analyticsTrigger.removeEventListener('click', addHtmlContent);
        
      } else {
        console.log('❌ Analytics trigger element not found');
      }
    }
    
    // Find the analytics trigger element
    const analyticsTrigger = document.querySelector("#radix-\\:r0\\:-trigger-analytics");
    
    if (analyticsTrigger) {
      console.log('✅ Found analytics trigger element, adding click listener');
      analyticsTrigger.addEventListener('click', addHtmlContent);
      return { success: true, message: 'Analytics click listener setup complete' };
    } else {
      console.log('❌ Analytics trigger element not found');
      return { success: false, message: 'Analytics trigger element not found' };
    }
  } catch (error) {
    console.error('Error setting up analytics click listener:', error);
    return { success: false, error: error.message };
  }
}

// Function that will be executed directly in the page context for inserting funny analytics
function insertFunnyAnalyticsDirectly() {
  console.log('=== Direct funny analytics insertion ===');
  
  try {
    // Find the target element using XPath
    const xpath1 = "/html/body/div[3]/div/div[2]/div[4]/div[1]";
    
    console.log('Using XPath 1:', xpath1);
    
    const result1 = document.evaluate(xpath1, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    
    const element1 = result1.singleNodeValue;
    
    console.log('Element 1 found:', element1);
    
    if (!element1) {
      console.log('Could not find target element');
      return { success: false, message: 'Could not find target element' };
    }
    
    // Check if funny analytics already exists
    const existingAnalytics = document.querySelector('.funny-analytics-container');
    if (existingAnalytics) {
      console.log('Funny analytics already exists, removing...');
      existingAnalytics.remove();
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
