# Lovable Prompt Helper Chrome Extension

A Chrome extension that allows you to quickly append text to the Lovable AI prompt console.

## Features

- **Easy Text Appending**: Add text to the Lovable prompt textarea with a single click
- **User-Friendly Interface**: Clean, modern popup with textarea input and status feedback
- **Smart Detection**: Automatically finds the Lovable prompt textarea using XPath or fallback detection
- **Real-time Feedback**: Shows success/error messages after each operation

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the folder containing this extension
4. The extension icon should appear in your Chrome toolbar

## Usage

1. Navigate to the Lovable website where you want to append text to the prompt
2. Click the extension icon in your Chrome toolbar
3. Enter the text you want to append in the textarea
4. Click "Append to Lovable Prompt"
5. The text will be automatically added to the Lovable prompt console

## How It Works

The extension uses a content script that:
- Targets the specific XPath: `/html/body/div/div/div[2]/div[1]/div/form/div/div/textarea`
- Falls back to finding textareas with "ask", "prompt", or "lovable" in their placeholder text
- Appends your text to the existing content
- Triggers input events to ensure the page recognizes the change
- Focuses the textarea for immediate use

## Files

- `manifest.json` - Extension configuration and permissions
- `hello.html` - Popup interface with styling
- `popup.js` - Popup logic and communication with content script
- `content.js` - Content script that interacts with the webpage
- `hello_extensions.png` - Extension icon

## Permissions

- `activeTab` - To access the current tab
- `scripting` - To inject content scripts
- Content scripts on all websites to find the Lovable textarea