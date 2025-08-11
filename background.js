const lastByTab = new Map();

function isAnalytics(urlStr) {
  try {
    const u = new URL(urlStr);
    // Require lovable.dev/projects/<uuid> and query exactly ?settings=analytics
    const pathOk = /^\/projects\/[0-9a-f-]{36}$/i.test(u.pathname);
    const queryOk = u.search === "?settings=analytics";
    return u.hostname === "lovable.dev" && pathOk && queryOk;
  } catch { return false; }
}

function handle(tabId, url, source) {
  if (!url) return;
  if (lastByTab.get(tabId) === url) return;
  lastByTab.set(tabId, url);

  if (isAnalytics(url)) {
    console.log("✅ Reached Analytics settings", { tabId, url, source });
    // Do your thing here:
    chrome.tabs.sendMessage(tabId, { type: "ANALYTICS_SETTINGS_VIEW", url });
  }
}

// SPA route changes
chrome.webNavigation.onHistoryStateUpdated.addListener(({ tabId, url, frameId }) => {
  if (frameId === 0) handle(tabId, url, "historyStateUpdated");
});

// Full/committed navigations
chrome.webNavigation.onCommitted.addListener(({ tabId, url, frameId }) => {
  if (frameId === 0) handle(tabId, url, "committed");
});

// Tabs API fallback
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) handle(tabId, changeInfo.url, "tabs.onUpdated");
});

// When switching tabs
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  handle(tabId, tab.url, "tabs.onActivated");
});
