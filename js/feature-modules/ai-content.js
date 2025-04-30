/**
 * AI Content Module for YouTube SEO Booster
 * Handles AI-powered content generation using OpenAI API
 */

// Import required modules
import { ApiManagementModule } from './api-management.js';
// Use global utility functions
// These functions are defined globally in main.js
// Ensure they're available before using them

// Export functions for use in main.js
export const AiContentModule = {
    generateDescription,
    generateThumbnailSuggestions,
    analyzeContent,
    generateTitleSuggestions,
    generateHashtags,
    generateContentIdeas
};

/**
 * Generate AI-powered video description
 */
async function generateDescription(title, keywords, options = {}) {
    try {
        const descriptionContainer = document.getElementById('generatedDescriptions');
        if (!descriptionContainer) {
            window.showNotification('Description container not found', 'error');
            return;
        }
        
        // Show loading state
        descriptionContainer.innerHTML = '<div class="loading">Generating optimized description...</div>';
        
        // Get OpenAI API key
        const openaiConfig = await ApiManagementModule.getOpenAiApiKey().catch(error => {
            console.error('Error getting OpenAI API key:', error);
            descriptionContainer.innerHTML = `
                <p class="error">No OpenAI API key found. Please add an API key to use AI-powered description generation.</p>
                <p class="api-prompt">To use AI features, please add an OpenAI API key in the <a href="#" class="open-api-tab">API Management tab</a>.</p>
            `;
            
            // Add event listener to API tab link
            const apiTabLink = descriptionContainer.querySelector('.open-api-tab');
            if (apiTabLink) {
                apiTabLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Switch to API tab
                    document.querySelector('.tab-btn[data-tab="api"]').click();
                    // Switch to OpenAI API section
                    document.querySelector('.api-tab-btn[data-api="openai"]').click();
                });
            }
            
            window.showNotification('No OpenAI API key found', 'warning');
            throw error;
        });
        
        // Prepare prompt for OpenAI
        const prompt = createDescriptionPrompt(title, keywords, options);
        
        // Call OpenAI API
        const description = await callOpenAiApi(prompt, openaiConfig);
        
        // Display generated description
        displayGeneratedDescription(description, title, keywords);
        
        // Log activity
        window.logActivity('Generated AI description for: ' + title);
        window.showNotification('Description generated successfully', 'success');
        
        return description;
    } catch (error) {
        console.error('Error generating description:', error);
        window.showNotification('Error generating description: ' + error.message, 'error');
        
        // Return a basic description as fallback
        return generateBasicDescription(title, keywords);
    }
}

/**
 * Create prompt for OpenAI description generation
 */
function createDescriptionPrompt(title, keywords, options) {
    const keywordsText = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    const includeTimestamps = options.includeTimestamps || false;
    const includeCallToAction = options.includeCallToAction !== false; // Default to true
    const includeLinks = options.includeLinks || false;
    const tone = options.tone || 'professional';
    
    let prompt = `Generate an SEO-optimized YouTube video description for a video titled "${title}". 
The description should include the following keywords: ${keywordsText}.

The description should:
- Be between 200-300 words
- Have a ${tone} tone
- Include the main keywords naturally throughout the text
- Be engaging and informative
- Be formatted with appropriate paragraphs and spacing`;
    
    if (includeTimestamps) {
        prompt += `
- Include 5-7 timestamps for key moments in the video (e.g., "0:00 Introduction", "2:15 Key Point 1")`;
    }
    
    if (includeCallToAction) {
        prompt += `
- Include a call to action for viewers to like, subscribe, and comment`;
    }
    
    if (includeLinks) {
        prompt += `
- Include placeholders for relevant links (e.g., "[LINK: Website]", "[LINK: Related Video]")`;
    }
    
    return prompt;
}

/**
 * Call OpenAI API
 */
async function callOpenAiApi(prompt, openaiConfig) {
    try {
        // In a real implementation, this would make an actual API call to OpenAI
        // For demonstration, we'll simulate a response
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For now, return a simulated response
        // In a real implementation, you would make the actual API call:
        /*
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiConfig.key}`
            },
            body: JSON.stringify({
                model: openaiConfig.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that generates SEO-optimized content for YouTube videos.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
        */
        
        // Simulated response based on the prompt
        if (prompt.includes('timestamps')) {
            return generateSimulatedDescriptionWithTimestamps(prompt);
        } else {
            return generateSimulatedDescription(prompt);
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
}

/**
 * Generate a simulated description (for demonstration)
 */
function generateSimulatedDescription(prompt) {
    // Extract title and keywords from prompt
    const titleMatch = prompt.match(/titled "([^"]+)"/);
    const keywordsMatch = prompt.match(/keywords: ([^\.]+)/);
    
    const title = titleMatch ? titleMatch[1] : 'YouTube Video';
    const keywordsText = keywordsMatch ? keywordsMatch[1] : '';
    const keywords = keywordsText.split(',').map(k => k.trim());
    
    // Create a simulated AI-generated description
    return `🔍 ${title} - Ultimate Guide ${new Date().getFullYear()}

In this comprehensive video, we dive deep into ${keywords[0] || 'the topic'} and explore everything you need to know to master ${keywords[1] || 'these skills'}. Whether you're a beginner or advanced user, this tutorial covers all the essential aspects of ${keywords[0] || 'the subject'}.

We'll walk you through step-by-step instructions on how to implement ${keywords[2] || 'these techniques'} effectively, showing you real-world examples and practical applications. Our expert tips will help you avoid common mistakes and accelerate your learning process.

What makes this guide different is our focus on ${keywords[3] || 'optimization'} and ${keywords[0] || 'performance'}, ensuring you get the best results possible. We've researched the latest trends and best practices to bring you the most up-to-date information.

👍 If you found this video helpful, please give it a thumbs up and SUBSCRIBE to our channel for more content like this! Hit the notification bell to stay updated with our latest uploads.

💬 Share your experience with ${keywords[0] || 'this topic'} in the comments below. We'd love to hear your thoughts and answer any questions you might have!

#${keywords[0]?.replace(/\s+/g, '')} #${keywords[1]?.replace(/\s+/g, '')} #Tutorial #Guide #HowTo`;
}

/**
 * Generate a simulated description with timestamps (for demonstration)
 */
function generateSimulatedDescriptionWithTimestamps(prompt) {
    // Extract title and keywords from prompt
    const titleMatch = prompt.match(/titled "([^"]+)"/);
    const keywordsMatch = prompt.match(/keywords: ([^\.]+)/);
    
    const title = titleMatch ? titleMatch[1] : 'YouTube Video';
    const keywordsText = keywordsMatch ? keywordsMatch[1] : '';
    const keywords = keywordsText.split(',').map(k => k.trim());
    
    // Create a simulated AI-generated description with timestamps
    return `🔍 ${title} - Complete Tutorial ${new Date().getFullYear()}

In this comprehensive video, we dive deep into ${keywords[0] || 'the topic'} and explore everything you need to know to master ${keywords[1] || 'these skills'}. Whether you're a beginner or advanced user, this tutorial covers all the essential aspects of ${keywords[0] || 'the subject'}.

⏱️ TIMESTAMPS:
0:00 Introduction
1:45 What is ${keywords[0] || 'this topic'}?
4:30 Getting started with ${keywords[1] || 'the basics'}
8:15 Advanced techniques for ${keywords[2] || 'optimization'}
12:40 Common mistakes to avoid
16:20 Real-world examples
21:35 Tips and tricks
25:10 Conclusion and next steps

We'll walk you through step-by-step instructions on how to implement ${keywords[2] || 'these techniques'} effectively, showing you real-world examples and practical applications. Our expert tips will help you avoid common mistakes and accelerate your learning process.

What makes this guide different is our focus on ${keywords[3] || 'optimization'} and ${keywords[0] || 'performance'}, ensuring you get the best results possible. We've researched the latest trends and best practices to bring you the most up-to-date information.

👍 If you found this video helpful, please give it a thumbs up and SUBSCRIBE to our channel for more content like this! Hit the notification bell to stay updated with our latest uploads.

💬 Share your experience with ${keywords[0] || 'this topic'} in the comments below. We'd love to hear your thoughts and answer any questions you might have!

🔗 RESOURCES:
[LINK: Our Website]
[LINK: Related Video]
[LINK: Free Resources]

#${keywords[0]?.replace(/\s+/g, '')} #${keywords[1]?.replace(/\s+/g, '')} #Tutorial #Guide #HowTo`;
}

/**
 * Generate a basic description as fallback
 */
function generateBasicDescription(title, keywords) {
    const keywordsArray = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
    
    return `${title}

In this video, we cover everything you need to know about ${keywordsArray[0] || 'this topic'}.

If you found this video helpful, please like, subscribe, and share it with others who might benefit from it!

#${keywordsArray[0]?.replace(/\s+/g, '')} #${keywordsArray[1]?.replace(/\s+/g, '')} #YouTube`;
}

/**
 * Display generated description in the UI
 */
function displayGeneratedDescription(description, title, keywords) {
    const descriptionContainer = document.getElementById('generatedDescriptions');
    if (!descriptionContainer) return;
    
    // Create HTML for the description
    const descriptionHTML = `
        <div class="generated-description">
            <div class="description-header">
                <h3>AI-Generated Description</h3>
                <div class="description-actions">
                    <button class="btn-secondary btn-small copy-btn" data-content="${encodeURIComponent(description)}">Copy</button>
                    <button class="btn-secondary btn-small regenerate-btn">Regenerate</button>
                </div>
            </div>
            <div class="description-content">
                <pre>${description}</pre>
            </div>
            <div class="description-stats">
                <div class="stat-item">
                    <span class="stat-label">Character Count:</span>
                    <span class="stat-value">${description.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Word Count:</span>
                    <span class="stat-value">${description.split(/\s+/).length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Keywords Used:</span>
                    <span class="stat-value">${countKeywordsInText(description, keywords)}</span>
                </div>
            </div>
        </div>
    `;
    
    // Update container
    descriptionContainer.innerHTML = descriptionHTML;
    
    // Add event listeners
    const copyBtn = descriptionContainer.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const content = decodeURIComponent(copyBtn.getAttribute('data-content'));
            copyToClipboard(content);
            window.showNotification('Description copied to clipboard', 'success');
        });
    }
    
    const regenerateBtn = descriptionContainer.querySelector('.regenerate-btn');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => {
            generateDescription(title, keywords);
        });
    }
}

/**
 * Count how many keywords are used in the text
 */
function countKeywordsInText(text, keywords) {
    if (!text || !keywords) return 0;
    
    const keywordsArray = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
    const lowerText = text.toLowerCase();
    
    let count = 0;
    keywordsArray.forEach(keyword => {
        if (keyword && lowerText.includes(keyword.toLowerCase())) {
            count++;
        }
    });
    
    return count;
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

/**
 * Generate AI-powered thumbnail suggestions
 */
async function generateThumbnailSuggestions(title, videoId) {
    try {
        const thumbnailContainer = document.getElementById('thumbnailAnalysisResults');
        if (!thumbnailContainer) {
            window.showNotification('Thumbnail container not found', 'error');
            return;
        }
        
        // Show loading state
        thumbnailContainer.innerHTML = '<div class="loading">Generating thumbnail suggestions...</div>';
        
        // Get OpenAI API key
        const openaiConfig = await ApiManagementModule.getOpenAiApiKey().catch(error => {
            console.error('Error getting OpenAI API key:', error);
            thumbnailContainer.innerHTML = `
                <p class="error">No OpenAI API key found. Please add an API key to use AI-powered thumbnail suggestions.</p>
                <p class="api-prompt">To use AI features, please add an OpenAI API key in the <a href="#" class="open-api-tab">API Management tab</a>.</p>
            `;
            
            // Add event listener to API tab link
            const apiTabLink = thumbnailContainer.querySelector('.open-api-tab');
            if (apiTabLink) {
                apiTabLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Switch to API tab
                    document.querySelector('.tab-btn[data-tab="api"]').click();
                    // Switch to OpenAI API section
                    document.querySelector('.api-tab-btn[data-api="openai"]').click();
                });
            }
            
            window.showNotification('No OpenAI API key found', 'warning');
            throw error;
        });
        
        // Prepare prompt for OpenAI
        const prompt = `Generate 3 thumbnail design concepts for a YouTube video titled "${title}". 
For each concept, provide:
1. A brief description of the visual elements
2. Suggested text overlay (max 5 words)
3. Color scheme
4. Emotional appeal
5. Target audience consideration`;
        
        // Call OpenAI API
        const suggestions = await callOpenAiApi(prompt, openaiConfig);
        
        // Display thumbnail suggestions
        displayThumbnailSuggestions(suggestions, title);
        
        // Log activity
        window.logActivity('Generated AI thumbnail suggestions for: ' + title);
        window.showNotification('Thumbnail suggestions generated successfully', 'success');
        
        return suggestions;
    } catch (error) {
        console.error('Error generating thumbnail suggestions:', error);
        window.showNotification('Error generating thumbnail suggestions: ' + error.message, 'error');
        
        // Return basic suggestions as fallback
        return generateBasicThumbnailSuggestions(title);
    }
}

/**
 * Display thumbnail suggestions in the UI
 */
function displayThumbnailSuggestions(suggestions, title) {
    const thumbnailContainer = document.getElementById('thumbnailAnalysisResults');
    if (!thumbnailContainer) return;
    
    // Parse the suggestions into separate concepts
    const concepts = parseThumbnailConcepts(suggestions);
    
    // Create HTML for the suggestions
    let suggestionsHTML = `
        <div class="thumbnail-suggestions">
            <h3>AI-Generated Thumbnail Concepts</h3>
            <p>Based on your video title: "${title}"</p>
            <div class="concepts-container">
    `;
    
    // Add each concept
    concepts.forEach((concept, index) => {
        suggestionsHTML += `
            <div class="thumbnail-concept">
                <h4>Concept ${index + 1}</h4>
                <div class="concept-details">
                    <div class="concept-item">
                        <span class="concept-label">Visual Elements:</span>
                        <span class="concept-value">${concept.visual || 'N/A'}</span>
                    </div>
                    <div class="concept-item">
                        <span class="concept-label">Text Overlay:</span>
                        <span class="concept-value">${concept.text || 'N/A'}</span>
                    </div>
                    <div class="concept-item">
                        <span class="concept-label">Color Scheme:</span>
                        <span class="concept-value">${concept.colors || 'N/A'}</span>
                    </div>
                    <div class="concept-item">
                        <span class="concept-label">Emotional Appeal:</span>
                        <span class="concept-value">${concept.emotion || 'N/A'}</span>
                    </div>
                    <div class="concept-item">
                        <span class="concept-label">Target Audience:</span>
                        <span class="concept-value">${concept.audience || 'N/A'}</span>
                    </div>
                </div>
                <button class="btn-primary use-concept-btn" data-concept="${index}">Use This Concept</button>
            </div>
        `;
    });
    
    suggestionsHTML += `
            </div>
            <div class="suggestions-actions">
                <button class="btn-secondary regenerate-btn">Generate More Concepts</button>
            </div>
        </div>
    `;
    
    // Update container
    thumbnailContainer.innerHTML = suggestionsHTML;
    
    // Add event listeners
    const regenerateBtn = thumbnailContainer.querySelector('.regenerate-btn');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => {
            generateThumbnailSuggestions(title);
        });
    }
    
    const useConceptBtns = thumbnailContainer.querySelectorAll('.use-concept-btn');
    useConceptBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const conceptIndex = btn.getAttribute('data-concept');
            const concept = concepts[conceptIndex];
            
            // In a real implementation, this would populate the thumbnail generator
            // For now, just show a notification
            window.showNotification(`Concept ${parseInt(conceptIndex) + 1} selected`, 'success');
            
            // You could also dispatch a custom event to be handled by the thumbnail generator
            document.dispatchEvent(new CustomEvent('thumbnail-concept-selected', {
                detail: { concept }
            }));
        });
    });
}

/**
 * Parse thumbnail concepts from OpenAI response
 */
function parseThumbnailConcepts(response) {
    // In a real implementation, you would parse the actual OpenAI response
    // For demonstration, we'll create simulated concepts
    
    // Check if this is already our simulated response
    if (Array.isArray(response)) {
        return response;
    }
    
    // Try to parse concepts from text
    const concepts = [];
    const conceptMatches = response.match(/Concept \d+:[\s\S]+?(?=Concept \d+:|$)/g);
    
    if (conceptMatches && conceptMatches.length > 0) {
        conceptMatches.forEach(conceptText => {
            const visual = conceptText.match(/Visual Elements:[\s\S]+?(?=Text Overlay:|$)/i);
            const text = conceptText.match(/Text Overlay:[\s\S]+?(?=Color Scheme:|$)/i);
            const colors = conceptText.match(/Color Scheme:[\s\S]+?(?=Emotional Appeal:|$)/i);
            const emotion = conceptText.match(/Emotional Appeal:[\s\S]+?(?=Target Audience:|$)/i);
            const audience = conceptText.match(/Target Audience:[\s\S]+?(?=\n\n|$)/i);
            
            concepts.push({
                visual: visual ? visual[0].replace(/Visual Elements:/i, '').trim() : 'Not specified',
                text: text ? text[0].replace(/Text Overlay:/i, '').trim() : 'Not specified',
                colors: colors ? colors[0].replace(/Color Scheme:/i, '').trim() : 'Not specified',
                emotion: emotion ? emotion[0].replace(/Emotional Appeal:/i, '').trim() : 'Not specified',
                audience: audience ? audience[0].replace(/Target Audience:/i, '').trim() : 'Not specified'
            });
        });
    }
    
    // If parsing failed, return simulated concepts
    if (concepts.length === 0) {
        return generateBasicThumbnailSuggestions('YouTube Video');
    }
    
    return concepts;
}

/**
 * Generate basic thumbnail suggestions as fallback
 */
function generateBasicThumbnailSuggestions(title) {
    return [
        {
            visual: 'Close-up of person with surprised expression, pointing at text',
            text: title.split(' ').slice(0, 3).join(' '),
            colors: 'Red and white on dark background',
            emotion: 'Excitement and curiosity',
            audience: 'General YouTube viewers looking for engaging content'
        },
        {
            visual: 'Split screen showing before/after or comparison',
            text: 'ULTIMATE GUIDE',
            colors: 'Blue and yellow for contrast',
            emotion: 'Trust and authority',
            audience: 'Information seekers and problem solvers'
        },
        {
            visual: 'Minimalist design with bold text and simple icon',
            text: 'TOP 5 SECRETS',
            colors: 'Black and neon accent color',
            emotion: 'Exclusivity and insider knowledge',
            audience: 'Trend-conscious viewers seeking quick value'
        }
    ];
}

/**
 * Analyze content for SEO optimization
 */
async function analyzeContent(title, description, tags) {
    try {
        // Get OpenAI API key
        const openaiConfig = await ApiManagementModule.getOpenAiApiKey().catch(error => {
            console.error('Error getting OpenAI API key:', error);
            window.showNotification('No OpenAI API key found', 'warning');
            throw error;
        });
        
        // Prepare prompt for OpenAI
        const prompt = `Analyze the following YouTube video metadata for SEO optimization:

Title: "${title}"
Description: "${description.substring(0, 500)}${description.length > 500 ? '...' : ''}"
Tags: ${tags ? tags.join(', ') : 'None provided'}

Provide an analysis of:
1. Title effectiveness (length, keywords, clickability)
2. Description optimization (keyword usage, length, formatting)
3. Tag relevance and completeness
4. Overall SEO score (0-100)
5. Specific recommendations for improvement`;
        
        // Call OpenAI API
        const analysis = await callOpenAiApi(prompt, openaiConfig);
        
        // Log activity
        window.logActivity('Analyzed content for SEO optimization');
        
        return analysis;
    } catch (error) {
        console.error('Error analyzing content:', error);
        
        // Return basic analysis as fallback
        return generateBasicContentAnalysis(title, description, tags);
    }
}

/**
 * Generate basic content analysis as fallback
 */
function generateBasicContentAnalysis(title, description, tags) {
    const titleLength = title ? title.length : 0;
    const descriptionLength = description ? description.length : 0;
    const tagsCount = tags ? tags.length : 0;
    
    let titleScore = 0;
    if (titleLength > 0) {
        if (titleLength < 30) titleScore = 50;
        else if (titleLength <= 60) titleScore = 90;
        else titleScore = 70;
    }
    
    let descriptionScore = 0;
    if (descriptionLength > 0) {
        if (descriptionLength < 100) descriptionScore = 40;
        else if (descriptionLength < 200) descriptionScore = 70;
        else descriptionScore = 90;
    }
    
    let tagsScore = 0;
    if (tagsCount > 0) {
        if (tagsCount < 5) tagsScore = 50;
        else if (tagsCount <= 15) tagsScore = 90;
        else tagsScore = 70;
    }
    
    const overallScore = Math.round((titleScore + descriptionScore + tagsScore) / 3);
    
    return `SEO Analysis:

Title Effectiveness: ${titleScore}/100
${titleLength === 0 ? '- No title provided' : titleLength < 30 ? '- Title is too short' : titleLength > 60 ? '- Title is too long' : '- Title length is optimal'}
${titleLength > 0 ? '- Consider adding more specific keywords' : ''}

Description Optimization: ${descriptionScore}/100
${descriptionLength === 0 ? '- No description provided' : descriptionLength < 100 ? '- Description is too short' : '- Description length is good'}
${descriptionLength > 0 ? '- Consider adding timestamps and calls to action' : ''}

Tag Relevance: ${tagsScore}/100
${tagsCount === 0 ? '- No tags provided' : tagsCount < 5 ? '- Too few tags' : tagsCount > 15 ? '- Too many tags' : '- Good number of tags'}
${tagsCount > 0 ? '- Consider using more specific and trending tags' : ''}

Overall SEO Score: ${overallScore}/100

Recommendations:
1. ${titleLength === 0 ? 'Add a compelling title with relevant keywords' : titleLength < 30 ? 'Make your title longer and more descriptive' : titleLength > 60 ? 'Shorten your title to under 60 characters' : 'Your title is a good length, but consider adding more specific keywords'}
2. ${descriptionLength === 0 ? 'Add a detailed description with keywords, timestamps, and calls to action' : descriptionLength < 200 ? 'Expand your description to at least 200 characters' : 'Your description is a good length, consider adding more formatting and keywords'}
3. ${tagsCount === 0 ? 'Add relevant tags to improve discoverability' : tagsCount < 5 ? 'Add more tags (aim for 10-15)' : tagsCount > 15 ? 'Focus on fewer, more relevant tags' : 'Your tag count is good, ensure they are relevant and include variations'}
4. Include relevant hashtags in your description
5. Add timestamps to improve user experience and SEO`;
}

/**
 * Generate AI-powered title suggestions
 */
async function generateTitleSuggestions(keywords, videoType) {
    try {
        // Get OpenAI API key
        const openaiConfig = await ApiManagementModule.getOpenAiApiKey().catch(error => {
            console.error('Error getting OpenAI API key:', error);
            window.showNotification('No OpenAI API key found', 'warning');
            throw error;
        });
        
        const keywordsText = Array.isArray(keywords) ? keywords.join(', ') : keywords;
        
        // Prepare prompt for OpenAI
        const prompt = `Generate 5 engaging and SEO-optimized YouTube video titles using these keywords: ${keywordsText}.
The video is a ${videoType || 'tutorial'}.
Each title should:
- Be between 40-60 characters
- Include the main keywords
- Be compelling and have high click-through potential
- Avoid clickbait tactics
- Follow YouTube best practices for ${new Date().getFullYear()}`;
        
        // Call OpenAI API
        const suggestions = await callOpenAiApi(prompt, openaiConfig);
        
        // Log activity
        window.logActivity('Generated AI title suggestions');
        
        // Parse the suggestions
        return parseTitleSuggestions(suggestions);
    } catch (error) {
        console.error('Error generating title suggestions:', error);
        
        // Return basic suggestions as fallback
        return generateBasicTitleSuggestions(keywords, videoType);
    }
}

/**
 * Parse title suggestions from OpenAI response
 */
function parseTitleSuggestions(response) {
    // Try to extract numbered titles
    const titleMatches = response.match(/\d+\.\s+(.+)$/gm);
    
    if (titleMatches && titleMatches.length > 0) {
        return titleMatches.map(match => {
            // Remove the number and period
            return match.replace(/^\d+\.\s+/, '').trim();
        });
    }
    
    // If no numbered format, split by newlines and filter empty lines
    const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length > 0) {
        return lines;
    }
    
    // If all else fails, return the whole response as a single title
    return [response.trim()];
}

/**
 * Generate basic title suggestions as fallback
 */
function generateBasicTitleSuggestions(keywords, videoType) {
    const keywordsArray = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
    const mainKeyword = keywordsArray[0] || 'Topic';
    const secondaryKeyword = keywordsArray[1] || 'Guide';
    
    const currentYear = new Date().getFullYear();
    
    const type = videoType || 'tutorial';
    let titles = [];
    
    switch (type.toLowerCase()) {
        case 'tutorial':
            titles = [
                `Ultimate ${mainKeyword} Tutorial for Beginners (${currentYear})`,
                `How to Master ${mainKeyword} - Complete ${secondaryKeyword} Guide`,
                `${mainKeyword} Masterclass: Step-by-Step Tutorial`,
                `Learn ${mainKeyword} in 10 Minutes - Quick ${secondaryKeyword} Tutorial`,
                `${mainKeyword} ${currentYear}: Everything You Need to Know`
            ];
            break;
        case 'review':
            titles = [
                `${mainKeyword} Review: Is It Worth It? (Honest Opinion ${currentYear})`,
                `I Tried ${mainKeyword} for 30 Days - Here's What Happened`,
                `${mainKeyword} vs ${secondaryKeyword}: Ultimate Comparison Review`,
                `The Truth About ${mainKeyword} - Full Review and Tutorial`,
                `${mainKeyword} ${currentYear} Review: Pros and Cons You Need to Know`
            ];
            break;
        case 'vlog':
            titles = [
                `A Day in the Life with ${mainKeyword} - You Won't Believe What Happened!`,
                `${mainKeyword} Adventure: Behind the Scenes Vlog`,
                `I Spent a Week Mastering ${mainKeyword} - Here's My Journey`,
                `${mainKeyword} Experience: What No One Tells You`,
                `My ${mainKeyword} Story - From Beginner to Pro`
            ];
            break;
        default:
            titles = [
                `The Ultimate Guide to ${mainKeyword} in ${currentYear}`,
                `${mainKeyword}: Everything You Need to Know About ${secondaryKeyword}`,
                `How to Use ${mainKeyword} Like a Pro - Expert Tips`,
                `${mainKeyword} Secrets Revealed - ${secondaryKeyword} Guide`,
                `Top 10 ${mainKeyword} Tips You Need to Know Right Now`
            ];
    }
    
    return titles;
}

/**
 * Generate AI-powered hashtags
 */
async function generateHashtags(keywords, count = 10) {
    try {
        // Get OpenAI API key
        const openaiConfig = await ApiManagementModule.getOpenAiApiKey().catch(error => {
            console.error('Error getting OpenAI API key:', error);
            window.showNotification('No OpenAI API key found', 'warning');
            throw error;
        });
        
        const keywordsText = Array.isArray(keywords) ? keywords.join(', ') : keywords;
        
        // Prepare prompt for OpenAI
        const prompt = `Generate ${count} relevant and trending hashtags for a YouTube video about ${keywordsText}.
Include a mix of:
- Specific hashtags related to the topic
- Broader category hashtags
- Trending hashtags that would help discovery
- YouTube-specific hashtags

Format each hashtag with the # symbol and no spaces.`;
        
        // Call OpenAI API
        const suggestions = await callOpenAiApi(prompt, openaiConfig);
        
        // Log activity
        window.logActivity('Generated AI hashtags');
        
        // Parse the hashtags
        return parseHashtags(suggestions);
    } catch (error) {
        console.error('Error generating hashtags:', error);
        
        // Return basic hashtags as fallback
        return generateBasicHashtags(keywords, count);
    }
}

/**
 * Parse hashtags from OpenAI response
 */
function parseHashtags(response) {
    // Extract all hashtags from the response
    const hashtagMatches = response.match(/#[a-zA-Z0-9]+/g);
    
    if (hashtagMatches && hashtagMatches.length > 0) {
        return hashtagMatches;
    }
    
    // If no hashtags found, try to extract words that might be intended as hashtags
    const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const hashtags = [];
    lines.forEach(line => {
        // Remove numbers and any non-alphanumeric characters
        const cleanLine = line.replace(/^\d+\.\s+/, '').trim();
        
        // If the line doesn't start with #, add it
        if (cleanLine && !cleanLine.startsWith('#')) {
            hashtags.push('#' + cleanLine.replace(/\s+/g, ''));
        } else if (cleanLine) {
            hashtags.push(cleanLine);
        }
    });
    
    return hashtags;
}

/**
 * Generate basic hashtags as fallback
 */
function generateBasicHashtags(keywords, count = 10) {
    const keywordsArray = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
    
    // Create hashtags from keywords
    const keywordHashtags = keywordsArray.map(keyword => '#' + keyword.replace(/\s+/g, ''));
    
    // Add some generic YouTube hashtags
    const genericHashtags = [
        '#YouTube',
        '#YouTubeTips',
        '#ContentCreator',
        '#YouTubeAlgorithm',
        '#VideoCreation',
        '#YouTubeGrowth',
        '#DigitalContent',
        '#CreatorTips',
        '#OnlineVideo',
        '#VideoMarketing',
        '#SocialMedia',
        '#Tutorial',
        '#HowTo',
        '#Guide',
        '#Tips',
        '#Trending',
        '#Viral',
        '#MustWatch'
    ];
    
    // Combine and limit to requested count
    const allHashtags = [...keywordHashtags, ...genericHashtags];
    return allHashtags.slice(0, count);
}

/**
 * Generate AI-powered content ideas
 */
async function generateContentIdeas(niche, count = 5) {
    try {
        // Get OpenAI API key
        const openaiConfig = await ApiManagementModule.getOpenAiApiKey().catch(error => {
            console.error('Error getting OpenAI API key:', error);
            window.showNotification('No OpenAI API key found', 'warning');
            throw error;
        });
        
        // Prepare prompt for OpenAI
        const prompt = `Generate ${count} YouTube video content ideas for the ${niche} niche.
For each idea, provide:
1. An engaging title
2. A brief description of what the video would cover
3. Why this content would perform well
4. Target audience
5. Potential keywords to target

Focus on ideas that have high search potential and audience interest in ${new Date().getFullYear()}.`;
        
        // Call OpenAI API
        const suggestions = await callOpenAiApi(prompt, openaiConfig);
        
        // Log activity
        window.logActivity(`Generated AI content ideas for ${niche} niche`);
        
        return suggestions;
    } catch (error) {
        console.error('Error generating content ideas:', error);
        
        // Return basic content ideas as fallback
        return generateBasicContentIdeas(niche, count);
    }
}

/**
 * Generate basic content ideas as fallback
 */
function generateBasicContentIdeas(niche, count = 5) {
    const currentYear = new Date().getFullYear();
    
    return `Content Ideas for ${niche} Niche:

1. Title: "Ultimate ${niche} Guide for Beginners (${currentYear})"
   Description: A comprehensive tutorial covering all the basics that newcomers need to know about ${niche}.
   Why it would perform well: Beginner content has consistent search volume and helps establish your channel as an authority.
   Target audience: Newcomers to ${niche} looking for foundational knowledge.
   Keywords: ${niche} basics, ${niche} for beginners, learn ${niche}, ${niche} tutorial

2. Title: "10 ${niche} Hacks the Pros Don't Want You to Know"
   Description: Reveal lesser-known tips, shortcuts, and techniques that can help viewers achieve better results in ${niche}.
   Why it would perform well: "Secrets" and "hacks" content tends to have high click-through rates and shareability.
   Target audience: Intermediate users looking to level up their skills.
   Keywords: ${niche} hacks, ${niche} secrets, ${niche} tips, advanced ${niche} techniques

3. Title: "I Tried ${niche} for 30 Days - Here's What Happened"
   Description: Document a 30-day journey or experiment related to ${niche}, showing progress and results.
   Why it would perform well: Challenge/experiment videos create a narrative that keeps viewers engaged and coming back.
   Target audience: People interested in ${niche} results and real-life applications.
   Keywords: ${niche} challenge, ${niche} results, ${niche} transformation, ${niche} journey

4. Title: "Top 5 ${niche} Trends to Watch in ${currentYear}"
   Description: Analyze current and upcoming trends in the ${niche} space that viewers should be aware of.
   Why it would perform well: Trend content is timely and positions you as an industry insider.
   Target audience: ${niche} enthusiasts who want to stay current and ahead of the curve.
   Keywords: ${niche} trends, ${niche} ${currentYear}, future of ${niche}, ${niche} predictions

5. Title: "${niche} vs [Alternative] - Which is Better in ${currentYear}?"
   Description: Compare ${niche} with a popular alternative, discussing pros, cons, and ideal use cases for each.
   Why it would perform well: Comparison content helps viewers make decisions and attracts searches from people considering both options.
   Target audience: People researching options before making a decision related to ${niche}.
   Keywords: ${niche} vs, ${niche} alternatives, ${niche} comparison, best ${niche} option`;
}