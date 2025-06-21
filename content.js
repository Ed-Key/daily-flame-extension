(function() {
    'use strict';
    
    // Add global function to reset verse (for testing)
    window.resetDailyFlame = function() {
        chrome.runtime.sendMessage({ action: 'clearStorage' }, (response) => {
            console.log('Daily Flame: Storage cleared, refresh page to see verse');
        });
    };
    
    const today = new Date().toISOString().split("T")[0];
    const skipSites = ["chrome://", "chrome-extension://", "moz-extension://", "extensions"];
    
    if (skipSites.some(site => window.location.href.includes(site))) {
        return;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDailyFlame);
    } else {
        initDailyFlame();
    }
    
    function initDailyFlame() {
        // Use message passing to communicate with background script
        chrome.runtime.sendMessage({ action: 'getVerseShownDate' }, (response) => {
            if (response && response.shouldShow) {
                createVerseOverlay();
            }
        });
    }
    
    function createVerseOverlay() {
        if (document.getElementById('daily-flame-overlay')) {
            return;
        }
        
        // Show loading overlay first
        showLoadingOverlay();
        
        // Fetch verse from API
        chrome.runtime.sendMessage({ action: 'getDailyVerse' }, (response) => {
            const loadingOverlay = document.getElementById('daily-flame-loading');
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
            
            if (response && response.success) {
                showVerseOverlay(response.verse);
            } else {
                // API failed - show error alert
                alert(`Daily Flame: Failed to load today's verse.\nError: ${response?.error || 'Unknown error'}\n\nPlease check your internet connection or try again later.`);
                console.error('Daily Flame API Error:', response?.error);
            }
        });
    }
    
    function showLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'daily-flame-loading';
        overlay.className = 'daily-flame-overlay';
        
        overlay.innerHTML = `
            <div class="daily-flame-content">
                <div class="daily-flame-verse">
                    <p class="verse-text">Loading today's verse...</p>
                    <div style="margin-top: 20px;">
                        <div style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: white; margin: 0 2px; animation: pulse 1.5s ease-in-out infinite;"></div>
                        <div style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: white; margin: 0 2px; animation: pulse 1.5s ease-in-out 0.1s infinite;"></div>
                        <div style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: white; margin: 0 2px; animation: pulse 1.5s ease-in-out 0.2s infinite;"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }
    
    function showVerseOverlay(verseData) {
        const overlay = document.createElement('div');
        overlay.id = 'daily-flame-overlay';
        overlay.className = 'daily-flame-overlay';
        
        overlay.innerHTML = `
            <div class="daily-flame-content">
                <div class="daily-flame-verse">
                    <p class="verse-text">${verseData.text}</p>
                    <p class="verse-reference">${verseData.reference}</p>
                </div>
                <button class="daily-flame-done-btn" id="daily-flame-done">Done</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        const doneButton = document.getElementById('daily-flame-done');
        doneButton.addEventListener('click', dismissOverlay);
        
        overlay.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                dismissOverlay();
            }
        });
        
        setTimeout(() => {
            doneButton.focus();
        }, 100);
    }
    
    function dismissOverlay() {
        const overlay = document.getElementById('daily-flame-overlay');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = '';
            
            // Use message passing to save to storage
            chrome.runtime.sendMessage({ action: 'setVerseShownDate' }, (response) => {
                if (response && response.success) {
                    console.log('Daily Flame: Verse dismissed for today');
                }
            });
        }
    }
    
})();