# Lovable A/B Test Assistant

A Chrome extension that helps you A/B test your Lovable prompts by reading code from the file editor and providing intelligent recommendations for prompt variations.

## Features

- **Code Reading**: Automatically reads code from the Lovable file editor to understand your current implementation
- **Smart A/B Testing**: Analyzes your code to provide targeted recommendations for prompt variations
- **Direct Prompt Injection**: Appends optimized prompts directly to the Lovable console
- **User-Friendly Interface**: Clean, modern popup with code reading and prompt management tools
- **Real-time Feedback**: Shows reading status and success/error messages

## How It Works

The extension works by:

1. **Code Analysis**: Reads code from the Lovable file editor using XPath targeting to understand your current implementation
2. **Context Understanding**: Analyzes the read code to understand what you're building
3. **A/B Recommendations**: Provides intelligent suggestions for prompt variations based on your code context
4. **Direct Integration**: Injects optimized prompts directly into the Lovable console for immediate testing

This approach ensures that A/B test recommendations are contextually relevant to your specific project and implementation.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the folder containing this extension
4. The extension icon should appear in your Chrome toolbar

## Usage

### Reading Code
1. Navigate to the Lovable file editor where you want to analyze code
2. Click the extension icon in your Chrome toolbar
3. Click "Read Code from File Editor"
4. Check the browser console to see the read code and analysis

### Appending Prompts
1. Enter your A/B test prompt variation in the textarea
2. Click "Append to Lovable Prompt"
3. The text will be automatically added to the Lovable prompt console

## Permissions

- **`activeTab`**: Required to access the current tab and read code from the file editor
- **`scripting`**: Required to inject scripts that can interact with the page's DOM and read code content
- **Content Scripts**: Automatically injected on all websites to enable code reading and prompt injection

These permissions are necessary for the extension to analyze your code and provide intelligent A/B testing recommendations.

## Files

- `manifest.json` - Extension configuration and permissions
- `hello.html` - Popup interface with styling
- `popup.js` - Popup logic and script injection
- `content.js` - Content script for page interaction (backup method)
- `hello_extensions.png` - Extension icon

## Roadmap

### Phase 1: Enhanced Analytics
- **PostHog Integration**: Track A/B test performance and user behavior
- **Firebase Analytics**: Comprehensive analytics and user insights
- **Performance Metrics**: Measure prompt effectiveness and conversion rates

### Phase 2: Smarter Code Reading
- **Intelligent File Detection**: Automatically detect relevant files without manual XPath
- **Multi-file Analysis**: Analyze entire codebases for better context
- **Language-specific Parsing**: Better understanding of different programming languages

### Phase 3: Advanced A/B Testing
- **Automated Test Generation**: AI-powered prompt variation suggestions
- **Statistical Analysis**: Built-in statistical significance testing
- **Winner Detection**: Automatic identification of best-performing prompts

### Phase 4: Enterprise Features
- **Team Collaboration**: Share A/B test results with team members
- **Custom Metrics**: Define project-specific success criteria
- **Integration APIs**: Connect with existing analytics and testing tools

## Technical Details

The extension uses direct script injection to access the file editor's DOM structure, reading code by:
1. Targeting the editor container using XPath
2. Finding all line divs (each representing a code line)
3. Reading text from span elements within each line
4. Providing the complete code context for analysis

This approach ensures reliable code reading even when content scripts face communication issues.