// JavaScript for handling the activity log display

document.addEventListener('DOMContentLoaded', function() {
    loadActivityLog();
    
    document.getElementById('clearLogs').addEventListener('click', clearLogs);
});

function loadActivityLog() {
    chrome.storage.local.get(['activityLog'], function(result) {
        const logEntries = document.getElementById('logEntries');
        logEntries.innerHTML = '';
        
        if (result.activityLog && result.activityLog.length > 0) {
            result.activityLog.forEach(entry => {
                const logEntry = document.createElement('div');
                logEntry.className = `log-entry ${entry.type || 'info'}`;
                logEntry.textContent = `[${new Date(entry.timestamp).toLocaleString()}] ${entry.message}`;
                logEntries.appendChild(logEntry);
            });
        } else {
            logEntries.innerHTML = '<p>No activity recorded yet.</p>';
        }
    });
}

function clearLogs() {
    chrome.storage.local.set({activityLog: []}, function() {
        loadActivityLog();
    });
}
