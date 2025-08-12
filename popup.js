// Constants
const CONFIG = {
  STATUS_DISPLAY_DURATION: 5000
};

// State
let experiments = [];

// DOM elements
const experimentsTableBody = document.getElementById('experimentsTableBody');
const status = document.getElementById('status');

// Utility functions
function showStatus(message, isError = false) {
  status.textContent = message;
  status.className = `status ${isError ? 'error' : 'success'}`;
  status.style.display = 'block';
  
  setTimeout(() => {
    status.style.display = 'none';
  }, CONFIG.STATUS_DISPLAY_DURATION);
}

// Data loading
async function loadExperiments() {
  try {
    const response = await fetch(chrome.runtime.getURL('mock.json'));
    if (!response.ok) {
      throw new Error('Failed to load experiments');
    }
    
    const data = await response.json();
    experiments = data.experiments || [];
    
    populateExperimentsTable();
  } catch (error) {
    console.error('Error loading experiments:', error);
    showStatus('Error loading experiments: ' + error.message, true);
  }
}

// Table population
function populateExperimentsTable() {
  experimentsTableBody.innerHTML = '';
  
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

// Experiment triggering
async function triggerExperimentFromTable(experimentIndex) {
  if (experimentIndex < 0 || experimentIndex >= experiments.length) {
    showStatus('Invalid experiment index', true);
    return;
  }

  const experiment = experiments[experimentIndex];
  
  try {
    showStatus('Triggering experiment...');
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) {
      showStatus('Could not access current tab', true);
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: triggerExperiment,
      args: [experiment]
    });
    
    if (results?.[0]?.result) {
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

// Function that will be executed in the page context
function triggerExperiment(experiment) {
  console.log('=== Triggering experiment ===');
  console.log('Experiment:', experiment);
  
  // This function runs in the page context, so it can access window.lovableHelper
  if (window.lovableHelper && window.lovableHelper.appendText) {
    const result = window.lovableHelper.appendText(experiment.description);
    return result;
  } else {
    return { success: false, message: 'Lovable helper not available' };
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
  loadExperiments();
});
