(function() {
    'use strict';
    
    const today = new Date().toISOString().split("T")[0];
    
    document.addEventListener('DOMContentLoaded', function() {
        checkAndShowVerse();
    });
    
    function checkAndShowVerse() {
        // Check if this was opened manually via icon click
        const urlParams = new URLSearchParams(window.location.search);
        const isManual = urlParams.get('manual') === 'true';
        
        if (isManual) {
            // Manual opening - always show verse
            createVerseOverlay(true);
        } else {
            // Automatic new tab - check if verse should be shown today
            chrome.runtime.sendMessage({ action: 'getVerseShownDate' }, (response) => {
                if (response && response.shouldShow) {
                    // Show verse overlay
                    createVerseOverlay(false);
                } else {
                    // Verse already shown today, redirect immediately
                    redirectToDefault();
                }
            });
        }
    }
    
    function createVerseOverlay(isManual = false) {
        // Show loading overlay first
        showLoadingOverlay();
        
        // Fetch verse from API
        chrome.runtime.sendMessage({ action: 'getDailyVerse' }, (response) => {
            const loadingOverlay = document.getElementById('daily-flame-loading');
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
            
            if (response && response.success) {
                showVerseOverlay(response.verse, isManual);
            } else {
                // API failed - show error alert
                alert(`Daily Flame: Failed to load today's verse.\nError: ${response?.error || 'Unknown error'}\n\nPlease check your internet connection or try again later.`);
                console.error('Daily Flame API Error:', response?.error);
                
                if (isManual) {
                    showDailyFlameInterface();
                } else {
                    redirectToDefault();
                }
            }
        });
    }
    
    function showLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'daily-flame-loading';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: #000000 !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
            box-sizing: border-box !important;
            padding: 20px !important;
        `;
        
        overlay.innerHTML = `
            <div style="max-width: 600px !important; text-align: center !important; color: #ffffff !important;">
                <div style="margin-bottom: 40px !important;">
                    <p style="font-size: 24px !important; line-height: 1.6 !important; margin: 0 0 20px 0 !important; font-weight: 300 !important;">Loading today's verse...</p>
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
    
    function showVerseOverlay(verseData, isManual = false) {
        const overlay = document.createElement('div');
        overlay.id = 'daily-flame-overlay';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: #000000 !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
            box-sizing: border-box !important;
            padding: 20px !important;
        `;
        
        overlay.innerHTML = `
            <div style="max-width: 600px !important; text-align: center !important; color: #ffffff !important; animation: fadeIn 0.5s ease-in !important;">
                <div style="margin-bottom: 40px !important;">
                    <p style="font-size: 24px !important; line-height: 1.6 !important; margin: 0 0 20px 0 !important; font-weight: 300 !important; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;">${verseData.text}</p>
                    <p style="font-size: 18px !important; margin: 0 !important; font-style: italic !important; opacity: 0.9 !important; font-weight: 400 !important;">${verseData.reference}</p>
                </div>
                <button id="daily-flame-done" style="background: #ffffff !important; color: #000000 !important; border: none !important; padding: 15px 40px !important; font-size: 18px !important; font-weight: 600 !important; border-radius: 8px !important; cursor: pointer !important; transition: all 0.2s ease !important; font-family: inherit !important; outline: none !important; box-shadow: 0 2px 10px rgba(255, 255, 255, 0.2) !important; min-width: 120px !important;">Done</button>
            </div>
        `;
        
        // Add fade-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        const doneButton = document.getElementById('daily-flame-done');
        doneButton.addEventListener('click', () => dismissOverlayAndRedirect(isManual));
        
        doneButton.addEventListener('mouseover', function() {
            this.style.background = '#f0f0f0 !important';
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.3) !important';
        });
        
        doneButton.addEventListener('mouseout', function() {
            this.style.background = '#ffffff !important';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 10px rgba(255, 255, 255, 0.2) !important';
        });
        
        overlay.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                dismissOverlayAndRedirect(isManual);
            }
        });
        
        setTimeout(() => {
            doneButton.focus();
        }, 500);
    }
    
    function dismissOverlayAndRedirect(isManual = false) {
        const overlay = document.getElementById('daily-flame-overlay');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = '';
            
            if (isManual) {
                // Manual opening - just stay on Daily Flame page, don't save or redirect
                console.log('Daily Flame: Manual verse viewing dismissed');
                showDailyFlameInterface();
            } else {
                // Automatic opening - save that verse was shown today and redirect
                chrome.runtime.sendMessage({ action: 'setVerseShownDate' }, (response) => {
                    if (response && response.success) {
                        console.log('Daily Flame: Verse dismissed, redirecting to default tab');
                        redirectToDefault();
                    }
                });
            }
        }
    }
    
    function showDailyFlameInterface() {
        // Show a simple Daily Flame interface after manual verse viewing
        document.body.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: #f8f9fa;">
                <div style="text-align: center; max-width: 400px; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🔥</div>
                    <h1 style="font-size: 24px; margin: 0 0 10px 0; color: #333;">Daily Flame</h1>
                    <p style="color: #666; margin: 0 0 30px 0; line-height: 1.5;">Your daily spiritual checkpoint</p>
                    <button onclick="window.close()" style="background: #007bff; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 6px; cursor: pointer; margin-right: 10px;">Close Tab</button>
                    <button onclick="location.href='chrome://newtab/'" style="background: #6c757d; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 6px; cursor: pointer;">New Tab</button>
                </div>
            </div>
        `;
    }
    
    function redirectToDefault() {
        // Redirect to Chrome's default new tab experience
        // Chrome will handle this gracefully
        window.location.href = 'chrome://newtab/';
    }
    
})();