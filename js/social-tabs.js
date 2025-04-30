/**
 * Social Media Platform Tabs
 * Handles the tab navigation for social media platforms
 */

// Export all functions for module usage
export {
    setupSocialPlatformTabs,
    initializePlatformButtons,
    initializePlatformStatus,
    initializeDirectShareButtons,
    initializeAutoDetectForShare,
    initializeSetupGuideLink,
    connectPlatform,
    disconnectPlatform,
    savePlatformSettings,
    handleDirectShare
};

// Run initialization immediately instead of waiting for DOMContentLoaded
// since this script is loaded after the DOM is already loaded
console.log('Social tabs script loaded');

// Set up social media platform tabs
setupSocialPlatformTabs();

// Initialize platform connection buttons
initializePlatformButtons();

// Initialize platform status from storage
initializePlatformStatus();

// Initialize direct share buttons
initializeDirectShareButtons();

// Initialize auto-detect button for sharing
initializeAutoDetectForShare();

// Initialize setup guide link
initializeSetupGuideLink();

/**
 * Set up social media platform tabs
 */
function setupSocialPlatformTabs() {
    const socialTabButtons = document.querySelectorAll('.social-tab-btn');
    
    if (socialTabButtons.length === 0) {
        console.log('No social platform tab buttons found');
        return;
    }
    
    console.log(`Found ${socialTabButtons.length} social platform tab buttons`);
    
    // Add click event listeners to each tab button
    socialTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the platform from the data attribute
            const platform = this.getAttribute('data-platform') || this.getAttribute('data-social');
            
            if (!platform) {
                console.error('No platform specified for tab button');
                return;
            }
            
            // Remove active class from all buttons
            socialTabButtons.forEach(btn => {
                if (btn) btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all tab content
            const tabContents = document.querySelectorAll('.social-tab-content');
            tabContents.forEach(content => {
                if (content) content.classList.remove('active');
            });
            
            // Show the selected tab content
            const selectedTab = document.getElementById(`${platform}-tab-content`);
            if (selectedTab) {
                selectedTab.classList.add('active');
            } else {
                console.warn(`Tab content for platform ${platform} not found`);
            }
        });
    });
}

/**
 * Initialize platform connection buttons
 */
function initializePlatformButtons() {
    // Platforms to initialize
    const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'telegram', 'whatsapp'];
    
    platforms.forEach(platform => {
        // Connect button
        const connectBtn = document.getElementById(`${platform}-connect-btn`);
        if (connectBtn) {
            connectBtn.addEventListener('click', function() {
                connectPlatform(platform);
            });
        }
        
        // Disconnect button
        const disconnectBtn = document.getElementById(`${platform}-disconnect-btn`);
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', function() {
                disconnectPlatform(platform);
            });
        }
        
        // Save settings button
        const saveSettingsBtn = document.getElementById(`save${capitalizeFirstLetter(platform)}Settings`);
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', function() {
                savePlatformSettings(platform);
            });
        }
    });
}

/**
 * Connect a social media platform
 */
function connectPlatform(platform) {
    console.log(`Connecting ${platform}...`);
    
    // Show loading state
    const connectBtn = document.getElementById(`${platform}-connect-btn`);
    if (connectBtn) {
        connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        connectBtn.disabled = true;
    }
    
    // Wait for SocialModule to be available
    const checkAndConnect = function() {
        if (typeof window.SocialModule !== 'undefined' && window.SocialModule.connectSocialAccount) {
            window.SocialModule.connectSocialAccount(platform);
        } else {
            console.log('SocialModule not available yet, waiting...');
            
            // Try again after a short delay
            setTimeout(function() {
                if (typeof window.SocialModule !== 'undefined' && window.SocialModule.connectSocialAccount) {
                    window.SocialModule.connectSocialAccount(platform);
                } else {
                    // Try one more time with a longer delay
                    setTimeout(function() {
                        if (typeof window.SocialModule !== 'undefined' && window.SocialModule.connectSocialAccount) {
                            window.SocialModule.connectSocialAccount(platform);
                        } else {
                            console.error('SocialModule not available after multiple attempts');
                            showNotification('Error: Social media module not loaded. Please refresh the extension.', 'error');
                            
                            // Reset button
                            if (connectBtn) {
                                connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect Account';
                                connectBtn.disabled = false;
                            }
                        }
                    }, 2000);
                }
            }, 1000);
        }
    };
    
    checkAndConnect();
}

/**
 * Disconnect a social media platform
 */
function disconnectPlatform(platform) {
    console.log(`Disconnecting ${platform}...`);
    
    if (confirm(`Are you sure you want to disconnect your ${capitalizeFirstLetter(platform)} account?`)) {
        // Show loading state
        const disconnectBtn = document.getElementById(`${platform}-disconnect-btn`);
        if (disconnectBtn) {
            disconnectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Disconnecting...';
            disconnectBtn.disabled = true;
        }
        
        // Wait for SocialModule to be available
        const checkAndDisconnect = function() {
            if (typeof window.SocialModule !== 'undefined' && window.SocialModule.disconnectSocialAccount) {
                window.SocialModule.disconnectSocialAccount(platform);
            } else {
                console.log('SocialModule not available yet, waiting...');
                
                // Try again after a short delay
                setTimeout(function() {
                    if (typeof window.SocialModule !== 'undefined' && window.SocialModule.disconnectSocialAccount) {
                        window.SocialModule.disconnectSocialAccount(platform);
                    } else {
                        // Try one more time with a longer delay
                        setTimeout(function() {
                            if (typeof window.SocialModule !== 'undefined' && window.SocialModule.disconnectSocialAccount) {
                                window.SocialModule.disconnectSocialAccount(platform);
                            } else {
                                console.error('SocialModule not available after multiple attempts');
                                showNotification('Error: Social media module not loaded. Please refresh the extension.', 'error');
                                
                                // Reset button
                                if (disconnectBtn) {
                                    disconnectBtn.innerHTML = '<i class="fas fa-unlink"></i> Disconnect';
                                    disconnectBtn.disabled = false;
                                }
                            }
                        }, 2000);
                    }
                }, 1000);
            }
        };
        
        checkAndDisconnect();
    }
}

/**
 * Save platform-specific settings
 */
function savePlatformSettings(platform) {
    console.log(`Saving ${platform} settings...`);
    
    // Get settings values
    const autoPost = document.getElementById(`${platform}AutoPost`)?.checked || false;
    const customMessage = document.getElementById(`${platform}CustomMessage`)?.value || '';
    const includeThumbnail = document.getElementById(`${platform}IncludeThumbnail`)?.checked || false;
    
    // Create settings object
    const settings = {
        autoPost,
        customMessage,
        includeThumbnail
    };
    
    // Save to storage
    chrome.storage.local.get(['socialSettings'], function(result) {
        const socialSettings = result.socialSettings || {};
        
        socialSettings[platform] = settings;
        
        chrome.storage.local.set({ socialSettings }, function() {
            showNotification(`${capitalizeFirstLetter(platform)} settings saved!`, 'success');
        });
    });
}

/**
 * Update platform UI based on connection status
 */
function updatePlatformUI(platform, isConnected, accountInfo = null) {
    console.log(`Updating ${platform} UI, connected: ${isConnected}`);
    
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
    
    // Toggle connect/disconnect buttons
    const connectBtn = document.getElementById(`${platform}-connect-btn`);
    const disconnectBtn = document.getElementById(`${platform}-disconnect-btn`);
    
    if (connectBtn) {
        connectBtn.style.display = isConnected ? 'none' : 'inline-block';
        connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect Account';
        connectBtn.disabled = false;
    }
    
    if (disconnectBtn) {
        disconnectBtn.style.display = isConnected ? 'inline-block' : 'none';
        disconnectBtn.innerHTML = '<i class="fas fa-unlink"></i> Disconnect';
        disconnectBtn.disabled = false;
    }
    
    // Show/hide settings and analytics sections
    const settingsSection = document.getElementById(`${platform}-settings`);
    const analyticsSection = document.getElementById(`${platform}-analytics`);
    
    if (settingsSection) {
        settingsSection.style.display = isConnected ? 'block' : 'none';
    }
    
    if (analyticsSection) {
        analyticsSection.style.display = isConnected ? 'block' : 'none';
    }
    
    // Update analytics metrics if connected
    if (isConnected && accountInfo) {
        updatePlatformMetrics(platform, accountInfo);
    }
}

/**
 * Update platform metrics in the UI
 */
function updatePlatformMetrics(platform, accountInfo) {
    // Posts count
    const postsElement = document.getElementById(`${platform}-posts-count`);
    if (postsElement) {
        postsElement.textContent = accountInfo.postCount || '0';
    }
    
    // Engagement
    const engagementElement = document.getElementById(`${platform}-engagement`);
    if (engagementElement) {
        engagementElement.textContent = accountInfo.engagement || '0';
    }
    
    // Clicks
    const clicksElement = document.getElementById(`${platform}-clicks`);
    if (clicksElement) {
        clicksElement.textContent = accountInfo.clicks || '0';
    }
    
    // Followers (for platforms that have this)
    const followersElement = document.getElementById(`${platform}-followers`);
    if (followersElement) {
        followersElement.textContent = accountInfo.followers || '0';
    }
}

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Initialize platform status from storage
 */
function initializePlatformStatus() {
    console.log('Initializing platform status from storage');
    
    // Get connected accounts from storage
    chrome.storage.local.get(['connectedAccounts'], function(result) {
        const accounts = result.connectedAccounts || {};
        
        // Update UI for each platform
        const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'telegram', 'whatsapp'];
        
        platforms.forEach(platform => {
            const isConnected = accounts[platform] && accounts[platform].connected;
            const accountInfo = accounts[platform];
            
            // Update UI
            updatePlatformUI(platform, isConnected, accountInfo);
        });
    });
}

/**
 * Initialize direct share buttons
 */
function initializeDirectShareButtons() {
    const platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram'];
    
    platforms.forEach(platform => {
        const shareBtn = document.getElementById(`share${capitalizeFirstLetter(platform)}`);
        if (shareBtn) {
            shareBtn.addEventListener('click', function() {
                handleDirectShare(platform);
            });
        }
    });
}

/**
 * Initialize auto-detect button for sharing
 */
function initializeAutoDetectForShare() {
    const detectBtn = document.getElementById('detectCurrentVideoForShare');
    if (detectBtn) {
        detectBtn.addEventListener('click', function() {
            // Get the current tab URL
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs && tabs[0] && tabs[0].url) {
                    const url = tabs[0].url;
                    
                    // Check if it's a YouTube video URL
                    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
                        // Extract video ID
                        let videoId = '';
                        
                        if (url.includes('youtube.com/watch')) {
                            const urlParams = new URLSearchParams(new URL(url).search);
                            videoId = urlParams.get('v');
                        } else if (url.includes('youtu.be/')) {
                            videoId = url.split('youtu.be/')[1].split('?')[0];
                        }
                        
                        if (videoId) {
                            // Set the video ID in the input field
                            const videoIdInput = document.getElementById('shareVideoId');
                            if (videoIdInput) {
                                videoIdInput.value = videoId;
                                showNotification('Video ID detected!', 'success');
                            }
                        } else {
                            showNotification('Could not detect video ID from URL', 'error');
                        }
                    } else {
                        showNotification('Current tab is not a YouTube video', 'warning');
                    }
                } else {
                    showNotification('Could not detect current tab', 'error');
                }
            });
        });
    }
}

/**
 * Handle direct share to a platform
 */
function handleDirectShare(platform) {
    const videoIdInput = document.getElementById('shareVideoId');
    
    if (!videoIdInput || !videoIdInput.value.trim()) {
        showNotification('Please enter a video ID or URL first', 'warning');
        return;
    }
    
    const videoId = videoIdInput.value.trim();
    
    // Check if SocialModule is available
    if (typeof window.SocialModule !== 'undefined' && window.SocialModule.directShareToSocial) {
        window.SocialModule.directShareToSocial(platform, videoId);
    } else {
        console.error('SocialModule not available');
        showNotification('Error: Social media module not loaded. Please refresh the extension.', 'error');
        
        // Try to check again after a short delay
        setTimeout(function() {
            if (typeof window.SocialModule !== 'undefined' && window.SocialModule.directShareToSocial) {
                console.log('SocialModule now available, proceeding with share');
                window.SocialModule.directShareToSocial(platform, videoId);
            }
        }, 2000);
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Avoid circular reference by not calling window.showNotification
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

/**
 * Initialize setup guide link
 */
function initializeSetupGuideLink() {
    const setupGuideLink = document.getElementById('viewSetupGuide');
    if (setupGuideLink) {
        setupGuideLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Open the setup guide in a new tab
            chrome.tabs.create({
                url: chrome.runtime.getURL('docs/social-media-setup.md')
            });
        });
    }
}

/**
 * Update platform status in UI
 */
function updatePlatformStatus(platform, isConnected, accountInfo = null) {
    console.log(`Updating platform status for ${platform}: ${isConnected}`);
    
    // Update UI elements
    updatePlatformUI(platform, isConnected, accountInfo);
}

// Export functions for use in other modules
window.SocialTabs = {
    updatePlatformUI,
    connectPlatform,
    disconnectPlatform,
    savePlatformSettings,
    initializePlatformStatus,
    handleDirectShare,
    initializeDirectShareButtons,
    initializeSetupGuideLink,
    updatePlatformStatus
};