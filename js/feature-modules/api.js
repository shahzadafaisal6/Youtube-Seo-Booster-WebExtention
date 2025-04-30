/**
 * API Module for YouTube SEO Booster
 * Handles all API-related functionality
 */

// Use global utility functions instead of importing them
// This prevents duplicate declarations

// Create ApiModule object
const ApiModule = {
    saveApiKey,
    testApiKey,
    fetchYouTubeData,
    fetchCompetitorData,
    updateLastUpdated
};

// Ensure ApiModule is available globally
if (typeof window !== 'undefined') {
    window.ApiModule = ApiModule;
    console.log('ApiModule attached to window object');
}

// Export for ES modules
try {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { ApiModule };
    } else if (typeof exports !== 'undefined') {
        exports.ApiModule = ApiModule;
    }
} catch (e) {
    console.log('ES module export not available, using window object only');
}

/**
 * Save YouTube API key
 */
function saveApiKey() {
    console.log('saveApiKey function called');
    const apiKeyInput = document.getElementById('apiKeyInput');
    
    if (!apiKeyInput) {
        console.error('API key input element not found');
        if (window.showNotification) {
            window.showNotification('Error: API key input not found', 'error');
        }
        return;
    }
    
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        console.warn('No API key provided');
        if (window.showNotification) {
            window.showNotification('Please enter an API key', 'warning');
        }
        return;
    }
    
    console.log('Saving API key to storage');
    // Save with both keys for backward compatibility
    chrome.storage.local.set({ 
        apiKey: apiKey,
        youtubeApiKey: apiKey 
    }, function() {
        if (chrome.runtime.lastError) {
            console.error('Error saving API key:', chrome.runtime.lastError);
            if (window.showNotification) {
                window.showNotification('Error saving API key: ' + chrome.runtime.lastError.message, 'error');
            }
            return;
        }
        
        console.log('API key saved successfully');
        if (window.showNotification) {
            window.showNotification('API key saved successfully!', 'success');
        }
        if (window.logActivity) {
            window.logActivity('Saved YouTube API key');
        }
        
        // Update API status
        const apiStatus = document.getElementById('apiStatus');
        if (apiStatus) {
            apiStatus.textContent = 'API Key: Saved';
            apiStatus.className = 'api-status saved';
        }
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
        
        window.showNotification('Testing API key...', 'info');
        
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
                
                window.showNotification('API key is valid!', 'success');
                window.logActivity('Tested YouTube API key successfully');
                
                // Update UI to show API key is valid
                document.getElementById('apiStatus').textContent = 'API Key: Valid';
                document.getElementById('apiStatus').className = 'api-status valid';
            })
            .catch(error => {
                window.showNotification('API key error: ' + error.message, 'error');
                window.logActivity('API key test failed: ' + error.message, 'error');
                
                // Update UI to show API key is invalid
                document.getElementById('apiStatus').textContent = 'API Key: Invalid';
                document.getElementById('apiStatus').className = 'api-status invalid';
            });
    });
}

/**
 * Fetch data from YouTube API
 */
async function fetchYouTubeData(endpoint, params) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['apiKey', 'youtubeApiKey'], async function(result) {
            // Try both keys for backward compatibility
            const apiKey = result.apiKey || result.youtubeApiKey;
            
            if (!apiKey) {
                window.showNotification('No API key found. Please save an API key first.', 'warning');
                reject(new Error('No API key found. Please save an API key first.'));
                return;
            }
            
            // Build URL with parameters
            const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
            
            // Add API key
            url.searchParams.append('key', apiKey);
            
            // Add other parameters
            for (const [key, value] of Object.entries(params)) {
                url.searchParams.append(key, value);
            }
            
            try {
                console.log(`Fetching data from YouTube API: ${url.toString().replace(apiKey, '[REDACTED]')}`);
                
                const response = await fetch(url.toString());
                
                if (!response.ok) {
                    const errorData = await response.json();
                    const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
                    console.error('YouTube API error:', errorMessage);
                    window.showNotification('YouTube API error: ' + errorMessage, 'error');
                    throw new Error(errorMessage);
                }
                
                const data = await response.json();
                console.log('YouTube API response:', data);
                
                // Save current video data if this is a video request
                if (endpoint === 'videos' && data.items && data.items.length > 0) {
                    chrome.storage.local.set({ currentVideoData: data.items[0] });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error fetching YouTube data:', error);
                reject(error);
            }
        });
    });
}

/**
 * Fetch competitor data
 */
async function fetchCompetitorData() {
    const keyword = document.getElementById('competitorKeyword').value.trim();
    
    if (!keyword) {
        window.showNotification('Please enter a keyword to find competitors', 'warning');
        return;
    }
    
    const resultsContainer = document.getElementById('competitorResults');
    
    if (!resultsContainer) {
        window.showNotification('Results container not found', 'error');
        return;
    }
    
    // Show loading indicator
    resultsContainer.innerHTML = '<div class="loading">Searching for competitors...</div>';
    
    try {
        // Search for videos with the keyword
        const searchData = await fetchYouTubeData('search', {
            part: 'snippet',
            maxResults: 10,
            q: keyword,
            type: 'video',
            order: 'viewCount'
        });
        
        if (!searchData.items || searchData.items.length === 0) {
            resultsContainer.innerHTML = '<p>No results found for this keyword.</p>';
            return;
        }
        
        // Get video IDs
        const videoIds = searchData.items.map(item => item.id.videoId).join(',');
        
        // Fetch detailed video data
        const videoData = await fetchYouTubeData('videos', {
            part: 'snippet,statistics,contentDetails',
            id: videoIds
        });
        
        // Display results
        displayCompetitorResults(videoData.items, keyword);
        
        // Log activity
        window.logActivity(`Found ${videoData.items.length} competitors for keyword: ${keyword}`);
    } catch (error) {
        resultsContainer.innerHTML = `<p class="error">Error fetching competitor data: ${error.message}</p>`;
        console.error('Error fetching competitor data:', error);
    }
}

/**
 * Display competitor results
 */
function displayCompetitorResults(videos, keyword) {
    const resultsContainer = document.getElementById('competitorResults');
    
    if (!resultsContainer || !videos || videos.length === 0) {
        return;
    }
    
    // Create HTML for results
    let resultsHTML = `
        <h3>Top Competitors for "${keyword}"</h3>
        <p>Analyzing top ${videos.length} videos by view count</p>
        <div class="competitor-list">
    `;
    
    // Add each competitor
    videos.forEach(video => {
        const { snippet, statistics, contentDetails } = video;
        
        // Format numbers
        const formattedViews = formatNumber(statistics.viewCount || 0);
        const formattedLikes = formatNumber(statistics.likeCount || 0);
        const formattedComments = formatNumber(statistics.commentCount || 0);
        
        // Calculate engagement rate
        const engagementRate = calculateEngagementRate(statistics);
        
        // Format date
        const publishedAt = new Date(snippet.publishedAt).toLocaleDateString();
        
        // Format duration
        const duration = formatDuration(contentDetails.duration);
        
        // Add to HTML
        resultsHTML += `
            <div class="competitor-card">
                <div class="competitor-thumbnail">
                    <img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}">
                    <span class="video-duration">${duration}</span>
                </div>
                <div class="competitor-details">
                    <h4><a href="https://www.youtube.com/watch?v=${video.id}" target="_blank">${snippet.title}</a></h4>
                    <p class="channel-name">${snippet.channelTitle}</p>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Views</span>
                            <span class="stat-value">${formattedViews}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Likes</span>
                            <span class="stat-value">${formattedLikes}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Comments</span>
                            <span class="stat-value">${formattedComments}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Engagement</span>
                            <span class="stat-value">${engagementRate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Published</span>
                            <span class="stat-value">${publishedAt}</span>
                        </div>
                    </div>
                </div>
                <div class="competitor-keywords">
                    <h5>Keywords</h5>
                    <div class="keyword-list">
                        ${extractKeywordsFromTitle(snippet.title).map(keyword => 
                            `<span class="keyword-tag">${keyword}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    
    // Add competitor insights
    resultsHTML += `
        </div>
        <div class="competitor-insights">
            <h3>Competitor Insights</h3>
            ${generateCompetitorInsights(videos)}
        </div>
    `;
    
    // Update container
    resultsContainer.innerHTML = resultsHTML;
}

/**
 * Generate competitor insights
 */
function generateCompetitorInsights(videos) {
    if (!videos || videos.length === 0) {
        return '<p>No data available for insights.</p>';
    }
    
    // Calculate averages
    const totalViews = videos.reduce((sum, video) => sum + parseInt(video.statistics.viewCount || 0), 0);
    const totalLikes = videos.reduce((sum, video) => sum + parseInt(video.statistics.likeCount || 0), 0);
    const totalComments = videos.reduce((sum, video) => sum + parseInt(video.statistics.commentCount || 0), 0);
    
    const avgViews = Math.round(totalViews / videos.length);
    const avgLikes = Math.round(totalLikes / videos.length);
    const avgComments = Math.round(totalComments / videos.length);
    
    // Calculate average engagement rate
    const avgEngagementRate = (((totalLikes + totalComments) / totalViews) * 100).toFixed(2);
    
    // Extract and count keywords
    const keywordCounts = {};
    
    videos.forEach(video => {
        const keywords = extractKeywordsFromTitle(video.snippet.title);
        
        keywords.forEach(keyword => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
    });
    
    // Sort keywords by frequency
    const sortedKeywords = Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    // Calculate average video length
    const avgDurationSeconds = videos.reduce((sum, video) => {
        return sum + parseDuration(video.contentDetails.duration);
    }, 0) / videos.length;
    
    const avgDuration = formatTime(Math.round(avgDurationSeconds));
    
    // Build insights HTML
    return `
        <div class="insights-grid">
            <div class="insight-card">
                <h4>Average Performance</h4>
                <div class="insight-stats">
                    <div class="insight-stat">
                        <span class="stat-label">Views</span>
                        <span class="stat-value">${formatNumber(avgViews)}</span>
                    </div>
                    <div class="insight-stat">
                        <span class="stat-label">Likes</span>
                        <span class="stat-value">${formatNumber(avgLikes)}</span>
                    </div>
                    <div class="insight-stat">
                        <span class="stat-label">Comments</span>
                        <span class="stat-value">${formatNumber(avgComments)}</span>
                    </div>
                    <div class="insight-stat">
                        <span class="stat-label">Engagement</span>
                        <span class="stat-value">${avgEngagementRate}%</span>
                    </div>
                </div>
            </div>
            
            <div class="insight-card">
                <h4>Popular Keywords</h4>
                <div class="top-keywords">
                    ${sortedKeywords.map(([keyword, count]) => 
                        `<div class="keyword-frequency">
                            <span class="keyword">${keyword}</span>
                            <span class="frequency">${count}/${videos.length}</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
            
            <div class="insight-card">
                <h4>Content Insights</h4>
                <div class="content-insights">
                    <div class="insight-item">
                        <span class="insight-label">Average Length</span>
                        <span class="insight-value">${avgDuration}</span>
                    </div>
                    <div class="insight-tips">
                        <h5>Recommendations</h5>
                        <ul>
                            <li>Aim for videos around ${avgDuration} long, matching competitor length</li>
                            <li>Include the top keywords in your title and description</li>
                            <li>Target a minimum engagement rate of ${avgEngagementRate}%</li>
                            <li>Study the thumbnails of top performers for design ideas</li>
                            <li>Consider the publishing frequency of top channels</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Extract keywords from title
 */
function extractKeywordsFromTitle(title) {
    if (!title) return [];
    
    // Convert to lowercase and remove special characters
    const cleanTitle = title.toLowerCase().replace(/[^\w\s]/g, ' ');
    
    // Split into words
    const words = cleanTitle.split(/\s+/);
    
    // Remove common stop words
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
                      'has', 'have', 'had', 'be', 'been', 'being', 'do', 'does', 'did',
                      'will', 'would', 'should', 'can', 'could', 'may', 'might', 'must',
                      'shall', 'should', 'to', 'of', 'in', 'for', 'on', 'by', 'at', 'with'];
    
    const filteredWords = words.filter(word => word.length > 3 && !stopWords.includes(word));
    
    // Extract potential phrases (2-3 words)
    const phrases = [];
    for (let i = 0; i < words.length - 1; i++) {
        if (!stopWords.includes(words[i]) && words[i].length > 3) {
            // Two-word phrases
            if (!stopWords.includes(words[i+1]) && words[i+1].length > 3) {
                phrases.push(words[i] + ' ' + words[i+1]);
            }
        }
    }
    
    // Combine individual words and phrases
    return [...new Set([...filteredWords.slice(0, 5), ...phrases.slice(0, 3)])];
}

/**
 * Calculate engagement rate
 */
function calculateEngagementRate(statistics) {
    if (!statistics.viewCount || parseInt(statistics.viewCount) === 0) return '0.00';
    
    const views = parseInt(statistics.viewCount);
    const likes = parseInt(statistics.likeCount || 0);
    const comments = parseInt(statistics.commentCount || 0);
    
    // Engagement rate formula: (likes + comments) / views * 100
    const engagementRate = ((likes + comments) / views) * 100;
    
    return engagementRate.toFixed(2);
}

/**
 * Parse ISO 8601 duration to seconds
 */
function parseDuration(isoDuration) {
    if (!isoDuration) return 0;
    
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    if (!match) return 0;
    
    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
    
    return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format seconds to time string
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

/**
 * Format duration from ISO 8601 to human-readable format
 */
function formatDuration(isoDuration) {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    if (!match) return '0:00';
    
    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
    
    let result = '';
    
    if (hours > 0) {
        result += `${hours}:`;
        result += `${minutes < 10 ? '0' : ''}${minutes}:`;
    } else {
        result += `${minutes}:`;
    }
    
    result += `${seconds < 10 ? '0' : ''}${seconds}`;
    
    return result;
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

/**
 * Update the last updated timestamp
 */
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('lastUpdated');
    
    if (lastUpdatedElement) {
        const now = new Date();
        lastUpdatedElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
}

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