document.addEventListener('DOMContentLoaded', function() {
  const experimentsTableBody = document.getElementById('experimentsTableBody');
  const status = document.getElementById('status');

  let experiments = [];

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = `status ${isError ? 'error' : 'success'}`;
    status.style.display = 'block';
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 5000);
  }

  // Load experiments from mock.json
  async function loadExperiments() {
    try {
      const response = await fetch(chrome.runtime.getURL('mock.json'));
      if (!response.ok) {
        throw new Error('Failed to load experiments');
      }
      
      const data = await response.json();
      experiments = data.experiments || [];
      
      // Populate table
      populateExperimentsTable();
    } catch (error) {
      console.error('Error loading experiments:', error);
      showStatus('Error loading experiments: ' + error.message, true);
    }
  }

  // Populate the experiments table
  function populateExperimentsTable() {
    // Clear existing rows
    experimentsTableBody.innerHTML = '';
    
    // Add experiment rows
    experiments.forEach((experiment, index) => {
      const row = document.createElement('tr');
      
      // Experiment column
      const titleCell = document.createElement('td');
      titleCell.innerHTML = `
        <div class="experiment-title">${experiment.title}</div>
        <div class="experiment-id">ID: ${experiment.id}</div>
      `;
      
      // Description column
      const descCell = document.createElement('td');
      descCell.innerHTML = `<div class="experiment-description">${experiment.description}</div>`;
      
      // Action column
      const actionCell = document.createElement('td');
      const triggerButton = document.createElement('button');
      triggerButton.className = 'action-button';
      triggerButton.textContent = 'Trigger';
      triggerButton.onclick = () => triggerExperimentFromTable(index);
      actionCell.appendChild(triggerButton);
      
      row.appendChild(titleCell);
      row.appendChild(descCell);
      row.appendChild(actionCell);
      
      experimentsTableBody.appendChild(row);
    });
  }



  // Handle trigger button click from table
  async function triggerExperimentFromTable(experimentIndex) {
    if (experimentIndex < 0 || experimentIndex >= experiments.length) {
      showStatus('Invalid experiment index', true);
      return;
    }

    const experiment = experiments[experimentIndex];
    
    try {
      showStatus('Triggering experiment...');
      
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        showStatus('Could not access current tab', true);
        return;
      }

      // Execute script to trigger the experiment
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: triggerExperiment,
        args: [experiment]
      });
      
      if (results && results[0] && results[0].result) {
        const response = results[0].result;
        console.log('Trigger result:', response);
        
        if (response.success) {
          showStatus(`Experiment "${experiment.title}" triggered successfully!`);
        } else {
          showStatus(response.message || 'Failed to trigger experiment', true);
        }
      } else {
        throw new Error('Script execution failed');
      }
      
    } catch (error) {
      console.error('Error:', error);
      showStatus('Error: ' + error.message, true);
    }
  }

  // Load experiments when popup opens
  loadExperiments();
});

// Function that will be executed directly in the page context for triggering experiments
function triggerExperiment(experiment) {
  console.log('=== Triggering experiment ===');
  console.log('Experiment:', experiment);
  
  try {
    // For now, we'll just log the experiment details
    // In a real implementation, this would trigger the actual experiment logic
    console.log('Triggering experiment:', experiment.title);
    console.log('Experiment ID:', experiment.id);
    console.log('Description:', experiment.description);
    
    // You can add specific experiment logic here based on the experiment ID or title
    // For example:
    // - Modify DOM elements
    // - Send analytics events
    // - Apply CSS changes
    // - etc.
    
    // Example: Find and modify elements based on experiment
    if (experiment.title.includes('headline')) {
      const headlines = document.querySelectorAll('h1, h2');
      console.log('Found headlines:', headlines.length);
      // Add your headline modification logic here
    }
    
    if (experiment.title.includes('CTA')) {
      const buttons = document.querySelectorAll('button, a[href*="#"], .cta, .btn');
      console.log('Found CTAs:', buttons.length);
      // Add your CTA modification logic here
    }
    
    return { 
      success: true, 
      message: `Experiment "${experiment.title}" triggered successfully` 
    };
  } catch (error) {
    console.error('Error triggering experiment:', error);
    return { 
      success: false, 
      message: 'Error: ' + error.message 
    };
  }
}
