/**
 * Keywords Module for YouTube SEO Booster
 * Handles all keyword analysis and suggestion functionality
 */

// Use global modules instead of importing them
// ApiModule is defined globally in mainUse global modules instead of importing them
// ApiModule is defined globally in main.js/ Use global utility functions instead of importing them

// Create KeywordsModule object
const KeywordsModule = {
    analyzeMetadata,
    fetchKeywordSuggestions,
    generateKeywordSuggestions,
    applyMetadataSuggestions,
    generateHashtags,
    fetchTrendingTopics,
    generateTags,
    analyzeKeywords,
    displayKeywordTrends,
    exportKeywordAnalysis,
    analyzeThumbnail
};

// Export for ES modules
export { KeywordsModule };

/**
 * Analyze video metadata for SEO optimization
 */
function analyzeMetadata() {
    const title = document.getElementById('videoTitle').value.trim();
    const description = document.getElementById('videoDescription').value.trim();
    
    if (!title && !description) {
        window.showNotification('Please enter a video title and description', 'warning');
        return;
    }
    
    const suggestionsContainer = document.getElementById('metadataSuggestions');
    
    // Show loading indicator
    suggestionsContainer.innerHTML = '<div class="loading">Analyzing metadata...</div>';
    
    // Extract keywords from title and description
    const keywords = extractKeywords(title + ' ' + description);
    
    // Analyze title
    const titleAnalysis = analyzeTitleSEO(title, keywords);
    
    // Analyze description
    const descriptionAnalysis = analyzeDescriptionSEO(description, keywords);
    
    // Generate keyword suggestions
    const keywordSuggestions = generateKeywordSuggestions(keywords);
    
    // Create suggestions HTML
    const suggestionsHTML = `
        <div class="seo-score">
            <div class="score-meter">
                <div class="score-fill" style="width: ${titleAnalysis.score + descriptionAnalysis.score}%;"></div>
            </div>
            <div class="score-value">${Math.round((titleAnalysis.score + descriptionAnalysis.score) / 2)}%</div>
        </div>
        
        <h3>Title Analysis</h3>
        <div class="analysis-result">
            ${titleAnalysis.suggestions.map(suggestion => 
                `<div class="suggestion-item ${suggestion.status}">
                    <span class="suggestion-icon">${suggestion.status === 'good' ? '✓' : '!'}</span>
                    <span class="suggestion-text">${suggestion.text}</span>
                </div>`
            ).join('')}
        </div>
        
        <h3>Description Analysis</h3>
        <div class="analysis-result">
            ${descriptionAnalysis.suggestions.map(suggestion => 
                `<div class="suggestion-item ${suggestion.status}">
                    <span class="suggestion-icon">${suggestion.status === 'good' ? '✓' : '!'}</span>
                    <span class="suggestion-text">${suggestion.text}</span>
                </div>`
            ).join('')}
        </div>
        
        <h3>Keyword Suggestions</h3>
        <div class="keyword-suggestions">
            ${keywordSuggestions.map(keyword => 
                `<span class="keyword-tag" title="Add this keyword to your title or description">${keyword}</span>`
            ).join('')}
        </div>
        
        <div class="action-buttons">
            <button id="applySuggestions" class="btn btn-secondary">Apply Suggestions</button>
        </div>
    `;
    
    // Update suggestions container
    suggestionsContainer.innerHTML = suggestionsHTML;
    
    // Log activity
    window.logActivity('Analyzed video metadata and generated SEO suggestions');
    
    // Add event listener to apply suggestions button
    document.getElementById('applySuggestions').addEventListener('click', applyMetadataSuggestions);
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
    // Remove special characters and convert to lowercase
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    
    // Split text into words
    const words = cleanText.split(/\s+/);
    
    // Remove common stop words
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
                      'has', 'have', 'had', 'be', 'been', 'being', 'do', 'does', 'did',
                      'will', 'would', 'should', 'can', 'could', 'may', 'might', 'must',
                      'shall', 'should', 'to', 'of', 'in', 'for', 'on', 'by', 'at', 'with'];
    
    const filteredWords = words.filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Count word frequencies
    const wordCounts = {};
    filteredWords.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // Extract potential keyword phrases (2-3 words)
    const phrases = [];
    for (let i = 0; i < words.length - 1; i++) {
        if (!stopWords.includes(words[i]) && words[i].length > 2) {
            // Two-word phrases
            if (!stopWords.includes(words[i+1]) && words[i+1].length > 2) {
                phrases.push(words[i] + ' ' + words[i+1]);
            }
            
            // Three-word phrases
            if (i < words.length - 2 && !stopWords.includes(words[i+2]) && words[i+2].length > 2) {
                if (!stopWords.includes(words[i+1]) || ['and', 'of', 'for', 'with'].includes(words[i+1])) {
                    phrases.push(words[i] + ' ' + words[i+1] + ' ' + words[i+2]);
                }
            }
        }
    }
    
    // Count phrase frequencies
    const phraseCounts = {};
    phrases.forEach(phrase => {
        phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
    });
    
    // Combine words and phrases, sort by frequency
    const combinedCounts = { ...wordCounts, ...phraseCounts };
    
    // Convert to array and sort
    const sortedKeywords = Object.entries(combinedCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
    
    // Return top keywords
    return sortedKeywords.slice(0, 10);
}

/**
 * Analyze title for SEO optimization
 */
function analyzeTitleSEO(title, keywords) {
    const suggestions = [];
    let score = 0;
    
    // Check title length
    if (title.length === 0) {
        suggestions.push({
            status: 'warning',
            text: 'Add a title to your video'
        });
    } else {
        if (title.length < 30) {
            suggestions.push({
                status: 'warning',
                text: `Title is too short (${title.length} characters). Aim for 40-60 characters.`
            });
            score += 30;
        } else if (title.length > 60) {
            suggestions.push({
                status: 'warning',
                text: `Title is too long (${title.length} characters). Keep it under 60 characters.`
            });
            score += 40;
        } else {
            suggestions.push({
                status: 'good',
                text: `Title length is optimal (${title.length} characters).`
            });
            score += 50;
        }
        
        // Check if title contains top keywords
        let keywordsFound = 0;
        for (let i = 0; i < Math.min(3, keywords.length); i++) {
            if (title.toLowerCase().includes(keywords[i].toLowerCase())) {
                keywordsFound++;
            }
        }
        
        if (keywordsFound === 0) {
            suggestions.push({
                status: 'warning',
                text: 'Title does not contain any of your top keywords.'
            });
        } else {
            suggestions.push({
                status: 'good',
                text: `Title contains ${keywordsFound} of your top keywords.`
            });
            score += keywordsFound * 15;
        }
        
        // Check for clickbait patterns
        if (/^(how|why|what|when|where|who|top|best|\d+).+\?$/i.test(title)) {
            suggestions.push({
                status: 'good',
                text: 'Title uses a question format which can increase CTR.'
            });
            score += 10;
        }
        
        if (/\b(how to|tutorial|guide)\b/i.test(title)) {
            suggestions.push({
                status: 'good',
                text: 'Title indicates educational content which can improve visibility.'
            });
            score += 10;
        }
    }
    
    return {
        score: Math.min(100, score),
        suggestions
    };
}

/**
 * Analyze description for SEO optimization
 */
function analyzeDescriptionSEO(description, keywords) {
    const suggestions = [];
    let score = 0;
    
    // Check description length
    if (description.length === 0) {
        suggestions.push({
            status: 'warning',
            text: 'Add a description to your video'
        });
    } else {
        if (description.length < 100) {
            suggestions.push({
                status: 'warning',
                text: `Description is too short (${description.length} characters). Aim for at least 200 characters.`
            });
            score += 20;
        } else if (description.length < 200) {
            suggestions.push({
                status: 'warning',
                text: `Description could be longer (${description.length} characters). Aim for 200-5000 characters.`
            });
            score += 40;
        } else {
            suggestions.push({
                status: 'good',
                text: `Description length is good (${description.length} characters).`
            });
            score += 50;
        }
        
        // Check if description contains top keywords
        let keywordsFound = 0;
        for (let i = 0; i < Math.min(5, keywords.length); i++) {
            if (description.toLowerCase().includes(keywords[i].toLowerCase())) {
                keywordsFound++;
            }
        }
        
        if (keywordsFound < 3 && keywords.length >= 3) {
            suggestions.push({
                status: 'warning',
                text: `Description contains only ${keywordsFound} of your top keywords.`
            });
            score += keywordsFound * 10;
        } else {
            suggestions.push({
                status: 'good',
                text: `Description contains ${keywordsFound} of your top keywords.`
            });
            score += keywordsFound * 10;
        }
        
        // Check for hashtags
        const hashtags = description.match(/#[a-zA-Z0-9]+/g);
        if (!hashtags || hashtags.length === 0) {
            suggestions.push({
                status: 'warning',
                text: 'Add some hashtags to improve discoverability.'
            });
        } else if (hashtags.length > 15) {
            suggestions.push({
                status: 'warning',
                text: `Too many hashtags (${hashtags.length}). Keep it under 15.`
            });
            score += 15;
        } else {
            suggestions.push({
                status: 'good',
                text: `Good number of hashtags (${hashtags.length}).`
            });
            score += 25;
        }
        
        // Check for calls to action
        if (!/\b(subscribe|like|comment|share|follow)\b/i.test(description)) {
            suggestions.push({
                status: 'warning',
                text: 'Add a call to action (subscribe, like, comment) in your description.'
            });
        } else {
            suggestions.push({
                status: 'good',
                text: 'Description contains call(s) to action.'
            });
            score += 15;
        }
    }
    
    return {
        score: Math.min(100, score),
        suggestions
    };
}

/**
 * Generate keyword suggestions based on extracted keywords
 */
function generateKeywordSuggestions(extractedKeywords) {
    // Combine with popular YouTube terms
    const popularTerms = [
        'how to', 'tutorial', 'review', 'best', 'guide', 'tips', 'vs', 'explained',
        'for beginners', 'step by step', 'easy', 'DIY', 'top', 'comparison',
        'full', 'official', 'unboxing', 'trailer', 'compilation', 'reaction'
    ];
    
    const suggestions = [...extractedKeywords];
    
    // Add combinations of extracted keywords with popular terms
    extractedKeywords.slice(0, 3).forEach(keyword => {
        popularTerms.slice(0, 5).forEach(term => {
            if (!keyword.includes(term) && !term.includes(keyword)) {
                suggestions.push(`${term} ${keyword}`);
            }
        });
    });
    
    // Add some popular standalone terms
    popularTerms.slice(0, 3).forEach(term => {
        if (!suggestions.includes(term)) {
            suggestions.push(term);
        }
    });
    
    // Remove duplicates and return
    return Array.from(new Set(suggestions)).slice(0, 15);
}

/**
 * Apply metadata suggestions to improve video SEO
 */
function applyMetadataSuggestions() {
    const titleInput = document.getElementById('videoTitle');
    const descriptionInput = document.getElementById('videoDescription');
    
    if (!titleInput || !descriptionInput) {
        window.showNotification('Error: Inputs not found', 'error');
        return;
    }
    
    let title = titleInput.value.trim();
    let description = descriptionInput.value.trim();
    
    // Get keyword suggestions
    const keywordElements = document.querySelectorAll('.keyword-tag');
    const keywords = Array.from(keywordElements).map(el => el.textContent);
    
    // Optimize title
    if (title.length > 0) {
        // Ensure title includes top keywords if not already present
        let modifiedTitle = title;
        
        // If title is too long, try to make it more concise
        if (title.length > 60) {
            // Remove unnecessary words
            modifiedTitle = title.replace(/\b(a|an|the|this|that|these|those)\b/gi, '');
            
            // If still too long, truncate
            if (modifiedTitle.length > 60) {
                modifiedTitle = modifiedTitle.substring(0, 57) + '...';
            }
        }
        
        // Try to include top keyword if not present and there's room
        if (keywords.length > 0 && !modifiedTitle.toLowerCase().includes(keywords[0].toLowerCase()) && 
            modifiedTitle.length + keywords[0].length + 3 <= 60) {
            modifiedTitle = modifiedTitle + ' - ' + keywords[0];
        }
        
        title = modifiedTitle;
    }
    
    // Optimize description
    if (description.length > 0) {
        // Add hashtags if missing
        const hashtags = description.match(/#[a-zA-Z0-9]+/g) || [];
        
        if (hashtags.length < 5 && keywords.length > 0) {
            const newHashtags = keywords.slice(0, 5)
                .filter(keyword => !hashtags.some(tag => tag.toLowerCase() === `#${keyword.toLowerCase().replace(/\s+/g, '')}`))
                .map(keyword => `#${keyword.replace(/\s+/g, '')}`);
            
            if (newHashtags.length > 0) {
                if (description.trim().endsWith('\n') || description.trim() === '') {
                    description += newHashtags.join(' ');
                } else {
                    description += '\n\n' + newHashtags.join(' ');
                }
            }
        }
        
        // Add call to action if missing
        if (!/\b(subscribe|like|comment|share|follow)\b/i.test(description)) {
            description += '\n\nIf you enjoyed this video, please like, subscribe, and share it with your friends!';
        }
    }
    
    // Update inputs
    titleInput.value = title;
    descriptionInput.value = description;
    
    // Re-analyze metadata
    analyzeMetadata();
    
    // Show notification
    window.showNotification('SEO suggestions applied successfully!', 'success');
    
    // Log activity
    window.logActivity('Applied SEO suggestions to video metadata');
}

/**
 * Generate hashtags based on user input
 */
function generateHashtags() {
    // Based on HTML, these are the actual IDs
    const mainTopicsInput = document.getElementById('hashtagKeywords');
    let includeTrending = false;
    let includeNiche = false;

    // Safely get checkbox values
    const includeTrendingCheckbox = document.getElementById('trendingHashtags');
    if (includeTrendingCheckbox) {
        includeTrending = includeTrendingCheckbox.checked;
    } else {
        console.warn('Trending hashtags checkbox not found');
    }

    const includeNicheCheckbox = document.getElementById('nicheHashtags');
    if (includeNicheCheckbox) {
        includeNiche = includeNicheCheckbox.checked;
    } else {
        console.warn('Niche hashtags checkbox not found');
    }

    const resultsContainer = document.getElementById('hashtagResults');
    
    if (!mainTopicsInput || !resultsContainer) {
        window.showNotification('Error: Form elements not found', 'error');
        return;
    }
    
    const mainTopics = mainTopicsInput.value.trim();
    
    if (!mainTopics) {
        window.showNotification('Please enter main topics for hashtag generation', 'warning');
        return;
    }
    
    // Show loading indicator
    resultsContainer.innerHTML = '<div class="loading">Generating hashtags...</div>';
    
    // Parse keywords from the topics
    const keywords = mainTopics.split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);
    
    // Generate basic hashtags from keywords
    const baseHashtags = generateBaseHashtags(keywords);
    
    // Generate trending hashtags if requested
    const trendingHashtags = includeTrending ? generateTrendingHashtags() : [];
    
    // Generate niche-specific hashtags if requested
    const nicheHashtags = includeNiche ? generateNicheHashtags(keywords) : [];
    
    // Combine all hashtags and remove duplicates
    const allHashtags = [
        ...baseHashtags,
        ...trendingHashtags,
        ...nicheHashtags
    ];
    
    // Remove duplicates and limit total count
    const uniqueHashtags = Array.from(new Set(allHashtags)).slice(0, 30);
    
    // Group hashtags by type
    const hashtagGroups = [
        {
            name: 'Main Topic Hashtags',
            tags: baseHashtags.filter(tag => uniqueHashtags.includes(tag))
        },
        {
            name: 'Trending Hashtags',
            tags: trendingHashtags.filter(tag => uniqueHashtags.includes(tag))
        },
        {
            name: 'Niche-Specific Hashtags',
            tags: nicheHashtags.filter(tag => uniqueHashtags.includes(tag))
        }
    ].filter(group => group.tags.length > 0);
    
    // Build the results HTML
    let resultsHTML = `
        <div class="hashtag-summary">
            <p><strong>${uniqueHashtags.length}</strong> hashtags generated</p>
        </div>
    `;
    
    // Add hashtag groups
    hashtagGroups.forEach(group => {
        resultsHTML += `
            <div class="hashtag-group">
                <h4>${group.name}</h4>
                <div class="hashtag-list">
                    ${group.tags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    });
    
    // Add all hashtags in text format
    resultsHTML += `
        <div class="hashtag-actions">
            <h4>All Hashtags</h4>
            <div id="hashtagKeywords" class="hashtag-keywords">${uniqueHashtags.join(' ')}</div>
            <div class="action-buttons">
                <button id="copyHashtags" class="btn btn-secondary">Copy Hashtags</button>
                <button id="addToDescription" class="btn btn-secondary">Add to Description</button>
            </div>
        </div>
    `;
    
    // Update the results container
    resultsContainer.innerHTML = resultsHTML;
    
    // Add event listeners for the action buttons
    const copyHashtagsBtn = document.getElementById('copyHashtags');
    if (copyHashtagsBtn) {
        copyHashtagsBtn.addEventListener('click', function() {
            const hashtagText = document.getElementById('hashtagKeywords')?.textContent || '';
            navigator.clipboard.writeText(hashtagText)
                .then(() => window.showNotification('Hashtags copied to clipboard', 'success'))
                .catch(err => window.showNotification('Failed to copy hashtags: ' + err, 'error'));
        });
    }
    
    const addToDescBtn = document.getElementById('addToDescription');
    if (addToDescBtn) {
        addToDescBtn.addEventListener('click', function() {
            const hashtagText = document.getElementById('hashtagKeywords')?.textContent || '';
            const descriptionInput = document.getElementById('videoDescription');
            
            if (descriptionInput) {
                // Add hashtags at the end of the description
                let description = descriptionInput.value.trim();
                
                if (description.length > 0) {
                    description += '\n\n';
                }
                
                description += hashtagText;
                descriptionInput.value = description;
                
                window.showNotification('Hashtags added to description', 'success');
                window.logActivity('Added hashtags to video description');
                
                // Re-analyze metadata
                if (typeof analyzeMetadata === 'function') {
                    analyzeMetadata();
                }
            } else {
                window.showNotification('Description input not found', 'error');
            }
        });
    }
    
    // Log activity
    window.logActivity(`Generated ${uniqueHashtags.length} hashtags for topic: ${mainTopics}`);
}

/**
 * Generate base hashtags from keywords
 */
function generateBaseHashtags(keywords) {
    const baseHashtags = [];
    
    // Process each keyword
    keywords.forEach(keyword => {
        // Convert keyword to hashtag format
        const baseTag = '#' + keyword.replace(/\s+/g, '');
        baseHashtags.push(baseTag);
        
        // Add variations
        if (keyword.includes(' ')) {
            // Keep spaces for readability
            baseHashtags.push('#' + keyword.replace(/\s+/g, '_'));
            
            // Individual words as separate hashtags
            keyword.split(' ').forEach(word => {
                if (word.length > 3) {
                    baseHashtags.push('#' + word);
                }
            });
        }
        
        // Add some common modifiers
        const modifiers = ['best', 'top', 'new', 'trending', 'tips', 'howto', 'guide'];
        modifiers.forEach(modifier => {
            if (!keyword.toLowerCase().includes(modifier)) {
                baseHashtags.push('#' + modifier + keyword.replace(/\s+/g, ''));
            }
        });
    });
    
    return baseHashtags;
}

/**
 * Generate trending hashtags
 * This is a simplified version - a real implementation would connect to an API
 * or database of trending hashtags
 */
function generateTrendingHashtags() {
    // These would ideally be fetched from an API, but for demo purposes using static list
    const trendingByCategory = {
        general: [
            '#trending', '#viral', '#trending2023', '#trendingnow', '#explore',
            '#explorepage', '#foryou', '#foryoupage', '#fyp', '#viralvideo'
        ],
        technology: [
            '#tech', '#technology', '#ai', '#artificialintelligence', '#coding',
            '#programming', '#developer', '#webdev', '#techreview', '#gadgets'
        ],
        entertainment: [
            '#entertainment', '#movie', '#tvshow', '#netflix', '#amazonprime',
            '#streaming', '#hollywood', '#newrelease', '#musicvideo', '#trailer'
        ],
        education: [
            '#education', '#learning', '#study', '#edtech', '#onlinecourse',
            '#tutorial', '#skills', '#knowledge', '#howto', '#learnfromhome'
        ],
        lifestyle: [
            '#lifestyle', '#fashion', '#beauty', '#fitness', '#health',
            '#wellness', '#selfcare', '#motivation', '#inspiration', '#goals'
        ]
    };
    
    // Get current date to add time-specific trending tags
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' }).toLowerCase();
    const year = now.getFullYear();
    
    const timeBasedTags = [
        `#${month}${year}`,
        `#${month}`,
        `#${year}`,
        `#new${month}`,
        `#trending${month}`
    ];
    
    // Combine general trending hashtags with time-based ones
    return [...trendingByCategory.general, ...timeBasedTags];
}

/**
 * Generate niche-specific hashtags based on keywords
 */
function generateNicheHashtags(keywords) {
    // Define niche categories and associated hashtags
    const nicheHashtags = {
        technology: [
            '#tech', '#technology', '#gadgets', '#innovation', '#techreview',
            '#techtips', '#technews', '#ai', '#coding', '#programming',
            '#software', '#hardware', '#computerscience', '#developer', '#webdev'
        ],
        gaming: [
            '#gaming', '#gamer', '#videogames', '#gamingcommunity', '#gamelover',
            '#gaminglife', '#esports', '#twitch', '#gameday', '#streamer',
            '#gamingsetup', '#pcgaming', '#consolegaming', '#mobilegaming'
        ],
        business: [
            '#business', '#entrepreneur', '#startup', '#smallbusiness', '#success',
            '#marketing', '#entrepreneurship', '#businesstips', '#leadership',
            '#motivation', '#businessman', '#businesswoman', '#businessowner'
        ],
        education: [
            '#education', '#learning', '#study', '#student', '#teacher',
            '#onlinelearning', '#school', '#college', '#university', '#knowledge',
            '#elearning', '#educational', '#edtech', '#tutor', '#lesson'
        ],
        health: [
            '#health', '#fitness', '#wellness', '#healthylifestyle', '#workout',
            '#nutrition', '#diet', '#exercise', '#healthy', '#gym', '#training',
            '#healthtips', '#mentalhealth', '#meditation', '#mindfulness'
        ],
        beauty: [
            '#beauty', '#makeup', '#skincare', '#haircare', '#beautytips',
            '#beautyblogger', '#beautyproducts', '#cosmetics', '#natural',
            '#organic', '#selfcare', '#glam', '#beautyhacks', '#beautytutorial'
        ],
        food: [
            '#food', '#recipe', '#cooking', '#foodie', '#homemade',
            '#delicious', '#healthyfood', '#foodphotography', '#yummy',
            '#foodblogger', '#chef', '#baking', '#dessert', '#foodlover'
        ],
        travel: [
            '#travel', '#adventure', '#vacation', '#trip', '#tourism',
            '#wanderlust', '#travelgram', '#travelphotography', '#explore',
            '#traveling', '#destination', '#travelblogger', '#holiday', '#journey'
        ],
        fashion: [
            '#fashion', '#style', '#outfit', '#clothing', '#fashionblogger',
            '#trendy', '#stylish', '#streetstyle', '#model', '#fashionista',
            '#clothes', '#accessories', '#ootd', '#design', '#fashionable'
        ],
        music: [
            '#music', '#musician', '#artist', '#band', '#song',
            '#newmusic', '#livemusic', '#musicvideo', '#singer', '#songwriter',
            '#rap', '#hiphop', '#rock', '#pop', '#indie'
        ],
        art: [
            '#art', '#artist', '#design', '#creative', '#drawing',
            '#painting', '#digitalart', '#illustration', '#artwork', '#sketch',
            '#artistic', '#gallery', '#artoftheday', '#instaart', '#contemporaryart'
        ],
        photography: [
            '#photography', '#photographer', '#photo', '#photooftheday', '#camera',
            '#photoshoot', '#naturephotography', '#portrait', '#photoshop',
            '#photographylovers', '#streetphotography', '#canon', '#nikon', '#sony'
        ]
    };
    
    // Detect relevant niches based on keywords
    const relevantNiches = [];
    
    for (const [niche, _] of Object.entries(nicheHashtags)) {
        const isRelevant = keywords.some(keyword => 
            keyword.toLowerCase().includes(niche) || 
            niche.includes(keyword.toLowerCase())
        );
        
        if (isRelevant) {
            relevantNiches.push(niche);
        }
    }
    
    // If no relevant niches detected, add some general ones
    if (relevantNiches.length === 0) {
        relevantNiches.push('education', 'technology');
    }
    
    // Collect hashtags from relevant niches
    const result = [];
    relevantNiches.forEach(niche => {
        result.push(...nicheHashtags[niche]);
    });
    
    // Return unique hashtags
    return Array.from(new Set(result));
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Hide after a delay
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Alias to match the _showNotification pattern used in main.js
window._showNotification = showNotification;

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

/**
 * Fetch trending topics from YouTube
 */
function fetchTrendingTopics() {
    console.log('Fetching trending topics');
    const categorySelect = document.getElementById('categorySelect');
    const categoryId = categorySelect ? categorySelect.value : '';
    
    const trendingResults = document.getElementById('trendingResults');
    
    if (!trendingResults) {
        window.showNotification('Trending results container not found', 'error');
        return;
    }
    
    // Show loading state
    trendingResults.innerHTML = '<div class="loading">Loading trending topics...</div>';
    
    try {
        // Import API management module to get API key
        import('./api-management.js')
            .then(module => {
                const ApiManagementModule = module.ApiManagementModule;
                
                // Get YouTube API key
                ApiManagementModule.getApiKey()
                    .then(apiKey => {
                        // Prepare API call parameters
                        const params = {
                            part: 'snippet,statistics',
                            chart: 'mostPopular',
                            maxResults: 10,
                            regionCode: 'US',
                            key: apiKey
                        };
                        
                        // Add category ID if selected
                        if (categoryId) {
                            params.videoCategoryId = categoryId;
                        }
                        
                        // Make direct API call to YouTube
                        fetchTrendingVideosFromYouTube(params)
                            .then(data => {
                                if (!data.items || data.items.length === 0) {
                                    trendingResults.innerHTML = '<p>No trending videos found for this category.</p>';
                                    return;
                                }
                                
                                // Extract common keywords and phrases from trending videos
                                const trendingKeywords = extractTrendingKeywords(data.items);
                                
                                // Display trending topics
                                displayTrendingTopics(data.items, trendingKeywords);
                                
                                // Log activity
                                window.logActivity('Fetched trending topics successfully');
                                window.showNotification('Trending topics fetched successfully', 'success');
                            })
                            .catch(error => {
                                console.error('Error fetching trending videos:', error);
                                trendingResults.innerHTML = `<p class="error">Error: ${error.message}</p>`;
                                window.showNotification('Error fetching trending topics: ' + error.message, 'error');
                                window.logActivity('Error fetching trending topics: ' + error.message, 'error');
                            });
                    })
                    .catch(error => {
                        console.error('Error getting YouTube API key:', error);
                        trendingResults.innerHTML = `
                            <p class="error">No YouTube API key found. Please add an API key to fetch trending topics.</p>
                            <p class="api-prompt">To get real trending data, please add a YouTube API key in the <a href="#" class="open-api-tab">API Management tab</a>.</p>
                        `;
                        
                        // Add event listener to API tab link
                        const apiTabLink = trendingResults.querySelector('.open-api-tab');
                        if (apiTabLink) {
                            apiTabLink.addEventListener('click', (e) => {
                                e.preventDefault();
                                // Switch to API tab
                                document.querySelector('.tab-btn[data-tab="api"]').click();
                                // Switch to YouTube API section
                                document.querySelector('.api-tab-btn[data-api="youtube"]').click();
                            });
                        }
                        
                        window.showNotification('No YouTube API key found', 'warning');
                    });
            })
            .catch(error => {
                console.error('Error importing API management module:', error);
                trendingResults.innerHTML = '<p class="error">Error loading API management module</p>';
                window.showNotification('Error loading API management module', 'error');
            });
    } catch (error) {
        console.error('Error in fetchTrendingTopics:', error);
        trendingResults.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        window.showNotification('Error: ' + error.message, 'error');
    }
}

/**
 * Fetch trending videos directly from YouTube API
 */
async function fetchTrendingVideosFromYouTube(params) {
    // Build URL with parameters
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    
    // Add parameters
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }
    
    try {
        const response = await fetch(url.toString());
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching from YouTube API:', error);
        throw error;
    }
}

/**
 * Extract trending keywords from video data
 */
function extractTrendingKeywords(videos) {
    // Combine all titles and descriptions
    let allText = '';
    
    videos.forEach(video => {
        allText += ' ' + video.snippet.title + ' ' + video.snippet.description;
    });
    
    // Extract keywords using the existing function
    return extractKeywords(allText);
}

/**
 * Display trending topics in the UI
 */
function displayTrendingTopics(videos, trendingKeywords) {
    const trendingResults = document.getElementById('trendingResults');
    
    // Create HTML for trending videos
    let html = '<h3>Trending Videos</h3><div class="trending-videos">';
    
    videos.forEach(video => {
        const viewCount = parseInt(video.statistics.viewCount).toLocaleString();
        const thumbnail = video.snippet.thumbnails.medium.url;
        
        html += `
            <div class="trending-video">
                <div class="video-thumbnail">
                    <img src="${thumbnail}" alt="${video.snippet.title}">
                </div>
                <div class="video-info">
                    <h4>${video.snippet.title}</h4>
                    <p class="video-stats">${viewCount} views</p>
                    <p class="video-channel">${video.snippet.channelTitle}</p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Add trending keywords section
    html += '<h3>Trending Keywords</h3><div class="trending-keywords">';
    
    trendingKeywords.forEach(keyword => {
        html += `<span class="keyword-tag trending">${keyword}</span>`;
    });
    
    html += '</div>';
    
    // Add usage tips
    html += `
        <div class="trending-tips">
            <h3>How to Use Trending Topics</h3>
            <ul>
                <li>Incorporate trending keywords in your video title and description</li>
                <li>Create content that relates to trending topics in your niche</li>
                <li>Analyze trending videos for format and style inspiration</li>
            </ul>
        </div>
    `;
    
    trendingResults.innerHTML = html;
    
    // Add click event to keyword tags to copy them
    const keywordTags = trendingResults.querySelectorAll('.keyword-tag');
    keywordTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const keyword = this.textContent;
            navigator.clipboard.writeText(keyword)
                .then(() => {
                    window.showNotification(`Copied "${keyword}" to clipboard`, 'success');
                })
                .catch(err => {
                    console.error('Error copying keyword:', err);
                });
        });
    });
}

/**
 * Fetch keyword suggestions from API and display them
 */
function fetchKeywordSuggestions() {
    try {
        console.log('Fetching keyword suggestions');
        // Use keywordInput from HTML instead of videoTitle
        const keywordInput = document.getElementById('keywordInput');
        const keywordResults = document.getElementById('keywordSuggestions');
        
        if (!keywordInput || !keywordResults) {
            window.showNotification('Required elements not found in the DOM', 'error');
            return;
        }
        
        const keyword = keywordInput.value.trim();
        if (!keyword) {
            window.showNotification('Please enter a topic or keyword first', 'warning');
            return;
        }
        
        // Show loading state
        keywordResults.innerHTML = '<div class="loading">Fetching keyword suggestions...</div>';
        
        // Get the keyword API key
        import('./api-management.js')
            .then(module => {
                const ApiManagementModule = module.ApiManagementModule;
                
                // Get keyword API key
                ApiManagementModule.getKeywordApiKey()
                    .then(keywordApi => {
                        // Make the actual API call based on the provider
                        fetchKeywordsFromProvider(keyword, keywordApi.key, keywordApi.provider)
                            .then(suggestions => {
                                displayKeywordSuggestions(suggestions);
                                window.showNotification('Keyword suggestions fetched successfully', 'success');
                                window.logActivity('Fetched keyword suggestions for: ' + keyword);
                            })
                            .catch(error => {
                                console.error('Error fetching from keyword provider:', error);
                                keywordResults.innerHTML = `<p class="error">Error: ${error.message}</p>`;
                                window.showNotification('Error fetching keyword data: ' + error.message, 'error');
                                
                                // Fallback to generated suggestions if API fails
                                const fallbackSuggestions = generateKeywordVariations(keyword);
                                displayKeywordSuggestions(fallbackSuggestions);
                                window.showNotification('Using generated suggestions (API failed)', 'warning');
                            });
                    })
                    .catch(error => {
                        console.error('Error getting keyword API key:', error);
                        keywordResults.innerHTML = `
                            <p class="error">No keyword API key found. Using generated suggestions instead.</p>
                            <p class="api-prompt">To get real keyword data, please add a keyword API key in the <a href="#" class="open-api-tab">API Management tab</a>.</p>
                        `;
                        
                        // Add event listener to API tab link
                        const apiTabLink = keywordResults.querySelector('.open-api-tab');
                        if (apiTabLink) {
                            apiTabLink.addEventListener('click', (e) => {
                                e.preventDefault();
                                // Switch to API tab
                                document.querySelector('.tab-btn[data-tab="api"]').click();
                                // Switch to keyword API section
                                document.querySelector('.api-tab-btn[data-api="keyword"]').click();
                            });
                        }
                        
                        // Fallback to generated suggestions
                        const fallbackSuggestions = generateKeywordVariations(keyword);
                        displayKeywordSuggestions(fallbackSuggestions);
                        window.showNotification('Using generated suggestions (no API key)', 'warning');
                    });
            })
            .catch(error => {
                console.error('Error importing API management module:', error);
                keywordResults.innerHTML = '<p class="error">Error loading API management module</p>';
                window.showNotification('Error loading API management module', 'error');
            });
    } catch (error) {
        console.error('Error in fetchKeywordSuggestions:', error);
        window.showNotification('Error generating keyword suggestions', 'error');
    }
}

/**
 * Fetch keywords from the selected provider's API
 */
async function fetchKeywordsFromProvider(keyword, apiKey, provider) {
    console.log(`Fetching keywords from ${provider} for "${keyword}"`);
    
    // Different providers have different endpoints and response formats
    switch(provider) {
        case 'semrush':
            return fetchKeywordsFromSemrush(keyword, apiKey);
        case 'ahrefs':
            return fetchKeywordsFromAhrefs(keyword, apiKey);
        case 'keywordtool':
            return fetchKeywordsFromKeywordTool(keyword, apiKey);
        case 'rapidapi':
            return fetchKeywordsFromRapidApi(keyword, apiKey);
        case 'keywordplanner':
            return fetchKeywordsFromKeywordPlanner(keyword, apiKey);
        default:
            throw new Error(`Unsupported keyword provider: ${provider}`);
    }
}

/**
 * Fetch keywords from SEMrush API
 */
async function fetchKeywordsFromSemrush(keyword, apiKey) {
    // SEMrush API endpoint for related keywords
    const url = `https://api.semrush.com/?type=phrase_related&key=${apiKey}&phrase=${encodeURIComponent(keyword)}&database=us&export_columns=Ph,Nq,Cp,Co,Nr`;
    
    try {
        // In a real implementation, you would make the actual API call
        // For demonstration, we'll simulate a response
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate SEMrush response with real-looking data
        const semrushKeywords = [
            { keyword: `best ${keyword} tutorial`, volume: 5400, difficulty: 67, cpc: 1.23 },
            { keyword: `${keyword} for beginners`, volume: 8200, difficulty: 72, cpc: 1.45 },
            { keyword: `how to use ${keyword}`, volume: 6700, difficulty: 58, cpc: 0.95 },
            { keyword: `${keyword} tips and tricks`, volume: 3200, difficulty: 51, cpc: 0.78 },
            { keyword: `${keyword} vs alternatives`, volume: 2900, difficulty: 63, cpc: 2.10 },
            { keyword: `${keyword} review 2023`, volume: 4100, difficulty: 59, cpc: 1.87 },
            { keyword: `${keyword} tutorial step by step`, volume: 3800, difficulty: 55, cpc: 0.92 },
            { keyword: `advanced ${keyword} techniques`, volume: 1900, difficulty: 68, cpc: 1.35 },
            { keyword: `${keyword} examples`, volume: 5600, difficulty: 61, cpc: 1.12 },
            { keyword: `${keyword} course`, volume: 4300, difficulty: 70, cpc: 2.45 },
            { keyword: `free ${keyword} resources`, volume: 3100, difficulty: 53, cpc: 0.85 },
            { keyword: `${keyword} certification`, volume: 2200, difficulty: 64, cpc: 3.15 },
            { keyword: `${keyword} software`, volume: 4800, difficulty: 69, cpc: 2.75 },
            { keyword: `${keyword} download`, volume: 7300, difficulty: 57, cpc: 1.05 },
            { keyword: `${keyword} online`, volume: 6100, difficulty: 62, cpc: 1.65 }
        ];
        
        // Return just the keywords for consistency with other providers
        return semrushKeywords.map(item => item.keyword);
    } catch (error) {
        console.error('Error fetching from SEMrush:', error);
        throw new Error('Failed to fetch keywords from SEMrush');
    }
}

/**
 * Fetch keywords from Ahrefs API
 */
async function fetchKeywordsFromAhrefs(keyword, apiKey) {
    // Simulate Ahrefs API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate Ahrefs response
    const ahrefsKeywords = [
        `${keyword} tutorial`,
        `learn ${keyword}`,
        `${keyword} guide`,
        `${keyword} for beginners`,
        `${keyword} advanced`,
        `${keyword} examples`,
        `${keyword} tips`,
        `${keyword} tricks`,
        `${keyword} best practices`,
        `${keyword} course`,
        `${keyword} certification`,
        `${keyword} vs competitors`,
        `how to master ${keyword}`,
        `${keyword} step by step`,
        `${keyword} for youtube`
    ];
    
    return ahrefsKeywords;
}

/**
 * Fetch keywords from KeywordTool.io API
 */
async function fetchKeywordsFromKeywordTool(keyword, apiKey) {
    // Simulate KeywordTool.io API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate KeywordTool.io response
    const keywordToolKeywords = [
        `${keyword} how to`,
        `${keyword} tutorial for beginners`,
        `${keyword} advanced tutorial`,
        `${keyword} tips 2023`,
        `best ${keyword} channels`,
        `${keyword} for youtube creators`,
        `${keyword} optimization`,
        `${keyword} strategy`,
        `${keyword} growth hacks`,
        `${keyword} analytics`,
        `${keyword} tools`,
        `free ${keyword} tools`,
        `${keyword} software`,
        `${keyword} for business`,
        `${keyword} for marketing`
    ];
    
    return keywordToolKeywords;
}

/**
 * Fetch keywords from RapidAPI Keywords API
 */
async function fetchKeywordsFromRapidApi(keyword, apiKey) {
    // Simulate RapidAPI call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate RapidAPI response
    const rapidApiKeywords = [
        `${keyword} for youtube`,
        `${keyword} seo tips`,
        `${keyword} optimization guide`,
        `${keyword} ranking factors`,
        `improve ${keyword} performance`,
        `${keyword} analytics tools`,
        `${keyword} traffic increase`,
        `${keyword} engagement strategies`,
        `${keyword} monetization`,
        `${keyword} algorithm`,
        `${keyword} trends 2023`,
        `${keyword} best practices`,
        `${keyword} case studies`,
        `${keyword} success stories`,
        `${keyword} expert advice`
    ];
    
    return rapidApiKeywords;
}

/**
 * Fetch keywords from Google Keyword Planner (simulated)
 */
async function fetchKeywordsFromKeywordPlanner(keyword, apiKey) {
    // Simulate Google Keyword Planner API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate Google Keyword Planner response
    const keywordPlannerKeywords = [
        `${keyword} tutorial`,
        `how to use ${keyword}`,
        `${keyword} for beginners`,
        `${keyword} guide`,
        `${keyword} tips`,
        `${keyword} tricks`,
        `${keyword} hacks`,
        `${keyword} strategies`,
        `${keyword} for youtube`,
        `${keyword} for content creators`,
        `${keyword} optimization`,
        `${keyword} tools`,
        `best ${keyword} practices`,
        `${keyword} examples`,
        `${keyword} case studies`
    ];
    
    return keywordPlannerKeywords;
}

/**
 * Generate variations of a keyword
 */
function generateKeywordVariations(topic) {
    const variations = [];
    
    // Add the topic itself
    variations.push(topic);
    
    // Add common prefixes
    const prefixes = ['how to', 'best', 'top', 'why', 'what is', 'guide to', 'tips for', 'ways to'];
    prefixes.forEach(prefix => {
        if (!topic.toLowerCase().startsWith(prefix)) {
            variations.push(`${prefix} ${topic}`);
        }
    });
    
    // Add common suffixes
    const suffixes = ['tutorial', 'guide', 'tips', 'ideas', 'examples', 'for beginners', '2023', 'review'];
    suffixes.forEach(suffix => {
        if (!topic.toLowerCase().endsWith(suffix)) {
            variations.push(`${topic} ${suffix}`);
        }
    });
    
    // Add questions
    variations.push(`how to ${topic}`);
    variations.push(`why ${topic} is important`);
    variations.push(`what is ${topic}`);
    
    // Filter out duplicates
    return [...new Set(variations)];
}

/**
 * Display keyword suggestions in the UI
 */
function displayKeywordSuggestions(suggestions) {
    try {
        // Use keywordSuggestions instead of keywordResults to match the HTML
        const keywordSuggestions = document.getElementById('keywordSuggestions');
        if (!keywordSuggestions) {
            console.warn('Keyword suggestions container not found');
            return;
        }
        
        if (!suggestions || suggestions.length === 0) {
            keywordSuggestions.innerHTML = '<p>No keyword suggestions available</p>';
            return;
        }
        
        // Group suggestions by category
        const categories = [
            { name: 'High Volume', keywords: suggestions.slice(0, 5) },
            { name: 'Long Tail', keywords: suggestions.slice(5, 10) },
            { name: 'Questions', keywords: suggestions.slice(10, 15) }
        ];
        
        let html = '<div class="keyword-categories">';
        
        categories.forEach(category => {
            html += `
                <div class="keyword-category">
                    <h3>${category.name}</h3>
                    <ul class="keyword-list">
                        ${category.keywords.map(keyword => `
                            <li class="keyword-item">
                                <span class="keyword-text">${keyword}</span>
                                <div class="keyword-actions">
                                    <button class="btn-icon add-to-title" data-keyword="${keyword}">
                                        <i class="fas fa-heading"></i>
                                    </button>
                                    <button class="btn-icon add-to-description" data-keyword="${keyword}">
                                        <i class="fas fa-align-left"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        });
        
        html += '</div>';
        
        keywordSuggestions.innerHTML = html;
        
        // Add event listeners to the action buttons
        const addToTitleButtons = keywordSuggestions.querySelectorAll('.add-to-title');
        addToTitleButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const keyword = this.dataset.keyword;
                const titleInput = document.getElementById('videoTitle');
                
                if (titleInput && keyword) {
                    titleInput.value = (titleInput.value.trim() + ' ' + keyword).trim();
                    window.showNotification(`Added "${keyword}" to title`, 'success');
                }
            });
        });
        
        const addToDescriptionButtons = keywordSuggestions.querySelectorAll('.add-to-description');
        addToDescriptionButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const keyword = this.dataset.keyword;
                const descriptionInput = document.getElementById('videoDescription');
                
                if (descriptionInput && keyword) {
                    descriptionInput.value = (descriptionInput.value.trim() + '\n\n' + keyword).trim();
                    window.showNotification(`Added "${keyword}" to description`, 'success');
                }
            });
        });
    } catch (error) {
        console.error('Error displaying keyword suggestions:', error);
    }
}

/**
 * Generate tags for YouTube video
 */
function generateTags() {
    try {
        console.log('Generating tags');
        const videoTitle = document.getElementById('videoTitle');
        const videoDescription = document.getElementById('videoDescription');
        const tagsContainer = document.getElementById('generatedTags');
        
        if (!videoTitle || !tagsContainer) {
            window.showNotification('Required elements not found', 'error');
            return;
        }
        
        if (!videoTitle.value.trim()) {
            window.showNotification('Please enter a video title first', 'warning');
            return;
        }
        
        // Show loading state
        tagsContainer.innerHTML = '<div class="loading">Generating tags...</div>';
        
        // Extract keywords from title and description
        const title = videoTitle.value.trim();
        const description = videoDescription ? videoDescription.value.trim() : '';
        const extractedKeywords = extractKeywords(title + ' ' + description);
        
        // Generate tags
        setTimeout(() => {
            // Generate different types of tags
            const primaryTags = extractedKeywords.slice(0, 5);
            const secondaryTags = extractedKeywords.slice(5).map(kw => {
                // Add some variations
                const variations = [
                    kw,
                    'best ' + kw,
                    kw + ' tips',
                    'how to ' + kw,
                    kw + ' tutorial'
                ];
                return variations[Math.floor(Math.random() * variations.length)];
            });
            
            // Combine tags
            const allTags = [...primaryTags, ...secondaryTags].slice(0, 15); // YouTube has a limit
            
            // Display tags
            displayGeneratedTags(allTags);
            
            window.showNotification('Tags generated successfully', 'success');
            window.logActivity('Generated video tags');
        }, 1000);
    } catch (error) {
        console.error('Error generating tags:', error);
        window.showNotification('Error generating tags', 'error');
    }
}

/**
 * Display generated tags in the UI
 */
function displayGeneratedTags(tags) {
    try {
        const tagsContainer = document.getElementById('generatedTags');
        if (!tagsContainer) return;
        
        let html = `
            <div class="tags-header">
                <h3>Generated Tags (${tags.length})</h3>
                <button id="copyAllTags" class="btn-secondary">Copy All</button>
            </div>
            <div class="tags-list">
                ${tags.map(tag => `
                    <div class="tag-item">
                        <span class="tag-text">${tag}</span>
                        <button class="btn-icon copy-tag" data-tag="${tag}">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="tags-note">
                <p>YouTube allows up to 500 characters of tags. Current count: ${tags.join(',').length}/500</p>
            </div>
        `;
        
        tagsContainer.innerHTML = html;
        
        // Add event listeners
        const copyAllTagsBtn = document.getElementById('copyAllTags');
        if (copyAllTagsBtn) {
            copyAllTagsBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(tags.join(','))
                    .then(() => {
                        window.showNotification('All tags copied to clipboard', 'success');
                    })
                    .catch(err => {
                        console.error('Error copying tags:', err);
                        window.showNotification('Error copying tags', 'error');
                    });
            });
        }
        
        const copyTagButtons = tagsContainer.querySelectorAll('.copy-tag');
        copyTagButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const tag = this.dataset.tag;
                navigator.clipboard.writeText(tag)
                    .then(() => {
                        window.showNotification(`Tag "${tag}" copied to clipboard`, 'success');
                    })
                    .catch(err => {
                        console.error('Error copying tag:', err);
                        window.showNotification('Error copying tag', 'error');
                    });
            });
        });
    } catch (error) {
        console.error('Error displaying tags:', error);
    }
}

/**
 * Analyze keywords for search volume and competition
 */
/**
 * Display keyword trend data in a chart
 */
function displayKeywordTrends(keyword) {
    try {
        console.log('Displaying trend for keyword:', keyword);
        const trendsContainer = document.getElementById('keywordTrends');
        
        if (!trendsContainer) {
            console.error('Trends container not found');
            return;
        }
        
        // Show loading state
        trendsContainer.innerHTML = '<div class="loading">Loading trend data for "' + keyword + '"...</div>';
        
        // Generate mock trend data (in a real app, this would come from an API)
        setTimeout(() => {
            // Generate 12 months of data
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentMonth = new Date().getMonth();
            const lastYear = [];
            
            // Create data for the last 12 months
            for (let i = 0; i < 12; i++) {
                const monthIndex = (currentMonth - 11 + i + 12) % 12;
                lastYear.push({
                    month: months[monthIndex],
                    volume: Math.floor(Math.random() * 5000) + 500
                });
            }
            
            // Calculate growth percentage
            const firstMonth = lastYear[0].volume;
            const lastMonth = lastYear[11].volume;
            const growthPercent = ((lastMonth - firstMonth) / firstMonth * 100).toFixed(1);
            const growthClass = growthPercent >= 0 ? 'positive' : 'negative';
            
            // Create HTML for the trend chart
            const html = `
                <div class="trend-header">
                    <h3>Trend Analysis: "${keyword}"</h3>
                    <div class="trend-summary">
                        <span class="growth ${growthClass}">
                            ${growthPercent >= 0 ? '+' : ''}${growthPercent}% 
                            ${growthPercent >= 0 ? '↑' : '↓'}
                        </span>
                        <span class="period">Last 12 months</span>
                    </div>
                    <button class="close-trend">×</button>
                </div>
                <div class="trend-chart">
                    <div class="chart-bars">
                        ${lastYear.map(data => {
                            const height = (data.volume / 5000) * 100;
                            return `
                                <div class="chart-bar-container">
                                    <div class="chart-bar" style="height: ${height}%;" title="${data.volume} searches"></div>
                                    <div class="chart-label">${data.month}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="trend-insights">
                    <h4>Insights</h4>
                    <ul>
                        <li>This keyword has ${growthPercent >= 0 ? 'grown' : 'declined'} by ${Math.abs(growthPercent)}% over the last year.</li>
                        <li>Peak search volume was in ${lastYear.reduce((max, data, index) => data.volume > lastYear[max].volume ? index : max, 0) === 11 ? 'the current month' : lastYear[lastYear.reduce((max, data, index) => data.volume > lastYear[max].volume ? index : max, 0)].month}.</li>
                        <li>${growthPercent >= 0 ? 'This is a good keyword to target as interest is growing.' : 'Consider if this keyword is still relevant as interest is declining.'}</li>
                    </ul>
                </div>
                <div class="trend-actions">
                    <button class="btn-primary add-to-title" data-keyword="${keyword}">Add to Title</button>
                    <button class="btn-secondary add-to-description" data-keyword="${keyword}">Add to Description</button>
                </div>
            `;
            
            trendsContainer.innerHTML = html;
            
            // Add event listeners
            const closeButton = trendsContainer.querySelector('.close-trend');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    trendsContainer.innerHTML = '';
                });
            }
            
            const addToTitleButton = trendsContainer.querySelector('.add-to-title');
            if (addToTitleButton) {
                addToTitleButton.addEventListener('click', () => {
                    const titleInput = document.getElementById('videoTitle');
                    if (titleInput && !titleInput.value.includes(keyword)) {
                        titleInput.value = titleInput.value ? `${titleInput.value} ${keyword}` : keyword;
                        window.showNotification(`Added "${keyword}" to title`, 'success');
                    }
                });
            }
            
            const addToDescriptionButton = trendsContainer.querySelector('.add-to-description');
            if (addToDescriptionButton) {
                addToDescriptionButton.addEventListener('click', () => {
                    const descriptionInput = document.getElementById('videoDescription');
                    if (descriptionInput && !descriptionInput.value.includes(keyword)) {
                        descriptionInput.value = descriptionInput.value ? `${descriptionInput.value}\n\n${keyword}` : keyword;
                        window.showNotification(`Added "${keyword}" to description`, 'success');
                    }
                });
            }
        }, 1000);
    } catch (error) {
        console.error('Error displaying keyword trends:', error);
        window.showNotification('Error displaying keyword trends', 'error');
    }
}

function analyzeKeywords() {
    try {
        console.log('Analyzing keywords');
        const keywordInput = document.getElementById('keywordInput');
        const videoTitle = document.getElementById('videoTitle');
        const analysisContainer = document.getElementById('keywordAnalysis');
        
        if (!analysisContainer) {
            window.showNotification('Required elements not found', 'error');
            return;
        }
        
        // Use either the keyword input or video title
        let keywords = '';
        if (keywordInput && keywordInput.value.trim()) {
            keywords = keywordInput.value.trim();
        } else if (videoTitle && videoTitle.value.trim()) {
            keywords = videoTitle.value.trim();
        } else {
            window.showNotification('Please enter keywords or a video title first', 'warning');
            return;
        }
        
        // Show loading state
        analysisContainer.innerHTML = '<div class="loading">Analyzing keywords...</div>';
        
        // In a real implementation, this would call an API
        // For demo, we'll generate mock data
        setTimeout(() => {
            const extractedKeywords = extractKeywords(keywords);
            
            // Generate mock analysis data
            const analysisData = extractedKeywords.map(keyword => {
                return {
                    keyword: keyword,
                    searchVolume: Math.floor(Math.random() * 10000) + 100,
                    competition: Math.random().toFixed(2),
                    difficulty: (Math.random() * 100).toFixed(1),
                    trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)]
                };
            });
            
            displayKeywordAnalysis(analysisData);
            
            // Add event listeners for trend buttons
            setTimeout(() => {
                const trendButtons = document.querySelectorAll('.analyze-trend');
                trendButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const keyword = this.getAttribute('data-keyword');
                        if (keyword) {
                            displayKeywordTrends(keyword);
                        }
                    });
                });
                
                // Add event listener for export button
                const exportButton = document.getElementById('exportAnalysis');
                if (exportButton) {
                    exportButton.addEventListener('click', function() {
                        exportKeywordAnalysis(analysisData);
                    });
                }
            }, 100);
            
            window.showNotification('Keyword analysis completed', 'success');
            window.logActivity('Analyzed keywords');
        }, 2000);
    } catch (error) {
        console.error('Error analyzing keywords:', error);
        window.showNotification('Error analyzing keywords', 'error');
    }
}

/**
 * Export keyword analysis data to CSV
 */
function exportKeywordAnalysis(analysisData) {
    try {
        if (!analysisData || analysisData.length === 0) {
            window.showNotification('No data to export', 'warning');
            return;
        }
        
        // Create CSV content
        const headers = ['Keyword', 'Search Volume', 'Competition', 'Difficulty', 'Trend'];
        let csvContent = headers.join(',') + '\n';
        
        // Add data rows
        analysisData.forEach(data => {
            const row = [
                `"${data.keyword}"`,
                data.searchVolume,
                data.competition,
                data.difficulty,
                data.trend
            ];
            csvContent += row.join(',') + '\n';
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'keyword_analysis.csv');
        link.style.visibility = 'hidden';
        
        // Add to document, click and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.showNotification('Keyword analysis exported to CSV', 'success');
        window.logActivity('Exported keyword analysis data');
    } catch (error) {
        console.error('Error exporting keyword analysis:', error);
        window.showNotification('Error exporting data', 'error');
    }
}

/**
 * Display keyword analysis in the UI
 */
/**
 * Get CSS class for difficulty level
 */

function displayKeywordAnalysis(analysisData) {
    try {
        const analysisContainer = document.getElementById('keywordAnalysis');
        if (!analysisContainer) return;
        
        let html = `
            <div class="analysis-header">
                <h3>Keyword Analysis</h3>
                <button id="exportAnalysis" class="btn-secondary">Export</button>
            </div>
            <div class="analysis-table">
                <table>
                    <thead>
                        <tr>
                            <th>Keyword</th>
                            <th>Search Volume</th>
                            <th>Competition</th>
                            <th>Difficulty</th>
                            <th>Trend</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${analysisData.map(data => `
                            <tr>
                                <td>${data.keyword}</td>
                                <td>${data.searchVolume.toLocaleString()}</td>
                                <td>
                                    <div class="competition-meter">
                                        <div class="meter-fill" style="width: ${data.competition * 100}%"></div>
                                    </div>
                                    <span>${data.competition}</span>
                                </td>
                                <td>
                                    <span class="difficulty-badge ${getDifficultyClass(data.difficulty)}">${data.difficulty}</span>
                                </td>
                                <td>
                                    <span class="trend-icon ${data.trend}">
                                        ${data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn-small analyze-trend" data-keyword="${data.keyword}">View Trend</button>
                                </td>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        analysisContainer.innerHTML = html;
        
        // Add event listeners
        const exportAnalysisBtn = document.getElementById('exportAnalysis');
        if (exportAnalysisBtn) {
            exportAnalysisBtn.addEventListener('click', function() {
                window.showNotification('Analysis exported to CSV', 'success');
            });
        }
    } catch (error) {
        console.error('Error displaying keyword analysis:', error);
    }
}

/**
 * Helper function to get difficulty class for styling
 */
function getDifficultyClass(difficulty) {
    const diff = parseFloat(difficulty);
    if (diff < 33) return 'easy';
    if (diff < 66) return 'medium';
    return 'hard';
}

/**
 * Analyze a thumbnail image for SEO and visual effectiveness
 */
function analyzeThumbnail() {
    try {
        const thumbnailFile = document.getElementById('thumbnailFile');
        const thumbnailPreview = document.getElementById('thumbnailPreview');
        const thumbnailAnalysis = document.getElementById('thumbnailAnalysis');
        
        if (!thumbnailFile || !thumbnailFile.files || thumbnailFile.files.length === 0) {
            window.showNotification('Please select a thumbnail image to analyze', 'warning');
            return;
        }
        
        if (!thumbnailPreview || !thumbnailAnalysis) {
            window.showNotification('Preview or analysis container not found', 'error');
            return;
        }
        
        // Show loading state
        thumbnailAnalysis.innerHTML = '<div class="loading">Analyzing thumbnail...</div>';
        
        const file = thumbnailFile.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Create an image element to analyze
            const img = new Image();
            img.onload = function() {
                // Analyze the image
                const analysis = performThumbnailAnalysis(img);
                
                // Display analysis results
                displayThumbnailAnalysis(analysis, thumbnailAnalysis);
            };
            
            // Set image source
            img.src = e.target.result;
            
            // Display preview
            thumbnailPreview.innerHTML = `<img src="${e.target.result}" alt="Thumbnail Preview" style="max-width: 100%; height: auto;">`;
        };
        
        reader.readAsDataURL(file);
        
        // Log activity
        if (typeof logActivity === 'function') {
            window.logActivity('Analyzed thumbnail image');
        } else if (typeof window.logActivity === 'function') {
            window.logActivity('Analyzed thumbnail image');
        } else {
            console.log('Activity Log: Analyzed thumbnail image');
        }
    } catch (error) {
        console.error('Error analyzing thumbnail:', error);
        
        // Show notification
        if (typeof showNotification === 'function') {
            window.showNotification('Error analyzing thumbnail: ' + error.message, 'error');
        } else if (typeof window.showNotification === 'function') {
            window.showNotification('Error analyzing thumbnail: ' + error.message, 'error');
        } else {
            console.error('Notification: Error analyzing thumbnail: ' + error.message);
        }
    }
}

/**
 * Perform analysis on a thumbnail image
 * @param {HTMLImageElement} img - The image element to analyze
 * @returns {Object} Analysis results
 */
function performThumbnailAnalysis(img) {
    // Create a canvas to analyze the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Check dimensions
    const dimensionsScore = checkDimensions(img.width, img.height);
    
    // Analyze colors
    const colorAnalysis = analyzeColors(data);
    
    // Analyze contrast
    const contrastScore = analyzeContrast(data);
    
    // Analyze brightness
    const brightnessScore = analyzeBrightness(data);
    
    // Check for text (simplified estimation)
    const textEstimation = estimateTextPresence(imageData);
    
    // Calculate overall score
    const overallScore = Math.round(
        (dimensionsScore.score + 
         colorAnalysis.score + 
         contrastScore.score + 
         brightnessScore.score + 
         textEstimation.score) / 5
    );
    
    return {
        dimensions: dimensionsScore,
        colors: colorAnalysis,
        contrast: contrastScore,
        brightness: brightnessScore,
        text: textEstimation,
        overallScore
    };
}

/**
 * Check if thumbnail dimensions are optimal
 */
function checkDimensions(width, height) {
    // YouTube recommended thumbnail size is 1280x720 (16:9)
    const idealWidth = 1280;
    const idealHeight = 720;
    const idealRatio = idealWidth / idealHeight;
    
    const actualRatio = width / height;
    const ratioDifference = Math.abs(actualRatio - idealRatio);
    
    let score = 100;
    let message = 'Dimensions are optimal for YouTube (16:9 ratio).';
    let status = 'good';
    
    // Check ratio
    if (ratioDifference > 0.1) {
        score -= 30;
        message = `Aspect ratio (${actualRatio.toFixed(2)}) differs from recommended 16:9 (${idealRatio}).`;
        status = 'warning';
    }
    
    // Check resolution
    if (width < idealWidth || height < idealHeight) {
        score -= 20;
        message += ` Resolution (${width}x${height}) is lower than recommended (${idealWidth}x${idealHeight}).`;
        status = 'warning';
    }
    
    return {
        score,
        message,
        status,
        width,
        height,
        ratio: actualRatio.toFixed(2)
    };
}

/**
 * Analyze color distribution in the thumbnail
 */
function analyzeColors(data) {
    // Count colors by grouping similar RGB values
    const colorGroups = {};
    const totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
        // Group colors by rounding to nearest 20
        const r = Math.round(data[i] / 20) * 20;
        const g = Math.round(data[i + 1] / 20) * 20;
        const b = Math.round(data[i + 2] / 20) * 20;
        
        const colorKey = `${r},${g},${b}`;
        colorGroups[colorKey] = (colorGroups[colorKey] || 0) + 1;
    }
    
    // Sort colors by frequency
    const sortedColors = Object.entries(colorGroups)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([color, count]) => {
            const [r, g, b] = color.split(',').map(Number);
            return {
                color: `rgb(${r}, ${g}, ${b})`,
                percentage: Math.round((count / totalPixels) * 100)
            };
        });
    
    // Analyze color variety
    const colorCount = Object.keys(colorGroups).length;
    let score = 0;
    let message = '';
    let status = '';
    
    if (colorCount < 10) {
        score = 40;
        message = 'Limited color palette. Consider adding more visual variety.';
        status = 'warning';
    } else if (colorCount < 30) {
        score = 70;
        message = 'Good color variety, but could be more vibrant.';
        status = 'good';
    } else {
        score = 90;
        message = 'Excellent color variety and visual appeal.';
        status = 'good';
    }
    
    // Check if there's a dominant color (>50%)
    const dominantColor = sortedColors[0];
    if (dominantColor && dominantColor.percentage > 50) {
        message += ` Dominant color (${dominantColor.percentage}%) may overwhelm the thumbnail.`;
        score -= 10;
    }
    
    return {
        score,
        message,
        status,
        colorCount,
        dominantColors: sortedColors
    };
}

/**
 * Analyze contrast in the thumbnail
 */
function analyzeContrast(data) {
    // Calculate luminance for each pixel
    const luminances = [];
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate luminance (perceived brightness)
        // Using the formula: 0.299*R + 0.587*G + 0.114*B
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        luminances.push(luminance);
    }
    
    // Sort luminances
    luminances.sort((a, b) => a - b);
    
    // Get 10th and 90th percentiles to avoid outliers
    const darkLuminance = luminances[Math.floor(luminances.length * 0.1)];
    const brightLuminance = luminances[Math.floor(luminances.length * 0.9)];
    
    // Calculate contrast ratio
    const contrastRatio = (brightLuminance + 5) / (darkLuminance + 5);
    
    let score = 0;
    let message = '';
    let status = '';
    
    if (contrastRatio < 3) {
        score = 30;
        message = 'Low contrast. Text may be hard to read.';
        status = 'warning';
    } else if (contrastRatio < 4.5) {
        score = 60;
        message = 'Moderate contrast. Consider increasing for better readability.';
        status = 'warning';
    } else if (contrastRatio < 7) {
        score = 80;
        message = 'Good contrast. Text should be readable.';
        status = 'good';
    } else {
        score = 100;
        message = 'Excellent contrast. Very readable.';
        status = 'good';
    }
    
    return {
        score,
        message,
        status,
        contrastRatio: contrastRatio.toFixed(2)
    };
}

/**
 * Analyze brightness in the thumbnail
 */
function analyzeBrightness(data) {
    let totalBrightness = 0;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate brightness
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
    }
    
    const averageBrightness = totalBrightness / (data.length / 4);
    const brightnessPercentage = Math.round((averageBrightness / 255) * 100);
    
    let score = 0;
    let message = '';
    let status = '';
    
    if (brightnessPercentage < 30) {
        score = 40;
        message = 'Image is too dark. Consider brightening.';
        status = 'warning';
    } else if (brightnessPercentage > 80) {
        score = 50;
        message = 'Image is too bright. Consider adding more contrast.';
        status = 'warning';
    } else if (brightnessPercentage > 60) {
        score = 90;
        message = 'Good brightness level. Thumbnail should be visible in most contexts.';
        status = 'good';
    } else {
        score = 80;
        message = 'Acceptable brightness level.';
        status = 'good';
    }
    
    return {
        score,
        message,
        status,
        brightnessPercentage
    };
}

/**
 * Estimate if text is present in the thumbnail (simplified)
 */
function estimateTextPresence(imageData) {
    // This is a simplified estimation based on edge detection
    // For a real implementation, you would need a more sophisticated OCR approach
    
    const edgeCount = detectEdges(imageData);
    const edgeDensity = edgeCount / (imageData.width * imageData.height);
    
    let score = 0;
    let message = '';
    let status = '';
    
    if (edgeDensity < 0.05) {
        score = 40;
        message = 'Little or no text detected. Consider adding a clear headline.';
        status = 'warning';
    } else if (edgeDensity < 0.1) {
        score = 70;
        message = 'Some text detected. Ensure it\'s readable and concise.';
        status = 'good';
    } else if (edgeDensity < 0.2) {
        score = 90;
        message = 'Good amount of text detected. Keep it readable.';
        status = 'good';
    } else {
        score = 60;
        message = 'Possibly too much text. Keep it simple and readable.';
        status = 'warning';
    }
    
    return {
        score,
        message,
        status,
        textEstimation: edgeDensity > 0.05 ? 'Present' : 'Minimal or none'
    };
}

/**
 * Simple edge detection for text estimation
 */
function detectEdges(imageData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    
    // Apply a simple edge detection filter
    const edgeData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = edgeData.data;
    let edgeCount = 0;
    
    // Simple Sobel operator for edge detection
    for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4;
            
            // Get surrounding pixels
            const topLeft = ((y - 1) * canvas.width + (x - 1)) * 4;
            const top = ((y - 1) * canvas.width + x) * 4;
            const topRight = ((y - 1) * canvas.width + (x + 1)) * 4;
            const left = (y * canvas.width + (x - 1)) * 4;
            const right = (y * canvas.width + (x + 1)) * 4;
            const bottomLeft = ((y + 1) * canvas.width + (x - 1)) * 4;
            const bottom = ((y + 1) * canvas.width + x) * 4;
            const bottomRight = ((y + 1) * canvas.width + (x + 1)) * 4;
            
            // Calculate gradient (simplified)
            const gx = 
                -1 * data[topLeft] + 
                -2 * data[left] + 
                -1 * data[bottomLeft] + 
                1 * data[topRight] + 
                2 * data[right] + 
                1 * data[bottomRight];
                
            const gy = 
                -1 * data[topLeft] + 
                -2 * data[top] + 
                -1 * data[topRight] + 
                1 * data[bottomLeft] + 
                2 * data[bottom] + 
                1 * data[bottomRight];
                
            // Calculate gradient magnitude
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            
            // Count edges above threshold
            if (magnitude > 50) {
                edgeCount++;
            }
        }
    }
    
    return edgeCount;
}

/**
 * Display thumbnail analysis results
 */
function displayThumbnailAnalysis(analysis, container) {
    // Create HTML for analysis results
    const html = `
        <div class="analysis-results">
            <div class="overall-score">
                <h3>Overall Score: ${analysis.overallScore}%</h3>
                <div class="score-meter">
                    <div class="score-fill" style="width: ${analysis.overallScore}%;"></div>
                </div>
            </div>
            
            <div class="analysis-section">
                <h4>Dimensions</h4>
                <div class="analysis-item ${analysis.dimensions.status}">
                    <div class="item-header">
                        <span class="item-title">Size: ${analysis.dimensions.width}x${analysis.dimensions.height} (${analysis.dimensions.ratio} ratio)</span>
                        <span class="item-score">${analysis.dimensions.score}%</span>
                    </div>
                    <p>${analysis.dimensions.message}</p>
                </div>
            </div>
            
            <div class="analysis-section">
                <h4>Colors</h4>
                <div class="analysis-item ${analysis.colors.status}">
                    <div class="item-header">
                        <span class="item-title">Color Variety: ${analysis.colors.colorCount} distinct colors</span>
                        <span class="item-score">${analysis.colors.score}%</span>
                    </div>
                    <p>${analysis.colors.message}</p>
                    <div class="color-palette">
                        ${analysis.colors.dominantColors.map(color => `
                            <div class="color-swatch" style="background-color: ${color.color};" title="${color.percentage}%"></div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="analysis-section">
                <h4>Contrast</h4>
                <div class="analysis-item ${analysis.contrast.status}">
                    <div class="item-header">
                        <span class="item-title">Contrast Ratio: ${analysis.contrast.contrastRatio}</span>
                        <span class="item-score">${analysis.contrast.score}%</span>
                    </div>
                    <p>${analysis.contrast.message}</p>
                </div>
            </div>
            
            <div class="analysis-section">
                <h4>Brightness</h4>
                <div class="analysis-item ${analysis.brightness.status}">
                    <div class="item-header">
                        <span class="item-title">Brightness: ${analysis.brightness.brightnessPercentage}%</span>
                        <span class="item-score">${analysis.brightness.score}%</span>
                    </div>
                    <p>${analysis.brightness.message}</p>
                </div>
            </div>
            
            <div class="analysis-section">
                <h4>Text</h4>
                <div class="analysis-item ${analysis.text.status}">
                    <div class="item-header">
                        <span class="item-title">Text: ${analysis.text.textEstimation}</span>
                        <span class="item-score">${analysis.text.score}%</span>
                    </div>
                    <p>${analysis.text.message}</p>
                </div>
            </div>
            
            <div class="recommendations">
                <h4>Recommendations</h4>
                <ul>
                    ${analysis.dimensions.score < 80 ? '<li>Resize your thumbnail to 1280x720 pixels (16:9 ratio).</li>' : ''}
                    ${analysis.colors.score < 80 ? '<li>Add more color variety to make your thumbnail stand out.</li>' : ''}
                    ${analysis.contrast.score < 80 ? '<li>Increase contrast to make text more readable.</li>' : ''}
                    ${analysis.brightness.score < 80 ? '<li>Adjust brightness for better visibility.</li>' : ''}
                    ${analysis.text.score < 80 ? '<li>Add clear, concise text that communicates your video content.</li>' : ''}
                    <li>Use bold, easy-to-read fonts if adding text.</li>
                    <li>Include a close-up of a face if applicable (increases CTR).</li>
                    <li>Ensure your thumbnail is recognizable even at small sizes.</li>
                </ul>
            </div>
        </div>
    `;
    
    // Update container
    container.innerHTML = html;
    
    // Show notification
    if (typeof window.showNotification === 'function') {
        window.showNotification('Thumbnail analysis complete', 'success');
    } else {
        console.log('Notification: Thumbnail analysis complete');
    }
}