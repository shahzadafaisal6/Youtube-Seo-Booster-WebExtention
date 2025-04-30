/**
 * A/B Testing Module for YouTube SEO Booster
 * Handles thumbnail and title testing functionality
 */

// Use global modules instead of importing them
// ApiModule is defined globally in mainUse global modules instead of importing them
// ApiModule is defined globally in main.js/ Use global utility functions instead of importing them

// Export functions for use in main.js
export const ABTestingModule = {
    createTitleTest,
    createThumbnailTest,
    trackTestResults,
    analyzeTestResults,
    endTest,
    getActiveTests,
    getTestHistory
};

/**
 * Create a new title A/B test
 */
async function createTitleTest() {
    try {
        const videoId = document.getElementById('abTestVideoId').value.trim();
        const titleA = document.getElementById('titleA').value.trim();
        const titleB = document.getElementById('titleB').value.trim();
        const testDuration = parseInt(document.getElementById('testDuration').value);
        
        if (!videoId || !titleA || !titleB || isNaN(testDuration)) {
            window.showNotification('Please fill in all fields for the title test', 'warning');
            return;
        }
        
        // Validate video ID
        const videoData = await ApiModule.fetchYouTubeData('videos', {
            part: 'snippet',
            id: videoId
        });
        
        if (!videoData.items || videoData.items.length === 0) {
            window.showNotification('Invalid video ID or video not found', 'error');
            return;
        }
        
        // Create test object
        const test = {
            id: 'title_' + Date.now(),
            type: 'title',
            videoId: videoId,
            variantA: titleA,
            variantB: titleB,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + (testDuration * 24 * 60 * 60 * 1000)).toISOString(),
            status: 'active',
            results: {
                variantA: {
                    views: 0,
                    likes: 0,
                    comments: 0,
                    ctr: 0
                },
                variantB: {
                    views: 0,
                    likes: 0,
                    comments: 0,
                    ctr: 0
                },
                winner: null
            }
        };
        
        // Save test to storage
        chrome.storage.local.get(['abTests'], function(result) {
            const tests = result.abTests || [];
            tests.push(test);
            
            chrome.storage.local.set({ abTests: tests }, function() {
                window.showNotification('Title A/B test created successfully', 'success');
                window.logActivity('Created title A/B test for video ' + videoId);
                
                // Update UI
                displayActiveTests();
                
                // Schedule first check
                setTimeout(() => {
                    updateTestResults(test.id);
                }, 3600000); // Check after 1 hour
            });
        });
    } catch (error) {
        console.error('Error creating title test:', error);
        window.showNotification('Error creating title test: ' + error.message, 'error');
    }
}

/**
 * Create a new thumbnail A/B test
 */
async function createThumbnailTest() {
    try {
        const videoId = document.getElementById('abTestVideoId').value.trim();
        const thumbnailAFile = document.getElementById('thumbnailA').files[0];
        const thumbnailBFile = document.getElementById('thumbnailB').files[0];
        const testDuration = parseInt(document.getElementById('testDuration').value);
        
        if (!videoId || !thumbnailAFile || !thumbnailBFile || isNaN(testDuration)) {
            window.showNotification('Please fill in all fields for the thumbnail test', 'warning');
            return;
        }
        
        // Validate video ID
        const videoData = await ApiModule.fetchYouTubeData('videos', {
            part: 'snippet',
            id: videoId
        });
        
        if (!videoData.items || videoData.items.length === 0) {
            window.showNotification('Invalid video ID or video not found', 'error');
            return;
        }
        
        // Convert thumbnails to base64
        const thumbnailABase64 = await fileToBase64(thumbnailAFile);
        const thumbnailBBase64 = await fileToBase64(thumbnailBFile);
        
        // Create test object
        const test = {
            id: 'thumbnail_' + Date.now(),
            type: 'thumbnail',
            videoId: videoId,
            variantA: thumbnailABase64,
            variantB: thumbnailBBase64,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + (testDuration * 24 * 60 * 60 * 1000)).toISOString(),
            status: 'active',
            results: {
                variantA: {
                    views: 0,
                    likes: 0,
                    comments: 0,
                    ctr: 0
                },
                variantB: {
                    views: 0,
                    likes: 0,
                    comments: 0,
                    ctr: 0
                },
                winner: null
            }
        };
        
        // Save test to storage
        chrome.storage.local.get(['abTests'], function(result) {
            const tests = result.abTests || [];
            tests.push(test);
            
            chrome.storage.local.set({ abTests: tests }, function() {
                window.showNotification('Thumbnail A/B test created successfully', 'success');
                window.logActivity('Created thumbnail A/B test for video ' + videoId);
                
                // Update UI
                displayActiveTests();
                
                // Schedule first check
                setTimeout(() => {
                    updateTestResults(test.id);
                }, 3600000); // Check after 1 hour
            });
        });
    } catch (error) {
        console.error('Error creating thumbnail test:', error);
        window.showNotification('Error creating thumbnail test: ' + error.message, 'error');
    }
}

/**
 * Convert file to base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Track and update test results
 */
async function trackTestResults(testId) {
    try {
        chrome.storage.local.get(['abTests'], async function(result) {
            const tests = result.abTests || [];
            const testIndex = tests.findIndex(test => test.id === testId);
            
            if (testIndex === -1) {
                console.error('Test not found:', testId);
                return;
            }
            
            const test = tests[testIndex];
            
            // Check if test is still active
            if (test.status !== 'active') {
                return;
            }
            
            // Check if test has ended
            const endDate = new Date(test.endDate);
            if (endDate < new Date()) {
                // Test has ended, analyze final results
                await analyzeTestResults(testId);
                return;
            }
            
            // Fetch current video metrics
            const videoData = await ApiModule.fetchYouTubeData('videos', {
                part: 'statistics',
                id: test.videoId
            });
            
            if (!videoData.items || videoData.items.length === 0) {
                console.error('Video not found:', test.videoId);
                return;
            }
            
            const stats = videoData.items[0].statistics;
            
            // Update test results based on current variant
            const currentVariant = getCurrentVariant(test);
            
            test.results[currentVariant].views = parseInt(stats.viewCount) || 0;
            test.results[currentVariant].likes = parseInt(stats.likeCount) || 0;
            test.results[currentVariant].comments = parseInt(stats.commentCount) || 0;
            
            // Calculate CTR (would need impression data from YouTube API, using placeholder)
            test.results[currentVariant].ctr = calculateEstimatedCTR(stats);
            
            // Save updated test
            tests[testIndex] = test;
            chrome.storage.local.set({ abTests: tests }, function() {
                console.log('Updated test results for', testId);
                
                // Schedule next check
                setTimeout(() => {
                    trackTestResults(testId);
                }, 86400000); // Check daily
            });
        });
    } catch (error) {
        console.error('Error tracking test results:', error);
    }
}

/**
 * Get current variant being tested
 * In a real implementation, this would alternate between A and B
 */
function getCurrentVariant(test) {
    // Simplified implementation - alternate based on day
    const daysSinceStart = Math.floor((new Date() - new Date(test.startDate)) / (24 * 60 * 60 * 1000));
    return daysSinceStart % 2 === 0 ? 'variantA' : 'variantB';
}

/**
 * Calculate estimated CTR based on available metrics
 */
function calculateEstimatedCTR(stats) {
    // In a real implementation, this would use impression data from YouTube API
    // For now, using a placeholder calculation
    const views = parseInt(stats.viewCount) || 0;
    const likes = parseInt(stats.likeCount) || 0;
    const comments = parseInt(stats.commentCount) || 0;
    
    // Simple placeholder formula
    return Math.min(((likes + comments) / Math.max(views, 1)) * 100, 30).toFixed(2);
}

/**
 * Analyze test results and determine winner
 */
async function analyzeTestResults(testId) {
    try {
        chrome.storage.local.get(['abTests'], function(result) {
            const tests = result.abTests || [];
            const testIndex = tests.findIndex(test => test.id === testId);
            
            if (testIndex === -1) {
                console.error('Test not found:', testId);
                return;
            }
            
            const test = tests[testIndex];
            
            // Compare results
            const variantA = test.results.variantA;
            const variantB = test.results.variantB;
            
            // Calculate engagement score (simplified)
            const scoreA = (variantA.likes + variantA.comments) / Math.max(variantA.views, 1);
            const scoreB = (variantB.likes + variantB.comments) / Math.max(variantB.views, 1);
            
            // Determine winner
            if (scoreA > scoreB) {
                test.results.winner = 'variantA';
            } else if (scoreB > scoreA) {
                test.results.winner = 'variantB';
            } else {
                test.results.winner = 'tie';
            }
            
            // Mark test as completed
            test.status = 'completed';
            
            // Save updated test
            tests[testIndex] = test;
            chrome.storage.local.set({ abTests: tests }, function() {
                window.showNotification(`A/B test completed. ${test.results.winner === 'tie' ? 'No clear winner' : 'Variant ' + test.results.winner.slice(-1) + ' won'}`, 'success');
                window.logActivity(`Completed A/B test for video ${test.videoId}. ${test.results.winner === 'tie' ? 'No clear winner' : 'Variant ' + test.results.winner.slice(-1) + ' won'}`);
                
                // Update UI
                displayTestHistory();
            });
        });
    } catch (error) {
        console.error('Error analyzing test results:', error);
    }
}

/**
 * End an active test early
 */
function endTest(testId) {
    chrome.storage.local.get(['abTests'], function(result) {
        const tests = result.abTests || [];
        const testIndex = tests.findIndex(test => test.id === testId);
        
        if (testIndex === -1) {
            window.showNotification('Test not found', 'error');
            return;
        }
        
        // Mark test as ended
        tests[testIndex].status = 'ended';
        tests[testIndex].endDate = new Date().toISOString();
        
        // Save updated tests
        chrome.storage.local.set({ abTests: tests }, function() {
            window.showNotification('Test ended successfully', 'success');
            window.logActivity('Ended A/B test early: ' + testId);
            
            // Analyze results
            analyzeTestResults(testId);
        });
    });
}

/**
 * Get all active tests
 */
function getActiveTests() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['abTests'], function(result) {
            const tests = result.abTests || [];
            const activeTests = tests.filter(test => test.status === 'active');
            resolve(activeTests);
        });
    });
}

/**
 * Get test history
 */
function getTestHistory() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['abTests'], function(result) {
            const tests = result.abTests || [];
            const completedTests = tests.filter(test => test.status === 'completed' || test.status === 'ended');
            resolve(completedTests);
        });
    });
}

/**
 * Display active tests in the UI
 */
async function displayActiveTests() {
    const activeTestsContainer = document.getElementById('activeTests');
    
    if (!activeTestsContainer) {
        return;
    }
    
    const activeTests = await getActiveTests();
    
    if (activeTests.length === 0) {
        activeTestsContainer.innerHTML = '<p>No active tests</p>';
        return;
    }
    
    let html = '<div class="tests-grid">';
    
    activeTests.forEach(test => {
        const endDate = new Date(test.endDate);
        const daysLeft = Math.ceil((endDate - new Date()) / (24 * 60 * 60 * 1000));
        
        html += `
            <div class="test-card">
                <div class="test-header">
                    <span class="test-type">${test.type === 'title' ? 'Title Test' : 'Thumbnail Test'}</span>
                    <span class="test-status">Active</span>
                </div>
                <div class="test-video">Video: ${test.videoId}</div>
                <div class="test-variants">
                    <div class="variant">
                        <h4>Variant A</h4>
                        ${test.type === 'title' 
                            ? `<p>${test.variantA}</p>` 
                            : `<img src="${test.variantA}" alt="Thumbnail A" class="thumbnail-preview">`
                        }
                    </div>
                    <div class="variant">
                        <h4>Variant B</h4>
                        ${test.type === 'title' 
                            ? `<p>${test.variantB}</p>` 
                            : `<img src="${test.variantB}" alt="Thumbnail B" class="thumbnail-preview">`
                        }
                    </div>
                </div>
                <div class="test-metrics">
                    <div class="metric">
                        <span class="metric-label">Days Left:</span>
                        <span class="metric-value">${daysLeft}</span>
                    </div>
                </div>
                <div class="test-actions">
                    <button class="btn-secondary end-test-btn" data-test-id="${test.id}">End Test</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    activeTestsContainer.innerHTML = html;
    
    // Add event listeners to end test buttons
    document.querySelectorAll('.end-test-btn').forEach(button => {
        button.addEventListener('click', function() {
            const testId = this.getAttribute('data-test-id');
            endTest(testId);
        });
    });
}

/**
 * Display test history in the UI
 */
async function displayTestHistory() {
    const testHistoryContainer = document.getElementById('testHistory');
    
    if (!testHistoryContainer) {
        return;
    }
    
    const completedTests = await getTestHistory();
    
    if (completedTests.length === 0) {
        testHistoryContainer.innerHTML = '<p>No completed tests</p>';
        return;
    }
    
    let html = '<div class="tests-grid">';
    
    completedTests.forEach(test => {
        const startDate = new Date(test.startDate).toLocaleDateString();
        const endDate = new Date(test.endDate).toLocaleDateString();
        
        html += `
            <div class="test-card">
                <div class="test-header">
                    <span class="test-type">${test.type === 'title' ? 'Title Test' : 'Thumbnail Test'}</span>
                    <span class="test-status">${test.status === 'completed' ? 'Completed' : 'Ended Early'}</span>
                </div>
                <div class="test-video">Video: ${test.videoId}</div>
                <div class="test-variants">
                    <div class="variant ${test.results.winner === 'variantA' ? 'winner' : ''}">
                        <h4>Variant A ${test.results.winner === 'variantA' ? '(Winner)' : ''}</h4>
                        ${test.type === 'title' 
                            ? `<p>${test.variantA}</p>` 
                            : `<img src="${test.variantA}" alt="Thumbnail A" class="thumbnail-preview">`
                        }
                    </div>
                    <div class="variant ${test.results.winner === 'variantB' ? 'winner' : ''}">
                        <h4>Variant B ${test.results.winner === 'variantB' ? '(Winner)' : ''}</h4>
                        ${test.type === 'title' 
                            ? `<p>${test.variantB}</p>` 
                            : `<img src="${test.variantB}" alt="Thumbnail B" class="thumbnail-preview">`
                        }
                    </div>
                </div>
                <div class="test-metrics">
                    <div class="metric">
                        <span class="metric-label">Duration:</span>
                        <span class="metric-value">${startDate} - ${endDate}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Result:</span>
                        <span class="metric-value">${test.results.winner === 'tie' 
                            ? 'No clear winner' 
                            : `Variant ${test.results.winner.slice(-1)} performed better`}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    testHistoryContainer.innerHTML = html;
}

// Initialize module when loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check for active tests and update UI
    displayActiveTests();
    displayTestHistory();
});