/**
 * Fullpage JavaScript for YouTube SEO Booster
 * Handles the fullpage interface functionality
 */

import './utils.js'; // Importing the utilities module first
import './js/main.js'; // Import main.js to load all modules

// Ensure _showNotification is defined
window._showNotification = window.showNotification;

// Removed the local definition of showNotification and logActivity as they are now in utils.js

// Import utility functions
import { safeGetElement, safeQuerySelector, safeQuerySelectorAll, safeAddEventListener, showNotification, logActivity } from './utils.js';

// Initialize the fullpage interface
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fullpage DOM loaded, initializing...');
    
    // Tab switching functionality
    const sidebarButtons = safeQuerySelectorAll('.sidebar-btn');
    const tabPanes = safeQuerySelectorAll('.tab-pane');

    
    sidebarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active button
            sidebarButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `${tabName}-tab`) {
                    pane.classList.add('active');
                }
            });
            
            // Log activity
            window.logActivity(`Switched to ${tabName} tab`);
        });
    });
    
    // Initialize API status
    chrome.storage.local.get(['apiKey', 'lastUpdated'], function(result) {
        const apiStatus = safeGetElement('apiStatus');
        const lastUpdated = safeGetElement('lastUpdated');

        
        if (result.apiKey) {
            apiStatus.innerHTML = '<i class="fas fa-plug"></i> API Key: Connected';
            apiStatus.classList.add('connected');
        }
        
        if (result.lastUpdated) {
            const date = new Date(result.lastUpdated);
            lastUpdated.innerHTML = `<i class="fas fa-clock"></i> Last updated: ${date.toLocaleString()}`;
        }
    });
    
    // Analytics tab functionality - wait for modules to be loaded
    setTimeout(() => {
        const fetchMetricsBtn = document.getElementById('fetchMetrics');
        if (fetchMetricsBtn) {
            fetchMetricsBtn.addEventListener('click', function() {
                console.log('Fetch metrics button clicked');
                console.log('AnalyticsModule available:', !!window.AnalyticsModule);
                console.log('fetchVideoMetrics function available:', window.AnalyticsModule && typeof window.AnalyticsModule.fetchVideoMetrics === 'function');
                
                if (window.AnalyticsModule && typeof window.AnalyticsModule.fetchVideoMetrics === 'function') {
                    console.log('Calling AnalyticsModule.fetchVideoMetrics()');
                    window.AnalyticsModule.fetchVideoMetrics();
                } else {
                    // Fallback to direct function call if module not available
                    console.log('AnalyticsModule not available, trying direct function call');
                    if (typeof fetchVideoMetrics === 'function') {
                        console.log('Calling fetchVideoMetrics() directly');
                        fetchVideoMetrics();
                    } else {
                        console.error('Both AnalyticsModule and direct function call unavailable');
                        showNotification('Analytics module not loaded properly. Please refresh the page and try again.', 'error');
                    }
                }
            });
        } else {
            console.error('Fetch metrics button not found in the DOM');
        }
        
        const fetchRetentionBtn = document.getElementById('fetchRetention');
        if (fetchRetentionBtn) {
            fetchRetentionBtn.addEventListener('click', function() {
                if (window.AnalyticsModule && typeof window.AnalyticsModule.fetchRetentionData === 'function') {
                    window.AnalyticsModule.fetchRetentionData();
                } else {
                    // Fallback to direct function call if module not available
                    if (typeof fetchRetentionData === 'function') {
                        fetchRetentionData();
                    } else {
                        window.showNotification('Analytics module not loaded properly', 'error');
                    }
                }
            });
        }
        
        const saveSnapshotBtn = document.getElementById('saveSnapshot');
        if (saveSnapshotBtn) {
            saveSnapshotBtn.addEventListener('click', function() {
                if (window.AnalyticsModule && typeof window.AnalyticsModule.savePerformanceSnapshot === 'function') {
                    window.AnalyticsModule.savePerformanceSnapshot();
                } else {
                    // Fallback to direct function call if module not available
                    if (typeof savePerformanceSnapshot === 'function') {
                        savePerformanceSnapshot();
                    } else {
                        window.showNotification('Analytics module not loaded properly', 'error');
                    }
                }
            });
        }
    }, 1000); // Give modules time to load
    
    // Global search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('globalSearch');
    
if (searchBtn && searchInput) {
    safeAddEventListener(searchBtn, 'click', function() {
        const query = searchInput.value.trim();
        if (query) {
            performGlobalSearch(query);
        }
    });
    
    safeAddEventListener(searchInput, 'keypress', function(e) {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                performGlobalSearch(query);
            }
        }
    });
}

    
    // Load modules
    loadModules();
});

// Load all feature modules
function loadModules() {
    // This function will be called after all modules are loaded via main.js
    // We need to wait for the modules to be available on the window object
    setTimeout(() => {
        // Check if modules are loaded by checking for specific functions
        const modulesLoaded = [];
        const modulesMissing = [];
        
        // Check for each module
        if (typeof fetchVideoMetrics === 'function' || 
            (window.AnalyticsModule && typeof window.AnalyticsModule.fetchVideoMetrics === 'function')) {
            modulesLoaded.push('Analytics');
        } else {
            modulesMissing.push('Analytics');
        }
        
        if (typeof searchKeywords === 'function' || 
            (window.KeywordsModule && typeof window.KeywordsModule.searchKeywords === 'function')) {
            modulesLoaded.push('Keywords');
        } else {
            modulesMissing.push('Keywords');
        }
        
        if (typeof fetchCompetitorData === 'function' || 
            (window.ApiModule && typeof window.ApiModule.fetchCompetitorData === 'function')) {
            modulesLoaded.push('Competitors');
        } else {
            modulesMissing.push('Competitors');
        }
        
        // Check for Content module
        if (window.AiContentModule) {
            modulesLoaded.push('Content');
        } else {
            modulesMissing.push('Content');
        }
        
        // Check for Thumbnails module
        if (window.ThumbnailGeneratorModule) {
            modulesLoaded.push('Thumbnails');
        } else {
            modulesMissing.push('Thumbnails');
        }
        
        // Check for A/B Testing module
        if (window.ABTestingModule) {
            modulesLoaded.push('A/B Testing');
        } else {
            modulesMissing.push('A/B Testing');
        }
        
        // Check for Social module
        if (window.SocialModule) {
            modulesLoaded.push('Social');
        } else {
            modulesMissing.push('Social');
        }
        
        // Check for Tools module
        if (window.ToolsModule) {
            modulesLoaded.push('Tools');
        } else {
            modulesMissing.push('Tools');
        }
        
        // Check for API Management module
        if (window.ApiManagementModule) {
            modulesLoaded.push('API Management');
        } else {
            modulesMissing.push('API Management');
        }
        
        if (modulesLoaded.length > 0) {
            console.log(`Modules loaded successfully: ${modulesLoaded.join(', ')}`);
            window.showNotification('Dashboard ready', 'success');
            
            if (modulesMissing.length > 0) {
                console.warn(`Some modules failed to load: ${modulesMissing.join(', ')}`);
                window.showNotification('Some features may not be available', 'warning');
            }
        } else {
            console.error('No modules loaded successfully');
            window.showNotification('Error loading modules. Please refresh the page.', 'error');
        }
    }, 3000); // Give more time for modules to load
}

// Global search functionality
function performGlobalSearch(query) {
    window.showNotification(`Searching for: ${query}`, 'info');
    
    // In a real implementation, this would search across all data
    // For now, we'll just log the search
    window.logActivity(`Performed global search for: ${query}`);
    
    // Example implementation could include:
    // - Searching video titles and descriptions
    // - Searching keywords and tags
    // - Searching competitor data
    // - Etc.
}

// Handle messages from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateApiStatus') {
        const apiStatus = document.getElementById('apiStatus');
        if (apiStatus) {
            apiStatus.innerHTML = '<i class="fas fa-plug"></i> API Key: Connected';
            apiStatus.classList.add('connected');
        }
    }
    
    if (request.action === 'updateLastUpdated') {
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated && request.timestamp) {
            const date = new Date(request.timestamp);
            lastUpdated.innerHTML = `<i class="fas fa-clock"></i> Last updated: ${date.toLocaleString()}`;
        }
    }
});
