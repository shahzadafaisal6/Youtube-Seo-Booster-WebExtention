/**
 * Utility Module for YouTube SEO Booster
 * Contains common utility functions used across modules
 * 
 * NOTE: showNotification and logActivity are now provided globally
 * and should not be imported from this module to avoid duplicate declarations
 */

// Provide empty exports for backward compatibility
export function showNotification(message, type = 'info') {
    // Just call the global function
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.log(`Notification [${type}]: ${message}`);
    }
}

export function logActivity(message, type = 'info') {
    // Just call the global function
    if (typeof window.logActivity === 'function') {
        window.logActivity(message, type);
    } else {
        console.log(`Activity Log [${type}]: ${message}`);
    }
}

/**
 * Format a number with commas for thousands
 * @param {number} num - The number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format a date to a readable string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString();
}

/**
 * Calculate percentage change between two numbers
 * @param {number} oldValue - The original value
 * @param {number} newValue - The new value
 * @returns {number} Percentage change
 */
export function calculatePercentChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export function truncateString(str, length = 100) {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}

/**
 * Generate a random ID
 * @returns {string} Random ID
 */
export function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Check if a string is a valid URL
 * @param {string} str - The string to check
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Extract domain from URL
 * @param {string} url - The URL
 * @returns {string} Domain name
 */
export function extractDomain(url) {
    try {
        const domain = new URL(url).hostname;
        return domain;
    } catch (e) {
        return '';
    }
}