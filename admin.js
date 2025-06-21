document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // DOM elements
    const addVerseForm = document.getElementById('addVerseForm');
    const verseReference = document.getElementById('verseReference');
    const bibleTranslation = document.getElementById('bibleTranslation');
    const previewBtn = document.getElementById('previewBtn');
    const versePreview = document.getElementById('versePreview');
    const verseList = document.getElementById('verseList');
    const testVerseBtn = document.getElementById('testVerseBtn');
    const clearStorageBtn = document.getElementById('clearStorageBtn');
    const alerts = document.getElementById('alerts');
    
    // Load verses on page load
    loadVerses();
    
    // Event listeners
    addVerseForm.addEventListener('submit', handleAddVerse);
    previewBtn.addEventListener('click', handlePreviewVerse);
    testVerseBtn.addEventListener('click', handleTestVerse);
    clearStorageBtn.addEventListener('click', handleClearStorage);
    
    // Add verse form handler
    async function handleAddVerse(e) {
        e.preventDefault();
        
        const reference = verseReference.value.trim();
        const translation = bibleTranslation.value;
        
        if (!reference || !translation) {
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        try {
            // Get current verses
            const response = await sendMessage({ action: 'getStoredVerses' });
            if (!response.success) {
                throw new Error(response.error);
            }
            
            const verses = response.verses || [];
            
            // Check for duplicates
            const duplicate = verses.find(v => 
                v.reference.toLowerCase() === reference.toLowerCase() && 
                v.bibleId === getBibleId(translation)
            );
            
            if (duplicate) {
                showAlert('This verse is already in your collection', 'error');
                return;
            }
            
            // Add new verse
            verses.push({
                reference: reference,
                bibleId: getBibleId(translation),
                translation: translation,
                dateAdded: new Date().toISOString()
            });
            
            // Save verses
            const saveResponse = await sendMessage({ 
                action: 'saveVerses', 
                verses: verses 
            });
            
            if (saveResponse.success) {
                showAlert('Verse added successfully!', 'success');
                verseReference.value = '';
                bibleTranslation.value = '';
                versePreview.style.display = 'none';
                loadVerses();
            } else {
                throw new Error(saveResponse.error);
            }
            
        } catch (error) {
            showAlert(`Error adding verse: ${error.message}`, 'error');
        }
    }
    
    // Preview verse handler
    async function handlePreviewVerse() {
        const reference = verseReference.value.trim();
        const translation = bibleTranslation.value;
        
        if (!reference || !translation) {
            showAlert('Please enter a Bible reference and select a translation', 'error');
            return;
        }
        
        try {
            versePreview.innerHTML = '<div class="loading">Loading verse preview...</div>';
            versePreview.style.display = 'block';
            
            const response = await sendMessage({
                action: 'getVerse',
                reference: reference,
                bibleId: getBibleId(translation)
            });
            
            if (response.success) {
                versePreview.innerHTML = `
                    <div class="preview-verse">
                        "${response.verse.text}"
                        <div class="preview-reference">${response.verse.reference} (${translation})</div>
                    </div>
                `;
            } else {
                versePreview.innerHTML = `
                    <div class="alert error">
                        Failed to load verse: ${response.error}
                    </div>
                `;
            }
            
        } catch (error) {
            versePreview.innerHTML = `
                <div class="alert error">
                    Error loading preview: ${error.message}
                </div>
            `;
        }
    }
    
    // Load and display verses
    async function loadVerses() {
        try {
            verseList.innerHTML = '<div class="loading">Loading verses...</div>';
            
            const response = await sendMessage({ action: 'getStoredVerses' });
            
            if (response.success) {
                const verses = response.verses || [];
                renderVerseList(verses);
            } else {
                verseList.innerHTML = `<div class="alert error">Error loading verses: ${response.error}</div>`;
            }
            
        } catch (error) {
            verseList.innerHTML = `<div class="alert error">Error: ${error.message}</div>`;
        }
    }
    
    // Render verse list
    function renderVerseList(verses) {
        if (verses.length === 0) {
            verseList.innerHTML = `
                <div class="empty-state">
                    <p>No verses configured yet.</p>
                    <p>Add your first Bible verse above to get started!</p>
                </div>
            `;
            return;
        }
        
        const verseItems = verses.map((verse, index) => `
            <div class="verse-item">
                <div class="verse-info">
                    <div class="verse-reference">${verse.reference}</div>
                    <div class="verse-translation">${verse.translation || 'NIV'}</div>
                </div>
                <div class="verse-actions">
                    <button onclick="previewStoredVerse(${index})" class="secondary">Preview</button>
                    <button onclick="removeVerse(${index})" class="danger">Remove</button>
                </div>
            </div>
        `).join('');
        
        verseList.innerHTML = verseItems;
    }
    
    // Test today's verse
    async function handleTestVerse() {
        try {
            testVerseBtn.textContent = 'Loading...';
            testVerseBtn.disabled = true;
            
            const response = await sendMessage({ action: 'getDailyVerse' });
            
            if (response.success) {
                alert(`Today's verse:\n\n"${response.verse.text}"\n\n${response.verse.reference}`);
            } else {
                alert(`Failed to load today's verse:\n${response.error}`);
            }
            
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            testVerseBtn.textContent = 'Test Today\'s Verse';
            testVerseBtn.disabled = false;
        }
    }
    
    // Clear storage
    async function handleClearStorage() {
        if (!confirm('This will reset the daily verse status, causing the verse to appear again today. Continue?')) {
            return;
        }
        
        try {
            const response = await sendMessage({ action: 'clearStorage' });
            
            if (response.success) {
                showAlert('Daily status reset successfully!', 'success');
            } else {
                showAlert(`Error: ${response.error}`, 'error');
            }
            
        } catch (error) {
            showAlert(`Error: ${error.message}`, 'error');
        }
    }
    
    // Global functions for inline event handlers
    window.previewStoredVerse = async function(index) {
        try {
            const response = await sendMessage({ action: 'getStoredVerses' });
            if (!response.success) throw new Error(response.error);
            
            const verse = response.verses[index];
            const verseResponse = await sendMessage({
                action: 'getVerse',
                reference: verse.reference,
                bibleId: verse.bibleId
            });
            
            if (verseResponse.success) {
                alert(`${verse.reference} (${verse.translation}):\n\n"${verseResponse.verse.text}"`);
            } else {
                alert(`Failed to load verse: ${verseResponse.error}`);
            }
            
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };
    
    window.removeVerse = async function(index) {
        if (!confirm('Are you sure you want to remove this verse?')) {
            return;
        }
        
        try {
            const response = await sendMessage({ action: 'getStoredVerses' });
            if (!response.success) throw new Error(response.error);
            
            const verses = response.verses || [];
            verses.splice(index, 1);
            
            const saveResponse = await sendMessage({ 
                action: 'saveVerses', 
                verses: verses 
            });
            
            if (saveResponse.success) {
                showAlert('Verse removed successfully', 'success');
                loadVerses();
            } else {
                throw new Error(saveResponse.error);
            }
            
        } catch (error) {
            showAlert(`Error removing verse: ${error.message}`, 'error');
        }
    };
    
    // Helper functions
    function sendMessage(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, resolve);
        });
    }
    
    function getBibleId(translation) {
        const bibleIds = {
            'KJV': 'de4e12af7f28f599-02',
            'WEB': '9879dbb7cfe39e4d-04', 
            'WEB_BRITISH': '7142879509583d59-04',
            'WEB_UPDATED': '72f4e6dc683324df-03'
        };
        return bibleIds[translation] || bibleIds['KJV'];
    }
    
    function showAlert(message, type) {
        const alertElement = document.createElement('div');
        alertElement.className = `alert ${type}`;
        alertElement.textContent = message;
        
        alerts.appendChild(alertElement);
        
        setTimeout(() => {
            alertElement.remove();
        }, 5000);
    }
});