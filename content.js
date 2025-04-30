// Content script for YouTube SEO Booster

// This script will run in the context of YouTube pages
console.log('YouTube SEO Booster content script loaded.');

// Function to extract video ID from YouTube URL
function getYoutubeVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// Function to check if we're on a YouTube video page
function isYoutubeVideoPage() {
    return window.location.hostname.includes('youtube.com') && 
           window.location.pathname.includes('/watch');
}

// Add SEO button to YouTube interface
function addSeoButton() {
    if (!isYoutubeVideoPage()) return;
    
    // Check if button already exists
    if (document.getElementById('yt-seo-booster-btn')) return;
    
    // Find the secondary actions area (where like/dislike buttons are)
    const actionsArea = document.querySelector('#top-level-buttons-computed');
    
    if (!actionsArea) return;
    
    // Create SEO button
    const seoButton = document.createElement('button');
    seoButton.id = 'yt-seo-booster-btn';
    seoButton.className = 'yt-seo-booster-btn';
    seoButton.innerHTML = `
        <span class="yt-seo-icon">📈</span>
        <span class="yt-seo-text">SEO Boost</span>
        <span class="yt-seo-loading" style="display: none;">
            <svg class="loading-spinner" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
        </span>
    `;
    
    // Add styles for the button
    const style = document.createElement('style');
    style.textContent = `
        .yt-seo-booster-btn {
            display: flex;
            align-items: center;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px 12px;
            color: #606060;
            font-size: 14px;
            font-family: Roboto, Arial, sans-serif;
            transition: all 0.2s ease;
            border-radius: 18px;
            margin-left: 8px;
        }
        .yt-seo-booster-btn:hover {
            color: #ff0000;
            background-color: rgba(0, 0, 0, 0.05);
        }
        .yt-seo-icon {
            margin-right: 5px;
            font-size: 18px;
        }
        .yt-seo-loading {
            margin-left: 5px;
        }
        .loading-spinner {
            animation: rotate 2s linear infinite;
            width: 16px;
            height: 16px;
        }
        .loading-spinner .path {
            stroke: #606060;
            stroke-linecap: round;
            animation: dash 1.5s ease-in-out infinite;
        }
        @keyframes rotate {
            100% {
                transform: rotate(360deg);
            }
        }
        @keyframes dash {
            0% {
                stroke-dasharray: 1, 150;
                stroke-dashoffset: 0;
            }
            50% {
                stroke-dasharray: 90, 150;
                stroke-dashoffset: -35;
            }
            100% {
                stroke-dasharray: 90, 150;
                stroke-dashoffset: -124;
            }
        }
        .yt-seo-booster-btn.loading .yt-seo-text {
            opacity: 0.7;
        }
        .yt-seo-booster-btn.loading .yt-seo-loading {
            display: inline-block;
        }
        .yt-seo-booster-btn.loading {
            cursor: wait;
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
    
    // Add click handler
    seoButton.addEventListener('click', () => {
        // Show loading state
        seoButton.classList.add('loading');
        
        const videoId = getYoutubeVideoId(window.location.href);
        const videoTitle = document.querySelector('h1.title')?.textContent?.trim() || '';
        const videoDescription = document.querySelector('div#description-inline-expander')?.textContent?.trim() || '';
        
        // Send message to extension
        chrome.runtime.sendMessage({
            action: 'analyzeVideo',
            videoData: {
                id: videoId,
                title: videoTitle,
                description: videoDescription,
                url: window.location.href
            }
        });
        
        // Remove loading state after a short delay
        setTimeout(() => {
            seoButton.classList.remove('loading');
        }, 1000);
    });
    
    // Append button to actions area
    actionsArea.appendChild(seoButton);
}

// On page load
addSeoButton();

// Listen for page navigation
let lastUrl = location.href;
new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(addSeoButton, 1500); // wait for YouTube to load the page
    }
}).observe(document, {subtree: true, childList: true});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getVideoInfo') {
        const videoId = getYoutubeVideoId(window.location.href);
        const videoTitle = document.querySelector('h1.title')?.textContent?.trim() || '';
        const videoDescription = document.querySelector('div#description-inline-expander')?.textContent?.trim() || '';
        
        sendResponse({
            id: videoId,
            title: videoTitle,
            description: videoDescription,
            url: window.location.href
        });
        return true; // Required for async response
    }
}); 