# Getting Started with YouTube SEO Booster

This guide will walk you through the initial setup and configuration of the YouTube SEO Booster extension.

## Installation

1. **Local Development Installation**
   - Download or clone the repository
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

2. **Chrome Web Store Installation** (Coming Soon)
   - Visit our Chrome Web Store page
   - Click "Add to Chrome"
   - Confirm the installation

## First-Time Setup

### 1. API Configuration
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Go to "Library" in the left sidebar
   - Search for "YouTube Data API v3"
   - Click "Enable"

### 2. Generate API Credentials
1. Go to the Credentials page
2. Click "Create Credentials"
3. Select "API Key"
4. Copy your new API key
5. (Optional but recommended) Restrict the API key:
   - Set application restrictions to "HTTP referrers"
   - Add your YouTube domains
   - Restrict to YouTube Data API v3

### 3. Extension Configuration
1. Click the YouTube SEO Booster icon in your browser
2. Go to Settings > API Management
3. Paste your API key
4. Click "Verify Connection"
5. Configure your default preferences:
   - Default language
   - Target regions
   - Analytics dashboard layout
   - Notification preferences

## Initial Usage

1. **Dashboard Access**
   - Click the extension icon
   - Select "Open Full Dashboard"
   - You'll see the main analytics overview

2. **Quick Tools**
   - Right-click any YouTube video
   - Access the context menu tools
   - Try the "Quick SEO Analysis"

3. **Verify Installation**
   - Check the extension icon for any warning indicators
   - Verify API connection in settings
   - Test basic features like keyword research

## Next Steps

- Explore the [Core Features](core-features.md) documentation
- Set up your [Social Media Integration](social-media-setup.md)
- Learn about [Advanced Usage](advanced-usage.md)

## Troubleshooting First-Time Setup

If you encounter any issues:

1. **API Key Not Working**
   - Verify the key is correctly copied
   - Check API restrictions
   - Ensure YouTube Data API is enabled

2. **Extension Not Loading**
   - Check Chrome's extension page for errors
   - Verify all files are present
   - Try reloading the extension

3. **Dashboard Not Showing Data**
   - Confirm API key is properly configured
   - Check your internet connection
   - Clear browser cache and reload

For additional help, check our [Troubleshooting Guide](troubleshooting.md) or [raise an issue](https://github.com/shahzadafaisal6/Youtube-Seo-Booster-WebExtention/issues) on GitHub.