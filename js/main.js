/**
 * Main JavaScript for YouTube SEO Booster Extension
 * Orchestrates all modules and functionality
 */

// Add this at the beginning of the file
// Make sure this runs before any other code
(function() {
    console.log('main.js loading...');
    
    // Define a global modules object
    window.YTSEOModules = {
        initialized: false,
        api: null,
        analytics: null,
        keywords: null
    };
    
    // Create a function to load all modules
    window.initializeModules = function() {
        console.log('Initializing modules...');
        
        // Load API module
        try {
            if (window.ApiModule) {
                window.YTSEOModules.api = window.ApiModule;
                console.log('API module loaded successfully');
            } else {
                console.error('API module not found on window object');
            }
        } catch (error) {
            console.error('Error loading API module:', error);
        }
        
        // Load Analytics module
        try {
            if (window.AnalyticsModule) {
                window.YTSEOModules.analytics = window.AnalyticsModule;
                console.log('Analytics module loaded successfully');
            } else {
                console.error('Analytics module not found on window object');
            }
        } catch (error) {
            console.error('Error loading Analytics module:', error);
        }
        
        // Mark modules as initialized
        window.YTSEOModules.initialized = true;
        console.log('All modules initialized');
        
        // Dispatch event that modules are loaded
        window.dispatchEvent(new CustomEvent('ytSeoModulesLoaded'));
    };
    
    // Import the modules, then initialize them
    const modulesLoaded = {
        api: false,
        analytics: false
    };
    
    // Create script elements to load the modules
    const apiScript = document.createElement('script');
    apiScript.src = 'js/feature-modules/api.js';
    apiScript.onload = function() {
        console.log('API script loaded');
        modulesLoaded.api = true;
        checkAllModulesLoaded();
    };
    
    const analyticsScript = document.createElement('script');
    analyticsScript.src = 'js/feature-modules/analytics.js';
    analyticsScript.onload = function() {
        console.log('Analytics script loaded');
        modulesLoaded.analytics = true;
        checkAllModulesLoaded();
    };
    
    // Function to check if all modules are loaded
    function checkAllModulesLoaded() {
        if (modulesLoaded.api && modulesLoaded.analytics) {
            console.log('All module scripts loaded, initializing...');
            // Give a small delay to ensure modules are fully processed
            setTimeout(window.initializeModules, 500);
        }
    }
    
    // Add scripts to the document
    document.head.appendChild(apiScript);
    document.head.appendChild(analyticsScript);
})();

// Define module variables that will be populated by dynamic imports
let ApiModule;
let ApiManagementModule;
let AnalyticsModule;
let KeywordsModule;
let SocialModule;
let ToolsModule;
let ABTestingModule;
let ThumbnailGeneratorModule;
let AiContentModule;

// Browser compatibility polyfills
(function() {
    // Add polyfill for Element.matches
    if (!Element.prototype.matches) {
        Element.prototype.matches = 
            Element.prototype.matchesSelector || 
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector || 
            Element.prototype.oMatchesSelector || 
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;            
            };
    }
    
    // Add polyfill for Element.closest
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }
    
    // Add polyfill for forEach on NodeList
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }
    
    // Add polyfill for Object.entries
    if (!Object.entries) {
        Object.entries = function(obj) {
            var ownProps = Object.keys(obj),
                i = ownProps.length,
                resArray = new Array(i);
            while (i--)
                resArray[i] = [ownProps[i], obj[ownProps[i]]];
            return resArray;
        };
    }
})();

// DOM element cache to avoid repeated lookups
const domCache = {};

/**
 * Safely get a DOM element, caching the result
 * @param {string} id - The element ID to find
 * @param {boolean} forceRefresh - Force a refresh of the cached element
 * @returns {HTMLElement|null} - The DOM element or null if not found
 */
function getElement(id, forceRefresh = false) {
    if (!forceRefresh && domCache[id]) {
        return domCache[id];
    }
    
    const element = document.getElementById(id);
    if (element) {
        domCache[id] = element;
    } else {
        // Only log if we expected to find it (not on first check)
        if (id in domCache) {
            console.warn(`Element with ID '${id}' no longer exists in the DOM`);
        }
        domCache[id] = null;
    }
    
    return domCache[id];
}

/**
 * Safely get multiple DOM elements, without caching
 * @param {string} selector - The CSS selector to find elements
 * @returns {NodeList} - The list of matched DOM elements
 */
function getElements(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Clear the DOM cache when no longer needed
 */
function clearDomCache() {
    for (const key in domCache) {
        delete domCache[key];
    }
}

/**
 * Safely handle element event binding with proper cleanup
 * @param {string} id - The element ID to bind to
 * @param {string} event - The event name (e.g., 'click')
 * @param {Function} handler - The event handler function
 * @returns {HTMLElement|null} - The element or null if not found
 */
function safeBindEvent(id, event, handler) {
    const element = getElement(id, true); // Force refresh to ensure we have the latest
    
    if (!element) {
        console.warn(`Cannot bind ${event} event: Element '${id}' not found`);
        return null;
    }
    
    // Create a clone to remove any existing listeners
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    
    // Add new listener
    newElement.addEventListener(event, handler);
    
    // Update cache
    domCache[id] = newElement;
    
    return newElement;
}

// Global notification and logging functions - defined before module imports
// Define these functions only if they don't already exist
if (!window.showNotification) {
    window.showNotification = function(message, type = 'info') {
        console.log('Showing notification:', message, type);
        
        // Create notification element if it doesn't exist
        let notification = getElement('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            document.body.appendChild(notification);
            domCache['notification'] = notification;
        }
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        // Hide after a delay (use storage setting if available)
        chrome.storage.local.get(['notificationDuration'], function(result) {
            const duration = result.notificationDuration || 3000;
            setTimeout(() => {
                notification.style.display = 'none';
            }, duration);
        });
    };
}

// Always define the alias regardless of whether showNotification was just defined
window._showNotification = window.showNotification;

if (!window.logActivity) {
    window.logActivity = function(message, type = 'info') {
        console.log('Logging activity:', message, type);
        
        const logEntries = getElement('logEntries');
        
        if (!logEntries) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `<span class="log-time">${timestamp}</span> ${message}`;
        
        // Add to the beginning of the list
        logEntries.insertBefore(logEntry, logEntries.firstChild);
    };
    
    // Alias for modules that use _logActivity
    window._logActivity = window.logActivity;
}

/**
 * Debug function to check DOM elements on initialization
 * This logs missing elements to help diagnose problems
 */
function debugCheckDomElements() {
    console.group('DOM Element Check');
    
    // Critical UI elements
    const criticalElements = [
        'notification', 'apiStatus', 'lastUpdated',
        'videoId', 'apiKeyInput', 'apiKeysList'
    ];
    
    console.log('Checking critical UI elements...');
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`❌ Critical element not found: #${id}`);
        } else {
            console.log(`✓ Found element: #${id}`);
        }
    });
    
    // Check tab navigation
    console.log('Checking tab elements...');
    const tabButtons = document.querySelectorAll('.tab-btn, .sidebar-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    console.log(`Tab buttons found: ${tabButtons.length}`);
    console.log(`Tab panes found: ${tabPanes.length}`);
    
    if (tabButtons.length === 0) {
        console.error('❌ No tab buttons found');
    }
    
    if (tabPanes.length === 0) {
        console.error('❌ No tab panes found');
    }
    
    // Check if the number of buttons matches the number of panes
    if (tabButtons.length !== tabPanes.length) {
        console.warn(`⚠ Mismatch: ${tabButtons.length} tab buttons vs ${tabPanes.length} tab panes`);
    }
    
    // Verify feature buttons
    console.log('Checking key feature buttons...');
    [
        'testApiKey', 'saveApiKey',
        'themeToggle', 'settingsBtn', 
        'fetchMetrics', 'fetchKeywords',
        'findCompetitors', 'generateDescription'
    ].forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠ Feature button not found: #${id}`);
        } else {
            console.log(`✓ Found button: #${id}`);
        }
    });
    
    console.groupEnd();
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM loaded, initializing extension...');
        
        // Check for critical elements and warn if they're missing
        debugCheckDomElements();
        
        // Import all feature modules
        try {
            // First, ensure utility functions are available globally
            if (!window.showNotification || !window.logActivity) {
                console.error("Global utility functions not defined before module loading");
                if (!window.showNotification) {
                    console.error("showNotification is not defined globally");
                }
                if (!window.logActivity) {
                    console.error("logActivity is not defined globally");
                }
            }
            
            // Function to load a module with retries
            const loadModuleWithRetry = (modulePath, moduleVarName, onSuccess = null, maxRetries = 3) => {
                let retryCount = 0;
                
                const attemptLoad = () => {
                    // Use dynamic import with error handling
                    try {
                        import(modulePath)
                            .then(module => {
                                try {
                                    // Assign the module to the global variable
                                    if (moduleVarName === 'ApiModule') {
                                        ApiModule = module.ApiModule;
                                        // Attach to window for fullpage.js
                                        window.ApiModule = module.ApiModule;
                                    }
                                    else if (moduleVarName === 'ApiManagementModule') {
                                        ApiManagementModule = module.ApiManagementModule;
                                        window.ApiManagementModule = module.ApiManagementModule;
                                    }
                                    else if (moduleVarName === 'AnalyticsModule') {
                                        AnalyticsModule = module.AnalyticsModule;
                                        window.AnalyticsModule = module.AnalyticsModule;
                                    }
                                    else if (moduleVarName === 'KeywordsModule') {
                                        KeywordsModule = module.KeywordsModule;
                                        window.KeywordsModule = module.KeywordsModule;
                                    }
                                    else if (moduleVarName === 'SocialModule') {
                                        SocialModule = module.SocialModule;
                                        // Explicitly attach SocialModule to window object for non-module scripts
                                        window.SocialModule = module.SocialModule;
                                    }
                                    else if (moduleVarName === 'ToolsModule') {
                                        ToolsModule = module.ToolsModule;
                                        window.ToolsModule = module.ToolsModule;
                                    }
                                    else if (moduleVarName === 'ABTestingModule') {
                                        ABTestingModule = module.ABTestingModule;
                                        window.ABTestingModule = module.ABTestingModule;
                                    }
                                    else if (moduleVarName === 'ThumbnailGeneratorModule') {
                                        ThumbnailGeneratorModule = module.ThumbnailGeneratorModule;
                                        window.ThumbnailGeneratorModule = module.ThumbnailGeneratorModule;
                                    }
                                    else if (moduleVarName === 'AiContentModule') {
                                        AiContentModule = module.AiContentModule;
                                        window.AiContentModule = module.AiContentModule;
                                    }
                                    
                                    console.log(`${moduleVarName} loaded successfully`);
                                    
                                    if (onSuccess && typeof onSuccess === 'function') {
                                        // Wrap callback in try/catch to prevent errors from breaking the chain
                                        try {
                                            onSuccess();
                                        } catch (callbackError) {
                                            console.error(`Error in ${moduleVarName} callback:`, callbackError);
                                        }
                                    }
                                } catch (assignError) {
                                    console.error(`Error assigning ${moduleVarName}:`, assignError);
                                }
                            })
                            .catch(error => {
                                console.error(`Error loading ${moduleVarName}:`, error);
                                
                                // More detailed error logging
                                if (error instanceof SyntaxError) {
                                    console.error(`Syntax error in ${moduleVarName}: ${error.message}`);
                                }
                                
                                if (retryCount < maxRetries) {
                                    retryCount++;
                                    console.log(`Retrying ${moduleVarName} load (${retryCount}/${maxRetries})...`);
                                    setTimeout(attemptLoad, 1000);
                                } else {
                                    if (window.showNotification) {
                                        window.showNotification(`Error loading ${moduleVarName}. Some features may not work.`, 'warning');
                                    } else {
                                        console.error(`Failed to load ${moduleVarName} after ${maxRetries} attempts`);
                                    }
                                }
                            });
                    } catch (importError) {
                        console.error(`Critical error importing ${moduleVarName}:`, importError);
                    }
                };
                
                // Start loading with a slight delay to ensure global functions are ready
                setTimeout(attemptLoad, 100);
            };
            
            // Load all modules with retry capability - with slight delays between them
            setTimeout(() => loadModuleWithRetry('./feature-modules/api.js', 'ApiModule', checkApiKeyStatus), 0);
            setTimeout(() => loadModuleWithRetry('./feature-modules/api-management.js', 'ApiManagementModule', initializeApiManagement), 200);
            setTimeout(() => loadModuleWithRetry('./feature-modules/analytics.js', 'AnalyticsModule'), 400);
            setTimeout(() => loadModuleWithRetry('./feature-modules/keywords.js', 'KeywordsModule'), 600);
            setTimeout(() => loadModuleWithRetry('./feature-modules/social.js', 'SocialModule', initializeSocialMedia), 800);
            setTimeout(() => loadModuleWithRetry('./feature-modules/tools.js', 'ToolsModule'), 1000);
            setTimeout(() => loadModuleWithRetry('./feature-modules/ab-testing.js', 'ABTestingModule', initializeABTesting), 1200);
            setTimeout(() => loadModuleWithRetry('./feature-modules/thumbnail-generator.js', 'ThumbnailGeneratorModule', initializeThumbnailGenerator), 1400);
            setTimeout(() => loadModuleWithRetry('./feature-modules/ai-content.js', 'AiContentModule'), 1600);
        } catch (importError) {
            console.error('Error importing modules:', importError);
            if (window.showNotification) {
                window.showNotification('Error loading extension modules', 'error');
            } else {
                console.error('Error loading extension modules');
            }
        }
        
        // Load theme preference
        loadThemePreference();
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up tab navigation
        setupTabNavigation();
        
        // Check if we're on a YouTube page and detect video
        if (ToolsModule && typeof ToolsModule.detectCurrentYouTubeVideo === 'function') {
            console.log('Checking for current YouTube video');
            ToolsModule.detectCurrentYouTubeVideo();
        } else {
            console.log('YouTube video detection not available yet');
        }
        
        // Show welcome message
        showWelcomeMessage();
        
        console.log('Extension initialized successfully');
    } catch (error) {
        console.error('Error during extension initialization:', error);
        
        // Try to show error in UI
        try {
            const notification = document.getElementById('notification');
            if (notification) {
                notification.textContent = 'Error initializing extension: ' + error.message;
                notification.className = 'notification error';
                notification.style.display = 'block';
            }
        } catch (uiError) {
            console.error('Could not display error notification:', uiError);
        }
    }
});

/**
 * Save any pending state before extension closes
 */
function savePendingState() {
    // Check for any unsaved form data
    const apiKeyInput = getElement('apiKeyInput');
    if (apiKeyInput && apiKeyInput.value.trim()) {
        // Save API key if entered but not saved
        console.log('Found unsaved API key, saving before close');
        saveApiKeyFromTab();
    }
    
    // Other state saving logic can be added here
}

/**
 * Load saved theme preference with robust error handling
 */
function loadThemePreference() {
    try {
        chrome.storage.local.get(['theme'], function(result) {
            const savedTheme = result.theme || 'light';
            
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                
                // Update theme toggle button if it exists
                const themeToggleBtn = getElement('themeToggle');
                if (themeToggleBtn) {
                    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Light';
                }
            } else {
                document.body.classList.remove('dark-theme');
                
                // Update theme toggle button if it exists
                const themeToggleBtn = getElement('themeToggle');
                if (themeToggleBtn) {
                    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Dark';
                }
            }
        });
    } catch (error) {
        console.error('Error loading theme preference:', error);
    }
}

/**
 * Update theme toggle buttons to reflect current theme state
 */
function updateThemeToggleButtons(isDarkTheme) {
    try {
        // Update main toggle button
        const themeToggleBtn = getElement('themeToggle');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = isDarkTheme ? 
                '<i class="fas fa-sun"></i> Light Mode' : 
                '<i class="fas fa-moon"></i> Dark Mode';
        } else {
            console.log('Theme toggle button not found in DOM');
        }
        
        // Update settings toggle if it exists
        const themeToggleBtnSettings = getElement('themeToggleBtn');
        if (themeToggleBtnSettings) {
            themeToggleBtnSettings.innerHTML = isDarkTheme ? 
                '<i class="fas fa-sun"></i> Switch to Light Mode' : 
                '<i class="fas fa-moon"></i> Switch to Dark Mode';
        }
    } catch (error) {
        console.error('Error updating theme toggle buttons:', error);
    }
}

/**
 * Setup event listeners for all UI components
 */
function setupEventListeners() {
    try {
        console.log('Setting up event listeners');
        
        // Safely add event listeners to various buttons
        function safeAddEventListener(element, eventType, handler) {
            if (element) {
                element.addEventListener(eventType, handler);
            }
        }

        // Theme toggle
        const themeToggleBtn = getElement('themeToggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleTheme);
        } else {
            console.warn('Theme toggle button not found');
        }

        // Other event listeners...
        const settingsBtn = getElement('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', openSettings);
        }

        const activityLogBtn = getElement('activityLogBtn');
        if (activityLogBtn) {
            activityLogBtn.addEventListener('click', openActivityLog);
        }

        const clearLogsBtn = getElement('clearLogs');
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', clearLogs);
        }

        // Add other event listeners as needed...
    } catch (error) {
        console.error('Error in setupEventListeners:', error);
    }
}

/**
 * Setup event listeners for Quick Action buttons
 */
function setupQuickActionButtons() {
    try {
        // Settings button
        safeBindEvent('settingsBtn', 'click', function() {
            console.log('Settings button clicked');
            openSettings();
        });
        
        // Theme toggle button
        safeBindEvent('themeToggle', 'click', function() {
            console.log('Theme toggle button clicked');
            toggleTheme();
        });
        
        // Activity log button
        safeBindEvent('activityLogBtn', 'click', function() {
            console.log('Activity log button clicked');
            openActivityLog();
        });
        
        // Clear logs button
        safeBindEvent('clearLogs', 'click', function() {
            console.log('Clear logs button clicked');
            clearLogs();
        });
    } catch (error) {
        console.error('Error setting up quick action buttons:', error);
    }
}

/**
 * Setup event listeners for the Analytics tab
 */
function setupAnalyticsTabListeners() {
    try {
        console.log('Setting up Analytics tab listeners');
        
        const fetchMetricsBtn = document.getElementById('fetchMetrics');
        if (fetchMetricsBtn) {
            // Clone the node to remove any existing listeners
            const newFetchMetricsBtn = fetchMetricsBtn.cloneNode(true);
            fetchMetricsBtn.parentNode.replaceChild(newFetchMetricsBtn, fetchMetricsBtn);
            
            newFetchMetricsBtn.addEventListener('click', function() {
                console.log('Fetch metrics button clicked');
                if (AnalyticsModule && typeof AnalyticsModule.fetchVideoMetrics === 'function') {
                    AnalyticsModule.fetchVideoMetrics();
                } else {
                    console.log('AnalyticsModule not available yet - will be available when module loads');
                    _showNotification('Video metrics feature is loading, please try again in a moment', 'info');
                    
                    // Set up a retry mechanism
                    setTimeout(function() {
                        if (AnalyticsModule && typeof AnalyticsModule.fetchVideoMetrics === 'function') {
                            console.log('AnalyticsModule now available, fetching metrics');
                            AnalyticsModule.fetchVideoMetrics();
                        }
                    }, 2000);
                }
            });
        } else {
            console.warn('Fetch metrics button not found');
        }
        
        // Auto-detect button
        const detectCurrentVideoBtn = document.getElementById('detectCurrentVideo');
        if (detectCurrentVideoBtn) {
            // Clone the node to remove any existing listeners
            const newDetectCurrentVideoBtn = detectCurrentVideoBtn.cloneNode(true);
            detectCurrentVideoBtn.parentNode.replaceChild(newDetectCurrentVideoBtn, detectCurrentVideoBtn);
            
            newDetectCurrentVideoBtn.addEventListener('click', function() {
                console.log('Detect current video button clicked');
                if (ToolsModule && typeof ToolsModule.detectCurrentYouTubeVideo === 'function') {
                    ToolsModule.detectCurrentYouTubeVideo();
                } else {
                    console.error('ToolsModule or detectCurrentYouTubeVideo function not available');
                    _showNotification('Current video detection feature not available', 'error');
                }
            });
        } else {
            console.warn('Detect current video button not found');
        }
        
        // Fetch retention data button
        const fetchRetentionBtn = document.getElementById('fetchRetention');
        if (fetchRetentionBtn) {
            // Clone the node to remove any existing listeners
            const newFetchRetentionBtn = fetchRetentionBtn.cloneNode(true);
            fetchRetentionBtn.parentNode.replaceChild(newFetchRetentionBtn, fetchRetentionBtn);
            
            newFetchRetentionBtn.addEventListener('click', function() {
                console.log('Fetch retention data button clicked');
                if (AnalyticsModule && typeof AnalyticsModule.fetchRetentionData === 'function') {
                    AnalyticsModule.fetchRetentionData();
                } else {
                    console.error('AnalyticsModule or fetchRetentionData function not available');
                    _showNotification('Retention data feature not available', 'error');
                }
            });
        } else {
            console.warn('Fetch retention data button not found');
        }
        
        // Save performance snapshot button
        const saveSnapshotBtn = document.getElementById('saveSnapshot');
        if (saveSnapshotBtn) {
            // Clone the node to remove any existing listeners
            const newSaveSnapshotBtn = saveSnapshotBtn.cloneNode(true);
            saveSnapshotBtn.parentNode.replaceChild(newSaveSnapshotBtn, saveSnapshotBtn);
            
            newSaveSnapshotBtn.addEventListener('click', function() {
                console.log('Save snapshot button clicked');
                if (AnalyticsModule && typeof AnalyticsModule.savePerformanceSnapshot === 'function') {
                    AnalyticsModule.savePerformanceSnapshot();
                } else {
                    console.error('AnalyticsModule or savePerformanceSnapshot function not available');
                    _showNotification('Performance tracking feature not available', 'error');
                }
            });
        } else {
            console.warn('Save snapshot button not found');
        }
    } catch (error) {
        console.error('Error setting up analytics tab listeners:', error);
    }
}

/**
 * Set up event listeners for the keywords tab
 */
function setupKeywordsTabListeners() {
    console.log('Setting up Keywords tab listeners');
    try {
        // Get Suggestions button (matches fetchKeywords in HTML)
        const fetchKeywordsBtn = document.getElementById('fetchKeywords');
        if (fetchKeywordsBtn) {
            // Clone the node to remove any existing listeners
            const newFetchKeywordsBtn = fetchKeywordsBtn.cloneNode(true);
            fetchKeywordsBtn.parentNode.replaceChild(newFetchKeywordsBtn, fetchKeywordsBtn);
            
            newFetchKeywordsBtn.addEventListener('click', function() {
                console.log('Fetch keywords button clicked');
                if (KeywordsModule && typeof KeywordsModule.fetchKeywordSuggestions === 'function') {
                    KeywordsModule.fetchKeywordSuggestions();
                } else {
                    console.error('KeywordsModule or fetchKeywordSuggestions not available');
                    _showNotification('Keyword suggestion feature not available', 'error');
                }
            });
            
            // Advanced Keyword Analysis button
            const analyzeKeywordsBtn = document.getElementById('analyzeKeywords');
            if (analyzeKeywordsBtn) {
                // Clone the node to remove any existing listeners
                const newAnalyzeKeywordsBtn = analyzeKeywordsBtn.cloneNode(true);
                analyzeKeywordsBtn.parentNode.replaceChild(newAnalyzeKeywordsBtn, analyzeKeywordsBtn);
                
                newAnalyzeKeywordsBtn.addEventListener('click', function() {
                    console.log('Analyze keywords button clicked');
                    if (KeywordsModule && typeof KeywordsModule.analyzeKeywords === 'function') {
                        KeywordsModule.analyzeKeywords();
                    } else {
                        console.error('KeywordsModule or analyzeKeywords not available');
                        _showNotification('Keyword analysis feature not available', 'error');
                    }
                });
            }
        } else {
            console.warn('Fetch keywords button not found');
        }

        // Advanced Keyword Analysis is already set up above

        // Fetch trending topics
        const fetchTrendingBtn = document.getElementById('fetchTrending');
        if (fetchTrendingBtn) {
            // Clone the node to remove any existing listeners
            const newFetchTrendingBtn = fetchTrendingBtn.cloneNode(true);
            fetchTrendingBtn.parentNode.replaceChild(newFetchTrendingBtn, fetchTrendingBtn);
            
            newFetchTrendingBtn.addEventListener('click', function() {
                console.log('Fetch trending button clicked');
                if (KeywordsModule && typeof KeywordsModule.fetchTrendingTopics === 'function') {
                    KeywordsModule.fetchTrendingTopics();
                } else {
                    console.error('KeywordsModule or fetchTrendingTopics not available');
                    _showNotification('Trending topics feature not available', 'error');
                }
            });
        } else {
            console.warn('Fetch trending button not found');
        }

        // Generate Hashtags button
        const generateHashtagsBtn = document.getElementById('generateHashtags');
        if (generateHashtagsBtn) {
            // Clone the node to remove any existing listeners
            const newGenerateHashtagsBtn = generateHashtagsBtn.cloneNode(true);
            generateHashtagsBtn.parentNode.replaceChild(newGenerateHashtagsBtn, generateHashtagsBtn);
            
            newGenerateHashtagsBtn.addEventListener('click', function() {
                console.log('Generate Hashtags button clicked');
                if (KeywordsModule && typeof KeywordsModule.generateHashtags === 'function') {
                    KeywordsModule.generateHashtags();
                } else {
                    console.error('KeywordsModule or generateHashtags not available');
                    _showNotification('Hashtag generation feature not available', 'error');
                }
            });
        } else {
            console.warn('Generate hashtags button not found');
        }
    } catch (error) {
        console.error('Error in setupKeywordsTabListeners:', error);
    }
}

/**
 * Setup event listeners for the Competitors tab
 */
function setupCompetitorsTabListeners() {
    try {
        console.log('Setting up Competitors tab listeners');
        
        const findCompetitorsBtn = document.getElementById('findCompetitors');
        if (findCompetitorsBtn) {
            // Clone the node to remove any existing listeners
            const newFindCompetitorsBtn = findCompetitorsBtn.cloneNode(true);
            findCompetitorsBtn.parentNode.replaceChild(newFindCompetitorsBtn, findCompetitorsBtn);
            
            newFindCompetitorsBtn.addEventListener('click', function() {
                console.log('Find competitors button clicked');
                if (ApiModule && typeof ApiModule.fetchCompetitorData === 'function') {
                    ApiModule.fetchCompetitorData();
                } else {
                    console.error('ApiModule or fetchCompetitorData function not available');
                    _showNotification('Competitor analysis feature not available', 'error');
                }
            });
        } else {
            console.warn('Find competitors button not found');
        }
        
        // Content gap analysis button
        const analyzeContentGapBtn = document.getElementById('analyzeContentGap');
        if (analyzeContentGapBtn) {
            // Clone the node to remove any existing listeners
            const newAnalyzeContentGapBtn = analyzeContentGapBtn.cloneNode(true);
            analyzeContentGapBtn.parentNode.replaceChild(newAnalyzeContentGapBtn, analyzeContentGapBtn);
            
            newAnalyzeContentGapBtn.addEventListener('click', function() {
                console.log('Analyze content gap button clicked');
                analyzeContentGap();
            });
        } else {
            console.warn('Analyze content gap button not found');
        }
    } catch (error) {
        console.error('Error setting up competitors tab listeners:', error);
    }
}

/**
 * Setup event listeners for the Content tab
 */
function setupContentTabListeners() {
    // Apply metadata suggestions
    const applyMetadataSuggestionsBtn = getElement('applyMetadataSuggestions');
    if (applyMetadataSuggestionsBtn) {
        applyMetadataSuggestionsBtn.addEventListener('click', function() {
            console.log('Apply metadata suggestions button clicked');
            KeywordsModule.applyMetadataSuggestions();
        });
        console.log('Apply metadata suggestions button listener set');
    } else {
        console.error('Apply metadata suggestions button not found');
    }
    
    // AI Description Generator
    const generateDescriptionBtn = getElement('generateDescription');
    if (generateDescriptionBtn) {
        generateDescriptionBtn.addEventListener('click', function() {
            console.log('Generate description button clicked');
            generateAIDescription();
        });
    }
    
    // Generate hashtags
    const generateHashtagsBtn = getElement('generateHashtags');
    if (generateHashtagsBtn) {
        generateHashtagsBtn.addEventListener('click', function() {
            console.log('Generate hashtags button clicked');
            if (KeywordsModule && typeof KeywordsModule.generateHashtags === 'function') {
                KeywordsModule.generateHashtags();
            } else {
                console.error('KeywordsModule or generateHashtags function not available');
                _showNotification('Hashtag generator feature not available', 'error');
            }
        });
    }
    
    // Analyze thumbnail
    const analyzeThumbnailBtn = getElement('analyzeThumbnail');
    if (analyzeThumbnailBtn) {
        analyzeThumbnailBtn.addEventListener('click', function() {
            console.log('Analyze thumbnail button clicked');
            if (KeywordsModule && typeof KeywordsModule.analyzeThumbnail === 'function') {
                KeywordsModule.analyzeThumbnail();
            } else {
                console.error('KeywordsModule or analyzeThumbnail function not available');
                _showNotification('Thumbnail analyzer feature not available', 'error');
            }
        });
    }
    
    // Setup A/B Testing listeners
    if (typeof setupABTestingListeners === 'function') {
        setupABTestingListeners();
    }
    
    // Setup metadata auto-sync
    setupMetadataSync();
}

/**
 * Set up event listeners for Social Media tab
 */
function setupSocialMediaTabListeners() {
    try {
        console.log('Setting up Social Media tab listeners');
        
        // Define all supported social media platforms
        const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'telegram', 'whatsapp'];
        
        // Set up connect buttons for each platform
        platforms.forEach(platform => {
            // The HTML has IDs like 'connectFacebook', 'connectTwitter', etc.
            const connectBtn = document.getElementById(`connect${capitalizeFirstLetter(platform)}`);
            
            if (connectBtn) {
                // Clone the node to remove any existing listeners
                const newConnectBtn = connectBtn.cloneNode(true);
                connectBtn.parentNode.replaceChild(newConnectBtn, connectBtn);
                
                newConnectBtn.addEventListener('click', function() {
                    console.log(`${platform} connect button clicked`);
                    if (SocialModule && typeof SocialModule.connectSocialAccount === 'function') {
                        SocialModule.connectSocialAccount(platform);
                    } else {
                        console.error('SocialModule or connectSocialAccount function not available');
                        _showNotification('Social media connection feature not available', 'error');
                    }
                });
                console.log(`Set up event listener for ${platform} connect button`);
            } else {
                console.warn(`${platform} connect button not found`);
            }
        });
        
        // Set up Save Post Settings button
        const savePostSettingsBtn = document.getElementById('savePostSettings');
        if (savePostSettingsBtn) {
            // Clone the node to remove any existing listeners
            const newSavePostSettingsBtn = savePostSettingsBtn.cloneNode(true);
            savePostSettingsBtn.parentNode.replaceChild(newSavePostSettingsBtn, savePostSettingsBtn);
            
            newSavePostSettingsBtn.addEventListener('click', function() {
                console.log('Save post settings button clicked');
                
                // Get all settings
                const postTitle = document.getElementById('postTitle')?.value || '';
                const postDescription = document.getElementById('postDescription')?.value || '';
                const autoPostOnUpload = document.getElementById('autoPostOnUpload')?.checked || false;
                const includeThumbnail = document.getElementById('includeThumbailInPost')?.checked || false;
                
                // Save settings
                chrome.storage.local.get(['socialSettings'], function(result) {
                    const settings = result.socialSettings || {};
                    
                    // Update global settings
                    settings.global = {
                        postTitle: postTitle,
                        postDescription: postDescription,
                        autoPostOnUpload: autoPostOnUpload,
                        includeThumbnail: includeThumbnail
                    };
                    
                    chrome.storage.local.set({ socialSettings: settings }, function() {
                        _showNotification('Social media post settings saved', 'success');
                        _logActivity('Updated social media post settings');
                    });
                });
            });
        } else {
            console.warn('Save post settings button not found');
        }
        
        // Initialize and refresh the social connections
        if (SocialModule && typeof SocialModule.initializeSocialConnections === 'function') {
            SocialModule.initializeSocialConnections();
        } else {
            console.log('SocialModule not available yet - will be initialized when loaded');
            
            // Set up a retry mechanism
            const maxRetries = 3;
            let retryCount = 0;
            
            const retryInitialization = function() {
                if (typeof SocialModule !== 'undefined' && 
                    typeof SocialModule.initializeSocialConnections === 'function') {
                    console.log('SocialModule now available, initializing connections');
                    
                    // Ensure SocialModule is attached to window object for non-module scripts
                    if (!window.SocialModule) {
                        console.log('Attaching SocialModule to window object during retry');
                        window.SocialModule = SocialModule;
                    }
                    
                    SocialModule.initializeSocialConnections();
                } else if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Retry ${retryCount}/${maxRetries} for SocialModule initialization`);
                    setTimeout(retryInitialization, 1000);
                } else {
                    console.log('Failed to initialize SocialModule after retries');
                }
            };
            
            // Start retry process
            setTimeout(retryInitialization, 1000);
        }
    } catch (error) {
        console.error('Error setting up social media tab listeners:', error);
    }
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @return {string} The capitalized string
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Setup event listeners for the Tools tab
 */
function setupToolsTabListeners() {
    // Export button
    const exportDataBtn = getElement('exportData');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            console.log('Export data button clicked');
            ToolsModule.exportData();
        });
        console.log('Export data button listener set');
    } else {
        console.error('Export data button not found');
    }
    
    // Import button
    const importDataBtn = getElement('importData');
    if (importDataBtn) {
        importDataBtn.addEventListener('click', function() {
            console.log('Import data button clicked');
            ToolsModule.importData();
        });
        console.log('Import data button listener set');
    } else {
        console.error('Import data button not found');
    }
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
    console.log('Setting up tab navigation');
    
    const tabButtons = document.querySelectorAll('.tab-btn, .sidebar-btn');
    
    if (tabButtons.length === 0) {
        console.error('Tab buttons not found');
        return;
    }
    
    // Function to safely switch tabs
    function switchToTab(tabName) {
        try {
            console.log('Switching to tab:', tabName);
            
            // Get all tab panes (do this every time to ensure we have the latest DOM)
            const tabPanes = document.querySelectorAll('.tab-pane');
            
            if (tabPanes.length === 0) {
                console.error('Tab panes not found');
                return;
            }
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                if (btn && btn.classList) {
                    btn.classList.remove('active');
                }
            });
            
            // Add active class to the selected button
            tabButtons.forEach(btn => {
                if (btn && btn.dataset && btn.dataset.tab === tabName) {
                    btn.classList.add('active');
                }
            });
            
            // Hide all tab panes first
            tabPanes.forEach(pane => {
                if (pane && pane.classList) {
                    pane.classList.remove('active');
                    pane.style.display = 'none';
                }
            });
            
            // Show the target tab pane
            const targetPane = document.getElementById(tabName + '-tab');
            if (targetPane) {
                targetPane.classList.add('active');
                targetPane.style.display = 'block';
            } else {
                console.error('Target tab pane not found:', tabName + '-tab');
            }
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }
    
    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        if (button && button.addEventListener) {
            button.addEventListener('click', function(event) {
                if (this && this.dataset && this.dataset.tab) {
                    event.preventDefault();
                    switchToTab(this.dataset.tab);
                }
            });
        }
    });
    
    // Initialize with the first tab (analytics) active
    switchToTab('analytics');
}

/**
 * Check API key status and ensure UI is updated
 */
function checkApiKeyStatus() {
    console.log('Checking API key status');
    
    try {
        chrome.storage.local.get(['apiKey'], function(result) {
            try {
                const apiStatus = getElement('apiStatus');
                
                if (!apiStatus) {
                    console.error('API status element not found');
                    return;
                }
                
                if (result.apiKey) {
                    apiStatus.textContent = 'API Key: Saved';
                    apiStatus.className = 'api-status saved';
                    console.log('API key found in storage');
                    
                    // Update API usage stats if available
                    updateApiUsageStats(result.apiKey);
                    
                    // Update API key input if exists
                    const apiKeyInput = getElement('apiKeyInput');
                    if (apiKeyInput) {
                        // Show the actual key for better user experience
                        apiKeyInput.value = result.apiKey;
                        // Also set a placeholder in case the value gets cleared
                        apiKeyInput.setAttribute('placeholder', 'Enter your YouTube API Key');
                    }
                } else {
                    apiStatus.textContent = 'API Key: Not Set';
                    apiStatus.className = 'api-status not-set';
                    console.log('No API key found in storage');
                    
                    // Prompt user to add API key
                    showNotification('Please add your API key in the API tab', 'warning');
                }
            } catch (error) {
                console.error('Error updating API status UI:', error);
            }
        });
    } catch (error) {
        console.error('Error accessing Chrome storage:', error);
        showNotification('Error checking API key status', 'error');
    }
}

/**
 * Show welcome message with random tip
 */
function showWelcomeMessage() {
    const tips = [
        'Optimize your video title by including top keywords at the beginning.',
        'Use relevant hashtags in your description to improve discoverability.',
        'Monitor your audience retention to identify where viewers drop off.',
        'Compare your videos with top competitors to find optimization opportunities.',
        'Share your videos across multiple social platforms to increase reach.',
        'Add a clear call to action in your video description.',
        'Use the keyword analyzer to find trending terms in your niche.',
        'Regularly take performance snapshots to track your video growth over time.',
        'Keep your titles under 60 characters for optimal display on search results.',
        'Use detailed descriptions (at least 200 characters) with relevant keywords.'
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    showNotification(`Tip: ${randomTip}`, 'info');
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url) {
    if (!url) return null;
    
    // Handle full URL
    if (url.includes('youtube.com/') || url.includes('youtu.be/')) {
        // YouTube watch URL (youtube.com/watch?v=VIDEO_ID)
        if (url.includes('youtube.com/watch')) {
            try {
                const urlObj = new URL(url);
                return urlObj.searchParams.get('v');
            } catch (e) {
                return null;
            }
        }
        
        // YouTube short URL (youtu.be/VIDEO_ID)
        if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1]?.split('?')[0];
        }
        
        // YouTube embed URL (youtube.com/embed/VIDEO_ID)
        if (url.includes('youtube.com/embed/')) {
            return url.split('youtube.com/embed/')[1]?.split('?')[0];
        }
        
        return null;
    }
    
    // If just a video ID was provided (11 chars)
    if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
    }
    
    return null;
}

/**
 * Opens the settings modal
 */
function openSettings() {
    console.log('Opening settings modal');
    const modal = getElement('settingsModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Add close button functionality
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = function() {
                modal.style.display = 'none';
            };
        }
        
        // Close when clicking outside the modal
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    } else {
        console.error('Settings modal not found');
        showNotification('Settings modal not found', 'error');
    }
}

/**
 * Toggle between light and dark theme with proper error handling
 */
function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Toggle theme class on body
    document.body.classList.toggle('dark-theme');
    
    // Update theme toggle button icon
    const themeToggleBtn = getElement('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.innerHTML = newTheme === 'dark' 
            ? '<i class="fas fa-sun"></i> Light' 
            : '<i class="fas fa-moon"></i> Dark';
    }
    
    // Save theme preference
    chrome.storage.local.set({ 'theme': newTheme }, () => {
        console.log(`Theme switched to ${newTheme}`);
        window.showNotification(`Switched to ${newTheme} theme`, 'info');
    });
}

/**
 * Opens the activity log in a new tab
 */
function openActivityLog() {
    console.log('Opening activity log');
    chrome.tabs.create({ url: 'activity-log.html' });
}

/**
 * Clears the activity logs
 */
function clearLogs() {
    console.log('Clearing logs');
    const logEntries = getElement('logEntries');
    
    if (logEntries) {
        logEntries.innerHTML = '';
        chrome.storage.local.set({ activityLog: [] });
        showNotification('Logs cleared successfully', 'success');
    } else {
        console.error('Log entries container not found');
        showNotification('Log entries container not found', 'error');
    }
}

/**
 * Activate a specific tab programmatically
 * @param {string} tabId - The ID of the tab to activate
 */
function activateTab(tabId) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn, .sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`.tab-btn[data-tab="${tabId}"], .sidebar-btn[data-tab="${tabId}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    const selectedContent = document.getElementById(`${tabId}-tab`);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Log the tab change
    console.log(`Tab changed to: ${tabId}`);
}

/**
 * Initialize social media connections and event listeners
 */
function initializeSocialMedia() {
    try {
        console.log('Initializing social media module');
        
        // Check if SocialModule exists
        if (!SocialModule) {
            console.log('SocialModule is not available yet - will be initialized when loaded');
            return;
        }
        
        // Ensure SocialModule is attached to window object for non-module scripts
        if (!window.SocialModule) {
            console.log('Attaching SocialModule to window object');
            window.SocialModule = SocialModule;
        }
        
        // Initialize connection status for all platforms
        if (typeof SocialModule.initializeSocialConnections === 'function') {
            console.log('Initializing social connections...');
            SocialModule.initializeSocialConnections();
        } else {
            console.log('Social connection initialization not available yet - will retry later');
        }
        
        // Load social metrics if available
        if (typeof SocialModule.loadSocialMetrics === 'function') {
            console.log('Loading social metrics...');
            SocialModule.loadSocialMetrics();
        } else {
            console.warn('Social metrics loading not available - function missing from module');
        }
        
        console.log('Social media module initialized successfully');
    } catch (error) {
        console.error('Error initializing social media module:', error);
        showNotification('Error initializing social media features', 'error');
    }
}

/**
 * Setup event listeners for settings tab buttons
 */
function setupSettingsButtons() {
    try {
        // Theme toggle button in settings
        const themeToggleBtn = getElement('themeToggleBtn');
        if (themeToggleBtn) {
            // Replace with cloned node to remove any existing listeners
            const newThemeToggleBtn = themeToggleBtn.cloneNode(true);
            themeToggleBtn.parentNode.replaceChild(newThemeToggleBtn, themeToggleBtn);
            
            // Add fresh listener
            newThemeToggleBtn.addEventListener('click', function() {
                console.log('Theme toggle button clicked (settings tab)');
                toggleTheme();
            });
        }
        
        // Font size selector
        const fontSizeSelect = getElement('fontSizeSelect');
        if (fontSizeSelect) {
            // Replace with cloned node to remove any existing listeners
            const newFontSizeSelect = fontSizeSelect.cloneNode(true);
            fontSizeSelect.parentNode.replaceChild(newFontSizeSelect, fontSizeSelect);
            
            // Add fresh listener
            newFontSizeSelect.addEventListener('change', function() {
                const fontSize = this.value;
                setFontSize(fontSize);
            });
            
            // Set initial value based on stored preference
            chrome.storage.local.get(['fontSize'], function(result) {
                if (result.fontSize) {
                    newFontSizeSelect.value = result.fontSize;
                    setFontSize(result.fontSize);
                }
            });
        }
        
        // Save history toggle
        const saveHistoryToggle = getElement('saveHistoryToggle');
        if (saveHistoryToggle) {
            // Replace with cloned node to remove any existing listeners
            const newSaveHistoryToggle = saveHistoryToggle.cloneNode(true);
            saveHistoryToggle.parentNode.replaceChild(newSaveHistoryToggle, saveHistoryToggle);
            
            // Add fresh listener
            newSaveHistoryToggle.addEventListener('change', function() {
                chrome.storage.local.set({ saveHistory: this.checked });
                console.log('Save history set to:', this.checked);
            });
            
            // Set initial state
            chrome.storage.local.get(['saveHistory'], function(result) {
                if (result.saveHistory !== undefined) {
                    newSaveHistoryToggle.checked = result.saveHistory;
                }
            });
        }
        
        // Analytics logging toggle
        const analyticsLoggingToggle = getElement('analyticsLoggingToggle');
        if (analyticsLoggingToggle) {
            // Replace with cloned node to remove any existing listeners
            const newAnalyticsLoggingToggle = analyticsLoggingToggle.cloneNode(true);
            analyticsLoggingToggle.parentNode.replaceChild(newAnalyticsLoggingToggle, analyticsLoggingToggle);
            
            // Add fresh listener
            newAnalyticsLoggingToggle.addEventListener('change', function() {
                chrome.storage.local.set({ analyticsLogging: this.checked });
                console.log('Analytics logging set to:', this.checked);
            });
            
            // Set initial state
            chrome.storage.local.get(['analyticsLogging'], function(result) {
                if (result.analyticsLogging !== undefined) {
                    newAnalyticsLoggingToggle.checked = result.analyticsLogging;
                }
            });
        }
        
        // Notifications toggle
        const notificationsToggle = getElement('notificationsToggle');
        if (notificationsToggle) {
            // Replace with cloned node to remove any existing listeners
            const newNotificationsToggle = notificationsToggle.cloneNode(true);
            notificationsToggle.parentNode.replaceChild(newNotificationsToggle, notificationsToggle);
            
            // Add fresh listener
            newNotificationsToggle.addEventListener('change', function() {
                chrome.storage.local.set({ showNotifications: this.checked });
                console.log('Show notifications set to:', this.checked);
            });
            
            // Set initial state
            chrome.storage.local.get(['showNotifications'], function(result) {
                if (result.showNotifications !== undefined) {
                    newNotificationsToggle.checked = result.showNotifications;
                }
            });
        }
        
        // Notification duration
        const notificationDuration = getElement('notificationDuration');
        if (notificationDuration) {
            // Replace with cloned node to remove any existing listeners
            const newNotificationDuration = notificationDuration.cloneNode(true);
            notificationDuration.parentNode.replaceChild(newNotificationDuration, notificationDuration);
            
            // Add fresh listener
            newNotificationDuration.addEventListener('change', function() {
                chrome.storage.local.set({ notificationDuration: parseInt(this.value) });
                console.log('Notification duration set to:', this.value);
            });
            
            // Set initial state
            chrome.storage.local.get(['notificationDuration'], function(result) {
                if (result.notificationDuration) {
                    newNotificationDuration.value = result.notificationDuration.toString();
                }
            });
        }
        
        // Clear all data button
        const clearAllDataBtn = getElement('clearAllData');
        if (clearAllDataBtn) {
            // Replace with cloned node to remove any existing listeners
            const newClearAllDataBtn = clearAllDataBtn.cloneNode(true);
            clearAllDataBtn.parentNode.replaceChild(newClearAllDataBtn, clearAllDataBtn);
            
            // Add fresh listener
            newClearAllDataBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
                    clearAllData();
                }
            });
        }
    } catch (error) {
        console.error('Error setting up settings buttons:', error);
    }
}

/**
 * Save API Key from the API Management tab
 */
function saveApiKeyFromTab() {
    const apiKeyInput = getElement('apiKeyInput');
    if (!apiKeyInput) {
        showNotification('API key input not found', 'error');
        return;
    }
    
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        showNotification('Please enter an API key', 'warning');
        return;
    }
    
    try {
        // Save to storage
        chrome.storage.local.set({ apiKey: apiKey }, function() {
            try {
                showNotification('API key saved successfully', 'success');
                apiKeyInput.value = '';
                
                // Chain these operations to ensure they happen in sequence
                updateApiKeysList(function() {
                    checkApiKeyStatus();
                });
                
                // Log the activity
                logActivity('API key updated', 'info');
            } catch (error) {
                console.error('Error after saving API key:', error);
                showNotification('Error updating UI after saving API key', 'error');
            }
        });
    } catch (error) {
        console.error('Error saving API key:', error);
        showNotification('Error saving API key', 'error');
    }
}

/**
 * Update the list of API keys in the API Management tab
 * @param {Function} callback - Optional callback to run after updating
 */
function updateApiKeysList(callback) {
    const apiKeysList = getElement('apiKeysList');
    if (!apiKeysList) {
        if (callback && typeof callback === 'function') {
            callback();
        }
        return;
    }
    
    try {
        chrome.storage.local.get(['apiKey'], function(result) {
            try {
                if (result.apiKey) {
                    const maskedKey = maskApiKey(result.apiKey);
                    apiKeysList.innerHTML = `
                        <div class="api-key-item">
                            <div class="api-key-details">
                                <span class="api-key-value">${maskedKey}</span>
                                <span class="api-key-status active">Active</span>
                            </div>
                            <div class="api-key-actions">
                                <button class="btn-icon delete-key" data-key="${result.apiKey}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    
                    // Add event listener to delete button using event delegation
                    // to avoid memory leaks from repeated bindings
                    apiKeysList.querySelectorAll('.delete-key').forEach(btn => {
                        // Remove old listeners by cloning
                        const newBtn = btn.cloneNode(true);
                        btn.parentNode.replaceChild(newBtn, btn);
                        
                        // Add fresh listener
                        newBtn.addEventListener('click', function() {
                            deleteApiKey(this.dataset.key);
                        });
                    });
                } else {
                    apiKeysList.innerHTML = '<div class="no-keys">No API keys saved</div>';
                }
                
                if (callback && typeof callback === 'function') {
                    callback();
                }
            } catch (error) {
                console.error('Error updating API keys list UI:', error);
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        });
    } catch (error) {
        console.error('Error retrieving API keys:', error);
        if (callback && typeof callback === 'function') {
            callback();
        }
    }
}

/**
 * Mask API key for display purposes
 */
function maskApiKey(apiKey) {
    if (apiKey.length <= 8) return '••••••••';
    return apiKey.substring(0, 4) + '••••••••' + apiKey.substring(apiKey.length - 4);
}

/**
 * Set font size for the extension
 */
function setFontSize(size) {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add('font-' + size);
    chrome.storage.local.set({ fontSize: size });
}

/**
 * Clear all extension data
 */
function clearAllData() {
    chrome.storage.local.clear(function() {
        showNotification('All data has been cleared', 'success');
        // Reset UI elements
        getElement('apiKeysList').innerHTML = '<p>No API keys saved yet.</p>';
        getElement('apiStatus').textContent = 'API Key: Not Set';
        getElement('apiStatus').className = 'api-status not-set';
        getElement('lastUpdated').textContent = 'Last updated: Never';
        
        // Reset any activity logs
        const logEntries = getElement('logEntries');
        if (logEntries) {
            logEntries.innerHTML = '';
        }
    });
}

// New function to update API usage stats
function updateApiUsageStats(apiKey) {
    const apiUsageStats = getElement('apiUsageStats');
    if (!apiUsageStats) return;
    
    // In a real implementation, you would call the YouTube API to get quota usage
    // For demo purposes, we'll just show sample data
    apiUsageStats.innerHTML = `
        <div class="api-usage-stats">
            <div class="usage-item">
                <span class="usage-label">Quota Used Today:</span>
                <span class="usage-value">1,245 units</span>
            </div>
            <div class="usage-item">
                <span class="usage-label">Daily Quota Limit:</span>
                <span class="usage-value">10,000 units</span>
            </div>
            <div class="usage-item">
                <span class="usage-label">Remaining:</span>
                <span class="usage-value">8,755 units</span>
            </div>
            <div class="usage-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 12.45%"></div>
                </div>
                <span class="progress-text">12.45% used</span>
            </div>
        </div>
    `;
}

/**
 * Analyze content gaps based on competitor data
 */
function analyzeContentGap() {
    console.log('Analyzing content gaps');
    const contentGapResults = getElement('contentGapResults');
    
    if (!contentGapResults) {
        showNotification('Content gap results container not found', 'error');
        return;
    }
    
    // Check if competitor data is available
    chrome.storage.local.get(['competitorData'], function(result) {
        if (!result.competitorData || !result.competitorData.length) {
            contentGapResults.innerHTML = `
                <div class="info-message">
                    <p>Please analyze competitors first to identify content gaps.</p>
                    <button id="runCompetitorAnalysis" class="btn-secondary">Run Competitor Analysis</button>
                </div>
            `;
            
            // Add event listener to the button
            const runCompetitorAnalysisBtn = getElement('runCompetitorAnalysis');
            if (runCompetitorAnalysisBtn) {
                runCompetitorAnalysisBtn.addEventListener('click', function() {
                    // Activate the competitor analysis tab and scroll to it
                    const competitorTab = document.querySelector('.tab-btn[data-tab="competitors"], .sidebar-btn[data-tab="competitors"]');
                    if (competitorTab) {
                        competitorTab.click();
                    } else {
                        console.log('Competitor tab button not found');
                        // Fallback: manually activate the tab
                        activateTab('competitors');
                    }
                });
            }
            return;
        }
        
        // Show loading state
        contentGapResults.innerHTML = '<div class="loading">Analyzing content gaps...</div>';
        
        // In a real implementation, you would analyze the competitor data
        // to identify content gaps. For demo purposes, we'll show sample results.
        setTimeout(() => {
            const gapTypes = [
                {
                    type: 'Topic Coverage',
                    gaps: [
                        'Beginner-friendly tutorials on YouTube SEO',
                        'Case studies of successful YouTube channels',
                        'Updates on latest YouTube algorithm changes'
                    ]
                },
                {
                    type: 'Content Format',
                    gaps: [
                        'Interactive tutorials',
                        'Live Q&A sessions',
                        'Behind-the-scenes content'
                    ]
                },
                {
                    type: 'Audience Engagement',
                    gaps: [
                        'Community polls and surveys',
                        'Viewer challenge series',
                        'Collaboration opportunities'
                    ]
                }
            ];
            
            // Generate HTML for the results
            let html = '<h3>Content Gap Analysis Results</h3>';
            
            gapTypes.forEach(gapType => {
                html += `
                    <div class="gap-category">
                        <h4>${gapType.type}</h4>
                        <ul class="gap-list">
                            ${gapType.gaps.map(gap => `
                                <li class="gap-item">
                                    <span class="gap-text">${gap}</span>
                                    <button class="gap-action" data-gap="${gap}">Create Content</button>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            });
            
            html += `
                <div class="gap-summary">
                    <h4>Recommendation Summary</h4>
                    <p>Based on competitor analysis, these content areas represent opportunities to differentiate your channel and attract new viewers.</p>
                    <button id="exportGapAnalysis" class="btn-primary">Export Analysis</button>
                </div>
            `;
            
            contentGapResults.innerHTML = html;
            
            // Add event listeners to the action buttons
            const gapActionBtns = contentGapResults.querySelectorAll('.gap-action');
            gapActionBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const gap = this.dataset.gap;
                    showNotification(`Added "${gap}" to content planner`, 'success');
                });
            });
            
            // Add event listener to the export button
            const exportGapAnalysisBtn = getElement('exportGapAnalysis');
            if (exportGapAnalysisBtn) {
                exportGapAnalysisBtn.addEventListener('click', function() {
                    showNotification('Content gap analysis exported', 'success');
                });
            }
            
            showNotification('Content gap analysis completed', 'success');
            logActivity('Completed content gap analysis');
        }, 1500);
    });
}

/**
 * Setup metadata synchronization
 */
function setupMetadataSync() {
    console.log('Setting up metadata synchronization');
    
    // Get the metadata input fields
    const titleInput = getElement('videoTitle');
    const descriptionInput = getElement('videoDescription');
    
    if (!titleInput || !descriptionInput) {
        console.error('Metadata input fields not found');
        return;
    }
    
    // Add event listeners for auto analysis
    titleInput.addEventListener('input', debounce(function() {
        if (titleInput.value.length > 10 && descriptionInput.value.length > 20) {
            console.log('Auto-analyzing metadata');
            if (KeywordsModule && typeof KeywordsModule.analyzeMetadata === 'function') {
                KeywordsModule.analyzeMetadata();
            } else {
                console.log('KeywordsModule not available yet - analysis will be available when module loads');
            }
        }
    }, 1000));
    
    descriptionInput.addEventListener('input', debounce(function() {
        if (titleInput.value.length > 10 && descriptionInput.value.length > 20) {
            console.log('Auto-analyzing metadata');
            if (KeywordsModule && typeof KeywordsModule.analyzeMetadata === 'function') {
                KeywordsModule.analyzeMetadata();
            } else {
                console.log('KeywordsModule not available yet - analysis will be available when module loads');
            }
        }
    }, 1000));
    
    // Check for existing video data to auto-populate
    chrome.storage.local.get(['currentVideoData'], function(result) {
        if (result.currentVideoData && result.currentVideoData.snippet) {
            console.log('Auto-populating metadata from current video');
            
            if (!titleInput.value) {
                titleInput.value = result.currentVideoData.snippet.title || '';
            }
            
            if (!descriptionInput.value) {
                descriptionInput.value = result.currentVideoData.snippet.description || '';
            }
            
            // Trigger analysis if both fields have content
            if (titleInput.value.length > 10 && descriptionInput.value.length > 20) {
                if (KeywordsModule && typeof KeywordsModule.analyzeMetadata === 'function') {
                    KeywordsModule.analyzeMetadata();
                } else {
                    console.log('KeywordsModule not available yet - analysis will be available when module loads');
                }
            }
        }
    });
}

/**
 * Generate AI description for YouTube video
 */
function generateAIDescription() {
    console.log('Generating AI description');
    const generatedDescriptions = getElement('generatedDescriptions');
    const titleInput = getElement('videoTitle');
    
    if (!generatedDescriptions) {
        showNotification('Generated descriptions container not found', 'error');
        return;
    }
    
    if (!titleInput || !titleInput.value.trim()) {
        showNotification('Please enter a video title first', 'warning');
        return;
    }
    
    // Show loading state
    generatedDescriptions.innerHTML = '<div class="loading">Generating optimized descriptions...</div>';
    
    // In a real implementation, you would call an AI service to generate descriptions
    // For demo purposes, we'll generate sample descriptions
    setTimeout(() => {
        const title = titleInput.value.trim();
        
        const descriptions = [
            {
                type: 'Keyword-Rich',
                content: `${title}\n\nIn this comprehensive video, we explore everything you need to know about ${title.toLowerCase()}. Whether you're a beginner or an expert, you'll discover valuable insights and actionable tips to improve your understanding and skills.\n\n🔔 SUBSCRIBE for more content: [Your Channel URL]\n📱 Follow me on social media:\nInstagram: [Your Instagram]\nTwitter: [Your Twitter]\n\n⏱️ TIMESTAMPS:\n00:00 Introduction\n01:30 Key Concepts\n05:45 Practical Examples\n10:20 Advanced Techniques\n15:30 Conclusion\n\n#YouTubeTips #ContentCreator #VideoStrategy`
            },
            {
                type: 'Storytelling',
                content: `Have you ever wondered about ${title.toLowerCase()}? Join me on this journey as we explore the fascinating world behind this topic.\n\nIn this video, I share my personal experience and the lessons I've learned along the way. You'll discover insights that can help you avoid common mistakes and achieve better results faster.\n\n🔔 SUBSCRIBE for weekly videos!\n\n📱 Let's connect:\nInstagram: [Your Instagram]\nTwitter: [Your Twitter]\n\n#YouTubeTips #ContentCreator #VideoStrategy`
            },
            {
                type: 'Call-to-Action',
                content: `${title} - The Ultimate Guide\n\n👉 FREE DOWNLOAD: Get my ${title.split(' ')[0]} checklist here: [Your Link]\n\nThis video covers everything you need to know about ${title.toLowerCase()}. If you're looking to improve your skills and get better results, make sure to watch until the end!\n\n✅ SUBSCRIBE for more tips\n✅ LIKE this video if you found it helpful\n✅ COMMENT with your questions\n\n📱 FOLLOW ME:\nInstagram: [Your Instagram]\nTwitter: [Your Twitter]\n\n#YouTubeTips #ContentCreator #VideoStrategy`
            }
        ];
        
        // Generate HTML for the results
        let html = '<h3>Generated Descriptions</h3>';
        
        descriptions.forEach((desc, index) => {
            html += `
                <div class="description-option">
                    <div class="description-header">
                        <h4>${desc.type} Version</h4>
                        <div class="description-actions">
                            <button class="copy-description" data-index="${index}">Copy</button>
                            <button class="apply-description" data-index="${index}">Apply</button>
                        </div>
                    </div>
                    <pre class="description-content">${desc.content}</pre>
                </div>
            `;
        });
        
        generatedDescriptions.innerHTML = html;
        
        // Add event listeners to the buttons
        const copyBtns = generatedDescriptions.querySelectorAll('.copy-description');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                navigator.clipboard.writeText(descriptions[index].content)
                    .then(() => {
                        showNotification('Description copied to clipboard', 'success');
                    })
                    .catch(err => {
                        console.error('Error copying text:', err);
                        showNotification('Error copying to clipboard', 'error');
                    });
            });
        });
        
        const applyBtns = generatedDescriptions.querySelectorAll('.apply-description');
        applyBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const descriptionInput = getElement('videoDescription');
                
                if (descriptionInput) {
                    descriptionInput.value = descriptions[index].content;
                    showNotification('Description applied', 'success');
                    
                    // Trigger metadata analysis
                    KeywordsModule.analyzeMetadata();
                } else {
                    showNotification('Description input not found', 'error');
                }
            });
        });
        
        showNotification('Descriptions generated successfully', 'success');
        logActivity('Generated AI descriptions for video');
    }, 2000);
}

/**
 * Debounce function to limit how often a function is called
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * Delete API key with confirmation
 * @param {string} key - The API key to delete
 */
function deleteApiKey(key) {
    if (!key) {
        showNotification('Invalid API key', 'error');
        return;
    }
    
    try {
        if (confirm('Are you sure you want to delete this API key?')) {
            chrome.storage.local.remove(['apiKey'], function() {
                try {
                    showNotification('API key deleted', 'success');
                    logActivity('API key deleted', 'info');
                    
                    // Chain operations to ensure they happen in sequence
                    updateApiKeysList(function() {
                        checkApiKeyStatus();
                    });
                } catch (error) {
                    console.error('Error updating UI after API key deletion:', error);
                    showNotification('Error updating UI after API key deletion', 'error');
                }
            });
        }
    } catch (error) {
        console.error('Error deleting API key:', error);
        showNotification('Error deleting API key', 'error');
    }
} 

/**
 * Initialize A/B Testing module
 */
function initializeABTesting() {
    console.log('Initializing A/B Testing module');
    
    // Set up event listeners for A/B Testing UI
    setupABTestingListeners();
}

/**
 * Initialize API Management module
 */
function initializeApiManagement() {
    console.log('Initializing API Management module');
    
    // Initialize API Management UI
    if (ApiManagementModule && typeof ApiManagementModule.initializeApiManagement === 'function') {
        ApiManagementModule.initializeApiManagement();
    }
}

/**
 * Initialize Thumbnail Generator module
 */
function initializeThumbnailGenerator() {
    console.log('Initializing Thumbnail Generator module');
    
    // Set up event listeners for Thumbnail Generator UI
    setupThumbnailGeneratorListeners();
}

/**
 * Setup event listeners for A/B Testing
 */
function setupABTestingListeners() {
    // Test type selector
    const titleTestRadio = getElement('titleTest');
    const thumbnailTestRadio = getElement('thumbnailTest');
    const titleTestOptions = getElement('titleTestOptions');
    const thumbnailTestOptions = getElement('thumbnailTestOptions');
    
    if (titleTestRadio && thumbnailTestRadio && titleTestOptions && thumbnailTestOptions) {
        titleTestRadio.addEventListener('change', function() {
            if (this.checked) {
                titleTestOptions.style.display = 'block';
                thumbnailTestOptions.style.display = 'none';
            }
        });
        
        thumbnailTestRadio.addEventListener('change', function() {
            if (this.checked) {
                titleTestOptions.style.display = 'none';
                thumbnailTestOptions.style.display = 'block';
            }
        });
    }
    
    // Auto-detect current video for test
    const detectCurrentVideoForTestBtn = getElement('detectCurrentVideoForTest');
    if (detectCurrentVideoForTestBtn) {
        detectCurrentVideoForTestBtn.addEventListener('click', function() {
            console.log('Auto-detect video for test button clicked');
            if (ToolsModule && typeof ToolsModule.detectCurrentYouTubeVideo === 'function') {
                ToolsModule.detectCurrentYouTubeVideo('abTestVideoId');
            } else {
                console.error('ToolsModule or detectCurrentYouTubeVideo function not available');
                _showNotification('Video detection feature not available', 'error');
            }
        });
    }
    
    // Thumbnail preview
    const thumbnailAInput = getElement('thumbnailA');
    const thumbnailBInput = getElement('thumbnailB');
    const thumbnailAPreview = getElement('thumbnailAPreview');
    const thumbnailBPreview = getElement('thumbnailBPreview');
    
    if (thumbnailAInput && thumbnailAPreview) {
        thumbnailAInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    thumbnailAPreview.innerHTML = `<img src="${e.target.result}" alt="Thumbnail A Preview">`;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    if (thumbnailBInput && thumbnailBPreview) {
        thumbnailBInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    thumbnailBPreview.innerHTML = `<img src="${e.target.result}" alt="Thumbnail B Preview">`;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Start test button
    const startTestBtn = getElement('startTest');
    if (startTestBtn) {
        startTestBtn.addEventListener('click', function() {
            console.log('Start A/B test button clicked');
            if (ABTestingModule) {
                const testType = document.querySelector('input[name="testType"]:checked').value;
                
                if (testType === 'title') {
                    if (typeof ABTestingModule.createTitleTest === 'function') {
                        ABTestingModule.createTitleTest();
                    } else {
                        console.error('createTitleTest function not available');
                        _showNotification('Title A/B testing feature not available', 'error');
                    }
                } else if (testType === 'thumbnail') {
                    if (typeof ABTestingModule.createThumbnailTest === 'function') {
                        ABTestingModule.createThumbnailTest();
                    } else {
                        console.error('createThumbnailTest function not available');
                        _showNotification('Thumbnail A/B testing feature not available', 'error');
                    }
                }
            } else {
                console.error('ABTestingModule not available');
                _showNotification('A/B testing feature not available', 'error');
            }
        });
    }
}

/**
 * Setup event listeners for Thumbnail Generator
 */
function setupThumbnailGeneratorListeners() {
    // Thumbnail analyzer
    const analyzeThumbnailBtn = getElement('analyzeThumbnail');
    const thumbnailFileInput = getElement('thumbnailFile');
    
    if (analyzeThumbnailBtn && thumbnailFileInput) {
        analyzeThumbnailBtn.addEventListener('click', function() {
            console.log('Analyze thumbnail button clicked');
            if (KeywordsModule && typeof KeywordsModule.analyzeThumbnail === 'function') {
                KeywordsModule.analyzeThumbnail();
            } else {
                console.error('KeywordsModule or analyzeThumbnail function not available');
                _showNotification('Thumbnail analyzer feature not available', 'error');
            }
        });
        
        thumbnailFileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                const thumbnailPreview = getElement('thumbnailPreview');
                
                reader.onload = function(e) {
                    if (thumbnailPreview) {
                        thumbnailPreview.innerHTML = `<img src="${e.target.result}" alt="Thumbnail Preview">`;
                    }
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Auto-detect current video for thumbnail generator
    const detectCurrentVideoForThumbnailBtn = getElement('detectCurrentVideoForThumbnail');
    if (detectCurrentVideoForThumbnailBtn) {
        detectCurrentVideoForThumbnailBtn.addEventListener('click', function() {
            console.log('Auto-detect video for thumbnail button clicked');
            if (ToolsModule && typeof ToolsModule.detectCurrentYouTubeVideo === 'function') {
                ToolsModule.detectCurrentYouTubeVideo('thumbnailVideoId');
            } else {
                console.error('ToolsModule or detectCurrentYouTubeVideo function not available');
                _showNotification('Video detection feature not available', 'error');
            }
        });
    }
    
    // Generate thumbnail button
    const generateThumbnailBtn = getElement('generateThumbnail');
    if (generateThumbnailBtn) {
        generateThumbnailBtn.addEventListener('click', function() {
            console.log('Generate thumbnail button clicked');
            if (ThumbnailGeneratorModule && typeof ThumbnailGeneratorModule.generateThumbnail === 'function') {
                ThumbnailGeneratorModule.generateThumbnail();
            } else {
                console.error('ThumbnailGeneratorModule or generateThumbnail function not available');
                _showNotification('Thumbnail generator feature not available', 'error');
            }
        });
    }
    
    // Analyze video for thumbnail button
    const analyzeVideoForThumbnailBtn = getElement('analyzeVideoForThumbnail');
    if (analyzeVideoForThumbnailBtn) {
        analyzeVideoForThumbnailBtn.addEventListener('click', function() {
            console.log('Analyze video for thumbnail button clicked');
            if (ThumbnailGeneratorModule && typeof ThumbnailGeneratorModule.analyzeVideoForThumbnail === 'function') {
                ThumbnailGeneratorModule.analyzeVideoForThumbnail();
            } else {
                console.error('ThumbnailGeneratorModule or analyzeVideoForThumbnail function not available');
                _showNotification('Video analysis feature not available', 'error');
            }
        });
    }
}

// Tab Management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Update API status indicators
            updateApiStatusIndicators();
        });
    });
    
    // API Configuration Navigation
    document.querySelectorAll('.go-to-config').forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            // Switch to the target tab
            document.querySelector(`.tab-btn[data-tab="${targetTab}"]`).click();
        });
    });
    
    // Initialize API status indicators
    updateApiStatusIndicators();
    
    // Set up API configuration listeners
    setupApiConfigurationListeners();
});

// API Configuration Management
function setupApiConfigurationListeners() {
    // YouTube API Configuration
    const youtubeApiKeyInput = document.getElementById('apiKeyInput');
    const saveYoutubeApiBtn = document.getElementById('saveApiKey');
    
    if (saveYoutubeApiBtn) {
        saveYoutubeApiBtn.addEventListener('click', () => {
            const apiKey = youtubeApiKeyInput.value.trim();
            if (apiKey) {
                saveApiKey('youtube', apiKey);
            }
        });
    }
    
    // Keyword API Configuration
    const keywordApiKeyInput = document.getElementById('keywordApiKey');
    const saveKeywordApiBtn = document.getElementById('saveKeywordApiKey');
    
    if (saveKeywordApiBtn) {
        saveKeywordApiBtn.addEventListener('click', () => {
            const apiKey = keywordApiKeyInput.value.trim();
            if (apiKey) {
                saveApiKey('keyword', apiKey);
            }
        });
    }
    
    // OpenAI API Configuration
    const openaiApiKeyInput = document.getElementById('openaiApiKey');
    const saveOpenaiApiBtn = document.getElementById('saveOpenaiApiKey');
    
    if (saveOpenaiApiBtn) {
        saveOpenaiApiBtn.addEventListener('click', () => {
            const apiKey = openaiApiKeyInput.value.trim();
            if (apiKey) {
                saveApiKey('openai', apiKey);
            }
        });
    }
}

// Save API Key to Storage
function saveApiKey(apiType, apiKey) {
    chrome.storage.local.get(['apiKeys', 'apiStatus'], function(result) {
        const apiKeys = result.apiKeys || {};
        const apiStatus = result.apiStatus || {};
        
        // Save the API key
        apiKeys[apiType] = apiKey;
        apiStatus[apiType] = true;
        
        // Update storage
        chrome.storage.local.set({
            apiKeys: apiKeys,
            apiStatus: apiStatus
        }, function() {
            // Show success notification
            showNotification('API key saved successfully!', 'success');
            
            // Update status indicators
            updateApiStatusIndicators();
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
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

// Export functions for use in other modules
window.YouTubeSEOBooter = {
    updateApiStatusIndicators,
    saveApiKey,
    showNotification
};

// Settings Management
function setupSettings() {
    // General Settings
    const themeSelect = document.getElementById('themeSelect');
    const languageSelect = document.getElementById('languageSelect');
    const autoStart = document.getElementById('autoStart');

    // Analytics Settings
    const dataDepth = document.getElementById('dataDepth');
    const autoUpdate = document.getElementById('autoUpdate');
    const retentionInterval = document.getElementById('retentionInterval');

    // Content Settings
    const titleTemplate = document.getElementById('titleTemplate');
    const descriptionTemplate = document.getElementById('descriptionTemplate');
    const autoApplySuggestions = document.getElementById('autoApplySuggestions');

    // Privacy & Data Settings
    const dataRetention = document.getElementById('dataRetention');
    const anonymizeData = document.getElementById('anonymizeData');
    const clearCache = document.getElementById('clearCache');
    const exportData = document.getElementById('exportData');
    const resetLayout = document.getElementById('resetLayout');

    // Display Settings
    const displayQuickActions = document.getElementById('displayQuickActions');
    const displayActivityLog = document.getElementById('displayActivityLog');

    // Notification Settings
    const enableNotifications = document.getElementById('enableNotifications');
    const notificationSound = document.getElementById('notificationSound');
    const notificationDuration = document.getElementById('notificationDuration');

    // Load saved settings
    chrome.storage.sync.get([
        'theme',
        'language',
        'autoStart',
        'dataDepth',
        'autoUpdate',
        'retentionInterval',
        'titleTemplate',
        'descriptionTemplate',
        'autoApplySuggestions',
        'dataRetention',
        'anonymizeData',
        'displayQuickActions',
        'displayActivityLog',
        'enableNotifications',
        'notificationSound',
        'notificationDuration'
    ], function(items) {
        // General Settings
        if (themeSelect && items.theme) themeSelect.value = items.theme;
        if (languageSelect && items.language) languageSelect.value = items.language;
        if (autoStart && items.autoStart !== undefined) autoStart.checked = items.autoStart;

        // Analytics Settings
        if (dataDepth && items.dataDepth) dataDepth.value = items.dataDepth;
        if (autoUpdate && items.autoUpdate !== undefined) autoUpdate.checked = items.autoUpdate;
        if (retentionInterval && items.retentionInterval) retentionInterval.value = items.retentionInterval;

        // Content Settings
        if (titleTemplate && items.titleTemplate) titleTemplate.value = items.titleTemplate;
        if (descriptionTemplate && items.descriptionTemplate) descriptionTemplate.value = items.descriptionTemplate;
        if (autoApplySuggestions && items.autoApplySuggestions !== undefined) autoApplySuggestions.checked = items.autoApplySuggestions;

        // Privacy & Data Settings
        if (dataRetention && items.dataRetention) dataRetention.value = items.dataRetention;
        if (anonymizeData && items.anonymizeData !== undefined) anonymizeData.checked = items.anonymizeData;

        // Display Settings
        if (displayQuickActions && items.displayQuickActions !== undefined) displayQuickActions.checked = items.displayQuickActions;
        if (displayActivityLog && items.displayActivityLog !== undefined) displayActivityLog.checked = items.displayActivityLog;

        // Notification Settings
        if (enableNotifications && items.enableNotifications !== undefined) enableNotifications.checked = items.enableNotifications;
        if (notificationSound && items.notificationSound !== undefined) notificationSound.checked = items.notificationSound;
        if (notificationDuration && items.notificationDuration) notificationDuration.value = items.notificationDuration;
    });

    // Save settings on change
    const settingsElements = [
        themeSelect, languageSelect, autoStart,
        dataDepth, autoUpdate, retentionInterval,
        titleTemplate, descriptionTemplate, autoApplySuggestions,
        dataRetention, anonymizeData,
        displayQuickActions, displayActivityLog,
        enableNotifications, notificationSound, notificationDuration
    ].filter(Boolean); // Remove any null elements

    settingsElements.forEach(element => {
        if (element) {
            element.addEventListener('change', function() {
                const settingName = this.id;
                let value = this.type === 'checkbox' ? this.checked : this.value;
                
                // Handle numeric inputs
                if (this.type === 'number') {
                    value = parseInt(value);
                }

                chrome.storage.sync.set({ [settingName]: value }, function() {
                    showNotification('Settings saved successfully');
                });
            });
        }
    });

    // Handle special actions
    if (clearCache) {
        clearCache.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all cached data? This action cannot be undone.')) {
                chrome.storage.local.clear(function() {
                    showNotification('Cache cleared successfully');
                });
            }
        });
    }

    if (exportData) {
        exportData.addEventListener('click', function() {
            chrome.storage.local.get(null, function(items) {
                const dataStr = JSON.stringify(items, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = 'youtube-seo-booster-data.json';
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
            });
        });
    }

    if (resetLayout) {
        resetLayout.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all display settings to default?')) {
                const defaultSettings = {
                    displayQuickActions: true,
                    displayActivityLog: true,
                    popupWidth: 7200
                };
                
                chrome.storage.sync.set(defaultSettings, function() {
                    // Reload the settings
                    setupSettings();
                    showNotification('Display settings reset to default');
                });
            }
        });
    }
}

// Initialize settings when the popup opens
document.addEventListener('DOMContentLoaded', function() {
    setupSettings();
});

// API Status Management - Moved outside to make it globally accessible
function updateApiStatusIndicators() {
    // Get API status from storage
    chrome.storage.local.get(['apiStatus'], function(result) {
        const apiStatus = result.apiStatus || {};
        
        // Update status badges
        updateStatusBadge('youtubeApiStatus', apiStatus.youtube);
        updateStatusBadge('analyticsApiStatus', apiStatus.analytics);
        updateStatusBadge('keywordApiStatus', apiStatus.keyword);
        updateStatusBadge('openaiApiStatus', apiStatus.openai);
        updateStatusBadge('socialApiStatus', apiStatus.social);
    });
}

function updateStatusBadge(elementId, status) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = status ? 'Connected' : 'Not Configured';
        element.classList.remove('connected', 'disconnected');
        element.classList.add(status ? 'connected' : 'disconnected');
    }
}