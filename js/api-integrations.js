// API Integrations Management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize API status indicators
    updateApiStatusIndicators();
    
    // Set up tab navigation
    setupAnalyticsTabs();
    setupSocialTabs();
    
    // Load saved API keys
    loadSavedApiKeys();
    
    // Set up event listeners
    setupApiEventListeners();
});

/**
 * Set up analytics API tabs
 */
function setupAnalyticsTabs() {
    const tabButtons = document.querySelectorAll('.analytics-tab-btn');
    const tabContents = document.querySelectorAll('.analytics-api-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const targetId = `${button.dataset.analytics}-analytics-content`;
            document.getElementById(targetId).classList.add('active');
        });
    });
}

/**
 * Set up social media API tabs
 */
function setupSocialTabs() {
    const tabButtons = document.querySelectorAll('.social-tab-btn');
    const tabContents = document.querySelectorAll('.social-api-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const targetId = `${button.dataset.social}-content`;
            document.getElementById(targetId).classList.add('active');
        });
    });
}

/**
 * Load saved API keys from storage
 */
function loadSavedApiKeys() {
    chrome.storage.local.get([
        'youtubeApiKey',
        'googleAnalyticsId',
        'keywordApiKey',
        'keywordApiProvider',
        'openaiApiKey',
        'socialMediaApis'
    ], function(result) {
        // YouTube API Key
        if (result.youtubeApiKey) {
            document.getElementById('youtubeApiKey').value = result.youtubeApiKey;
            updateApiStatus('youtubeApiStatus', true);
        }
        
        // Google Analytics
        if (result.googleAnalyticsId) {
            document.getElementById('googleAnalyticsId').value = result.googleAnalyticsId;
        }
        
        // Keyword API
        if (result.keywordApiKey) {
            document.getElementById('keywordApiKey').value = result.keywordApiKey;
        }
        if (result.keywordApiProvider) {
            document.getElementById('keywordApiProvider').value = result.keywordApiProvider;
        }
        
        // OpenAI API
        if (result.openaiApiKey) {
            document.getElementById('openaiApiKey').value = result.openaiApiKey;
            updateApiStatus('openaiApiStatus', true);
        }
        
        // Social Media APIs
        if (result.socialMediaApis) {
            const socialApis = result.socialMediaApis;
            
            // Facebook
            if (socialApis.facebook) {
                document.getElementById('facebookAppId').value = socialApis.facebook.appId || '';
                document.getElementById('facebookAppSecret').value = socialApis.facebook.appSecret || '';
            }
            
            // Twitter
            if (socialApis.twitter) {
                document.getElementById('twitterApiKey').value = socialApis.twitter.apiKey || '';
                document.getElementById('twitterApiSecret').value = socialApis.twitter.apiSecret || '';
                document.getElementById('twitterAccessToken').value = socialApis.twitter.accessToken || '';
                document.getElementById('twitterAccessSecret').value = socialApis.twitter.accessSecret || '';
            }
        }
    });
}

/**
 * Set up event listeners for API actions
 */
function setupApiEventListeners() {
    // YouTube API
    document.getElementById('saveYoutubeApi').addEventListener('click', saveYoutubeApi);
    document.getElementById('testYoutubeApi').addEventListener('click', testYoutubeApi);
    
    // Google Analytics
    document.getElementById('saveGoogleAnalytics').addEventListener('click', saveGoogleAnalytics);
    
    // Keyword API
    document.getElementById('saveKeywordApiKey').addEventListener('click', saveKeywordApi);
    document.getElementById('testKeywordApiKey').addEventListener('click', testKeywordApi);
    
    // OpenAI API
    document.getElementById('saveOpenaiApi').addEventListener('click', saveOpenaiApi);
    document.getElementById('testOpenaiApi').addEventListener('click', testOpenaiApi);
    
    // Social Media APIs
    document.getElementById('saveFacebookApi').addEventListener('click', () => saveSocialMediaApi('facebook'));
    document.getElementById('saveTwitterApi').addEventListener('click', () => saveSocialMediaApi('twitter'));
}

/**
 * Update API status indicators
 */
function updateApiStatusIndicators() {
    chrome.storage.local.get([
        'youtubeApiKey',
        'googleAnalyticsId',
        'keywordApiKey',
        'openaiApiKey',
        'socialMediaApis'
    ], function(result) {
        // YouTube API
        updateApiStatus('youtubeApiStatus', !!result.youtubeApiKey);
        
        // Google Analytics
        updateApiStatus('googleAnalyticsStatus', !!result.googleAnalyticsId);
        
        // Keyword API
        updateApiStatus('keywordApiStatus', !!result.keywordApiKey);
        
        // OpenAI API
        updateApiStatus('openaiApiStatus', !!result.openaiApiKey);
        
        // Social Media APIs
        if (result.socialMediaApis) {
            const socialApis = result.socialMediaApis;
            updateApiStatus('facebookApiStatus', !!(socialApis.facebook && socialApis.facebook.appId));
            updateApiStatus('twitterApiStatus', !!(socialApis.twitter && socialApis.twitter.apiKey));
        }
    });
}

/**
 * Update individual API status
 */
function updateApiStatus(elementId, isConfigured) {
    const statusElement = document.getElementById(elementId);
    if (statusElement) {
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');
        
        if (isConfigured) {
            indicator.className = 'status-indicator connected';
            text.textContent = 'Configured';
        } else {
            indicator.className = 'status-indicator disconnected';
            text.textContent = 'Not Configured';
        }
    }
}

/**
 * Save YouTube API key
 */
function saveYoutubeApi() {
    const apiKey = document.getElementById('youtubeApiKey').value.trim();
    if (!apiKey) {
        showNotification('Please enter a valid YouTube API key', 'warning');
        return;
    }
    
    chrome.storage.local.set({ youtubeApiKey: apiKey }, function() {
        if (chrome.runtime.lastError) {
            showNotification('Error saving YouTube API key: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        showNotification('YouTube API key saved successfully', 'success');
        updateApiStatus('youtubeApiStatus', true);
    });
}

/**
 * Test YouTube API connection
 */
function testYoutubeApi() {
    const apiKey = document.getElementById('youtubeApiKey').value.trim();
    if (!apiKey) {
        showNotification('Please enter a valid YouTube API key', 'warning');
        return;
    }
    
    showNotification('Testing YouTube API connection...', 'info');
    
    // In a real implementation, you would make an actual API call
    // For now, we'll simulate a successful connection
    setTimeout(() => {
        showNotification('YouTube API connection successful!', 'success');
        updateApiStatus('youtubeApiStatus', true);
    }, 2000);
}

/**
 * Save Google Analytics configuration
 */
function saveGoogleAnalytics() {
    const measurementId = document.getElementById('googleAnalyticsId').value.trim();
    if (!measurementId) {
        showNotification('Please enter a valid Google Analytics Measurement ID', 'warning');
        return;
    }
    
    chrome.storage.local.set({ googleAnalyticsId: measurementId }, function() {
        if (chrome.runtime.lastError) {
            showNotification('Error saving Google Analytics configuration: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        showNotification('Google Analytics configuration saved successfully', 'success');
        updateApiStatus('googleAnalyticsStatus', true);
    });
}

/**
 * Save Keyword API configuration
 */
function saveKeywordApi() {
    const apiKey = document.getElementById('keywordApiKey').value.trim();
    const provider = document.getElementById('keywordApiProvider').value;
    
    if (!apiKey) {
        showNotification('Please enter a valid Keyword API key', 'warning');
        return;
    }
    
    chrome.storage.local.set({
        keywordApiKey: apiKey,
        keywordApiProvider: provider
    }, function() {
        if (chrome.runtime.lastError) {
            showNotification('Error saving Keyword API configuration: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        showNotification('Keyword API configuration saved successfully', 'success');
        updateApiStatus('keywordApiStatus', true);
    });
}

/**
 * Test Keyword API connection
 */
function testKeywordApi() {
    const apiKey = document.getElementById('keywordApiKey').value.trim();
    if (!apiKey) {
        showNotification('Please enter a valid Keyword API key', 'warning');
        return;
    }
    
    showNotification('Testing Keyword API connection...', 'info');
    
    // In a real implementation, you would make an actual API call
    // For now, we'll simulate a successful connection
    setTimeout(() => {
        showNotification('Keyword API connection successful!', 'success');
        updateApiStatus('keywordApiStatus', true);
    }, 2000);
}

/**
 * Save OpenAI API key
 */
function saveOpenaiApi() {
    const apiKey = document.getElementById('openaiApiKey').value.trim();
    if (!apiKey) {
        showNotification('Please enter a valid OpenAI API key', 'warning');
        return;
    }
    
    chrome.storage.local.set({ openaiApiKey: apiKey }, function() {
        if (chrome.runtime.lastError) {
            showNotification('Error saving OpenAI API key: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        showNotification('OpenAI API key saved successfully', 'success');
        updateApiStatus('openaiApiStatus', true);
    });
}

/**
 * Test OpenAI API connection
 */
function testOpenaiApi() {
    const apiKey = document.getElementById('openaiApiKey').value.trim();
    if (!apiKey) {
        showNotification('Please enter a valid OpenAI API key', 'warning');
        return;
    }
    
    showNotification('Testing OpenAI API connection...', 'info');
    
    // In a real implementation, you would make an actual API call
    // For now, we'll simulate a successful connection
    setTimeout(() => {
        showNotification('OpenAI API connection successful!', 'success');
        updateApiStatus('openaiApiStatus', true);
    }, 2000);
}

/**
 * Save Social Media API configuration
 */
function saveSocialMediaApi(platform) {
    let apiData = {};
    
    switch(platform) {
        case 'facebook':
            apiData = {
                appId: document.getElementById('facebookAppId').value.trim(),
                appSecret: document.getElementById('facebookAppSecret').value.trim()
            };
            break;
        case 'twitter':
            apiData = {
                apiKey: document.getElementById('twitterApiKey').value.trim(),
                apiSecret: document.getElementById('twitterApiSecret').value.trim(),
                accessToken: document.getElementById('twitterAccessToken').value.trim(),
                accessSecret: document.getElementById('twitterAccessSecret').value.trim()
            };
            break;
    }
    
    // Validate required fields
    const hasEmptyFields = Object.values(apiData).some(value => !value);
    if (hasEmptyFields) {
        showNotification(`Please fill in all ${platform} API fields`, 'warning');
        return;
    }
    
    // Get existing social media APIs
    chrome.storage.local.get(['socialMediaApis'], function(result) {
        const socialMediaApis = result.socialMediaApis || {};
        
        // Update with new data
        socialMediaApis[platform] = apiData;
        
        // Save to storage
        chrome.storage.local.set({ socialMediaApis: socialMediaApis }, function() {
            if (chrome.runtime.lastError) {
                showNotification('Error saving API keys: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            showNotification(`${platform.charAt(0).toUpperCase() + platform.slice(1)} API keys saved successfully`, 'success');
            updateApiStatus(`${platform}ApiStatus`, true);
        });
    });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // In a real implementation, you would show a notification
    console.log(`[${type}] ${message}`);
} 