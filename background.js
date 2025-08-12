chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('GSD-HELPER: Message received in background script.', request);
  if (request.type === "OPEN_POPUP") {
    console.log('GSD-HELPER: OPEN_POPUP message received, attempting to open popup.');
    chrome.action.openPopup();
  }
});