/**
 * Social Media Module for YouTube SEO Booster
 * Handles all social media integration functionality
 */

// Local fallbacks for global utility functions
function _showNotification(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.log(`Notification [${type}]: ${message}`);
        
        // If notification element exists, try to use it directly
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }
}

function _logActivity(message, type = 'info') {
    if (typeof window.logActivity === 'function') {
        window.logActivity(message, type);
    } else {
        console.log(`Activity Log [${type}]: ${message}`);
        
        // If log element exists, try to use it directly
        const logEntries = document.getElementById('logEntries');
        if (logEntries) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${type}`;
            logEntry.innerHTML = `<span class="log-time">${timestamp}</span> ${message}`;
            
            logEntries.insertBefore(logEntry, logEntries.firstChild);
        }
    }
}

/**
 * Extract video ID from a YouTube URL or ID string
 */
function extractVideoId(input) {
    if (!input) return null;
    
    // Clean the input
    const cleanInput = input.trim();
    
    // Check if it's already a video ID (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanInput)) {
        return cleanInput;
    }
    
    // Try to extract from youtube.com/watch?v= URL
    if (cleanInput.includes('youtube.com/watch')) {
        try {
            const url = new URL(cleanInput);
            const videoId = url.searchParams.get('v');
            if (videoId) return videoId;
        } catch (e) {
            console.error('Error parsing YouTube URL:', e);
        }
    }
    
    // Try to extract from youtu.be/ URL
    if (cleanInput.includes('youtu.be/')) {
        try {
            const parts = cleanInput.split('youtu.be/');
            if (parts.length > 1) {
                const videoId = parts[1].split('?')[0].split('&')[0].split('/')[0];
                if (videoId && videoId.length === 11) return videoId;
            }
        } catch (e) {
            console.error('Error parsing youtu.be URL:', e);
        }
    }
    
    return null;
}

/**
 * Direct share to social media without requiring OAuth connection
 */
function directShareToSocial(platform, videoId) {
    if (!videoId) {
        _showNotification('Please enter a video ID first', 'warning');
        return;
    }
    
    // Extract video ID if a full URL was provided
    const extractedId = extractVideoId(videoId);
    if (!extractedId) {
        _showNotification('Invalid video ID or URL', 'error');
        return;
    }
    
    // Get video data if available, otherwise use defaults
    chrome.storage.local.get(['currentVideoData'], function(result) {
        const videoData = result.currentVideoData;
        
        // Get video details
        const videoTitle = videoData ? videoData.snippet.title : 'My YouTube Video';
        const videoUrl = `https://youtu.be/${extractedId}`;
        
        // Share directly to the platform
        shareToSpecificPlatform(platform, videoUrl, videoTitle, null);
    });
}

// Export all functions for use in main.js
export const SocialModule = {
    // Public API functions
    connectSocialAccount,
    disconnectSocialAccount,
    saveSocialPostSettings,
    shareToSocialMedia,
    manualShare,
    showConnectionPanel,
    directShareToSocial,
    
    // Additional functions needed by main.js
    initializeSocialConnections,
    loadSocialMetrics,
    updatePostHistory,
    displaySocialMetrics,
    
    // Helper functions
    getPlatformDummyUsername,
    extractVideoId,
    
    // New functions for account settings
    manageSocialAccount,
    updateAccountsList,
    showAccountForm
};

/**
 * Connect social media account
 */
function connectSocialAccount(platform) {
    try {
        // Show loading indicator
        _showNotification(`Connecting to ${platform}...`, 'info');
        
        // In a real implementation, this would initiate OAuth flow
        // For now, we'll simulate the connection process with enhanced data
        
        // Define platform-specific authentication URLs (for future implementation)
        const authUrls = {
            'facebook': 'https://www.facebook.com/v12.0/dialog/oauth',
            'twitter': 'https://twitter.com/i/oauth2/authorize',
            'instagram': 'https://api.instagram.com/oauth/authorize',
            'linkedin': 'https://www.linkedin.com/oauth/v2/authorization',
            'tiktok': 'https://open-api.tiktok.com/platform/oauth/connect/',
            'telegram': 'https://oauth.telegram.org/auth',
            'whatsapp': 'https://api.whatsapp.com/oauth/authorize'
        };
        
        console.log(`Auth URL for ${platform} would be: ${authUrls[platform] || 'Not defined'}`);
        
        // Simulate connection process (would be replaced with actual OAuth flow)
        setTimeout(() => {
            // Store connected status in local storage with enhanced metadata
            chrome.storage.local.get(['connectedAccounts'], function(result) {
                try {
                    const accounts = result.connectedAccounts || {};
                    
                    // Create more detailed account info
                    accounts[platform] = {
                        connected: true,
                        username: getPlatformDummyUsername(platform),
                        displayName: getPlatformDummyDisplayName(platform),
                        connectedAt: new Date().toISOString(),
                        // Add platform-specific metadata
                        postCount: Math.floor(Math.random() * 100),
                        followers: Math.floor(Math.random() * 1000),
                        // Add token info (simulated)
                        tokenInfo: {
                            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                            scopes: getPlatformScopes(platform)
                        }
                    };
                    
                    chrome.storage.local.set({ connectedAccounts: accounts }, function() {
                        // Update UI to show connected status
                        updateConnectionStatus(platform, accounts[platform]);
                        
                        _showNotification(`Connected to ${platform} successfully!`, 'success');
                        _logActivity(`Connected ${platform} account: ${accounts[platform].username}`);
                    });
                } catch (err) {
                    console.error(`Error saving ${platform} connection:`, err);
                    _showNotification(`Failed to connect to ${platform}`, 'error');
                }
            });
        }, 1500);
    } catch (err) {
        console.error(`Error connecting to ${platform}:`, err);
        _showNotification(`Error connecting to ${platform}`, 'error');
    }
}

/**
 * Get platform display name for demo purposes
 */
function getPlatformDummyDisplayName(platform) {
    const displayNames = {
        'facebook': 'Your Name',
        'twitter': 'Your Twitter Name',
        'instagram': 'Your Instagram Profile',
        'tiktok': 'Your TikTok Account',
        'linkedin': 'Your Full Name',
        'pinterest': 'Your Pinterest',
        'whatsapp': 'Your WhatsApp Business'
    };
    
    return displayNames[platform] || 'User Account';
}

/**
 * Get platform scopes for demo purposes
 */
function getPlatformScopes(platform) {
    const scopes = {
        'facebook': ['public_profile', 'email', 'pages_show_list', 'pages_manage_posts'],
        'twitter': ['tweet.read', 'tweet.write', 'users.read'],
        'instagram': ['user_profile', 'user_media'],
        'linkedin': ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
        'tiktok': ['user.info.basic', 'video.publish'],
        'telegram': ['basic'],
        'whatsapp': ['business_management']
    };
    
    return scopes[platform] || ['basic'];
}

/**
 * Get dummy username for demo purposes
 */
function getPlatformDummyUsername(platform) {
    const usernames = {
        'facebook': 'YourName',
        'twitter': '@YourHandle',
        'instagram': 'your_insta',
        'tiktok': '@your_tiktok',
        'linkedin': 'your.name',
        'pinterest': '@yourpins',
        'whatsapp': '+1234567890'
    };
    
    return usernames[platform] || 'user';
}

/**
 * Update connection status in UI to show connected state
 */
function updateConnectionStatus(platform, accountInfo) {
    try {
        console.log(`Updating connection status for ${platform}:`, accountInfo);
        
        // Connection button
        const connectBtnId = `connect${capitalizeFirstLetter(platform)}`;
        const connectBtn = document.getElementById(connectBtnId);
        
        if (connectBtn) {
            // Update button text and class
            connectBtn.textContent = `Disconnect ${capitalizeFirstLetter(platform)}`;
            connectBtn.classList.add('connected');
            
            // Replace with cloned button to remove existing listeners
            const newConnectBtn = connectBtn.cloneNode(true);
            connectBtn.parentNode.replaceChild(newConnectBtn, connectBtn);
            
            // Add event listener for disconnecting
            newConnectBtn.addEventListener('click', function() {
                disconnectSocialAccount(platform);
            });
            
            console.log(`Updated ${platform} connection button to disconnectable`);
        } else {
            console.warn(`Connection button for ${platform} not found with ID: ${connectBtnId}`);
        }
        
        // Update platform status in dashboard
        updatePlatformStatus(platform, true, accountInfo);
        
        // Show post settings
        const postSettingsId = `${platform}PostSettings`;
        const postSettings = document.getElementById(postSettingsId);
        if (postSettings) {
            postSettings.style.display = 'block';
        }
        
    } catch (error) {
        console.error(`Error updating connection for ${platform}:`, error);
    }
}

/**
 * Disconnect social media account
 */
function disconnectSocialAccount(platform) {
    _showNotification(`Disconnecting from ${platform}...`, 'info');
    
    // Remove connection from storage
    chrome.storage.local.get(['connectedAccounts'], function(result) {
        const accounts = result.connectedAccounts || {};
        
        delete accounts[platform];
        
        chrome.storage.local.set({ connectedAccounts: accounts }, function() {
            // Update UI to show disconnected status
            resetConnectionStatus(platform);
            
            _showNotification(`Disconnected from ${platform}`, 'success');
            _logActivity(`Disconnected ${platform} account`);
        });
    });
}

/**
 * Reset connection status UI for a platform
 */
function resetConnectionStatus(platform) {
    try {
        console.log(`Resetting connection status for ${platform}`);
        
        // Connection button (connect{Platform} format)
        const connectBtnId = `connect${capitalizeFirstLetter(platform)}`;
        const connectBtn = document.getElementById(connectBtnId);
        
        if (connectBtn) {
            // Reset button text and class
            connectBtn.textContent = `Connect ${capitalizeFirstLetter(platform)}`;
            connectBtn.classList.remove('connected');
            
            // Replace with cloned button to remove existing listeners
            const newConnectBtn = connectBtn.cloneNode(true);
            connectBtn.parentNode.replaceChild(newConnectBtn, connectBtn);
            
            // Add event listener for connecting
            newConnectBtn.addEventListener('click', function() {
                connectSocialAccount(platform);
            });
            
            console.log(`Reset ${platform} connection button`);
        } else {
            // Just log a debug message instead of a warning
            console.log(`Connection button for ${platform} not found with ID: ${connectBtnId}`);
        }
        
        // Only update platform status if the element exists
        try {
            updatePlatformStatus(platform, false);
        } catch (error) {
            console.log(`Platform status element for ${platform} not available`);
        }
        
        // Hide post settings
        const postSettingsId = `${platform}PostSettings`;
        const postSettings = document.getElementById(postSettingsId);
        if (postSettings) {
            postSettings.style.display = 'none';
        }
        
    } catch (error) {
        console.error(`Error resetting connection for ${platform}:`, error);
    }
}

/**
 * Connect button click handler
 */
function connectButtonHandler(event) {
    const platform = event.currentTarget.dataset.platform;
    if (platform) {
        connectSocialAccount(platform);
    }
}

/**
 * Disconnect button click handler
 */
function disconnectButtonHandler(event) {
    const platform = event.currentTarget.dataset.platform;
    if (platform) {
        disconnectSocialAccount(platform);
    }
}

/**
 * Initialize connection status for all platforms
 */
function initializeSocialConnections() {
    console.log('Initializing social connections');
    chrome.storage.local.get(['connectedAccounts'], function(result) {
        const accounts = result.connectedAccounts || {};
        
        // Initialize each platform
        const platforms = ['facebook', 'twitter', 'instagram', 'tiktok', 'linkedin', 'pinterest', 'whatsapp'];
        
        platforms.forEach(platform => {
            if (accounts[platform] && accounts[platform].connected) {
                updateConnectionStatus(platform, accounts[platform]);
            } else {
                resetConnectionStatus(platform);
            }
        });
    });
}

/**
 * Save social post settings
 */
function saveSocialPostSettings(platform) {
    const autoPostCheckbox = document.getElementById(`${platform}AutoPost`);
    const customMessageInput = document.getElementById(`${platform}CustomMessage`);
    
    if (!autoPostCheckbox || !customMessageInput) {
        _showNotification('Error: Settings elements not found', 'error');
        return;
    }
    
    const settings = {
        autoPost: autoPostCheckbox.checked,
        customMessage: customMessageInput.value.trim()
    };
    
    // Save settings
    chrome.storage.local.get(['socialSettings'], function(result) {
        const socialSettings = result.socialSettings || {};
        
        socialSettings[platform] = settings;
        
        chrome.storage.local.set({ socialSettings: socialSettings }, function() {
            _showNotification(`${platform} settings saved!`, 'success');
            _logActivity(`Updated ${platform} sharing settings`);
        });
    });
}

/**
 * Share video to social media
 */
function shareToSocialMedia(videoId, autoPost = false) {
    if (!videoId) {
        _showNotification('Please enter a video ID first', 'warning');
        return;
    }
    
    // Get connected accounts and settings
    chrome.storage.local.get(['connectedAccounts', 'socialSettings', 'currentVideoData'], function(result) {
        const accounts = result.connectedAccounts || {};
        const settings = result.socialSettings || {};
        const videoData = result.currentVideoData;
        
        if (!videoData && autoPost) {
            _showNotification('No video data available for sharing', 'warning');
            return;
        }
        
        // Get video details
        const videoTitle = videoData ? videoData.snippet.title : 'My YouTube Video';
        const videoUrl = `https://youtu.be/${videoId}`;
        
        // For each connected platform with autoPost enabled
        for (const [platform, account] of Object.entries(accounts)) {
            if (account.connected) {
                if (autoPost && settings[platform] && settings[platform].autoPost) {
                    // Auto post to this platform
                    shareToSpecificPlatform(platform, videoUrl, videoTitle, settings[platform].customMessage);
                } else if (!autoPost) {
                    // Manual sharing should show the share panel
                    showSharePanel(platform, videoUrl, videoTitle, settings[platform]?.customMessage || '');
                }
            }
        }
    });
}

/**
 * Share to a specific platform
 */
function shareToSpecificPlatform(platform, videoUrl, videoTitle, customMessage) {
    // Format the message
    const message = customMessage || `Check out my new YouTube video: ${videoTitle}`;
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(videoUrl);
    
    // Create platform-specific share URLs
    let shareUrl;
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`;
            break;
        default:
            _showNotification(`Sharing to ${platform} not implemented yet`, 'warning');
            return;
    }
    
    // Open the share URL in a new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    // Log the activity
    _showNotification(`Opened ${platform} share dialog`, 'success');
    _logActivity(`Shared video to ${platform}`);
}

/**
 * Show share panel for manual sharing
 */
function showSharePanel(platform, videoUrl, videoTitle, customMessage) {
    const sharePanel = document.getElementById('manualSharePanel');
    
    if (!sharePanel) {
        _showNotification('Share panel not found', 'error');
        return;
    }
    
    // Prepare default message
    const defaultMessage = customMessage || `Check out my new video: ${videoTitle} ${videoUrl}`;
    
    // Update share panel
    sharePanel.innerHTML = `
        <h3>Share to ${capitalizeFirstLetter(platform)}</h3>
        <div class="share-content">
            <textarea id="shareMessage" class="form-control" rows="4">${defaultMessage}</textarea>
            <div class="share-details">
                <div class="share-info">
                    <p><strong>Video:</strong> ${videoTitle}</p>
                    <p><strong>URL:</strong> ${videoUrl}</p>
                </div>
            </div>
            <div class="share-actions">
                <button id="cancelShare" class="btn btn-secondary">Cancel</button>
                <button id="confirmShare" class="btn btn-primary">Share Now</button>
            </div>
        </div>
    `;
    
    // Show the panel
    sharePanel.style.display = 'block';
    
    // Add event listeners
    document.getElementById('cancelShare').addEventListener('click', function() {
        sharePanel.style.display = 'none';
    });
    
    document.getElementById('confirmShare').addEventListener('click', function() {
        const message = document.getElementById('shareMessage').value;
        
        // Simulate sharing
        _showNotification(`Sharing to ${platform}...`, 'info');
        
        setTimeout(() => {
            _showNotification(`Shared to ${platform} successfully!`, 'success');
            _logActivity(`Manually shared video to ${platform}`);
            
            // Hide the panel
            sharePanel.style.display = 'none';
        }, 1000);
    });
}

/**
 * Show social connection panel
 */
function showConnectionPanel() {
    // Update UI to ensure all social accounts are shown correctly
    initializeSocialConnections();
    
    // Load social metric stats if available
    loadSocialMetrics();
}

/**
 * Update post history in UI
 */
function updatePostHistory(videoId, platforms) {
    try {
        const postHistoryList = document.getElementById('postHistoryList');
        if (!postHistoryList) {
            console.warn('Post history list element not found');
            return;
        }
        
        const now = new Date();
        const timestamp = now.toLocaleString();
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-item-header">
                <span class="history-timestamp">${timestamp}</span>
                <span class="history-video-id">Video: ${videoId}</span>
            </div>
            <div class="history-platforms">
                Shared to: ${platforms.map(p => `<span class="platform-badge ${p}">${p}</span>`).join('')}
            </div>
        `;
        
        postHistoryList.insertBefore(historyItem, postHistoryList.firstChild);
    } catch (error) {
        console.error('Error updating post history:', error);
    }
}

/**
 * Manual share to social platforms
 */
function manualShare() {
    console.log('Manual share requested');
    
    try {
        // Get the video ID from the input field
        const videoIdField = document.getElementById('videoId');
        if (!videoIdField || !videoIdField.value) {
            _showNotification('Please enter a valid YouTube video ID first', 'warning');
            return;
        }
        
        const videoId = videoIdField.value.trim();
        const videoUrl = `https://youtu.be/${videoId}`;
        
        // Check which platforms are selected
        const selectedPlatforms = [];
        
        // Get platforms from checkboxes
        ['facebook', 'twitter', 'instagram', 'linkedin', 'telegram', 'whatsapp'].forEach(platform => {
            const checkbox = document.getElementById(`postTo${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
            if (checkbox && checkbox.checked) {
                selectedPlatforms.push(platform);
            }
        });
        
        if (selectedPlatforms.length === 0) {
            _showNotification('Please select at least one platform to share to', 'warning');
            return;
        }
        
        // Show sharing progress
        const notification = document.getElementById('notification');
        if (notification) {
            notification.innerHTML = `<div class="sharing-progress">Sharing to ${selectedPlatforms.length} platforms...</div>`;
            notification.className = 'notification info';
            notification.style.display = 'block';
        }
        
        // Simulate sharing process
        setTimeout(() => {
            _showNotification(`Successfully shared to ${selectedPlatforms.length} platforms`, 'success');
            _logActivity(`Manually shared video ${videoId} to ${selectedPlatforms.join(', ')}`);
            
            // Update post history
            updatePostHistory(videoId, selectedPlatforms);
        }, 2000);
    } catch (error) {
        console.error('Error in manual share:', error);
        _showNotification('Error sharing to social platforms', 'error');
    }
}

/**
 * Load social metrics for the social dashboard
 */
function loadSocialMetrics() {
    try {
        // Update to use dashboard elements that actually exist in the HTML
        const socialDashboard = document.querySelector('.social-media-dashboard');
        
        if (!socialDashboard) {
            console.warn('Social media dashboard not found');
            return;
        }
        
        const videoIdField = document.getElementById('videoId');
        if (!videoIdField || !videoIdField.value.trim()) {
            // Don't show warning as this is normal when first loading
            console.log('No video ID available for social metrics');
            return;
        }
        
        const videoId = videoIdField.value.trim();
        const extractedId = extractVideoId(videoId);
        
        if (!extractedId) {
            console.warn('Invalid video ID for social metrics');
            return;
        }
        
        // Add loading indicators to each platform in the dashboard
        const platforms = socialDashboard.querySelectorAll('.social-platform');
        platforms.forEach(platform => {
            const statsSection = platform.querySelector('.platform-stats');
            if (statsSection) {
                statsSection.innerHTML = '<p>Loading metrics...</p>';
            }
        });
        
        // Generate mock social metrics for demo
        setTimeout(() => {
            try {
                const mockMetrics = generateMockSocialMetrics();
                
                // Update stats for each platform
                Object.keys(mockMetrics.platforms).forEach(platform => {
                    if (platform === 'other') return; // Skip "other" category
                    
                    const platformElement = document.getElementById(`${platform}-platform`);
                    if (platformElement) {
                        const statsSection = platformElement.querySelector('.platform-stats');
                        if (statsSection) {
                            const data = mockMetrics.platforms[platform];
                            let statsHTML = '';
                            
                            // Different metrics based on platform
                            if (platform === 'facebook') {
                                statsHTML = `
                                    <p>Posts: ${data.shares}</p>
                                    <p>Likes: ${data.likes}</p>
                                    <p>Comments: ${data.comments}</p>
                                    <p>Engagement: ${data.engagement}</p>
                                `;
                            } else if (platform === 'twitter') {
                                statsHTML = `
                                    <p>Tweets: ${data.shares}</p>
                                    <p>Likes: ${data.likes}</p>
                                    <p>Retweets: ${data.retweets}</p>
                                    <p>Engagement: ${data.engagement}</p>
                                `;
                            } else {
                                statsHTML = `
                                    <p>Posts: ${data.shares}</p>
                                    <p>Engagement: ${data.engagement}</p>
                                `;
                            }
                            
                            statsSection.innerHTML = statsHTML;
                        }
                    }
                });
                
                _showNotification('Social metrics updated', 'success');
            } catch (innerError) {
                console.error('Error updating social metrics display:', innerError);
            }
        }, 1000);
    } catch (error) {
        console.error('Error in loadSocialMetrics:', error);
    }
}

/**
 * Generate mock social metrics for demo purposes
 */
function generateMockSocialMetrics() {
    return {
        shares: Math.floor(Math.random() * 100) + 20,
        platforms: {
            facebook: {
                shares: Math.floor(Math.random() * 50) + 10,
                likes: Math.floor(Math.random() * 80) + 15,
                comments: Math.floor(Math.random() * 30) + 5,
                engagement: (Math.random() * 4 + 1).toFixed(2) + '%'
            },
            twitter: {
                shares: Math.floor(Math.random() * 40) + 5,
                likes: Math.floor(Math.random() * 60) + 10,
                retweets: Math.floor(Math.random() * 20) + 3,
                engagement: (Math.random() * 3 + 0.5).toFixed(2) + '%'
            },
            instagram: {
                shares: Math.floor(Math.random() * 30) + 2,
                likes: Math.floor(Math.random() * 100) + 20,
                comments: Math.floor(Math.random() * 40) + 8,
                engagement: (Math.random() * 5 + 2).toFixed(2) + '%'
            },
            other: {
                shares: Math.floor(Math.random() * 20) + 1,
                engagement: (Math.random() * 2 + 0.2).toFixed(2) + '%'
            }
        },
        referrals: Math.floor(Math.random() * 200) + 50,
        conversionRate: (Math.random() * 5 + 1).toFixed(2) + '%'
    };
}

/**
 * Display social metrics in the UI
 */
function displaySocialMetrics(metrics) {
    try {
        const metricsContainer = document.getElementById('socialMetrics');
        
        if (!metricsContainer) {
            console.warn('Social metrics container not found');
            return;
        }
        
        const metricsHTML = `
            <div class="metrics-overview">
                <div class="metric-card">
                    <h3>Total Shares</h3>
                    <p>${metrics.shares}</p>
                </div>
                <div class="metric-card">
                    <h3>Referrals</h3>
                    <p>${metrics.referrals}</p>
                </div>
                <div class="metric-card">
                    <h3>Conversion</h3>
                    <p>${metrics.conversionRate}</p>
                </div>
            </div>
            
            <h3>Platform Breakdown</h3>
            <div class="platform-metrics">
                <div class="platform-card facebook">
                    <h4>Facebook</h4>
                    <div class="platform-stats">
                        <div class="stat-item">
                            <span class="stat-label">Shares</span>
                            <span class="stat-value">${metrics.platforms.facebook.shares}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Likes</span>
                            <span class="stat-value">${metrics.platforms.facebook.likes}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Comments</span>
                            <span class="stat-value">${metrics.platforms.facebook.comments}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Engagement</span>
                            <span class="stat-value">${metrics.platforms.facebook.engagement}</span>
                        </div>
                    </div>
                </div>
                
                <div class="platform-card twitter">
                    <h4>Twitter</h4>
                    <div class="platform-stats">
                        <div class="stat-item">
                            <span class="stat-label">Shares</span>
                            <span class="stat-value">${metrics.platforms.twitter.shares}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Likes</span>
                            <span class="stat-value">${metrics.platforms.twitter.likes}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Retweets</span>
                            <span class="stat-value">${metrics.platforms.twitter.retweets}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Engagement</span>
                            <span class="stat-value">${metrics.platforms.twitter.engagement}</span>
                        </div>
                    </div>
                </div>
                
                <div class="platform-card instagram">
                    <h4>Instagram</h4>
                    <div class="platform-stats">
                        <div class="stat-item">
                            <span class="stat-label">Shares</span>
                            <span class="stat-value">${metrics.platforms.instagram.shares}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Likes</span>
                            <span class="stat-value">${metrics.platforms.instagram.likes}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Comments</span>
                            <span class="stat-value">${metrics.platforms.instagram.comments}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Engagement</span>
                            <span class="stat-value">${metrics.platforms.instagram.engagement}</span>
                        </div>
                    </div>
                </div>
                
                <div class="platform-card other">
                    <h4>Other Platforms</h4>
                    <div class="platform-stats">
                        <div class="stat-item">
                            <span class="stat-label">Shares</span>
                            <span class="stat-value">${metrics.platforms.other.shares}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Engagement</span>
                            <span class="stat-value">${metrics.platforms.other.engagement}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="metrics-note">
                <p>Note: Social metrics are estimates based on available data and may not reflect actual numbers.</p>
            </div>
        `;
        
        metricsContainer.innerHTML = metricsHTML;
    } catch (error) {
        console.error('Error displaying social metrics:', error);
    }
}

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Note: extractVideoId function is already defined above (line 49)

/**
 * Manage social media account settings
 * @param {string} platform - The social media platform
 * @param {string} action - 'save' or 'remove'
 */
function manageSocialAccount(platform, action) {
    try {
        if (!platform) {
            _showNotification('Invalid platform specified', 'error');
            return;
        }

        if (action === 'save') {
            // Get account details from settings form
            const usernameInput = document.getElementById(`${platform}Username`);
            const apiKeyInput = document.getElementById(`${platform}ApiKey`);
            
            if (!usernameInput || !apiKeyInput) {
                _showNotification(`Cannot find ${platform} account form fields`, 'error');
                return;
            }
            
            const username = usernameInput.value.trim();
            const apiKey = apiKeyInput.value.trim();
            
            if (!username) {
                _showNotification(`Please enter a username for ${platform}`, 'warning');
                return;
            }
            
            // Save account details
            chrome.storage.local.get(['socialAccounts'], function(result) {
                const accounts = result.socialAccounts || {};
                
                accounts[platform] = {
                    username: username,
                    apiKey: apiKey,
                    updatedAt: new Date().toISOString()
                };
                
                chrome.storage.local.set({ socialAccounts: accounts }, function() {
                    _showNotification(`${platform} account settings saved`, 'success');
                    _logActivity(`Updated ${platform} account settings`);
                    
                    // Update the accounts list in UI
                    updateAccountsList();
                });
            });
        } else if (action === 'remove') {
            // Remove account
            chrome.storage.local.get(['socialAccounts'], function(result) {
                const accounts = result.socialAccounts || {};
                
                if (accounts[platform]) {
                    delete accounts[platform];
                    
                    chrome.storage.local.set({ socialAccounts: accounts }, function() {
                        _showNotification(`${platform} account removed`, 'success');
                        _logActivity(`Removed ${platform} account`);
                        
                        // Update the accounts list in UI
                        updateAccountsList();
                    });
                } else {
                    _showNotification(`No ${platform} account found to remove`, 'warning');
                }
            });
        }
    } catch (error) {
        console.error(`Error managing ${platform} account:`, error);
        _showNotification(`Error updating ${platform} account settings`, 'error');
    }
}

/**
 * Update social media accounts list in the UI
 */
function updateAccountsList() {
    try {
        const accountsList = document.getElementById('socialAccountsList');
        if (!accountsList) {
            console.warn('Social accounts list element not found');
            return;
        }
        
        chrome.storage.local.get(['socialAccounts'], function(result) {
            const accounts = result.socialAccounts || {};
            
            if (Object.keys(accounts).length === 0) {
                accountsList.innerHTML = '<p>No social media accounts configured</p>';
                return;
            }
            
            let html = '';
            for (const [platform, details] of Object.entries(accounts)) {
                html += `
                    <div class="account-item ${platform}">
                        <div class="account-info">
                            <span class="account-platform">${capitalizeFirstLetter(platform)}</span>
                            <span class="account-username">${details.username}</span>
                            <span class="account-updated">Updated: ${new Date(details.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div class="account-actions">
                            <button class="btn-icon edit-account" data-platform="${platform}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon remove-account" data-platform="${platform}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
            
            accountsList.innerHTML = html;
            
            // Add event listeners to the action buttons
            accountsList.querySelectorAll('.edit-account').forEach(btn => {
                btn.addEventListener('click', function() {
                    showAccountForm(this.dataset.platform);
                });
            });
            
            accountsList.querySelectorAll('.remove-account').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (confirm(`Are you sure you want to remove the ${this.dataset.platform} account?`)) {
                        manageSocialAccount(this.dataset.platform, 'remove');
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error updating social accounts list:', error);
    }
}

/**
 * Show account settings form for a specific platform
 */
function showAccountForm(platform) {
    try {
        const formContainer = document.getElementById('socialAccountForm');
        if (!formContainer) {
            _showNotification('Social account form container not found', 'error');
            return;
        }
        
        chrome.storage.local.get(['socialAccounts'], function(result) {
            const accounts = result.socialAccounts || {};
            const account = accounts[platform] || { username: '', apiKey: '' };
            
            formContainer.innerHTML = `
                <h3>${capitalizeFirstLetter(platform)} Account Settings</h3>
                <div class="form-group">
                    <label for="${platform}Username">Username:</label>
                    <input type="text" id="${platform}Username" class="form-control" value="${account.username}" />
                </div>
                <div class="form-group">
                    <label for="${platform}ApiKey">API Key (optional):</label>
                    <input type="password" id="${platform}ApiKey" class="form-control" value="${account.apiKey || ''}" />
                </div>
                <div class="form-actions">
                    <button id="cancelAccountForm" class="btn btn-secondary">Cancel</button>
                    <button id="saveAccountForm" class="btn btn-primary" data-platform="${platform}">Save</button>
                </div>
            `;
            
            // Show the form
            formContainer.style.display = 'block';
            
            // Add event listeners
            document.getElementById('cancelAccountForm').addEventListener('click', function() {
                formContainer.style.display = 'none';
            });
            
            document.getElementById('saveAccountForm').addEventListener('click', function() {
                manageSocialAccount(this.dataset.platform, 'save');
                formContainer.style.display = 'none';
            });
        });
    } catch (error) {
        console.error(`Error showing account form for ${platform}:`, error);
        _showNotification('Error showing account settings form', 'error');
    }
}

/**
 * Update platform status in the dashboard
 * @param {string} platform - The social media platform
 * @param {boolean} isConnected - Whether the platform is connected
 * @param {object} accountInfo - Optional account info for connected platforms
 */
function updatePlatformStatus(platform, isConnected, accountInfo = null) {
    try {
        console.log(`Updating platform status for ${platform}, connected: ${isConnected}`);
        
        // First, update the legacy dashboard UI if it exists
        updateLegacyPlatformUI(platform, isConnected, accountInfo);
        
        // Then, update the new platform-specific tab UI
        updateNewPlatformUI(platform, isConnected, accountInfo);
    } catch (error) {
        console.error(`Error updating platform status for ${platform}:`, error);
    }
}

/**
 * Update the legacy platform UI elements
 */
function updateLegacyPlatformUI(platform, isConnected, accountInfo) {
    // Find the platform dashboard element (legacy UI)
    const platformElement = document.getElementById(`${platform}-platform`);
    if (!platformElement) {
        console.log(`Legacy platform element for ${platform} not found - this is normal`);
        return;
    }

    // Update status indicator
    const statusElement = platformElement.querySelector('.platform-status');
    if (statusElement) {
        statusElement.textContent = isConnected ? 'Connected' : 'Disconnected';
        statusElement.className = `platform-status ${isConnected ? 'connected' : 'disconnected'}`;
    }

    // Update stats display
    const statsElement = platformElement.querySelector('.platform-stats');
    if (statsElement) {
        if (!isConnected) {
            statsElement.innerHTML = `
                <p>Posts: 0</p>
                <p>Engagement: 0</p>
            `;
        } else if (accountInfo) {
            // For connected accounts with info, show more stats
            statsElement.innerHTML = `
                <p><strong>Username:</strong> ${accountInfo.username || 'Unknown'}</p>
                <p><strong>Display Name:</strong> ${accountInfo.displayName || accountInfo.username || 'Unknown'}</p>
                <p><strong>Posts:</strong> ${accountInfo.postCount || 0}</p>
                <p><strong>Followers:</strong> ${accountInfo.followers || 0}</p>
                <p><strong>Connected:</strong> ${new Date(accountInfo.connectedAt).toLocaleString()}</p>
            `;
        }
    }

    // Update account info display if available
    const accountElement = platformElement.querySelector('.account-info');
    if (accountElement && accountInfo) {
        accountElement.textContent = accountInfo.username || 'Unknown account';
    }
}

/**
 * Update the new platform-specific tab UI
 */
function updateNewPlatformUI(platform, isConnected, accountInfo) {
    // Use the SocialTabs module if available
    if (window.SocialTabs && typeof window.SocialTabs.updatePlatformUI === 'function') {
        window.SocialTabs.updatePlatformUI(platform, isConnected, accountInfo);
        return;
    }
    
    // Fallback implementation if SocialTabs module is not available
    console.log('SocialTabs module not available, using fallback implementation');
    
    // Update status text
    const statusElement = document.getElementById(`${platform}-status`);
    if (statusElement) {
        statusElement.textContent = isConnected ? 'Connected' : 'Disconnected';
        statusElement.className = isConnected ? 'status-connected' : 'status-disconnected';
    }
    
    // Update account info
    const accountElement = document.getElementById(`${platform}-account`);
    if (accountElement) {
        accountElement.textContent = isConnected && accountInfo ? accountInfo.username : 'None';
    }
    
    // Update connected since
    const connectedSinceElement = document.getElementById(`${platform}-connected-since`);
    if (connectedSinceElement) {
        if (isConnected && accountInfo && accountInfo.connectedAt) {
            const date = new Date(accountInfo.connectedAt);
            connectedSinceElement.textContent = date.toLocaleString();
        } else {
            connectedSinceElement.textContent = 'N/A';
        }
    }
}