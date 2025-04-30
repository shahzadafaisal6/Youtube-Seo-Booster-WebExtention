// Wait for main.js to load and initialize modules
function loadSocialTabs() {
    console.log('Attempting to load social-tabs.js...');
    
    // Check if SocialModule is available on the window object
    if (typeof window.SocialModule !== 'undefined') {
        console.log('SocialModule is available, initializing social tabs');
        
        // Instead of dynamically loading the script, import it directly
        import('./social-tabs.js')
            .then(() => {
                console.log('Social tabs module loaded successfully');
            })
            .catch(error => {
                console.error('Error loading social-tabs.js:', error);
                // Try to initialize social tabs manually
                if (typeof setupSocialPlatformTabs === 'function') {
                    setupSocialPlatformTabs();
                    initializePlatformButtons();
                    initializePlatformStatus();
                    initializeDirectShareButtons();
                    initializeAutoDetectForShare();
                    initializeSetupGuideLink();
                }
            });
    } else {
        console.log('SocialModule not available yet, retrying in 1 second...');
        setTimeout(loadSocialTabs, 1000);
    }
}

// Start the loading process
setTimeout(loadSocialTabs, 1000);