// Background script for YouTube SEO Booster

chrome.runtime.onInstalled.addListener(() => {
    console.log('YouTube SEO Booster installed.');
    // Initialize storage with default values if needed
    chrome.storage.local.get(['youtubeApiKey'], (result) => {
        if (!result.youtubeApiKey) {
            chrome.storage.local.set({ youtubeApiKey: '' });
        }
    });
});

// Helper function to get API key
async function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['youtubeApiKey'], (result) => {
            resolve(result.youtubeApiKey || '');
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchMetrics') {
        const videoId = request.videoId;
        getApiKey().then(apiKey => {
            if (!apiKey) {
                sendResponse({ 
                    status: 'error', 
                    message: 'YouTube API key not configured. Please set it in the dashboard settings.' 
                });
                return;
            }

            fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.items && data.items.length > 0) {
                        sendResponse({ status: 'success', data: data.items[0] });
                    } else {
                        sendResponse({ status: 'error', message: 'No video data found' });
                    }
                })
                .catch(error => {
                    sendResponse({ status: 'error', message: error.message });
                });
        });
        return true; // Keep the message channel open for sendResponse
    } 
    else if (request.action === 'getKeywords') {
        const query = request.query;
        getApiKey().then(apiKey => {
            if (!apiKey) {
                sendResponse({ 
                    status: 'error', 
                    message: 'YouTube API key not configured. Please set it in the dashboard settings.' 
                });
                return;
            }

            fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=10&key=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.items) {
                        sendResponse({ status: 'success', data: data.items });
                    } else {
                        sendResponse({ status: 'error', message: 'No keywords found' });
                    }
                })
                .catch(error => {
                    sendResponse({ status: 'error', message: error.message });
                });
        });
        return true; // Keep the message channel open for sendResponse
    }
    else if (request.action === 'analyzeVideo') {
        // Forward to dashboard with video data
        chrome.tabs.create({ 
            url: chrome.runtime.getURL("fullpage.html") + "?video=" + encodeURIComponent(JSON.stringify(request.videoData))
        });
    }
});

// Open full dashboard when extension icon is clicked
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("fullpage.html") });
});

// Add any additional background tasks or listeners here 