/**
 * Thumbnail Generator Module for YouTube SEO Booster
 * Handles AI-powered thumbnail generation functionality
 */

// Use global modules instead of importing them
// ApiModule is defined globally in mainUse global modules instead of importing them
// ApiModule is defined globally in main.js/ Use global utility functions instead of importing them

// Export functions for use in main.js
export const ThumbnailGeneratorModule = {
    generateThumbnail,
    applyTextOverlay,
    applyEffects,
    saveGeneratedThumbnail,
    analyzeVideoForThumbnail,
    generateFromTemplate,
    getTemplates,
    saveTemplate
};

/**
 * Generate a thumbnail based on video content and settings
 */
async function generateThumbnail() {
    try {
        const videoId = document.getElementById('thumbnailVideoId').value.trim();
        const templateId = document.getElementById('thumbnailTemplate').value;
        const customText = document.getElementById('thumbnailText').value.trim();
        const useVideoFrame = document.getElementById('useVideoFrame').checked;
        
        if (!videoId) {
            window.showNotification('Please enter a video ID', 'warning');
            return;
        }
        
        const generatorContainer = document.getElementById('thumbnailGeneratorContainer');
        
        if (!generatorContainer) {
            window.showNotification('Generator container not found', 'error');
            return;
        }
        
        // Show loading state
        generatorContainer.innerHTML = '<div class="loading">Generating thumbnail...</div>';
        
        // If using a video frame, fetch video data
        let backgroundImage = null;
        if (useVideoFrame) {
            try {
                // Get video details to extract a frame
                const videoData = await ApiModule.fetchYouTubeData('videos', {
                    part: 'snippet',
                    id: videoId
                });
                
                if (!videoData.items || videoData.items.length === 0) {
                    window.showNotification('Video not found', 'error');
                    return;
                }
                
                // Use the default thumbnail as a base
                backgroundImage = videoData.items[0].snippet.thumbnails.high.url;
            } catch (error) {
                console.error('Error fetching video data:', error);
                window.showNotification('Error fetching video data: ' + error.message, 'error');
                return;
            }
        }
        
        // Generate thumbnail based on template
        const thumbnailData = await generateFromTemplate(templateId, {
            videoId,
            backgroundImage,
            customText,
            useVideoFrame
        });
        
        // Display the generated thumbnail
        displayGeneratedThumbnail(thumbnailData);
        
        // Log activity
        window.logActivity('Generated thumbnail for video ' + videoId);
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        window.showNotification('Error generating thumbnail: ' + error.message, 'error');
    }
}

/**
 * Apply text overlay to thumbnail
 */
function applyTextOverlay() {
    try {
        const canvas = document.getElementById('thumbnailCanvas');
        const ctx = canvas.getContext('2d');
        const text = document.getElementById('overlayText').value.trim();
        const fontSize = document.getElementById('fontSize').value;
        const fontColor = document.getElementById('fontColor').value;
        const textPosition = document.getElementById('textPosition').value;
        
        if (!canvas || !text) {
            window.showNotification('Canvas or text not available', 'warning');
            return;
        }
        
        // Clear previous text by redrawing the base image
        const baseImage = document.getElementById('baseImage');
        if (baseImage) {
            ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Set text properties
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = fontColor;
        ctx.textAlign = 'center';
        
        // Calculate text position
        let x = canvas.width / 2;
        let y;
        
        switch (textPosition) {
            case 'top':
                y = parseInt(fontSize) + 10;
                break;
            case 'middle':
                y = canvas.height / 2;
                break;
            case 'bottom':
                y = canvas.height - 20;
                break;
            default:
                y = canvas.height / 2;
        }
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw text
        ctx.fillText(text, x, y);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        
        // Update preview
        updateThumbnailPreview();
        
        window.showNotification('Text overlay applied', 'success');
    } catch (error) {
        console.error('Error applying text overlay:', error);
        window.showNotification('Error applying text overlay: ' + error.message, 'error');
    }
}

/**
 * Apply visual effects to thumbnail
 */
function applyEffects() {
    try {
        const canvas = document.getElementById('thumbnailCanvas');
        const ctx = canvas.getContext('2d');
        const effect = document.getElementById('effectType').value;
        
        if (!canvas) {
            window.showNotification('Canvas not available', 'warning');
            return;
        }
        
        // Get the current image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply selected effect
        switch (effect) {
            case 'brightness':
                // Increase brightness
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(data[i] + 30, 255);     // Red
                    data[i + 1] = Math.min(data[i + 1] + 30, 255); // Green
                    data[i + 2] = Math.min(data[i + 2] + 30, 255); // Blue
                }
                break;
            case 'contrast':
                // Increase contrast
                const factor = 1.5; // Contrast factor
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(128 + (data[i] - 128) * factor, 255);
                    data[i + 1] = Math.min(128 + (data[i + 1] - 128) * factor, 255);
                    data[i + 2] = Math.min(128 + (data[i + 2] - 128) * factor, 255);
                }
                break;
            case 'grayscale':
                // Convert to grayscale
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg;     // Red
                    data[i + 1] = avg; // Green
                    data[i + 2] = avg; // Blue
                }
                break;
            case 'sepia':
                // Apply sepia tone
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    data[i] = Math.min(r * 0.393 + g * 0.769 + b * 0.189, 255);
                    data[i + 1] = Math.min(r * 0.349 + g * 0.686 + b * 0.168, 255);
                    data[i + 2] = Math.min(r * 0.272 + g * 0.534 + b * 0.131, 255);
                }
                break;
            case 'vibrant':
                // Increase saturation
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Convert RGB to HSL
                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    let h, s, l = (max + min) / 2;
                    
                    if (max === min) {
                        h = s = 0; // achromatic
                    } else {
                        const d = max - min;
                        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                        
                        switch (max) {
                            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                            case g: h = (b - r) / d + 2; break;
                            case b: h = (r - g) / d + 4; break;
                        }
                        
                        h /= 6;
                    }
                    
                    // Increase saturation
                    s = Math.min(s * 1.5, 1);
                    
                    // Convert back to RGB
                    if (s === 0) {
                        data[i] = data[i + 1] = data[i + 2] = l * 255;
                    } else {
                        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                        const p = 2 * l - q;
                        
                        data[i] = hue2rgb(p, q, h + 1/3) * 255;
                        data[i + 1] = hue2rgb(p, q, h) * 255;
                        data[i + 2] = hue2rgb(p, q, h - 1/3) * 255;
                    }
                }
                break;
        }
        
        // Put the modified image data back
        ctx.putImageData(imageData, 0, 0);
        
        // Update preview
        updateThumbnailPreview();
        
        window.showNotification(`${effect} effect applied`, 'success');
    } catch (error) {
        console.error('Error applying effects:', error);
        window.showNotification('Error applying effects: ' + error.message, 'error');
    }
}

/**
 * Helper function for HSL to RGB conversion
 */
function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

/**
 * Save the generated thumbnail
 */
function saveGeneratedThumbnail() {
    try {
        const canvas = document.getElementById('thumbnailCanvas');
        
        if (!canvas) {
            window.showNotification('Canvas not available', 'warning');
            return;
        }
        
        // Convert canvas to data URL
        const dataURL = canvas.toDataURL('image/png');
        
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'youtube-thumbnail.png';
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        window.showNotification('Thumbnail saved successfully', 'success');
        window.logActivity('Saved generated thumbnail');
    } catch (error) {
        console.error('Error saving thumbnail:', error);
        window.showNotification('Error saving thumbnail: ' + error.message, 'error');
    }
}

/**
 * Analyze video content to suggest thumbnail elements
 */
async function analyzeVideoForThumbnail() {
    try {
        const videoId = document.getElementById('thumbnailVideoId').value.trim();
        
        if (!videoId) {
            window.showNotification('Please enter a video ID', 'warning');
            return;
        }
        
        const analysisContainer = document.getElementById('thumbnailAnalysisResults');
        
        if (!analysisContainer) {
            window.showNotification('Analysis container not found', 'error');
            return;
        }
        
        // Show loading state
        analysisContainer.innerHTML = '<div class="loading">Analyzing video content...</div>';
        
        // Get video details
        const videoData = await ApiModule.fetchYouTubeData('videos', {
            part: 'snippet,statistics,contentDetails',
            id: videoId
        });
        
        if (!videoData.items || videoData.items.length === 0) {
            window.showNotification('Video not found', 'error');
            return;
        }
        
        const video = videoData.items[0];
        const title = video.snippet.title;
        const description = video.snippet.description;
        const tags = video.snippet.tags || [];
        
        // Extract key phrases from title and description
        const keyPhrases = extractKeyPhrases(title + ' ' + description);
        
        // Generate color palette suggestions based on existing thumbnail
        const colorPalette = await generateColorPalette(video.snippet.thumbnails.high.url);
        
        // Display analysis results
        const analysisHTML = `
            <div class="analysis-section">
                <h3>Suggested Elements</h3>
                <div class="analysis-item">
                    <h4>Key Phrases</h4>
                    <div class="key-phrases">
                        ${keyPhrases.map(phrase => `<span class="phrase-tag">${phrase}</span>`).join('')}
                    </div>
                </div>
                
                <div class="analysis-item">
                    <h4>Suggested Color Palette</h4>
                    <div class="color-palette">
                        ${colorPalette.map(color => `
                            <div class="color-swatch" style="background-color: ${color};" title="${color}"></div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="analysis-item">
                    <h4>Thumbnail Best Practices</h4>
                    <ul class="best-practices">
                        <li>Use high contrast colors for better visibility</li>
                        <li>Include a close-up of a face if applicable</li>
                        <li>Use text sparingly - 3-5 words maximum</li>
                        <li>Ensure text is readable on mobile devices</li>
                        <li>Use consistent branding elements</li>
                    </ul>
                </div>
            </div>
            
            <button id="applyAnalysisResults" class="btn-primary">Apply Suggestions</button>
        `;
        
        analysisContainer.innerHTML = analysisHTML;
        
        // Add event listener to apply suggestions button
        document.getElementById('applyAnalysisResults').addEventListener('click', function() {
            // Apply the first key phrase as text
            if (keyPhrases.length > 0) {
                document.getElementById('thumbnailText').value = keyPhrases[0];
            }
            
            // Apply the first color as font color
            if (colorPalette.length > 0) {
                document.getElementById('fontColor').value = colorPalette[0];
            }
            
            window.showNotification('Analysis suggestions applied', 'success');
        });
        
        window.showNotification('Video analysis completed', 'success');
        window.logActivity('Analyzed video content for thumbnail suggestions');
    } catch (error) {
        console.error('Error analyzing video:', error);
        window.showNotification('Error analyzing video: ' + error.message, 'error');
    }
}

/**
 * Extract key phrases from text
 */
function extractKeyPhrases(text) {
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
    
    // Convert to array and sort by frequency
    const sortedPhrases = Object.entries(phraseCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
    
    // Return top phrases
    return sortedPhrases.slice(0, 5);
}

/**
 * Generate color palette from image URL
 */
async function generateColorPalette(imageUrl) {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.drawImage(img, 0, 0);
                
                // Sample colors from different parts of the image
                const colorSamples = [
                    ctx.getImageData(0, 0, 1, 1).data,
                    ctx.getImageData(img.width - 1, 0, 1, 1).data,
                    ctx.getImageData(img.width / 2, img.height / 2, 1, 1).data,
                    ctx.getImageData(0, img.height - 1, 1, 1).data,
                    ctx.getImageData(img.width - 1, img.height - 1, 1, 1).data
                ];
                
                // Convert to hex colors
                const colors = colorSamples.map(sample => {
                    return `#${rgbToHex(sample[0])}${rgbToHex(sample[1])}${rgbToHex(sample[2])}`;
                });
                
                // Add some contrasting colors
                colors.push(getContrastingColor(colors[2]));
                
                resolve(colors);
            };
            
            img.onerror = function() {
                reject(new Error('Failed to load image'));
            };
            
            img.src = imageUrl;
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Convert RGB component to hex
 */
function rgbToHex(rgb) {
    const hex = Number(rgb).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

/**
 * Get a contrasting color
 */
function getContrastingColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white depending on luminance
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Generate thumbnail from template
 */
async function generateFromTemplate(templateId, options) {
    return new Promise((resolve, reject) => {
        try {
            // Get templates
            const templates = getTemplates();
            
            // Find selected template
            const template = templates.find(t => t.id === templateId) || templates[0];
            
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            
            const ctx = canvas.getContext('2d');
            
            // Draw background
            if (options.backgroundImage) {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                
                img.onload = function() {
                    // Draw background image
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Apply template overlay
                    applyTemplateOverlay(ctx, canvas, template, options);
                    
                    // Return the canvas data
                    resolve({
                        canvas: canvas,
                        dataUrl: canvas.toDataURL('image/png')
                    });
                };
                
                img.onerror = function() {
                    reject(new Error('Failed to load background image'));
                };
                
                img.src = options.backgroundImage;
            } else {
                // Use template background color
                ctx.fillStyle = template.backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Apply template overlay
                applyTemplateOverlay(ctx, canvas, template, options);
                
                // Return the canvas data
                resolve({
                    canvas: canvas,
                    dataUrl: canvas.toDataURL('image/png')
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Apply template overlay to canvas
 */
function applyTemplateOverlay(ctx, canvas, template, options) {
    // Apply overlay color if specified
    if (template.overlayColor) {
        ctx.fillStyle = template.overlayColor;
        ctx.globalAlpha = template.overlayOpacity || 0.5;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }
    
    // Add text
    if (options.customText || template.defaultText) {
        const text = options.customText || template.defaultText;
        
        // Set text properties
        ctx.font = template.fontSize + 'px ' + (template.fontFamily || 'Arial, sans-serif');
        ctx.fillStyle = template.fontColor;
        ctx.textAlign = 'center';
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Calculate text position
        let x = canvas.width / 2;
        let y;
        
        switch (template.textPosition) {
            case 'top':
                y = parseInt(template.fontSize) + 40;
                break;
            case 'middle':
                y = canvas.height / 2;
                break;
            case 'bottom':
                y = canvas.height - 40;
                break;
            default:
                y = canvas.height / 2;
        }
        
        // Draw text
        ctx.fillText(text, x, y);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
    }
    
    // Add logo if template has one
    if (template.logoUrl) {
        const logo = new Image();
        logo.crossOrigin = 'Anonymous';
        
        logo.onload = function() {
            const logoWidth = 150;
            const logoHeight = (logo.height / logo.width) * logoWidth;
            
            // Position logo in bottom right
            ctx.drawImage(logo, canvas.width - logoWidth - 20, canvas.height - logoHeight - 20, logoWidth, logoHeight);
        };
        
        logo.src = template.logoUrl;
    }
    
    // Add border if template has one
    if (template.borderWidth && template.borderColor) {
        ctx.strokeStyle = template.borderColor;
        ctx.lineWidth = template.borderWidth;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Display generated thumbnail in the UI
 */
function displayGeneratedThumbnail(thumbnailData) {
    const generatorContainer = document.getElementById('thumbnailGeneratorContainer');
    
    if (!generatorContainer) {
        window.showNotification('Generator container not found', 'error');
        return;
    }
    
    const html = `
        <div class="thumbnail-editor">
            <div class="thumbnail-preview">
                <canvas id="thumbnailCanvas" width="1280" height="720"></canvas>
                <img id="baseImage" src="${thumbnailData.dataUrl}" style="display: none;">
            </div>
            
            <div class="editor-controls">
                <div class="control-group">
                    <h3>Text Overlay</h3>
                    <div class="control-item">
                        <label for="overlayText">Text:</label>
                        <input type="text" id="overlayText" placeholder="Enter text overlay">
                    </div>
                    <div class="control-item">
                        <label for="fontSize">Font Size:</label>
                        <select id="fontSize">
                            <option value="36">Small</option>
                            <option value="48" selected>Medium</option>
                            <option value="64">Large</option>
                            <option value="80">Extra Large</option>
                        </select>
                    </div>
                    <div class="control-item">
                        <label for="fontColor">Font Color:</label>
                        <input type="color" id="fontColor" value="#FFFFFF">
                    </div>
                    <div class="control-item">
                        <label for="textPosition">Position:</label>
                        <select id="textPosition">
                            <option value="top">Top</option>
                            <option value="middle" selected>Middle</option>
                            <option value="bottom">Bottom</option>
                        </select>
                    </div>
                    <button id="applyTextBtn" class="btn-secondary">Apply Text</button>
                </div>
                
                <div class="control-group">
                    <h3>Effects</h3>
                    <div class="control-item">
                        <label for="effectType">Effect:</label>
                        <select id="effectType">
                            <option value="brightness">Brightness</option>
                            <option value="contrast">Contrast</option>
                            <option value="grayscale">Grayscale</option>
                            <option value="sepia">Sepia</option>
                            <option value="vibrant">Vibrant</option>
                        </select>
                    </div>
                    <button id="applyEffectBtn" class="btn-secondary">Apply Effect</button>
                </div>
                
                <div class="action-buttons">
                    <button id="saveThumbnailBtn" class="btn-primary">Save Thumbnail</button>
                    <button id="resetThumbnailBtn" class="btn-secondary">Reset</button>
                </div>
            </div>
        </div>
    `;
    
    generatorContainer.innerHTML = html;
    
    // Draw the thumbnail on the canvas
    const canvas = document.getElementById('thumbnailCanvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = thumbnailData.dataUrl;
    
    // Add event listeners
    document.getElementById('applyTextBtn').addEventListener('click', applyTextOverlay);
    document.getElementById('applyEffectBtn').addEventListener('click', applyEffects);
    document.getElementById('saveThumbnailBtn').addEventListener('click', saveGeneratedThumbnail);
    document.getElementById('resetThumbnailBtn').addEventListener('click', function() {
        // Reset to original image
        const baseImage = document.getElementById('baseImage');
        if (baseImage) {
            ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        }
    });
}

/**
 * Update thumbnail preview
 */
function updateThumbnailPreview() {
    // This function is called after making changes to the canvas
    // In this implementation, the canvas is directly visible so no additional update is needed
}

/**
 * Get available thumbnail templates
 */
function getTemplates() {
    // Default templates
    const defaultTemplates = [
        {
            id: 'default',
            name: 'Clean & Modern',
            backgroundColor: '#1a73e8',
            fontColor: '#FFFFFF',
            fontSize: 64,
            textPosition: 'middle',
            overlayColor: null,
            overlayOpacity: 0,
            borderWidth: 0,
            borderColor: null,
            defaultText: 'Your Video Title'
        },
        {
            id: 'gaming',
            name: 'Gaming',
            backgroundColor: '#121212',
            fontColor: '#FF5722',
            fontSize: 72,
            textPosition: 'top',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            overlayOpacity: 0.7,
            borderWidth: 8,
            borderColor: '#FF5722',
            defaultText: 'EPIC GAMEPLAY'
        },
        {
            id: 'tutorial',
            name: 'Tutorial',
            backgroundColor: '#FFFFFF',
            fontColor: '#212121',
            fontSize: 56,
            textPosition: 'bottom',
            overlayColor: 'rgba(255, 255, 255, 0.8)',
            overlayOpacity: 0.8,
            borderWidth: 0,
            borderColor: null,
            defaultText: 'How To: Step by Step'
        },
        {
            id: 'vlog',
            name: 'Vlog',
            backgroundColor: '#F5F5F5',
            fontColor: '#E91E63',
            fontSize: 64,
            textPosition: 'middle',
            overlayColor: null,
            overlayOpacity: 0,
            borderWidth: 0,
            borderColor: null,
            defaultText: 'My Day in Paris'
        },
        {
            id: 'news',
            name: 'News & Commentary',
            backgroundColor: '#0D47A1',
            fontColor: '#FFFFFF',
            fontSize: 56,
            textPosition: 'bottom',
            overlayColor: 'rgba(13, 71, 161, 0.7)',
            overlayOpacity: 0.7,
            borderWidth: 0,
            borderColor: null,
            defaultText: 'BREAKING: Latest Updates'
        }
    ];
    
    // Get custom templates from storage
    let customTemplates = [];
    try {
        const storedTemplates = localStorage.getItem('thumbnailTemplates');
        if (storedTemplates) {
            customTemplates = JSON.parse(storedTemplates);
        }
    } catch (error) {
        console.error('Error loading custom templates:', error);
    }
    
    // Combine default and custom templates
    return [...defaultTemplates, ...customTemplates];
}

/**
 * Save a custom template
 */
function saveTemplate(templateData) {
    try {
        // Get existing templates
        let customTemplates = [];
        try {
            const storedTemplates = localStorage.getItem('thumbnailTemplates');
            if (storedTemplates) {
                customTemplates = JSON.parse(storedTemplates);
            }
        } catch (error) {
            console.error('Error loading custom templates:', error);
        }
        
        // Add new template with unique ID
        const newTemplate = {
            ...templateData,
            id: 'custom_' + Date.now()
        };
        
        customTemplates.push(newTemplate);
        
        // Save to storage
        localStorage.setItem('thumbnailTemplates', JSON.stringify(customTemplates));
        
        window.showNotification('Template saved successfully', 'success');
        window.logActivity('Saved custom thumbnail template');
        
        return newTemplate;
    } catch (error) {
        console.error('Error saving template:', error);
        window.showNotification('Error saving template: ' + error.message, 'error');
        throw error;
    }
}