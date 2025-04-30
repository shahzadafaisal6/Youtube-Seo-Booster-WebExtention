/**
 * Tools Module for YouTube SEO Booster
 * Handles utility functions and download features
 */

// Use global utility functions instead of importing them

// Create ToolsModule object
const ToolsModule = {
    toggleDownloadOptions,
    downloadVideo,
    exportData,
    importData,
    detectCurrentYouTubeVideo
};

// Export for ES modules
export { ToolsModule };

/**
 * Toggle download options display
 */
function toggleDownloadOptions() {
    const downloadOptions = document.getElementById('downloadOptions');
    
    if (!downloadOptions) {
        window.showNotification('Download options panel not found', 'error');
        return;
    }
    
    // Toggle display
    if (downloadOptions.style.display === 'block') {
        downloadOptions.style.display = 'none';
    } else {
        downloadOptions.style.display = 'block';
        
        // Check if we have a video ID
        const videoId = document.getElementById('videoId').value.trim();
        
        if (!videoId) {
            document.getElementById('downloadMessage').textContent = 'Enter a video ID or URL first to enable download.';
            document.getElementById('downloadButton').disabled = true;
        } else {
            const extractedId = extractVideoId(videoId);
            
            if (extractedId) {
                document.getElementById('downloadMessage').textContent = 'Select quality and click Download.';
                document.getElementById('downloadButton').disabled = false;
            } else {
                document.getElementById('downloadMessage').textContent = 'Invalid YouTube URL or video ID.';
                document.getElementById('downloadButton').disabled = true;
            }
        }
    }
}

/**
 * Download YouTube video
 */
function downloadVideo() {
    const videoId = document.getElementById('videoId').value.trim();
    const qualitySelect = document.getElementById('downloadQuality');
    
    if (!videoId || !qualitySelect) {
        window.showNotification('Video ID or quality selection not found', 'error');
        return;
    }
    
    const extractedId = extractVideoId(videoId);
    
    if (!extractedId) {
        window.showNotification('Invalid YouTube URL or video ID', 'error');
        return;
    }
    
    const quality = qualitySelect.value;
    
    // Show notification
    window.showNotification(`Starting download for ${extractedId} in ${quality} quality...`, 'info');
    
    // This is a placeholder for actual download functionality
    // In a real extension, this would connect to a server-side API or use a third-party service
    
    // For demonstration, simulate a download
    setTimeout(() => {
        simulateDownload(extractedId, quality);
    }, 2000);
}

/**
 * Simulate download (for demonstration)
 */
function simulateDownload(videoId, quality) {
    const downloadProgress = document.getElementById('downloadProgress');
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    downloadProgress.innerHTML = '<p>Downloading video...</p>';
    downloadProgress.appendChild(progressBar);
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            downloadProgress.innerHTML = '<p>Download complete! (Note: This is a simulation, no actual file was downloaded)</p>';
            
            // Log activity
            window.logActivity(`Simulated download of video ${videoId} in ${quality} quality`);
            
            // In a real extension, you would have code here to actually download the file
            // using a server-side API or a third-party service
        }
    }, 200);
}

/**
 * Export extension data
 */
function exportData() {
    // Retrieve all data from chrome.storage.local
    chrome.storage.local.get(null, function(data) {
        // Convert to JSON
        const jsonData = JSON.stringify(data, null, 2);
        
        // Create a blob with the data
        const blob = new Blob([jsonData], { type: 'application/json' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `youtube-seo-booster-export-${new Date().toISOString().split('T')[0]}.json`;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
        
        // Show notification
        window.showNotification('Data exported successfully!', 'success');
        window.logActivity('Exported extension data to JSON file');
    });
}

/**
 * Import extension data
 */
function importData() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // Handle file selection
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        if (!file) {
            window.showNotification('No file selected', 'error');
            return;
        }
        
        // Read the file
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!importedData || typeof importedData !== 'object') {
                    throw new Error('Invalid data format');
                }
                
                // Confirm import
                if (confirm('This will overwrite your current settings. Continue?')) {
                    // Save to chrome.storage.local
                    chrome.storage.local.set(importedData, function() {
                        if (chrome.runtime.lastError) {
                            window.showNotification('Error importing data: ' + chrome.runtime.lastError.message, 'error');
                        } else {
                            window.showNotification('Data imported successfully!', 'success');
                            window.logActivity('Imported extension data from JSON file');
                            
                            // Refresh the current view
                            location.reload();
                        }
                    });
                }
            } catch (error) {
                window.showNotification('Error parsing file: ' + error.message, 'error');
            }
        };
        
        reader.onerror = function() {
            window.showNotification('Error reading file', 'error');
        };
        
        reader.readAsText(file);
    });
    
    // Trigger file selection
    document.body.appendChild(fileInput);
    fileInput.click();
    
    // Clean up
    setTimeout(function() {
        document.body.removeChild(fileInput);
    }, 0);
}

/**
 * Detect current YouTube video if extension is opened from a YouTube page
 */
function detectCurrentYouTubeVideo() {
    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (chrome.runtime.lastError) {
            console.error('Error querying tabs:', chrome.runtime.lastError);
            return;
        }
        
        const currentTab = tabs[0];
        
        if (!currentTab) {
            console.log('No active tab found');
            return;
        }
        
        const url = currentTab.url;
        
        // Check if the URL is a YouTube video
        const videoId = extractVideoId(url);
        
        if (videoId) {
            // Populate the video ID input
            const videoIdInput = document.getElementById('videoId');
            
            if (videoIdInput) {
                videoIdInput.value = videoId;
                
                window.logActivity(`Detected YouTube video: ${videoId}`);
                
                // Check if we have an API key
                chrome.storage.local.get(['apiKey'], function(result) {
                    if (result.apiKey) {
                        // Auto-fetch metrics if we have an API key
                        const fetchButton = document.getElementById('fetchMetrics');
                        
                        if (fetchButton) {
                            fetchButton.click();
                        }
                    }
                });
            }
        }
    });
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

// Using global showNotification function

/**
 * Log activity
 */
function logActivity(message, type = 'info') {
    const activityLog = document.getElementById('activityLog');
    
    if (!activityLog) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `<span class="log-time">${timestamp}</span> ${message}`;
    
    // Add to the beginning of the list
    activityLog.insertBefore(logEntry, activityLog.firstChild);
}

// Assign to window object
window.logActivity = logActivity; 