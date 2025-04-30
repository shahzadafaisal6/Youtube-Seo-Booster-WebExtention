# Social Media Integration Setup Guide

This guide will help you set up developer accounts and API keys for integrating social media platforms with YouTube SEO Booster.

## Quick Share Method (Recommended)

The extension provides a simple way to share your YouTube videos to social media platforms without requiring API keys or developer accounts:

1. Go to the Social Media tab in the extension
2. Enter your YouTube video ID or URL in the "Quick Share" section
3. Click on any platform button to share
4. Complete the sharing process on the platform's website

This method is simpler and doesn't require any setup, but it will open a new browser window for each share.

## API Integration Method (Advanced)

For advanced users who want to set up direct API integration, follow these steps for each platform:

### Facebook

1. **Create a Developer Account**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Sign in with your Facebook account
   - Complete the developer registration process

2. **Create a New App**:
   - Click "Create App"
   - Select "Consumer" as the app type
   - Enter your app name and contact email
   - Click "Create App"

3. **Set Up Facebook Login**:
   - From your app dashboard, add the "Facebook Login" product
   - Go to Settings > Basic and note your App ID and App Secret
   - Under Facebook Login > Settings, add the following Redirect URI:
     `chrome-extension://[YOUR-EXTENSION-ID]/oauth-callback.html`
   - Enable "Client OAuth Login" and "Web OAuth Login"

4. **Configure Permissions**:
   - Request the following permissions:
     - `public_profile`
     - `email`
     - `pages_show_list`
     - `pages_manage_posts`

### Twitter/X

1. **Create a Developer Account**:
   - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Sign in with your Twitter account
   - Apply for a developer account by describing your use case

2. **Create a Project and App**:
   - Once approved, create a new Project
   - Add an App to your Project
   - Select "Web App" as the app type

3. **Configure App Settings**:
   - Set up User authentication settings
   - Add the following Redirect URI:
     `chrome-extension://[YOUR-EXTENSION-ID]/oauth-callback.html`
   - Request the following permissions:
     - `tweet.read`
     - `tweet.write`
     - `users.read`

4. **Get API Keys**:
   - Note your API Key, API Key Secret, and Bearer Token
   - Generate a Client ID and Client Secret for OAuth 2.0

### LinkedIn

1. **Create a Developer Account**:
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Sign in with your LinkedIn account
   - Click "Create App"

2. **Configure Your App**:
   - Fill in the required information about your app
   - Under Auth settings, add the following Redirect URL:
     `chrome-extension://[YOUR-EXTENSION-ID]/oauth-callback.html`
   - Request the following permissions:
     - `r_liteprofile`
     - `r_emailaddress`
     - `w_member_social`

3. **Get API Keys**:
   - Note your Client ID and Client Secret

### WhatsApp

WhatsApp doesn't require a developer account for basic sharing. The extension uses the WhatsApp Web share link format:

```
https://wa.me/?text=YOUR_MESSAGE
```

This will open WhatsApp Web with a pre-filled message containing your video link.

## Entering API Keys in the Extension

After obtaining your API keys:

1. Go to the "API Management" tab in the extension
2. Enter your API keys for each platform
3. Save your settings
4. Return to the Social Media tab to connect your accounts

## Troubleshooting

- **Connection Issues**: Make sure your API keys are entered correctly and have not expired
- **Permission Errors**: Verify that you've requested all the necessary permissions
- **Redirect URI Errors**: Double-check that your extension ID is correctly included in the redirect URIs

## Privacy and Security

- Your API keys are stored locally in your browser and are not sent to our servers
- We recommend using dedicated developer accounts for testing
- Review each platform's terms of service to ensure compliance

For more help, contact our support team.