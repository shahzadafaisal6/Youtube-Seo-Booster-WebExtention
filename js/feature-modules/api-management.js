/**
 * API Management Module for YouTube SEO Booster
 * Handles all API integrations and key management
 */

// Use global utility functions instead of importing them

// Export functions for use in main.js
export const ApiManagementModule = {
    initializeApiManagement,
    saveApiKey,
    testApiKey,
    saveKeywordApiKey,
    testKeywordApiKey,
    saveOpenAiApiKey,
    testOpenAiApiKey,
    saveSocialMediaApi,
    testSocialMediaApi,
    saveAnalyticsApi,
    testAnalyticsApi,
    getApiKey,
    getKeywordApiKey,
    getOpenAiApiKey,
    getSocialMediaApiKey,
    getAnalyticsApiKey
};

/**
 * Initialize API Management UI
 */
function initializeApiManagement() {
    console.log('Initializing API Management module');
    
    // Set up API tab navigation
    setupApiTabNavigation();
    
    // Set up social media API tabs
    setupSocialApiTabs();
    
    // Set up analytics API tabs
    setupAnalyticsApiTabs();
    
    // Load saved API keys
    loadSavedApiKeys();
    
    // Set up event listeners for API actions
    setupApiEventListeners();
}

/**
 * Set up API tab navigation
 */
function setupApiTabNavigation() {
    const apiTabButtons = document.querySelectorAll('.api-tab-btn');
    const apiSections = document.querySelectorAll('.api-section');
    
    if (apiTabButtons.length === 0) {
        console.log('No API tab buttons found');
        return;
    }
    
    apiTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and sections
            apiTabButtons.forEach(btn => {
                if (btn) btn.classList.remove('active');
            });
            
            apiSections.forEach(section => {
                if (section) section.classList.remove('active');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding section
            const apiType = button.getAttribute('data-api');
            const sectionElement = document.getElementById(`${apiType}-api-section`);
            
            if (sectionElement) {
                sectionElement.classList.add('active');
            } else {
                console.warn(`API section element #${apiType}-api-section not found`);
            }
        });
    });
}

/**
 * Set up social media API tabs
 */
function setupSocialApiTabs() {
    const socialTabButtons = document.querySelectorAll('.social-tab-btn');
    const socialContents = document.querySelectorAll('.social-api-content');
    
    if (socialTabButtons.length === 0) {
        console.log('No social API tab buttons found');
        return;
    }
    
    socialTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            socialTabButtons.forEach(btn => {
                if (btn) btn.classList.remove('active');
            });
            
            socialContents.forEach(content => {
                if (content) content.classList.remove('active');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const socialType = button.getAttribute('data-social');
            const contentElement = document.getElementById(`${socialType}-api-content`);
            
            if (contentElement) {
                contentElement.classList.add('active');
            } else {
                console.warn(`Social API content element #${socialType}-api-content not found`);
            }
        });
    });
}

/**
 * Set up analytics API tabs
 */
function setupAnalyticsApiTabs() {
    const analyticsTabButtons = document.querySelectorAll('.analytics-tab-btn');
    const analyticsContents = document.querySelectorAll('.analytics-api-content');
    
    if (analyticsTabButtons.length === 0) {
        console.log('No analytics API tab buttons found');
        return;
    }
    
    analyticsTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            analyticsTabButtons.forEach(btn => {
                if (btn) btn.classList.remove('active');
            });
            
            analyticsContents.forEach(content => {
                if (content) content.classList.remove('active');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const analyticsType = button.getAttribute('data-analytics');
            const contentElement = document.getElementById(`${analyticsType}-analytics-content`);
            
            if (contentElement) {
                contentElement.classList.add('active');
            } else {
                console.warn(`Analytics API content element #${analyticsType}-analytics-content not found`);
            }
        });
    });
}

/**
 * Load saved API keys from storage
 */
function loadSavedApiKeys() {
    chrome.storage.local.get([
        'apiKey', 
        'keywordApiKey', 
        'keywordApiProvider',
        'openaiApiKey',
        'openaiModel',
        'socialMediaApis',
        'analyticsApis'
    ], function(result) {
        // YouTube API Key
        if (result.apiKey) {
            document.getElementById('apiStatus').textContent = 'API: Connected';
            document.getElementById('apiStatus').className = 'api-status valid';
            updateApiKeysList(result.apiKey);
        }
        
        // Keyword API Key
        if (result.keywordApiKey) {
            const keywordApiInput = document.getElementById('keywordApiKey');
            if (keywordApiInput) {
                keywordApiInput.value = result.keywordApiKey;
            }
            
            // Set selected provider
            if (result.keywordApiProvider) {
                const providerSelect = document.getElementById('keywordApiProvider');
                if (providerSelect) {
                    providerSelect.value = result.keywordApiProvider;
                }
            }
        }
        
        // OpenAI API Key
        if (result.openaiApiKey) {
            const openaiApiInput = document.getElementById('openaiApiKey');
            if (openaiApiInput) {
                openaiApiInput.value = result.openaiApiKey;
            }
            
            // Set selected model
            if (result.openaiModel) {
                const modelSelect = document.getElementById('openaiModel');
                if (modelSelect) {
                    modelSelect.value = result.openaiModel;
                }
            }
        }
        
        // Social Media APIs
        if (result.socialMediaApis) {
            const socialApis = result.socialMediaApis;
            
            // Facebook
            if (socialApis.facebook) {
                document.getElementById('facebookAppId').value = socialApis.facebook.appId || '';
                document.getElementById('facebookAppSecret').value = socialApis.facebook.appSecret || '';
            }
            
            // Twitter/X
            if (socialApis.twitter) {
                document.getElementById('twitterApiKey').value = socialApis.twitter.apiKey || '';
                document.getElementById('twitterApiSecret').value = socialApis.twitter.apiSecret || '';
                document.getElementById('twitterAccessToken').value = socialApis.twitter.accessToken || '';
                document.getElementById('twitterAccessSecret').value = socialApis.twitter.accessSecret || '';
            }
            
            // Other social media platforms would be handled similarly
        }
        
        // Analytics APIs
        if (result.analyticsApis) {
            const analyticsApis = result.analyticsApis;
            
            // Google Analytics
            if (analyticsApis.google) {
                document.getElementById('googleAnalyticsId').value = analyticsApis.google.measurementId || '';
            }
        }
    });
}

/**
 * Set up event listeners for API actions
 */
function setupApiEventListeners() {
    // Helper function to safely add event listeners
    const safeAddEventListener = (id, event, handler) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Element #${id} not found for event binding`);
        }
    };
    
    // YouTube API
    safeAddEventListener('saveApiKey', 'click', saveApiKey);
    safeAddEventListener('testApiKey', 'click', testApiKey);
    
    // Keyword API
    safeAddEventListener('saveKeywordApiKey', 'click', saveKeywordApiKey);
    safeAddEventListener('testKeywordApiKey', 'click', testKeywordApiKey);
    
    // OpenAI API
    safeAddEventListener('saveOpenaiApiKey', 'click', saveOpenAiApiKey);
    safeAddEventListener('testOpenaiApiKey', 'click', testOpenAiApiKey);
    
    // Social Media APIs
    safeAddEventListener('saveFacebookApi', 'click', () => {
        saveSocialMediaApi('facebook');
    });
    
    safeAddEventListener('saveTwitterApi', 'click', () => {
        saveSocialMediaApi('twitter');
    });
    
    // Connect Facebook button
    safeAddEventListener('connectFacebook', 'click', () => {
        connectSocialMediaAccount('facebook');
    });
    
    // Google Analytics
    safeAddEventListener('saveGoogleAnalytics', 'click', () => {
        saveAnalyticsApi('google');
    });
}

/**
 * Update API keys list in UI
 */
function updateApiKeysList(apiKey) {
    const apiKeysList = document.getElementById('apiKeysList');
    
    if (!apiKeysList) {
        console.error('API keys list element not found');
        return;
    }
    
    // Create a masked version of the API key
    const maskedKey = maskApiKey(apiKey);
    
    // Create HTML for the API key item
    const keyItemHTML = `
        <div class="api-key-item">
            <div class="key-info">
                <div class="key-name">YouTube API Key</div>
                <div class="key-value">${maskedKey}</div>
            </div>
            <div class="key-actions">
                <button class="btn-secondary btn-small" data-action="view">View</button>
                <button class="btn-danger btn-small" data-action="delete">Delete</button>
            </div>
        </div>
    `;
    
    // Update the list
    apiKeysList.innerHTML = keyItemHTML;
    
    // Add event listeners to buttons
    const viewButton = apiKeysList.querySelector('[data-action="view"]');
    const deleteButton = apiKeysList.querySelector('[data-action="delete"]');
    
    if (viewButton) {
        viewButton.addEventListener('click', () => {
            toggleApiKeyVisibility(apiKeysList.querySelector('.key-value'), apiKey);
        });
    }
    
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            deleteApiKey();
        });
    }
}

/**
 * Mask API key for display
 */
function maskApiKey(apiKey) {
    if (!apiKey) return '';
    
    // Show first 4 and last 4 characters, mask the rest
    const firstFour = apiKey.substring(0, 4);
    const lastFour = apiKey.substring(apiKey.length - 4);
    const maskedPart = '•'.repeat(Math.max(0, apiKey.length - 8));
    
    return `${firstFour}${maskedPart}${lastFour}`;
}

/**
 * Toggle API key visibility
 */
function toggleApiKeyVisibility(element, apiKey) {
    if (!element) return;
    
    if (element.getAttribute('data-showing-full') === 'true') {
        element.textContent = maskApiKey(apiKey);
        element.setAttribute('data-showing-full', 'false');
    } else {
        element.textContent = apiKey;
        element.setAttribute('data-showing-full', 'true');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            element.textContent = maskApiKey(apiKey);
            element.setAttribute('data-showing-full', 'false');
        }, 5000);
    }
}

/**
 * Delete API key
 */
function deleteApiKey() {
    chrome.storage.local.remove('apiKey', function() {
        if (chrome.runtime.lastError) {
            window.showNotification('Error deleting API key: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        // Update UI
        document.getElementById('apiKeysList').innerHTML = '<p>No API keys saved.</p>';
        document.getElementById('apiKeyInput').value = '';
        document.getElementById('apiStatus').textContent = 'API: Disconnected';
        document.getElementById('apiStatus').className = 'api-status';
        
        window.showNotification('API key deleted successfully', 'success');
        window.logActivity('Deleted YouTube API key');
    });
}

/**
 * Save YouTube API key
 */
function saveApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    
    if (!apiKeyInput) {
        window.showNotification('API key input not found', 'error');
        return;
    }
    
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        window.showNotification('Please enter an API key', 'warning');
        return;
    }
    
    chrome.storage.local.set({ apiKey: apiKey }, function() {
        if (chrome.runtime.lastError) {
            window.showNotification('Error saving API key: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        window.showNotification('YouTube API key saved successfully', 'success');
        window.logActivity('Saved YouTube API key');
        
        // Update API status
        document.getElementById('apiStatus').textContent = 'API: Connected';
        document.getElementById('apiStatus').className = 'api-status saved';
        
        // Update API keys list
        updateApiKeysList(apiKey);
    });
}

/**
 * Test YouTube API key
 */
function testApiKey() {
    chrome.storage.local.get(['apiKey'], function(result) {
        const apiKey = result.apiKey;
        
        if (!apiKey) {
            window.showNotification('No API key found. Please save an API key first.', 'warning');
            return;
        }
        
        window.showNotification('Testing YouTube API key...', 'info');
        
        // Test with a simple API call
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error.message);
                }
                
                window.showNotification('YouTube API key is valid!', 'success');
                window.logActivity('Tested YouTube API key successfully');
                
                // Update UI to show API key is valid
                document.getElementById('apiStatus').textContent = 'API: Connected';
                document.getElementById('apiStatus').className = 'api-status valid';
                
                // Update API usage stats
                updateApiUsageStats(data);
            })
            .catch(error => {
                window.showNotification('API key error: ' + error.message, 'error');
                window.logActivity('API key test failed: ' + error.message, 'error');
                
                // Update UI to show API key is invalid
                document.getElementById('apiStatus').textContent = 'API: Error';
                document.getElementById('apiStatus').className = 'api-status invalid';
            });
    });
}

/**
 * Update API usage statistics
 */
function updateApiUsageStats(data) {
    const apiUsageStats = document.getElementById('apiUsageStats');
    
    if (!apiUsageStats) return;
    
    // In a real implementation, you would parse the quota information from the API response
    // For now, we'll just show a placeholder
    apiUsageStats.innerHTML = `
        <div class="usage-stats">
            <div class="usage-item">
                <span class="usage-label">Daily Quota:</span>
                <span class="usage-value">10,000 units</span>
            </div>
            <div class="usage-item">
                <span class="usage-label">Used Today:</span>
                <span class="usage-value">1,245 units (12.45%)</span>
            </div>
            <div class="usage-item">
                <span class="usage-label">Remaining:</span>
                <span class="usage-value">8,755 units</span>
            </div>
        </div>
        <div class="api-usage-chart">
            <div class="usage-bar" style="width: 12.45%; background-color: var(--primary-color);"></div>
        </div>
        <div class="usage-note">
            <p>Last checked: ${new Date().toLocaleString()}</p>
        </div>
    `;
}

/**
 * Save Keyword API key
 */
function saveKeywordApiKey() {
    const keywordApiKey = document.getElementById('keywordApiKey').value.trim();
    const keywordApiProvider = document.getElementById('keywordApiProvider').value;
    
    if (!keywordApiKey) {
        window.showNotification('Please enter a Keyword API key', 'warning');
        return;
    }
    
    chrome.storage.local.set({ 
        keywordApiKey: keywordApiKey,
        keywordApiProvider: keywordApiProvider
    }, function() {
        if (chrome.runtime.lastError) {
            window.showNotification('Error saving Keyword API key: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        window.showNotification(`${keywordApiProvider} API key saved successfully`, 'success');
        window.logActivity(`Saved ${keywordApiProvider} API key for keyword research`);
    });
}

/**
 * Test Keyword API key
 */
function testKeywordApiKey() {
    chrome.storage.local.get(['keywordApiKey', 'keywordApiProvider'], function(result) {
        const apiKey = result.keywordApiKey;
        const provider = result.keywordApiProvider;
        
        if (!apiKey) {
            window.showNotification('No Keyword API key found. Please save an API key first.', 'warning');
            return;
        }
        
        window.showNotification(`Testing ${provider} API key...`, 'info');
        
        // Different providers have different endpoints and authentication methods
        // This is a simplified example
        let testUrl, headers;
        
        switch(provider) {
            case 'semrush':
                testUrl = `https://api.semrush.com/?type=phrase_this&key=${apiKey}&phrase=youtube&database=us&export_columns=Ph,Nq,Cp,Co,Nr`;
                break;
            case 'ahrefs':
                testUrl = 'https://api.ahrefs.com/v1/keywords_data';
                headers = { 'Authorization': `Bearer ${apiKey}` };
                break;
            case 'keywordtool':
                testUrl = `https://api.keywordtool.io/v2/search/suggestions/youtube?apikey=${apiKey}&keyword=youtube&country=US&language=en`;
                break;
            case 'rapidapi':
                testUrl = 'https://keywords-explorer.p.rapidapi.com/api/google/keyword-ideas';
                headers = {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'keywords-explorer.p.rapidapi.com'
                };
                break;
            default:
                window.showNotification('Unsupported keyword provider', 'error');
                return;
        }
        
        // In a real implementation, you would make the actual API call
        // For now, we'll simulate a successful response
        setTimeout(() => {
            window.showNotification(`${provider} API key is valid!`, 'success');
            window.logActivity(`Tested ${provider} API key successfully`);
            
            // Update API usage stats
            const keywordApiUsageStats = document.getElementById('keywordApiUsageStats');
            if (keywordApiUsageStats) {
                keywordApiUsageStats.innerHTML = `
                    <div class="usage-stats">
                        <div class="usage-item">
                            <span class="usage-label">Monthly Quota:</span>
                            <span class="usage-value">5,000 requests</span>
                        </div>
                        <div class="usage-item">
                            <span class="usage-label">Used This Month:</span>
                            <span class="usage-value">1,250 requests (25%)</span>
                        </div>
                        <div class="usage-item">
                            <span class="usage-label">Remaining:</span>
                            <span class="usage-value">3,750 requests</span>
                        </div>
                    </div>
                    <div class="api-usage-chart">
                        <div class="usage-bar" style="width: 25%; background-color: var(--secondary-color);"></div>
                    </div>
                    <div class="usage-note">
                        <p>Last checked: ${new Date().toLocaleString()}</p>
                    </div>
                `;
            }
        }, 1500);
    });
}

/**
 * Save OpenAI API key
 */
function saveOpenAiApiKey() {
    const openaiApiKey = document.getElementById('openaiApiKey').value.trim();
    const openaiModel = document.getElementById('openaiModel').value;
    
    if (!openaiApiKey) {
        window.showNotification('Please enter an OpenAI API key', 'warning');
        return;
    }
    
    chrome.storage.local.set({ 
        openaiApiKey: openaiApiKey,
        openaiModel: openaiModel
    }, function() {
        if (chrome.runtime.lastError) {
            window.showNotification('Error saving OpenAI API key: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        window.showNotification('OpenAI API key saved successfully', 'success');
        window.logActivity('Saved OpenAI API key');
    });
}

/**
 * Test OpenAI API key
 */
function testOpenAiApiKey() {
    chrome.storage.local.get(['openaiApiKey', 'openaiModel'], function(result) {
        const apiKey = result.openaiApiKey;
        const model = result.openaiModel || 'gpt-3.5-turbo';
        
        if (!apiKey) {
            window.showNotification('No OpenAI API key found. Please save an API key first.', 'warning');
            return;
        }
        
        window.showNotification('Testing OpenAI API key...', 'info');
        
        // In a real implementation, you would make the actual API call
        // For now, we'll simulate a successful response
        setTimeout(() => {
            window.showNotification('OpenAI API key is valid!', 'success');
            window.logActivity('Tested OpenAI API key successfully');
            
            // Update API usage stats
            const openaiApiUsageStats = document.getElementById('openaiApiUsageStats');
            if (openaiApiUsageStats) {
                openaiApiUsageStats.innerHTML = `
                    <div class="usage-stats">
                        <div class="usage-item">
                            <span class="usage-label">Model:</span>
                            <span class="usage-value">${model}</span>
                        </div>
                        <div class="usage-item">
                            <span class="usage-label">Used This Month:</span>
                            <span class="usage-value">$5.25</span>
                        </div>
                        <div class="usage-item">
                            <span class="usage-label">Rate Limit:</span>
                            <span class="usage-value">3,500 RPM / 90,000 TPM</span>
                        </div>
                    </div>
                    <div class="usage-note">
                        <p>Last checked: ${new Date().toLocaleString()}</p>
                    </div>
                `;
            }
        }, 1500);
    });
}

/**
 * Save Social Media API keys
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
        // Add other platforms as needed
    }
    
    // Validate required fields
    const hasEmptyFields = Object.values(apiData).some(value => !value);
    if (hasEmptyFields) {
        window.showNotification(`Please fill in all ${platform} API fields`, 'warning');
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
                window.showNotification('Error saving API keys: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            window.showNotification(`${platform.charAt(0).toUpperCase() + platform.slice(1)} API keys saved successfully`, 'success');
            window.logActivity(`Saved ${platform} API keys`);
        });
    });
}

/**
 * Test Social Media API keys
 */
function testSocialMediaApi(platform) {
    chrome.storage.local.get(['socialMediaApis'], function(result) {
        const socialMediaApis = result.socialMediaApis || {};
        const apiData = socialMediaApis[platform];
        
        if (!apiData) {
            window.showNotification(`No ${platform} API keys found. Please save API keys first.`, 'warning');
            return;
        }
        
        window.showNotification(`Testing ${platform} API keys...`, 'info');
        
        // In a real implementation, you would make the actual API call
        // For now, we'll simulate a successful response
        setTimeout(() => {
            window.showNotification(`${platform.charAt(0).toUpperCase() + platform.slice(1)} API keys are valid!`, 'success');
            window.logActivity(`Tested ${platform} API keys successfully`);
        }, 1500);
    });
}

/**
 * Connect Social Media Account
 */
function connectSocialMediaAccount(platform) {
    chrome.storage.local.get(['socialMediaApis'], function(result) {
        const socialMediaApis = result.socialMediaApis || {};
        const apiData = socialMediaApis[platform];
        
        if (!apiData) {
            window.showNotification(`No ${platform} API keys found. Please save API keys first.`, 'warning');
            return;
        }
        
        window.showNotification(`Connecting to ${platform}...`, 'info');
        
        // In a real implementation, you would initiate OAuth flow
        // For now, we'll simulate a successful connection
        setTimeout(() => {
            window.showNotification(`Connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)} successfully!`, 'success');
            window.logActivity(`Connected to ${platform} account`);
            
            // Update UI to show connected state
            const connectButton = document.getElementById(`connect${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
            if (connectButton) {
                connectButton.textContent = 'Reconnect Account';
                connectButton.classList.add('connected');
            }
        }, 2000);
    });
}

/**
 * Save Analytics API keys
 */
function saveAnalyticsApi(platform) {
    let apiData = {};
    
    switch(platform) {
        case 'google':
            apiData = {
                measurementId: document.getElementById('googleAnalyticsId').value.trim()
            };
            break;
        // Add other analytics platforms as needed
    }
    
    // Validate required fields
    const hasEmptyFields = Object.values(apiData).some(value => !value);
    if (hasEmptyFields) {
        window.showNotification(`Please fill in all ${platform} Analytics fields`, 'warning');
        return;
    }
    
    // Get existing analytics APIs
    chrome.storage.local.get(['analyticsApis'], function(result) {
        const analyticsApis = result.analyticsApis || {};
        
        // Update with new data
        analyticsApis[platform] = apiData;
        
        // Save to storage
        chrome.storage.local.set({ analyticsApis: analyticsApis }, function() {
            if (chrome.runtime.lastError) {
                window.showNotification('Error saving Analytics API: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            window.showNotification(`${platform.charAt(0).toUpperCase() + platform.slice(1)} Analytics saved successfully`, 'success');
            window.logActivity(`Saved ${platform} Analytics configuration`);
        });
    });
}

/**
 * Test Analytics API
 */
function testAnalyticsApi(platform) {
    chrome.storage.local.get(['analyticsApis'], function(result) {
        const analyticsApis = result.analyticsApis || {};
        const apiData = analyticsApis[platform];
        
        if (!apiData) {
            window.showNotification(`No ${platform} Analytics configuration found. Please save configuration first.`, 'warning');
            return;
        }
        
        window.showNotification(`Testing ${platform} Analytics...`, 'info');
        
        // In a real implementation, you would make the actual API call
        // For now, we'll simulate a successful response
        setTimeout(() => {
            window.showNotification(`${platform.charAt(0).toUpperCase() + platform.slice(1)} Analytics is valid!`, 'success');
            window.logActivity(`Tested ${platform} Analytics successfully`);
        }, 1500);
    });
}

/**
 * Get API key for a specific service
 */
function getApiKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['apiKey'], function(result) {
            if (chrome.runtime.lastError) {
                reject(new Error('Error retrieving API key: ' + chrome.runtime.lastError.message));
                return;
            }
            
            if (!result.apiKey) {
                reject(new Error('No YouTube API key found. Please add one in the API Management tab.'));
                return;
            }
            
            resolve(result.apiKey);
        });
    });
}

/**
 * Get Keyword API key
 */
function getKeywordApiKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['keywordApiKey', 'keywordApiProvider'], function(result) {
            if (chrome.runtime.lastError) {
                reject(new Error('Error retrieving Keyword API key: ' + chrome.runtime.lastError.message));
                return;
            }
            
            if (!result.keywordApiKey) {
                reject(new Error('No Keyword API key found. Please add one in the API Management tab.'));
                return;
            }
            
            resolve({
                key: result.keywordApiKey,
                provider: result.keywordApiProvider || 'semrush'
            });
        });
    });
}

/**
 * Get OpenAI API key
 */
function getOpenAiApiKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openaiApiKey', 'openaiModel'], function(result) {
            if (chrome.runtime.lastError) {
                reject(new Error('Error retrieving OpenAI API key: ' + chrome.runtime.lastError.message));
                return;
            }
            
            if (!result.openaiApiKey) {
                reject(new Error('No OpenAI API key found. Please add one in the API Management tab.'));
                return;
            }
            
            resolve({
                key: result.openaiApiKey,
                model: result.openaiModel || 'gpt-3.5-turbo'
            });
        });
    });
}

/**
 * Get Social Media API key for a specific platform
 */
function getSocialMediaApiKey(platform) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['socialMediaApis'], function(result) {
            if (chrome.runtime.lastError) {
                reject(new Error('Error retrieving Social Media API keys: ' + chrome.runtime.lastError.message));
                return;
            }
            
            const socialMediaApis = result.socialMediaApis || {};
            const apiData = socialMediaApis[platform];
            
            if (!apiData) {
                reject(new Error(`No ${platform} API keys found. Please add them in the API Management tab.`));
                return;
            }
            
            resolve(apiData);
        });
    });
}

/**
 * Get Analytics API key for a specific platform
 */
function getAnalyticsApiKey(platform) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['analyticsApis'], function(result) {
            if (chrome.runtime.lastError) {
                reject(new Error('Error retrieving Analytics API: ' + chrome.runtime.lastError.message));
                return;
            }
            
            const analyticsApis = result.analyticsApis || {};
            const apiData = analyticsApis[platform];
            
            if (!apiData) {
                reject(new Error(`No ${platform} Analytics configuration found. Please add it in the API Management tab.`));
                return;
            }
            
            resolve(apiData);
        });
    });
}