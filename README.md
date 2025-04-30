# YouTube SEO Booster

A Chrome extension to enhance YouTube video SEO by providing tools for managing YouTube API keys, fetching video analytics, keyword suggestions, optimizing metadata, and automating video upload fields.

## Recent Fixes

The following issues have been fixed:

1. **Module Loading Issues**:
   - Changed absolute paths to relative paths in main.js
   - Updated load-social-tabs.js to use ES6 imports instead of dynamic script loading
   - Made social-tabs.js properly export its functions
   - Added type="module" to script tags in HTML files

2. **Content Security Policy**:
   - Updated to comply with Chrome's Manifest V3 requirements
   - Removed unsafe-inline and unsafe-eval from CSP
   - Updated code to work without inline scripts

3. **Content Script**:
   - Added content.js for YouTube integration
   - Properly configured content_scripts in manifest.json

4. **Permissions**:
   - Added scripting permission for better content script functionality

5. **HTML Files**:
   - Updated script loading order in fullpage.html
   - Fixed incorrect closing tags in fullpage.html

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the extension directory
4. The extension should now be installed and ready to use

## Usage

1. Navigate to a YouTube video page
2. Click the extension icon in the toolbar to open the fullpage dashboard
3. Use the various tools to analyze and optimize your video's SEO
4. For more advanced features, click "Open Full Dashboard" to access the full interface

## Features

- YouTube API key management
- Video analytics
- Keyword suggestions
- Competitor analysis
- Metadata optimization
- Social media integration
- Thumbnail generation
- A/B testing tools

## Troubleshooting

If you encounter any issues:

1. Check the browser console for error messages
2. Ensure your YouTube API key is valid and has the necessary permissions
3. Try reloading the extension from the extensions page
4. Clear your browser cache and restart Chrome