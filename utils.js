/**
 * Utility functions for the web application
 */

// Define utility functions
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID "${id}" not found in DOM`);
    }
    return element;
}

function safeQuerySelector(selector) {
    try {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element with selector "${selector}" not found in DOM`);
        }
        return element;
    } catch (error) {
        console.error(`Error with selector "${selector}":`, error);
        return null;
    }
}

function safeQuerySelectorAll(selector) {
    try {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            console.warn(`No elements found with selector "${selector}"`);
        }
        return elements;
    } catch (error) {
        console.error(`Error with selector "${selector}":`, error);
        return [];
    }
}

function safeAddEventListener(element, eventType, handler) {
    if (element && typeof element.addEventListener === 'function') {
        element.addEventListener(eventType, function(event) {
            try {
                handler(event);
            } catch (error) {
                console.error(`Error in ${eventType} event handler:`, error);
            }
        });
        return true;
    } else {
        console.warn('Cannot add event listener to invalid element');
        return false;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    } else {
        console.log(`Notification [${type}]: ${message}`);
    }
}

function logActivity(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Export functions for ES modules
export {
    safeGetElement,
    safeQuerySelector,
    safeQuerySelectorAll,
    safeAddEventListener,
    showNotification,
    logActivity
};

// Also attach to window for non-module scripts
window.safeGetElement = safeGetElement;
window.safeQuerySelector = safeQuerySelector;
window.safeQuerySelectorAll = safeQuerySelectorAll;
window.safeAddEventListener = safeAddEventListener;
window.showNotification = showNotification;
window.logActivity = logActivity;
