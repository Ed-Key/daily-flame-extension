import React, { useState, useEffect } from 'react';
import { BibleTranslation, BIBLE_VERSIONS } from '../../../types';
import { UserPreferencesService } from '../../../services/user-preferences-service';
import { useAuth } from '../../AuthContext';
import { useToast } from '../../ToastContext';

interface SettingsContentProps {
  currentTheme: 'light' | 'dark';
  currentTranslation: BibleTranslation;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onTranslationChange: (translation: BibleTranslation) => void;
}

const SettingsContent: React.FC<SettingsContentProps> = ({
  currentTheme,
  currentTranslation,
  onThemeChange,
  onTranslationChange
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  // Handle theme change with save
  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setSaving(true);
    try {
      onThemeChange(newTheme);
      await UserPreferencesService.saveTheme(newTheme, user);
      showToast(`Theme changed to ${newTheme} mode`, 'success');
    } catch (error) {
      console.error('Error saving theme preference:', error);
      showToast('Failed to save theme preference', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle translation change with save
  const handleTranslationChange = async (newTranslation: BibleTranslation) => {
    setSaving(true);
    try {
      await onTranslationChange(newTranslation);
      // onTranslationChange handles the save internally
    } catch (error) {
      console.error('Error changing translation:', error);
      showToast('Failed to change translation', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-content">
      {/* Appearance Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">Appearance</h3>

        {/* Theme Toggle */}
        <div className="settings-item">
          <label className="settings-label">
            <span className="settings-label-text">Theme</span>
            <span className="settings-label-description">
              Choose your visual preference
            </span>
          </label>
          <div className="settings-theme-toggle">
            <button
              className={`settings-theme-option ${currentTheme === 'light' ? 'settings-theme-option--active settings-theme-option--light' : ''}`}
              onClick={() => handleThemeChange('light')}
              disabled={saving}
            >
              <svg className="settings-theme-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.591a.75.75 0 101.06 1.06l1.591-1.591zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.591-1.591a.75.75 0 10-1.06 1.06l1.591 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.591a.75.75 0 001.06 1.06l1.591-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06L6.166 5.106a.75.75 0 00-1.06 1.06l1.591 1.591z" />
              </svg>
              Light
            </button>
            <button
              className={`settings-theme-option ${currentTheme === 'dark' ? 'settings-theme-option--active settings-theme-option--dark' : ''}`}
              onClick={() => handleThemeChange('dark')}
              disabled={saving}
            >
              <svg className="settings-theme-icon" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
              </svg>
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Reading Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">Reading</h3>

        {/* Bible Translation */}
        <div className="settings-item">
          <label className="settings-label">
            <span className="settings-label-text">Bible Translation</span>
            <span className="settings-label-description">
              Select your preferred translation
            </span>
          </label>
          <select
            className="settings-select"
            value={currentTranslation}
            onChange={(e) => handleTranslationChange(e.target.value as BibleTranslation)}
            disabled={saving}
          >
            <option value="ESV">ESV - English Standard Version</option>
            <option value="KJV">KJV - King James Version</option>
            <option value="NLT">NLT - New Living Translation</option>
            <option value="ASV">ASV - American Standard Version</option>
            <option value="WEB">WEB - World English Bible</option>
          </select>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">Schedule</h3>

        {/* Auto Display (Future) */}
        <div className="settings-item settings-item--disabled">
          <label className="settings-label">
            <span className="settings-label-text">Auto Display</span>
            <span className="settings-label-description">
              Show verse automatically at set time
            </span>
          </label>
          <div className="settings-placeholder">
            <span>Coming Soon</span>
          </div>
        </div>
      </div>

      {saving && (
        <div className="settings-saving-indicator">
          Saving...
        </div>
      )}
    </div>
  );
};

export default SettingsContent;