// Message handling for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('GSD-HELPER: Message received in background script.', request);
  
  try {
    if (request.type === "OPEN_POPUP") {
      console.log('GSD-HELPER: OPEN_POPUP message received, attempting to open popup.');
      chrome.action.openPopup();
    } else {
      console.warn('GSD-HELPER: Unknown message type received:', request.type);
    }
  } catch (error) {
    console.error('GSD-HELPER: Error handling message:', error);
  }
});