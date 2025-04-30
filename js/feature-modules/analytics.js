/**
 * Analytics Module for YouTube SEO Booster
 * Handles all metrics and analytics functionality
 */

// Create AnalyticsModule object
const AnalyticsModule = {
    fetchVideoMetrics,
    displayVideoMetrics,
    createPerformanceChart,
    estimateMonetization,
    extractVideoId
};

// Ensure AnalyticsModule is available globally
if (typeof window !== 'undefined') {
    window.AnalyticsModule = AnalyticsModule;
    console.log('AnalyticsModule attached to window object');
}

// Export for ES modules
try {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { AnalyticsModule };
    } else if (typeof exports !== 'undefined') {
        exports.AnalyticsModule = AnalyticsModule;
    }
} catch (e) {
    console.log('ES module export not available, using window object only');
}

/**
 * Fetch and display metrics for a YouTube video
 */
async function fetchVideoMetrics() {
    console.log('fetchVideoMetrics called');
    const videoId = document.getElementById('videoId').value.trim();
    
    if (!videoId) {
        if (window.showNotification) {
            window.showNotification('Please enter a valid YouTube video ID or URL', 'warning');
        } else {
            console.warn('Please enter a valid YouTube video ID or URL');
        }
        return;
    }
    
    // Extract video ID if a full URL was provided
    const extractedId = extractVideoId(videoId);
    
    if (!extractedId) {
        if (window.showNotification) {
            window.showNotification('Invalid YouTube URL or video ID', 'error');
        } else {
            console.error('Invalid YouTube URL or video ID');
        }
        return;
    }
    
    try {
        // Show loading state
        const metricsElement = document.getElementById('videoMetrics');
        const chartElement = document.getElementById('performanceChart');
        
        if (metricsElement) {
            metricsElement.innerHTML = '<div class="loading">Loading video metrics...</div>';
        }
        if (chartElement) {
            chartElement.innerHTML = '';
        }
        
        // Check if ApiModule is available
        if (!window.ApiModule || typeof window.ApiModule.fetchYouTubeData !== 'function') {
            console.error('ApiModule is not available or fetchYouTubeData is not a function');
            if (window.showNotification) {
                window.showNotification('API module not loaded properly. Please refresh the page.', 'error');
            }
            return;
        }
        
        console.log('Fetching video data for ID:', extractedId);
        
        // Fetch video data
        const videoData = await window.ApiModule.fetchYouTubeData('videos', {
            part: 'snippet,statistics,contentDetails',
            id: extractedId
        });
        
        if (!videoData.items || videoData.items.length === 0) {
            if (window.showNotification) {
                window.showNotification('No data found for this video ID', 'error');
            }
            if (metricsElement) {
                metricsElement.innerHTML = '<p>No data found for this video.</p>';
            }
            return;
        }
        
        // Display the metrics
        displayVideoMetrics(videoData.items[0]);
        
        // Create performance chart
        createPerformanceChart(videoData.items[0].statistics);
        
        // Estimate monetization
        estimateMonetization(videoData.items[0]);
        
        if (window.showNotification) {
            window.showNotification('Video metrics loaded successfully', 'success');
        }
        
        if (window.logActivity) {
            window.logActivity(`Fetched metrics for video: ${extractedId}`);
        }
        
        // Use the ApiModule's updateLastUpdated function
        if (window.ApiModule && typeof window.ApiModule.updateLastUpdated === 'function') {
            window.ApiModule.updateLastUpdated();
        }
        
    } catch (error) {
        console.error('Error fetching video metrics:', error);
        if (window.showNotification) {
            window.showNotification('Error fetching video metrics: ' + error.message, 'error');
        }
        if (window.logActivity) {
            window.logActivity(`Error fetching video metrics: ${error.message}`, 'error');
        }
    }
}

/**
 * Display video metrics in the UI
 */
function displayVideoMetrics(videoData) {
    const metricsContainer = document.getElementById('videoMetrics');
    
    if (!metricsContainer) return;
    
    const { snippet, statistics, contentDetails } = videoData;
    
    // Format numbers for better readability
    const formattedViews = formatNumber(statistics.viewCount || 0);
    const formattedLikes = formatNumber(statistics.likeCount || 0);
    const formattedComments = formatNumber(statistics.commentCount || 0);
    
    // Calculate engagement rate
    const engagementRate = calculateEngagementRate(statistics);
    
    // Calculate like rate (likes per 100 views)
    const likeRate = statistics.viewCount > 0 
        ? ((statistics.likeCount / statistics.viewCount) * 100).toFixed(2) 
        : '0.00';
    
    // Calculate comment rate (comments per 100 views)
    const commentRate = statistics.viewCount > 0 
        ? ((statistics.commentCount / statistics.viewCount) * 100).toFixed(2) 
        : '0.00';
    
    // Format the video duration
    const duration = formatDuration(contentDetails.duration);
    
    // Create metrics cards HTML
    const metricsHTML = `
        <div class="metric-card">
            <h3>Views</h3>
            <p>${formattedViews}</p>
        </div>
        <div class="metric-card">
            <h3>Likes</h3>
            <p>${formattedLikes}</p>
        </div>
        <div class="metric-card">
            <h3>Comments</h3>
            <p>${formattedComments}</p>
        </div>
        <div class="metric-card">
            <h3>Published</h3>
            <p>${new Date(snippet.publishedAt).toLocaleDateString()}</p>
        </div>
        <div class="metric-card">
            <h3>Duration</h3>
            <p>${duration}</p>
        </div>
        <div class="metric-card">
            <h3>Engagement Rate</h3>
            <p>${engagementRate}%</p>
        </div>
        <div class="metric-card">
            <h3>Like Rate</h3>
            <p>${likeRate}%</p>
        </div>
        <div class="metric-card">
            <h3>Comment Rate</h3>
            <p>${commentRate}%</p>
        </div>
        <div class="metric-card topics">
            <h3>Category</h3>
            <p>${snippet.categoryId ? getCategoryName(snippet.categoryId) : 'Unknown'}</p>
        </div>
        <div class="metric-card tags">
            <h3>Tags</h3>
            <p>${snippet.tags ? snippet.tags.join(', ') : 'No tags'}</p>
        </div>
    `;
    
    metricsContainer.innerHTML = metricsHTML;
    
    // Show the video thumbnail
    const thumbnailContainer = document.getElementById('thumbnailPreview');
    if (thumbnailContainer) {
        const thumbnailURL = snippet.thumbnails.high ? snippet.thumbnails.high.url : snippet.thumbnails.default.url;
        thumbnailContainer.innerHTML = `<img src="${thumbnailURL}" alt="Video Thumbnail" class="thumbnail-image">`;
    }
}

/**
 * Create performance chart
 */
function createPerformanceChart(statistics) {
    const chartContainer = document.getElementById('performanceChart');
    
    if (!chartContainer) return;
    
    // Clear previous chart if any
    chartContainer.innerHTML = '';
    
    // Create canvas for the chart
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    // Prepare data for the chart
    const data = {
        labels: ['Views', 'Likes', 'Comments'],
        datasets: [{
            label: 'Video Performance',
            data: [
                parseInt(statistics.viewCount || 0),
                parseInt(statistics.likeCount || 0),
                parseInt(statistics.commentCount || 0)
            ],
            backgroundColor: [
                'rgba(255, 0, 0, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)'
            ],
            borderColor: [
                'rgba(255, 0, 0, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    // Chart config
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatShortNumber(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatNumber(context.raw);
                        }
                    }
                }
            }
        }
    };
    
    // Create chart
    new Chart(canvas, config);
}

/**
 * Format large numbers for readability
 */
function formatShortNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num;
}

/**
 * Create audience retention chart and insights
 */
function fetchRetentionData() {
    const videoId = document.getElementById('videoId').value.trim();
    
    if (!videoId) {
        window.showNotification('Please enter a valid YouTube video ID or URL', 'warning');
        return;
    }
    
    // Extract video ID if a full URL was provided
    const extractedId = extractVideoId(videoId);
    
    if (!extractedId) {
        window.showNotification('Invalid YouTube URL or video ID', 'error');
        return;
    }
    
    // Check for API key
    chrome.storage.local.get(['apiKey'], function(result) {
        if (!result.apiKey) {
            window.showNotification('API key required for audience retention analysis', 'error');
            return;
        }
        
        // Show loading indicator
        document.getElementById('retentionChart').innerHTML = '<div class="loading">Loading retention data...</div>';
        
        // Simulate fetching retention data (in a real extension, this would call the YouTube API)
        setTimeout(() => {
            // Mock retention data for visualization
            const retentionData = generateMockRetentionData();
            
            // Display retention chart
            displayRetentionChart(retentionData);
            
            // Display insights based on the data
            generateRetentionInsights(retentionData);
            
            window.logActivity(`Fetched audience retention data for video: ${extractedId}`);
        }, 1500);
    });
}

/**
 * Generate mock retention data for demo purposes
 */
function generateMockRetentionData() {
    const dataPoints = 20; // 20 segments for the video
    const retentionData = [];
    
    let currentRetention = 100; // Start at 100%
    
    for (let i = 0; i < dataPoints; i++) {
        // Gradual decline with some fluctuations
        const decline = Math.random() * 3 + 1; // 1-4% decline per segment
        currentRetention = Math.max(30, currentRetention - decline); // Don't go below 30%
        
        retentionData.push({
            segment: (i / dataPoints * 100).toFixed(0) + '%',
            retention: currentRetention.toFixed(1)
        });
    }
    
    return retentionData;
}

/**
 * Display retention chart
 */
function displayRetentionChart(retentionData) {
    const chartContainer = document.getElementById('retentionChart');
    
    // Clear previous content
    chartContainer.innerHTML = '';
    
    // Create chart elements
    const chartHeader = document.createElement('div');
    chartHeader.className = 'chart-header';
    chartHeader.innerHTML = '<div>Video Progress</div><div>Audience Retained (%)</div>';
    
    const chartBody = document.createElement('div');
    chartBody.className = 'retention-chart-body';
    
    // Add data rows
    retentionData.forEach(point => {
        const row = document.createElement('div');
        row.className = 'retention-row';
        
        const barContainer = document.createElement('div');
        barContainer.className = 'retention-bar-container';
        
        const bar = document.createElement('div');
        bar.className = 'retention-bar';
        bar.style.width = point.retention + '%';
        bar.style.backgroundColor = getRetentionColor(parseFloat(point.retention));
        
        barContainer.appendChild(bar);
        
        row.innerHTML = `
            <div class="segment-label">${point.segment}</div>
            ${barContainer.outerHTML}
            <div class="retention-value">${point.retention}%</div>
        `;
        
        chartBody.appendChild(row);
    });
    
    // Assemble chart
    chartContainer.appendChild(chartHeader);
    chartContainer.appendChild(chartBody);
}

/**
 * Get color for retention bar based on value
 */
function getRetentionColor(value) {
    if (value >= 80) return '#28a745'; // Good - green
    if (value >= 60) return '#17a2b8'; // Decent - blue
    if (value >= 40) return '#ffc107'; // Okay - yellow
    return '#dc3545'; // Poor - red
}

/**
 * Generate insights from retention data
 */
function generateRetentionInsights(retentionData) {
    const insightsContainer = document.getElementById('retentionInsights');
    
    // Clear previous content
    insightsContainer.innerHTML = '';
    
    // Calculate key metrics
    const initialDrop = 100 - parseFloat(retentionData[1].retention);
    const finalRetention = parseFloat(retentionData[retentionData.length - 1].retention);
    
    // Find major drop-offs (segments with more than 5% drop)
    const majorDropoffs = [];
    for (let i = 1; i < retentionData.length; i++) {
        const currentRetention = parseFloat(retentionData[i].retention);
        const previousRetention = parseFloat(retentionData[i-1].retention);
        const drop = previousRetention - currentRetention;
        
        if (drop > 5) {
            majorDropoffs.push({
                segment: retentionData[i].segment,
                drop: drop.toFixed(1)
            });
        }
    }
    
    // Create insights HTML
    let insightsHTML = `
        <h3>Retention Analysis</h3>
        <div class="retention-metrics">
            <div class="retention-metric">
                <span class="metric-label">Initial Drop</span>
                <span class="metric-value ${initialDrop > 15 ? 'negative' : 'positive'}">${initialDrop.toFixed(1)}%</span>
            </div>
            <div class="retention-metric">
                <span class="metric-label">Final Retention</span>
                <span class="metric-value ${finalRetention < 50 ? 'negative' : 'positive'}">${finalRetention}%</span>
            </div>
        </div>
    `;
    
    // Add drop-off points if any
    if (majorDropoffs.length > 0) {
        insightsHTML += '<h4>Major Drop-off Points</h4><ul class="dropoff-list">';
        majorDropoffs.forEach(point => {
            insightsHTML += `<li>At ${point.segment} of video: <span class="negative">-${point.drop}%</span></li>`;
        });
        insightsHTML += '</ul>';
    }
    
    // Add recommendations
    insightsHTML += `
        <h4>Recommendations</h4>
        <ul class="recommendation-list">
            ${initialDrop > 15 ? '<li>Improve your video intro to better engage viewers immediately</li>' : ''}
            ${majorDropoffs.length > 0 ? '<li>Review content at the drop-off points to identify potential issues</li>' : ''}
            ${finalRetention < 50 ? '<li>Consider making shorter videos or improving content pacing</li>' : ''}
            <li>Add pattern interrupts throughout your video to maintain attention</li>
            <li>Use hooks and questions to create open loops that encourage continued viewing</li>
        </ul>
    `;
    
    // Add to container
    insightsContainer.innerHTML = insightsHTML;
}

/**
 * Save current performance data as a snapshot for tracking
 */
function savePerformanceSnapshot() {
    const videoId = document.getElementById('videoId').value.trim();
    
    if (!videoId) {
        window.showNotification('Please fetch video metrics first', 'warning');
        return;
    }
    
    // Extract video ID if a full URL was provided
    const extractedId = extractVideoId(videoId);
    
    if (!extractedId) {
        window.showNotification('Invalid YouTube URL or video ID', 'error');
        return;
    }
    
    chrome.storage.local.get(['performanceHistory', 'currentVideoData'], function(result) {
        const videoData = result.currentVideoData;
        
        if (!videoData) {
            window.showNotification('Please fetch video metrics first', 'warning');
            return;
        }
        
        const history = result.performanceHistory || {};
        
        if (!history[extractedId]) {
            history[extractedId] = [];
        }
        
        // Create a snapshot with current date and metrics
        const snapshot = {
            date: new Date().toISOString(),
            views: parseInt(videoData.statistics.viewCount || 0),
            likes: parseInt(videoData.statistics.likeCount || 0),
            comments: parseInt(videoData.statistics.commentCount || 0),
            title: videoData.snippet.title
        };
        
        // Add to history
        history[extractedId].push(snapshot);
        
        // Save updated history
        chrome.storage.local.set({ performanceHistory: history }, function() {
            window.showNotification('Performance snapshot saved', 'success');
            window.logActivity(`Saved performance snapshot for video: ${extractedId}`);
            
            // Update the performance history display
            updatePerformanceHistory(extractedId);
        });
    });
}

/**
 * Update performance history display
 */
function updatePerformanceHistory(videoId) {
    const historyContainer = document.getElementById('performanceHistory');
    if (!historyContainer) return;
    
    chrome.storage.local.get(['performanceHistory'], function(result) {
        const history = result.performanceHistory || {};
        const videoHistory = history[videoId] || [];
        
        if (videoHistory.length === 0) {
            historyContainer.innerHTML = '<p>No performance history available for this video.</p>';
            return;
        }
        
        // Sort snapshots by date (newest first)
        videoHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Create HTML for history table
        let historyHTML = `
            <h3>Performance History</h3>
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Views</th>
                        <th>Likes</th>
                        <th>Comments</th>
                        <th>Change</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Add rows for each snapshot
        videoHistory.forEach((snapshot, index) => {
            const date = new Date(snapshot.date).toLocaleDateString();
            
            // Calculate change from previous snapshot
            let viewsChange = '';
            let changeClass = '';
            
            if (index < videoHistory.length - 1) {
                const prevSnapshot = videoHistory[index + 1];
                const viewsDiff = snapshot.views - prevSnapshot.views;
                
                if (viewsDiff !== 0) {
                    viewsChange = viewsDiff > 0 ? `+${formatNumber(viewsDiff)}` : formatNumber(viewsDiff);
                    changeClass = viewsDiff > 0 ? 'positive' : 'negative';
                }
            }
            
            historyHTML += `
                <tr>
                    <td>${date}</td>
                    <td>${formatNumber(snapshot.views)}</td>
                    <td>${formatNumber(snapshot.likes)}</td>
                    <td>${formatNumber(snapshot.comments)}</td>
                    <td class="${changeClass}">${viewsChange}</td>
                </tr>
            `;
        });
        
        historyHTML += `
                </tbody>
            </table>
        `;
        
        // Add to container
        historyContainer.innerHTML = historyHTML;
    });
}

/**
 * Estimate monetization potential based on video metrics
 */
function estimateMonetization(videoData) {
    if (!videoData) return;
    
    const monetizationStats = document.getElementById('monetizationStats');
    
    if (!monetizationStats) return;
    
    const views = parseInt(videoData.statistics.viewCount || 0);
    
    // Get video category for niche-specific CPM rates
    const categoryId = videoData.snippet.categoryId;
    const category = getCategoryName(categoryId);
    
    // Estimate revenue based on views and category
    const revenue = estimateRevenueFromViews(views, category);
    
    // Create HTML for monetization estimator
    const html = `
        <div class="estimate-range">
            <div class="estimate low">
                <span class="estimate-label">Low Estimate</span>
                <span class="estimate-value">$${revenue.low}</span>
            </div>
            <div class="estimate average">
                <span class="estimate-label">Average Estimate</span>
                <span class="estimate-value">$${revenue.average}</span>
            </div>
            <div class="estimate high">
                <span class="estimate-label">High Estimate</span>
                <span class="estimate-value">$${revenue.high}</span>
            </div>
        </div>
        
        <div class="monetization-insights">
            <h3>Insights</h3>
            <ul>
                <li>Based on ${formatNumber(views)} views and category "${category}"</li>
                <li>Estimated CPM rate: $${revenue.cpmMin.toFixed(2)} - $${revenue.cpmMax.toFixed(2)}</li>
                <li>Actual earnings depend on audience demographics, engagement, and video length</li>
            </ul>
            <p class="note">Note: These are estimates only. Actual earnings may vary.</p>
            
            <h3>Average CPM Rates by Niche</h3>
            <div class="cpm-rates">
                <div class="niche-rate">
                    <span class="niche">Finance & Business</span>
                    <span class="rate">$10.00 - $20.00</span>
                </div>
                <div class="niche-rate">
                    <span class="niche">Technology</span>
                    <span class="rate">$6.00 - $12.00</span>
                </div>
                <div class="niche-rate">
                    <span class="niche">Education</span>
                    <span class="rate">$5.00 - $10.00</span>
                </div>
                <div class="niche-rate">
                    <span class="niche">Entertainment</span>
                    <span class="rate">$3.00 - $8.00</span>
                </div>
                <div class="niche-rate">
                    <span class="niche">Gaming</span>
                    <span class="rate">$2.00 - $5.00</span>
                </div>
            </div>
        </div>
    `;
    
    monetizationStats.innerHTML = html;
}

/**
 * Estimate revenue from views
 */
function estimateRevenueFromViews(views, category = 'Entertainment') {
    // Define CPM ranges by category
    const cpmRanges = {
        'Film & Animation': { min: 3.5, max: 8.0 },
        'Autos & Vehicles': { min: 3.0, max: 7.5 },
        'Music': { min: 3.0, max: 7.0 },
        'Pets & Animals': { min: 2.5, max: 6.0 },
        'Sports': { min: 3.0, max: 8.0 },
        'Gaming': { min: 2.0, max: 5.0 },
        'People & Blogs': { min: 2.5, max: 6.0 },
        'Comedy': { min: 3.0, max: 7.0 },
        'Entertainment': { min: 3.0, max: 8.0 },
        'News & Politics': { min: 4.0, max: 10.0 },
        'Howto & Style': { min: 4.5, max: 9.0 },
        'Education': { min: 5.0, max: 10.0 },
        'Science & Technology': { min: 6.0, max: 12.0 }
    };
    
    // Default CPM range if category not found
    const cpmRange = cpmRanges[category] || { min: 3.0, max: 8.0 };
    
    // Calculate estimated revenue
    // CPM = Cost Per Mille (1000 views)
    const lowEstimate = (views / 1000) * cpmRange.min * 0.55; // YouTube takes ~45%
    const averageEstimate = (views / 1000) * ((cpmRange.min + cpmRange.max) / 2) * 0.55;
    const highEstimate = (views / 1000) * cpmRange.max * 0.55;
    
    return {
        low: lowEstimate.toFixed(2),
        average: averageEstimate.toFixed(2),
        high: highEstimate.toFixed(2),
        cpmMin: cpmRange.min,
        cpmMax: cpmRange.max
    };
}

/**
 * Get category name from category ID
 */
function getCategoryName(categoryId) {
    const categories = {
        '1': 'Film & Animation',
        '2': 'Autos & Vehicles',
        '10': 'Music',
        '15': 'Pets & Animals',
        '17': 'Sports',
        '20': 'Gaming',
        '22': 'People & Blogs',
        '23': 'Comedy',
        '24': 'Entertainment',
        '25': 'News & Politics',
        '26': 'Howto & Style',
        '27': 'Education',
        '28': 'Science & Technology'
    };
    
    return categories[categoryId] || 'Entertainment';
}

/**
 * Calculate engagement rate based on video statistics
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
 * Format numbers for better readability
 */
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

/**
 * Format duration from ISO 8601 to human-readable format
 */
function formatDuration(isoDuration) {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
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
 * Extract video ID from YouTube URL
 */
function extractVideoId(url) {
    // Handle full URL
    if (url.includes('youtube.com/') || url.includes('youtu.be/')) {
        // YouTube watch URL (youtube.com/watch?v=VIDEO_ID)
        if (url.includes('youtube.com/watch')) {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('v');
        }
        
        // YouTube short URL (youtu.be/VIDEO_ID)
        if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split('?')[0];
        }
        
        // YouTube embed URL (youtube.com/embed/VIDEO_ID)
        if (url.includes('youtube.com/embed/')) {
            return url.split('youtube.com/embed/')[1].split('?')[0];
        }
        
        return null;
    }
    
    // If just a video ID was provided (11 chars)
    if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
    }
    
    return null;
} 